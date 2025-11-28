import { DateTime } from 'luxon';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '~/lib/classname';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { useState, type HTMLAttributes } from 'react';

type DatePickerWithRangeProps = HTMLAttributes<HTMLDivElement> & {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
};

export function DatePickerWithRange(props: DatePickerWithRangeProps) {
  const { date, onDateChange, className } = props;
  const [internalDate, setInternalDate] = useState<DateRange | undefined>(date);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onDateChange?.(internalDate);
    } else {
      setInternalDate(date);
    }
  };

  const formatDateRange = (range: DateRange) => {
    if (!range.from) return '';
    if (!range.to) {
      return DateTime.fromJSDate(range.from).toFormat('LLL dd, yyyy');
    }

    const from = DateTime.fromJSDate(range.from);
    const to = DateTime.fromJSDate(range.to);

    if (from.hasSame(to, 'year')) {
      return `${from.toFormat('LLL dd')} - ${to.toFormat('LLL dd, yyyy')}`;
    }

    return `${from.toFormat('LLL dd, yyyy')} - ${to.toFormat('LLL dd, yyyy')}`;
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !date && 'text-zinc-500'
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {date?.from ? (
              <span>{formatDateRange(date)}</span>
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-xl p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={internalDate?.from}
            selected={internalDate}
            onSelect={setInternalDate}
            numberOfMonths={2}
            className="bg-transparent"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
