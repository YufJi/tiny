import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileMiniProgram } from '../tools/cli/dist/index.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const result = await compileMiniProgram({
  sourceDir: path.join(rootDir, 'test-apps/demo'),
  outputDir: path.join(rootDir, 'hosts/browser/generated'),
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
