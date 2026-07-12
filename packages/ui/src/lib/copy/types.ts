import type { enCopy } from "./en.js";

// Canónico: la forma de en.ts ES el tipo. es.ts usa `satisfies CopyDict` para
// que el compilador rechace si falta una key o una función cambia de firma —
// sin motor de validación en runtime, sin boilerplate.
export type CopyDict = typeof enCopy;
export type Locale = "en" | "es";
