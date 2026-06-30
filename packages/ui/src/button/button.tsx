import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn.js";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        solid: "bg-accent text-on-accent hover:opacity-90",
        outline: "border border-border-strong bg-transparent text-ink hover:bg-surface-2",
        ghost: "bg-transparent text-ink hover:bg-surface-2",
        destructive: "bg-block text-on-block hover:opacity-90",
        icon: "rounded-lg p-0 bg-transparent text-dim hover:text-ink hover:bg-surface-2",
      },
      size: {
        sm: "h-7 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-base",
      },
    },
    compoundVariants: [
      { variant: "icon", size: "sm", className: "size-7 px-0" },
      { variant: "icon", size: "md", className: "size-9 px-0" },
      { variant: "icon", size: "lg", className: "size-10 px-0" },
    ],
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        data-variant={variant ?? "solid"}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
