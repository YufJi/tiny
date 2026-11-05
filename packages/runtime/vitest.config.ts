import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // The kernel ships no default API table; its integration tests inject the
      // standard one. Aliasing to source keeps a test-only edge out of the
      // workspace graph: runtime <- @tiny/api is already a dependency, so a
      // devDependency back onto it would close a build cycle.
      '@tiny/api': fileURLToPath(new URL('../api/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
