import * as React from "react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export type StakeholderRole = "champion" | "economic-buyer" | "blocker" | "influencer" | "user";

export interface Stakeholder {
  id: string;
  name: string;
  title: string;
  role: StakeholderRole;
  /** Influencia 1–5. */
  influence: number;
  position?: { x: number; y: number };
}

export interface RelationshipLink {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export const ROLE_META: Record<StakeholderRole, { label: string; tone: Tone }> = {
  champion: { label: "Champion", tone: "ok" },
  "economic-buyer": { label: "Economic buyer", tone: "review" },
  blocker: { label: "Blocker", tone: "block" },
  influencer: { label: "Influencer", tone: "warn" },
  user: { label: "User", tone: "info" },
};

const CHIP: Record<Tone, string> = {
  info: "border-info/40 bg-info/10 text-info",
  ok: "border-ok/40 bg-ok/10 text-ok",
  review: "border-review/40 bg-review/10 text-review",
  warn: "border-warn/40 bg-warn/10 text-warn",
  block: "border-block/40 bg-block/10 text-block",
};

const LazyFlow = React.lazy(() => import("./relationship-map.flow.js"));

export interface RelationshipMapProps extends Omit<React.ComponentProps<"div">, "children" | "onSelect"> {
  people: Stakeholder[];
  links: RelationshipLink[];
  onSelect?: (id: string) => void;
  ariaLabel?: string;
  graphHeight?: number;
  rosterOnly?: boolean;
}

/**
 * Mapa de relaciones del comité de compra (área E) — stakeholders con rol
 * (champion/economic-buyer/blocker), influencia y conexiones. Los deals
 * enterprise promedian 11+ personas; visualizar cobertura/huecos evita perder
 * por single-threading. Reusa la infra de grafo de `AgentTopologyGraph` (React
 * Flow diferido, aria-hidden) + un roster `role="list"` accesible.
 */
export function RelationshipMap({
  people,
  links,
  onSelect,
  ariaLabel,
  graphHeight = 360,
  rosterOnly = false,
  className,
  ...props
}: RelationshipMapProps) {
  const t = useCopy();
  const resolvedAriaLabel = ariaLabel ?? t.relationshipMap.defaultAriaLabel;
  const [selected, setSelected] = React.useState<string | null>(null);
  function select(id: string) {
    setSelected(id);
    onSelect?.(id);
  }

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      {!rosterOnly ? (
        <div aria-hidden className="relative border-b border-border-subtle bg-surface-sunken" style={{ height: graphHeight }}>
          <React.Suspense fallback={<div className="grid h-full place-items-center text-xs text-faint">{t.common.loading}</div>}>
            <LazyFlow people={people} links={links} selected={selected} onSelect={select} />
          </React.Suspense>
        </div>
      ) : null}

      <ul role="list" aria-label={resolvedAriaLabel} className="divide-y divide-border-subtle">
        {people.map((p) => {
          const meta = ROLE_META[p.role];
          const isSelected = selected === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => select(p.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isSelected ? "bg-surface-3/60" : "hover:bg-surface-3/30",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-ink">{p.name}</span>
                  <span className="block font-mono text-[9.5px] uppercase tracking-wide text-faint">{p.title}</span>
                </span>
                <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide", CHIP[meta.tone])}>
                  {meta.label}
                </span>
                <span role="img" className="flex shrink-0 gap-0.5" aria-label={`Influencia ${p.influence} de 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className={cn("size-1.5 rounded-full", i < p.influence ? "bg-dim" : "bg-border-default")}
                    />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
