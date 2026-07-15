import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";

/**
 * EnvironmentBadge — en qué entorno está actuando el operador. En una consola
 * donde un click aprueba acciones de agentes reales, "estás en producción"
 * es información de seguridad, no decoración: production usa tono `warn`
 * (actúa con cuidado), staging `review`, development `info`, sandbox neutro.
 * Mismo mapa de tonos semánticos que `Badge`/`NodeStatusBadge`.
 */
const environmentBadgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
  {
    variants: {
      environment: {
        production: "border-warn/25 bg-warn/15 text-warn",
        staging: "border-review/25 bg-review/15 text-review",
        development: "border-info/25 bg-info/15 text-info",
        sandbox: "border-border-default bg-surface-3 text-dim",
      },
    },
    defaultVariants: { environment: "development" },
  },
);

export type EnvironmentName = NonNullable<VariantProps<typeof environmentBadgeVariants>["environment"]>;

export interface EnvironmentBadgeProps extends React.ComponentProps<"span"> {
  environment: EnvironmentName;
  /** Override del texto (ej. nombre del tenant: "prod-eu-1"). */
  label?: string;
}

export function EnvironmentBadge({ environment, label, className, ...props }: EnvironmentBadgeProps) {
  const copy = useCopy();
  const full = label ?? copy.appShell.environment[environment];
  const short = copy.appShell.environmentShort[environment];
  return (
    <span className={cn(environmentBadgeVariants({ environment }), className)} {...props}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {/* En <sm el topbar no tiene espacio para "PRODUCTION" pero la señal de
          seguridad no puede desaparecer: se abrevia (PROD), no se oculta. Con
          `label` editorial se respeta tal cual en todos los tamaños. */}
      {label ? (
        <span>{full}</span>
      ) : (
        <>
          <span className="max-sm:hidden">{full}</span>
          <span aria-hidden className="sm:hidden">
            {short}
          </span>
          <span className="sr-only sm:hidden">{full}</span>
        </>
      )}
    </span>
  );
}
