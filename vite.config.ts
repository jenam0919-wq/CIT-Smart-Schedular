
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// Node.js >= 20.11 supports import.meta.dirname natively; fallback to fileURLToPath for older runtimes
const currentDir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const backendUrl = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8001';

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(currentDir, '.'),
      },
    },

    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,

      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error(
                '[API Proxy Error] Backend is unavailable:',
                err.message
              );
              console.error(
                `[API Proxy Error] Expected backend at: ${backendUrl}`
              );
            });
          },
        },
      },

      // Preserve AI Studio HMR configuration.
      hmr: env.DISABLE_HMR !== 'true',

      // Preserve AI Studio file-watching configuration.
      watch: env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
