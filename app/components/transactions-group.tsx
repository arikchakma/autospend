import { DateTime } from 'luxon';
import type { Transaction } from '~/db/types';
import { formatCurrency, formatNumber } from '~/lib/formatter';
import { TransactionDetails } from './transaction-details';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

type TransactionsGroupProps = {
  date: string;
  transactions: Transaction[];
};

export function TransactionsGroup(props: TransactionsGroupProps) {
  const { date, transactions } = props;

  const isCurrentMonth =
    DateTime.fromISO(date).toFormat('yyyy-MM') ===
    DateTime.now().toFormat('yyyy-MM');
  const [isExpanded, setIsExpanded] = useState(isCurrentMonth);

  const formattedTitle = DateTime.fromISO(date).toFormat('MMMM yyyy');
  const totalAmount = transactions.reduce((acc, transaction) => {
    return acc + transaction.amount;
  }, 0);
  const totalTransactions = transactions.length;
  const formattedTotalAmount = formatCurrency(totalAmount);
  const formattedTotalTransactions = formatNumber(totalTransactions);

  return (
    <div
      key={date}
      className="mb-3.5 rounded-xl border border-zinc-200/50 bg-zinc-100 p-1.5"
    >
      <div className="flex items-center justify-between gap-2 pr-0.5 pl-2.5">
        <h3 className="text-lg font-medium">{formattedTitle}</h3>
        <div className="flex items-center gap-2">
          <p className="text-sm text-zinc-500">
            {formattedTotalAmount} spent on {formattedTotalTransactions}{' '}
            purchases
          </p>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex size-5 shrink-0 items-center justify-center rounded-md bg-zinc-50 shadow-xs hover:bg-zinc-100"
          >
            {isExpanded ? (
              <ChevronUpIcon className="size-4 text-zinc-500" />
            ) : (
              <ChevronDownIcon className="size-4 text-zinc-500" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1 flex flex-col divide-y divide-zinc-100 overflow-hidden rounded-lg bg-white shadow">
          {transactions.map((transaction) => {
            const { id } = transaction;
            return <TransactionDetails key={id} transaction={transaction} />;
          })}
        </div>
      )}
    </div>
  );
}
