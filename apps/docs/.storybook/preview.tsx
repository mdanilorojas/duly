import React from "react";
import type { Preview } from "@storybook/react";
import "./app.css";

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
  parameters: {
    viewport: {
      viewports: {
        mobile375: {
          name: "Mobile 375",
          styles: { width: "375px", height: "667px" },
          type: "mobile",
        },
        mobile414: {
          name: "Mobile-L 414",
          styles: { width: "414px", height: "896px" },
          type: "mobile",
        },
        tablet768: {
          name: "Tablet 768",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop1280: {
          name: "Desktop 1280",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
        desktop1440: {
          name: "Desktop 1440",
          styles: { width: "1440px", height: "900px" },
          type: "desktop",
        },
      },
      defaultViewport: "mobile375",
    },
  },
  decorators: [
    (Story, ctx) => (
      <div data-theme={ctx.globals.theme} style={{ background: "var(--bg-base)", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 580, margin: "0 auto" }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export default preview;
