import { db } from '~/db';
import type { Route } from './+types/transactions._index';
import { transactionsTable } from '~/db/schema';
import { desc, sql, gte, lte, and } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { ReceiptIcon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { DateRange } from 'react-day-picker';
import {
  MonthlyBarChart,
  type MonthlyChartData,
} from '~/components/monthly-bar-chart';
import { TransactionsGroup } from '~/components/transactions-group';
import { allowedCategories } from '~/lib/transaction';
import { DatePickerWithRange } from '~/components/date-range-picker';
import { Button } from '~/components/ui/button';

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
  const url = new URL(args.request.url);
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');

  const now = DateTime.now();
  const defaultStart = now.minus({ months: 3 }).startOf('day');
  const defaultEnd = now.endOf('day');

  const startDate = fromParam
    ? DateTime.fromISO(fromParam).startOf('day')
    : defaultStart;
  const endDate = toParam ? DateTime.fromISO(toParam).endOf('day') : defaultEnd;

  const validStartDate = startDate.isValid ? startDate : defaultStart;
  const validEndDate = endDate.isValid ? endDate : defaultEnd;

  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(
      and(
        gte(transactionsTable.timestamp, validStartDate.toJSDate()),
        lte(transactionsTable.timestamp, validEndDate.toJSDate())
      )
    )
    .orderBy(desc(transactionsTable.timestamp));

  const chartStartOfCurrentMonth = DateTime.now().startOf('month');
  const chartStartDate = chartStartOfCurrentMonth.minus({ months: 11 });

  const rawMonthlyData = await db
    .select({
      month: sql<string>`to_char(${transactionsTable.timestamp}, 'YYYY-MM')`,
      category: transactionsTable.category,
      total: sql<number>`sum(${transactionsTable.amount})`,
    })
    .from(transactionsTable)
    .where(gte(transactionsTable.timestamp, chartStartDate.toJSDate()))
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

  return {
    transactions,
    monthlyChartData,
    dateRange: {
      from: validStartDate.toISODate(),
      to: validEndDate.toISODate(),
    },
  };
}

export default function TransactionsIndexPage(props: Route.ComponentProps) {
  const { transactions, monthlyChartData, dateRange } = props.loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const hasFilters =
    searchParams.get('from') !== null && searchParams.get('to') !== null;

  const [date, setDate] = useState<DateRange | undefined>({
    from: dateRange.from ? new Date(dateRange.from) : undefined,
    to: dateRange.to ? new Date(dateRange.to) : undefined,
  });

  const handleDateChange = (newDate: DateRange | undefined) => {
    const hasChanged = newDate?.from !== date?.from || newDate?.to !== date?.to;
    if (!hasChanged || !newDate || !newDate.from || !newDate.to) {
      return;
    }

    setDate(newDate);
    const params = new URLSearchParams();
    params.set('from', DateTime.fromJSDate(newDate.from).toISODate() ?? '');
    params.set('to', DateTime.fromJSDate(newDate.to).toISODate() ?? '');
    setSearchParams(params);
  };

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

  const handleClearFilters = () => {
    setDate(undefined);
    setSearchParams(new URLSearchParams());
  };

  return (
    <>
      <MonthlyBarChart data={monthlyChartData} />

      <div className="mt-10 mb-3.5 flex items-center justify-between">
        <h2 className="text-lg tracking-tight">Transactions</h2>
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={date} onDateChange={handleDateChange} />
          {hasFilters && (
            <Button variant="outline" size="icon" onClick={handleClearFilters}>
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Clear filters</span>
            </Button>
          )}
        </div>
      </div>

      {transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200/50 p-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
            <ReceiptIcon className="h-8 w-8 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-zinc-900">
              No transactions found
            </h3>
            <p className="text-sm text-zinc-500">
              Try adjusting the date range to see more transactions.
            </p>
          </div>
        </div>
      )}

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
