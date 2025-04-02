import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsonfigpathes from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    server: {
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3000',
                ws: true,
                changeOrigin: true,
            },
        },
    },
    plugins: [react(), tsonfigpathes(), svgr({
        svgrOptions: {
            icon: true,
        },
    }),],
    css: {},
});
