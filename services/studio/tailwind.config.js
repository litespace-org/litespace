import config, { path } from "@litespace/ui/tailwind.config";

export default {
  ...config,
  content: ["./src/**/*.{ts,tsx}", `${path}/**/*.{ts,tsx,js,jsx}`],
};
