import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "node:path";

// const backend = process.env.VITE_BACKEND;
// const development = backend !== "production";

// https://vitejs.dev/config/
export default defineConfig({
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: { strictPort: true },
  // to access the Tauri environment variables set by the CLI with information about the current target
  envPrefix: [
    "VITE_",
    "TAURI_PLATFORM",
    "TAURI_ARCH",
    "TAURI_FAMILY",
    "TAURI_PLATFORM_VERSION",
    "TAURI_PLATFORM_TYPE",
    "TAURI_DEBUG",
  ],
  build: {
    // tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // Produce sourcemaps for debug builds
    // Sentry uploads source maps only in production mode.
    // Sentry NOTE: Generating sourcemaps may expose them to the public,
    // potentially causing your source code to be leaked.
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          lodash: ["lodash"],
          motion: ["framer-motion"],
          lottie: ["react-lottie"],
          sentry: ["@sentry/react"],
          zod: ["zod"],
          vendor: ["react", "react-dom", "react-router-dom"],
          tanstack: ["@tanstack/react-query", "@tanstack/react-table"],
        },
      },
    },
  },
  plugins: [
    react({}),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
          res.setHeader(
            "Cross-Origin-Opener-Policy",
            "same-origin-allow-popup"
          );
          next();
        });
      },
    },
    sentryVitePlugin({
      org: "litespace",
      project: process.env.SENTRY_PROJECT_NAME,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: {
        // TODO: fill this array with sourcemaps files
        filesToDeleteAfterUpload: [],
      },
    }),
    // disable static copy for now.
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: location + "*.svg",
    //       dest: ".",
    //     },
    //   ],
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react-router-dom"],
  },
  esbuild: {
    exclude: ["@litespace/ui/*"],
  },
  optimizeDeps: {
    force: true,
  },
});
