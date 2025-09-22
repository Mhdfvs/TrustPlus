// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "^/api/.*": {   // regex ensures match
        target: "http://localhost:6000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
