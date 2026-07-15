import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { BandGauge } from "./band-gauge.js";

describe("BandGauge", () => {
  it("expone role=meter con aria correctos", () => {
    render(<BandGauge value={3} max={6} label="Banda de readiness" />);
    const meter = screen.getByRole("meter", { name: "Banda de readiness" });
    expect(meter.getAttribute("aria-valuenow")).toBe("3");
    expect(meter.getAttribute("aria-valuemax")).toBe("6");
  });

  it("llena exactamente `value` segmentos de `max`", () => {
    const { container } = render(<BandGauge value={3} max={6} label="Banda" />);
    const segs = container.querySelectorAll("[data-seg]");
    expect(segs).toHaveLength(6);
    expect(container.querySelectorAll("[data-seg='filled']")).toHaveLength(3);
  });

  it("deriva tono: 5/6 ok · 3/6 warn · 1/6 block", () => {
    const { container: ok } = render(<BandGauge value={5} max={6} label="a" />);
    expect(ok.querySelector(".text-ok")).not.toBeNull();
    const { container: warn } = render(<BandGauge value={3} max={6} label="b" />);
    expect(warn.querySelector(".text-warn")).not.toBeNull();
    const { container: block } = render(<BandGauge value={1} max={6} label="c" />);
    expect(block.querySelector(".text-block")).not.toBeNull();
  });

  it("tone explícito gana a la derivación", () => {
    const { container } = render(<BandGauge value={5} max={6} label="d" tone="review" />);
    expect(container.querySelector(".text-review")).not.toBeNull();
    expect(container.querySelector(".text-ok")).toBeNull();
  });

  it("axe limpio", async () => {
    const { container } = render(
      <BandGauge value={3} max={6} label="Banda de readiness" hint="Banda 3 — Partial Readiness" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
