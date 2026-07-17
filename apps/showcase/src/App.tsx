import { useState } from "react";
import { CopyProvider } from "@enregla-ui/duly-ui";
import { Home } from "./pages/Home";
import { Agentic } from "./pages/Agentic";
import { Compliance } from "./pages/Compliance";
import { Comercial } from "./pages/Comercial";
import { Industrial } from "./pages/Industrial";
import { Primitivas } from "./pages/Primitivas";

type Page = "home" | "agentic" | "compliance" | "comercial" | "industrial" | "primitivas";

const PAGES: { id: Page; label: string }[] = [
  { id: "home", label: "Inicio" },
  { id: "agentic", label: "Agentic" },
  { id: "compliance", label: "Compliance" },
  { id: "comercial", label: "Comercial" },
  { id: "industrial", label: "Industrial" },
  { id: "primitivas", label: "Primitivas" },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");

  return (
    <CopyProvider locale="es">
      <div data-theme="cockpit" style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--ink)" }}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            padding: "0.75rem 1.5rem",
            background: "var(--surface-header)",
            borderBottom: "1px solid var(--border-divider)",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
            <b style={{ color: "var(--accent)" }}>Duly</b>
            <span style={{ color: "var(--faint)", margin: "0 0.4rem" }}>×</span>Showcase
          </span>
          <nav style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {PAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPage(p.id)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.78rem",
                  padding: "0.35rem 0.8rem",
                  borderRadius: "999px",
                  border: `1px solid ${page === p.id ? "var(--accent-border)" : "var(--border-default)"}`,
                  background: page === p.id ? "var(--accent-surface)" : "transparent",
                  color: page === p.id ? "var(--accent)" : "var(--dim)",
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </nav>
        </header>
        <main style={{ padding: "1.5rem" }}>
          {page === "home" && <Home onNavigate={setPage} />}
          {page === "agentic" && <Agentic />}
          {page === "compliance" && <Compliance />}
          {page === "comercial" && <Comercial />}
          {page === "industrial" && <Industrial />}
          {page === "primitivas" && <Primitivas />}
        </main>
      </div>
    </CopyProvider>
  );
}
