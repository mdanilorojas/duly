import { describe, it, expect } from "vitest";
import { cn } from "./cn.js";

describe("cn", () => {
  it("mergea y dedup-resuelve clases tailwind en conflicto", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-ink", false && "hidden", "font-mono")).toBe("text-ink font-mono");
  });
});
