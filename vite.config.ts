import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    host: "0.0.0.0", // чтобы контейнер был доступен снаружи
    port: 5173, // можно любой свободный порт
    strictPort: true, // не переключать порт автоматически
    hmr: {
      host: "goapp.sulfurfun.ru", // для Hot Module Replacement через внешний домен
      protocol: "wss", // ws(HTTP) или wss(HTTPS)
    },
  },

  build: {
    // Показывать предупреждения о больших чанках
    chunkSizeWarningLimit: 500,
  },
});
