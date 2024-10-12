import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json" assert { type: "json" };
import path from "node:path";
import svgr from "vite-plugin-svgr";

console.log(svgr);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: "default",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
    }),
    dts({ exclude: ["**/*.stories.tsx"] }),
    viteStaticCopy({
      targets: [
        { src: "tailwind.config.js", dest: "." },
        { src: "src/tailwind.css", dest: "." },
        { src: "src/svg.d.ts", dest: "." },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/index.ts",
      name: "ui",
      fileName: (format) => `ui.${format}.js`,
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      external: Object.keys(pkg.peerDependencies),
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-hook-form": "react-hook-form",
          "framer-motion": "framer-motion",
          "react-intl": "react-intl",
          lodash: "lodash",
          "react-toastify": "react-toastify",
          "@reduxjs/toolkit": "redux",
          "@tanstack/react-query": "react-query",
        },
      },
    },
  },
});
