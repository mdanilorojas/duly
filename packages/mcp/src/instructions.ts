/** Keep this list aligned with AgentOpsCockpit in packages/ui. */
export const DEMO_COMPOSITION = [
  "AgentOpsCockpit",
  "AgentMetricRow",
  "AgentMetric",
  "RunTimeline",
  "HumanInterruptQueue",
  "GuardrailIndicator",
  "TokenCostMeter",
  "TraceLog",
] as const;

export interface GenerateUiInstructions {
  summary: string;
  packageName: "@enregla-ui/duly-ui";
  styles: string[];
  themeAttribute: string;
  composition: readonly string[];
  example: string;
  accessibility: string[];
  limitations: string[];
}

export const GENERATE_UI: GenerateUiInstructions = {
  summary:
    "Render the public agent-ops cockpit by mounting AgentOpsCockpit from @enregla-ui/duly-ui. Do not invent a parallel layout with raw colors.",
  packageName: "@enregla-ui/duly-ui",
  styles: ["@enregla-ui/duly-ui/styles.css", "@enregla-ui/duly-ui/reset.css"],
  themeAttribute: 'data-theme="cockpit"',
  composition: DEMO_COMPOSITION,
  example: `import "@enregla-ui/duly-ui/styles.css";
import "@enregla-ui/duly-ui/reset.css";
import { AgentOpsCockpit, CopyProvider } from "@enregla-ui/duly-ui";

export function Demo() {
  return (
    <CopyProvider locale="en">
      <div data-theme="cockpit" lang="en">
        <AgentOpsCockpit />
      </div>
    </CopyProvider>
  );
}`,
  accessibility: [
    "Set data-theme on an ancestor so semantic tokens resolve. The cockpit story uses cockpit.",
    "Use token utilities (text-ink, bg-surface-2, border-border-subtle, text-ok, text-warn, text-block). Do not write hex or rgb colors in component code.",
    "Status is never color alone. NodeStatusBadge, GuardrailIndicator, TraceLog.Row, and approval actions already include text or an icon with a text label.",
    "Give the page one h1. Name sections with headings or aria-label.",
    "Approval rows are buttons. Reach them with Tab, expand with Enter, then activate Approve, Reject, or Escalate with the keyboard.",
    "A block-risk approval asks for a second confirmation before it commits. Do not remove that step.",
    "Leave focus outlines on the ring token. Do not set outline: none without a replacement.",
    "Motion tokens collapse under prefers-reduced-motion. Do not add a custom animation that ignores that.",
    "The cockpit sets lang=\"en\" because its sample copy is English.",
  ],
  limitations: [
    "This server returns tokens, a curated component inventory, and composition instructions. It does not render React, call a model, or attach to a live agent runtime.",
    "The inventory is a hand-maintained list of agent-ops components and a few primitives. It is not every export in @enregla-ui/duly-ui, and it does not include prop types. Read the TypeScript source for props.",
    "Hex values are the CSS fallback. The oklch field is parsed from the theme stylesheet, which is what supporting browsers use.",
    "AgentOpsCockpit shows fictional sample operations. Approve, reject, and escalate update local component state only.",
    "There is no hosted demo URL in this repo. Run Storybook or the showcase locally.",
  ],
};
