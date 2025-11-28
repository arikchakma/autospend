import { createCookie } from 'react-router';

import * as oauth from 'oauth4webapi';

export const PKCE_COOKIE_NAME = '__autospend_pkce__';
export const STATE_COOKIE_NAME = '__autospend_state__';
export const NONCE_COOKIE_NAME = '__autospend_nonce__';

const TEN_MINUTES = 10;

const pkceCookie = createCookie(PKCE_COOKIE_NAME, {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
});

const stateCookie = createCookie(STATE_COOKIE_NAME, {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
});

const nonceCookie = createCookie(NONCE_COOKIE_NAME, {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
});

export class ProofManager {
  constructor() {}

  expiresAt(minutes: number) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  async pkce() {
    const codeVerifier = oauth.generateRandomCodeVerifier();
    const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

    return {
      codeChallenge,
      codeVerifier,
      codeChallengeMethod: 'S256',
      cookie: await pkceCookie.serialize(codeVerifier, {
        expires: this.expiresAt(TEN_MINUTES),
      }),
    };
  }

  async readPkce(request: Request) {
    return pkceCookie.parse(request.headers.get('Cookie'));
  }

  async state() {
    const state = oauth.generateRandomState();

    return {
      state,
      cookie: await stateCookie.serialize(state, {
        expires: this.expiresAt(TEN_MINUTES),
      }),
    };
  }

  async readState(request: Request) {
    return stateCookie.parse(request.headers.get('Cookie'));
  }

  async nonce() {
    const nonce = oauth.generateRandomNonce();
    return {
      nonce,
      cookie: await nonceCookie.serialize(nonce, {
        expires: this.expiresAt(TEN_MINUTES),
      }),
    };
  }

  async readNonce(request: Request) {
    return nonceCookie.parse(request.headers.get('Cookie'));
  }
}
