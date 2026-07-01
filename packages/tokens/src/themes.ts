import { NEUTRAL } from "./primitives.js";

// Cada valor = "hexFallback|oklch(...)". Set semantic COMPLETO por tema.
export const themes: Record<string, Record<string, string>> = {
  cockpit: {
    "bg-base": NEUTRAL["0"], "bg-elevated": NEUTRAL["1"],
    "surface-2": NEUTRAL["2"], "surface-3": NEUTRAL["3"],
    "surface-header": "#0e0f12|oklch(0.19 0.008 285)",
    "surface-sunken": "#0a0b10|oklch(0.15 0.008 285)",
    "ink": NEUTRAL.ink, "dim": NEUTRAL.dim, "faint": NEUTRAL.faint, "faint-deco": NEUTRAL.faintDeco,
    "border-subtle": "#1d2127|oklch(0.26 0.012 285)",
    "border-default": "#2e2e32|oklch(0.32 0.006 285)",
    "border-strong": "#666670|oklch(0.52 0.008 285)",
    "border-divider": "#23303a|oklch(0.31 0.02 241)",
    "ring": "#23d2d7|oklch(0.78 0.13 198)",
    "accent": "#23d2d7|oklch(0.78 0.13 198)", "on-accent": "#042427|oklch(0.22 0.03 198)",
    "accent-surface": "#0e2b2c|oklch(0.27 0.05 198)", "accent-border": "#1c5557|oklch(0.40 0.07 198)",
    "accent-secondary": "#8f9bff|oklch(0.74 0.13 275)", "on-accent-secondary": "#06091e|oklch(0.18 0.04 275)",
    "ok": "#39E0A0|oklch(0.81 0.16 162)", "on-ok": "#04231a|oklch(0.24 0.04 162)",
    "review": "#6cb8ff|oklch(0.76 0.13 256)", "on-review": "#04122b|oklch(0.20 0.05 256)",
    "warn": "#E8961A|oklch(0.74 0.15 70)", "on-warn": "#2a1600|oklch(0.22 0.05 70)",
    "block": "#ff6b78|oklch(0.72 0.18 19)", "on-block": "#2b0407|oklch(0.22 0.06 19)",
    "info": "#7e8390|oklch(0.61 0.02 270)",
    "glow-seed": "#5fe3e6|oklch(0.88 0.12 192)",
  },
  // Segundo tema: rota brand hue + sube superficies un punto. Status (LOCKED) intactos.
  test: {
    "bg-base": "#0a0810|oklch(0.14 0.012 300)", "bg-elevated": "#100d18|oklch(0.18 0.012 300)",
    "surface-2": "#171320|oklch(0.22 0.014 300)", "surface-3": "#1e1929|oklch(0.26 0.016 300)",
    "surface-header": "#130f1b|oklch(0.20 0.012 300)", "surface-sunken": "#0d0a14|oklch(0.16 0.012 300)",
    "ink": "#f1eff5|oklch(0.95 0.006 300)", "dim": "#b8b4c2|oklch(0.78 0.012 300)",
    "faint": "#827d97|oklch(0.58 0.022 300)", "faint-deco": "#5d566f|oklch(0.50 0.03 300)",
    "border-subtle": "#221d2b|oklch(0.27 0.014 300)", "border-default": "#332d3c|oklch(0.33 0.012 300)",
    "border-strong": "#6b6577|oklch(0.53 0.012 300)", "border-divider": "#352b40|oklch(0.32 0.02 300)",
    "ring": "#23d2d7|oklch(0.78 0.13 198)",
    "accent": "#b07cff|oklch(0.70 0.17 300)", "on-accent": "#190a2b|oklch(0.20 0.06 300)",
    "accent-surface": "#241433|oklch(0.27 0.06 300)", "accent-border": "#4a2c66|oklch(0.40 0.10 300)",
    "accent-secondary": "#7c8cff|oklch(0.70 0.16 275)", "on-accent-secondary": "#06091e|oklch(0.18 0.04 275)",
    "ok": "#39E0A0|oklch(0.81 0.16 162)", "on-ok": "#04231a|oklch(0.24 0.04 162)",
    "review": "#6cb8ff|oklch(0.76 0.13 256)", "on-review": "#04122b|oklch(0.20 0.05 256)",
    "warn": "#E8961A|oklch(0.74 0.15 70)", "on-warn": "#2a1600|oklch(0.22 0.05 70)",
    "block": "#ff6b78|oklch(0.72 0.18 19)", "on-block": "#2b0407|oklch(0.22 0.06 19)",
    "info": "#7e8390|oklch(0.61 0.02 270)",
    "glow-seed": "#c9a8ff|oklch(0.84 0.12 300)",
  },
  // Modo claro del brand por defecto: superficies claras, ink oscuro.
  // Status conservan su HUE (LOCKED) pero bajan L para pasar AA sobre superficies claras.
  light: {
    "bg-base": "#fbfcfd|oklch(0.99 0.002 285)", "bg-elevated": "#ffffff|oklch(1 0 0)",
    "surface-2": "#f3f3f6|oklch(0.965 0.004 285)", "surface-3": "#e9e9ed|oklch(0.935 0.006 285)",
    "surface-header": "#f6f6f9|oklch(0.975 0.004 285)", "surface-sunken": "#f0f0f3|oklch(0.955 0.004 285)",
    "ink": "#1e1f25|oklch(0.24 0.012 285)", "dim": "#51525a|oklch(0.44 0.014 285)",
    "faint": "#62626f|oklch(0.50 0.02 285)", "faint-deco": "#7d8699|oklch(0.62 0.03 264)",
    "border-subtle": "#e4e4e7|oklch(0.92 0.004 285)", "border-default": "#d4d4d8|oklch(0.87 0.006 285)",
    "border-strong": "#7f7f86|oklch(0.60 0.01 285)", "border-divider": "#c6d3dd|oklch(0.86 0.02 241)",
    "ring": "#008d92|oklch(0.58 0.11 198)",
    "accent": "#00797e|oklch(0.51 0.115 198)", "on-accent": "#ffffff|oklch(1 0 0)",
    "accent-surface": "#cef0f0|oklch(0.93 0.035 198)", "accent-border": "#80c6c7|oklch(0.78 0.07 198)",
    "accent-secondary": "#515bc3|oklch(0.52 0.16 275)", "on-accent-secondary": "#ffffff|oklch(1 0 0)",
    "ok": "#00794c|oklch(0.50 0.13 162)", "on-ok": "#ffffff|oklch(1 0 0)",
    "review": "#266bc0|oklch(0.53 0.15 256)", "on-review": "#ffffff|oklch(1 0 0)",
    "warn": "#945a00|oklch(0.52 0.12 70)", "on-warn": "#ffffff|oklch(1 0 0)",
    "block": "#c82d43|oklch(0.55 0.19 19)", "on-block": "#ffffff|oklch(1 0 0)",
    "info": "#646975|oklch(0.52 0.02 270)",
    "glow-seed": "#37bab6|oklch(0.72 0.11 192)",
  },
};

// Temas con superficies claras → color-scheme: light. El resto, dark.
export const LIGHT_THEMES = new Set<string>(["light"]);
