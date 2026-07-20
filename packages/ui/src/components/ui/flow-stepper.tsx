"use client";

import type { HTMLAttributes } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import * as Stepperize from "@stepperize/react";

import { cn } from "@/lib/utils";

// Types
type FlowStepperOrientation = "horizontal" | "vertical";
type FlowStepState = "active" | "completed" | "inactive" | "loading";
type FlowStepIndicators = {
  active?: React.ReactNode;
  completed?: React.ReactNode;
  inactive?: React.ReactNode;
  loading?: React.ReactNode;
};

type FlowStepDefinition = {
  id: string;
  title?: string;
  description?: string;
  icon?: React.ReactElement;
};

interface FlowStepperContextValue {
  stepper: ReturnType<ReturnType<typeof Stepperize.defineStepper>["useStepper"]>;
  steps: FlowStepDefinition[];
  orientation: FlowStepperOrientation;
  configOrientation: FlowStepperOrientation;
  responsive?: boolean;
  registerTrigger: (node: HTMLButtonElement | null, remove?: boolean) => void;
  triggerNodes: HTMLButtonElement[];
  focusNext: (currentIdx: number) => void;
  focusPrev: (currentIdx: number) => void;
  focusFirst: () => void;
  focusLast: () => void;
  indicators: FlowStepIndicators;
}

interface FlowStepItemContextValue {
  step: FlowStepDefinition;
  index: number;
  state: FlowStepState;
  isDisabled: boolean;
  isLoading: boolean;
}

const FlowStepperContext = createContext<FlowStepperContextValue | undefined>(undefined);

const FlowStepItemContext = createContext<FlowStepItemContextValue | undefined>(undefined);

function useFlowStepper() {
  const ctx = useContext(FlowStepperContext);

  if (!ctx) throw new Error("useFlowStepper must be used within a FlowStepper");

  return ctx;
}

function useFlowStepItem() {
  const ctx = useContext(FlowStepItemContext);

  if (!ctx) throw new Error("useFlowStepItem must be used within a FlowStepperItem");

  return ctx;
}

interface FlowStepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: FlowStepDefinition[];
  defaultValue?: string;
  orientation?: FlowStepperOrientation;
  responsive?: boolean;
  indicators?: FlowStepIndicators;
  value?: string;
  onValueChange?: (value: string) => void;
}

function FlowStepper({
  steps,
  defaultValue,
  orientation = "horizontal",
  responsive = false,
  className,
  children,
  indicators = {},
  value,
  onValueChange,
  ...props
}: FlowStepperProps) {
  // Define stepper once — steps are expected to be stable references
  const stepperDefRef = useRef<ReturnType<typeof Stepperize.defineStepper<FlowStepDefinition[]>> | null>(null);

  if (stepperDefRef.current === null) {
    stepperDefRef.current = Stepperize.defineStepper(steps);
  }

  const stepper = stepperDefRef.current!.useStepper({ defaultStep: defaultValue || steps[0]?.id });

  const [triggerNodes, setTriggerNodes] = useState<HTMLButtonElement[]>([]);

  // Track viewport breakpoint (tailwind md = 768px). If `responsive` is true
  // and the configured orientation is horizontal, switch to vertical on
  // Viewport width smaller than md.
  const [isMdUp, setIsMdUp] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true
  );

  useEffect(() => {
    if (!responsive) return;

    const mql = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMdUp("matches" in e ? e.matches : mql.matches);

    if ("addEventListener" in mql) {
      // modern browsers

      mql.addEventListener("change", handler);
    } else {
      // fallback
      // @ts-expect-error - legacy
      mql.addListener(handler);
    }

    return () => {
      if ("removeEventListener" in mql) {
        mql.removeEventListener("change", handler);
      } else {
        // @ts-expect-error - legacy
        mql.removeListener(handler);
      }
    };
  }, [responsive]);

  // Register/unregister triggers
  const registerTrigger = useCallback((node: HTMLButtonElement | null, remove = false) => {
    setTriggerNodes((prev) => {
      if (!node) return prev;

      if (remove) return prev.filter((n) => n !== node);

      return prev.includes(node) ? prev : [...prev, node];
    });
  }, []);

  // Keyboard navigation logic
  const focusNext = useCallback(
    (currentIdx: number) => triggerNodes[(currentIdx + 1) % triggerNodes.length]?.focus(),
    [triggerNodes]
  );

  const focusPrev = useCallback(
    (currentIdx: number) => triggerNodes[(currentIdx - 1 + triggerNodes.length) % triggerNodes.length]?.focus(),
    [triggerNodes]
  );

  const focusFirst = useCallback(() => triggerNodes[0]?.focus(), [triggerNodes]);

  const focusLast = useCallback(() => triggerNodes[triggerNodes.length - 1]?.focus(), [triggerNodes]);

  // Determine effective orientation when responsive behavior is enabled.
  const effectiveOrientation: FlowStepperOrientation = useMemo(() => {
    if (responsive && orientation === "horizontal") {
      return isMdUp ? "horizontal" : "vertical";
    }

    return orientation;
  }, [responsive, orientation, isMdUp]);

  // Context value
  const contextValue = useMemo<FlowStepperContextValue>(
    () => ({
      stepper,
      steps,
      orientation: effectiveOrientation,
      configOrientation: orientation,
      responsive,
      registerTrigger,
      focusNext,
      focusPrev,
      focusFirst,
      focusLast,
      triggerNodes,
      indicators,
    }),
    [
      stepper,
      steps,
      effectiveOrientation,
      orientation,
      responsive,
      registerTrigger,
      focusNext,
      focusPrev,
      focusFirst,
      focusLast,
      triggerNodes,
      indicators,
    ]
  );

  // Controlled behavior: if `value` is provided, navigate to it when it changes
  useEffect(() => {
    if (typeof value === "string" && value !== stepper.id) {
      void stepper.goTo(value);
    }
  }, [value]);

  // Notify parent when internal step changes
  useEffect(() => {
    onValueChange?.(stepper.id);
  }, [stepper.id]);

  return (
    <FlowStepperContext.Provider value={contextValue}>
      <div
        role="tablist"
        aria-orientation={effectiveOrientation}
        data-slot="flow-stepper"
        className={cn("w-full", className)}
        data-orientation={effectiveOrientation}
        {...props}
      >
        {children}
      </div>
    </FlowStepperContext.Provider>
  );
}

