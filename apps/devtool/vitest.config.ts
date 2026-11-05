import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Keep the projection tests on the manifest sources, like the app's Vite alias:
// a checkout must not need a prior package build just to run this suite.
export default defineConfig({
  resolve: {
    alias: {
      '@tiny/manifest': path.resolve(__dirname, '../../packages/manifest/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
