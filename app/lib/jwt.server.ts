import * as jose from 'jose';
import { config } from './config.server';
import { createCookie, redirect } from 'react-router';

export const TOKEN_COOKIE_NAME = '__autospend_jt__';
export const TOKEN_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days

export const jwtCookie = createCookie(TOKEN_COOKIE_NAME, {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
});

export type TokenPayload = {
  id: string;
  name: string;
  email: string;
};

export async function sign(data: TokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(config.JWT_SECRET);
  const payload: TokenPayload = {
    id: data.id,
    name: data.name,
    email: data.email,
  };

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(config.JWT_EXPIRES_IN)
    .sign(secret);
}

export async function verify(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(config.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function decode(token: string): TokenPayload | null {
  try {
    const claims = jose.decodeJwt(token);
    return claims as TokenPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export async function readTokenCookie(
  request: Request
): Promise<string | undefined> {
  let token = null;
  if (!token) {
    const authorization = request.headers.get('Authorization');
    token = authorization ? authorization.split(' ')[1] : undefined;
  }

  if (!token) {
    return undefined;
  }

  const claims = decode(token);
  if (!claims || !claims?.email || !claims?.id) {
    return undefined;
  }

  return token;
}

export async function redirectIfNotAuthenticated(request: Request) {
  const token = await readTokenCookie(request);
  if (!token) {
    return redirect('/login');
  }
}
