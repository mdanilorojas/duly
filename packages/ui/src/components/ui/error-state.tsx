import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCopy } from "@/lib/copy/index.js"

const errorStateVariants = cva(
  "flex flex-col items-center gap-2 rounded-lg border px-4 py-8 text-center",
  {
    variants: {
      variant: {
        default: "border-block/30 bg-block/8 text-block",
        subtle: "border-border-subtle bg-surface-2 text-dim",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface ErrorStateProps
  extends Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof errorStateVariants> {
  title?: string
  description?: string
  action?: React.ReactNode
}

/**
 * Estado de error reutilizable — hermano de `emptyState`/`emptyLabel` para
 * regiones de datos (slot de `DataTable`, `emptyLabel` de tablas/listas del
 * DS). Modelado sobre la estructura cva de `Alert`, el único primitivo
 * "algo salió mal" existente antes de este componente.
 */
function ErrorState({ className, variant, title, description, action, ...props }: ErrorStateProps) {
  const t = useCopy()
  return (
    <div role="alert" className={cn(errorStateVariants({ variant }), className)} {...props}>
      <AlertTriangle className="size-5" aria-hidden />
      <p className="text-[13px] font-semibold">{title ?? t.errorState.defaultTitle}</p>
      {description ? (
        <p className="max-w-[42ch] text-[12px] leading-relaxed opacity-90">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}

export { ErrorState, errorStateVariants }
