import { db } from '~/db';
import type { Route } from './+types/transactions._index';
import { transactionsTable } from '~/db/schema';
import { desc } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { getTimeOfDay } from '~/lib/time';
import { cn } from '~/lib/classname';
import { TransactionDetails } from '~/components/transaction-details';

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

            <div className="mt-1 flex flex-col overflow-hidden rounded-lg bg-white shadow">
              {transactions.map((transaction) => {
                const { id } = transaction;
                return (
                  <TransactionDetails key={id} transaction={transaction} />
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
