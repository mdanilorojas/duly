# ISO Console Gap Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the 6 new components + 1 extension + 4 recipe stories that make Duly DS fully cover the ISO 27001 console wireframes and user journey map.

**Architecture:** Generic presentational components in the existing `@duly/ui` package areas (`compliance/`, `agentic/`, `components/ui/`, new `kanban/`). ISO semantics enter only via props and story data. All components are controlled (no internal domain state) and follow the repo's Tone/copy/test conventions.

**Tech Stack:** React 18, Tailwind v4 token utilities, Radix (already present), dnd-kit (new dep, KanbanBoard only), vitest + Testing Library + jest-axe, Storybook.

**Spec:** `docs/superpowers/specs/2026-07-15-iso-console-gap-components-design.md`

## Global Constraints

- Repo: `C:\dev\Duly DS` (pnpm monorepo). Run all commands from repo root.
- Test one file: `pnpm --filter @duly/ui exec vitest run src/<path>.test.tsx` · full suite: `pnpm --filter @duly/ui test` · lint: `pnpm --filter @duly/ui lint`.
- `Tone = "info" | "ok" | "review" | "warn" | "block"` — import `type { Tone } from "../trace-log/trace-log.variants.js"` (adjust relative path per dir). Never raw colors.
- Only token utilities: `text-ok`, `text-warn`, `text-block`, `text-review`, `text-dim`, `text-faint`, `text-ink`, `text-accent`, `bg-surface-2`, `bg-surface-3`, `bg-bg-elevated`, `bg-accent-surface`, `border-border-subtle`, `border-border-default`, `border-accent-border`, opacity variants like `bg-ok/10`, `border-ok/40`.
- Tone→class lookups must be static `Record<Tone, string>` maps (Tailwind can't see dynamic class strings).
- Every user-facing string goes through `useCopy()` (`@/lib/copy/index.js`). Adding a key means editing **both** `src/lib/copy/en.ts` and `src/lib/copy/es.ts` — `es.ts` uses `satisfies CopyDict` so the compiler fails if one side is missing.
- Component files: kebab-case, named exports, props interface `extends React.ComponentProps<"el">` (or `Omit<...>`), JSDoc in Spanish stating purpose + NORTH_STAR area, internal imports end in `.js`.
- Tests co-located `*.test.tsx`; `toHaveNoViolations` is already registered in `packages/ui/vitest.setup.ts`.
- Stories: co-located next to domain components (`src/compliance/x.stories.tsx`); base-ui primitives get stories in `src/stories/`. Meta pattern: `title: "Area/Component Name/V001 Short Label"` (base primitives use `Primitives/Name`).
- Commit after every task (local only, **never push**). End commit messages with:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

## File Structure

```
packages/ui/src/
  components/ui/stepper.tsx            (Task 1, new)
  components/ui/stepper.test.tsx       (Task 1, new)
  stories/stepper.stories.tsx          (Task 1, new)
  compliance/band-gauge.tsx            (Task 2, new)
  compliance/band-gauge.test.tsx       (Task 2, new)
  compliance/band-gauge.stories.tsx    (Task 2, new)
  compliance/delta-list.tsx            (Task 3, new)
  compliance/delta-list.test.tsx       (Task 3, new)
  compliance/delta-list.stories.tsx    (Task 3, new)
  agentic/agent-status-matrix.tsx      (Task 4, modify)
  agentic/agent-status-matrix.test.tsx (Task 4, new)
  agentic/agent-status-matrix.stories.tsx (Task 4, new)
  agentic/connector-status.tsx         (Task 5, new)
  agentic/connector-status.test.tsx    (Task 5, new)
  agentic/connector-status.stories.tsx (Task 5, new)
  components/ui/dropzone.tsx           (Task 6, new)
  components/ui/dropzone.test.tsx      (Task 6, new)
  stories/dropzone.stories.tsx         (Task 6, new)
  kanban/kanban-board.tsx              (Task 7, new)
  kanban/kanban-board.test.tsx         (Task 7, new)
  kanban/kanban-board.stories.tsx      (Task 7, new)
  kanban/index.ts                      (Task 7, new)
  stories/recipes/soa-coverage-bar.stories.tsx (Task 8, new)
  stories/recipes/gap-list.stories.tsx         (Task 8, new)
  stories/recipes/scope-builder.stories.tsx    (Task 8, new)
  stories/recipes/iso-console.stories.tsx      (Task 9, new)
  lib/copy/en.ts + es.ts               (Tasks 1,3,4,5,6,7, modify)
  index.ts                             (Task 7, modify: kanban barrel)
  compliance/index.ts                  (Tasks 2,3, modify)
  agentic/index.ts                     (Task 5, modify)
NORTH_STAR.md                          (Task 10, modify)
```

---

### Task 1: Stepper (horizontal process stagebar)

**Files:**
- Create: `packages/ui/src/components/ui/stepper.tsx`
- Create: `packages/ui/src/components/ui/stepper.test.tsx`
- Create: `packages/ui/src/stories/stepper.stories.tsx`
- Modify: `packages/ui/src/lib/copy/en.ts`, `packages/ui/src/lib/copy/es.ts` (add `stepper` namespace)
- Modify: `packages/ui/src/index.ts` (add export line)

**Interfaces:**
- Produces: `Stepper({ steps: StepperStep[], onStepClick?: (index: number) => void })`, `StepperStep = { label: string; state: "done" | "current" | "pending" }`, `StepState`. Task 9 consumes.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/components/ui/stepper.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Stepper } from "./stepper.js";

const steps = [
  { label: "Acumulación", state: "done" as const },
  { label: "1ª Revisión", state: "current" as const },
  { label: "Feedback", state: "pending" as const },
];

