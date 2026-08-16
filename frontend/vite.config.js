import { reactRouter } from "@react-router/dev/vite";

import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: [
      "@fortawesome/free-solid-svg-icons",
      "@fortawesome/react-fontawesome",
      "react-icons/fa",
      "react-modal",
    ],
  },

  plugins: [reactRouter()],

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
