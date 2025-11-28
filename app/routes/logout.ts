import { redirect } from 'react-router';
import { jwtCookie } from '~/lib/jwt.server';
import type { Route } from './+types/logout';

export async function action({ request }: Route.ActionArgs) {
  return redirect('/login', {
    headers: {
      'Set-Cookie': await jwtCookie.serialize('', {
        maxAge: 0,
      }),
    },
  });
}

export async function loader() {
  return redirect('/login');
}
