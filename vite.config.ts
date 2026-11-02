import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const appName = env.VITE_APP_NAME || "BIS - Student"

  return {
    base: env.VITE_BASE_URL ?? "/",
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        // Versi baru tidak langsung dipakai: pengguna diberi tahu lewat toast "Perbarui" (lihat src/components/pwa-update-prompt.tsx).
        registerType: "prompt",
        // Ikon & link <head> dari pwa-assets.config.ts (logo resmi BIS).
        pwaAssets: { config: true, overrideManifestIcons: true },
        manifest: {
          id: "/",
          name: appName,
          short_name: "BIS",
          description: "Aplikasi akademik untuk orang tua/wali siswa Balikpapan Islamic School.",
          lang: "id",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          background_color: "#F2F6F2",
          theme_color: "#008236",
          categories: ["education"],
        },
        workbox: {
          // Hanya app shell yang di-cache. Data API (nilai, absensi, dll.) selalu dari jaringan agar tidak basi.
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
          globIgnores: ["avatars/**", "dummy-nilai/**"],
          navigateFallback: "index.html",
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
              handler: "StaleWhileRevalidate",
              options: { cacheName: "google-fonts-stylesheets" },
            },
            {
              urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    // Origin ini terdaftar di Google Cloud Console untuk login Google.
    server: {
      port: 5714,
      strictPort: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
