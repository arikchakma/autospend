import type { Route } from './+types/transactions._index';
import { DateTime } from 'luxon';
import { ReceiptIcon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { href, redirect, useSearchParams } from 'react-router';
import type { DateRange } from 'react-day-picker';
import {
  MonthlyBarChart,
  type MonthlyChartData,
} from '~/components/monthly-bar-chart';
import { TransactionsGroup } from '~/components/transactions-group';
import { ProcessingImagesGroup } from '~/components/processing-images-group';
import { allowedCategories } from '~/lib/transaction';
import { DatePickerWithRange } from '~/components/date-range-picker';
import { Button } from '~/components/ui/button';
import {
  listTransactionsOptions,
  monthlyChartOptions,
} from '~/queries/transaction';
import { useSuspenseQueries } from '@tanstack/react-query';
import { listImagesOptions } from '~/queries/image';
import { isLoggedIn } from '~/lib/jwt';
import { deleteUrlParam, setUrlParams } from '~/lib/browser';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'AutoSpend - Simplify Your Personal Finances' },
    {
      name: 'description',
      content: 'AutoSpend helps you manage your personal finances',
    },
  ];
};

export function clientLoader() {
  if (isLoggedIn()) {
    return;
  }

  return redirect(href('/login'));
}

export default function TransactionsIndexPage(props: Route.ComponentProps) {
  const now = DateTime.now();
  const defaultFrom = now.minus({ months: 3 }).startOf('day');
  const defaultTo = now.endOf('day');

  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const hasFilters = from !== null && to !== null;

  const [date, setDate] = useState<DateRange>({
    from: from
      ? DateTime.fromFormat(from, 'dd-MM-yyyy').toJSDate()
      : defaultFrom.toJSDate(),
    to: to
      ? DateTime.fromFormat(to, 'dd-MM-yyyy').toJSDate()
      : defaultTo.toJSDate(),
  });

  const [
    { data: statsData },
    { data: imagesData },
    { data: transactionsData },
  ] = useSuspenseQueries({
    queries: [
      monthlyChartOptions(),
      listImagesOptions({ status: ['pending', 'processing'] }),
      listTransactionsOptions({
        from: date.from
          ? DateTime.fromJSDate(date.from).toFormat('dd-MM-yyyy')
          : defaultFrom.toFormat('dd-MM-yyyy'),
        to: date.to
          ? DateTime.fromJSDate(date.to).toFormat('dd-MM-yyyy')
          : defaultTo.toFormat('dd-MM-yyyy'),
      }),
    ],
  });

  const { data: transactions } = transactionsData;
  const { images } = imagesData;
  const { stats } = statsData;

  const monthlyChartData = useMemo(() => {
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

    for (const row of stats) {
      const entry = monthlyDataMap.get(row.month);
      if (entry) {
        const category =
          allowedCategories.find((c) => c === row.category) || 'other';
        entry[category] = (entry[category] || 0) + row.total;
      }
    }

    return Array.from(monthlyDataMap.values());
  }, [stats]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    const hasChanged = newDate?.from !== date?.from || newDate?.to !== date?.to;
    if (!hasChanged || !newDate || !newDate.from || !newDate.to) {
      return;
    }

    const newFrom = DateTime.fromJSDate(newDate.from).startOf('day');
    const newTo = DateTime.fromJSDate(newDate.to).endOf('day');
    setDate({ from: newFrom.toJSDate(), to: newTo.toJSDate() });
    setUrlParams({
      from: newFrom.toFormat('dd-MM-yyyy'),
      to: newTo.toFormat('dd-MM-yyyy'),
    });
  };

  const groupedTransactions = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        const date = DateTime.fromJSDate(
          new Date(transaction.timestamp)
        ).toFormat('yyyy-MM');
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
    setDate({ from: defaultFrom.toJSDate(), to: defaultTo.toJSDate() });
    deleteUrlParam('from');
    deleteUrlParam('to');
  };

  return (
    <>
      <ProcessingImagesGroup images={images} />

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
