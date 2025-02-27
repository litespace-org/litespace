import config, { path } from "@litespace/ui/tailwind.config";

/** @type {import('tailwindcss').Config} */
export default {
  ...config,
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    `${path}/**/*.{ts,tsx,js,jsx}`,
  ],
};
