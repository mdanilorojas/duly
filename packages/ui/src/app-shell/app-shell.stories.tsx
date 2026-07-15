import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Activity,
  AlertTriangle,
  Award,
  Bell,
  Bot,
  ClipboardCheck,
  Factory,
  FileCheck2,
  FileClock,
  FileText,
  Fingerprint,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Radar,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";
import { AppShell } from "./app-shell.js";
import { AppSidebar, SidebarSection, SidebarItem } from "./app-sidebar.js";
import { AppTopbar, TopbarSearchButton, TopbarIconButton, DensityToggle } from "./app-topbar.js";
import { WorkspaceSwitcher, type Workspace } from "./workspace-switcher.js";
import { EnvironmentBadge } from "./environment-badge.js";
import { CommandPalette, useCommandPalette, type CommandPaletteItem } from "./command-palette.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TokenCostMeter } from "../agentic/token-cost-meter.js";
import { RunTimeline } from "../agentic/run-timeline.js";
import { EvalScoreBadge } from "../agentic/eval-score-badge.js";
import { RetentionBadge } from "../agentic/retention-badge.js";
import { RatioGauge } from "../commercial/ratio-gauge.js";

/**
 * Un solo shell, cinco productos: el mismo `AppShell` reconfigurado por datos
 * — navegación, workspace, comandos del palette y contenido — para cada caso
 * de uso construido sobre este design system. Nada del chrome se reimplementa
 * entre verticales.
 */
const meta: Meta<typeof AppShell> = {
  title: "Primitivas/Layout/App Shell/V001 Multi-espacio de trabajo",
  component: AppShell,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

type S = StoryObj<typeof AppShell>;

/* ------------------------------------------------------------------ */
/* Config por caso de uso — esto es lo único que cambia entre stories. */
/* ------------------------------------------------------------------ */

type UseCaseId = "agent-ops" | "audit" | "iso" | "quotes" | "churn";

const WORKSPACES: (Workspace & { id: UseCaseId })[] = [
  { id: "agent-ops", name: "Agent Ops", description: "Swarm orchestration console", icon: Bot },
  { id: "audit", name: "Audit & Compliance", description: "EU AI Act · SOC2 evidence", icon: ShieldCheck },
  { id: "iso", name: "ISO Readiness", description: "ISO 42001 certification", icon: Award },
  { id: "quotes", name: "Industrial Quotes", description: "RFQ → priced quote pipeline", icon: Factory },
  { id: "churn", name: "Churn Radar", description: "Retention early-warning", icon: Radar },
];

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeTone?: "info" | "ok" | "review" | "warn" | "block";
}

interface UseCaseConfig {
  sections: { label?: string; items: NavItem[] }[];
  breadcrumb: string;
  interrupts: number;
  commands: Omit<CommandPaletteItem, "onSelect">[];
  content: React.ReactNode;
}

/* --- contenido demo por vertical, compuesto de componentes reales del DS --- */

function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {hint && <CardContent className="text-xs text-faint">{hint}</CardContent>}
    </Card>
  );
}

const agentOpsContent = (
  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
    <div className="grid grid-cols-2 gap-4 xl:col-span-3 xl:grid-cols-4">
      <StatCard title="Active agents" value="24" hint="4 fleets · 2 paused" />
      <StatCard title="Runs today" value="1,382" hint="98.1% success" />
      <StatCard title="Pending approvals" value="3" hint="1 critical · oldest 12m" />
      <StatCard title="Spend today" value="$41.20" hint="of $120 daily cap" />
    </div>
    <TokenCostMeter
      title="Cost — run exec_8f21a0"
      budgetUsd={2.5}
      tokensIn={48_200}
      tokensOut={9_150}
      breakdown={[
        { label: "Model", costUsd: 1.24, tone: "info" },
        { label: "Tools", costUsd: 0.36, tone: "review" },
        { label: "Retrieval", costUsd: 0.18, tone: "ok" },
      ]}
    />
    <RunTimeline
      title="Live run"
      hint="wf_quote-enricher"
      nodes={[
        { id: "n1", title: "Fetch RFQ payload", status: "success", owner: "n8n: HTTP Request", meta: "0.4s" },
        { id: "n2", title: "Parse line items", status: "success", owner: "PARSER AGENT", meta: "1.2s" },
        { id: "n3", title: "Price lookup", status: "retrying", owner: "PRICING AGENT", meta: "T+04.1s", attempt: [2, 3] },
        { id: "n4", title: "Human approval", status: "waiting", owner: "Approval gate" },
        { id: "n5", title: "Send quote", status: "waiting", owner: "n8n: SMTP" },
      ]}
    />
    <EvalScoreBadge
      name="Faithfulness"
      score={91}
      threshold={85}
      history={[
        { runId: "r1", score: 88 },
        { runId: "r2", score: 90 },
        { runId: "r3", score: 87 },
        { runId: "r4", score: 93 },
      ]}
    />
  </div>
);

