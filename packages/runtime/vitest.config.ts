import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // The kernel ships no default API table; its integration tests inject the
      // standard one. Alias to source so tests use the api entry without adding
      // a package edge: @tiny/api no longer depends on the runtime.
      '@tiny/api': fileURLToPath(new URL('../api/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
