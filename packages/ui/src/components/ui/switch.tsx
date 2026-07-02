import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        // after: hit-area vertical ≥24px (WCAG 2.2 — 2.5.8 Target Size); el track mide 18.4/14px de alto
        // unchecked: surface-3 + border-strong para pasar WCAG 1.4.11 (3:1) sobre superficies oscuras
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border shadow-xs transition-all outline-none after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-[''] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=unchecked]:border-border-strong data-[state=unchecked]:bg-surface-3",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // thumb claro en unchecked (dim ~L0.78 contra track surface-3) y oscuro en checked (contra accent brillante)
          "pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=checked]:bg-on-accent data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-dim"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
