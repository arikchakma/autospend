import { DateTime } from 'luxon';
import type { Transaction } from '~/db/types';
import { formatCurrency, formatNumber, humanizeNumber } from '~/lib/formatter';
import { TransactionDetails } from './transaction-details';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Button } from './ui/button';

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
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const formattedTitle = DateTime.fromISO(date).toFormat('MMMM yyyy');
  const totalAmount = transactions.reduce((acc, transaction) => {
    return acc + transaction.amount;
  }, 0);
  const totalTransactions = transactions.length;
  const formattedTotalAmount = humanizeNumber(totalAmount);
  const formattedTotalTransactions = formatNumber(totalTransactions);

  const transactionsToShow = showAllTransactions
    ? transactions
    : transactions.slice(0, 3);

  return (
    <div className="mb-1 rounded-xl border border-zinc-200/50 bg-zinc-100 p-1.5">
      <div className="flex items-center justify-between gap-2 pr-0.5 pl-2.5">
        <h3 className="text-sm font-medium">{formattedTitle}</h3>
        <div className="flex items-center gap-2">
          <p className="text-xs text-zinc-500">
            BDT {formattedTotalAmount} spent on {formattedTotalTransactions}{' '}
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
          {transactionsToShow.map((transaction) => {
            const { id } = transaction;
            return <TransactionDetails key={id} transaction={transaction} />;
          })}
        </div>
      )}

      {transactions.length > 3 && isExpanded && (
        <Button
          type="button"
          onClick={() => setShowAllTransactions(!showAllTransactions)}
          variant="outline"
          className="mt-2 w-full font-normal shadow-xs"
        >
          {showAllTransactions ? 'Show less' : 'Show all'}
        </Button>
      )}
    </div>
  );
}
