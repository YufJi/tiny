import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { docsPlugin } from './vite-plugin-docs.js'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // GitHub Pages project sites live under /<repo>/, so emitted asset URLs
  // must stay relative. Hash routing keeps page URLs independent of the base.
  base: './',
  // The embedded devtool is a build artifact, not source. `site:devtool`
  // writes it here so Vite serves it in dev and copies it to `dist/devtool/`
  // on build without polluting `website/public/` in git.
  publicDir: '.cache/site-public',
  plugins: [docsPlugin({ root })],
  server: {
    host: '127.0.0.1',
    port: 4173,
    // Page content lives in `docs/site/`, outside this package.
    fs: { allow: [path.resolve(root, '..')] },
  },
  preview: { host: '127.0.0.1', port: 4173 },
})
