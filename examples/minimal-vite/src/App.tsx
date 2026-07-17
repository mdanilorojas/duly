import { useState } from "react";
import { TraceLog } from "@enregla-ui/duly-ui";
import { tokens } from "@enregla-ui/duly-tokens";

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
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Duly — Minimal Vite Consumer</h1>
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
          Accent token:{" "}
          <code style={{ color: accentColor }}>{accentColor}</code>
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: "0.75rem",
              height: "0.75rem",
              marginLeft: "0.375rem",
              borderRadius: "0.25rem",
              verticalAlign: "middle",
              background: accentColor,
            }}
          />
        </span>
      </header>

      <TraceLog.Root streaming>
        <TraceLog.Header title="Pipeline Run #42" hint="cockpit ↔ test theme" />
        <TraceLog.Body>
          <TraceLog.Row tone="info" agent="PARSER" step="paso 1">
            Initializing pipeline context — reading <TraceLog.Code>config.yaml</TraceLog.Code>
          </TraceLog.Row>
          <TraceLog.Row tone="ok" agent="FETCH" timestamp="10:00:01">
            Data fetched successfully (1.2 s).
          </TraceLog.Row>
          <TraceLog.Row tone="review" agent="HUMAN" step="paso 3">
            Schema validation requires manual sign-off.
          </TraceLog.Row>
          <TraceLog.Row tone="warn" agent="TRANSFORM" step="paso 4">
            Deprecated field detected — will be removed in v3.
          </TraceLog.Row>
          <TraceLog.Row tone="block" agent="PUBLISH" step="error">
            Publish blocked: missing required approval.
            <TraceLog.Detail>
              Approval gate requires sign-off from @release-team. Open ticket #1234.
            </TraceLog.Detail>
          </TraceLog.Row>
          <TraceLog.Truncated onShowAll={() => alert("Show all rows")}>
            ver todas (47)
          </TraceLog.Truncated>
        </TraceLog.Body>
      </TraceLog.Root>
    </div>
  );
}
