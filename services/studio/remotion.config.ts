// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { enableTailwind } from "@remotion/tailwind";
import webpack, { Configuration } from "webpack";
import fs from "node:fs";

function getSession() {
  const file = "session.json";
  if (!fs.existsSync(file)) return JSON.stringify({ videos: [] });
  return fs.readFileSync(file).toString("utf-8");
}

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEntryPoint("./composition/index.ts");
Config.setPublicDir("./out");
Config.setShouldOpenBrowser(false);
// ref: https://github.com/remotion-dev/remotion/blob/main/packages/bundler/src/webpack-config.ts
Config.overrideWebpackConfig((config) => {
  // ref: https://www.remotion.dev/docs/typescript-aliases
  const updated: Configuration = {
    ...config,
    resolve: {
      ...config.resolve,
      plugins: [...(config.resolve?.plugins ?? []), new TsConfigPathsPlugin()],
    },
    plugins: [
      ...(config.plugins ?? []),
      new webpack.DefinePlugin({
        __SESSION_COMPOSITION_PROPS__: getSession(),
      }),
    ],
  };

  // ref: https://www.remotion.dev/docs/tailwind
  return enableTailwind(updated);
});
