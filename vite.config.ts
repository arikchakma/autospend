import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
  ssr: {
    noExternal: ['react-dropzone'],
  },
  server: {
    allowedHosts: ['app.daroyan.com'],
  },
  build: {
    sourcemap: isDev,
    minify: !isDev,
  },
});
