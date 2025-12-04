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

export const TRANSACTIONS_QUERY_KEY = 'transactions';

export function listTransactionsOptions(options: ListTransactionsOptions) {
  const { from, to, page = 1, limit = 10 } = options;

  return queryOptions({
    queryKey: [TRANSACTIONS_QUERY_KEY, { from, to }],
    queryFn: () => {
      return httpGet<ListTransactionsResponse>('/api/v1/transactions', {
        from,
        to,
        page,
        limit,
      });
    },
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
    queryFn: () => {
      return httpGet<MonthlyChartResponse>('/api/v1/transactions/stats');
    },
  });
}
