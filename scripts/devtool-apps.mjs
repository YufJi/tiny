import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const devtoolStaticRoot = path.join(rootDir, 'apps/devtool/static')
export const devtoolRuntimeRoot = path.join(devtoolStaticRoot, 'runtime')
export const devtoolAppsRoot = path.join(devtoolRuntimeRoot, 'apps')
export const devtoolRegistryPath = path.join(devtoolRuntimeRoot, 'apps.json')

const testAppsRoot = path.join(rootDir, 'tests/apps')
// Keep the fixtures that the acceptance gate exercises first; any new fixture
// is appended alphabetically without touching this list.
const preferredOrder = ['demo', 'mini', 'todo', 'wechat-demo', 'echarts']

/**
 * Discover every mini-program fixture under tests/apps.
 *
 * The devtool serves `/runtime/apps/<id>/generated` and advertises the same
 * list through `/runtime/apps.json`, so adding a fixture directory only
 * requires restarting `pnpm dev:devtool` or re-running `pnpm compile:devtool:all`.
 */
export function discoverTestApps() {
  if (!fs.existsSync(testAppsRoot)) return []
  const apps = []
  for (const entry of fs.readdirSync(testAppsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue
    const sourceDir = path.join(testAppsRoot, entry.name)
    const configPath = path.join(sourceDir, 'app.json')
    if (!fs.existsSync(configPath)) continue

    let config
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    } catch (error) {
      throw new Error(
        `Failed to parse ${path.relative(rootDir, configPath)}: ` +
          (error instanceof Error ? error.message : String(error)),
      )
    }

    const pages = Array.isArray(config.pages)
      ? config.pages.filter((page) => typeof page === 'string' && page.length > 0)
      : []
    if (pages.length === 0) {
      throw new Error(`${path.relative(rootDir, configPath)} must declare at least one page`)
    }

    const subPackages = Array.isArray(config.subPackages)
      ? config.subPackages
      : Array.isArray(config.subpackages) ? config.subpackages : []
    const subPackagePages = subPackages.reduce(
      (count, subPackage) => count + (Array.isArray(subPackage?.pages) ? subPackage.pages.length : 0),
      0,
    )

    const outputDir = path.join(devtoolAppsRoot, entry.name, 'generated')
    apps.push({
      id: entry.name,
      label: `tests/apps/${entry.name}`,
      title: typeof config.window?.navigationBarTitleText === 'string'
        ? config.window.navigationBarTitleText
        : '',
      pages: pages.length + subPackagePages,
      firstPage: pages[0],
      sourceDir,
      outputDir,
      source: relativeToRoot(sourceDir),
      output: relativeToRoot(outputDir),
    })
  }
  return apps.sort(compareApps)
}

export function toRegistryEntry(app) {
  return {
    id: app.id,
    label: app.label,
    title: app.title,
    pages: app.pages,
    firstPage: app.firstPage,
  }
}

export function writeDevtoolAppsRegistry(apps) {
  fs.mkdirSync(path.dirname(devtoolRegistryPath), { recursive: true })
  const payload = {
    schemaVersion: 1,
    apps: apps.map(toRegistryEntry),
  }
  fs.writeFileSync(devtoolRegistryPath, `${JSON.stringify(payload, null, 2)}\n`)
  return devtoolRegistryPath
}

function relativeToRoot(target) {
  return path.relative(rootDir, target).split(path.sep).join('/')
}

function compareApps(left, right) {
  const leftIndex = preferredOrder.indexOf(left.id)
  const rightIndex = preferredOrder.indexOf(right.id)
  if (leftIndex !== rightIndex) {
    if (leftIndex === -1) return 1
    if (rightIndex === -1) return -1
    return leftIndex - rightIndex
  }
  return left.id.localeCompare(right.id)
}
