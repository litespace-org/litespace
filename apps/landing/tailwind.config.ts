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
  theme: {
    ...baseConfig.theme,
    backgroundImage: {
      ...baseConfig.theme?.backgroundImage,
      "circular-gradient-brand":
        "radial-gradient(ellipse, var(--brand-800) 0%, var(--brand-800) 5%, var(--brand-800) 10%, var(--brand-800) 15%, transparent 65%, var(--brand-900) 75%)",
      "circular-gradient-brand-peripheral-transparent":
        "radial-gradient(ellipse, var(--brand-800) 0%, var(--brand-800) 5%, var(--brand-800) 10%, var(--brand-800) 15%, transparent 65%, transparent 75%)",
      "circular-gradient-warning":
        "radial-gradient(ellipse, var(--warning-900) 0%, var(--warning-900) 1%, var(--warning-900) 2%, var(--warning-900) 3%, transparent 55%, var(--brand-900) 75%)",
    },
  },
};
export default config;
