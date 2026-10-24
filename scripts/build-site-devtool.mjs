import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { discoverTestApps, toRegistryEntry } from './devtool-apps.mjs'

/**
 * Package the devtool for the architecture site.
 *
 * The site is deployed to a GitHub Pages project path, so the devtool cannot
 * reuse `apps/devtool/static/runtime` or publish under `/`. This script:
 *
 *   1. compiles every fixture under `tests/apps` (or the subset named by
 *      `TINY_SITE_DEVTOOL_APPS`),
 *   2. builds the devtool with relative production URLs,
 *   3. copies the result into the website's Vite public directory
 *      (`website/.cache/site-public/devtool`), which Vite publishes verbatim
 *      at `dist/devtool/`.
 *
 * The embedded panel still boots the real dual-thread runtime. By default the
 * site ships every fixture so the app selector matches `pnpm dev:devtool`.
 */

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Keep compiled fixtures outside `website/`: its package.json is an ES module,
// and esbuild would treat generated CommonJS scripts as ESM (breaking fixtures
// that use `module.exports`). Root has no "type" field, matching the devtool.
const cacheDir = path.join(rootDir, '.cache/site-devtool')
const runtimeDir = path.join(cacheDir, 'runtime')
const outputDir = path.join(cacheDir, 'dist')
// Vite's publicDir points at `website/.cache/site-public`, so this directory
// is both served by `pnpm site:dev` and copied to `website/dist/devtool/` by
// `pnpm site:build`. Everything under `.cache/` stays out of git.
const publicDir = path.join(rootDir, 'website/.cache/site-public/devtool')
const requestedApps = (process.env.TINY_SITE_DEVTOOL_APPS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

function fail(message) {
  console.error(`[site:devtool] ${message}`)
  process.exit(1)
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    ...options,
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    fail(`${command} ${args.join(' ')} failed with exit code ${result.status}`)
  }
}

function directorySize(target) {
  let total = 0
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const fullPath = path.join(target, entry.name)
    if (entry.isDirectory()) total += directorySize(fullPath)
    else if (entry.isFile()) total += fs.statSync(fullPath).size
  }
  return total
}

function findRequiredApp(apps, id) {
  const app = apps.find((candidate) => candidate.id === id)
  if (!app) {
    fail(
      `unknown fixture "${id}" in TINY_SITE_DEVTOOL_APPS; available: ` +
        apps.map((candidate) => candidate.id).join(', '),
    )
  }
  return app
}

// The compiler and host packages are consumed through their built entry points.
// Build them on a fresh checkout so `pnpm site:build` is self-contained.
const requiredBuilds = [
  'tools/cli/dist/index.js',
  'packages/runtime/dist/index.js',
  'hosts/browser/dist/index.js',
]
if (requiredBuilds.some((relativePath) => !fs.existsSync(path.join(rootDir, relativePath)))) {
  console.log('[site:devtool] workspace packages are not built; running pnpm build:glass-easel')
  run(pnpm, ['build:glass-easel'])
}

const apps = discoverTestApps()
if (apps.length === 0) fail('no test apps found under tests/apps')
const selectedApps = requestedApps.length > 0
  ? [...new Set(requestedApps)].map((id) => findRequiredApp(apps, id))
  : apps

console.log(
  `[site:devtool] fixtures: ${selectedApps.map((app) => app.id).join(', ')} ` +
    `(${selectedApps.length}/${apps.length})`,
)

const { compileMiniProgram } = await import(
  pathToFileURL(path.join(rootDir, 'tools/cli/dist/index.js')).href
)

fs.rmSync(cacheDir, { recursive: true, force: true })
fs.mkdirSync(runtimeDir, { recursive: true })

for (const app of selectedApps) {
  const startedAt = Date.now()
  const outputDirForApp = path.join(runtimeDir, 'apps', app.id, 'generated')
  const result = await compileMiniProgram({
    sourceDir: app.sourceDir,
    outputDir: outputDirForApp,
    clean: true,
  })
  const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
  if (errors.length > 0) {
    fail(
      `${app.source} failed with ${errors.length} error(s): ` +
        errors.slice(0, 3).map((error) => `${error.code}: ${error.message}`).join('; '),
    )
  }
  console.log(
    `[site:devtool] ${app.source} → ${path.relative(rootDir, outputDirForApp)} ` +
      `(${result.manifest.pages.length} pages, ${Date.now() - startedAt}ms)`,
  )
}

fs.writeFileSync(
  path.join(runtimeDir, 'apps.json'),
  `${JSON.stringify({ schemaVersion: 1, apps: selectedApps.map(toRegistryEntry) }, null, 2)}\n`,
)

console.log(
  `[site:devtool] building devtool (${selectedApps.map((app) => app.id).join(', ')}) ` +
    'with relative production URLs',
)
run(pnpm, ['--filter', 'devtool', 'exec', 'rspack', 'build'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    TINY_DEVTOOL_RUNTIME_ROOT: runtimeDir,
    TINY_DEVTOOL_OUT_DIR: outputDir,
  },
})

const requiredOutputs = [
  'index.html',
  'next-service.html',
  'next-render.html',
  'nextHost.js',
  'runtime/apps.json',
  ...selectedApps.map((app) => `runtime/apps/${app.id}/generated/manifest.json`),
]
for (const relativePath of requiredOutputs) {
  if (!fs.existsSync(path.join(outputDir, relativePath))) {
    fail(`devtool build did not emit ${relativePath}`)
  }
}

fs.rmSync(publicDir, { recursive: true, force: true })
fs.mkdirSync(path.dirname(publicDir), { recursive: true })
fs.cpSync(outputDir, publicDir, { recursive: true })

const size = directorySize(publicDir)
console.log(
  `[site:devtool] packaged ${(size / 1024 / 1024).toFixed(2)} MiB → ` +
    `${path.relative(rootDir, publicDir)}/ (iframe URL: ./devtool/index.html)`,
)
