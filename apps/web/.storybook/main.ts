import type { StorybookConfig } from "@storybook/react-vite";
import { merge } from "lodash";
import { resolve } from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    if (config.resolve) {
      const alias = config.resolve.alias || {};
      config.resolve.alias = merge(alias, {
        "@": resolve(__dirname, "../src"),
      });
    }
    return config;
  },
  core: {
    disableTelemetry: true,
  },
};
export default config;
