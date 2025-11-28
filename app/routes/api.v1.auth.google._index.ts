import { googleAuth } from '~/lib/google-auth.server';
import type { Route } from './+types/api.v1.auth.google._index';
import { json } from '~/lib/response.server';

export async function action(args: Route.ActionArgs) {
  if (args.request.method !== 'POST') {
    return json(
      {
        status: 405,
        message: 'Method not allowed',
        errors: [{ message: 'Method not allowed' }],
      },
      { status: 405 }
    );
  }

  try {
    const { url: authorizationUrl, cookies } =
      await googleAuth.getAuthorizationUrl(args.request);

    const headers = new Headers();
    for (const c of cookies) {
      headers.append('Set-Cookie', c);
    }

    return json({ authorizationUrl }, { headers });
  } catch (error) {
    console.error('Failed to get authorization URL:', error);
    return json(
      {
        status: 500,
        message: 'Failed to get authorization URL',
        errors: [{ message: 'Failed to get authorization URL' }],
      },
      { status: 500 }
    );
  }
}
