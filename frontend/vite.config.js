import { vitePlugin as remix } from "@remix-run/dev";

import { defineConfig } from "vite";
import { vercelPreset } from "@vercel/remix/vite";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,

        v3_relativeSplatPath: true,

        v3_throwAbortReason: true,
      },
      presets: [vercelPreset()],
    }),
  ],

  build: {
    sourcemap: false,
  },

  server: {
    proxy: {
      "/installHook.js.map": "http://localhost:3000", // Dummy route to avoid errors

      "/backendManager.js.map": "http://localhost:3000", // Dummy route to avoid errors

      "/renderer.js.map": "http://localhost:3000", // Dummy route to avoid errors

      "/react_devtools_backend_compact.js.map": "http://localhost:3000", // Dummy route to avoid errors

      "/api": {
        target: "http://localhost:3000", // Sørg for at dette peker på backend-serveren
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        // rewrite: (path) => path.replace(/^\/api/, "/api"),

        // // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
