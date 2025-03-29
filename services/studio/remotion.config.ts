// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { enableTailwind } from "@remotion/tailwind";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEntryPoint("./composition/index.ts");
Config.overrideWebpackConfig((config) => {
  // ref: https://www.remotion.dev/docs/typescript-aliases
  const updated = {
    ...config,
    resolve: {
      ...config.resolve,
      plugins: [...(config.resolve?.plugins ?? []), new TsConfigPathsPlugin()],
    },
  };
  // ref: https://www.remotion.dev/docs/tailwind
  return enableTailwind(updated);
});
