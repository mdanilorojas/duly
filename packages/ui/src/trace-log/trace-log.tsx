import * as React from "react";
import { Info, CheckCircle2, Eye, AlertTriangle, OctagonX } from "lucide-react";
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
type BodyProps = React.HTMLAttributes<HTMLDivElement>;

const Body = ({ className, children, ...rest }: BodyProps) => {
  const density = React.useContext(DensityContext);
  return (
    <div role="log" className={cn(bodyVariants({ density }), className)} {...rest}>
      {children}
    </div>
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

export const TraceLog = { Root: RootWithStreaming, Header, Body, Row, Code };
