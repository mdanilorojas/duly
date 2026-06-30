import type { Preview } from "@storybook/react";
import "@studio/ui/styles.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      defaultValue: "cockpit",
      toolbar: {
        items: ["cockpit", "test"],
        title: "Tema",
      },
    },
  },
  decorators: [
    (Story, ctx) => (
      <div data-theme={ctx.globals.theme} style={{ background: "var(--bg-base)", padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
