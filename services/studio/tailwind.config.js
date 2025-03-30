import config, { path } from "@litespace/ui/tailwind.config";

export default {
  ...config,
  content: ["./composition/**/*.{ts,tsx}", `${path}/**/*.{ts,tsx,js,jsx}`],
};
