import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileMiniProgram } from '../packages/compiler-next/dist/index.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const result = await compileMiniProgram({
  sourceDir: path.join(rootDir, 'example/glass-easel/mini'),
  outputDir: path.join(rootDir, 'example/glass-easel/generated'),
  clean: true,
  dev: true,
})

const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
if (errors.length > 0) {
  console.error(errors)
  process.exitCode = 1
} else {
  console.log(`Compiled glass-easel example to ${result.outputDir}`)
}
