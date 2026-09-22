import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { codeInspectorPlugin } from 'code-inspector-plugin';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),    codeInspectorPlugin({
    bundler: 'vite',
  }),],
  // Tailwind v4 runs through the @tailwindcss/vite plugin above, so this project
  // needs no PostCSS plugins. Declaring an inline (empty) config is deliberate:
  // it stops postcss-load-config from searching parent directories, which would
  // otherwise pick up an unrelated postcss.config.js outside the project and
  // run Tailwind v3 over our v4 stylesheet (breaks `npm run dev` and the build).
  server: {
    // Bind every interface, not just localhost, so the dev server is reachable
    // from another device on the LAN (a phone, a tablet, a colleague's laptop).
    // Vite's default is localhost-only, which is why its banner used to say
    // "use --host to expose".
    host: true,
  },
  css: {
    postcss: {},
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
