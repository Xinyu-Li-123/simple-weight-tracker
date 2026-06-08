import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const repoName = "simple-weight-tracker";

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Simple Weight Tracker",
        short_name: "Weight",
        description: "A private offline-first weight tracker.",
        display: "standalone",
        start_url: `/${repoName}/`,
        scope: `/${repoName}/`,
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  // Source - https://stackoverflow.com/a/66777245
  // Posted by Non404
  // Retrieved 2026-06-08, License - CC BY-SA 4.0
  resolve: {
    alias: {
      '@': require('path').resolve(__dirname, 'src')
    }
  },
});
