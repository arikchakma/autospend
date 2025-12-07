import { googleAuth } from '~/lib/google-auth.server';
import type { Route } from './+types/api.v1.auth.google._index';
import { json } from '~/lib/response.server';
import z from 'zod/v4';

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

    const { url: authorizationUrl, cookies } =
      await googleAuth.getAuthorizationUrl(args.request, body);

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
