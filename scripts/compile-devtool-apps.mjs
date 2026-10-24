import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileMiniProgram } from '../tools/cli/dist/index.js'
import {
  devtoolRegistryPath,
  discoverTestApps,
  writeDevtoolAppsRegistry,
} from './devtool-apps.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apps = discoverTestApps()

if (apps.length === 0) {
  console.error(`[devtool] no test apps found under ${path.join(rootDir, 'tests/apps')}`)
  process.exit(1)
}

let failed = false
for (const app of apps) {
  const startedAt = Date.now()
  try {
    const result = await compileMiniProgram({
      sourceDir: app.sourceDir,
      outputDir: app.outputDir,
      clean: true,
      dev: true,
    })
    const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
    if (errors.length > 0) {
      failed = true
      console.error(`[devtool] ${app.source} failed with ${errors.length} error(s)`)
      for (const error of errors.slice(0, 5)) console.error(`  ${error.code}: ${error.message}`)
      continue
    }
    console.log(
      `[devtool] ${app.source} → ${app.output} ` +
        `(${result.manifest.pages.length} pages, ${result.manifest.components.length} components, ` +
        `${Date.now() - startedAt}ms)`,
    )
  } catch (error) {
    failed = true
    console.error(
      `[devtool] ${app.source} compile failed: ` +
        (error instanceof Error ? error.message : String(error)),
    )
  }
}

if (failed) {
  process.exitCode = 1
} else {
  writeDevtoolAppsRegistry(apps)
  console.log(
    `[devtool] ${apps.length} test apps ready (${apps.map((app) => app.id).join(', ')}); ` +
      `registry: ${path.relative(rootDir, devtoolRegistryPath)}`,
  )
}
