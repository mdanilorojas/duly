import { Button, Badge, Progress } from "@enregla-ui/duly-ui";

type Page = "agentic" | "compliance" | "comercial" | "industrial";

const VERTICALS: { id: Page; title: string; desc: string }[] = [
  { id: "agentic", title: "Agentic", desc: "Panel de operación de agentes: runs, gates, guardrails, costo." },
  { id: "compliance", title: "Compliance", desc: "Consola ISO 27001: veredicto de banda, gate HITL, backlog de remediación." },
  { id: "comercial", title: "Comercial", desc: "Panel de RevOps: pipeline, MRR, forecast, comité de compra." },
  { id: "industrial", title: "Industrial", desc: "Sala de control OT: alarmas, salud de activos, OEE." },
];

export function Home({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: 960, margin: "0 auto" }}>
      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 750, letterSpacing: "-0.02em" }}>
          Duly DS <span style={{ color: "var(--accent)" }}>en natural</span>
        </h1>
        <p style={{ marginTop: "0.6rem", color: "var(--dim)", maxWidth: "60ch" }}>
          Storybook cubre cada componente aislado. Acá se ven compuestos, en un caso de uso real por
          vertical — no cards sueltas.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        {VERTICALS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onNavigate(v.id)}
            style={{
              textAlign: "left",
              border: "1px solid var(--border-default)",
              borderRadius: "0.75rem",
              background: "var(--surface-2)",
              padding: "1.1rem",
              cursor: "pointer",
              color: "inherit",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 650, marginBottom: "0.4rem" }}>{v.title}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--dim)" }}>{v.desc}</p>
          </button>
        ))}
      </div>

      <div>
        <h2 style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--faint)", marginBottom: "0.8rem" }}>
          Fundamentos / Primitivas
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", border: "1px solid var(--border-default)", borderRadius: "0.75rem", background: "var(--surface-2)", padding: "1.1rem" }}>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Button variant="default">Aprobar</Button>
            <Button variant="destructive">Rechazar</Button>
            <Button variant="outline">Ver detalle</Button>
            <Button variant="secondary">Escalar</Button>
            <Button variant="ghost">Cancelar</Button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Badge variant="ok">ok</Badge>
            <Badge variant="warn">warn</Badge>
            <Badge variant="block">block</Badge>
            <Badge variant="secondary">info</Badge>
            <Badge variant="outline">outline</Badge>
          </div>
          <div style={{ maxWidth: 320 }}>
            <Progress value={62} />
            <p style={{ marginTop: "0.4rem", fontSize: "0.78rem", color: "var(--faint)", fontFamily: "var(--font-mono)" }}>
              62% · cobertura SoA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
