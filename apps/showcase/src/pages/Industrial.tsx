import { useState } from "react";
import {
  AlarmBanner,
  AlarmSummaryTable,
  AssetHealthGauge,
  AutonomyModeSwitch,
  OEEWaterfall,
  ProcessValueTile,
  AlarmChip,
  type Alarm,
  type AlarmRow,
  type AutonomyLevel,
  type OEELoss,
} from "@duly/ui";

const topAlarm: Alarm = {
  id: "a1",
  tag: "PT-101",
  description: "Presión de cabezal sobre límite crítico",
  priority: "critical",
  timestamp: "19:12:04",
};

const alarms: AlarmRow[] = [
  { id: "a1", tag: "PT-101", description: "Presión de cabezal sobre límite crítico", priority: "critical", state: "unack", timestamp: "19:12:04", area: "Header" },
  { id: "a2", tag: "TT-330", description: "Temperatura de reactor alta", priority: "high", state: "unack", timestamp: "19:10:41", area: "Reactor" },
  { id: "a3", tag: "FT-220", description: "Flujo bajo en alimentación", priority: "medium", state: "ack", timestamp: "19:05:10", area: "Feed" },
];

const losses: OEELoss[] = [
  { label: "Setup y ajustes", kind: "availability", minutes: 45 },
  { label: "Paradas menores", kind: "performance", minutes: 38 },
  { label: "Retrabajo", kind: "quality", minutes: 18 },
];

function AutonomyDemo() {
  const [level, setLevel] = useState<AutonomyLevel>("advisory");
  return <AutonomyModeSwitch value={level} onChange={setLevel} disabledAbove="supervised" />;
}

export function Industrial() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
      <div>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Sala de control OT</h1>
        <p style={{ color: "var(--dim)", marginTop: "0.3rem" }}>Alarmas, salud de activos y eficiencia de una planta en vivo.</p>
      </div>

      <AlarmBanner topAlarm={topAlarm} unackCount={4} onAck={() => {}} />

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        <ProcessValueTile label="Presión de cabezal" value={48.2} unit="bar" min={0} max={100} setpoint={45} loLimit={10} hiLimit={90} />
        <ProcessValueTile label="Temp. reactor" value={512} unit="°C" min={0} max={600} setpoint={500} loLimit={100} hiLimit={550} />
        <ProcessValueTile label="Flujo de alimentación" value={95} unit="m³/h" min={0} max={100} setpoint={60} loLimit={10} hiLimit={90} />
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        <AssetHealthGauge label="Bomba P-12" value={88} trend={2} />
        <AssetHealthGauge label="Compresor C-3" value={64} trend={-6} />
        <AssetHealthGauge label="Motor M-7" value={34} trend={-9} />
      </div>

      <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
        <AlarmSummaryTable alarms={alarms} onAck={() => {}} onShelve={() => {}} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.75rem" }}>
          <AlarmChip priority="critical" state="unack" />
          <AlarmChip priority="high" state="ack" />
          <AlarmChip priority="medium" state="rtn" />
          <AlarmChip priority="low" state="shelved" />
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <OEEWaterfall title="OEE · Turno A" plannedMinutes={480} losses={losses} />
        </div>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AutonomyDemo />
        </div>
      </div>
    </div>
  );
}
