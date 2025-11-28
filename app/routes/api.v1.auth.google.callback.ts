import { googleAuth } from '~/lib/google-auth.server';
import type { Route } from './+types/api.v1.auth.google._index';
import { json } from '~/lib/response.server';
import { HttpError } from '~/lib/http-error';
import { db } from '~/db';
import { usersTable } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { jwtCookie, sign, TOKEN_COOKIE_MAX_AGE } from '~/lib/jwt.server';
import { redirect } from 'react-router';

export async function loader(args: Route.LoaderArgs) {
  try {
    let googleUser:
      | Awaited<ReturnType<typeof googleAuth.getUserInfo>>['user']
      | null = null;

    try {
      const { user: _googleUser, tokens: _tokens } =
        await googleAuth.getUserInfo(args.request);
      googleUser = _googleUser;
    } catch (error) {
      console.error('Failed to get google user info:', error);
      throw new HttpError(
        400,
        'Failed to get google user info',
        [],
        'bad_request'
      );
    }

    if (!googleUser || !googleUser.email) {
      throw new HttpError(
        400,
        'Failed to get google user info',
        [],
        'bad_request'
      );
    }

    let user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, googleUser.email),
    });

    if (!user) {
      const newUser = await db
        .insert(usersTable)
        .values({
          name: googleUser.name ?? googleUser?.given_name ?? '',
          email: googleUser.email,
        })
        .returning();
      user = newUser[0];
    }

    if (!user) {
      throw new HttpError(
        500,
        'Failed to create user',
        [],
        'internal_server_error'
      );
    }

    const token = await sign({
      id: String(user.id),
      name: user.name,
      email: user.email,
    });

    return redirect('/', {
      headers: {
        'Set-Cookie': await jwtCookie.serialize(token, {
          maxAge: TOKEN_COOKIE_MAX_AGE,
        }),
      },
    });
  } catch (error) {
    if (HttpError.isHttpError(error)) {
      return json(
        {
          errors: error.errors,
          message: error.message,
          type: error.type,
          status: error.status,
        },
        { status: error.status }
      );
    }

    console.error('Failed to get google user info:', error);
    return json(
      {
        status: 500,
        message: 'Failed to get google user info',
        errors: [{ message: 'Failed to get authorization URL' }],
      },
      { status: 500 }
    );
  }
}
