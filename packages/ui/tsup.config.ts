import { defineConfig } from "tsup";
import { resolve } from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  banner: { js: '"use client";' },
  external: [
    "react",
    "react-dom",
    /^@radix-ui\//,
    "radix-ui",
    "lucide-react",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
  ],
  esbuildOptions(options) {
    options.alias = { "@": resolve("src") };
  },
  onSuccess:
    "tailwindcss -i src/styles.css -o dist/styles.css --minify && tailwindcss -i src/reset.css -o dist/reset.css --minify",
});