const auditContent = (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard title="Audit events (24h)" value="12,408" hint="humans 4% · agents 93% · system 3%" />
      <StatCard title="AI actions flagged" value="7" hint="2 awaiting review" />
      <StatCard title="Evidence exports" value="3" hint="all manifests verified" />
      <StatCard title="Saved queries" value="11" hint="4 shared with external auditor" />
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Retention (EU AI Act Art. 19)</CardTitle>
        <CardDescription>Immutability is visible — WORM windows per log stream</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <RetentionBadge
          record={{
            recordId: "log_agent_actions",
            regime: "worm",
            status: "protected",
            retainedSince: "Jan 3, 2026",
            minRetentionLabel: "180 days minimum",
            legalBasis: "EU AI Act Art. 19",
            progressPct: 74,
          }}
        />
        <RetentionBadge
          record={{
            recordId: "log_approvals",
            regime: "legal-hold",
            status: "hold",
            retainedSince: "Mar 12, 2026",
            minRetentionLabel: "Litigation hold",
            legalBasis: "Case 2026-114",
          }}
        />
        <RetentionBadge
          record={{
            recordId: "log_prompts_2025",
            regime: "worm",
            status: "eligible-for-deletion",
            retainedSince: "Jul 1, 2025",
            minRetentionLabel: "180 days minimum",
            legalBasis: "EU AI Act Art. 19",
            eligibleLabel: "Dec 28, 2025",
          }}
        />
      </CardContent>
    </Card>
  </div>
);

const isoContent = (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <RatioGauge label="Annex A controls covered" value={68} target={94} hint="ISO/IEC 42001:2023" />
      <RatioGauge label="Evidence items collected" value={412} target={520} hint="auto-collected by agents: 361" />
      <RatioGauge label="Gaps closed this quarter" value={23} target={30} hint="7 open · 2 high-risk" />
    </div>
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard title="High-risk gaps" value="2" hint="A.6.2 logging · A.8.4 supplier" />
      <StatCard title="Policies awaiting sign-off" value="5" hint="oldest 9 days" />
      <StatCard title="Internal audit findings" value="14" hint="11 remediated" />
      <StatCard title="Days to stage-2 audit" value="47" hint="auditor: TÜV Rheinland" />
    </div>
  </div>
);

const quotesContent = (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <RatioGauge label="Quote win rate" value={0.34} target={0.4} format="pct" hint="rolling 90 days" />
      <RatioGauge label="Avg. margin" value={0.22} target={0.25} format="pct" hint="floor 18% — 3 quotes below" />
      <RatioGauge label="RFQ → quote SLA" value={18} target={24} hint="hours, p95 · agents draft 82%" />
    </div>
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard title="Open RFQs" value="31" hint="8 drafted by agents, pending review" />
      <StatCard title="Awaiting pricing approval" value="6" hint="2 above discount threshold" />
      <StatCard title="Quotes sent this week" value="47" hint="$1.2M total value" />
      <StatCard title="Catalog drift alerts" value="4" hint="supplier price changes unpriced" />
    </div>
  </div>
);

const churnContent = (
  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
    <div className="grid grid-cols-2 gap-4 xl:col-span-3 xl:grid-cols-4">
      <StatCard title="Accounts at risk" value="18" hint="ARR at risk $284k" />
      <StatCard title="Saves this month" value="9" hint="playbooks triggered by agents: 7" />
      <StatCard title="Alerts today" value="5" hint="2 usage cliffs · 3 sentiment drops" />
      <StatCard title="Model precision (30d)" value="0.81" hint="vs 0.75 threshold" />
    </div>
    <EvalScoreBadge
      name="Churn model precision"
      score={81}
      threshold={75}
      history={[
        { runId: "w1", score: 77 },
        { runId: "w2", score: 79 },
        { runId: "w3", score: 76 },
        { runId: "w4", score: 82 },
      ]}
    />
    <EvalScoreBadge
      name="Recall — at-risk cohort"
      score={72}
      threshold={70}
      history={[
        { runId: "w1", score: 74 },
        { runId: "w2", score: 71 },
        { runId: "w3", score: 73 },
        { runId: "w4", score: 71 },
      ]}
    />
    <EvalScoreBadge
      name="Playbook save rate"
      score={54}
      threshold={60}
      history={[
        { runId: "w1", score: 61 },
        { runId: "w2", score: 58 },
        { runId: "w3", score: 57 },
        { runId: "w4", score: 55 },
      ]}
    />
  </div>
);

