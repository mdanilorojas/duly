import type { Meta, StoryObj } from "@storybook/react";
import cockpitDocument from "./cockpit.generative.json";
import { GenerativeUiView, type GenerativeUiDocument } from "./generative-ui-view.js";

const document = cockpitDocument as GenerativeUiDocument;
const lightDocument: GenerativeUiDocument = { ...document, theme: "light", auditId: "cockpit-light" };

const meta: Meta<typeof GenerativeUiView> = {
  title: "Agentic/Demo/Generative UI",
  component: GenerativeUiView,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GenerativeUiView>;

/** Host render of packages/ui/src/agentic/cockpit.generative.json. Validate that file with validate_generative_ui. */
export const FromDocument: Story = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-6 md:p-10">
      <GenerativeUiView document={document} />
    </div>
  ),
};

/** Same document under the light theme. The audit id changes because the theme field changed. */
export const LightTheme: Story = {
  render: () => (
    <div data-theme="light" className="min-h-screen bg-bg-base p-6 md:p-10">
      <GenerativeUiView document={lightDocument} />
    </div>
  ),
};
