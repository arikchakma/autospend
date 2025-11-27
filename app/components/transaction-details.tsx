import type { Transaction } from '~/db/types';
import { Sheet, SheetContent, SheetTrigger } from './sheet';
import { DateTime } from 'luxon';
import { cn } from '~/lib/classname';

type TransactionDetailsProps = {
  transaction: Transaction;
};

export function TransactionDetails(props: TransactionDetailsProps) {
  const { transaction } = props;

  const { merchant, description, amount, currency, timestamp, id, category } =
    transaction;
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);

  const formattedDate = DateTime.fromJSDate(timestamp).toFormat('dd MMM yyyy');

  return (
    <Sheet>
      <SheetTrigger className="grid grid-cols-4 items-center gap-2 p-2 hover:bg-zinc-50">
        <div className="col-span-2 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h4
              className="truncate text-sm font-medium"
              title={merchant || undefined}
            >
              {merchant}
            </h4>
            <CategoryBadge category={category} />
          </div>
          <p
            className="truncate text-sm text-zinc-500"
            title={description || undefined}
          >
            {description || 'No description'}
          </p>
        </div>

        <p className="justify-self-end text-sm text-zinc-500">
          {formattedAmount}
        </p>
        <p className="justify-self-end text-sm text-zinc-500">
          {formattedDate}
        </p>
      </SheetTrigger>
      <SheetContent>
        <div>Hello</div>
      </SheetContent>
    </Sheet>
  );
}

type CategoryBadgeProps = {
  category: string;
};

function CategoryBadge(props: CategoryBadgeProps) {
  const { category: categoryProp } = props;

  const colors: Record<string, string> = {
    food: 'bg-pink-50 text-pink-600',
    transport: 'bg-blue-50 text-blue-600',
    shopping: 'bg-green-50 text-green-600',
    entertainment: 'bg-purple-50 text-purple-600',
    accommodation: 'bg-yellow-50 text-yellow-600',
    health: 'bg-pink-50 text-pink-600',
    education: 'bg-orange-50 text-orange-600',
    bills: 'bg-gray-50 text-gray-600',
    other: 'bg-zinc-50 text-zinc-600',
  };
  const category = Object.keys(colors).includes(categoryProp)
    ? categoryProp
    : 'other';

  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        colors[category]
      )}
    >
      {category}
    </span>
  );
}
