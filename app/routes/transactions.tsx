import { LogOutIcon, PlusIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { Form, href, Link, Outlet, redirect, useNavigate } from 'react-router';
import type { Route } from './+types/transactions';
import { getTimeOfDay } from '~/lib/time';
import { clearAuthToken, getUser } from '~/lib/jwt';

export async function clientLoader(args: Route.ClientLoaderArgs) {
  const user = getUser();
  if (!user) {
    console.log('No user found, redirecting to login');
    return redirect(href('/login'));
  }

  return { user };
}

export default function TransactionsLayout(props: Route.ComponentProps) {
  const { loaderData } = props;

  const { user } = loaderData;
  const timeOfDay = getTimeOfDay();
  const formattedDate = DateTime.now()
    .setZone('Asia/Kolkata')
    .toFormat("dd 'of' MMMM");

  const firstName = user.name.split(' ')[0];

  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-lg px-5">
      <div className="my-8 flex justify-between gap-2">
        <div className="flex w-full flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold tracking-tight uppercase">
              Good {timeOfDay}, {firstName}
            </h1>
            <div className="flex items-center gap-2">
              <Link
                to={href('/transactions/new')}
                className="flex items-center gap-1.5 rounded-lg bg-black p-1 px-1.5 text-sm text-white hover:bg-zinc-800"
              >
                <PlusIcon className="size-4 stroke-[2.5]" />
                Import Transactions
              </Link>

              <button
                className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-black"
                title="Log out"
                onClick={() => {
                  clearAuthToken();
                  navigate(href('/login'));
                }}
              >
                <LogOutIcon className="size-3.5" />
              </button>
            </div>
          </div>
          <p className="text-zinc-500 uppercase">
            It's {formattedDate}, a{' '}
            {DateTime.now().setZone('Asia/Kolkata').toFormat('EEEE')}
          </p>
        </div>
      </div>

      <Outlet />
    </section>
  );
}
