import "@testing-library/react";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

// jsdom no implementa ResizeObserver — lo requieren componentes basados en
// medición (React Flow). Mock mínimo para que sus tests no rompan.
if (!("ResizeObserver" in globalThis)) {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom no implementa Element.scrollIntoView — cmdk lo llama al montar/mover
// el ítem activo (Combobox). No-op mínimo para que sus tests no rompan.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}
