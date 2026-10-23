import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileMiniProgram } from '../packages/compiler-next/dist/index.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.resolve(rootDir, process.argv[2] ?? 'example/glass-easel/mini')
const outputDir = path.resolve(rootDir, process.argv[3] ?? 'packages/devtool/static/runtime/apps/demo/generated')

let building = false
let pending = false
let timer = null

async function build() {
  if (building) {
    pending = true
    return
  }
  building = true
  try {
    const result = await compileMiniProgram({ sourceDir, outputDir, clean: true, dev: true })
    const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
    const stamp = new Date().toLocaleTimeString()
    if (errors.length > 0) {
      console.error(`[watch ${stamp}] ${errors.length} error(s)`)
      for (const error of errors.slice(0, 5)) console.error(`  ${error.code}: ${error.message}`)
    } else {
      console.log(
        `[watch ${stamp}] ${path.relative(rootDir, sourceDir)} → ` +
          `${result.manifest.pages.length} pages, ${result.manifest.components.length} components`,
      )
    }
  } catch (error) {
    console.error(`[watch] compile failed: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    building = false
    if (pending) {
      pending = false
      void build()
    }
  }
}

function schedule() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    void build()
  }, 250)
}

await build()
fs.watch(sourceDir, { recursive: true }, (_event, file) => {
  if (file && !/\.(wxml|wxss|js|ts|json|wxs|sjs)$/i.test(file)) return
  schedule()
})
console.log(`[watch] watching ${path.relative(rootDir, sourceDir)}`)
