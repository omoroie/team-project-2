import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "..", "attached_assets"),
      "@shared": path.resolve(__dirname, "..", "shared"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "..", "dist"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    port: 5000,
    host: "0.0.0.0",
    allowedHosts: [
      "all",
      ".replit.dev",
      ".riker.replit.dev",
      "5c663142-396c-4162-b66a-4f109913be33-00-14bgusdh9244e.riker.replit.dev"
    ],
    proxy: {
      '/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/recipes': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      }
    }
  },
}); 
