# Studio DS Sub-Project #2 — UI Primitives + Status System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundational UI primitive library (Button, Badge, StatusDot, Input, Card, Separator, Avatar, Tooltip, Alert, Legend) that completes the Design Kit base — all using existing tokens, Radix primitives, and the CVA pattern established by TraceLog.

**Architecture:** Each component lives in `packages/ui/src/<name>/`, follows the TraceLog pattern (CVA variants → component.tsx → test → story), and is re-exported from `packages/ui/src/index.ts`. No new design decisions — all colors come from semantic tokens already in `@studio/tokens`.

**Tech Stack:** Radix UI primitives (`@radix-ui/react-slot`, `react-separator`, `react-avatar`, `react-tooltip`), CVA, Tailwind v4 utility classes with `@studio/tokens` variables, vitest + @testing-library/react + jest-axe, Storybook 8.

## Global Constraints

- All CSS colors via token utility classes ONLY — zero hex literals in `.tsx`/`.ts` (enforced by ESLint no-hex rule). Use `text-ok`, `bg-block`, `border-border-subtle`, etc.
- `on-ok` / `on-review` / `on-warn` / `on-block` tokens exist for text-on-filled-status-bg. Use them.
- `forwardRef` on every element that is a direct DOM wrapper (inputs, buttons, divs that consumers need to ref).
- `"use client"` banner added automatically by tsup — do NOT add it to source files.
- Storybook story title format: `"Fundamentos/<ComponentName>"` for base primitives, `"Agent-ops/<ComponentName>"` for agent-ops-specific. Keep TraceLog's existing `"Agent-ops/TraceLog"` untouched.
- Tests: vitest + @testing-library/react + jest-axe. Each component needs at minimum: render smoke, key variant/state, accessibility axe gate.
- Run `pnpm --filter @studio/ui test` after each task (not just the task's test file). Cumulative test count must increase.
- No new token colors — use what exists in `contracts.ts`. Status subtle backgrounds: use `bg-surface-3 text-{tone}` pattern (surface-3 exists as a slightly elevated dark surface).
- Imports within `packages/ui/src/` use `.js` extension (TypeScript module resolution — same as TraceLog).
- Radix peer deps: add new `@radix-ui/*` as `dependencies` in `packages/ui/package.json` (NOT devDependencies — they ship with the package). tsup config already externalizes `@radix-ui/*` pattern.

## File Map

```
packages/ui/src/
  button/
    button.tsx          # Button component + CVA variants inline
    button.test.tsx     # render, disabled, asChild, axe
    button.stories.tsx  # AllVariants, AllSizes, IconButton
  badge/
    badge.tsx           # Badge + inline CVA
    badge.test.tsx
    badge.stories.tsx
  status-dot/
    status-dot.tsx      # StatusDot (colored dot, optional pulse)
    status-dot.test.tsx
    status-dot.stories.tsx
  input/
    input.tsx           # Input + Textarea (both forwardRef)
    input.test.tsx
    input.stories.tsx
  card/
    card.tsx            # Card compound (Root/Header/Body/Footer)
    card.test.tsx
    card.stories.tsx
  separator/
    separator.tsx       # Radix Separator wrapper
    separator.test.tsx
    separator.stories.tsx
  avatar/
    avatar.tsx          # Radix Avatar wrapper with initials fallback
    avatar.test.tsx
    avatar.stories.tsx
  tooltip/
    tooltip.tsx         # Radix Tooltip wrapper (exports Provider too)
    tooltip.test.tsx
    tooltip.stories.tsx
  alert/
    alert.tsx           # Alert compound (Root/Icon/Title/Description)
    alert.test.tsx
    alert.stories.tsx
  legend/
    legend.tsx          # Legend = list of StatusDot + label
    legend.test.tsx
    legend.stories.tsx
  index.ts              # MODIFY: add all new exports
apps/docs/.storybook/
  preview.tsx           # MODIFY Task 5: add TooltipProvider to decorator
```

---

### Task 1: Button

**Files:**
- Create: `packages/ui/src/button/button.tsx`
- Create: `packages/ui/src/button/button.test.tsx`
- Create: `packages/ui/src/button/button.stories.tsx`
- Modify: `packages/ui/package.json` — add `@radix-ui/react-slot` to `dependencies`

**Interfaces:**
- Produces: `Button` component + `ButtonProps` type + `buttonVariants` CVA function (used by Alert close button in Task 6)

- [ ] **Step 1: Install @radix-ui/react-slot**

```bash
pnpm --filter @studio/ui add @radix-ui/react-slot
```

Expected: `packages/ui/package.json` gains `"@radix-ui/react-slot": "^1.1.0"` in dependencies.

- [ ] **Step 2: Write the failing test**

Create `packages/ui/src/button/button.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "./button.js";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: /guardar/i })).toBeDefined();
  });

  it("disabled prevents click", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button disabled onClick={onClick}>Guardar</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("asChild renders as anchor", () => {
    render(<Button asChild><a href="/ruta">Ir</a></Button>);
    expect(screen.getByRole("link", { name: /ir/i })).toBeDefined();
  });

  it("variant=destructive has data-variant attribute", () => {
    render(<Button variant="destructive">Eliminar</Button>);
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("data-variant")).toBe("destructive");
  });

  it("axe: no violations", async () => {
    const { container } = render(<Button>Acción</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | grep -E "FAIL|PASS|button"
```

Expected: FAIL — `Button` not defined.

- [ ] **Step 4: Implement Button**

Create `packages/ui/src/button/button.tsx`:

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn.js";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        solid: "bg-accent text-on-accent hover:opacity-90",
        outline: "border border-border-strong bg-transparent text-ink hover:bg-surface-2",
        ghost: "bg-transparent text-ink hover:bg-surface-2",
        destructive: "bg-block text-on-block hover:opacity-90",
        icon: "rounded-lg p-0 bg-transparent text-dim hover:text-ink hover:bg-surface-2",
      },
      size: {
        sm: "h-7 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-base",
      },
    },
    compoundVariants: [
      { variant: "icon", size: "sm", className: "size-7 px-0" },
      { variant: "icon", size: "md", className: "size-9 px-0" },
      { variant: "icon", size: "lg", className: "size-10 px-0" },
    ],
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        data-variant={variant ?? "solid"}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
```

- [ ] **Step 5: Run tests — all pass**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | tail -20
```

