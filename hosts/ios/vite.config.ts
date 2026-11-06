import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  if (mode === 'service') {
    return {
      publicDir: false,
      resolve: { dedupe: ['glass-easel'] },
      build: {
        lib: {
          entry: path.join(packageRoot, 'src/service/entry.ts'),
          formats: ['iife'],
          name: 'TinyIOSService',
          fileName: () => 'service-engine.js',
        },
        outDir: path.join(packageRoot, 'dist/service'),
        emptyOutDir: true,
        target: 'es2019',
        commonjsOptions: {
          include: [/node_modules/, /packages[\\/]runtime/, /packages[\\/]api/, /hosts[\\/]web/],
        },
        minify: false,
        sourcemap: false,
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
      },
    }
  }

  return {
    root: path.join(packageRoot, 'src/web'),
    base: './',
    publicDir: false,
    resolve: { dedupe: ['glass-easel'] },
    build: {
      outDir: path.join(packageRoot, 'dist/web'),
      emptyOutDir: true,
      target: 'safari16',
      commonjsOptions: {
        include: [/node_modules/, /packages[\\/]runtime/, /packages[\\/]api/, /hosts[\\/]web/],
      },
      minify: false,
      sourcemap: false,
      rollupOptions: {
        input: {
          render: path.join(packageRoot, 'src/web/render.html'),
        },
      },
    },
  }
})
