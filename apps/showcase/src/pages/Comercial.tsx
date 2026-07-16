import "@xyflow/react/dist/style.css";
import {
  PipelineWaterfallChart,
  MRRMovementWaterfall,
  ForecastRollupTable,
  RatioGauge,
  PricingApprovalMatrix,
  RelationshipMap,
  type PipelineChange,
  type MRRMovement,
  type ForecastRow,
  type DiscountTier,
  type Stakeholder,
  type RelationshipLink,
} from "@duly/ui";

const pipelineChanges: PipelineChange[] = [
  { label: "Creado", kind: "created", delta: 420000 },
  { label: "Expandido", kind: "expanded", delta: 135000 },
  { label: "Empujado", kind: "pushed", delta: -70000 },
  { label: "Ganado", kind: "won", delta: -180000 },
];

const mrrMovements: MRRMovement[] = [
  { label: "Nuevo", kind: "new", amount: 14200 },
  { label: "Expansión", kind: "expansion", amount: 6800 },
  { label: "Contracción", kind: "contraction", amount: -3100 },
  { label: "Churn", kind: "churn", amount: -5400 },
];

const forecastRows: ForecastRow[] = [
  {
    id: "exec",
    owner: "Ventas Global",
    level: "exec",
    commit: 4200000,
    bestCase: 6100000,
    pipeline: 14800000,
    closed: 3600000,
    quota: 5000000,
    delta: 220000,
    children: [
      { id: "west", owner: "Región Oeste", level: "manager", commit: 2100000, bestCase: 3050000, pipeline: 7400000, closed: 1850000, quota: 2500000, delta: 120000 },
      { id: "east", owner: "Región Este", level: "manager", commit: 2100000, bestCase: 3050000, pipeline: 7400000, closed: 1750000, quota: 2500000, delta: 100000 },
    ],
  },
];

const tiers: DiscountTier[] = [
  { maxDiscountPct: 10, approverRole: "Rep (auto)", slaHours: 0 },
  { maxDiscountPct: 20, approverRole: "Sales Manager", slaHours: 4 },
  { maxDiscountPct: 30, approverRole: "Deal Desk", slaHours: 12 },
  { maxDiscountPct: 40, approverRole: "VP Sales", slaHours: 24 },
];

const people: Stakeholder[] = [
  { id: "cfo", name: "Dana Wu", title: "CFO", role: "economic-buyer", influence: 5, position: { x: 220, y: 10 } },
  { id: "vpe", name: "Ivo Park", title: "VP Eng", role: "champion", influence: 4, position: { x: 60, y: 160 } },
  { id: "ciso", name: "Mara Kite", title: "CISO", role: "blocker", influence: 3, position: { x: 220, y: 160 } },
];
const links: RelationshipLink[] = [
  { id: "l1", source: "vpe", target: "cfo", label: "reporta a" },
  { id: "l2", source: "ciso", target: "cfo" },
];

export function Comercial() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
      <div>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Panel de RevOps</h1>
        <p style={{ color: "var(--dim)", marginTop: "0.3rem" }}>Pipeline, MRR, forecast y comité de compra de una cuenta activa.</p>
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <PipelineWaterfallChart title="Cambio de pipeline · Q3" startValue={1_000_000} changes={pipelineChanges} />
        </div>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <MRRMovementWaterfall title="Movimiento de MRR · Junio" startMrr={248000} movements={mrrMovements} />
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        <RatioGauge label="Cumplimiento de cuota" value={1_020_000} target={1_000_000} format="pct" hint="$1.02M / $1.0M" />
        <RatioGauge label="Cobertura de pipeline" value={3_200_000} target={1_000_000} format="x" hint="3.2× gap" />
      </div>

      <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
        <ForecastRollupTable rows={forecastRows} caption="Forecast · FY26 Q3" defaultExpandedIds={["exec"]} />
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <PricingApprovalMatrix tiers={tiers} currentDiscount={25} />
        </div>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem", minHeight: 260 }}>
          <RelationshipMap people={people} links={links} ariaLabel="Comité de compra" onSelect={() => {}} />
        </div>
      </div>
    </div>
  );
}
