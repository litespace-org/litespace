import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./locales/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER: process.env.SERVER,
    CLIENT: process.env.CLIENT,
  },
};

export default withNextIntl(nextConfig);
