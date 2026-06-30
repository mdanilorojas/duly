// Lista canónica de keys semantic. Cada tema DEBE declararlas todas.
export const SEMANTIC_KEYS = [
  "bg-base", "bg-elevated", "surface-2", "surface-3", "surface-header", "surface-sunken",
  "ink", "dim", "faint", "faint-deco",
  "border-subtle", "border-default", "border-strong", "border-divider", "ring",
  "accent", "on-accent", "accent-surface", "accent-border",
  "accent-secondary", "on-accent-secondary",
  "ok", "on-ok", "review", "on-review", "warn", "on-warn", "block", "on-block", "info",
  "glow-seed",
] as const;

export type ThemeableTokenName = (typeof SEMANTIC_KEYS)[number];

// Hue de status + ring = system-owned (un cliente solo ajusta L, no rota hue).
export const LOCKED = new Set<string>(["ok", "review", "warn", "block", "info", "ring"]);
export const THEMEABLE = new Set<string>(SEMANTIC_KEYS.filter((k) => !LOCKED.has(k)));

export const STATUS_KEYS = ["ok", "review", "warn", "block", "info"] as const;

// [fg, bg, minRatio] verificados por tema.
export const CONTRAST_PAIRS: [string, string, number][] = [
  ["ink", "bg-base", 4.5], ["ink", "surface-2", 4.5], ["ink", "surface-3", 4.5],
  ["dim", "surface-2", 4.5], ["faint", "surface-2", 4.5],
  ["accent", "surface-2", 4.5], ["on-accent", "accent", 4.5],
  ["ok", "surface-2", 4.5], ["review", "surface-2", 4.5],
  ["warn", "surface-2", 4.5], ["block", "surface-2", 4.5],
  ["border-strong", "surface-2", 3.0], ["ring", "surface-2", 3.0],
  ["info", "surface-2", 4.5],
];
