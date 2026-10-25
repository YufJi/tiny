import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    // Use manifest sources so the library build does not bundle the CommonJS
    // manifest output (named re-exports are not statically analyzable there).
    alias: {
      '@tiny/manifest': path.resolve(__dirname, '../manifest/src/index.ts'),
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['glass-easel'],
    },
    minify: false,
    sourcemap: true,
    emptyOutDir: true,
  },
})
