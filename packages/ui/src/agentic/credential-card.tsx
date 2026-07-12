import * as React from "react";
import { Key, Cloud, Database, Webhook, ShieldCheck, Clock, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneChip } from "./approval-gate-card.js";
import type { Tone } from "../trace-log/trace-log.variants.js";
import { Input } from "../components/ui/input.js";

export type CredentialKind = "api_key" | "oauth" | "service_account" | "database" | "webhook_secret";
export type CredentialHealth = "valid" | "expiring" | "expired" | "revoked";

interface KindConfig {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

const kindConfig: Record<CredentialKind, KindConfig> = {
  api_key: { label: "API key", icon: Key },
  oauth: { label: "OAuth connection", icon: ShieldCheck },
  service_account: { label: "Service account", icon: Cloud },
  database: { label: "Database credential", icon: Database },
  webhook_secret: { label: "Webhook secret", icon: Webhook },
};

interface HealthConfig {
  label: string;
  tone: Tone;
}

// Salud de credencial no es solo binaria válida/inválida — "expiring" con
// aviso previo evita que un workflow se rompa en producción sin avisar.
const healthConfig: Record<CredentialHealth, HealthConfig> = {
  valid: { label: "Valid", tone: "ok" },
  expiring: { label: "Expiring soon", tone: "warn" },
  expired: { label: "Expired", tone: "block" },
  revoked: { label: "Revoked", tone: "block" },
};

export interface Credential {
  id: string;
  name: string;
  kind: CredentialKind;
  /** Dueño de la credencial, ej. "Maria Chen" o "Platform Team". */
  owner: string;
  lastUsed: string;
  health: CredentialHealth;
  /** Fecha/hora de expiración legible — se muestra cuando `health` es "expiring" o "expired". */
  expiresAt?: string;
  /** Workflows o integraciones que comparten esta credencial. */
  sharedWith: string[];
  /** Alcance de permisos, ej. ["read:invoices", "write:payouts"]. */
  scopes?: string[];
}

function HealthChip({ health }: { health: CredentialHealth }) {
  const cfg = healthConfig[health];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        toneChip[cfg.tone],
      )}
    >
      {cfg.label}
    </span>
  );
}

export interface CredentialCardProps extends Omit<React.ComponentProps<"article">, "children"> {
  credential: Credential;
  /** Modo compacto para uso dentro de `CredentialPicker` (fila de lista, sin marco propio). */
  compact?: boolean;
}

/**
 * Credencial: tipo, owner, last-used, compartida-con, health — segunda mitad
 * de la nueva prioridad #1 del NORTH_STAR (área A, n8n/proceso empresarial),
 * junto a `RetryControls`. Reutiliza `toneChip` de `ApprovalGateCard` para el
 * tono de salud, siguiendo el mismo vocabulario que `AuditLogTable`/
 * `TokenCostMeter`: un estado de salud siempre lleva tono + label, nunca solo
 * color. El conteo de "shared with" es deliberadamente visible — una
 * credencial compartida por muchos workflows es una superficie de riesgo que
 * un CISO necesita ver sin abrir un modal aparte.
 */
export function CredentialCard({ credential, compact = false, className, ...props }: CredentialCardProps) {
  const cfg = kindConfig[credential.kind];
  const Icon = cfg.icon;
  const showExpiry = (credential.health === "expiring" || credential.health === "expired") && credential.expiresAt;

  return (
    <article
      aria-label={`${credential.name} — ${kindConfig[credential.kind].label}, ${healthConfig[credential.health].label}`}
      className={cn(
        compact
          ? "flex items-center gap-3 px-3 py-2"
          : "flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-2 px-4 py-3",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-dim",
          compact ? "size-8" : "size-9",
        )}
      >
        <Icon className={compact ? "size-4" : "size-4.5"} aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-[13px] font-semibold text-ink">{credential.name}</span>
          <HealthChip health={credential.health} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10.5px] text-dim">
          <span>{cfg.label}</span>
          <span aria-hidden>·</span>
          <span>Owner: {credential.owner}</span>
          {showExpiry ? (
            <>
              <span aria-hidden>·</span>
              <span className={credential.health === "expired" ? "text-block" : "text-warn"}>
                {credential.health === "expired" ? "Expired" : "Expires"} {credential.expiresAt}
              </span>
            </>
          ) : null}
        </div>

        {!compact ? (
          <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-dim">
              <Clock className="size-3 shrink-0" aria-hidden />
              <dt className="sr-only">Last used</dt>
              <dd>Last used {credential.lastUsed}</dd>
            </div>
            <div className="flex items-center gap-1.5 text-dim">
              <Users className="size-3 shrink-0" aria-hidden />
              <dt className="sr-only">Shared with</dt>
              <dd className="truncate">
                {credential.sharedWith.length === 0
                  ? "Not shared"
                  : `Shared with ${credential.sharedWith.length} workflow${credential.sharedWith.length === 1 ? "" : "s"}`}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="mt-0.5 font-mono text-[10px] text-dim">
            Last used {credential.lastUsed} · {credential.sharedWith.length === 0 ? "not shared" : `shared ×${credential.sharedWith.length}`}
          </div>
        )}

        {!compact && credential.scopes && credential.scopes.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {credential.scopes.map((scope) => (
              <span
                key={scope}
                className="rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-dim"
              >
                {scope}
              </span>
            ))}
          </div>
        ) : null}

        {!compact && credential.sharedWith.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {credential.sharedWith.map((w) => (
              <span
                key={w}
                className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] text-dim"
              >
                {w}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export interface CredentialPickerProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  credentials: Credential[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  emptyLabel?: string;
}

/**
 * Selector de credenciales con filtro por nombre/tipo/owner — la mitad
 * "Picker" del catálogo (`CredentialCard/Picker`). Listbox accesible
 * (`role="listbox"`/`role="option"`, navegación con flechas) sobre filas
 * compactas de `CredentialCard`, para que health/owner/shared-with sean
 * visibles al elegir una credencial, no solo el nombre — evita que un
 * operador conecte un workflow a una credencial expirada o sobre-compartida
 * sin darse cuenta.
 */
export function CredentialPicker({
  credentials,
  selectedId,
  onSelect,
  emptyLabel = "No credentials match your search.",
  className,
  ...props
}: CredentialPickerProps) {
  const [query, setQuery] = React.useState("");
  const listRef = React.useRef<HTMLUListElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return credentials;
    return credentials.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q) ||
        kindConfig[c.kind].label.toLowerCase().includes(q),
    );
  }, [credentials, query]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    if (filtered.length === 0) return;
    const currentIndex = filtered.findIndex((c) => c.id === selectedId);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + delta + filtered.length) % filtered.length;
      onSelect?.(filtered[nextIndex].id);
    } else if (event.key === "Home") {
      event.preventDefault();
      onSelect?.(filtered[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      onSelect?.(filtered[filtered.length - 1].id);
    }
  }

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div className="border-b border-border-subtle bg-surface-header px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-dim" aria-hidden />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search credentials by name, owner, or type…"
            aria-label="Search credentials"
            className="h-8 bg-surface-2 ps-8 text-[12.5px]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-dim">{emptyLabel}</div>
      ) : (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Credentials"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="max-h-80 divide-y divide-border-subtle overflow-y-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
        >
          {filtered.map((credential) => {
            const isSelected = credential.id === selectedId;
            return (
              <li
                key={credential.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect?.(credential.id)}
                className={cn(
                  "cursor-pointer transition-colors",
                  isSelected ? "bg-accent-surface" : "hover:bg-surface-3/40",
                )}
              >
                <CredentialCard credential={credential} compact />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
