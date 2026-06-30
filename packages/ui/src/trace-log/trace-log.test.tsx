import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TraceLog } from "./trace-log.js";

describe("TraceLog Root/Header/Body", () => {
  it("renderiza title + hint y aplica role=log", () => {
    render(
      <TraceLog.Root>
        <TraceLog.Header title="Pipeline de una consulta" hint="tu lista → mapa" />
        <TraceLog.Body />
      </TraceLog.Root>,
    );
    expect(screen.getByText("Pipeline de una consulta")).toBeDefined();
    expect(screen.getByText("tu lista → mapa")).toBeDefined();
    expect(screen.getByRole("log")).toBeDefined();
  });

  it("streaming activa aria-live=polite", () => {
    render(<TraceLog.Root streaming><TraceLog.Body /></TraceLog.Root>);
    expect(screen.getByRole("log").getAttribute("aria-live")).toBe("polite");
  });
});
