import type { Route } from './+types/api.v1.auth.redirect';
import { json } from '~/lib/response.server';
import { getPlatform } from '~/lib/auth.server';
import { redirect } from 'react-router';
import { config } from '~/lib/config.server';

export async function loader(args: Route.LoaderArgs) {
  const url = new URL(args.request.url);
  const searchParams = url.searchParams;
  const state = searchParams.get('state');
  if (!state) {
    return json({ error: 'State is required' }, { status: 400 });
  }

  const platform = getPlatform(state);
  if (platform === 'web') {
    return redirect(`/api/v1/auth/google/callback?${String(searchParams)}`);
  }

  return redirect(
    `${config.MOBILE_APP_SCHEME}/callback?${String(searchParams)}`
  );
}
