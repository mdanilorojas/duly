import React from "react";

export function PreviewWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-theme="cockpit"
      style={{ background: "var(--bg-base)", padding: 24, minHeight: 64 }}
    >
      <div style={{ width: "100%", maxWidth: 580, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}
