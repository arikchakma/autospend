import * as React from 'react';

import { cn } from '~/lib/classname';

type InputProps = React.ComponentProps<'input'>;

function Input(props: InputProps) {
  const { className, type, ...rest } = props;
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-lg border border-zinc-200 bg-transparent px-3 py-1 text-base text-zinc-900 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-950 placeholder:text-zinc-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-zinc-900 focus-visible:ring-zinc-900/50',
        'aria-invalid:border-red-500 aria-invalid:ring-red-500/20',
        className
      )}
      {...rest}
    />
  );
}

export { Input };
