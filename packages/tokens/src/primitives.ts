// Cada color = "hexFallback | oklch(...)". El consumidor emite ambas líneas.
export const FONT = {
  sans: "'Manrope', ui-sans-serif, system-ui, sans-serif",
  display: "'Geist', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
};

// Motion: duración (ms) + easing (cubic-bezier). Agnóstico de tema — no varía entre light/dark.
// Curvas siguiendo Material 3 (standard = simétrica, emphasized = decelerate-heavy para entradas).
export const MOTION = {
  "duration-fast": "150ms",
  "duration-base": "200ms",
  "duration-slow": "300ms",
  "duration-slower": "500ms",
  "ease-standard": "cubic-bezier(0.2, 0, 0, 1)",
  "ease-emphasized": "cubic-bezier(0.3, 0, 0.1, 1)",
};

// Neutros anclados a hue 285, ΔL≈0.045. La rampa arranca fuera del negro puro
// (base 0.145, no 0.13) para que los escalones de elevación sean perceptibles:
// en L<0.14 el ojo colapsa todo a "negro" y las superficies dejan de leerse.
export const NEUTRAL = {
  "0": "#0a0a0e|oklch(0.145 0.008 285)",
  "1": "#101116|oklch(0.190 0.009 285)",
  "2": "#17181e|oklch(0.235 0.010 285)",
  "3": "#1f2027|oklch(0.280 0.012 285)",
  ink: "#f0f0f2|oklch(0.95 0.004 285)",
  dim: "#b4b4be|oklch(0.78 0.008 285)",
  faint: "#7b8799|oklch(0.58 0.016 285)",
  faintDeco: "#5a6478|oklch(0.50 0.034 264)",
};