Expected: `button.test.tsx` 5/5 PASS + previous TraceLog tests still green.

- [ ] **Step 6: Write story**

Create `packages/ui/src/button/button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button.js";

const meta: Meta<typeof Button> = {
  title: "Fundamentos/Button",
  component: Button,
};
export default meta;
type S = StoryObj<typeof Button>;

export const AllVariants: S = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const AllSizes: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Disabled: S = {
  render: () => (
    <div className="flex gap-3">
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>Disabled</Button>
    </div>
  ),
};

export const AsLink: S = {
  render: () => (
    <Button asChild variant="outline">
      <a href="/">← Inicio</a>
    </Button>
  ),
};
```

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/button/ packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): Button component — solid/outline/ghost/destructive/icon variants, asChild"
```

---

### Task 2: Badge + StatusDot

**Files:**
- Create: `packages/ui/src/badge/badge.tsx`
- Create: `packages/ui/src/badge/badge.test.tsx`
- Create: `packages/ui/src/badge/badge.stories.tsx`
- Create: `packages/ui/src/status-dot/status-dot.tsx`
- Create: `packages/ui/src/status-dot/status-dot.test.tsx`
- Create: `packages/ui/src/status-dot/status-dot.stories.tsx`

**Interfaces:**
- Consumes: `Tone` type from `../trace-log/trace-log.variants.js`
- Produces: `Badge` + `BadgeProps`, `StatusDot` + `StatusDotProps` (consumed by Legend in Task 6)

- [ ] **Step 1: Write failing tests**

Create `packages/ui/src/badge/badge.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Badge } from "./badge.js";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText("Activo")).toBeDefined();
  });

  it("tone=ok has data-tone attribute", () => {
    const { container } = render(<Badge tone="ok">OK</Badge>);
    expect(container.querySelector("[data-tone='ok']")).toBeDefined();
  });

  it("tone=block applies block text class", () => {
    const { container } = render(<Badge tone="block">Error</Badge>);
    const el = container.querySelector("[data-tone='block']")!;
    expect(el.className).toContain("text-block");
  });

  it("axe: no violations", async () => {
    const { container } = render(
      <div>
        <Badge tone="ok">OK</Badge>
        <Badge tone="warn">Warn</Badge>
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

Create `packages/ui/src/status-dot/status-dot.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { StatusDot } from "./status-dot.js";

describe("StatusDot", () => {
  it("renders with aria-label", () => {
    const { container } = render(<StatusDot tone="ok" aria-label="Estado activo" />);
    const dot = container.querySelector("[aria-label='Estado activo']")!;
    expect(dot).toBeDefined();
  });

  it("pulse=true adds animate-pulse class", () => {
    const { container } = render(<StatusDot tone="ok" pulse />);
    expect(container.firstElementChild!.className).toContain("animate-pulse");
  });

  it("axe: no violations with aria-label", async () => {
    const { container } = render(<StatusDot tone="ok" aria-label="Proceso activo" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | grep -E "badge|status-dot|FAIL"
```

Expected: FAIL — `Badge` and `StatusDot` not defined.

- [ ] **Step 3: Implement Badge**

Create `packages/ui/src/badge/badge.tsx`:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

// neutral + all 5 status tones. Filled = on-{tone} text on {tone} bg.
// info uses surface-3/text-info since there's no on-info token.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none",
  {
    variants: {
      tone: {
        neutral: "bg-surface-3 text-dim",
        ok: "bg-ok text-on-ok",
        review: "bg-review text-on-review",
        warn: "bg-warn text-on-warn",
        block: "bg-block text-on-block",
        info: "bg-surface-3 text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeTone = Tone | "neutral";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  tone?: BadgeTone;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = "neutral", children, ...props }, ref) => (
    <span
      ref={ref}
      data-tone={tone}
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    >
      {children}
    </span>
  ),
);
Badge.displayName = "Badge";
```

- [ ] **Step 4: Implement StatusDot**

Create `packages/ui/src/status-dot/status-dot.tsx`:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

const dotVariants = cva("rounded-full shrink-0", {
  variants: {
    tone: {
      info: "bg-info",
      ok: "bg-ok",
      review: "bg-review",
      warn: "bg-warn",
      block: "bg-block",
    },
    size: {
      sm: "size-1.5",
      md: "size-2.5",
      lg: "size-3.5",
    },
  },
  defaultVariants: { tone: "info", size: "md" },
});

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof dotVariants> {
  tone?: Tone;
  pulse?: boolean;
}

export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, tone = "info", size, pulse = false, ...props }, ref) => (
    <span
      ref={ref}
      data-tone={tone}
      className={cn(dotVariants({ tone, size }), pulse && "animate-pulse", className)}
      {...props}
    />
  ),
);
StatusDot.displayName = "StatusDot";
```

- [ ] **Step 5: Run tests — all pass**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | tail -20
```

Expected: badge 4/4, status-dot 3/3, all prior tests green.

- [ ] **Step 6: Write stories**

Create `packages/ui/src/badge/badge.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge.js";

const meta: Meta<typeof Badge> = {
  title: "Fundamentos/Badge",
  component: Badge,
};
export default meta;
type S = StoryObj<typeof Badge>;

export const AllTones: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge tone="neutral">neutral</Badge>
      <Badge tone="info">info</Badge>
      <Badge tone="ok">ok</Badge>
      <Badge tone="review">review</Badge>
      <Badge tone="warn">warn</Badge>
      <Badge tone="block">block</Badge>
    </div>
  ),
};

export const InContext: S = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-ink">
        Agente PARSER <Badge tone="ok">activo</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-ink">
        Pipeline #42 <Badge tone="warn">en revisión</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-ink">
        Validación <Badge tone="block">bloqueado</Badge>
      </div>
    </div>
  ),
};
```

Create `packages/ui/src/status-dot/status-dot.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "./status-dot.js";

