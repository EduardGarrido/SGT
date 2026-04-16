import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    main: {
        build: {
            rollupOptions: {
                input: './src/main/distMain.js'
            }
        }
    },
    preload: {
        build: {
            rollupOptions: {
                input: './src/main/preload.js'
            }
        }
    },
    renderer: {
        root: "src/renderer",
        plugins: [react(), tailwindcss()]
    }
})