import baseConfig from "@litespace/ui/tailwind.config";

/** @type {import('tailwindcss').Config} */

import type { Config } from "tailwindcss";

const config: Config = {
  ...baseConfig,
  prefix: "",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
export default config;
