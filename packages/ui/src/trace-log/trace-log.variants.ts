import { cva } from "class-variance-authority";

export type Tone = "info" | "ok" | "review" | "warn" | "block";
export type Density = "comfortable" | "compact";

// border-l-{tone} y text-{tone} requieren --color-{tone} (mapeados en @theme inline).
export const rowVariants = cva("border-l-2 pl-3", {
  variants: {
    tone: {
      info: "border-info",
      ok: "border-ok",
      review: "border-review",
      warn: "border-warn",
      block: "border-block",
    },
  },
  defaultVariants: { tone: "info" },
});

export const toneText: Record<Tone, string> = {
  info: "text-info",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

export const bodyVariants = cva("flex flex-col px-3.5 py-3", {
  variants: { density: { comfortable: "gap-3", compact: "gap-1.5" } },
  defaultVariants: { density: "comfortable" },
});
