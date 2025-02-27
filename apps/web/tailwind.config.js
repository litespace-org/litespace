import config, { path } from "@litespace/ui/tailwind.config";

export default {
  ...config,
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    `${path}/**/*.{ts,tsx,js,jsx}`,
  ],
};
