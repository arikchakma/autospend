import type { Transaction } from '~/db/types';
import {
  CalendarIcon,
  CarIcon,
  CircleDashedIcon,
  CreditCardIcon,
  FileTextIcon,
  FilmIcon,
  GraduationCapIcon,
  HeartIcon,
  HomeIcon,
  ShoppingBagIcon,
  StoreIcon,
  UtensilsIcon,
  ReceiptIcon,
} from 'lucide-react';
import { DateTime } from 'luxon';
import { cn } from '~/lib/classname';

import { Sheet, SheetContent, SheetTrigger } from './sheet';

type TransactionDetailsProps = {
  transaction: Transaction;
};

export function TransactionDetails(props: TransactionDetailsProps) {
  const { transaction } = props;

  const {
    merchant,
    description,
    amount,
    currency,
    timestamp,
    category,
    image,
    cardNumber,
  } = transaction;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    signDisplay: 'auto',
  }).format(amount);

  const formattedDate = DateTime.fromJSDate(timestamp).toFormat('dd MMM yyyy');
  const imageUrl = image
    ? `${import.meta.env.VITE_FILE_CDN_URL}/${image}`
    : null;

  return (
    <Sheet>
      <SheetTrigger className="grid grid-cols-4 items-center gap-2 p-2.5 hover:bg-zinc-50">
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
      <SheetContent
        className="flex flex-col bg-transparent p-4 shadow-none"
        closeClassName="top-8 right-8"
        initialFocus={false}
      >
        <div className="hide-scrollbar grow overflow-y-auto rounded-xl bg-white p-4">
          <div className="mt-4 flex flex-col items-center justify-center gap-4">
            <h2 className="text-4xl font-bold text-zinc-900">
              {formattedAmount}
            </h2>
            <CategoryBadge
              category={category}
              className="px-4 py-1.5 text-sm"
            />
          </div>

          <div className="mt-8 flex flex-col divide-y divide-zinc-100 rounded-lg border border-zinc-100 bg-zinc-50/50">
            <DetailRow
              icon={CalendarIcon}
              label={formattedDate}
              className="text-zinc-700"
            />
            <DetailRow
              icon={StoreIcon}
              label={merchant || 'Unknown Merchant'}
              className="font-medium text-zinc-900 uppercase"
            />
            {cardNumber && (
              <DetailRow
                icon={CreditCardIcon}
                label={`Debited from ****${cardNumber}`}
                className="text-zinc-600"
              />
            )}
            {description && (
              <DetailRow
                icon={FileTextIcon}
                label={description}
                className="text-zinc-600"
              />
            )}
          </div>

          {imageUrl && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-[9px] text-sm font-medium text-zinc-500">
                <ReceiptIcon className="size-5 shrink-0 text-zinc-400" />
                <span>Receipt</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <img
                  src={imageUrl}
                  alt="Receipt"
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

type DetailRowProps = {
  icon: React.ElementType;
  label: string;
  className?: string;
};

function DetailRow({ icon: Icon, label, className }: DetailRowProps) {
  return (
    <div className="flex items-center gap-3 p-2">
      <Icon className="size-5 shrink-0 text-zinc-400" />
      <span className={cn('text-sm', className)}>{label}</span>
    </div>
  );
}

type CategoryBadgeProps = {
  category: string;
  className?: string;
  iconClassName?: string;
};

function CategoryBadge(props: CategoryBadgeProps) {
  const { category: categoryProp, className, iconClassName } = props;

  const config: Record<
    string,
    { icon: React.ElementType; color: string; label: string }
  > = {
    food: {
      icon: UtensilsIcon,
      color: 'bg-pink-50 text-pink-700',
      label: 'Food',
    },
    transport: {
      icon: CarIcon,
      color: 'bg-blue-50 text-blue-700',
      label: 'Transport',
    },
    shopping: {
      icon: ShoppingBagIcon,
      color: 'bg-green-50 text-green-700',
      label: 'Shopping',
    },
    entertainment: {
      icon: FilmIcon,
      color: 'bg-purple-50 text-purple-700',
      label: 'Entertainment',
    },
    accommodation: {
      icon: HomeIcon,
      color: 'bg-yellow-50 text-yellow-700',
      label: 'Accommodation',
    },
    health: {
      icon: HeartIcon,
      color: 'bg-rose-50 text-rose-700',
      label: 'Health',
    },
    education: {
      icon: GraduationCapIcon,
      color: 'bg-orange-50 text-orange-700',
      label: 'Education',
    },
    bills: {
      icon: FileTextIcon,
      color: 'bg-gray-50 text-gray-700',
      label: 'Bills',
    },
    other: {
      icon: CircleDashedIcon,
      color: 'bg-zinc-50 text-zinc-700',
      label: 'Other',
    },
  };

  const category = Object.keys(config).includes(categoryProp)
    ? categoryProp
    : 'other';
  const { icon: Icon, color, label } = config[category];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium tracking-wide uppercase',
        color,
        className
      )}
    >
      <Icon className={cn('size-2.5 shrink-0 stroke-[2.5]', iconClassName)} />
      {label}
    </span>
  );
}
