import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Red Hawks Game Cow PWA",
        description: "Le vote de la ptite vache du match!",
        short_name: "RHGCPWA",
        theme_color: "#6e1a1a",
        screenshots: [
          {
            src: "screenshot-narrow.png",
            sizes: "375x667",
            type: "image/png",
            form_factor: "narrow",
            label: "Mobile Vote Screen"
          },
          {
            src: "screenshot-wide.png",
            sizes: "1117x920",
            type: "image/png",
            form_factor: "wide",
            label: "Desktop Vote Screen"
          }
        ],
        icons: [
          {
            src: "img/icons/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "img/icons/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      devOptions: {
        enabled: true
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "style" ||
              request.destination === "script" ||
              request.destination === "worker",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 24 * 60 * 60 // 60 days
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@common": fileURLToPath(new URL("../common", import.meta.url))
    }
  },
  server: {
    open: true
  }
})