const meta: Meta<typeof StatusDot> = {
  title: "Fundamentos/StatusDot",
  component: StatusDot,
};
export default meta;
type S = StoryObj<typeof StatusDot>;

export const AllTones: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {(["info", "ok", "review", "warn", "block"] as const).map((tone) => (
        <div key={tone} className="flex items-center gap-2">
          <StatusDot tone={tone} aria-label={tone} />
          <span className="text-xs text-dim">{tone}</span>
        </div>
      ))}
    </div>
  ),
};

export const Pulse: S = {
  render: () => (
    <div className="flex items-center gap-2">
      <StatusDot tone="ok" pulse aria-label="Proceso activo" />
      <span className="text-sm text-ink">Proceso activo</span>
    </div>
  ),
};

export const Sizes: S = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusDot tone="ok" size="sm" aria-label="sm" />
      <StatusDot tone="ok" size="md" aria-label="md" />
      <StatusDot tone="ok" size="lg" aria-label="lg" />
    </div>
  ),
};
```

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/badge/ packages/ui/src/status-dot/
git commit -m "feat(ui): Badge and StatusDot — tone variants using status tokens"
```

---

### Task 3: Input + Textarea

**Files:**
- Create: `packages/ui/src/input/input.tsx`
- Create: `packages/ui/src/input/input.test.tsx`
- Create: `packages/ui/src/input/input.stories.tsx`

**Interfaces:**
- Produces: `Input` + `InputProps`, `Textarea` + `TextareaProps`, `Field` + `FieldProps` (label wrapper)

- [ ] **Step 1: Write failing tests**

Create `packages/ui/src/input/input.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Input, Textarea, Field } from "./input.js";

describe("Input", () => {
  it("renders and accepts value", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Buscar..." aria-label="buscar" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "predios");
    expect((input as HTMLInputElement).value).toBe("predios");
  });

  it("error state adds aria-invalid", () => {
    render(<Input aria-label="campo" error />);
    expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true");
  });

  it("disabled", () => {
    render(<Input aria-label="campo" disabled />);
    expect((screen.getByRole("textbox") as HTMLInputElement).disabled).toBe(true);
  });

  it("axe: Field with label has no violations", async () => {
    const { container } = render(
      <Field label="Nombre del predio" htmlFor="nombre">
        <Input id="nombre" placeholder="Ingrese nombre" />
      </Field>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Textarea", () => {
  it("renders as textarea", () => {
    render(<Textarea aria-label="notas" placeholder="Notas..." />);
    expect(screen.getByRole("textbox").tagName).toBe("TEXTAREA");
  });
});
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | grep -E "input|FAIL"
```

- [ ] **Step 3: Implement**

Create `packages/ui/src/input/input.tsx`:

```tsx
import * as React from "react";
import { cn } from "../lib/cn.js";

const baseInput = [
  "w-full rounded-lg border border-border-default bg-surface-sunken px-3 py-2 text-sm text-ink",
  "placeholder:text-faint",
  "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "transition-colors",
].join(" ");

const errorInput = "border-block focus-visible:border-block focus-visible:ring-block/50";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(baseInput, error && errorInput, className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(baseInput, "min-h-[80px] resize-y", error && errorInput, className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const Field = ({ label, htmlFor, hint, error, children, className }: FieldProps) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
      {label}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-faint">{hint}</p>}
    {error && <p className="text-xs text-block">{error}</p>}
  </div>
);
Field.displayName = "Field";
```

- [ ] **Step 4: Run tests — all pass**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | tail -20
```

Expected: input 5/5 PASS. Cumulative: 18+ tests.

- [ ] **Step 5: Write story**

Create `packages/ui/src/input/input.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Input, Textarea, Field } from "./input.js";

const meta: Meta = { title: "Fundamentos/Input" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => <Input placeholder="Buscar predio..." aria-label="buscar" />,
};

