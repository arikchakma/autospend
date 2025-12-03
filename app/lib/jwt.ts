import * as jose from 'jose';
import Cookies from 'js-cookie';

export const TOKEN_COOKIE_NAME = '__autospend_jt_v2__';

export type TokenPayload = {
  id: string;
  name: string;
  email: string;
};

export function decode(token: string): TokenPayload | null {
  try {
    const claims = jose.decodeJwt(token);
    return claims as TokenPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function setAuthToken(token: string) {
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    path: '/',
    expires: 30,
    sameSite: 'lax',
    secure: true,
  });
}

export function isLoggedIn() {
  const token = Cookies.get(TOKEN_COOKIE_NAME);
  console.log(token);
  if (!token) {
    return false;
  }

  return decode(token) !== null;
}

export function getUser() {
  const token = Cookies.get(TOKEN_COOKIE_NAME);
  if (!token) {
    return null;
  }

  return decode(token);
}

export function clearAuthToken() {
  Cookies.remove(TOKEN_COOKIE_NAME, {
    path: '/',
  });
}
