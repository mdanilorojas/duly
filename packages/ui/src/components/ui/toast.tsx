"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn.js";

export type ToastVariant = "default" | "success" | "warning" | "error";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  durationMs: number;
}

type Listener = (items: ToastItem[]) => void;
let items: ToastItem[] = [];
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l(items);
}

export function toast(opts: {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}) {
  const id = crypto.randomUUID();
  const durationMs = opts.durationMs ?? 4000;
  items = [...items, { id, title: opts.title, description: opts.description, variant: opts.variant ?? "default", durationMs }];
  emit();
  setTimeout(() => {
    items = items.filter((i) => i.id !== id);
    emit();
  }, durationMs);
}

const toastVariants = cva(
  "rounded-md border px-4 py-3 shadow-md text-sm data-[variant=default]:bg-bg-elevated data-[variant=default]:border-border-default data-[variant=default]:text-ink",
  {
    variants: {
      variant: {
        default: "bg-bg-elevated border-border-default text-ink",
        success: "bg-ok/10 border-ok/40 text-ok",
        warning: "bg-warn/10 border-warn/40 text-warn",
        error: "bg-block/10 border-block/40 text-block",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Toaster() {
  const [current, setCurrent] = React.useState<ToastItem[]>(items);

  React.useEffect(() => {
    const listener: Listener = (next) => setCurrent(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <ToastPrimitive.Provider>
      {current.map((item) => (
        <ToastPrimitive.Root
          key={item.id}
          data-variant={item.variant}
          className={cn(toastVariants({ variant: item.variant }))}
        >
          <ToastPrimitive.Title className="font-medium">{item.title}</ToastPrimitive.Title>
          {item.description && (
            <ToastPrimitive.Description className="text-dim mt-0.5">
              {item.description}
            </ToastPrimitive.Description>
          )}
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" />
    </ToastPrimitive.Provider>
  );
}