export const WithField: S = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Field label="Nombre del predio" htmlFor="nombre" hint="Tal como aparece en el catastro">
        <Input id="nombre" placeholder="Ej: Predio Norte #142" />
      </Field>
      <Field label="Observaciones" htmlFor="obs">
        <Textarea id="obs" placeholder="Ingrese observaciones..." />
      </Field>
    </div>
  ),
};

export const ErrorState: S = {
  render: () => (
    <Field label="ID de predio" htmlFor="id" error="El ID no existe en el catastro">
      <Input id="id" defaultValue="999999" error />
    </Field>
  ),
};

export const Disabled: S = {
  render: () => (
    <Field label="Sistema" htmlFor="sys">
      <Input id="sys" value="ArcGIS Enterprise 11.3" disabled />
    </Field>
  ),
};
```

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/input/
git commit -m "feat(ui): Input, Textarea, Field — error state, labels, accessible"
```

---

### Task 4: Card + Separator

**Files:**
- Create: `packages/ui/src/card/card.tsx`
- Create: `packages/ui/src/card/card.test.tsx`
- Create: `packages/ui/src/card/card.stories.tsx`
- Create: `packages/ui/src/separator/separator.tsx`
- Create: `packages/ui/src/separator/separator.test.tsx`
- Create: `packages/ui/src/separator/separator.stories.tsx`
- Modify: `packages/ui/package.json` — add `@radix-ui/react-separator`

**Interfaces:**
- Produces: `Card` compound (`Card.Root`, `Card.Header`, `Card.Body`, `Card.Footer`), `Separator`

- [ ] **Step 1: Install Radix Separator**

```bash
pnpm --filter @studio/ui add @radix-ui/react-separator
```

- [ ] **Step 2: Write failing tests**

Create `packages/ui/src/card/card.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Card } from "./card.js";

describe("Card", () => {
  it("renders compound children", () => {
    render(
      <Card.Root>
        <Card.Header>
          <h2>Agente PARSER</h2>
        </Card.Header>
        <Card.Body>
          <p>Procesando lote</p>
        </Card.Body>
        <Card.Footer>
          <span>Paso 1/5</span>
        </Card.Footer>
      </Card.Root>,
    );
    expect(screen.getByText("Agente PARSER")).toBeDefined();
    expect(screen.getByText("Procesando lote")).toBeDefined();
    expect(screen.getByText("Paso 1/5")).toBeDefined();
  });

  it("axe: no violations", async () => {
    const { container } = render(
      <Card.Root>
        <Card.Header><h2>Título</h2></Card.Header>
        <Card.Body><p>Contenido</p></Card.Body>
      </Card.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

Create `packages/ui/src/separator/separator.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "./separator.js";

describe("Separator", () => {
  it("renders with role=separator", () => {
    const { container } = render(<Separator />);
    expect(container.querySelector("[role='separator']")).toBeDefined();
  });

  it("vertical orientation sets data-orientation", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.querySelector("[role='separator']")!;
    expect(el.getAttribute("data-orientation")).toBe("vertical");
  });
});
```

- [ ] **Step 3: Run to confirm FAIL**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | grep -E "card|separator|FAIL"
```

- [ ] **Step 4: Implement Card**

Create `packages/ui/src/card/card.tsx`:

```tsx
import * as React from "react";
import { cn } from "../lib/cn.js";

const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden rounded-xl border border-border-subtle bg-surface-2",
        className,
      )}
      {...props}
    />
  ),
);
Root.displayName = "Card.Root";

const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between border-b border-border-subtle bg-surface-header px-4 py-3",
        className,
      )}
      {...props}
    />
  ),
);
Header.displayName = "Card.Header";

const Body = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4", className)} {...props} />
  ),
);
Body.displayName = "Card.Body";

const Footer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between border-t border-border-subtle px-4 py-3",
        className,
      )}
      {...props}
    />
  ),
);
Footer.displayName = "Card.Footer";

export const Card = { Root, Header, Body, Footer };
```

- [ ] **Step 5: Implement Separator**

Create `packages/ui/src/separator/separator.tsx`:

```tsx
import * as React from "react";
import * as RadixSeparator from "@radix-ui/react-separator";
import { cn } from "../lib/cn.js";

export interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof RadixSeparator.Root> {}

export const Separator = React.forwardRef<
  React.ElementRef<typeof RadixSeparator.Root>,
  SeparatorProps
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <RadixSeparator.Root
    ref={ref}
    orientation={orientation}
    decorative={decorative}
    className={cn(
      "shrink-0 bg-border-divider",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
    {...props}
  />
));
Separator.displayName = "Separator";
```

- [ ] **Step 6: Run tests — all pass**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | tail -20
```

Expected: card 2/2, separator 2/2, cumulative 22+ tests.

- [ ] **Step 7: Write stories**

Create `packages/ui/src/card/card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./card.js";
import { Badge } from "../badge/badge.js";
import { Button } from "../button/button.js";

const meta: Meta = { title: "Fundamentos/Card" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => (
    <Card.Root>
      <Card.Header>
        <span className="text-sm font-semibold text-ink">Agente PARSER</span>
        <Badge tone="ok">activo</Badge>
      </Card.Header>
      <Card.Body>
        <p className="text-sm text-dim">Procesando lote de validación — 138 predios.</p>
      </Card.Body>
      <Card.Footer>
        <span className="text-xs text-faint">Paso 1 de 5</span>
        <Button size="sm" variant="outline">Ver log</Button>
      </Card.Footer>
    </Card.Root>
  ),
};

