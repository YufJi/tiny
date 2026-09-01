import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: [
        /^@tiny\//,
        /^node:/,
        'fs',
        'path',
        'typescript',
        'postcss',
      ],
    },
    minify: false,
    sourcemap: true,
    emptyOutDir: true,
  },
})
