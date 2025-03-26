import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsonfigpathes from 'vite-tsconfig-paths';

export default defineConfig({
    server: {
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3000',
                ws: true,
                changeOrigin: true,
            },
        },
        port: 4000,
    },
    plugins: [react(), tsonfigpathes()],
    css: {},
});
