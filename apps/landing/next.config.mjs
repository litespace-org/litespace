import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./locales/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
