import type { Route } from './+types/api.v1.auth.google.callback';
import { json } from '~/lib/response.server';
import { HttpError } from '~/lib/http-error';
import { db } from '~/db';
import { usersTable } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { sign } from '~/lib/jwt.server';
import { setAuthToken } from '~/lib/jwt';
import { href, useNavigate } from 'react-router';
import { Loader2Icon } from 'lucide-react';
import { useEffect } from 'react';
import type { AuthState } from './api.v1.auth.google._index';
import { auth, pkceCookie, stateCookie } from '~/lib/auth.server';

export async function loader(args: Route.LoaderArgs) {
  try {
    let googleUser: Awaited<ReturnType<typeof auth.callback>>['user'] | null =
      null;
    let data: AuthState | null = null;

    try {
      const cookies = args.request.headers.get('Cookie');
      const state = await stateCookie.parse(cookies);
      const codeVerifier = await pkceCookie.parse(cookies);

      const { user, data: _data } = await auth.callback('google', {
        url: new URL(args.request.url),
        state,
        codeVerifier,
      });

      googleUser = user;
      data = _data as AuthState;
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
          timezone: data?.timezone,
        })
        .returning();
      user = newUser[0];
    }

    if (!user?.timezone) {
      await db
        .update(usersTable)
        .set({
          timezone: data?.timezone,
        })
        .where(eq(usersTable.id, user.id));
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

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      await stateCookie.serialize(null, { expires: new Date(0) })
    );
    headers.append(
      'Set-Cookie',
      await pkceCookie.serialize(null, { expires: new Date(0) })
    );

    return json({ token }, { headers });
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

export default function GoogleCallbackPage(props: Route.ComponentProps) {
  const { loaderData } = props;
  const token = 'token' in loaderData ? loaderData.token : null;

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate(href('/login'));
      return;
    }

    setAuthToken(token);
    navigate(href('/transactions'));
  }, [token, navigate]);

  return (
    <div className="bg-opacity-75 fixed top-0 left-0 z-100 flex h-full w-full items-center justify-center bg-white">
      <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2">
        <Loader2Icon className="size-4 animate-spin stroke-[2.5]" />
        <span className="ml-2 font-medium">
          Please wait&nbsp;
          <span className="animate-pulse">...</span>
        </span>
      </div>
    </div>
  );
}
