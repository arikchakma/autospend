import { defineAuthingyConfig, google, oauth } from 'authingy';
import { config } from './config.server';
import { createCookie } from 'react-router';

export const PKCE_COOKIE_NAME = '__autospend_pkce__';
export const STATE_COOKIE_NAME = '__autospend_state__';

export function expiresAt(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export const pkceCookie = createCookie(PKCE_COOKIE_NAME, {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
});

export const stateCookie = createCookie(STATE_COOKIE_NAME, {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
});

const redirectUri = import.meta.env.VITE_APP_BASE_URL + '/api/v1/auth/redirect';

export const auth = defineAuthingyConfig({
  secret: config.JWT_SECRET,
  providers: [
    google({
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      redirectUri,
    }),
  ],
});

export function generateRandomState(platform: 'ios' | 'web') {
  const state = oauth.generateRandomState();
  return `${platform}:${state}`;
}

export function getPlatform(state: string) {
  const [platform = 'web', _state] = state.split(':');
  if (platform !== 'ios' && platform !== 'web') {
    throw new Error('Invalid platform');
  }

  return platform;
}
