import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents() {},
    baseUrl: "http://localhost:3000",
    viewportWidth: 1920,
    viewportHeight: 1080,
    testIsolation: true,
    screenshotOnRunFailure: false,
  },
});
