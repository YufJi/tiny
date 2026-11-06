import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@tiny/runtime/glass-easel': path.resolve(__dirname, '../../packages/runtime/src/glass-easel.ts'),
    },
    dedupe: ['glass-easel'],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
