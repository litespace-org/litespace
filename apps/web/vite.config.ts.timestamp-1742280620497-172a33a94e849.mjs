// vite.config.ts
import { defineConfig } from "file:///home/mostafa/projects/litespace/node_modules/vite/dist/node/index.js";
import react from "file:///home/mostafa/projects/litespace/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { sentryVitePlugin } from "file:///home/mostafa/projects/litespace/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import path from "node:path";
var __vite_injected_original_dirname = "/home/mostafa/projects/litespace/apps/web";
var backend = process.env.VITE_BACKEND;
var development = backend === "production";
var vite_config_default = defineConfig({
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
    "TAURI_DEBUG"
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
    sourcemap: !!process.env.TAURI_DEBUG || !development,
    rollupOptions: {
      output: {
        manualChunks: {
          lodash: ["lodash"],
          motion: ["framer-motion"],
          lottie: ["react-lottie"],
          sentry: ["@sentry/react"],
          zod: ["zod"],
          vendor: ["react", "react-dom", "react-router-dom"],
          tanstack: ["@tanstack/react-query", "@tanstack/react-table"]
        }
      }
    }
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
      }
    },
    sentryVitePlugin({
      org: "litespace",
      project: process.env.SENTRY_PROJECT_NAME,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: {
        // TODO: fill this array with sourcemaps files
        filesToDeleteAfterUpload: []
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    },
    dedupe: ["react", "react-dom", "react-router-dom"]
  },
  assetsInclude: ["src/markdown/**/*.md"],
  esbuild: {
    exclude: ["@litespace/ui/*"]
  },
  optimizeDeps: {
    force: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9tb3N0YWZhL3Byb2plY3RzL2xpdGVzcGFjZS9hcHBzL3dlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvbW9zdGFmYS9wcm9qZWN0cy9saXRlc3BhY2UvYXBwcy93ZWIvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvbW9zdGFmYS9wcm9qZWN0cy9saXRlc3BhY2UvYXBwcy93ZWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCB7IHNlbnRyeVZpdGVQbHVnaW4gfSBmcm9tIFwiQHNlbnRyeS92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xuXG5jb25zdCBiYWNrZW5kID0gcHJvY2Vzcy5lbnYuVklURV9CQUNLRU5EO1xuY29uc3QgZGV2ZWxvcG1lbnQgPSBiYWNrZW5kID09PSBcInByb2R1Y3Rpb25cIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIC8vIHByZXZlbnQgdml0ZSBmcm9tIG9ic2N1cmluZyBydXN0IGVycm9yc1xuICBjbGVhclNjcmVlbjogZmFsc2UsXG4gIC8vIHRhdXJpIGV4cGVjdHMgYSBmaXhlZCBwb3J0LCBmYWlsIGlmIHRoYXQgcG9ydCBpcyBub3QgYXZhaWxhYmxlXG4gIHNlcnZlcjogeyBzdHJpY3RQb3J0OiB0cnVlIH0sXG4gIC8vIHRvIGFjY2VzcyB0aGUgVGF1cmkgZW52aXJvbm1lbnQgdmFyaWFibGVzIHNldCBieSB0aGUgQ0xJIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgdGFyZ2V0XG4gIGVudlByZWZpeDogW1xuICAgIFwiVklURV9cIixcbiAgICBcIlRBVVJJX1BMQVRGT1JNXCIsXG4gICAgXCJUQVVSSV9BUkNIXCIsXG4gICAgXCJUQVVSSV9GQU1JTFlcIixcbiAgICBcIlRBVVJJX1BMQVRGT1JNX1ZFUlNJT05cIixcbiAgICBcIlRBVVJJX1BMQVRGT1JNX1RZUEVcIixcbiAgICBcIlRBVVJJX0RFQlVHXCIsXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gdGF1cmkgdXNlcyBDaHJvbWl1bSBvbiBXaW5kb3dzIGFuZCBXZWJLaXQgb24gbWFjT1MgYW5kIExpbnV4XG4gICAgdGFyZ2V0OiBwcm9jZXNzLmVudi5UQVVSSV9QTEFURk9STSA9PSBcIndpbmRvd3NcIiA/IFwiY2hyb21lMTA1XCIgOiBcInNhZmFyaTEzXCIsXG4gICAgLy8gZG9uJ3QgbWluaWZ5IGZvciBkZWJ1ZyBidWlsZHNcbiAgICBtaW5pZnk6ICFwcm9jZXNzLmVudi5UQVVSSV9ERUJVRyA/IFwiZXNidWlsZFwiIDogZmFsc2UsXG4gICAgLy8gUHJvZHVjZSBzb3VyY2VtYXBzIGZvciBkZWJ1ZyBidWlsZHNcbiAgICAvLyBTZW50cnkgdXBsb2FkcyBzb3VyY2UgbWFwcyBvbmx5IGluIHByb2R1Y3Rpb24gbW9kZS5cbiAgICAvLyBTZW50cnkgTk9URTogR2VuZXJhdGluZyBzb3VyY2VtYXBzIG1heSBleHBvc2UgdGhlbSB0byB0aGUgcHVibGljLFxuICAgIC8vIHBvdGVudGlhbGx5IGNhdXNpbmcgeW91ciBzb3VyY2UgY29kZSB0byBiZSBsZWFrZWQuXG4gICAgc291cmNlbWFwOiAhIXByb2Nlc3MuZW52LlRBVVJJX0RFQlVHIHx8ICFkZXZlbG9wbWVudCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgbG9kYXNoOiBbXCJsb2Rhc2hcIl0sXG4gICAgICAgICAgbW90aW9uOiBbXCJmcmFtZXItbW90aW9uXCJdLFxuICAgICAgICAgIGxvdHRpZTogW1wicmVhY3QtbG90dGllXCJdLFxuICAgICAgICAgIHNlbnRyeTogW1wiQHNlbnRyeS9yZWFjdFwiXSxcbiAgICAgICAgICB6b2Q6IFtcInpvZFwiXSxcbiAgICAgICAgICB2ZW5kb3I6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3Qtcm91dGVyLWRvbVwiXSxcbiAgICAgICAgICB0YW5zdGFjazogW1wiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIsIFwiQHRhbnN0YWNrL3JlYWN0LXRhYmxlXCJdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3Qoe30pLFxuICAgIHtcbiAgICAgIG5hbWU6IFwiY29uZmlndXJlLXJlc3BvbnNlLWhlYWRlcnNcIixcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcjogKHNlcnZlcikgPT4ge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChfcmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeVwiLCBcInVuc2FmZS1ub25lXCIpO1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXG4gICAgICAgICAgICBcIkNyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5XCIsXG4gICAgICAgICAgICBcInNhbWUtb3JpZ2luLWFsbG93LXBvcHVwXCJcbiAgICAgICAgICApO1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VudHJ5Vml0ZVBsdWdpbih7XG4gICAgICBvcmc6IFwibGl0ZXNwYWNlXCIsXG4gICAgICBwcm9qZWN0OiBwcm9jZXNzLmVudi5TRU5UUllfUFJPSkVDVF9OQU1FLFxuICAgICAgYXV0aFRva2VuOiBwcm9jZXNzLmVudi5TRU5UUllfQVVUSF9UT0tFTixcbiAgICAgIHRlbGVtZXRyeTogZmFsc2UsXG5cbiAgICAgIHNvdXJjZW1hcHM6IHtcbiAgICAgICAgLy8gVE9ETzogZmlsbCB0aGlzIGFycmF5IHdpdGggc291cmNlbWFwcyBmaWxlc1xuICAgICAgICBmaWxlc1RvRGVsZXRlQWZ0ZXJVcGxvYWQ6IFtdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICAgIGRlZHVwZTogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIiwgXCJyZWFjdC1yb3V0ZXItZG9tXCJdLFxuICB9LFxuICBhc3NldHNJbmNsdWRlOiBbXCJzcmMvbWFya2Rvd24vKiovKi5tZFwiXSxcbiAgZXNidWlsZDoge1xuICAgIGV4Y2x1ZGU6IFtcIkBsaXRlc3BhY2UvdWkvKlwiXSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZm9yY2U6IHRydWUsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlMsU0FBUyxvQkFBb0I7QUFDMVUsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsd0JBQXdCO0FBQ2pDLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFNLFVBQVUsUUFBUSxJQUFJO0FBQzVCLElBQU0sY0FBYyxZQUFZO0FBR2hDLElBQU8sc0JBQVEsYUFBYTtBQUFBO0FBQUEsRUFFMUIsYUFBYTtBQUFBO0FBQUEsRUFFYixRQUFRLEVBQUUsWUFBWSxLQUFLO0FBQUE7QUFBQSxFQUUzQixXQUFXO0FBQUEsSUFDVDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUSxRQUFRLElBQUksa0JBQWtCLFlBQVksY0FBYztBQUFBO0FBQUEsSUFFaEUsUUFBUSxDQUFDLFFBQVEsSUFBSSxjQUFjLFlBQVk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSy9DLFdBQVcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxlQUFlLENBQUM7QUFBQSxJQUN6QyxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRLENBQUMsUUFBUTtBQUFBLFVBQ2pCLFFBQVEsQ0FBQyxlQUFlO0FBQUEsVUFDeEIsUUFBUSxDQUFDLGNBQWM7QUFBQSxVQUN2QixRQUFRLENBQUMsZUFBZTtBQUFBLFVBQ3hCLEtBQUssQ0FBQyxLQUFLO0FBQUEsVUFDWCxRQUFRLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ2pELFVBQVUsQ0FBQyx5QkFBeUIsdUJBQXVCO0FBQUEsUUFDN0Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU0sQ0FBQyxDQUFDO0FBQUEsSUFDUjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04saUJBQWlCLENBQUMsV0FBVztBQUMzQixlQUFPLFlBQVksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTO0FBQzFDLGNBQUksVUFBVSxnQ0FBZ0MsYUFBYTtBQUMzRCxjQUFJO0FBQUEsWUFDRjtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQ0EsZUFBSztBQUFBLFFBQ1AsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsSUFDQSxpQkFBaUI7QUFBQSxNQUNmLEtBQUs7QUFBQSxNQUNMLFNBQVMsUUFBUSxJQUFJO0FBQUEsTUFDckIsV0FBVyxRQUFRLElBQUk7QUFBQSxNQUN2QixXQUFXO0FBQUEsTUFFWCxZQUFZO0FBQUE7QUFBQSxRQUVWLDBCQUEwQixDQUFDO0FBQUEsTUFDN0I7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxJQUNBLFFBQVEsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsRUFDbkQ7QUFBQSxFQUNBLGVBQWUsQ0FBQyxzQkFBc0I7QUFBQSxFQUN0QyxTQUFTO0FBQUEsSUFDUCxTQUFTLENBQUMsaUJBQWlCO0FBQUEsRUFDN0I7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLE9BQU87QUFBQSxFQUNUO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
