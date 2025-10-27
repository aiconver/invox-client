// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    host: true,            // important in Docker (bind 0.0.0.0)
    port: 4201,
    strictPort: true,
    watch: { usePolling: true, interval: 300 },
    hmr: {
      host: "localhost",   // the host your BROWSER reaches (nginx publishes 4201 on localhost)
      port: 4201,          // the port your browser uses
      // if you hit via HTTPS/443 through a reverse proxy, use: clientPort: 443
      // clientPort: 443,
    },
  },
});
