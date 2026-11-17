import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixturesRoot = path.join(rootDir, 'tests/apps')
const expected = {
  renderer: 'webview',
  componentFramework: 'glass-easel',
  libVersion: '3.17.5',
}
const ignoredDirectories = new Set(['.git', '.cache', 'generated', 'node_modules'])
const errors = []
let checkedJsonFiles = 0

function relative(file) {
  return path.relative(rootDir, file).split(path.sep).join('/')
}

function fail(file, message) {
  errors.push(`${relative(file)}: ${message}`)
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    fail(file, `cannot parse JSON: ${error instanceof Error ? error.message : String(error)}`)
    return undefined
  }
}

function checkDeclaredPlatform(file, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return
  if ('renderer' in value && value.renderer !== expected.renderer) {
    fail(file, `renderer must be "${expected.renderer}" (got ${JSON.stringify(value.renderer)})`)
  }
  if (
    'componentFramework' in value
    && value.componentFramework !== expected.componentFramework
  ) {
    fail(
      file,
      `componentFramework must be "${expected.componentFramework}" ` +
        `(got ${JSON.stringify(value.componentFramework)})`,
    )
  }
  const rendererOptions = value.rendererOptions
  if (rendererOptions && typeof rendererOptions === 'object' && !Array.isArray(rendererOptions)) {
    for (const renderer of Object.keys(rendererOptions)) {
      if (renderer !== expected.renderer) {
        fail(file, `rendererOptions must not declare "${renderer}"`)
      }
    }
  }
}

function collectJsonFiles(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ignoredDirectories.has(entry.name)) continue
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectJsonFiles(target))
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(target)
    }
  }
  return files
}

const fixtures = fs.readdirSync(fixturesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
  .map((entry) => path.join(fixturesRoot, entry.name))
  .filter((directory) => fs.existsSync(path.join(directory, 'app.json')))
  .sort()

for (const fixture of fixtures) {
  const appConfigPath = path.join(fixture, 'app.json')
  const appConfig = readJson(appConfigPath)
  if (appConfig && typeof appConfig === 'object' && !Array.isArray(appConfig)) {
    if (appConfig.renderer !== expected.renderer) {
      fail(
        appConfigPath,
        `must declare renderer "${expected.renderer}" ` +
          `(got ${JSON.stringify(appConfig.renderer)})`,
      )
    }
    if (appConfig.componentFramework !== expected.componentFramework) {
      fail(
        appConfigPath,
        `must declare componentFramework "${expected.componentFramework}" ` +
          `(got ${JSON.stringify(appConfig.componentFramework)})`,
      )
    }
  }

  const projectConfigPath = path.join(fixture, 'project.config.json')
  if (!fs.existsSync(projectConfigPath)) {
    fail(projectConfigPath, 'missing project config for the WeChat DevTools baseline')
  } else {
    const projectConfig = readJson(projectConfigPath)
    if (projectConfig && typeof projectConfig === 'object' && !Array.isArray(projectConfig)) {
      if (projectConfig.compileType !== 'miniprogram') {
        fail(
          projectConfigPath,
          `compileType must be "miniprogram" (got ${JSON.stringify(projectConfig.compileType)})`,
        )
      }
      if (projectConfig.componentFramework !== expected.componentFramework) {
        fail(
          projectConfigPath,
          `componentFramework must be "${expected.componentFramework}" ` +
            `(got ${JSON.stringify(projectConfig.componentFramework)})`,
        )
      }
      if (projectConfig.libVersion !== expected.libVersion) {
        fail(
          projectConfigPath,
          `libVersion must be "${expected.libVersion}" ` +
            `(got ${JSON.stringify(projectConfig.libVersion)})`,
        )
      }
    }
  }

  for (const file of collectJsonFiles(fixture)) {
    checkedJsonFiles += 1
    checkDeclaredPlatform(file, readJson(file))
  }
}

if (errors.length > 0) {
  console.error(`✗ Fixture platform check failed (${errors.length} issue(s)):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exitCode = 1
} else {
  console.log(
    `✓ ${fixtures.length} test fixtures use ${expected.renderer} + ` +
      `${expected.componentFramework} with libVersion ${expected.libVersion} ` +
      `(${checkedJsonFiles} JSON files checked)`,
  )
}
