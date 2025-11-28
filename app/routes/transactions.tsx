import { PlusIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { Link, Outlet } from 'react-router';
import { GoogleLoginButton } from '~/components/google-login-button';
import { getTimeOfDay } from '~/lib/time';

export default function TransactionsLayout() {
  const timeOfDay = getTimeOfDay();
  const formattedDate = DateTime.now()
    .setZone('Asia/Kolkata')
    .toFormat("dd 'of' MMMM");

  return (
    <section className="mx-auto max-w-lg px-5">
      <div className="my-8 flex justify-between gap-2">
        <div className="flex w-full flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg font-medium uppercase">
              Good {timeOfDay}, Arik
            </h1>
            <Link
              to="/transactions/new"
              className="flex items-center gap-1.5 rounded-lg bg-black p-1 px-1.5 text-sm text-white hover:bg-zinc-800"
            >
              <PlusIcon className="size-4 stroke-[2.5]" />
              Import Transactions
            </Link>
          </div>
          <p className="text-zinc-500 uppercase">
            It's {formattedDate}, a{' '}
            {DateTime.now().setZone('Asia/Kolkata').toFormat('EEEE')}
          </p>
        </div>
      </div>

      <GoogleLoginButton />

      <Outlet />
    </section>
  );
}
