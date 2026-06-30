import { defineConfig } from "tsup";

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
    "lucide-react",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
  ],
  onSuccess:
    "tailwindcss -i src/styles.css -o dist/styles.css --minify && tailwindcss -i src/reset.css -o dist/reset.css --minify",
});
