import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const localSharedPath = path.resolve(__dirname, "../shared");
const containerSharedPath = path.resolve(__dirname, "./shared");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": fs.existsSync(localSharedPath) ? localSharedPath : containerSharedPath,
    },
    dedupe: ["react", "react-dom", "react-router-dom", "lucide-react"],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [".ngrok-free.app", ".ngrok.app", "localhost", "127.0.0.1"],
  },
});
