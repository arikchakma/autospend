import { BadgeCentIcon, CreditCardIcon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { cn } from '~/lib/classname';

export default function DefaultLayout() {
  return (
    <main className="grid h-screen grid-cols-[auto_1fr] overflow-hidden">
      <aside className="min-w-50 border-r border-r-zinc-300">
        <div className="p-2 px-4">
          <h2 className="text-lg font-medium tracking-wide">Poisha</h2>
        </div>

        <nav className="flex flex-col gap-0.5 p-2">
          <NavLink
            to="/"
            className={({ isActive }) => {
              return cn(
                'flex items-center gap-1.5 p-2 text-zinc-500',
                isActive && 'text-black'
              );
            }}
          >
            <BadgeCentIcon className="size-4" />
            <span className="leading-none">Transactions</span>
          </NavLink>
          <NavLink
            to="/cards"
            className={({ isActive }) => {
              return cn(
                'flex items-center gap-1.5 p-2 text-zinc-500',
                isActive && 'text-black'
              );
            }}
          >
            <CreditCardIcon className="size-4" />
            <span className="leading-none">Cards</span>
          </NavLink>
        </nav>
      </aside>
      <Outlet />
    </main>
  );
}