describe("Stepper", () => {
  it("marca exactamente un paso con aria-current=step", () => {
    render(<Stepper steps={steps} />);
    const current = screen
      .getAllByRole("listitem")
      .filter((li) => li.getAttribute("aria-current") === "step");
    expect(current).toHaveLength(1);
    expect(current[0]!.textContent).toContain("1ª Revisión");
  });

  it("sin onStepClick no renderiza botones", () => {
    render(<Stepper steps={steps} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("onStepClick solo en pasos done, con su índice", async () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} onStepClick={onStepClick} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    await userEvent.click(buttons[0]!);
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it("axe limpio", async () => {
    const { container } = render(<Stepper steps={steps} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @duly/ui exec vitest run src/components/ui/stepper.test.tsx`
Expected: FAIL — `Cannot find module './stepper.js'`

- [ ] **Step 3: Add copy keys**

In `packages/ui/src/lib/copy/en.ts`, after the `appShell` namespace, add:

```ts
  stepper: {
    label: "Process steps",
    state: { done: "done", current: "current step", pending: "pending" },
  },
```

In `packages/ui/src/lib/copy/es.ts`, same position:

```ts
  stepper: {
    label: "Etapas del proceso",
    state: { done: "completada", current: "etapa actual", pending: "pendiente" },
  },
```

- [ ] **Step 4: Write minimal implementation**

`packages/ui/src/components/ui/stepper.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";

export type StepState = "done" | "current" | "pending";

export interface StepperStep {
  label: string;
  state: StepState;
}

export interface StepperProps extends Omit<React.ComponentProps<"ol">, "children"> {
  steps: StepperStep[];
  /** Si se provee, los pasos `done` son clickeables (navegación hacia atrás). */
  onStepClick?: (index: number) => void;
}

const PILL: Record<StepState, string> = {
  done: "text-ok border-ok/50",
  current: "text-accent border-accent-border bg-accent-surface",
  pending: "text-faint border-border-subtle",
};

/**
 * Stepper horizontal de etapas de proceso (pills numeradas) — la stagebar de
 * cualquier ciclo multi-etapa (readiness ISO, wizard, pipeline). Distinto de
 * `ApprovalChainStepper` (cadena vertical de aprobadores, área C). El estado
 * se codifica con número + color + texto sr-only + `aria-current`
 * (colorblind-safe).
 */
export function Stepper({ steps, onStepClick, className, ...props }: StepperProps) {
  const copy = useCopy();
  return (
    <ol aria-label={copy.stepper.label} className={cn("flex flex-wrap gap-1.5", className)} {...props}>
      {steps.map((step, i) => {
        const pill = cn(
          "whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[0.64rem]",
          PILL[step.state],
        );
        const clickable = step.state === "done" && onStepClick != null;
        return (
          <li key={`${step.label}-${i}`} aria-current={step.state === "current" ? "step" : undefined}>
            {clickable ? (
              <button type="button" className={cn(pill, "hover:border-ok")} onClick={() => onStepClick(i)}>
                {i + 1} {step.label}
              </button>
            ) : (
              <span className={pill}>
                {i + 1} {step.label}
              </span>
            )}
            <span className="sr-only">{copy.stepper.state[step.state]}</span>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @duly/ui exec vitest run src/components/ui/stepper.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 6: Export + story**

In `packages/ui/src/index.ts`, after the `progress.js` export line, add:

```ts
export * from "./components/ui/stepper.js";
```

Create `packages/ui/src/stories/stepper.stories.tsx`:

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Stepper } from "../components/ui/stepper.js";

const meta: Meta<typeof Stepper> = {
  title: "Primitives/Stepper",
  component: Stepper,
};
export default meta;
type S = StoryObj<typeof Stepper>;

// Las 9 etapas del ciclo de readiness ISO 27001 — el caso que motivó el
// componente: el consultor siempre sabe en qué punto del ciclo está.
const isoSteps = [
  { label: "Acumulación", state: "done" as const },
  { label: "Recopilación", state: "done" as const },
  { label: "Alcance", state: "done" as const },
  { label: "Inventario", state: "done" as const },
  { label: "1ª Revisión", state: "current" as const },
  { label: "Feedback", state: "pending" as const },
  { label: "Gate HITL", state: "pending" as const },
  { label: "Remediación", state: "pending" as const },
  { label: "2ª Revisión", state: "pending" as const },
];

export const IsoReadinessCycle: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <Stepper steps={isoSteps} onStepClick={(i) => console.log("goto", i)} />
    </div>
  ),
};
```

- [ ] **Step 7: Lint + commit**

Run: `pnpm --filter @duly/ui lint` — expected: clean.

```bash
git add packages/ui/src/components/ui/stepper.tsx packages/ui/src/components/ui/stepper.test.tsx packages/ui/src/stories/stepper.stories.tsx packages/ui/src/lib/copy/en.ts packages/ui/src/lib/copy/es.ts packages/ui/src/index.ts
git commit -m "feat(ui): Stepper — horizontal process stagebar"
```

---

### Task 2: BandGauge (discrete N-segment scale)

**Files:**
- Create: `packages/ui/src/compliance/band-gauge.tsx`
- Create: `packages/ui/src/compliance/band-gauge.test.tsx`
- Create: `packages/ui/src/compliance/band-gauge.stories.tsx`
- Modify: `packages/ui/src/compliance/index.ts`

**Interfaces:**
- Produces: `BandGauge({ value, max?=6, label, hint?, tone? })`. Task 9 consumes.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/compliance/band-gauge.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @duly/ui exec vitest run src/compliance/band-gauge.test.tsx`
Expected: FAIL — `Cannot find module './band-gauge.js'`

- [ ] **Step 3: Write minimal implementation**

`packages/ui/src/compliance/band-gauge.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "../trace-log/trace-log.variants.js";

const SEG_FILL: Record<Tone, string> = {
  info: "bg-info",
  ok: "bg-ok",
  review: "bg-review",
  warn: "bg-warn",
  block: "bg-block",
};

const NUM_TEXT: Record<Tone, string> = {
  info: "text-dim",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

export interface BandGaugeProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Valor actual, 1..max. */
  value: number;
  /** Total de segmentos. */
  max?: number;
  /** Nombre accesible del meter. */
  label: string;
  /** Texto secundario, ej. "Banda 3 — Partial Readiness" o la regla que produjo el valor. */
  hint?: string;
  /** Tono explícito; si se omite se deriva de value/max (≥.7 ok · ≥.4 warn · <.4 block). */
  tone?: Tone;
}

function bandTone(value: number, max: number): Tone {
  const frac = value / max;
  if (frac >= 0.7) return "ok";
  if (frac >= 0.4) return "warn";
  return "block";
}

/**
 * Escala discreta de N segmentos con número grande (área C) — veredicto de
 * banda (readiness ISO 1–6, madurez, score discreto). Complementa
 * `RatioGauge` (continuo): acá el valor ES uno de N escalones, no un
 * porcentaje. Número + segmentos + hint de texto: el tono nunca es el único
 * canal (colorblind-safe).
 */
export function BandGauge({ value, max = 6, label, hint, tone, className, ...props }: BandGaugeProps) {
  const t = tone ?? bandTone(value, max);
  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-4", className)}
      {...props}
    >
      <span className={cn("font-mono text-4xl font-bold leading-none", NUM_TEXT[t])}>
        {value}
        <span className="text-base text-faint">/{max}</span>
      </span>
      <div>
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: max }, (_, i) => (
            <span
              key={i}
              data-seg={i < value ? "filled" : "empty"}
              className={cn(
                "h-3.5 w-8 rounded-[2px] border border-border-subtle bg-surface-3",
                i < value && cn(SEG_FILL[t], "border-transparent"),
              )}
            />
          ))}
        </div>
        {hint ? <p className="mt-1.5 text-sm text-dim">{hint}</p> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @duly/ui exec vitest run src/compliance/band-gauge.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Export + story**

Append to `packages/ui/src/compliance/index.ts`:

```ts
export * from "./band-gauge.js";
```

Create `packages/ui/src/compliance/band-gauge.stories.tsx`:

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BandGauge } from "./band-gauge.js";

const meta: Meta<typeof BandGauge> = {
  title: "Compliance/Band Gauge/V001 Discrete Bands",
  component: BandGauge,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;
type S = StoryObj<typeof BandGauge>;

// Veredicto de banda de una corrida de readiness ISO 27001: banda 3 de 6,
// con la regla que la produjo como hint (procedencia sobre magia).
export const PartialReadiness: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="flex max-w-md flex-col gap-8">
        <BandGauge
          value={3}
          max={6}
          label="Banda de readiness"
          hint="Banda 3 — Partial Readiness · strongFrac=0.46 · coverage=1.00"
        />
        <BandGauge value={5} max={6} label="Banda alta" hint="Banda 5 — Audit Ready" />
        <BandGauge value={1} max={6} label="Banda baja" hint="Banda 1 — Initial" />
      </div>
    </div>
  ),
};
```

- [ ] **Step 6: Lint + commit**

Run: `pnpm --filter @duly/ui lint` — expected: clean.

```bash
git add packages/ui/src/compliance/band-gauge.tsx packages/ui/src/compliance/band-gauge.test.tsx packages/ui/src/compliance/band-gauge.stories.tsx packages/ui/src/compliance/index.ts
git commit -m "feat(ui): BandGauge — discrete N-segment verdict scale (area C)"
```

---

### Task 3: DeltaList (before → after diff rows)

**Files:**
- Create: `packages/ui/src/compliance/delta-list.tsx`
- Create: `packages/ui/src/compliance/delta-list.test.tsx`
- Create: `packages/ui/src/compliance/delta-list.stories.tsx`
- Modify: `packages/ui/src/compliance/index.ts`, `en.ts`, `es.ts`

**Interfaces:**
- Produces: `DeltaList({ entries: DeltaEntry[] })`, `DeltaEntry = { label, before: {label, tone}, after: {label, tone}, improved? }`. Task 9 consumes.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/compliance/delta-list.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DeltaList } from "./delta-list.js";

const entries = [
  { label: "ACCESS-CONTROL", before: { label: "missing", tone: "block" as const }, after: { label: "missing", tone: "block" as const } },
  { label: "BACKUP", before: { label: "missing", tone: "block" as const }, after: { label: "partial", tone: "warn" as const }, improved: true },
];

describe("DeltaList", () => {
  it("renderiza una fila por entrada con before y after", () => {
    render(<DeltaList entries={entries} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("BACKUP")).toBeDefined();
    expect(screen.getByText("partial")).toBeDefined();
  });

  it("marca la mejora con texto accesible, no solo ▲", () => {
    render(<DeltaList entries={entries} />);
    expect(screen.getByText("improved")).toBeDefined(); // sr-only, copy en
  });

  it("sin improved no hay marca", () => {
    render(<DeltaList entries={[entries[0]!]} />);
    expect(screen.queryByText("improved")).toBeNull();
  });

  it("axe limpio", async () => {
    const { container } = render(<DeltaList entries={entries} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @duly/ui exec vitest run src/compliance/delta-list.test.tsx`
Expected: FAIL — `Cannot find module './delta-list.js'`

- [ ] **Step 3: Add copy keys**

`en.ts` (after `stepper`): `deltaList: { improved: "improved" },`
`es.ts` (same position): `deltaList: { improved: "mejoró" },`

- [ ] **Step 4: Write minimal implementation**

`packages/ui/src/compliance/delta-list.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

const CHIP: Record<Tone, string> = {
  info: "text-dim border-border-default bg-surface-3",
  ok: "text-ok border-ok/40 bg-ok/10",
  review: "text-review border-review/40 bg-review/10",
  warn: "text-warn border-warn/40 bg-warn/10",
  block: "text-block border-block/40 bg-block/10",
};

export interface DeltaEntry {
  label: string;
  before: { label: string; tone: Tone };
  after: { label: string; tone: Tone };
  /** Mejora explícita — el DS no infiere ranking de tonos. */
  improved?: boolean;
}

export interface DeltaListProps extends Omit<React.ComponentProps<"ul">, "children"> {
  entries: DeltaEntry[];
}

/**
 * Lista antes → después entre dos corridas/estados (área C) — presenta el
 * diff que computa el consumidor (p. ej. fold diffRuns): qué área subió,
 * qué quedó igual. La mejora es explícita (`improved`) y se marca con ▲ +
 * texto sr-only, nunca solo color.
 */
export function DeltaList({ entries, className, ...props }: DeltaListProps) {
  const copy = useCopy();
  return (
    <ul className={cn("flex flex-col gap-2", className)} {...props}>
      {entries.map((e) => (
        <li
          key={e.label}
          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2.5 rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-sm"
        >
          <span className="text-ink">{e.label}</span>
          <span className={cn("rounded-full border px-2 py-px font-mono text-[0.68rem]", CHIP[e.before.tone])}>
            {e.before.label}
          </span>
          <span aria-hidden className="text-faint">
            →
          </span>
          <span className={cn("rounded-full border px-2 py-px font-mono text-[0.68rem]", CHIP[e.after.tone])}>
            {e.after.label}
            {e.improved ? (
              <>
                {" "}
                <span aria-hidden>▲</span>
                <span className="sr-only">{copy.deltaList.improved}</span>
              </>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @duly/ui exec vitest run src/compliance/delta-list.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 6: Export + story**

Append to `packages/ui/src/compliance/index.ts`:

```ts
export * from "./delta-list.js";
```

Create `packages/ui/src/compliance/delta-list.stories.tsx`:

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DeltaList } from "./delta-list.js";

const meta: Meta<typeof DeltaList> = {
  title: "Compliance/Delta List/V001 Run Diff",
  component: DeltaList,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;
type S = StoryObj<typeof DeltaList>;

// diffRuns R1 → R2 de un engagement ISO 27001: el avance, medido.
export const RunDiff: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <DeltaList
        className="max-w-lg"
        entries={[
          { label: "ACCESS-CONTROL", before: { label: "missing", tone: "block" }, after: { label: "missing", tone: "block" } },
          { label: "BACKUP", before: { label: "missing", tone: "block" }, after: { label: "partial", tone: "warn" }, improved: true },
          { label: "TRAINING", before: { label: "weak", tone: "warn" }, after: { label: "strong", tone: "ok" }, improved: true },
        ]}
      />
    </div>
  ),
};
```

- [ ] **Step 7: Lint + commit**

Run: `pnpm --filter @duly/ui lint` — expected: clean.

```bash
git add packages/ui/src/compliance/delta-list.tsx packages/ui/src/compliance/delta-list.test.tsx packages/ui/src/compliance/delta-list.stories.tsx packages/ui/src/compliance/index.ts packages/ui/src/lib/copy/en.ts packages/ui/src/lib/copy/es.ts
git commit -m "feat(ui): DeltaList — before/after run diff rows (area C)"
```

---

### Task 4: AgentStatusMatrix extension (compact density, critical, onSelectItem)

**Files:**
- Modify: `packages/ui/src/agentic/agent-status-matrix.tsx`
- Create: `packages/ui/src/agentic/agent-status-matrix.test.tsx`
- Create: `packages/ui/src/agentic/agent-status-matrix.stories.tsx`
- Modify: `en.ts`, `es.ts` (add `statusMatrix` namespace)

**Interfaces:**
- Consumes: current `AgentStatusMatrix({ items: {code, label, tone}[] })` — API must stay intact.
- Produces: adds `AgentStatusEntry.critical?: boolean`, `density?: "default" | "compact"`, `onSelectItem?: (item: AgentStatusEntry) => void`. Task 9 consumes compact mode.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/agentic/agent-status-matrix.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AgentStatusMatrix } from "./agent-status-matrix.js";

const items = [
  { code: "SCOPE", label: "Alcance del SGSI", tone: "ok" as const },
  { code: "ACCESS-CTRL", label: "Control de acceso", tone: "block" as const, critical: true },
];

describe("AgentStatusMatrix — API previa intacta", () => {
  it("renderiza lista con una celda por item (default density)", () => {
    render(<AgentStatusMatrix items={items} />);
    expect(screen.getByRole("list")).toBeDefined();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Alcance del SGSI")).toBeDefined();
  });

  it("sin onSelectItem no hay botones", () => {
    render(<AgentStatusMatrix items={items} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("AgentStatusMatrix — extensión", () => {
  it("density=compact renderiza celdas compactas (code visible, sin label largo)", () => {
    render(<AgentStatusMatrix items={items} density="compact" />);
    expect(screen.getByText("ACCESS-CTRL")).toBeDefined();
    expect(screen.queryByText("Control de acceso")).toBeNull();
  });

  it("critical expone texto accesible", () => {
    render(<AgentStatusMatrix items={items} density="compact" />);
    expect(screen.getByText("critical")).toBeDefined(); // sr-only, copy en
  });

  it("onSelectItem convierte celdas en botones y entrega el item", async () => {
    const onSelectItem = vi.fn();
    render(<AgentStatusMatrix items={items} onSelectItem={onSelectItem} />);
    await userEvent.click(screen.getAllByRole("button")[0]!);
    expect(onSelectItem).toHaveBeenCalledWith(items[0]);
  });

  it("axe limpio en compact + critical", async () => {
    const { container } = render(<AgentStatusMatrix items={items} density="compact" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @duly/ui exec vitest run src/agentic/agent-status-matrix.test.tsx`
Expected: FAIL — compact/critical/onSelectItem cases (the two "API previa" tests PASS).

- [ ] **Step 3: Add copy keys**

`en.ts`: `statusMatrix: { critical: "critical" },`
`es.ts`: `statusMatrix: { critical: "crítica" },`

- [ ] **Step 4: Extend the component**

Replace the body of `packages/ui/src/agentic/agent-status-matrix.tsx` — keep `swatchBg`/`swatchBorder`/`swatchText` maps and the existing imports, add `useCopy` import, extend interfaces, branch on density. Full new content below the maps:

```tsx
export interface AgentStatusEntry {
  /** Código corto, ej. "cód 3" o "RE-03". */
  code: string;
  /** Nombre del estatus, ej. "Liberado". */
  label: string;
  /** Tono semántico del sistema (5 estados: info/ok/review/warn/block). */
  tone: Tone;
  /** Marca la celda como crítica: borde reforzado + ⚠ con texto sr-only. */
  critical?: boolean;
}

export interface AgentStatusMatrixProps extends React.ComponentProps<"div"> {
  items: AgentStatusEntry[];
  /** "compact": celda densa tipo heatmap (código + tono), para matrices de 10+ áreas. */
  density?: "default" | "compact";
  /** Si se provee, el contenido de cada celda es un botón. */
  onSelectItem?: (item: AgentStatusEntry) => void;
}

/**
 * Grid de estatus operacionales/legales de agentes o entidades (predios,
 * runs, documentos, áreas de un SGSI). Cada entrada usa uno de los 5 tonos
 * semánticos del sistema — nunca color crudo — para que sea consistente
 * entre industrias. `density="compact"` la vuelve heatmap densa (p. ej. las
 * 13 áreas de un assessment ISO); `critical` marca celdas que piden acción
 * con ⚠ + texto accesible, no solo color.
 */
export function AgentStatusMatrix({
  items,
  density = "default",
  onSelectItem,
  className,
  ...props
}: AgentStatusMatrixProps) {
  const copy = useCopy();
  const compact = density === "compact";

  return (
    <div
      role="list"
      aria-label="Matriz de estatus"
      className={cn(
        compact
          ? "grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2"
          : "grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2.5",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const cell = compact ? (
          <>
            <span className="font-mono text-[10px] uppercase tracking-wide text-dim">{item.code}</span>
            <span className={cn("mt-0.5 block font-mono text-[10px]", swatchText[item.tone])}>
              {item.tone}
              {item.critical ? (
                <>
                  {" "}
                  <span aria-hidden>⚠</span>
                  <span className="sr-only">{copy.statusMatrix.critical}</span>
                </>
              ) : null}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-2.5">
            <span aria-hidden className={cn("size-[22px] shrink-0 rounded-[7px]", swatchBg[item.tone])} />
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wide text-dim">{item.code}</div>
              <div className="truncate text-[12.5px] font-semibold leading-tight text-ink">{item.label}</div>
              <div className={cn("mt-0.5 font-mono text-[10px]", swatchText[item.tone])}>
                {item.tone}
                {item.critical ? (
                  <>
                    {" "}
                    <span aria-hidden>⚠</span>
                    <span className="sr-only">{copy.statusMatrix.critical}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        );

        const cellClass = cn(
          "rounded-[11px] border border-border-subtle border-s-[3px] bg-surface-2",
          compact ? "px-2.5 py-2" : "px-3 py-2.5",
          swatchBorder[item.tone],
          item.critical && "border-block/60",
        );

        return (
          <div role="listitem" key={`${item.code}-${item.label}`} className={cellClass}>
            {onSelectItem ? (
              <button type="button" className="block w-full text-left" onClick={() => onSelectItem(item)}>
                {cell}
              </button>
            ) : (
              cell
            )}
          </div>
        );
      })}
    </div>
  );
}
```

Add the import at top of file: `import { useCopy } from "@/lib/copy/index.js";`

Note: default (non-compact) markup must stay visually identical to the current implementation — only the `critical` mark is new.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @duly/ui exec vitest run src/agentic/agent-status-matrix.test.tsx`
Expected: PASS (7 tests)

- [ ] **Step 6: Story**

Create `packages/ui/src/agentic/agent-status-matrix.stories.tsx`:

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AgentStatusMatrix } from "./agent-status-matrix.js";

const meta: Meta<typeof AgentStatusMatrix> = {
  title: "Agentic/Agent Status Matrix/V002 Compact Heatmap",
  component: AgentStatusMatrix,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;
type S = StoryObj<typeof AgentStatusMatrix>;

// Las 13 áreas de un SGSI ISO 27001 coloreadas por veredicto de la corrida.
// strong→ok · partial→warn · missing→block · revisión humana→review.
const sgsiAreas = [
  { code: "SCOPE", label: "Alcance", tone: "ok" as const },
  { code: "POLICY-MS", label: "Política del SGSI", tone: "ok" as const },
  { code: "RISK", label: "Gestión de riesgos", tone: "warn" as const },
  { code: "SOA", label: "Declaración de aplicabilidad", tone: "warn" as const },
  { code: "OBJECTIVES", label: "Objetivos", tone: "ok" as const },
  { code: "INT-AUDIT", label: "Auditoría interna", tone: "ok" as const },
  { code: "MGMT-REVIEW", label: "Revisión por dirección", tone: "warn" as const },
  { code: "CORRECTIVE", label: "Acciones correctivas", tone: "review" as const },
  { code: "POLICY", label: "Políticas operativas", tone: "ok" as const },
  { code: "ACCESS-CTRL", label: "Control de acceso", tone: "block" as const, critical: true },
  { code: "BACKUP", label: "Respaldos", tone: "warn" as const },
  { code: "SUPPLIER", label: "Proveedores", tone: "block" as const },
  { code: "TRAINING", label: "Capacitación", tone: "ok" as const },
];

export const CompactSgsiHeatmap: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentStatusMatrix
        items={sgsiAreas}
        density="compact"
        onSelectItem={(item) => console.log("drill-down", item.code)}
      />
    </div>
  ),
};

export const DefaultDensityUnchanged: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentStatusMatrix items={sgsiAreas.slice(0, 4)} />
    </div>
  ),
};
```

- [ ] **Step 7: Full agentic suite + lint + commit**

Run: `pnpm --filter @duly/ui exec vitest run src/agentic` — expected: all PASS (no regression).
Run: `pnpm --filter @duly/ui lint` — expected: clean.

```bash
git add packages/ui/src/agentic/agent-status-matrix.tsx packages/ui/src/agentic/agent-status-matrix.test.tsx packages/ui/src/agentic/agent-status-matrix.stories.tsx packages/ui/src/lib/copy/en.ts packages/ui/src/lib/copy/es.ts
git commit -m "feat(ui): AgentStatusMatrix compact density + critical flag + onSelectItem"
```

---

### Task 5: ConnectorStatus (ingestion sources)

**Files:**
- Create: `packages/ui/src/agentic/connector-status.tsx`
- Create: `packages/ui/src/agentic/connector-status.test.tsx`
- Create: `packages/ui/src/agentic/connector-status.stories.tsx`
- Modify: `packages/ui/src/agentic/index.ts`, `en.ts`, `es.ts`

**Interfaces:**
- Produces: `ConnectorStatus({ connectors: ConnectorEntry[] })`, `ConnectorEntry = { id, name, kind, state: "connected"|"syncing"|"error"|"paused", lastSync?, docCount? }`.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/agentic/connector-status.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ConnectorStatus } from "./connector-status.js";

const connectors = [
  { id: "sp", name: "SharePoint /Compliance", kind: "SharePoint", state: "connected" as const, lastSync: "hace 4 min", docCount: 148 },
  { id: "fs", name: "evidencias/", kind: "carpeta local", state: "syncing" as const },
  { id: "s3", name: "backup-logs", kind: "S3", state: "error" as const },
  { id: "gd", name: "Drive legal", kind: "Google Drive", state: "paused" as const },
];

describe("ConnectorStatus", () => {
  it("renderiza una fila por conector con etiqueta de estado en texto", () => {
    render(<ConnectorStatus connectors={connectors} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("Connected")).toBeDefined();
    expect(screen.getByText("Syncing…")).toBeDefined();
    expect(screen.getByText("Error")).toBeDefined();
    expect(screen.getByText("Paused")).toBeDefined();
  });

  it("muestra docCount y lastSync cuando existen", () => {
    render(<ConnectorStatus connectors={connectors} />);
    expect(screen.getByText("148 docs")).toBeDefined();
    expect(screen.getByText("hace 4 min")).toBeDefined();
  });

  it("axe limpio", async () => {
    const { container } = render(<ConnectorStatus connectors={connectors} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @duly/ui exec vitest run src/agentic/connector-status.test.tsx`
Expected: FAIL — `Cannot find module './connector-status.js'`

- [ ] **Step 3: Add copy keys**

`en.ts`:

```ts
  connectorStatus: {
    connected: "Connected",
    syncing: "Syncing…",
    error: "Error",
    paused: "Paused",
    docCount: (n: number) => `${n} docs`,
  },
```

`es.ts`:

```ts
  connectorStatus: {
    connected: "Conectado",
    syncing: "Sincronizando…",
    error: "Error",
    paused: "Pausado",
    docCount: (n: number) => `${n} docs`,
  },
```

- [ ] **Step 4: Write minimal implementation**

`packages/ui/src/agentic/connector-status.tsx`:

```tsx
import * as React from "react";
import { Check, Loader2, X, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";

export type ConnectorState = "connected" | "syncing" | "error" | "paused";

export interface ConnectorEntry {
  id: string;
  name: string;
  /** Tipo de fuente, ej. "SharePoint", "carpeta local", "S3". */
  kind: string;
  state: ConnectorState;
  /** Marca legible, ej. "hace 4 min". */
  lastSync?: string;
  docCount?: number;
}

interface StateConfig {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  chip: string;
  spin?: boolean;
}

const STATE: Record<ConnectorState, StateConfig> = {
  connected: { icon: Check, chip: "text-ok border-ok/50" },
  syncing: { icon: Loader2, chip: "text-review border-review/50", spin: true },
  error: { icon: X, chip: "text-block border-block/50" },
  paused: { icon: Pause, chip: "text-dim border-border-default" },
};

/**
 * Estado de fuentes de ingesta (área B) — los SourceConnector de una corrida:
 * de dónde entran los documentos, cuándo sincronizó cada fuente y cuál está
 * rota. Estado no binario connected/syncing/error/paused con ícono + color +
 * etiqueta de texto (colorblind-safe, principio #1).
 */
export function ConnectorStatus({
  connectors,
  className,
  ...props
}: { connectors: ConnectorEntry[] } & Omit<React.ComponentProps<"ul">, "children">) {
  const copy = useCopy();
  return (
    <ul className={cn("flex flex-col gap-2", className)} {...props}>
      {connectors.map((c) => {
        const cfg = STATE[c.state];
        const Icon = cfg.icon;
        return (
          <li
            key={c.id}
            className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2.5 rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-sm"
          >
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-px font-mono text-[0.66rem]",
                cfg.chip,
              )}
            >
              <Icon aria-hidden className={cn("size-3", cfg.spin && "animate-spin")} />
              {copy.connectorStatus[c.state]}
            </span>
            <span className="min-w-0 truncate text-ink">
              {c.name} <span className="text-faint">· {c.kind}</span>
            </span>
            <span className="font-mono text-[0.66rem] text-faint">{c.lastSync ?? "—"}</span>
            <span className="font-mono text-[0.66rem] text-dim">
              {c.docCount != null ? copy.connectorStatus.docCount(c.docCount) : "—"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @duly/ui exec vitest run src/agentic/connector-status.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Export + story**

Append to `packages/ui/src/agentic/index.ts`:

```ts
export * from "./connector-status.js";
```

Create `packages/ui/src/agentic/connector-status.stories.tsx`:

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ConnectorStatus } from "./connector-status.js";

const meta: Meta<typeof ConnectorStatus> = {
  title: "Agentic/Connector Status/V001 Ingestion Sources",
  component: ConnectorStatus,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;
type S = StoryObj<typeof ConnectorStatus>;

// Data room de un engagement ISO 27001: ingesta determinista desde fuentes,
// no carga manual. La fuente rota se ve — jamás falla en silencio.
export const IsoDataRoom: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <ConnectorStatus
        className="max-w-2xl"
        connectors={[
          { id: "sp", name: "SharePoint /Compliance", kind: "SharePoint", state: "connected", lastSync: "hace 4 min", docCount: 148 },
          { id: "fs", name: "evidencias/", kind: "carpeta local", state: "syncing", lastSync: "ahora", docCount: 12 },
          { id: "s3", name: "backup-logs", kind: "S3", state: "error", lastSync: "hace 2 h" },
          { id: "gd", name: "Drive legal", kind: "Google Drive", state: "paused", lastSync: "ayer", docCount: 31 },
        ]}
      />
    </div>
  ),
};
```

- [ ] **Step 7: Lint + commit**

Run: `pnpm --filter @duly/ui lint` — expected: clean.

```bash
git add packages/ui/src/agentic/connector-status.tsx packages/ui/src/agentic/connector-status.test.tsx packages/ui/src/agentic/connector-status.stories.tsx packages/ui/src/agentic/index.ts packages/ui/src/lib/copy/en.ts packages/ui/src/lib/copy/es.ts
git commit -m "feat(ui): ConnectorStatus — ingestion source health rows (area B)"
```

---

### Task 6: Dropzone

**Files:**
- Create: `packages/ui/src/components/ui/dropzone.tsx`
- Create: `packages/ui/src/components/ui/dropzone.test.tsx`
- Create: `packages/ui/src/stories/dropzone.stories.tsx`
- Modify: `packages/ui/src/index.ts`, `en.ts`, `es.ts`

**Interfaces:**
- Produces: `Dropzone({ onFiles: (files: File[]) => void, accept?, multiple?=true, disabled?, label?, hint? })`. Task 9 consumes.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/components/ui/dropzone.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { Dropzone } from "./dropzone.js";

const file = new File(["contenido"], "politica-accesos.pdf", { type: "application/pdf" });

describe("Dropzone", () => {
  it("drop dispara onFiles con los File", () => {
    const onFiles = vi.fn();
    render(<Dropzone onFiles={onFiles} />);
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("seleccionar por input dispara onFiles", () => {
    const onFiles = vi.fn();
    const { container } = render(<Dropzone onFiles={onFiles} />);
    const input = container.querySelector<HTMLInputElement>("input[type=file]")!;
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("disabled: drop no dispara onFiles", () => {
    const onFiles = vi.fn();
    render(<Dropzone onFiles={onFiles} disabled />);
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [file] } });
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("drop vacío no dispara onFiles", () => {
    const onFiles = vi.fn();
    render(<Dropzone onFiles={onFiles} />);
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [] } });
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("axe limpio", async () => {
    const { container } = render(<Dropzone onFiles={() => {}} hint="PDF, DOCX, XLSX" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @duly/ui exec vitest run src/components/ui/dropzone.test.tsx`
Expected: FAIL — `Cannot find module './dropzone.js'`

- [ ] **Step 3: Add copy keys**

`en.ts`: `dropzone: { label: "Drop files here or click to browse" },`
`es.ts`: `dropzone: { label: "Arrastra archivos aquí o haz clic para elegir" },`

- [ ] **Step 4: Write minimal implementation**

`packages/ui/src/components/ui/dropzone.tsx`:

```tsx
import * as React from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";

export interface DropzoneProps
  extends Omit<React.ComponentProps<"button">, "onDrop" | "children" | "type"> {
  onFiles: (files: File[]) => void;
  /** Pasa directo al `<input type="file">`. No filtra el drop — la app valida. */
  accept?: string;
  multiple?: boolean;
  /** Título visible; default por copy. */
  label?: string;
  hint?: string;
}

/**
 * Zona de carga presentacional — data rooms, ingesta manual de evidencia.
 * Estados idle/drag-over/disabled; toda la zona es un botón focusable y el
 * `<input type="file">` oculto es el fallback accesible (Enter/Space abre el
 * picker). Cero lógica de upload/hash/custodia: eso es de la app.
 */
export function Dropzone({
  onFiles,
  accept,
  multiple = true,
  disabled,
  label,
  hint,
  className,
  ...props
}: DropzoneProps) {
  const copy = useCopy();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);

  const emit = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (!disabled) emit(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border-default bg-bg-elevated px-6 py-8 text-center transition-colors",
          "hover:border-accent-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
          over && "border-accent-border bg-accent-surface",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...props}
      >
        <Upload aria-hidden className="size-5 text-accent" />
        <span className="text-sm font-medium text-ink">{label ?? copy.dropzone.label}</span>
        {hint ? <span className="text-xs text-dim">{hint}</span> : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={(e) => {
          emit(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
    </>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @duly/ui exec vitest run src/components/ui/dropzone.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 6: Export + story**

In `packages/ui/src/index.ts`, after the `stepper.js` line:

```ts
export * from "./components/ui/dropzone.js";
```

Create `packages/ui/src/stories/dropzone.stories.tsx`:

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dropzone } from "../components/ui/dropzone.js";

const meta: Meta<typeof Dropzone> = {
  title: "Primitives/Dropzone",
  component: Dropzone,
};
export default meta;
type S = StoryObj<typeof Dropzone>;

export const DataRoom: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="max-w-md">
        <Dropzone
          onFiles={(files) => console.log("recibidos", files.map((f) => f.name))}
          accept=".pdf,.docx,.xlsx"
          hint="PDF, DOCX, XLSX · cada doc recibe SHA-256 y evento de custodia"
        />
      </div>
    </div>
  ),
};
```

- [ ] **Step 7: Lint + commit**

Run: `pnpm --filter @duly/ui lint` — expected: clean.

```bash
git add packages/ui/src/components/ui/dropzone.tsx packages/ui/src/components/ui/dropzone.test.tsx packages/ui/src/stories/dropzone.stories.tsx packages/ui/src/index.ts packages/ui/src/lib/copy/en.ts packages/ui/src/lib/copy/es.ts
git commit -m "feat(ui): Dropzone — presentational file drop primitive"
```

---

### Task 7: KanbanBoard + dnd-kit

**Files:**
- Create: `packages/ui/src/kanban/kanban-board.tsx`
- Create: `packages/ui/src/kanban/kanban-board.test.tsx`
- Create: `packages/ui/src/kanban/kanban-board.stories.tsx`
- Create: `packages/ui/src/kanban/index.ts`
- Modify: `packages/ui/package.json` (via pnpm add), `packages/ui/src/index.ts`, `en.ts`, `es.ts`

**Interfaces:**
- Produces: `KanbanBoard({ columns: KanbanColumn[], onMove?: (ticketId, toColumn, index) => void })`, `KanbanColumn = { id, title, tickets: KanbanTicket[] }`, `KanbanTicket = { id, title, meta?, tone? }`, plus exported pure helper `resolveMove(activeId, overId, columns)`. Task 9 consumes.

- [ ] **Step 1: Install dnd-kit**

Run: `pnpm --filter @duly/ui add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
Expected: three deps added to `packages/ui/package.json`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/kanban/kanban-board.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { KanbanBoard, resolveMove, type KanbanColumn } from "./kanban-board.js";

const columns: KanbanColumn[] = [
  {
    id: "open",
    title: "Abierto",
    tickets: [
      { id: "t1", title: "Implementar MFA", meta: "ACCESS-CONTROL · crítica", tone: "block" },
      { id: "t2", title: "Evaluar proveedores", meta: "SUPPLIER · crítica", tone: "block" },
    ],
  },
  { id: "doing", title: "En remediación", tickets: [{ id: "t3", title: "Completar SoA", tone: "warn" }] },
  { id: "done", title: "Re-evidenciado", tickets: [] },
];

describe("resolveMove", () => {
  it("drop sobre una columna → al final de esa columna", () => {
    expect(resolveMove("t1", "doing", columns)).toEqual({ toColumn: "doing", index: 1 });
  });

  it("drop sobre otro ticket → columna e índice de ese ticket", () => {
    expect(resolveMove("t1", "t3", columns)).toEqual({ toColumn: "doing", index: 0 });
  });

  it("drop sobre sí mismo o sobre nada → null", () => {
    expect(resolveMove("t1", "t1", columns)).toBeNull();
    expect(resolveMove("t1", null, columns)).toBeNull();
  });

  it("overId desconocido → null", () => {
    expect(resolveMove("t1", "ghost", columns)).toBeNull();
  });
});

describe("KanbanBoard", () => {
  it("renderiza columnas con título y tickets", () => {
    render(<KanbanBoard columns={columns} />);
    expect(screen.getByText("Abierto")).toBeDefined();
    expect(screen.getByText("Implementar MFA")).toBeDefined();
    expect(screen.getByText("ACCESS-CONTROL · crítica")).toBeDefined();
  });

  it("read-only (sin onMove): tickets no son botones arrastrables", () => {
    render(<KanbanBoard columns={columns} />);
    expect(screen.queryByRole("button", { name: /Implementar MFA/ })).toBeNull();
  });

  it("con onMove los tickets son focusables (drag por teclado disponible)", () => {
    render(<KanbanBoard columns={columns} onMove={() => {}} />);
    expect(screen.getByRole("button", { name: /Implementar MFA/ })).toBeDefined();
  });

  it("axe limpio", async () => {
    const { container } = render(<KanbanBoard columns={columns} onMove={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @duly/ui exec vitest run src/kanban/kanban-board.test.tsx`
Expected: FAIL — `Cannot find module './kanban-board.js'`

- [ ] **Step 4: Add copy keys**

`en.ts`:

```ts
  kanban: {
    board: "Kanban board",
    instructions:
      "To pick up a card, press space or enter. Use the arrow keys to move it, space or enter to drop, escape to cancel.",
    pickedUp: (t: string) => `Picked up ${t}`,
    movedOver: (t: string, target: string) => `${t} is over ${target}`,
    dropped: (t: string, target: string) => `${t} dropped on ${target}`,
    canceled: (t: string) => `Movement of ${t} canceled`,
  },
```

`es.ts`:

```ts
  kanban: {
    board: "Tablero kanban",
    instructions:
      "Para levantar una tarjeta, presiona espacio o enter. Usa las flechas para moverla, espacio o enter para soltar, escape para cancelar.",
    pickedUp: (t: string) => `Levantaste ${t}`,
    movedOver: (t: string, target: string) => `${t} está sobre ${target}`,
    dropped: (t: string, target: string) => `${t} soltada en ${target}`,
    canceled: (t: string) => `Movimiento de ${t} cancelado`,
  },
```

- [ ] **Step 5: Write the implementation**

`packages/ui/src/kanban/kanban-board.tsx`:

```tsx
import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

const TICKET_EDGE: Record<Tone, string> = {
  info: "border-s-info",
  ok: "border-s-ok",
  review: "border-s-review",
  warn: "border-s-warn",
  block: "border-s-block",
};

export interface KanbanTicket {
  id: string;
  title: string;
  /** Línea meta en mono, ej. "ACCESS-CONTROL · crítica". */
  meta?: string;
  tone?: Tone;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tickets: KanbanTicket[];
}

export interface KanbanBoardProps extends Omit<React.ComponentProps<"div">, "children" | "onDrop"> {
  columns: KanbanColumn[];
  /** Controlado: el consumidor aplica el movimiento y re-renderiza. Sin esto, read-only. */
  onMove?: (ticketId: string, toColumn: string, index: number) => void;
}

/**
 * Resuelve un drag-end de dnd-kit a un movimiento (toColumn, index).
 * `overId` puede ser una columna (drop al final) o un ticket (drop en su
 * posición). Pura y exportada para testear sin simular drags.
 */
export function resolveMove(
  activeId: string,
  overId: string | null,
  columns: KanbanColumn[],
): { toColumn: string; index: number } | null {
  if (overId == null || overId === activeId) return null;
  const col = columns.find((c) => c.id === overId);
  if (col) return { toColumn: col.id, index: col.tickets.length };
  for (const c of columns) {
    const i = c.tickets.findIndex((t) => t.id === overId);
    if (i >= 0) return { toColumn: c.id, index: i };
  }
  return null;
}

function TicketCard({ ticket, draggable }: { ticket: KanbanTicket; draggable: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    disabled: !draggable,
  });
  const body = (
    <>
      {ticket.meta ? (
        <span className="block font-mono text-[0.58rem] text-dim">{ticket.meta}</span>
      ) : null}
      <span className="text-[0.78rem] text-ink">{ticket.title}</span>
    </>
  );
  const cardClass = cn(
    "rounded border border-border-subtle bg-bg-elevated px-2.5 py-2 text-left",
    ticket.tone && cn("border-s-2", TICKET_EDGE[ticket.tone]),
    isDragging && "opacity-50",
  );
  if (!draggable) {
    return <li className={cardClass}>{body}</li>;
  }
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="list-none"
    >
      <button type="button" className={cn(cardClass, "block w-full")} {...attributes} {...listeners}>
        {body}
      </button>
    </li>
  );
}

function Column({ column, draggable }: { column: KanbanColumn; draggable: boolean }) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <div className="flex flex-col rounded-md border border-border-subtle bg-surface-sunken p-2">
      <h3 className="mb-2 font-mono text-[0.62rem] uppercase tracking-wider text-faint">
        {column.title}
      </h3>
      <SortableContext items={column.tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-10 flex-1 flex-col gap-1.5">
          {column.tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} draggable={draggable} />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
}

/**
 * Tablero kanban controlado (columnas + tickets) — backlogs por estado:
 * remediación de brechas, pipeline de trabajo. Drag & drop con dnd-kit
 * (puntero + teclado, anuncios sr vía copy). El consumidor aplica el
 * movimiento en `onMove` y re-renderiza; sin `onMove` es read-only y no se
 * montan sensores.
 */
export function KanbanBoard({ columns, onMove, className, ...props }: KanbanBoardProps) {
  const copy = useCopy();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const titleOf = (id: string) => {
    const col = columns.find((c) => c.id === id);
    if (col) return col.title;
    for (const c of columns) {
      const t = c.tickets.find((x) => x.id === id);
      if (t) return t.title;
    }
    return id;
  };

  const grid = (
    <div
      role="group"
      aria-label={copy.kanban.board}
      className={cn("grid gap-2.5", className)}
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      {...props}
    >
      {columns.map((c) => (
        <Column key={c.id} column={c} draggable={onMove != null} />
      ))}
    </div>
  );

  if (!onMove) return grid;

  const handleDragEnd = (event: DragEndEvent) => {
    const move = resolveMove(String(event.active.id), event.over ? String(event.over.id) : null, columns);
    if (move) onMove(String(event.active.id), move.toColumn, move.index);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      accessibility={{
        screenReaderInstructions: { draggable: copy.kanban.instructions },
        announcements: {
          onDragStart: ({ active }) => copy.kanban.pickedUp(titleOf(String(active.id))),
          onDragOver: ({ active, over }) =>
            over ? copy.kanban.movedOver(titleOf(String(active.id)), titleOf(String(over.id))) : undefined,
          onDragEnd: ({ active, over }) =>
            over
              ? copy.kanban.dropped(titleOf(String(active.id)), titleOf(String(over.id)))
              : copy.kanban.canceled(titleOf(String(active.id))),
          onDragCancel: ({ active }) => copy.kanban.canceled(titleOf(String(active.id))),
        },
      }}
    >
      {grid}
    </DndContext>
  );
}
```

Create `packages/ui/src/kanban/index.ts`:

```ts
export * from "./kanban-board.js";
```

In `packages/ui/src/index.ts`, after the `data-table` export block, add:

```ts
// kanban — tablero de columnas controlado (dnd-kit), backlogs por estado
export * from "./kanban/index.js";
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm --filter @duly/ui exec vitest run src/kanban/kanban-board.test.tsx`
Expected: PASS (8 tests)

- [ ] **Step 7: Story**

Create `packages/ui/src/kanban/kanban-board.stories.tsx` (stateful story — drag applies the move):

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { KanbanBoard, type KanbanColumn } from "./kanban-board.js";

const meta: Meta<typeof KanbanBoard> = {
  title: "Kanban/Kanban Board/V001 Remediation Backlog",
  component: KanbanBoard,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;
type S = StoryObj<typeof KanbanBoard>;

// Backlog de remediación ISO 27001: brecha → acción → re-evidencia. Vivo,
// no un PDF muerto. El estado vive en el consumidor (componente controlado).
const initial: KanbanColumn[] = [
  {
    id: "open",
    title: "Abierto",
    tickets: [
      { id: "t1", title: "Implementar MFA + revisión de accesos", meta: "ACCESS-CONTROL · crítica", tone: "block" },
      { id: "t2", title: "Evaluación formal de proveedores", meta: "SUPPLIER · crítica", tone: "block" },
    ],
  },
  {
    id: "doing",
    title: "En remediación",
    tickets: [{ id: "t3", title: "Completar 46 controles del Anexo A · resp. CISO", meta: "SOA · normal", tone: "warn" }],
  },
  {
    id: "done",
    title: "Re-evidenciado",
    tickets: [{ id: "t4", title: "backup-log-jul.pdf subido · re-run pendiente", meta: "BACKUP ▲ partial", tone: "ok" }],
  },
];

function applyMove(cols: KanbanColumn[], ticketId: string, toColumn: string, index: number): KanbanColumn[] {
  let moved: (typeof cols)[number]["tickets"][number] | undefined;
  const without = cols.map((c) => {
    const i = c.tickets.findIndex((t) => t.id === ticketId);
    if (i < 0) return c;
    moved = c.tickets[i];
    return { ...c, tickets: c.tickets.filter((t) => t.id !== ticketId) };
  });
  if (!moved) return cols;
  return without.map((c) =>
    c.id === toColumn ? { ...c, tickets: [...c.tickets.slice(0, index), moved!, ...c.tickets.slice(index)] } : c,
  );
}

export const RemediationBacklog: S = {
  render: function Render() {
    const [columns, setColumns] = React.useState(initial);
    return (
      <div className="min-h-screen bg-bg-base p-12">
        <KanbanBoard
          columns={columns}
          onMove={(ticketId, toColumn, index) => setColumns((c) => applyMove(c, ticketId, toColumn, index))}
        />
      </div>
    );
  },
};

export const ReadOnly: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <KanbanBoard columns={initial} />
    </div>
  ),
};
```

- [ ] **Step 8: Lint + commit**

Run: `pnpm --filter @duly/ui lint` — expected: clean.

```bash
git add packages/ui/package.json pnpm-lock.yaml packages/ui/src/kanban packages/ui/src/index.ts packages/ui/src/lib/copy/en.ts packages/ui/src/lib/copy/es.ts
git commit -m "feat(ui): KanbanBoard — controlled dnd-kit board with keyboard a11y"
```

---

### Task 8: Recipe stories — SoaCoverageBar, GapList, ScopeBuilder

**Files:**
- Create: `packages/ui/src/stories/recipes/soa-coverage-bar.stories.tsx`
- Create: `packages/ui/src/stories/recipes/gap-list.stories.tsx`
- Create: `packages/ui/src/stories/recipes/scope-builder.stories.tsx`

**Interfaces:**
- Consumes: `Progress` (`value: number` 0–100), `Card`/`CardContent`, `Checkbox`, `Label`, `Input`, `Textarea` from `../../components/ui/*.js`. No new exports.

- [ ] **Step 1: SoaCoverageBar recipe**

`packages/ui/src/stories/recipes/soa-coverage-bar.stories.tsx`:

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "../../components/ui/progress.js";

const meta: Meta = {
  title: "Recipes/ISO Console/SoA Coverage Bar",
};
export default meta;

// Receta, no componente: Progress + labels cubre la cobertura de la
// Declaración de Aplicabilidad (X de 93 controles del Anexo A).
export const AnexoA: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="max-w-md rounded-lg border border-border-default bg-surface-2 p-4">
        <p className="font-mono text-[0.66rem] text-faint">Declaración de Aplicabilidad</p>
        <p className="mt-1 text-sm font-semibold text-ink">47 de 93 controles del Anexo A</p>
        <Progress value={(47 / 93) * 100} className="mt-2" />
        <p className="mt-2 text-xs text-dim">
          completa: <span className="text-block">no</span> — 46 controles sin decisión · soaComplete=false → tope banda 5
        </p>
      </div>
    </div>
  ),
};
```

- [ ] **Step 2: GapList recipe**

`packages/ui/src/stories/recipes/gap-list.stories.tsx`:

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Recipes/ISO Console/Gap List",
};
export default meta;

// Receta, no componente: filas de brecha priorizada por impacto en banda.
// Severidad con texto (crítica/normal), impacto en mono — composición pura.
const gaps = [
  { sev: "crítica", tone: "text-block border-block/40 bg-block/10", text: "ACCESS-CONTROL sin evidencia operativa", impact: "+2 bandas" },
  { sev: "crítica", tone: "text-block border-block/40 bg-block/10", text: "SUPPLIER: sin evaluación de proveedores", impact: "+1 banda" },
  { sev: "normal", tone: "text-warn border-warn/40 bg-warn/10", text: "SoA incompleto (46 controles)", impact: "tope 5→6" },
];

export const PriorizadaPorImpacto: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <ul className="flex max-w-xl flex-col gap-2">
        {gaps.map((g) => (
          <li
            key={g.text}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5 rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-sm"
          >
            <span className={`rounded-full border px-2 py-px font-mono text-[0.62rem] ${g.tone}`}>{g.sev}</span>
            <span className="text-ink">{g.text}</span>
            <span className="font-mono text-[0.74rem] text-ok">{g.impact}</span>
          </li>
        ))}
      </ul>
    </div>
  ),
};
```

- [ ] **Step 3: ScopeBuilder recipe**

`packages/ui/src/stories/recipes/scope-builder.stories.tsx`:

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.js";
import { Checkbox } from "../../components/ui/checkbox.js";
import { Label } from "../../components/ui/label.js";
import { Input } from "../../components/ui/input.js";
import { Textarea } from "../../components/ui/textarea.js";
import { Button } from "../../components/ui/button.js";

const meta: Meta = {
  title: "Recipes/ISO Console/Scope Builder",
};
export default meta;

// Receta, no componente: definición del alcance del SGSI (evento #1 de la
// corrida: scope explícito → RunStarted) con primitivas de form existentes.
const units = ["Operaciones TI", "Recursos Humanos", "Finanzas", "Atención al cliente"];

export const AlcanceSgsi: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Definición del SGSI · alcance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="scope-name">Nombre del engagement</Label>
            <Input id="scope-name" defaultValue="Banco Andino · ronda 2" className="mt-1" />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-ink">Unidades incluidas</legend>
            <div className="mt-2 flex flex-col gap-2">
              {units.map((u) => (
                <div key={u} className="flex items-center gap-2">
                  <Checkbox id={`unit-${u}`} defaultChecked={u !== "Finanzas"} />
                  <Label htmlFor={`unit-${u}`}>{u}</Label>
                </div>
              ))}
            </div>
          </fieldset>
          <div>
            <Label htmlFor="scope-notes">Exclusiones y justificación</Label>
            <Textarea id="scope-notes" className="mt-1" defaultValue="Finanzas queda fuera: tercerizada, cubierta por SOC 2 del proveedor." />
          </div>
          <Button className="self-start">Iniciar corrida (RunStarted)</Button>
        </CardContent>
      </Card>
    </div>
  ),
};
```

Note: if `card.tsx` exports different member names (e.g. no `CardHeader`), open `packages/ui/src/components/ui/card.tsx` and use its actual exports; same for `checkbox.tsx` — mirror usage from `packages/ui/src/stories/checkbox.stories.tsx`.

- [ ] **Step 4: Verify stories compile + commit**

Run: `pnpm --filter @duly/ui exec tsc --noEmit -p tsconfig.json`
Expected: no errors (stories are type-checked by the package tsconfig; if stories are excluded there, run lint instead — it covers them).
Run: `pnpm --filter @duly/ui lint` — expected: clean.

```bash
git add packages/ui/src/stories/recipes
git commit -m "docs(ui): ISO console recipes — SoA coverage, gap list, scope builder"
```

---

### Task 9: Recipe story — full ISO console

**Files:**
- Create: `packages/ui/src/stories/recipes/iso-console.stories.tsx`

**Interfaces:**
- Consumes (new, exact APIs defined in Tasks 1–7): `Stepper`, `BandGauge`, `DeltaList`, `KanbanBoard`, `Dropzone`, `ConnectorStatus`, `AgentStatusMatrix density="compact"`.
- Consumes (existing — copy sample-data shapes verbatim from their co-located stories, then relabel to the ISO scenario):
  - `AppShell`, `AppSidebar`, `WorkspaceSwitcher` → `packages/ui/src/app-shell/` (check `Workspace` interface in `workspace-switcher.tsx`; sample usage in `app-shell.stories.tsx` if present, otherwise compose from prop JSDoc: `AppShell({ sidebar, topbar?, children })`, `AppSidebar({ header, children })`, `WorkspaceSwitcher({ workspaces, activeId, onSelect })`).
  - `AuditLogTable` → sample rows from `packages/ui/src/agentic/audit-log-table.stories.tsx`.
  - `HumanInterruptQueue` + `ApprovalGateCard` → sample data from `packages/ui/src/agentic/human-interrupt-queue.stories.tsx`.
  - `TraceLog` → sample events from `packages/ui/src/trace-log/` stories (see `src/stories/` or co-located).
  - `RunTimeline` → sample from `packages/ui/src/agentic/run-timeline.stories.tsx`.

- [ ] **Step 1: Read the source stories listed above and lift their sample-data consts.** Keep shapes identical; rename strings to the ISO scenario (Banco Andino, políticas, SoA, etc.).

- [ ] **Step 2: Write the story**

`packages/ui/src/stories/recipes/iso-console.stories.tsx` — structure (fill the five `case` bodies with the components listed; the `dashboard` and `ciclo` screens below are complete, the other three use the lifted sample data):

```tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppShell, AppSidebar, WorkspaceSwitcher } from "../../app-shell/index.js";
import { Stepper } from "../../components/ui/stepper.js";
import { Dropzone } from "../../components/ui/dropzone.js";
import { Progress } from "../../components/ui/progress.js";
import { BandGauge } from "../../compliance/band-gauge.js";
import { DeltaList } from "../../compliance/delta-list.js";
import { KanbanBoard, type KanbanColumn } from "../../kanban/index.js";
import { AgentStatusMatrix } from "../../agentic/agent-status-matrix.js";
import { ConnectorStatus } from "../../agentic/connector-status.js";
// + AuditLogTable, HumanInterruptQueue, ApprovalGateCard, TraceLog, RunTimeline
//   (imports según sus barrels; datos lifted en Step 1)

const meta: Meta = {
  title: "Recipes/ISO Console/V001 Full Console",
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

// La consola ISO 27001 completa como composición Duly: la prueba integral
// de que el DS suple los wireframes v0 sin GAPs. Datos sintéticos.

const isoSteps = [
  { label: "Acumulación", state: "done" as const },
  { label: "Recopilación", state: "done" as const },
  { label: "Alcance", state: "done" as const },
  { label: "Inventario", state: "done" as const },
  { label: "1ª Revisión", state: "current" as const },
  { label: "Feedback", state: "pending" as const },
  { label: "Gate HITL", state: "pending" as const },
  { label: "Remediación", state: "pending" as const },
  { label: "2ª Revisión", state: "pending" as const },
];

type View = "dashboard" | "dataroom" | "cola" | "corrida" | "ciclo";
const VIEWS: { id: View; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "dataroom", label: "Data room" },
  { id: "cola", label: "Cola de revisión" },
  { id: "corrida", label: "Corrida en vivo" },
  { id: "ciclo", label: "Backlog / ciclo" },
];

const sgsiAreas = [
  { code: "SCOPE", label: "Alcance", tone: "ok" as const },
  { code: "POLICY-MS", label: "Política SGSI", tone: "ok" as const },
  { code: "RISK", label: "Riesgos", tone: "warn" as const },
  { code: "SOA", label: "SoA", tone: "warn" as const },
  { code: "OBJECTIVES", label: "Objetivos", tone: "ok" as const },
  { code: "INT-AUDIT", label: "Auditoría interna", tone: "ok" as const },
  { code: "MGMT-REVIEW", label: "Rev. dirección", tone: "warn" as const },
  { code: "CORRECTIVE", label: "Correctivas", tone: "review" as const },
  { code: "POLICY", label: "Políticas", tone: "ok" as const },
  { code: "ACCESS-CTRL", label: "Control de acceso", tone: "block" as const, critical: true },
  { code: "BACKUP", label: "Respaldos", tone: "warn" as const },
  { code: "SUPPLIER", label: "Proveedores", tone: "block" as const },
  { code: "TRAINING", label: "Capacitación", tone: "ok" as const },
];

function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-surface-2 p-4">
          <p className="font-mono text-[0.66rem] text-faint">Veredicto de banda</p>
          <BandGauge
            className="mt-3"
            value={3}
            max={6}
            label="Banda de readiness"
            hint="Banda 3 — Partial Readiness · strongFrac=0.46 · coverage=1.00"
          />
        </div>
        <div className="rounded-lg border border-border-default bg-surface-2 p-4">
          <p className="font-mono text-[0.66rem] text-faint">Declaración de Aplicabilidad</p>
          <p className="mt-1 text-sm font-semibold text-ink">47 de 93 controles del Anexo A</p>
          <Progress value={(47 / 93) * 100} className="mt-2" />
          <p className="mt-2 text-xs text-dim">soaComplete=false → tope banda 5</p>
        </div>
      </div>
      <div className="rounded-lg border border-border-default bg-surface-2 p-4">
        <p className="mb-3 font-mono text-[0.66rem] text-faint">13 áreas del SGSI · color por veredicto</p>
        <AgentStatusMatrix items={sgsiAreas} density="compact" />
      </div>
    </div>
  );
}

function Ciclo() {
  const [columns, setColumns] = React.useState<KanbanColumn[]>([
    {
      id: "open",
      title: "Abierto",
      tickets: [
        { id: "t1", title: "Implementar MFA + revisión de accesos", meta: "ACCESS-CONTROL · crítica", tone: "block" },
        { id: "t2", title: "Evaluación formal de proveedores", meta: "SUPPLIER · crítica", tone: "block" },
      ],
    },
    { id: "doing", title: "En remediación", tickets: [{ id: "t3", title: "Completar 46 controles del Anexo A", meta: "SOA · normal", tone: "warn" }] },
    { id: "done", title: "Re-evidenciado", tickets: [{ id: "t4", title: "backup-log-jul.pdf subido", meta: "BACKUP ▲", tone: "ok" }] },
  ]);
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border-default bg-surface-2 p-4">
        <p className="mb-3 font-mono text-[0.66rem] text-faint">Qué cambió entre R1 → R2</p>
        <DeltaList
          entries={[
            { label: "ACCESS-CONTROL", before: { label: "missing", tone: "block" }, after: { label: "missing", tone: "block" } },
            { label: "BACKUP", before: { label: "missing", tone: "block" }, after: { label: "partial", tone: "warn" }, improved: true },
            { label: "TRAINING", before: { label: "weak", tone: "warn" }, after: { label: "strong", tone: "ok" }, improved: true },
          ]}
        />
      </div>
      <div className="rounded-lg border border-border-default bg-surface-2 p-4">
        <p className="mb-3 font-mono text-[0.66rem] text-faint">Backlog de remediación · brecha → acción → re-evidencia</p>
        <KanbanBoard
          columns={columns}
          onMove={(id, to, i) =>
            setColumns((cols) => {
              let moved: KanbanColumn["tickets"][number] | undefined;
              const without = cols.map((c) => {
                const idx = c.tickets.findIndex((t) => t.id === id);
                if (idx < 0) return c;
                moved = c.tickets[idx];
                return { ...c, tickets: c.tickets.filter((t) => t.id !== id) };
              });
              if (!moved) return cols;
              return without.map((c) =>
                c.id === to ? { ...c, tickets: [...c.tickets.slice(0, i), moved!, ...c.tickets.slice(i)] } : c,
              );
            })
          }
        />
      </div>
    </div>
  );
}

export const FullConsole: StoryObj = {
  render: function Render() {
    const [view, setView] = React.useState<View>("dashboard");
    const [engagement, setEngagement] = React.useState("banco-andino");
    return (
      <AppShell
        sidebar={
          <AppSidebar
            header={
              <WorkspaceSwitcher
                workspaces={[
                  /* shape del interface Workspace de workspace-switcher.tsx:
                     Banco Andino · ronda 2, Clínica Sur · ronda 1, Retail MX · recert */
                ]}
                activeId={engagement}
                onSelect={setEngagement}
              />
            }
          >
            <nav className="flex flex-col gap-1">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  className={
                    view === v.id
                      ? "rounded-md border border-accent-border bg-accent-surface px-2.5 py-1.5 text-left text-sm text-accent"
                      : "rounded-md px-2.5 py-1.5 text-left text-sm text-dim hover:text-ink"
                  }
                >
                  {v.label}
                </button>
              ))}
            </nav>
          </AppSidebar>
        }
      >
        <div className="flex flex-col gap-4 p-4">
          <Stepper steps={isoSteps} />
          {view === "dashboard" ? <Dashboard /> : null}
          {view === "ciclo" ? <Ciclo /> : null}
          {/* dataroom: <Dropzone .../> + <ConnectorStatus .../> + <AuditLogTable {lifted}/> */}
          {/* cola: <HumanInterruptQueue {lifted}/> + <ApprovalGateCard {lifted}/> */}
          {/* corrida: <TraceLog {lifted}/> + <RunTimeline {lifted}/> */}
        </div>
      </AppShell>
    );
  },
};
```

Complete the three commented screens with the lifted sample data (Step 1) — each is a direct paste of an existing story's data with ISO labels. The Dropzone/ConnectorStatus props are fully defined in Tasks 5–6.

- [ ] **Step 3: Verify in Storybook**

Run: `pnpm --filter docs dev` (or the docs app's storybook script per `apps/docs/package.json`) and open `Recipes/ISO Console/V001 Full Console`.
Expected: shell renders, 5 views switch, stepper shows stage 5 current, kanban drags.

- [ ] **Step 4: Lint + commit**

Run: `pnpm --filter @duly/ui lint` — expected: clean.

```bash
git add packages/ui/src/stories/recipes/iso-console.stories.tsx
git commit -m "docs(ui): full ISO console recipe — integral wireframe coverage demo"
```

---

### Task 10: NORTH_STAR update + final verification

**Files:**
- Modify: `NORTH_STAR.md`

- [ ] **Step 1: Add catalog rows**

In `NORTH_STAR.md`: locate the area tables (`### B. Agent ops`, `### C.` compliance area — find with `grep -n "^### " NORTH_STAR.md`). Append rows following the existing format (`| Component | Purpose | ✅ (V001, Storybook \`Title\`) |`):

- Area C table: `BandGauge` (veredicto discreto de banda 1–6), `DeltaList` (diff antes→después entre corridas).
- Area B table: `ConnectorStatus` (salud de fuentes de ingesta).
- If a "primitives"/general table exists, add `Stepper`, `Dropzone`, `KanbanBoard` there; otherwise add a short `### Primitivas nuevas (2026-07-15)` subsection with the same 3-column format.
- Update the `AgentStatusMatrix` row (if present) to mention V002 compact/critical/onSelectItem.

- [ ] **Step 2: Full gate**

Run: `pnpm --filter @duly/ui test` — expected: all suites PASS.
Run: `pnpm --filter @duly/ui lint` — expected: clean.
Run: `pnpm --filter @duly/ui build` — expected: tsup build succeeds.

- [ ] **Step 3: Commit**

```bash
git add NORTH_STAR.md
git commit -m "docs: NORTH_STAR catalog rows for ISO console components"
```

---

## Self-Review Notes

- Spec coverage: 7 component deliverables → Tasks 1–7; 4 recipes → Tasks 8–9; NORTH_STAR + gates → Task 10. Out-of-scope items have no tasks (correct).
- Types consistent: `Tone` union used across Tasks 2–7; `StepperStep`/`KanbanColumn`/`DeltaEntry` names match between producing and consuming tasks.
- Known judgment calls for the executor: exact insertion points in `en.ts`/`es.ts` are "after the previous new namespace" — order irrelevant, compiler enforces parity; Task 9 deliberately lifts sample data from existing stories instead of duplicating it here (those stories are the canonical prop documentation).
