import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['glass-easel', '@tiny/template-compiler'],
    },
    minify: false,
    sourcemap: true,
    emptyOutDir: true,
  },
})
