import type { StorybookConfig } from "@storybook/react-vite";
import { join, dirname, resolve } from "path";
import { merge } from "lodash";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
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
