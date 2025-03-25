import { fixupConfigRules } from "@eslint/compat";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "**/dist",
      "**/coverage",
      "**/.eslintrc.cjs",
      "**/tailwind.config.js",
      "**/src-tauri",
      "**/ecosystem.config.js",
      // "**/apps",
      "**/apps/web",
      "**/apps/dashboard",
      "**/apps/mobile",
      "**/apps/blog",
      "**/landing/.vercel",
      "**/migrations",
      "**/jest.config.js",
      "**/jest.config.cjs",
      "**/babel.config.js",
      "**/babel.config.cjs",
      "**/svg-template.js",
      "**/next.config.mjs",
      "**/.next",
      "prettier.config.js",
      "packages/headless/src/socket",
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react-hooks/recommended",
      "plugin:storybook/recommended"
    )
  ),
  {
    plugins: {
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./", "../"],
              message: "Relative imports are not allowed.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  {
    files: ["scripts/**.ts", "**/.storybook/**"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["**/*.stories.tsx", "packages/radio/**"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  {
    files: ["apps/landing/**"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
