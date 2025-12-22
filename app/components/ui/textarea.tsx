import * as React from 'react';

import { cn } from '~/lib/classname';

type TextareaProps = React.ComponentProps<'textarea'>;

function Textarea(props: TextareaProps) {
  const { className, ...rest } = props;
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-30 w-full min-w-0 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-base text-zinc-900 transition-[color,box-shadow] outline-none placeholder:text-zinc-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-zinc-900 focus-visible:ring-zinc-900/50',
        'aria-invalid:border-red-500 aria-invalid:ring-red-500/20',
        className
      )}
      {...rest}
    />
  );
}

export { Textarea };
