import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages project sites live under /<repo>/, so emitted asset URLs
  // must stay relative. Hash routing keeps page URLs independent of the base.
  base: './',
  // The embedded devtool is a build artifact, not source. `site:devtool`
  // writes it here so Vite serves it in dev and copies it to `dist/devtool/`
  // on build without polluting `website/public/` in git.
  publicDir: '.cache/site-public',
  server: { host: '127.0.0.1', port: 4173 },
  preview: { host: '127.0.0.1', port: 4173 },
})
