import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dropzone } from "../components/ui/dropzone.js";

const meta: Meta<typeof Dropzone> = {
  title: "Primitives/Dropzone",
  component: Dropzone,
};
export default meta;
type S = StoryObj<typeof Dropzone>;

export const DataRoom: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="max-w-md">
        <Dropzone
          onFiles={(files) => console.log("recibidos", files.map((f) => f.name))}
          accept=".pdf,.docx,.xlsx"
          hint="PDF, DOCX, XLSX · cada doc recibe SHA-256 y evento de custodia"
        />
      </div>
    </div>
  ),
};
