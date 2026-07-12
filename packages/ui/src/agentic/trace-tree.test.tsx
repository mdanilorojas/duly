import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TraceTree, type TraceSpan } from "./trace-tree.js";

const nested: TraceSpan[] = [
  {
    id: "root",
    kind: "agent",
    name: "Orchestrator",
    startMs: 0,
    durationMs: 1000,
    children: [
      {
        id: "child-llm",
        kind: "llm",
        name: "LLM call",
        startMs: 10,
        durationMs: 200,
        tokens: { input: 100, output: 50 },
        costUsd: 0.01,
      },
      {
        id: "child-tool",
        kind: "tool",
        name: "Tool call",
        startMs: 220,
        durationMs: 40,
        costUsd: 0.001,
        children: [
          {
            id: "grandchild",
            kind: "retrieval",
            name: "Retrieval",
            startMs: 225,
            durationMs: 10,
            tokens: { input: 20, output: 5 },
            costUsd: 0.0002,
          },
        ],
      },
    ],
  },
];

describe("TraceTree — rollup", () => {
  it("suma costo y tokens de todas las ramas en el header (root + hijos + nietos)", () => {
    render(<TraceTree spans={nested} defaultOpenDepth={2} />);
    // 100+50+20+5 = 175 tok
    expect(screen.getByText("175 tok")).toBeDefined();
  });

  it("cada fila muestra el rollup de su propio subárbol, no solo su costo propio", () => {
    render(<TraceTree spans={nested} defaultOpenDepth={2} />);
    // "Tool call" (costUsd=0.001) + su hijo "grandchild" (costUsd=0.0002) = 0.0012 -> $0.0012 (4 decimales bajo $0.01)
    expect(screen.getByText("$0.0012")).toBeDefined();
  });
});

describe("TraceTree — colapso", () => {
  it("defaultOpenDepth=0 colapsa todo salvo raíces", () => {
    render(<TraceTree spans={nested} defaultOpenDepth={0} />);
    expect(screen.getByText("Orchestrator")).toBeDefined();
    expect(screen.queryByText("LLM call")).toBeNull();
  });

  it("expandir una fila colapsada revela sus hijos; volver a colapsar los oculta", async () => {
    render(<TraceTree spans={nested} defaultOpenDepth={0} />);
    await userEvent.click(screen.getByRole("button", { name: /expand orchestrator/i }));
    expect(screen.getByText("LLM call")).toBeDefined();
    await userEvent.click(screen.getByRole("button", { name: /collapse orchestrator/i }));
    expect(screen.queryByText("LLM call")).toBeNull();
  });

  it("el total del header no cambia al colapsar (el rollup no depende de qué esté visible)", async () => {
    render(<TraceTree spans={nested} defaultOpenDepth={2} />);
    expect(screen.getByText("175 tok")).toBeDefined();
    await userEvent.click(screen.getByRole("button", { name: /collapse orchestrator/i }));
    expect(screen.getByText("175 tok")).toBeDefined();
  });
});

describe("TraceTree — árbol grande (umbral de virtualización)", () => {
  it("con >50 spans visibles, el total del header sigue siendo la suma real (independiente de virtualización)", () => {
    const many: TraceSpan[] = Array.from({ length: 60 }, (_, i) => ({
      id: `s${i}`,
      kind: "tool" as const,
      name: `Span ${i}`,
      startMs: i * 10,
      durationMs: 5,
      tokens: { input: 10, output: 1 },
      costUsd: 0.0001,
    }));
    render(<TraceTree spans={many} defaultOpenDepth={2} />);
    // 60 * (10+1) = 660 tok
    expect(screen.getByText("660 tok")).toBeDefined();
  });
});

describe("TraceTree — a11y", () => {
  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<TraceTree spans={nested} defaultOpenDepth={2} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
