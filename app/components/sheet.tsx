import * as React from 'react';
import { Dialog as SheetPrimitive } from '@base-ui-components/react/dialog';
import { XIcon } from 'lucide-react';
import { cn } from '~/lib/classname';

function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal(props: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay(props: SheetPrimitive.Backdrop.Props) {
  const { className, ...rest } = props;

  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      {...rest}
    />
  );
}

function SheetContent(
  props: SheetPrimitive.Popup.Props & {
    side?: 'top' | 'right' | 'bottom' | 'left';
    closeClassName?: string;
  }
) {
  const {
    className,
    children,
    side = 'right',
    closeClassName,
    ...rest
  } = props;
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 flex flex-col gap-4 bg-white shadow-lg',
          side === 'right' && 'inset-y-0 right-0 h-full w-3/4 sm:max-w-md',
          side === 'left' && 'inset-y-0 left-0 h-full w-3/4 sm:max-w-md',
          side === 'top' && 'inset-x-0 top-0 h-auto',
          side === 'bottom' && 'inset-x-0 bottom-0 h-auto',
          className
        )}
        {...rest}
      >
        {children}
        <SheetPrimitive.Close
          className={cn(
            'absolute top-4 right-4 rounded-xs opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none',
            closeClassName
          )}
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader(props: React.ComponentProps<'div'>) {
  const { className, ...rest } = props;
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...rest}
    />
  );
}

function SheetFooter(props: React.ComponentProps<'div'>) {
  const { className, ...rest } = props;
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...rest}
    />
  );
}

function SheetTitle(props: SheetPrimitive.Title.Props) {
  const { className, ...rest } = props;
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-foreground font-semibold', className)}
      {...rest}
    />
  );
}

function SheetDescription(props: SheetPrimitive.Description.Props) {
  const { className, ...rest } = props;
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...rest}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
