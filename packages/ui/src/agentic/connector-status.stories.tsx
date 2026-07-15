import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ConnectorStatus } from "./connector-status.js";

const meta: Meta<typeof ConnectorStatus> = {
  title: "Agentic/Connector Status/V001 Fuentes de ingesta",
  component: ConnectorStatus,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;
type S = StoryObj<typeof ConnectorStatus>;

// Data room de un engagement ISO 27001: ingesta determinista desde fuentes,
// no carga manual. La fuente rota se ve — jamás falla en silencio.
export const IsoDataRoom: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <ConnectorStatus
        className="max-w-2xl"
        connectors={[
          { id: "sp", name: "SharePoint /Compliance", kind: "SharePoint", state: "connected", lastSync: "hace 4 min", docCount: 148 },
          { id: "fs", name: "evidencias/", kind: "carpeta local", state: "syncing", lastSync: "ahora", docCount: 12 },
          { id: "s3", name: "backup-logs", kind: "S3", state: "error", lastSync: "hace 2 h" },
          { id: "gd", name: "Drive legal", kind: "Google Drive", state: "paused", lastSync: "ayer", docCount: 31 },
        ]}
      />
    </div>
  ),
};
