import path from 'node:path'
import { defineConfig } from 'vite'

const runtimeRoot = path.resolve(__dirname, '../../packages/runtime')

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@tiny/runtime/glass-easel': path.resolve(runtimeRoot, 'src/glass-easel.ts'),
      '@tiny/host-web': path.resolve(__dirname, '../../hosts/web/src/index.ts'),
      '@tiny/host-core-wasm': path.resolve(__dirname, '../../native/host-core-wasm/pkg/tiny_host_core_wasm.js'),
      '@tiny/host-web-components': path.resolve(__dirname, '../../hosts/web-components/src/index.ts'),
      '@tiny/runtime': path.resolve(runtimeRoot, 'src/index.ts'),
      '@tiny/api': path.resolve(__dirname, '../../packages/api/src/index.ts'),
      // The runtime imports naming helpers as values; resolve them from source
      // so the dev host does not mix ESM sources with the CommonJS manifest build.
      '@tiny/manifest': path.resolve(__dirname, '../../packages/manifest/src/index.ts'),
      'glass-easel': path.resolve(runtimeRoot, 'node_modules/glass-easel/dist/glass_easel.all.es.js'),
    },
    dedupe: ['glass-easel'],
  },
  server: {
    fs: {
      allow: ['.', '../../packages', '../../hosts', '../../native'],
    },
  },
})
