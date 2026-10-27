import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { docsPlugin } from './vite-plugin-docs.js'

const root = path.dirname(fileURLToPath(import.meta.url))

// GitHub Pages project sites live under `/<repo>/`; local dev and preview use
// `/`. The value is baked into asset URLs and every internal link.
const rawBase = process.env.TINY_SITE_BASE || '/'
const siteBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
// The SSR pass renders markup only; copying the 10 MiB devtool build again
// would just waste time.
const isSsrBuild = process.env.TINY_SSR === '1'

export default defineConfig({
  base: siteBase,
  // The embedded devtool is a build artifact, not source. `site:devtool`
  // writes it here so Vite serves it in dev and copies it to `dist/devtool/`
  // on build without polluting `website/public/` in git.
  publicDir: isSsrBuild ? false : '.cache/site-public',
  plugins: [docsPlugin({ root })],
  server: {
    host: '127.0.0.1',
    port: 4173,
    // Page content lives in `docs/site/`, outside this package.
    fs: { allow: [path.resolve(root, '..')] },
  },
  preview: { host: '127.0.0.1', port: 4173 },
})
