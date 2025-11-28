import * as oauth from 'oauth4webapi';
import { ProofManager } from './proof-manager.server';
import { config } from './config.server';

class GoogleOAuth extends ProofManager {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  async config() {
    const issuer = new URL('https://accounts.google.com');
    const as = await oauth
      .discoveryRequest(issuer, { algorithm: 'oidc' })
      .then((res) => oauth.processDiscoveryResponse(issuer, res));
    const client: oauth.Client = {
      client_id: this.clientId,
    };
    const clientAuth = oauth.ClientSecretPost(this.clientSecret);

    return {
      as,
      client,
      clientAuth,
    };
  }

  async getAuthorizationUrl(request: Request) {
    const { as, client } = await this.config();

    const cookies = [];
    const pkce = await this.pkce();
    cookies.push(pkce.cookie);

    const authorizationUrl = new URL(as.authorization_endpoint!);
    authorizationUrl.searchParams.set('client_id', client.client_id);
    authorizationUrl.searchParams.set('redirect_uri', this.redirectUri);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', 'openid email profile');
    authorizationUrl.searchParams.set('code_challenge', pkce.codeChallenge);
    authorizationUrl.searchParams.set(
      'code_challenge_method',
      pkce.codeChallengeMethod
    );

    /**
     * We cannot be sure the AS supports PKCE so we're going to use nonce too. Use of PKCE is
     * backwards compatible even if the AS doesn't support it which is why we're using it regardless.
     */
    // if (as.code_challenge_methods_supported?.includes('S256') !== true) {
    const nonce = await this.nonce();
    authorizationUrl.searchParams.set('nonce', nonce.nonce);
    cookies.push(nonce.cookie);
    // }

    return { url: authorizationUrl.toString(), cookies };
  }

  async getUserInfo(request: Request) {
    const { as, client, clientAuth } = await this.config();
    const currentUrl = new URL(request.url);
    const params = oauth.validateAuthResponse(as, client, currentUrl);

    const codeVerifier = await this.readPkce(request);
    const response = await oauth.authorizationCodeGrantRequest(
      as,
      client,
      clientAuth,
      params,
      this.redirectUri,
      codeVerifier!
    );

    const nonce = await this.readNonce(request);
    const result = await oauth.processAuthorizationCodeResponse(
      as,
      client,
      response,
      {
        expectedNonce: nonce,
        requireIdToken: true,
      }
    );

    const { access_token } = result;
    const claims = oauth.getValidatedIdTokenClaims(result)!;
    const { sub } = claims;

    const userResponse = await oauth.userInfoRequest(as, client, access_token);
    const userResult = await oauth.processUserInfoResponse(
      as,
      client,
      sub,
      userResponse
    );

    return {
      tokens: result,
      user: userResult,
    };
  }
}

const redirectUri =
  import.meta.env.VITE_APP_BASE_URL + '/api/v1/auth/google/callback';
export const googleAuth = new GoogleOAuth(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  redirectUri
);
