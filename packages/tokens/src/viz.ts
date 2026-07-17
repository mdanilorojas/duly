// Data-viz tokens (área D del NORTH_STAR: "paleta categórica 3:1 sobre dark,
// sequential + alert"). Cada valor = "hexFallback|oklch(...)" como en themes.ts.
//
// Método (skill dataviz): el color de un chart se computa, no se elige a ojo.
// La paleta categórica fue validada con el validador de 6 checks contra las
// superficies REALES de cada tema (surface-2, donde viven los charts):
//   · dark (#17181e cockpit / #171320 violet): banda L 0.48–0.67, chroma ≥0.1,
//     CVD adjacent ΔE 8.4 (protan), normal-vision ΔE 19.3, contraste 8/8 ≥ 3:1.
//   · light (#f3f3f6): CVD 9.1 / normal 19.6; 4 slots quedan bajo 3:1 POR
//     DISEÑO → aplica la "relief rule": labels directos visibles o vista tabla.
//
// Reglas que el consumidor debe honrar (ver story "Data-viz Tokens"):
//   · El ORDEN de los slots es el mecanismo de seguridad CVD — asignar en orden
//     fijo por entidad, nunca ciclar ni repintar al filtrar.
//   · Formas all-pairs (scatter/bubble/heatmap categórico): cap de 4 series;
//     después, agrupar en "Other", facetear o etiquetar directo.
//   · Los tonos de status (ok/warn/block/info/review, LOCKED) son de alerta y
//     NUNCA se usan como "serie 5" — un status jamás impersona una serie.
export const VIZ_CAT_SLOTS = 8;
export const VIZ_SEQ_STEPS = 7;

// Mismos 8 hues en ambos modos, re-escalonados por superficie (no dos paletas).
const CAT_DARK = [
  "#3987e5|oklch(0.62 0.161 255)",
  "#008300|oklch(0.53 0.180 142)",
  "#d55181|oklch(0.62 0.171 1)",
  "#c98500|oklch(0.67 0.143 73)",
  "#199e70|oklch(0.62 0.128 163)",
  "#d95926|oklch(0.62 0.173 40)",
  "#9085e9|oklch(0.67 0.145 287)",
  // Rojo re-escalonado más oscuro que el de referencia (#e66767): a ΔE 5.2 de
  // `block` habría impersonado la alerta; en 0.59/0.164 queda a ΔE 12.7 de
  // block manteniendo 3.9:1 de contraste y ΔE 22+ con el slot violeta vecino.
  "#cc4b4f|oklch(0.59 0.164 22)",
];

const CAT_LIGHT = [
  "#2a78d6|oklch(0.58 0.163 256)",
  "#008300|oklch(0.53 0.180 142)",
  "#e87ba4|oklch(0.72 0.141 357)",
  "#eda100|oklch(0.76 0.161 75)",
  "#1baf7a|oklch(0.67 0.141 162)",
  "#eb6834|oklch(0.67 0.175 41)",
  "#4a3aa7|oklch(0.43 0.167 284)",
  "#e34948|oklch(0.62 0.191 25)",
];

// Sequential: UNA sola hue (la del accent del tema), L monotónica — paso 1
// recede hacia la superficie ("cerca de cero"), paso 7 es el más contrastado.
// Para rampas ORDINALES (marcas discretas ordenadas) empezar en el paso 2+.
const SEQ_COCKPIT = [
  "#004a4f|oklch(0.35 0.063 198)",
  "#006368|oklch(0.44 0.078 198)",
  "#007e83|oklch(0.53 0.092 198)",
  "#009a9e|oklch(0.62 0.106 198)",
  "#30b6ba|oklch(0.71 0.110 198)",
  "#56d3d7|oklch(0.80 0.110 198)",
  "#77f1f5|oklch(0.89 0.110 198)",
];

const SEQ_VIOLET = [
  "#462373|oklch(0.35 0.130 300)",
  "#5f3d8e|oklch(0.44 0.130 300)",
  "#7857ab|oklch(0.53 0.130 300)",
  "#9372c8|oklch(0.62 0.130 300)",
  "#ae8ee6|oklch(0.71 0.130 300)",
  "#cbaaff|oklch(0.80 0.122 300)",
  "#e8c7ff|oklch(0.89 0.084 300)",
];

const SEQ_LIGHT = [
  "#7af5f8|oklch(0.90 0.110 198)",
  "#5ad7da|oklch(0.81 0.110 198)",
  "#35b9bd|oklch(0.72 0.110 198)",
  "#009da1|oklch(0.63 0.107 198)",
  "#008186|oklch(0.54 0.093 198)",
  "#00666b|oklch(0.45 0.079 198)",
  "#004d52|oklch(0.36 0.065 198)",
];

export interface VizPalette {
  /** Slots categóricos 1..8, en el orden CVD-safe validado. */
  cat: string[];
  /** Rampa sequential 1..7 (hue del accent, L monotónica). */
  seq: string[];
}

// "Alert" del catálogo = los status tokens LOCKED de cada tema (ok/warn/block/
// info/review) — ya existen y ya están gateados; aquí no se duplican.
export const vizPalettes: Record<string, VizPalette> = {
  cockpit: { cat: CAT_DARK, seq: SEQ_COCKPIT },
  violet: { cat: CAT_DARK, seq: SEQ_VIOLET },
  light: { cat: CAT_LIGHT, seq: SEQ_LIGHT },
  ganapliego: { cat: CAT_LIGHT, seq: SEQ_LIGHT },
};
