import path from 'node:path'
import { defineConfig } from 'vite'

const runtimeRoot = path.resolve(__dirname, '../../packages/runtime')

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@tiny/host-browser': path.resolve(__dirname, '../../hosts/browser/src/index.ts'),
      '@tiny/runtime': path.resolve(runtimeRoot, 'src/index.ts'),
      'glass-easel': path.resolve(runtimeRoot, 'node_modules/glass-easel/dist/glass_easel.all.es.js'),
    },
  },
  server: {
    fs: {
      allow: ['.', '../../packages', '../../hosts'],
    },
  },
})
