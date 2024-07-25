import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      "/installHook.js.map": "http://localhost:3000", // Dummy route to avoid errors
      "/backendManager.js.map": "http://localhost:3000", // Dummy route to avoid errors
      "/renderer.js.map": "http://localhost:3000", // Dummy route to avoid errors
      "/react_devtools_backend_compact.js.map": "http://localhost:3000", // Dummy route to avoid errors
    },
  },
});