const CONFIGS: Record<UseCaseId, UseCaseConfig> = {
  "agent-ops": {
    breadcrumb: "Overview",
    interrupts: 3,
    sections: [
      {
        items: [
          { label: "Overview", icon: LayoutDashboard },
          { label: "Executions", icon: Workflow, badge: 12 },
          { label: "Approvals", icon: ClipboardCheck, badge: 3, badgeTone: "warn" },
          { label: "Agent fleet", icon: Bot },
          { label: "Traces", icon: GitBranch },
          { label: "Budget", icon: Wallet },
        ],
      },
      {
        label: "Admin",
        items: [
          { label: "Guardrails", icon: ShieldCheck },
          { label: "Settings", icon: Settings },
        ],
      },
    ],
    commands: [
      { id: "go-executions", label: "Go to Executions", group: "Navigate", icon: Workflow, hint: "G E" },
      { id: "go-approvals", label: "Go to Approvals", group: "Navigate", icon: ClipboardCheck, hint: "G A" },
      { id: "pause-swarm", label: "Pause swarm", group: "Actions", icon: Activity, keywords: ["stop", "halt"] },
      { id: "retry-failed", label: "Retry failed node", group: "Actions", icon: AlertTriangle },
    ],
    content: agentOpsContent,
  },
  audit: {
    breadcrumb: "Audit log",
    interrupts: 2,
    sections: [
      {
        items: [
          { label: "Audit log", icon: ScrollText },
          { label: "Who did what", icon: Users },
          { label: "Evidence exports", icon: FileCheck2, badge: 1, badgeTone: "info" },
          { label: "Retention", icon: FileClock },
          { label: "Model provenance", icon: Fingerprint },
        ],
      },
    ],
    commands: [
      { id: "export-evidence", label: "Export signed evidence", group: "Actions", icon: FileCheck2, keywords: ["pdf", "manifest"] },
      { id: "saved-ai-actions", label: "Saved query: all AI actions by user", group: "Saved queries", icon: ScrollText },
      { id: "go-retention", label: "Go to Retention", group: "Navigate", icon: FileClock },
    ],
    content: auditContent,
  },
  iso: {
    breadcrumb: "Controls",
    interrupts: 5,
    sections: [
      {
        items: [
          { label: "Controls", icon: ListChecks, badge: "68/94" },
          { label: "Evidence", icon: FileText },
          { label: "Gaps", icon: AlertTriangle, badge: 7, badgeTone: "warn" },
          { label: "Policies", icon: ScrollText, badge: 5, badgeTone: "review" },
          { label: "Auditors", icon: Users },
        ],
      },
    ],
    commands: [
      { id: "new-evidence", label: "Attach evidence to control", group: "Actions", icon: FileText },
      { id: "gap-report", label: "Generate gap report", group: "Actions", icon: AlertTriangle },
      { id: "go-controls", label: "Go to Controls", group: "Navigate", icon: ListChecks },
    ],
    content: isoContent,
  },
  quotes: {
    breadcrumb: "RFQs",
    interrupts: 6,
    sections: [
      {
        items: [
          { label: "RFQs", icon: Receipt, badge: 31 },
          { label: "Pricing approvals", icon: ClipboardCheck, badge: 6, badgeTone: "warn" },
          { label: "Catalog", icon: Factory },
          { label: "Margins", icon: SlidersHorizontal },
        ],
      },
    ],
    commands: [
      { id: "new-rfq", label: "New RFQ", group: "Actions", icon: Receipt },
      { id: "approve-pricing", label: "Review pricing approvals", group: "Actions", icon: ClipboardCheck },
      { id: "go-catalog", label: "Go to Catalog", group: "Navigate", icon: Factory },
    ],
    content: quotesContent,
  },
  churn: {
    breadcrumb: "At-risk accounts",
    interrupts: 1,
    sections: [
      {
        items: [
          { label: "At-risk accounts", icon: TrendingDown, badge: 18, badgeTone: "block" },
          { label: "Signals", icon: Activity },
          { label: "Playbooks", icon: Workflow },
          { label: "Model health", icon: Radar },
        ],
      },
    ],
    commands: [
      { id: "recompute", label: "Recompute churn cohort", group: "Actions", icon: Radar },
      { id: "trigger-playbook", label: "Trigger save playbook", group: "Actions", icon: Workflow },
      { id: "go-model", label: "Go to Model health", group: "Navigate", icon: Activity },
    ],
    content: churnContent,
  },
};

