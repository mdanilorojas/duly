import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring aria-invalid:border-block aria-invalid:ring-block/20 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-accent text-on-accent [a&]:hover:bg-accent/90",
        secondary:
          "bg-surface-3 text-ink [a&]:hover:bg-surface-3/90",
        destructive:
          "bg-block text-on-block focus-visible:ring-block/20 [a&]:hover:bg-block/90",
        outline:
          "border-border-default text-ink [a&]:hover:bg-surface-2 [a&]:hover:text-dim",
        ghost: "[a&]:hover:bg-surface-2 [a&]:hover:text-dim",
        link: "text-accent underline-offset-4 [a&]:hover:underline",
        // semantic status variants — maps to our agent-ops palette
        ok:     "border-ok/25 bg-ok/15 text-ok",
        warn:   "border-warn/25 bg-warn/15 text-warn",
        review: "border-review/25 bg-review/15 text-review",
        info:   "border-info/25 bg-info/15 text-info",
        block:  "border-block/25 bg-block/15 text-block",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }
>(function Badge({ className, variant = "default", asChild = false, ...props }, ref) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      ref={ref}
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
})

export { Badge, badgeVariants }
