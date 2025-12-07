import type { Route } from './+types/transactions._index';
import { DateTime } from 'luxon';
import { ReceiptIcon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { href, redirect, useSearchParams } from 'react-router';
import type { DateRange } from 'react-day-picker';
import { MonthlyBarChart } from '~/components/monthly-bar-chart';
import { TransactionsGroup } from '~/components/transactions-group';
import { ProcessingImagesGroup } from '~/components/processing-images-group';
import { DatePickerWithRange } from '~/components/date-range-picker';
import { Button } from '~/components/ui/button';
import { listTransactionsOptions } from '~/queries/transaction';
import { useQuery } from '@tanstack/react-query';
import { isLoggedIn } from '~/lib/jwt';
import { deleteUrlParam, setUrlParams } from '~/lib/browser';
import { Skeleton } from '~/components/ui/skeleton';

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

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery(
    listTransactionsOptions({
      from: date.from
        ? DateTime.fromJSDate(date.from).toFormat('dd-MM-yyyy')
        : defaultFrom.toFormat('dd-MM-yyyy'),
      to: date.to
        ? DateTime.fromJSDate(date.to).toFormat('dd-MM-yyyy')
        : defaultTo.toFormat('dd-MM-yyyy'),
    })
  );

  const transactions = transactionsData?.data ?? [];

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
      <ProcessingImagesGroup />

      <MonthlyBarChart />

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

      {isTransactionsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : (
        <>
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

          {Object.entries(groupedTransactions).map(
            ([date, transactions = []]) => {
              return (
                <TransactionsGroup
                  key={date}
                  date={date}
                  transactions={transactions}
                />
              );
            }
          )}
        </>
      )}
    </>
  );
}

export function headers() {
  return {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  };
}