export const Simple: S = {
  render: () => (
    <Card.Root>
      <Card.Body>
        <p className="text-sm text-ink">Contenido sin header ni footer.</p>
      </Card.Body>
    </Card.Root>
  ),
};
```

Create `packages/ui/src/separator/separator.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator.js";

const meta: Meta = { title: "Fundamentos/Separator" };
export default meta;
type S = StoryObj;

export const Horizontal: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink">Sección A</p>
      <Separator />
      <p className="text-sm text-ink">Sección B</p>
    </div>
  ),
};

export const Vertical: S = {
  render: () => (
    <div className="flex h-12 items-center gap-3">
      <span className="text-sm text-ink">Filtros</span>
      <Separator orientation="vertical" />
      <span className="text-sm text-ink">Resultados</span>
    </div>
  ),
};
```

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/card/ packages/ui/src/separator/ packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): Card compound and Separator — layout primitives"
```

---

### Task 5: Avatar + Tooltip

**Files:**
- Create: `packages/ui/src/avatar/avatar.tsx`
- Create: `packages/ui/src/avatar/avatar.test.tsx`
- Create: `packages/ui/src/avatar/avatar.stories.tsx`
- Create: `packages/ui/src/tooltip/tooltip.tsx`
- Create: `packages/ui/src/tooltip/tooltip.test.tsx`
- Create: `packages/ui/src/tooltip/tooltip.stories.tsx`
- Modify: `packages/ui/package.json` — add `@radix-ui/react-avatar`, `@radix-ui/react-tooltip`
- Modify: `apps/docs/.storybook/preview.tsx` — wrap decorator in TooltipProvider

**Interfaces:**
- Produces: `Avatar` + `AvatarProps`, `Tooltip.Provider`, `Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Content`

- [ ] **Step 1: Install Radix Avatar + Tooltip**

```bash
pnpm --filter @studio/ui add @radix-ui/react-avatar @radix-ui/react-tooltip
```

- [ ] **Step 2: Write failing tests**

Create `packages/ui/src/avatar/avatar.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Avatar } from "./avatar.js";

describe("Avatar", () => {
  it("shows fallback initials when no src", () => {
    render(<Avatar fallback="MP" aria-label="Mario Pérez" />);
    expect(screen.getByText("MP")).toBeDefined();
  });

  it("aria-label accessible", () => {
    const { container } = render(<Avatar fallback="MP" aria-label="Mario Pérez" />);
    expect(container.querySelector("[aria-label='Mario Pérez']")).toBeDefined();
  });

  it("axe: no violations", async () => {
    const { container } = render(<Avatar fallback="MP" aria-label="Mario Pérez" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

Create `packages/ui/src/tooltip/tooltip.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Tooltip } from "./tooltip.js";

describe("Tooltip", () => {
  it("shows content on hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger>Hover me</Tooltip.Trigger>
          <Tooltip.Content>Información adicional</Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>,
    );
    await user.hover(screen.getByText("Hover me"));
    expect(await screen.findByText("Información adicional")).toBeDefined();
  });

  it("axe: trigger no violations", async () => {
    const { container } = render(
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger>Acción</Tooltip.Trigger>
          <Tooltip.Content>Tooltip</Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run to confirm FAIL**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | grep -E "avatar|tooltip|FAIL"
```

- [ ] **Step 4: Implement Avatar**

Create `packages/ui/src/avatar/avatar.tsx`:

```tsx
import * as React from "react";
import * as RadixAvatar from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn.js";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "size-7",
        md: "size-9",
        lg: "size-12",
        xl: "size-16",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof RadixAvatar.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback: string;
}

export const Avatar = React.forwardRef<
  React.ElementRef<typeof RadixAvatar.Root>,
  AvatarProps
>(({ className, src, alt, fallback, size, ...props }, ref) => (
  <RadixAvatar.Root
    ref={ref}
    className={cn(avatarVariants({ size }), className)}
    {...props}
  >
    {src && (
      <RadixAvatar.Image
        src={src}
        alt={alt ?? fallback}
        className="aspect-square size-full object-cover"
      />
    )}
    <RadixAvatar.Fallback
      className="flex size-full items-center justify-center rounded-full bg-accent-surface text-[11px] font-bold text-accent"
      delayMs={src ? 300 : 0}
    >
      {fallback}
    </RadixAvatar.Fallback>
  </RadixAvatar.Root>
));
Avatar.displayName = "Avatar";
```

- [ ] **Step 5: Implement Tooltip**

Create `packages/ui/src/tooltip/tooltip.tsx`:

```tsx
import * as React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "../lib/cn.js";

const Provider = RadixTooltip.Provider;

const Root = RadixTooltip.Root;

const Trigger = React.forwardRef<
  React.ElementRef<typeof RadixTooltip.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Trigger>
>(({ asChild = true, ...props }, ref) => (
  <RadixTooltip.Trigger ref={ref} asChild={asChild} {...props} />
));
Trigger.displayName = "Tooltip.Trigger";

const Content = React.forwardRef<
  React.ElementRef<typeof RadixTooltip.Content>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <RadixTooltip.Portal>
    <RadixTooltip.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-w-xs rounded-lg border border-border-subtle bg-bg-elevated px-2.5 py-1.5",
        "text-[11.5px] leading-snug text-ink shadow-lg",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    />
  </RadixTooltip.Portal>
));
Content.displayName = "Tooltip.Content";

