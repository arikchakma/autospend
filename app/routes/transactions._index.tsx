import { db } from '~/db';
import type { Route } from './+types/transactions._index';
import { transactionsTable } from '~/db/schema';
import { desc } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { TransactionDetails } from '~/components/transaction-details';
import { formatCurrency, formatNumber } from '~/lib/formatter';
import { useMemo } from 'react';
import { MonthlyBarChart } from '~/components/monthly-bar-chart';
import { TransactionsGroup } from '~/components/transactions-group';

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

export default function TransactionsIndexPage(props: Route.ComponentProps) {
  const { transactions } = props.loaderData;

  const groupedTransactions = useMemo(() => {
    return transactions.reduce(
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
  }, [transactions]);

  return (
    <>
      <MonthlyBarChart />

      {Object.entries(groupedTransactions).map(([date, transactions = []]) => {
        return (
          <TransactionsGroup
            key={date}
            date={date}
            transactions={transactions}
          />
        );
      })}
    </>
  );
}
