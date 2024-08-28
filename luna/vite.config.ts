import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json" assert { type: "json" };
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      exclude: ["**/*.stories.tsx"],
    }),
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
          "react-hook-form": "reactHookForm",
          "framer-motion": "framerMotion",
          "react-intl": "reactIntl",
          lodash: "lodash",
          "react-toastify": "react-toastify",
        },
      },
    },
  },
});
