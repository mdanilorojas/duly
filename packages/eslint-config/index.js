// Flat config compartido (ESLint 9). Base: TypeScript recomendado.
// El no-hex NO está aquí — vive en packages/ui (tokens usa hex como fuente).
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**"] },
  ...tseslint.configs.recommended,
);