/* ------------------------------------------------------------- */
/* Demo interactivo: cambiar de workspace reconfigura TODO el UI. */
/* ------------------------------------------------------------- */

function ShellDemo({
  initialWorkspace,
  defaultCollapsed = false,
  defaultDensity,
}: {
  initialWorkspace: UseCaseId;
  defaultCollapsed?: boolean;
  defaultDensity?: "comfortable" | "compact";
}) {
  const [wsId, setWsId] = React.useState<UseCaseId>(initialWorkspace);
  const [activeNav, setActiveNav] = React.useState(0);
  const cmd = useCommandPalette();
  const config = CONFIGS[wsId];
  const workspace = WORKSPACES.find((w) => w.id === wsId)!;

  // Los comandos del palette se registran por workspace — mismo patrón
  // config-driven que la navegación.
  const commands: CommandPaletteItem[] = config.commands.map((c) => ({ ...c, onSelect: () => {} }));

  const flatNav = config.sections.flatMap((s) => s.items);

  return (
    <AppShell
      defaultCollapsed={defaultCollapsed}
      defaultDensity={defaultDensity}
      sidebar={
        <AppSidebar
          header={
            <WorkspaceSwitcher
              workspaces={WORKSPACES}
              activeId={wsId}
              onSelect={(id) => {
                setWsId(id as UseCaseId);
                setActiveNav(0);
              }}
              action={{ label: "New workspace", onSelect: () => {} }}
            />
          }
        >
          {config.sections.map((section, si) => {
            const offset = config.sections.slice(0, si).reduce((n, s) => n + s.items.length, 0);
            return (
              <SidebarSection key={section.label ?? si} label={section.label}>
                {section.items.map((item, ii) => (
                  <SidebarItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    badgeTone={item.badgeTone}
                    active={activeNav === offset + ii}
                    onClick={() => setActiveNav(offset + ii)}
                  />
                ))}
              </SidebarSection>
            );
          })}
        </AppSidebar>
      }
      topbar={
        <AppTopbar
          breadcrumbs={[
            { label: workspace.name, onClick: () => setActiveNav(0) },
            { label: flatNav[activeNav]?.label ?? config.breadcrumb },
          ]}
          actions={
            <>
              <EnvironmentBadge environment="production" className="me-1.5" />
              <DensityToggle className="me-1.5" />
              <TopbarIconButton icon={Bell} label="Pending interrupts" count={config.interrupts} />
            </>
          }
        >
          <TopbarSearchButton onClick={cmd.toggle} className="ms-auto lg:ms-0" />
        </AppTopbar>
      }
    >
      <div className="p-4 lg:p-6">{config.content}</div>
      <CommandPalette open={cmd.open} onOpenChange={cmd.setOpen} items={commands} />
    </AppShell>
  );
}

/* ------------------------- Stories ------------------------- */

/** Consola de orquestación: flota, ejecuciones, approvals, costo, timeline vivo. */
export const AgentOrchestration: S = {
  render: () => <ShellDemo initialWorkspace="agent-ops" />,
};

/** Auditoría/compliance: log inmutable, retención Art. 19, exports firmados. */
export const AuditCompliance: S = {
  render: () => <ShellDemo initialWorkspace="audit" />,
};

/** Certificación ISO 42001: cobertura de controles, evidencia, gaps. */
export const IsoCertification: S = {
  render: () => <ShellDemo initialWorkspace="iso" />,
};

/** Cotizaciones industriales: RFQs, aprobaciones de pricing, márgenes. */
export const IndustrialQuotations: S = {
  render: () => <ShellDemo initialWorkspace="quotes" />,
};

/** Churn radar: cuentas en riesgo, salud del modelo, playbooks de retención. */
export const ChurnRadar: S = {
  render: () => <ShellDemo initialWorkspace="churn" />,
};

/** Rail colapsado + densidad compacta — modo ops de pantalla densa. */
export const CollapsedCompact: S = {
  render: () => <ShellDemo initialWorkspace="agent-ops" defaultCollapsed defaultDensity="compact" />,
};

/** Drawer de navegación mobile (usa el viewport pequeño de Storybook). */
export const Mobile: S = {
  render: () => <ShellDemo initialWorkspace="agent-ops" />,
  parameters: { viewport: { defaultViewport: "mobile375" } },
};
