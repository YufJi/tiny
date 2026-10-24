import path from 'node:path'
import { defineConfig } from 'vite'

const runtimeRoot = path.resolve(__dirname, '../../packages/runtime')

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@tiny/runtime': path.resolve(runtimeRoot, 'src/index.ts'),
      'glass-easel': path.resolve(runtimeRoot, 'node_modules/glass-easel/dist/glass_easel.all.es.js'),
    },
  },
  server: {
    fs: {
      allow: ['.', '../../packages'],
    },
  },
})
