import * as React from "react";
import { cn } from "../lib/cn.js";
import { DensityContext } from "./trace-log.context.js";
import { bodyVariants, type Density } from "./trace-log.variants.js";

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

interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  streaming?: boolean;
}

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

export const TraceLog = { Root: RootWithStreaming, Header, Body };
