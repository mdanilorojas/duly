import { describe, it, expect } from "vitest";
import { vizCat, vizSeq, vizCategorical, VIZ_CAT_SLOTS, VIZ_SEQ_STEPS } from "./viz.js";

describe("viz helpers", () => {
  it("vizCat/vizSeq devuelven referencias var() temables", () => {
    expect(vizCat(1)).toBe("var(--viz-cat-1)");
    expect(vizCat(VIZ_CAT_SLOTS)).toBe(`var(--viz-cat-${VIZ_CAT_SLOTS})`);
    expect(vizSeq(VIZ_SEQ_STEPS)).toBe(`var(--viz-seq-${VIZ_SEQ_STEPS})`);
  });

  it("fuera de rango lanza RangeError — la serie 9 no existe, se pliega a Other", () => {
    expect(() => vizCat(0)).toThrow(RangeError);
    expect(() => vizCat(VIZ_CAT_SLOTS + 1)).toThrow(RangeError);
    expect(() => vizSeq(0)).toThrow(RangeError);
    expect(() => vizCategorical(VIZ_CAT_SLOTS + 1)).toThrow(RangeError);
  });

  it("vizCategorical preserva el orden fijo (mecanismo CVD)", () => {
    expect(vizCategorical(3)).toEqual(["var(--viz-cat-1)", "var(--viz-cat-2)", "var(--viz-cat-3)"]);
  });
});
