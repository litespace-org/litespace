import baseConfig, { path } from "@litespace/ui/tailwind.config";
import { Config } from "tailwindcss/types/config";

/** @type {import('tailwindcss').Config} */
const config: Config = {
  ...baseConfig,
  prefix: "",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    `${path}/**/*.{ts,tsx,js,jsx}`,
  ],
};

export default config;
