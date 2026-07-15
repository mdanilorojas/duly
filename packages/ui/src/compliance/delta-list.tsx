import * as React from "react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

const CHIP: Record<Tone, string> = {
  info: "text-dim border-border-default bg-surface-3",
  ok: "text-ok border-ok/40 bg-ok/10",
  review: "text-review border-review/40 bg-review/10",
  warn: "text-warn border-warn/40 bg-warn/10",
  block: "text-block border-block/40 bg-block/10",
};

export interface DeltaEntry {
  label: string;
  before: { label: string; tone: Tone };
  after: { label: string; tone: Tone };
  /** Mejora explícita — el DS no infiere ranking de tonos. */
  improved?: boolean;
}

export interface DeltaListProps extends Omit<React.ComponentProps<"ul">, "children"> {
  entries: DeltaEntry[];
}

/**
 * Lista antes → después entre dos corridas/estados (área C) — presenta el
 * diff que computa el consumidor (p. ej. fold diffRuns): qué área subió,
 * qué quedó igual. La mejora es explícita (`improved`) y se marca con ▲ +
 * texto sr-only, nunca solo color.
 */
export function DeltaList({ entries, className, ...props }: DeltaListProps) {
  const copy = useCopy();
  return (
    <ul className={cn("flex flex-col gap-2", className)} {...props}>
      {entries.map((e) => (
        <li
          key={e.label}
          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2.5 rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-sm"
        >
          <span className="text-ink">{e.label}</span>
          <span className={cn("rounded-full border px-2 py-px font-mono text-[0.68rem]", CHIP[e.before.tone])}>
            {e.before.label}
          </span>
          <span aria-hidden className="text-faint">
            →
          </span>
          <span className={cn("rounded-full border px-2 py-px font-mono text-[0.68rem]", CHIP[e.after.tone])}>
            {e.after.label}
            {e.improved ? (
              <>
                {" "}
                <span aria-hidden>▲</span>
                <span className="sr-only">{copy.deltaList.improved}</span>
              </>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
