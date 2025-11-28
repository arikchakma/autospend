import { queryOptions } from '@tanstack/react-query';
import { httpGet } from '~/lib/http';
import type { Route } from '../routes/+types/api.v1.transactions._index';
import type { Transaction } from '~/db/types';

type ListTransactionsOptions = {
  month: string;
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
  const { month, page = 1, limit = 10 } = options;

  return queryOptions({
    queryKey: ['transactions', month],
    queryFn: () =>
      httpGet<ListTransactionsResponse>('/api/v1/transactions', {
        month,
        page,
        limit,
      }),
  });
}
