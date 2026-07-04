import * as React from "react";
import { Link2, Lock, Puzzle, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface A2ASkill {
  id: string;
  name: string;
  description?: string;
}

/** Documento A2A Agent Card (discovery/capacidad de un agente par). */
export interface A2AAgentCard {
  name: string;
  description?: string;
  /** Endpoint del agente (típicamente `/.well-known/agent.json`). */
  url: string;
  version?: string;
  provider?: string;
  authRequired?: boolean;
  skills: A2ASkill[];
  inputModes?: string[];
  outputModes?: string[];
}

function Modes({ label, modes }: { label: string; modes?: string[] }) {
  if (!modes?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="font-mono text-[9.5px] uppercase tracking-wide text-faint">{label}</span>
      {modes.map((m) => (
        <span key={m} className="rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-dim">
          {m}
        </span>
      ))}
    </div>
  );
}

export interface A2AAgentCardViewerProps extends Omit<React.ComponentProps<"div">, "children"> {
  card: A2AAgentCard;
}

/**
 * Visor de A2A Agent Card (área G) — renderiza el documento de discovery del
 * protocolo Agent2Agent (skills, endpoint, auth, modalidades) para evaluar
 * confianza/compatibilidad ANTES de invocar a un agente par. Distinto de la
 * tarjeta de presentación `AgentTile` (ver corrección de nomenclatura).
 */
export function A2AAgentCardViewer({ card, className, ...props }: A2AAgentCardViewerProps) {
  return (
    <div
      className={cn("flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-2 p-4", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-ink">{card.name}</span>
            {card.version ? (
              <span className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-dim">v{card.version}</span>
            ) : null}
          </div>
          {card.provider ? (
            <span className="font-mono text-[10px] uppercase tracking-wide text-faint">{card.provider}</span>
          ) : null}
        </div>
        {card.authRequired ? (
          <span className="inline-flex items-center gap-1 rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-warn">
            <Lock className="size-3" aria-hidden />
            Auth requerida
          </span>
        ) : null}
      </div>

      {card.description ? <p className="text-[12.5px] text-dim">{card.description}</p> : null}

      <div className="flex items-center gap-1.5 overflow-x-auto rounded-md border border-border-subtle bg-surface-sunken px-2 py-1.5">
        <Link2 className="size-3.5 shrink-0 text-faint" aria-hidden />
        <code className="whitespace-nowrap font-mono text-[11px] text-accent">{card.url}</code>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wide text-faint">
          <Puzzle className="size-3" aria-hidden />
          Skills
        </span>
        <ul className="flex flex-col gap-1">
          {card.skills.map((s) => (
            <li key={s.id} className="rounded-md border border-border-subtle bg-bg-elevated px-2.5 py-1.5">
              <span className="text-[12px] font-medium text-ink">{s.name}</span>
              {s.description ? <span className="ml-2 text-[11px] text-faint">{s.description}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      {card.inputModes?.length || card.outputModes?.length ? (
        <div className="flex flex-col gap-1.5 border-t border-border-subtle pt-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wide text-faint">
            <ArrowRightLeft className="size-3" aria-hidden />
            Modalidades
          </span>
          <Modes label="in" modes={card.inputModes} />
          <Modes label="out" modes={card.outputModes} />
        </div>
      ) : null}
    </div>
  );
}