interface FlowStepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  stepId: string;
  completed?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

function FlowStepperItem({
  stepId,
  completed = false,
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}: FlowStepperItemProps) {
  const { stepper, steps } = useFlowStepper();
  const stepIndex = steps.findIndex((s) => s.id === stepId);
  const currentIndex = stepper.index;
  const step = steps.find((s) => s.id === stepId)!;

  const state: FlowStepState =
    completed || stepIndex < currentIndex ? "completed" : currentIndex === stepIndex ? "active" : "inactive";

  const isLoading = loading && currentIndex === stepIndex;

  return (
    <FlowStepItemContext.Provider value={{ step, index: stepIndex, state, isDisabled: disabled, isLoading }}>
      <div
        data-slot="flow-stepper-item"
        className={cn(
          "group/step flex items-center justify-center not-last:flex-1 group-data-[orientation=horizontal]/flow-stepper-nav:flex-row group-data-[orientation=vertical]/flow-stepper-nav:flex-col",
          className
        )}
        data-state={state}
        {...(isLoading ? { "data-loading": true } : {})}
        {...props}
      >
        {children}
      </div>
    </FlowStepItemContext.Provider>
  );
}

interface FlowStepperTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function FlowStepperTrigger({ asChild = false, className, children, tabIndex, ...props }: FlowStepperTriggerProps) {
  const { state, isLoading } = useFlowStepItem();
  const { stepper, registerTrigger, triggerNodes, focusNext, focusPrev, focusFirst, focusLast } = useFlowStepper();

  const { step, isDisabled } = useFlowStepItem();
  const isSelected = stepper.id === step.id;
  const id = `flow-stepper-tab-${step.id}`;
  const panelId = `flow-stepper-panel-${step.id}`;

  // Register this trigger via callback ref for correct mount/unmount handling
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const triggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (node) {
        btnRef.current = node;
        registerTrigger(node);
      } else if (btnRef.current) {
        registerTrigger(btnRef.current, true);
        btnRef.current = null;
      }
    },
    [registerTrigger]
  );

  // Find our index among triggers for navigation
  const myIdx = useMemo(() => triggerNodes.findIndex((n: HTMLButtonElement) => n === btnRef.current), [triggerNodes]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        if (myIdx !== -1 && focusNext) focusNext(myIdx);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        if (myIdx !== -1 && focusPrev) focusPrev(myIdx);
        break;
      case "Home":
        e.preventDefault();
        if (focusFirst) focusFirst();
        break;
      case "End":
        e.preventDefault();
        if (focusLast) focusLast();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        void stepper.goTo(step.id);
        break;
    }
  };

  if (asChild) {
    return (
      <span data-slot="flow-stepper-trigger" data-state={state} className={className}>
        {children}
      </span>
    );
  }

  return (
    <button
      ref={triggerRef}
      role="tab"
      id={id}
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={typeof tabIndex === "number" ? tabIndex : isSelected ? 0 : -1}
      data-slot="flow-stepper-trigger"
      data-state={state}
      data-loading={isLoading}
      className={cn(
        "inline-flex cursor-pointer items-center outline-none disabled:pointer-events-none disabled:opacity-60",
        "gap-2.5 rounded-full",
        className
      )}
      onClick={() => void stepper.goTo(step.id)}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
}

