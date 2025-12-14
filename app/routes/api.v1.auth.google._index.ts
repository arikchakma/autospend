import type { Route } from './+types/api.v1.auth.google._index';
import { json } from '~/lib/response.server';
import z from 'zod/v4';
import { auth, expiresAt, pkceCookie, stateCookie } from '~/lib/auth.server';

export type AuthState = {
  timezone: string;
};

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
    const jsonBody = await args.request.json();
    const bodySchema = z.object({
      timezone: z.string(),
    });
    const { data: body, error } = bodySchema.safeParse(jsonBody);
    if (error) {
      const errors = error.issues.map((issue) => issue.message);
      return json(
        {
          status: 400,
          message: errors.join(', '),
          errors,
        },
        { status: 400 }
      );
    }

    const { url, state, codeVerifier } = await auth.authorize('google', body);

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      await stateCookie.serialize(state, {
        expires: expiresAt(10),
      })
    );
    headers.append(
      'Set-Cookie',
      await pkceCookie.serialize(codeVerifier, {
        expires: expiresAt(10),
      })
    );

    return json({ authorizationUrl: url }, { headers });
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
