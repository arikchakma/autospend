import { db } from '~/db';
import type { Route } from './+types/transactions._index';
import { transactionsTable } from '~/db/schema';
import { desc } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { getTimeOfDay } from '~/lib/time';
import { cn } from '~/lib/classname';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'AutoSpend - Simplify Your Personal Finances' },
    {
      name: 'description',
      content: 'AutoSpend helps you manage your personal finances',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const transactions = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.timestamp))
    .limit(100);
  return { transactions };
}

export default function Transactions(props: Route.ComponentProps) {
  const { transactions } = props.loaderData;

  const groupedTransactions = transactions.reduce(
    (acc, transaction) => {
      const date = DateTime.fromJSDate(transaction.timestamp).toFormat(
        'yyyy-MM'
      );
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    },
    {} as Record<string, (typeof transactions)[number][]>
  );

  const timeOfDay = getTimeOfDay();
  const formattedDate = DateTime.now()
    .setZone('Asia/Kolkata')
    .toFormat("dd 'of' MMMM");

  return (
    <>
      {Object.entries(groupedTransactions).map(([date, transactions]) => {
        const formattedTitle = DateTime.fromISO(date).toFormat('MMMM yyyy');
        const totalAmount = transactions.reduce((acc, transaction) => {
          return acc + transaction.amount;
        }, 0);
        const totalTransactions = transactions.length;
        const formattedTotalAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'BDT',
        }).format(totalAmount);
        const formattedTotalTransactions = new Intl.NumberFormat('en-US', {
          style: 'decimal',
        }).format(totalTransactions);

        return (
          <div
            key={date}
            className="mb-2.5 rounded-xl border border-zinc-200/50 bg-zinc-100 p-1"
          >
            <div className="flex items-center justify-between gap-2 px-2">
              <h3 className="text-lg font-medium">{formattedTitle}</h3>
              <p className="text-sm text-zinc-500">
                {formattedTotalAmount} spent on {formattedTotalTransactions}{' '}
                purchases
              </p>
            </div>

            <div className="mt-1 flex flex-col rounded-lg bg-white">
              {transactions.map((transaction) => {
                const {
                  merchant,
                  description,
                  amount,
                  currency,
                  timestamp,
                  id,
                  category,
                } = transaction;
                const formattedAmount = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                }).format(amount);

                const formattedDate =
                  DateTime.fromJSDate(timestamp).toFormat('dd MMM yyyy');

                return (
                  <div
                    key={id}
                    className="grid grid-cols-4 items-center gap-2 p-2"
                  >
                    <div className="col-span-2 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className="truncate text-sm font-medium"
                          title={merchant || undefined}
                        >
                          {merchant}
                        </h4>
                        <CategoryBadge category={category} />
                      </div>
                      <p
                        className="truncate text-sm text-zinc-500"
                        title={description || undefined}
                      >
                        {description || 'No description'}
                      </p>
                    </div>

                    <p className="justify-self-end text-sm text-zinc-500">
                      {formattedAmount}
                    </p>
                    <p className="justify-self-end text-sm text-zinc-500">
                      {formattedDate}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

type CategoryBadgeProps = {
  category: string;
};

function CategoryBadge(props: CategoryBadgeProps) {
  const { category: categoryProp } = props;

  const colors: Record<string, string> = {
    food: 'bg-pink-50 text-pink-600',
    transport: 'bg-blue-50 text-blue-600',
    shopping: 'bg-green-50 text-green-600',
    entertainment: 'bg-purple-50 text-purple-600',
    accommodation: 'bg-yellow-50 text-yellow-600',
    health: 'bg-pink-50 text-pink-600',
    education: 'bg-orange-50 text-orange-600',
    bills: 'bg-gray-50 text-gray-600',
    other: 'bg-zinc-50 text-zinc-600',
  };
  const category = Object.keys(colors).includes(categoryProp)
    ? categoryProp
    : 'other';

  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        colors[category]
      )}
    >
      {category}
    </span>
  );
}
