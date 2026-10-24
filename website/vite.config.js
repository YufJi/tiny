import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages project sites live under /<repo>/, so emitted asset URLs
  // must stay relative. Hash routing keeps page URLs independent of the base.
  base: './',
  server: { host: '127.0.0.1', port: 4173 },
  preview: { host: '127.0.0.1', port: 4173 },
})
