import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "~/lib/classname"

type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root>;

function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

type PopoverTriggerProps = React.ComponentProps<typeof PopoverPrimitive.Trigger>;

function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Content>;

function PopoverContent(props: PopoverContentProps) {
  const { className, align = "center", sideOffset = 4, ...rest } = props;
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-white text-zinc-900 z-50 w-72 rounded-md border border-zinc-200 p-4 outline-hidden",
          className
        )}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  )
}

type PopoverAnchorProps = React.ComponentProps<typeof PopoverPrimitive.Anchor>;

function PopoverAnchor(props: PopoverAnchorProps) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
