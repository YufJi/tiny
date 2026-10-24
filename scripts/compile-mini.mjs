import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileMiniProgram } from '../tools/cli/dist/index.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.resolve(rootDir, process.argv[2] ?? 'tests/apps/mini')
const outputDir = path.resolve(rootDir, process.argv[3] ?? 'tests/host/generated')

const result = await compileMiniProgram({
  sourceDir,
  outputDir,
  clean: true,
  dev: true,
})

const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
if (errors.length > 0) {
  console.error(errors)
  process.exitCode = 1
} else {
  console.log(
    `Compiled ${path.relative(rootDir, sourceDir)} to ${path.relative(rootDir, outputDir)} ` +
      `(${result.manifest.pages.length} pages, ${result.manifest.components.length} components)`,
  )
}
