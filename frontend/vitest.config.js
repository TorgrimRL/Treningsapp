import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./test/setup.js",
    clearMocks: true,
    restoreMocks: true,
    include: ["app/**/*.test.{js,jsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});

