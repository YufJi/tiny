import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { compileMiniProgram } from '../../tools/cli/dist/index.js'
import { discoverTestApps } from '../../scripts/devtool-apps.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const iosDir = path.resolve(scriptDir, '..')
const rootDir = path.resolve(iosDir, '..')
const generatedDir = path.join(iosDir, 'Generated')
const buildDir = path.join(iosDir, '.build')
const wwwDir = path.join(generatedDir, 'www')
const appsDir = path.join(generatedDir, 'apps')
const packageDist = path.join(rootDir, 'hosts/ios/dist')
const webDist = path.join(packageDist, 'web')
const serviceDist = path.join(packageDist, 'service')

const APP_LABELS = {
  demo: 'Tiny Demo',
  mini: 'Mini Todo',
  todo: 'Taro Todos',
  'wechat-demo': 'WeChat Demo',
  echarts: 'ECharts Demo',
  vant: 'Vant Demo',
  weui: 'WeUI Demo',
}

const APP_DEFS = discoverTestApps().map((app) => {
  const label = APP_LABELS[app.id] ?? `tests/apps/${app.id}`
  return {
    id: app.id,
    source: app.sourceDir,
    label,
    title: app.title || label,
  }
})

const requiredBuilds = [
  'packages/manifest/dist/index.js',
  'packages/runtime/dist/index.js',
  'packages/bridge/dist/index.js',
  'hosts/browser/dist/index.js',
  'hosts/web-components/dist/index.js',
  'tools/cli/dist/index.js',
]

const requestedApps = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
const skipCompile = process.argv.includes('--skip-compile')
const skipPackages = process.argv.includes('--skip-packages')
const apps = requestedApps.length > 0
  ? APP_DEFS.filter((app) => requestedApps.includes(app.id))
  : APP_DEFS

if (apps.length === 0) {
  console.error(`Unknown app id. Available: ${APP_DEFS.map((app) => app.id).join(', ')}`)
  process.exit(1)
}

for (const relativePath of requiredBuilds) {
  if (!fs.existsSync(path.join(rootDir, relativePath))) {
    console.error(
      `Missing ${relativePath}. Run "pnpm build:glass-easel" before building the iOS host.`,
    )
    process.exit(1)
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed`)
  }
}

async function buildPackages() {
  console.log('Building @tiny/host-ios (service engine + WebView entries)...')
  run('pnpm', ['--filter', '@tiny/host-ios', 'build'])

  for (const file of [
    path.join(webDist, 'host.html'),
    path.join(webDist, 'render.html'),
    path.join(serviceDist, 'service-engine.js'),
  ]) {
    if (!fs.existsSync(file)) {
      throw new Error(`Package build did not produce ${path.relative(rootDir, file)}`)
    }
  }
}

async function readStyles(manifest, compiledDir) {
  const styles = {}
  for (const style of manifest.styles ?? []) {
    for (const stylePath of [style.outputPath, style.lowPriorityPath]) {
      if (!stylePath || styles[stylePath] !== undefined) continue
      const file = path.join(compiledDir, stylePath)
      if (fs.existsSync(file)) styles[stylePath] = await fsp.readFile(file, 'utf8')
    }
  }
  return styles
}

async function copyAssets(manifest, compiledDir, appOutputDir) {
  const assetsRoot = path.join(appOutputDir, 'assets')
  for (const asset of manifest.assets ?? []) {
    const source = path.join(compiledDir, asset.path)
    if (!fs.existsSync(source)) continue
    const target = path.join(assetsRoot, asset.path)
    await fsp.mkdir(path.dirname(target), { recursive: true })
    await fsp.copyFile(source, target)
  }
}

async function buildApp(appDef) {
  const workDir = path.join(buildDir, appDef.id)
  const compiledDir = path.join(workDir, 'compiled')
  await fsp.mkdir(workDir, { recursive: true })

  if (!skipCompile || !fs.existsSync(path.join(compiledDir, 'manifest.json'))) {
    await compileMiniProgram({
      sourceDir: appDef.source,
      outputDir: compiledDir,
      clean: true,
      dev: true,
    })
  }

  const manifest = JSON.parse(
    await fsp.readFile(path.join(compiledDir, 'manifest.json'), 'utf8'),
  )
  const firstPage = manifest.pages.find((page) => page.bodyType !== 'component')?.path
    ?? manifest.pages[0]?.path
    ?? ''

  const templatesSource = await fsp.readFile(path.join(compiledDir, 'templates.js'), 'utf8')
  const serviceSource = await fsp.readFile(path.join(compiledDir, 'service.js'), 'utf8')
  const styles = await readStyles(manifest, compiledDir)

  const appOutputDir = path.join(appsDir, appDef.id)
  await fsp.mkdir(appOutputDir, { recursive: true })

  const appData = {
    appId: appDef.id,
    label: appDef.label,
    manifest,
    templatesSource,
    serviceSource,
    styles,
    assetsBase: `tinyapp://app/apps/${appDef.id}/assets/`,
  }
  await fsp.writeFile(
    path.join(appOutputDir, 'app-data.json'),
    JSON.stringify(appData),
  )

  await copyAssets(manifest, compiledDir, appOutputDir)

  const meta = {
    id: appDef.id,
    label: appDef.label,
    title: appDef.title,
    pages: manifest.pages.length,
    firstPage,
    manifest,
  }
  await fsp.writeFile(
    path.join(appOutputDir, 'meta.json'),
    JSON.stringify(meta),
  )

  const appDataBytes = fs.statSync(path.join(appOutputDir, 'app-data.json')).size
  console.log(
    `  ${appDef.id.padEnd(6)} ${String(manifest.pages.length).padStart(3)} pages  ` +
    `app-data ${(appDataBytes / 1024 / 1024).toFixed(2)} MB`,
  )
  return {
    id: appDef.id,
    label: appDef.label,
    title: appDef.title,
    pages: manifest.pages.length,
    firstPage,
  }
}

console.log('Assembling iOS host artifacts...')
if (!skipPackages) {
  await buildPackages()
} else {
  console.log('  reusing package dist outputs')
}

await fsp.rm(generatedDir, { recursive: true, force: true })
await fsp.mkdir(wwwDir, { recursive: true })
await fsp.mkdir(appsDir, { recursive: true })

await fsp.cp(webDist, wwwDir, { recursive: true })
await fsp.copyFile(
  path.join(serviceDist, 'service-engine.js'),
  path.join(generatedDir, 'service-engine.js'),
)
console.log('  web dist + service engine copied')

const registry = []
for (const appDef of apps) {
  registry.push(await buildApp(appDef))
}

await fsp.writeFile(
  path.join(generatedDir, 'apps.json'),
  JSON.stringify({ apps: registry }),
)

console.log(`\nWrote ${path.relative(rootDir, generatedDir)}`)
console.log(`  apps: ${registry.map((app) => app.id).join(', ')}`)
console.log('Done. Open ios/TinyHost.xcodeproj or run "pnpm ios:sim".')
