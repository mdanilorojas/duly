import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ConnectorStatus } from "./connector-status.js";

const connectors = [
  { id: "sp", name: "SharePoint /Compliance", kind: "SharePoint", state: "connected" as const, lastSync: "hace 4 min", docCount: 148 },
  { id: "fs", name: "evidencias/", kind: "carpeta local", state: "syncing" as const },
  { id: "s3", name: "backup-logs", kind: "S3", state: "error" as const },
  { id: "gd", name: "Drive legal", kind: "Google Drive", state: "paused" as const },
];

describe("ConnectorStatus", () => {
  it("renderiza una fila por conector con etiqueta de estado en texto", () => {
    render(<ConnectorStatus connectors={connectors} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("Connected")).toBeDefined();
    expect(screen.getByText("Syncing…")).toBeDefined();
    expect(screen.getByText("Error")).toBeDefined();
    expect(screen.getByText("Paused")).toBeDefined();
  });

  it("muestra docCount y lastSync cuando existen", () => {
    render(<ConnectorStatus connectors={connectors} />);
    expect(screen.getByText("148 docs")).toBeDefined();
    expect(screen.getByText("hace 4 min")).toBeDefined();
  });

  it("axe limpio", async () => {
    const { container } = render(<ConnectorStatus connectors={connectors} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
