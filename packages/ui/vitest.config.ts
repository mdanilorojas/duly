import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  // Resuelve el alias `@/*` del tsconfig (que tsup ya honra) para que los
  // componentes que reutilizan primitivas (`@/components/ui/*`, `@/lib/*`)
  // sean testeables. Sin esto, un componente que importa una primitiva rompe
  // la suite (vite no lee tsconfig paths por defecto).
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts", "./src/test-setup.ts"], globals: true },
});
