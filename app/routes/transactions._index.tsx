import { db } from '~/db';
import type { Route } from './+types/transactions._index';
import { transactionsTable } from '~/db/schema';
import { desc, sql, gte } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { ReceiptIcon } from 'lucide-react';
import { useMemo } from 'react';
import {
  MonthlyBarChart,
  type MonthlyChartData,
} from '~/components/monthly-bar-chart';
import { TransactionsGroup } from '~/components/transactions-group';
import { allowedCategories } from '~/lib/transaction';

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

  const startOfCurrentMonth = DateTime.now().startOf('month');
  const startDate = startOfCurrentMonth.minus({ months: 11 });

  const rawMonthlyData = await db
    .select({
      month: sql<string>`to_char(${transactionsTable.timestamp}, 'YYYY-MM')`,
      category: transactionsTable.category,
      total: sql<number>`sum(${transactionsTable.amount})`,
    })
    .from(transactionsTable)
    .where(gte(transactionsTable.timestamp, startDate.toJSDate()))
    .groupBy(
      sql<string>`to_char(${transactionsTable.timestamp}, 'YYYY-MM')`,
      transactionsTable.category
    );

  const monthlyDataMap = new Map<string, MonthlyChartData>();

  for (let i = 11; i >= 0; i--) {
    const d = DateTime.now().minus({ months: i });
    const key = d.toFormat('yyyy-MM');
    monthlyDataMap.set(key, {
      month: d.toFormat('MMMM'),
      food: 0,
      transport: 0,
      shopping: 0,
      entertainment: 0,
      accommodation: 0,
      health: 0,
      education: 0,
      bills: 0,
      other: 0,
    });
  }

  for (const row of rawMonthlyData) {
    const entry = monthlyDataMap.get(row.month);
    if (entry) {
      const category =
        allowedCategories.find((c) => c === row.category) || 'other';
      entry[category] = (entry[category] || 0) + row.total;
    }
  }

  const monthlyChartData = Array.from(monthlyDataMap.values());

  return { transactions, monthlyChartData };
}

export default function TransactionsIndexPage(props: Route.ComponentProps) {
  const { transactions, monthlyChartData } = props.loaderData;

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

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200/50 p-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <ReceiptIcon className="h-8 w-8 text-zinc-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-zinc-900">
            No transactions yet
          </h3>
          <p className="text-sm text-zinc-500">
            Import your first transaction to see your spending overview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MonthlyBarChart data={monthlyChartData} />

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
