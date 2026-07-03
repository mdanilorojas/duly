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