export const Tooltip = { Provider, Root, Trigger, Content };
```

- [ ] **Step 6: Update Storybook preview to include TooltipProvider**

Modify `apps/docs/.storybook/preview.tsx` — wrap the decorator div in `Tooltip.Provider`:

```tsx
import React from "react";
import type { Preview } from "@storybook/react";
import { Tooltip } from "@studio/ui";
import "./app.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      defaultValue: "cockpit",
      toolbar: {
        items: ["cockpit", "test"],
        title: "Tema",
      },
    },
  },
  parameters: {
    viewport: {
      viewports: {
        mobile375: {
          name: "Mobile 375",
          styles: { width: "375px", height: "667px" },
          type: "mobile",
        },
        mobile414: {
          name: "Mobile-L 414",
          styles: { width: "414px", height: "896px" },
          type: "mobile",
        },
        tablet768: {
          name: "Tablet 768",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop1280: {
          name: "Desktop 1280",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
        desktop1440: {
          name: "Desktop 1440",
          styles: { width: "1440px", height: "900px" },
          type: "desktop",
        },
      },
      defaultViewport: "mobile375",
    },
  },
  decorators: [
    (Story, ctx) => (
      <Tooltip.Provider>
        <div data-theme={ctx.globals.theme} style={{ background: "var(--bg-base)", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 580, margin: "0 auto" }}>
            <Story />
          </div>
        </div>
      </Tooltip.Provider>
    ),
  ],
};

export default preview;
```

**IMPORTANT:** After editing preview.tsx, verify Storybook still builds:

```bash
pnpm --filter @studio/docs build-storybook 2>&1 | tail -5
```

Expected: exit 0.

- [ ] **Step 7: Run all tests — pass**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | tail -20
```

Expected: avatar 3/3, tooltip 2/2, cumulative 27+ tests.

- [ ] **Step 8: Write stories**

Create `packages/ui/src/avatar/avatar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./avatar.js";

const meta: Meta<typeof Avatar> = {
  title: "Fundamentos/Avatar",
  component: Avatar,
};
export default meta;
type S = StoryObj<typeof Avatar>;

export const Fallback: S = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar fallback="MP" aria-label="Mario Pérez" size="sm" />
      <Avatar fallback="MP" aria-label="Mario Pérez" size="md" />
      <Avatar fallback="MP" aria-label="Mario Pérez" size="lg" />
      <Avatar fallback="MP" aria-label="Mario Pérez" size="xl" />
    </div>
  ),
};

export const AgentAvatars: S = {
  render: () => (
    <div className="flex items-center gap-2">
      {["PA", "AR", "HU", "CO", "VA"].map((initials) => (
        <Avatar key={initials} fallback={initials} aria-label={`Agente ${initials}`} />
      ))}
    </div>
  ),
};
```

Create `packages/ui/src/tooltip/tooltip.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./tooltip.js";
import { Button } from "../button/button.js";

const meta: Meta = { title: "Fundamentos/Tooltip" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => (
    <div className="flex justify-center py-8">
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button variant="outline" size="sm">Exportar</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Exporta el resultado como CSV</Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
};
```

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/avatar/ packages/ui/src/tooltip/ packages/ui/package.json pnpm-lock.yaml apps/docs/.storybook/preview.tsx
git commit -m "feat(ui): Avatar, Tooltip — Radix wrappers; TooltipProvider in Storybook decorator"
```

---

### Task 6: Alert + Legend

**Files:**
- Create: `packages/ui/src/alert/alert.tsx`
- Create: `packages/ui/src/alert/alert.test.tsx`
- Create: `packages/ui/src/alert/alert.stories.tsx`
- Create: `packages/ui/src/legend/legend.tsx`
- Create: `packages/ui/src/legend/legend.test.tsx`
- Create: `packages/ui/src/legend/legend.stories.tsx`

**Interfaces:**
- Consumes: `Tone` from `trace-log.variants.js`, `StatusDot` from `../status-dot/status-dot.js`
- Produces: `Alert` compound (`Alert.Root`, `Alert.Title`, `Alert.Description`), `Legend`

- [ ] **Step 1: Write failing tests**

Create `packages/ui/src/alert/alert.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Alert } from "./alert.js";

