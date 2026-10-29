import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const workspace = path.resolve(packageRoot, '../..')

export default defineConfig(({ mode }) => {
  if (mode === 'service') {
    return {
      publicDir: false,
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
          include: [/node_modules/, /packages[\\/]runtime/, /hosts[\\/]browser/],
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
    build: {
      outDir: path.join(packageRoot, 'dist/web'),
      emptyOutDir: true,
      target: 'safari16',
      commonjsOptions: {
        include: [/node_modules/, /packages[\\/]runtime/, /hosts[\\/]browser/],
      },
      minify: false,
      sourcemap: false,
      rollupOptions: {
        input: {
          host: path.join(packageRoot, 'src/web/host.html'),
          render: path.join(packageRoot, 'src/web/render.html'),
        },
      },
    },
  }
})
