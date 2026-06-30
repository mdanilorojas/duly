// Cada color = "hexFallback | oklch(...)". El consumidor emite ambas líneas.
export const FONT = {
  sans: "'Manrope', ui-sans-serif, system-ui, sans-serif",
  display: "'Geist', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
};

// Neutros anclados a hue 285, ΔL≈0.04
export const NEUTRAL = {
  "0": "#07070a|oklch(0.13 0.008 285)",
  "1": "#0c0d11|oklch(0.17 0.008 285)",
  "2": "#131418|oklch(0.21 0.010 285)",
  "3": "#191a1f|oklch(0.25 0.012 285)",
  ink: "#f0f0f2|oklch(0.95 0.004 285)",
  dim: "#b4b4be|oklch(0.78 0.008 285)",
  faint: "#7b8799|oklch(0.58 0.016 285)",
  faintDeco: "#5a6478|oklch(0.50 0.034 264)",
};
