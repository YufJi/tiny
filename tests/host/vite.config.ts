import path from 'node:path'
import { defineConfig } from 'vite'

const runtimeRoot = path.resolve(__dirname, '../../packages/runtime')

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@tiny/host-browser': path.resolve(__dirname, '../../hosts/browser/src/index.ts'),
      '@tiny/host-web-components': path.resolve(__dirname, '../../hosts/web-components/src/index.ts'),
      '@tiny/runtime': path.resolve(runtimeRoot, 'src/index.ts'),
      // The runtime imports naming helpers as values; resolve them from source
      // so the dev host does not mix ESM sources with the CommonJS manifest build.
      '@tiny/manifest': path.resolve(__dirname, '../../packages/manifest/src/index.ts'),
      'glass-easel': path.resolve(runtimeRoot, 'node_modules/glass-easel/dist/glass_easel.all.es.js'),
    },
  },
  server: {
    fs: {
      allow: ['.', '../../packages', '../../hosts'],
    },
  },
})
