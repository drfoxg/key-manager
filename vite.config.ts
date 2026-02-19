import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return {
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
                host: env.VITE_HMR_HOST || "localhost", // для Hot Module Replacement через внешний домен
                protocol: env.VITE_HMR_PROTOCOL || "wss", // ws(HTTP) или wss(HTTPS)
            },
        },

        build: {
            // Показывать предупреждения о больших чанках
            chunkSizeWarningLimit: 500,
        },
    };
});