interface FlowStepperIndicatorProps extends React.ComponentProps<"div"> {
  variant?: "default" | "outline";
}

function FlowStepperIndicator({ children, className, variant = "default" }: FlowStepperIndicatorProps) {
  const { state, isLoading, step } = useFlowStepItem();
  const { indicators } = useFlowStepper();

  const base =
    "relative flex size-8 shrink-0 items-center justify-center overflow-hidden transition-all duration-300 rounded-md text-sm font-medium";

  const defaultClasses = cn(
    "border-bg-base bg-surface-2 data-[state=completed]:bg-accent data-[state=completed]:text-on-accent data-[state=active]:bg-accent data-[state=active]:text-on-accent ring-offset-bg-base group-data-[state=active]/step:ring-accent/30 group-data-[state=active]/step:ring-2 group-data-[state=active]/step:ring-offset-3",
    base
  );

  const outlineClasses = cn(
    "bg-transparent border border-accent/20 text-dim data-[state=completed]:border-ink data-[state=completed]:text-ink data-[state=active]:border-accent data-[state=active]:text-ink",
    base
  );

  const classes = variant === "outline" ? outlineClasses : defaultClasses;

  return (
    <div data-slot="flow-stepper-indicator" data-state={state} className={cn(classes, className)}>
      <div className="absolute">
        {(isLoading ? indicators?.loading : indicators?.[state]) ??
          (step?.icon ? <span className="*:[svg]:size-4">{step.icon}</span> : children)}
      </div>
    </div>
  );
}

function FlowStepperSeparator({ className }: React.ComponentProps<"div">) {
  const { state } = useFlowStepItem();

  return (
    <div
      data-slot="flow-stepper-separator"
      data-state={state}
      className={cn(
        "bg-surface-2 group-data-[state=completed]/step:bg-accent m-2 rounded-sm transition-colors duration-500 group-data-[orientation=horizontal]/flow-stepper-nav:h-0.5 group-data-[orientation=horizontal]/flow-stepper-nav:flex-1 group-data-[orientation=vertical]/flow-stepper-nav:h-12 group-data-[orientation=vertical]/flow-stepper-nav:w-0.5",
        className
      )}
    />
  );
}

function FlowStepperTitle({ children, className }: React.ComponentProps<"h3">) {
  const { state } = useFlowStepItem();

  return (
    <h3 data-slot="flow-stepper-title" data-state={state} className={cn("text-sm font-medium", className)}>
      {children}
    </h3>
  );
}

function FlowStepperDescription({ children, className }: React.ComponentProps<"div">) {
  const { state } = useFlowStepItem();

  return (
    <div
      data-slot="flow-stepper-description"
      data-state={state}
      className={cn("text-dim text-xs font-medium", className)}
    >
      {children}
    </div>
  );
}

function FlowStepperNav({ children, className }: React.ComponentProps<"nav">) {
  const { stepper, orientation, configOrientation, responsive } = useFlowStepper();

  const responsiveNavClasses = responsive && configOrientation === "horizontal" ? "flex-col md:flex-row md:w-full" : "";

  return (
    <nav
      data-slot="flow-stepper-nav"
      data-state={stepper.id}
      data-orientation={orientation}
      className={cn(
        "group/flow-stepper-nav inline-flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
        responsiveNavClasses,
        className
      )}
    >
      {children}
    </nav>
  );
}

function FlowStepperPanel({ children, className }: React.ComponentProps<"div">) {
  const { stepper } = useFlowStepper();

  return (
    <div data-slot="flow-stepper-panel" data-state={stepper.id} className={cn("w-full", className)}>
      {children}
    </div>
  );
}

interface FlowStepperContentProps extends React.ComponentProps<"div"> {
  value: string;
  forceMount?: boolean;
}

function FlowStepperContent({ value, forceMount, children, className }: FlowStepperContentProps) {
  const { stepper } = useFlowStepper();
  const isActive = value === stepper.id;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`flow-stepper-panel-${value}`}
      aria-labelledby={`flow-stepper-tab-${value}`}
      data-slot="flow-stepper-content"
      data-state={stepper.id}
      className={cn("w-full", className, !isActive && forceMount && "hidden")}
      hidden={!isActive && forceMount}
    >
      {children}
    </div>
  );
}

export {
  useFlowStepper,
  useFlowStepItem,
  FlowStepper,
  FlowStepperItem,
  FlowStepperTrigger,
  FlowStepperIndicator,
  FlowStepperSeparator,
  FlowStepperTitle,
  FlowStepperDescription,
  FlowStepperPanel,
  FlowStepperContent,
  FlowStepperNav,
  type FlowStepperProps,
  type FlowStepperItemProps,
  type FlowStepperTriggerProps,
  type FlowStepperContentProps,
};
