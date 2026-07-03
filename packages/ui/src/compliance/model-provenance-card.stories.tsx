import type { Meta, StoryObj } from "@storybook/react";
import { ModelProvenanceCard } from "./model-provenance-card.js";

const meta: Meta<typeof ModelProvenanceCard> = {
  title: "Compliance/V001 Model Provenance Card",
  component: ModelProvenanceCard,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

type S = StoryObj<typeof ModelProvenanceCard>;

export const Cases: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto flex max-w-[460px] flex-col gap-4">
        <ModelProvenanceCard
          model="claude-opus-4-8"
          modelVersion="2026-06-30"
          promptVersion="v12"
          configHash="3f9a1c88e0d24b71a9"
          temperature={0.7}
          provider="Anthropic"
        />
        <ModelProvenanceCard
          model="gpt-5-turbo"
          modelVersion="2026-05-01"
          promptVersion="v4"
          configHash="a01ff7c3129e"
          temperature={0.2}
          provider="OpenAI"
          defaultExpanded
        />
      </div>
    </div>
  ),
};
