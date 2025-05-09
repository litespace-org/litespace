import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import alias from "@rollup/plugin-alias";
import { dts } from "rollup-plugin-dts";
import json from "@rollup/plugin-json";
// eslint-disable-next-line no-restricted-imports
import pkg from "./package.json" assert { type: "json" };
import path from "node:path";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      typescript({ tsconfig: "tsconfig.build.json" }),
    ],
    external: Object.keys(pkg.peerDependencies),
  },
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [
      alias({
        entries: [
          {
            find: "@",
            replacement: path.resolve("./dist/esm/types"),
          },
        ],
      }),
      dts(),
    ],
  },
];
