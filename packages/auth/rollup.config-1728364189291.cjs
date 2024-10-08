'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var typescript = require('@rollup/plugin-typescript');
var alias = require('@rollup/plugin-alias');
var rollupPluginDts = require('rollup-plugin-dts');
var json = require('@rollup/plugin-json');
var pkg = require('./package.json');
var path = require('node:path');

var rollup_config = [
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
      rollupPluginDts.dts(),
    ],
  },
];

exports.default = rollup_config;
