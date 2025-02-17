import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "node:path";

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
    // produce sourcemaps for debug builds
    // sentry uploads source maps only in production mode.
    // Sentry NOTE: Generating sourcemaps may expose them to the public,
    // potentially causing your source code to be leaked.
    sourcemap:
      !!process.env.TAURI_DEBUG || process.env.VITE_BACKEND === "production",
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
      org: "litespace-org",
      project: "litespace",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        // TODO: fill this array with sourcemaps files
        filesToDeleteAfterUpload: [],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react-router-dom"],
  },
  assetsInclude: ["src/markdown/**/*.md"],
  esbuild: {
    exclude: ["@litespace/ui/*"],
  },
  optimizeDeps: {
    force: true,
  },
});
