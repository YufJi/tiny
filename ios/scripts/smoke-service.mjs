import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const iosDir = path.resolve(scriptDir, '..')
const rootDir = path.resolve(iosDir, '..')
const generatedDir = path.join(iosDir, 'Generated')
const smokeDir = path.join(iosDir, '.build/smoke')
const jscPath = '/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc'
const require = createRequire(path.join(rootDir, 'tools/cli/package.json'))
const esbuild = require('esbuild')

const appId = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? 'demo'
const verbose = process.argv.includes('--verbose')
const appDataFile = path.join(generatedDir, 'apps', appId, 'app-data.json')
const engineFile = path.join(generatedDir, 'service-engine.js')

if (!fs.existsSync(appDataFile) || !fs.existsSync(engineFile)) {
  console.error(`Missing generated app "${appId}". Run "node ios/scripts/build.mjs ${appId}" first.`)
  process.exit(1)
}
if (!fs.existsSync(jscPath)) {
  console.error(`jsc was not found at ${jscPath}`)
  process.exit(1)
}

await fsp.mkdir(smokeDir, { recursive: true })

const harnessEntry = path.join(smokeDir, 'host-harness.js')
await fsp.writeFile(
  harnessEntry,
  `import { BridgeConnection } from '@tiny/bridge'
import appData from ${JSON.stringify(appDataFile)}

let listener
let sent = 0
const queue = []

globalThis.__TINY_IOS_APP__ = appData
globalThis.__TINY_IOS__ = {
  menuButton: { width: 87, height: 32, top: 48, right: 365, bottom: 80, left: 278 },
  system: { pixelRatio: 2, windowWidth: 375, windowHeight: 712, platform: 'ios' },
}
globalThis.__tinyLog = (level, message) => { if (${verbose}) print('[' + level + '] ' + message) }
globalThis.__tinyError = (message) => print('SERVICE_ERROR ' + message)
globalThis.__tinyServiceStarted = (path) => { if (${verbose}) print('SERVICE_STARTED ' + path) }
globalThis.__tinySend = (json) => {
  sent += 1
  if (listener) listener(JSON.parse(json))
  else queue.push(json)
}
globalThis.__tinySchedule = (id, delay, repeat) => {
  const run = () => globalThis.__tinyFireTimer?.(id)
  if (repeat) setInterval(run, Math.max(1, delay))
  else setTimeout(run, Math.max(0, delay))
}
globalThis.__tinyCancelTimer = () => {}

const transport = {
  send(frame) {
    const receive = globalThis.__tinyReceiveFrame
    if (!receive) throw new Error('service receive is not installed')
    receive(JSON.stringify(frame))
  },
  close() {},
  onFrame(next) {
    listener = next
    while (queue.length > 0) next(JSON.parse(queue.shift()))
    return () => { listener = undefined }
  },
}

const host = new BridgeConnection({
  localRole: 'host',
  peerRole: 'service',
  transport,
  respondToHello: false,
})
for (const level of ['log', 'warn', 'error', 'state']) {
  host.onEvent('diagnostic', 'diagnostic.' + level, () => {})
}
host.onCall('api', 'storage.set', () => ({ errMsg: 'setStorageSync:ok' }))
host.onCall('api', 'storage.get', () => ({ value: null }))
host.onCall('api', 'storage.info', () => ({ keys: [], currentSize: 0, limitSize: 10240 }))
for (const method of ['flow', 'snapshot', 'patch', 'animate', 'clearAnimate']) {
  host.onEvent('tree', method, () => {})
}

globalThis.__runHostSmoke = async () => {
  const manifest = appData.manifest
  const firstPage = manifest.pages.find((page) => page.bodyType !== 'component')?.path
    ?? manifest.pages[0]?.path
    ?? ''
  await host.handshake()
  const boot = await host.control('runtime', 'bootstrap', {
    manifest,
    initialPath: firstPage,
    systemInfo: { pixelRatio: 2, windowWidth: 375, windowHeight: 712, platform: 'ios', SDKVersion: '3.0.0' },
    storage: {},
  })
  print('SMOKE_OK ' + JSON.stringify({
    appId: appData.appId,
    pageId: boot.pageId,
    currentPath: boot.currentPath,
    pages: manifest.pages.length,
    registeredPages: boot.registeredPages.length,
    componentSchemas: boot.componentSchemas.length,
    sentFrames: sent,
  }))
  await host.close()
}
`,
)

const aliases = {
  '@tiny/runtime': path.join(rootDir, 'packages/runtime/dist/index.js'),
  '@tiny/bridge': path.join(rootDir, 'packages/bridge/dist/index.js'),
  '@tiny/manifest': path.join(rootDir, 'packages/manifest/dist/index.js'),
}

await esbuild.build({
  entryPoints: [harnessEntry],
  outfile: path.join(smokeDir, 'host-bundle.js'),
  bundle: true,
  format: 'iife',
  platform: 'neutral',
  target: ['es2019'],
  alias: aliases,
  logLevel: 'warning',
  legalComments: 'none',
  loader: { '.json': 'json' },
})

const runner = path.join(smokeDir, 'runner.js')
await fsp.writeFile(
  runner,
  `globalThis.__runHostSmoke().then(
  () => {},
  (error) => {
    print('SMOKE_FAIL ' + (error && error.name) + ' code=' + (error && error.code) + ' message=' + (error && error.message))
    print(error && (error.stack || error))
    quit(1)
  },
)
`,
)

const result = spawnSync(
  jscPath,
  [
    '-f', path.join(smokeDir, 'host-bundle.js'),
    '-f', engineFile,
    '-f', runner,
  ],
  { encoding: 'utf8' },
)

process.stdout.write(result.stdout ?? '')
process.stderr.write(result.stderr ?? '')
if (result.status !== 0 || !(result.stdout ?? '').includes('SMOKE_OK')) {
  process.exit(result.status || 1)
}
