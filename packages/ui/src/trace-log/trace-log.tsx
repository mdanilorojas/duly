import * as React from "react";
import { Info, CheckCircle2, Eye, AlertTriangle, OctagonX, ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "../lib/cn.js";
import { DensityContext, StreamingContext } from "./trace-log.context.js";
import { bodyVariants, rowVariants, toneText, type Density, type Tone } from "./trace-log.variants.js";
import { toneLabel } from "./copy.js";

// Public API — streaming is a Root-level concern; Body reads it via StreamingContext.
export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: Density;
  streaming?: boolean;
}

// Root provides both DensityContext and StreamingContext so any descendant Body
// (not just a direct child) receives the correct aria-live value.
const Root = React.forwardRef<HTMLDivElement, RootProps>(
  ({ density = "comfortable", streaming = false, className, children, ...rest }, ref) => (
    <DensityContext.Provider value={density}>
      <StreamingContext.Provider value={streaming}>
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
      </StreamingContext.Provider>
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

interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: number;
}

// Body reads StreamingContext and sets aria-live on itself:
//   • "polite"  — streaming=true (announce new rows to AT as they arrive)
//   • "off"     — streaming=false (suppress the implicit polite of role="log"
//                  so a static/finished log does not re-announce on re-render)
//
// When maxHeight is provided the ref forwards to the ScrollArea.Viewport (the
// scrollable element) so consumers can auto-scroll to bottom via ref.current.scrollTop.
const Body = React.forwardRef<HTMLDivElement, BodyProps>(
  ({ className, children, maxHeight, ...rest }, ref) => {
    const density = React.useContext(DensityContext);
    const streaming = React.useContext(StreamingContext);

    if (!maxHeight) {
      return (
        <div
          ref={ref}
          role="log"
          aria-live={streaming ? "polite" : "off"}
          className={cn(bodyVariants({ density }), className)}
          {...rest}
        >
          {children}
        </div>
      );
    }

    // maxHeight caps, not fixes: ScrollArea.Root has no explicit height so it
    // shrinks to content; Viewport carries the cap so scrolling triggers only
    // when content exceeds maxHeight.
    return (
      <ScrollArea.Root className="overflow-hidden">
        <ScrollArea.Viewport
          ref={ref as React.Ref<HTMLDivElement>}
          style={{ maxHeight }}
          className="w-full"
        >
          <div
            role="log"
            aria-live={streaming ? "polite" : "off"}
            className={cn(bodyVariants({ density }), className)}
            {...rest}
          >
            {children}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="flex w-2 touch-none select-none">
          <ScrollArea.Thumb className="flex-1 rounded-full bg-border-divider" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    );
  },
);
Body.displayName = "TraceLog.Body";

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

// Defensive tone normalization: a JS consumer (no TS) could pass any string.
// Unknown tones degrade to "info" so Icon is never undefined (avoids React crash).
const Row = React.forwardRef<HTMLDivElement, RowProps>(
  ({ tone = "info", agent, step, timestamp, className, children, ...rest }, ref) => {
    const t: Tone = (tone in toneIcon) ? tone : "info";
    const Icon = toneIcon[t];
    const meta = timestamp ?? step ?? "";
    return (
      <div ref={ref} data-tone={t} className={cn(rowVariants({ tone: t }), className)} {...rest}>
        <div className="flex items-center justify-between gap-2 font-mono text-[8.5px] uppercase tracking-wide text-faint">
          <span className={cn("flex items-center gap-1.5 font-bold", toneText[t])}>
            <Icon className="size-3" aria-hidden />
            <span className="sr-only">{toneLabel[t]}: </span>
            <span>{agent}</span>
          </span>
          {meta ? <span>{meta}</span> : null}
        </div>
        <div className="mt-1 text-xs leading-relaxed text-ink">{children}</div>
      </div>
    );
  },
);
Row.displayName = "TraceLog.Row";

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-accent-surface px-1.5 py-px font-mono text-[11px] text-review">{children}</code>
);
Code.displayName = "TraceLog.Code";

interface DetailProps {
  children: React.ReactNode;
  /** Optional accessible label for the trigger. Use when multiple Detail
   *  triggers appear in one log so screen-reader users can distinguish them.
   *  Defaults to "detalle". */
  label?: string;
}

// Focus ring: keeps focus-visible:ring-2 for pointer-based UAs AND adds
// focus-visible:outline-2/offset-2/outline-ring as a guaranteed fallback
// so focus is always visible even when ring utilities are absent (WCAG 2.4.7).
const Detail = ({ children, label }: DetailProps) => (
  <Collapsible.Root className="mt-1">
    <Collapsible.Trigger
      aria-label={label ?? "detalle"}
      className="inline-flex items-center gap-1 font-mono text-[10px] text-faint hover:text-dim focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded"
    >
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
    className="mt-1 w-full rounded-md border border-border-subtle py-1.5 text-[11px] text-dim hover:border-border-strong hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  >
    {children}
  </button>
);
Truncated.displayName = "TraceLog.Truncated";

export const TraceLog = { Root, Header, Body, Row, Code, Detail, Empty, Truncated };
