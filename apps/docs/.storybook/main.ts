import type { StorybookConfig } from "@storybook/react-vite";
import { resolve } from "path";

const UI_SRC = resolve(__dirname, "../../../packages/ui/src");

const config: StorybookConfig = {
  stories: ["../../../packages/ui/src/**/*.stories.tsx"],
  staticDirs: ["./public"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-essentials"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true },
  async viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      "@": UI_SRC,
    };
    return config;
  },
};

export default config;
