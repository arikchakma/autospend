import { href, redirect } from 'react-router';
import type { Route } from './+types/login';
import { GoogleLoginButton } from '~/components/google-login-button';
import { getUser } from '~/lib/jwt';

export async function clientLoader(args: Route.ClientLoaderArgs) {
  const user = getUser();
  if (!user) {
    return null;
  }

  return redirect(href('/'));
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to AutoSpend
          </h1>
          <p className="mt-2 text-sm text-balance text-zinc-500">
            Sign in to your account to start managing your finances with ease
            and get a yearly summary of your expenses.
          </p>
        </div>

        <div className="flex justify-center">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}

export function headers() {
  return {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  };
}
