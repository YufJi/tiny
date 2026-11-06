import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@tiny/runtime/glass-easel': path.resolve(__dirname, '../../packages/runtime/src/glass-easel.ts'),
      '@tiny/host-web-components': path.resolve(__dirname, '../web-components/src/index.ts'),
      '@tiny/runtime': path.resolve(__dirname, '../../packages/runtime/src/index.ts'),
      '@tiny/manifest': path.resolve(__dirname, '../../packages/manifest/src/index.ts'),
    },
    dedupe: ['glass-easel'],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