describe("Alert", () => {
  it("renders title and description", () => {
    render(
      <Alert.Root tone="warn">
        <Alert.Title>Geometría faltante</Alert.Title>
        <Alert.Description>3 predios sin geometría detectados.</Alert.Description>
      </Alert.Root>,
    );
    expect(screen.getByText("Geometría faltante")).toBeDefined();
    expect(screen.getByText(/3 predios/)).toBeDefined();
  });

  it("has role=alert", () => {
    render(<Alert.Root tone="block"><Alert.Title>Error</Alert.Title></Alert.Root>);
    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("onDismiss shows dismiss button and calls handler", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Alert.Root tone="info" onDismiss={onDismiss}>
        <Alert.Title>Info</Alert.Title>
      </Alert.Root>,
    );
    const btn = screen.getByRole("button", { name: /cerrar|dismiss/i });
    await user.click(btn);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("axe: no violations across tones", async () => {
    const { container } = render(
      <div>
        {(["ok", "warn", "block", "review", "info"] as const).map((tone) => (
          <Alert.Root key={tone} tone={tone}>
            <Alert.Title>Título {tone}</Alert.Title>
            <Alert.Description>Descripción del alerta.</Alert.Description>
          </Alert.Root>
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

Create `packages/ui/src/legend/legend.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Legend } from "./legend.js";

describe("Legend", () => {
  const items = [
    { tone: "ok" as const, label: "Validado" },
    { tone: "warn" as const, label: "Revisar" },
    { tone: "block" as const, label: "Bloqueado" },
  ];

  it("renders all items with labels", () => {
    render(<Legend items={items} />);
    expect(screen.getByText("Validado")).toBeDefined();
    expect(screen.getByText("Revisar")).toBeDefined();
    expect(screen.getByText("Bloqueado")).toBeDefined();
  });

  it("axe: no violations", async () => {
    const { container } = render(<Legend items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | grep -E "alert|legend|FAIL"
```

- [ ] **Step 3: Implement Alert**

Create `packages/ui/src/alert/alert.tsx`:

```tsx
import * as React from "react";
import { X, Info, CheckCircle2, Eye, AlertTriangle, OctagonX } from "lucide-react";
import { cn } from "../lib/cn.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

const toneStyles: Record<Tone, { root: string; icon: string }> = {
  info: {
    root: "border-border-default bg-surface-2 text-ink",
    icon: "text-info",
  },
  ok: {
    root: "border-ok/40 bg-ok/10 text-ink",
    icon: "text-ok",
  },
  review: {
    root: "border-review/40 bg-review/10 text-ink",
    icon: "text-review",
  },
  warn: {
    root: "border-warn/40 bg-warn/10 text-ink",
    icon: "text-warn",
  },
  block: {
    root: "border-block/40 bg-block/10 text-ink",
    icon: "text-block",
  },
};

const ToneIcon: Record<Tone, React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>> = {
  info: Info,
  ok: CheckCircle2,
  review: Eye,
  warn: AlertTriangle,
  block: OctagonX,
};

interface AlertRootProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  onDismiss?: () => void;
}

const Root = React.forwardRef<HTMLDivElement, AlertRootProps>(
  ({ className, tone = "info", onDismiss, children, ...props }, ref) => {
    const Icon = ToneIcon[tone];
    const styles = toneStyles[tone];
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex gap-3 rounded-xl border p-4",
          styles.root,
          className,
        )}
        {...props}
      >
        <Icon className={cn("mt-0.5 size-4 shrink-0", styles.icon)} aria-hidden />
        <div className="min-w-0 flex-1">{children}</div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar alerta"
            className="absolute right-3 top-3 rounded p-0.5 text-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </div>
    );
  },
);
Root.displayName = "Alert.Root";

const Title = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm font-semibold", className)} {...props}>{children}</p>
);
Title.displayName = "Alert.Title";

const Description = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mt-1 text-sm text-dim", className)} {...props}>{children}</p>
);
Description.displayName = "Alert.Description";

export const Alert = { Root, Title, Description };
```

**Note about opacity modifiers (`/40`, `/10`):** If `border-ok/40` or `bg-ok/10` generate incorrect colors (some Tailwind v4 + CSS custom property combinations need explicit color-mix support), replace with:
```tsx
ok: {
  root: "border-border-default bg-surface-3 text-ink",
  icon: "text-ok",
},
```
Run the story in Storybook to verify visually — the ok alert should have a subtle green tint, not be transparent.

- [ ] **Step 4: Implement Legend**

Create `packages/ui/src/legend/legend.tsx`:

```tsx
import * as React from "react";
import { cn } from "../lib/cn.js";
import { StatusDot } from "../status-dot/status-dot.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export interface LegendItem {
  tone: Tone;
  label: string;
}

export interface LegendProps extends React.HTMLAttributes<HTMLDivElement> {
  items: LegendItem[];
  orientation?: "horizontal" | "vertical";
}

export const Legend = React.forwardRef<HTMLDivElement, LegendProps>(
  ({ className, items, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-2",
        orientation === "vertical" && "flex-col",
        className,
      )}
      {...props}
    >
      {items.map(({ tone, label }) => (
        <div key={tone} className="flex items-center gap-1.5">
          <StatusDot tone={tone} size="sm" aria-hidden />
          <span className="text-xs text-dim">{label}</span>
        </div>
      ))}
    </div>
  ),
);
Legend.displayName = "Legend";
```

- [ ] **Step 5: Run all tests — pass**

```bash
pnpm --filter @studio/ui test -- --reporter=verbose 2>&1 | tail -20
```

Expected: alert 4/4, legend 2/2, cumulative 33+ tests.

- [ ] **Step 6: Write stories**

Create `packages/ui/src/alert/alert.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./alert.js";

const meta: Meta = { title: "Fundamentos/Alert" };
export default meta;
type S = StoryObj;

export const AllTones: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert.Root tone="info">
        <Alert.Title>Info</Alert.Title>
        <Alert.Description>Pipeline iniciado correctamente.</Alert.Description>
      </Alert.Root>
      <Alert.Root tone="ok">
        <Alert.Title>Completado</Alert.Title>
        <Alert.Description>138 predios validados sin errores.</Alert.Description>
      </Alert.Root>
      <Alert.Root tone="review">
        <Alert.Title>En revisión</Alert.Title>
        <Alert.Description>El agente HUMAN requiere confirmación.</Alert.Description>
      </Alert.Root>
      <Alert.Root tone="warn">
        <Alert.Title>Advertencia</Alert.Title>
        <Alert.Description>3 predios sin geometría detectados.</Alert.Description>
      </Alert.Root>
      <Alert.Root tone="block">
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>Predio 142099 no existe en catastro.</Alert.Description>
      </Alert.Root>
    </div>
  ),
};

export const Dismissible: S = {
  render: () => (
    <Alert.Root tone="warn" onDismiss={() => {}}>
      <Alert.Title>Advertencia</Alert.Title>
      <Alert.Description>3 predios sin geometría.</Alert.Description>
    </Alert.Root>
  ),
};
```

Create `packages/ui/src/legend/legend.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Legend } from "./legend.js";

const meta: Meta<typeof Legend> = {
  title: "Agent-ops/Legend",
  component: Legend,
};
export default meta;
type S = StoryObj<typeof Legend>;

const STATUS_ITEMS = [
  { tone: "ok" as const, label: "Validado" },
  { tone: "review" as const, label: "En revisión" },
  { tone: "warn" as const, label: "Advertencia" },
  { tone: "block" as const, label: "Bloqueado" },
  { tone: "info" as const, label: "Sin datos" },
];

export const Horizontal: S = {
  render: () => <Legend items={STATUS_ITEMS} />,
};

export const Vertical: S = {
  render: () => <Legend items={STATUS_ITEMS} orientation="vertical" />,
};
```

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/alert/ packages/ui/src/legend/
git commit -m "feat(ui): Alert compound and Legend — tone-aware feedback + status map legend"
```

---

### Task 7: Wire exports + full pipeline check

**Files:**
- Modify: `packages/ui/src/index.ts` — add all new component exports

**Interfaces:**
- No new code — this task wires everything into the public API and verifies the build pipeline.

- [ ] **Step 1: Write failing test (import from index)**

Add to end of `packages/ui/src/lib/cn.test.ts` (temporary smoke — remove after):

Actually: skip writing a new test here. The export wiring is verified by the build (`tsc --noEmit` would catch a bad re-export). Jump straight to implementation.

- [ ] **Step 2: Update index.ts**

Replace full content of `packages/ui/src/index.ts`:

```ts
export { cn } from "./lib/cn.js";

// TraceLog
export { TraceLog } from "./trace-log/trace-log.js";
export type { Tone, Density } from "./trace-log/trace-log.variants.js";

// Button
export { Button, buttonVariants } from "./button/button.js";
export type { ButtonProps } from "./button/button.js";

// Badge
export { Badge } from "./badge/badge.js";
export type { BadgeProps, BadgeTone } from "./badge/badge.js";

// StatusDot
export { StatusDot } from "./status-dot/status-dot.js";
export type { StatusDotProps } from "./status-dot/status-dot.js";

// Input / Textarea / Field
export { Input, Textarea, Field } from "./input/input.js";
export type { InputProps, TextareaProps, FieldProps } from "./input/input.js";

// Card
export { Card } from "./card/card.js";

// Separator
export { Separator } from "./separator/separator.js";
export type { SeparatorProps } from "./separator/separator.js";

// Avatar
export { Avatar } from "./avatar/avatar.js";
export type { AvatarProps } from "./avatar/avatar.js";

// Tooltip
export { Tooltip } from "./tooltip/tooltip.js";

// Alert
export { Alert } from "./alert/alert.js";

// Legend
export { Legend } from "./legend/legend.js";
export type { LegendProps, LegendItem } from "./legend/legend.js";
```

- [ ] **Step 3: Run full pipeline**

```bash
pnpm turbo run build lint test 2>&1 | tail -30
```

Expected output (all pass):
```
Tasks:    X successful, X total
Cached:   X cached, X total
Time:     Xs
```

If lint fails with no-hex violations in Alert (from opacity shorthand like `/40`), replace the affected tone styles with the alternative shown in Task 6 Step 3 note.

If build fails with missing type, check that all exported types in index.ts match exactly the interface names defined in each component file.

- [ ] **Step 4: Verify Storybook builds with all new stories**

```bash
pnpm --filter @studio/docs build-storybook 2>&1 | tail -10
```

Expected: exit 0. Story count should be higher than before (was 6 stories for TraceLog; now 6 + ~14 new = 20+).

- [ ] **Step 5: Final commit**

```bash
git add packages/ui/src/index.ts
git commit -m "feat(ui): wire all sp#2 component exports — Button/Badge/StatusDot/Input/Card/Separator/Avatar/Tooltip/Alert/Legend"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Badge — `packages/ui/src/badge/badge.tsx` (Task 2)
- ✅ StatusDot — `packages/ui/src/status-dot/status-dot.tsx` (Task 2)
- ✅ Legend — `packages/ui/src/legend/legend.tsx` (Task 6)
- ✅ Base primitives (Button, Input, Card, Separator, Avatar, Tooltip, Alert) — Tasks 1,3,4,5,6
- ✅ All use existing token CSS classes (no hex)
- ✅ forwardRef on all DOM-wrapping components
- ✅ axe gate in each test suite
- ✅ Storybook story per component

**Placeholder scan:** Clean — all steps have complete code.

**Type consistency:**
- `Tone` imported from `trace-log.variants.js` in Badge, StatusDot, Alert, Legend — same source
- `BadgeTone = Tone | "neutral"` — Badge-specific extension
- `LegendItem.tone: Tone` — consistent
- `buttonVariants` exported for potential reuse in Task 6 Alert dismiss button (not used — Alert uses its own inline button; `buttonVariants` export kept for consumer flexibility)
