const EXPORT_OUTPUT = process.env["EXPORT_OUTPUT"] === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: EXPORT_OUTPUT ? "export" : undefined,
  distDir: "dist",
};

console.log(nextConfig);

export default nextConfig;
