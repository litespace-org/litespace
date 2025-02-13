import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ exclude: ["**/*.stories.tsx"] }),
    viteStaticCopy({
      targets: [
        { src: "tailwind.config.js", dest: "." },
        { src: "src/tailwind.css", dest: "." },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    force: true,
  },
});
