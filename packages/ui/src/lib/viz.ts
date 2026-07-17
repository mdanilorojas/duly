// Acceso a los data-viz tokens de @enregla-ui/duly-tokens (--viz-cat-*, --viz-seq-*).
// Devuelven referencias var() — el valor concreto lo resuelve el tema activo
// (cockpit/violet/light), así un chart cambia de tema sin re-render.
//
// Reglas de uso (validadas en packages/tokens/src/build.test.ts y documentadas
// en la story "Data-viz Tokens"):
// - Asignar slots categóricos EN ORDEN FIJO por entidad (el orden es el
//   mecanismo de seguridad CVD) — nunca ciclar ni repintar al filtrar.
// - Formas all-pairs (scatter/bubble/heatmap categórico): cap de 4 series;
//   después, "Other", facetear o etiquetar directo.
// - Serie 9 no existe: se pliega a "Other" — nunca generar un hue nuevo.
// - Alertas en charts usan los status tokens (ok/warn/block), nunca un slot
//   categórico — y siempre con icono/label, no color solo.

/** Slots categóricos disponibles. Debe coincidir con VIZ_CAT_SLOTS de @enregla-ui/duly-tokens. */
export const VIZ_CAT_SLOTS = 8;
/** Pasos de la rampa sequential. Debe coincidir con VIZ_SEQ_STEPS de @enregla-ui/duly-tokens. */
export const VIZ_SEQ_STEPS = 7;

/** Color categórico del slot `1..8` como referencia var() temable. */
export function vizCat(slot: number): string {
  if (!Number.isInteger(slot) || slot < 1 || slot > VIZ_CAT_SLOTS)
    throw new RangeError(`vizCat: slot ${slot} fuera de rango 1..${VIZ_CAT_SLOTS}`);
  return `var(--viz-cat-${slot})`;
}

/** Paso sequential `1..7` (1 recede hacia la superficie, 7 el más contrastado). */
export function vizSeq(step: number): string {
  if (!Number.isInteger(step) || step < 1 || step > VIZ_SEQ_STEPS)
    throw new RangeError(`vizSeq: step ${step} fuera de rango 1..${VIZ_SEQ_STEPS}`);
  return `var(--viz-seq-${step})`;
}

/** Los primeros `count` slots categóricos, en el orden fijo CVD-safe. */
export function vizCategorical(count: number): string[] {
  if (!Number.isInteger(count) || count < 1 || count > VIZ_CAT_SLOTS)
    throw new RangeError(`vizCategorical: count ${count} fuera de rango 1..${VIZ_CAT_SLOTS}`);
  return Array.from({ length: count }, (_, i) => vizCat(i + 1));
}
