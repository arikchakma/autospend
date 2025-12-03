import { queryOptions } from '@tanstack/react-query';
import { httpGet } from '~/lib/http';
import type { Transaction } from '~/db/types';

type ListTransactionsOptions = {
  from: string;
  to: string;
  page?: number;
  limit?: number;
};

type ListTransactionsResponse = {
  data: Transaction[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  totalAmount: number;
};

export function listTransactionsOptions(options: ListTransactionsOptions) {
  const { from, to, page = 1, limit = 10 } = options;

  return queryOptions({
    queryKey: ['transactions', { from, to }],
    queryFn: () =>
      httpGet<ListTransactionsResponse>('/api/v1/transactions', {
        from,
        to,
        page,
        limit,
      }),
  });
}

type MonthlyChartData = {
  month: string;
  category: Transaction['category'];
  total: number;
};

type MonthlyChartResponse = {
  stats: MonthlyChartData[];
};

export function monthlyChartOptions() {
  return queryOptions({
    queryKey: ['monthly-chart'],
    queryFn: () => httpGet<MonthlyChartResponse>('/api/v1/transactions/stats'),
  });
}
