import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const repoRoot = path.join(path.resolve("."), "../../");
const withNextIntl = createNextIntlPlugin("./locales/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER: process.env.SERVER,
    CLIENT: process.env.CLIENT,
    GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
    CLARITY_PROJECT_ID: process.env.CLARITY_PROJECT_ID,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
  },
  outputFileTracingRoot: repoRoot,
};

export default withNextIntl(nextConfig);
