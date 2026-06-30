import * as React from "react";
import { Info, CheckCircle2, Eye, AlertTriangle, OctagonX, ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "../lib/cn.js";
import { DensityContext } from "./trace-log.context.js";
import { bodyVariants, rowVariants, toneText, type Density, type Tone } from "./trace-log.variants.js";
import { toneLabel } from "./copy.js";

// Public API shape includes streaming (consumed by RootWithStreaming, not forwarded to DOM).
export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: Density;
  streaming?: boolean;
}

// Internal base — no streaming prop, no DOM bleed.
interface BaseRootProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: Density;
}

const Root = React.forwardRef<HTMLDivElement, BaseRootProps>(
  ({ density = "comfortable", className, children, ...rest }, ref) => (
    <DensityContext.Provider value={density}>
      <section
        ref={ref}
        data-density={density}
        className={cn(
          "overflow-hidden rounded-xl border border-border-subtle bg-surface-2",
          className,
        )}
        {...rest}
      >
        {children}
      </section>
    </DensityContext.Provider>
  ),
);
Root.displayName = "TraceLog.Root";

interface HeaderProps {
  title: string;
  hint?: string;
}

const Header = ({ title, hint }: HeaderProps) => (
  <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-header px-3.5 py-2.5">
    <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
    {hint ? <span className="font-mono text-[11px] text-faint">{hint}</span> : null}
  </div>
);
Header.displayName = "TraceLog.Header";

// streaming is a Root-only concern — removed from BodyProps to prevent DOM leakage.
interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: number;
}

const Body = ({ className, children, maxHeight, ...rest }: BodyProps) => {
  const density = React.useContext(DensityContext);
  const inner = (
    <div role="log" className={cn(bodyVariants({ density }), className)} {...rest}>
      {children}
    </div>
  );
  if (!maxHeight) return inner;
  return (
    <ScrollArea.Root style={{ height: maxHeight }} className="overflow-hidden">
      <ScrollArea.Viewport className="size-full">{inner}</ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" className="flex w-2 touch-none select-none">
        <ScrollArea.Thumb className="flex-1 rounded-full bg-border-divider" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
};
Body.displayName = "TraceLog.Body";

// RootWithStreaming strips `streaming` from props and injects aria-live into the Body child.
const RootWithStreaming = React.forwardRef<HTMLDivElement, RootProps>((props, ref) => {
  const { streaming, children, ...rest } = props;
  const mapped = React.Children.map(children, (child) =>
    React.isValidElement(child) &&
    (child.type as { displayName?: string })?.displayName === "TraceLog.Body"
      ? React.cloneElement(child as React.ReactElement<BodyProps>, {
          "aria-live": streaming ? "polite" : undefined,
        } as Partial<BodyProps> & { "aria-live"?: "polite" })
      : child,
  );
  return (
    <Root ref={ref} {...rest}>
      {mapped}
    </Root>
  );
});
RootWithStreaming.displayName = "TraceLog.Root";

const toneIcon: Record<Tone, React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>> = {
  info: Info,
  ok: CheckCircle2,
  review: Eye,
  warn: AlertTriangle,
  block: OctagonX,
};

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  agent: string;
  step?: string;
  timestamp?: string;
}

const Row = ({ tone = "info", agent, step, timestamp, className, children, ...rest }: RowProps) => {
  const Icon = toneIcon[tone];
  const meta = timestamp ?? step ?? "";
  return (
    <div data-tone={tone} className={cn(rowVariants({ tone }), className)} {...rest}>
      <div className="flex items-center justify-between gap-2 font-mono text-[8.5px] uppercase tracking-wide text-faint">
        <span className={cn("flex items-center gap-1.5 font-bold", toneText[tone])}>
          <Icon className="size-3" aria-hidden />
          <span className="sr-only">{toneLabel[tone]}: </span>
          <span>{agent}</span>
        </span>
        {meta ? <span>{meta}</span> : null}
      </div>
      <div className="mt-1 text-xs leading-relaxed text-ink">{children}</div>
    </div>
  );
};
Row.displayName = "TraceLog.Row";

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-accent-surface px-1.5 py-px font-mono text-[11px] text-review">{children}</code>
);
Code.displayName = "TraceLog.Code";

const Detail = ({ children }: { children: React.ReactNode }) => (
  <Collapsible.Root className="mt-1">
    <Collapsible.Trigger className="inline-flex items-center gap-1 font-mono text-[10px] text-faint hover:text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
      <ChevronDown className="size-3" aria-hidden /> detalle
    </Collapsible.Trigger>
    <Collapsible.Content className="mt-2 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-[11.5px] leading-relaxed text-dim">
      {children}
    </Collapsible.Content>
  </Collapsible.Root>
);
Detail.displayName = "TraceLog.Detail";

const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="px-1 py-6 text-center text-xs text-faint">{children}</div>
);
Empty.displayName = "TraceLog.Empty";

const Truncated = ({ children, onShowAll }: { children: React.ReactNode; onShowAll?: () => void }) => (
  <button
    type="button"
    onClick={onShowAll}
    className="mt-1 w-full rounded-md border border-border-subtle py-1.5 text-[11px] text-dim hover:border-border-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    {children}
  </button>
);
Truncated.displayName = "TraceLog.Truncated";

export const TraceLog = { Root: RootWithStreaming, Header, Body, Row, Code, Detail, Empty, Truncated };
