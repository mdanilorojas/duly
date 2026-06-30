import { useState } from "react";
import { TraceLog } from "@studio/ui";
import { tokens } from "@studio/tokens";

type Theme = "cockpit" | "test";

export default function App() {
  const [theme, setTheme] = useState<Theme>("cockpit");

  const accentColor = tokens[theme]["accent"];

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        color: "var(--ink)",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Studio DS — Minimal Vite Consumer</h1>
        <button
          onClick={() => setTheme((t) => (t === "cockpit" ? "test" : "cockpit"))}
          style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "0.375rem",
            border: "1px solid var(--border-default)",
            background: "var(--surface-2)",
            color: "var(--ink)",
            cursor: "pointer",
          }}
        >
          Switch to {theme === "cockpit" ? "test" : "cockpit"}
        </button>
        <span style={{ fontSize: "0.75rem", color: "var(--dim)" }}>
          Accent token: <code style={{ color: accentColor }}>{accentColor}</code>
        </span>
      </header>

      <TraceLog.Root>
        <TraceLog.Header label="Pipeline Run #42" runId="run-42" timestamp="2026-06-30T10:00:00Z" />
        <TraceLog.Body>
          <TraceLog.Row tone="info" step="init" message="Initializing pipeline context" />
          <TraceLog.Row tone="ok" step="fetch" message="Data fetched successfully (1.2 s)" />
          <TraceLog.Row tone="review" step="validate" message="Schema validation requires manual sign-off" />
          <TraceLog.Row tone="warn" step="transform" message="Deprecated field detected — will be removed in v3" />
          <TraceLog.Row
            tone="block"
            step="publish"
            message="Publish blocked: missing required approval"
          >
            <TraceLog.Detail>
              <p style={{ margin: 0 }}>Approval gate requires sign-off from @release-team. Open ticket #1234.</p>
            </TraceLog.Detail>
          </TraceLog.Row>
          <TraceLog.Row tone="ok" step="stream" message="Streaming output…" streaming />
          <TraceLog.Truncated onShowAll={() => alert("Show all rows clicked")} />
        </TraceLog.Body>
      </TraceLog.Root>
    </div>
  );
}
