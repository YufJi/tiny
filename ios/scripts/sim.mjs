import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const iosDir = path.resolve(scriptDir, '..')
const rootDir = path.resolve(iosDir, '..')
const derivedDir = path.join(iosDir, '.derived')
const artifactDir = path.join(iosDir, '.artifacts')
const bundleId = 'com.tiny.host'
const appPath = path.join(derivedDir, 'Build/Products/Debug-iphonesimulator/TinyHost.app')

const args = process.argv.slice(2)
const skipAssets = args.includes('--skip-assets')
const skipBuild = args.includes('--skip-build')
const requestedApps = args.filter((arg) => !arg.startsWith('--'))
let apps = requestedApps

if (process.platform !== 'darwin') {
  console.error('iOS simulator verification requires macOS.')
  process.exit(1)
}

function command(commandName, commandArgs, options = {}) {
  return spawnSync(commandName, commandArgs, {
    cwd: rootDir,
    encoding: 'utf8',
    ...options,
  })
}

function run(commandName, commandArgs, options = {}) {
  const result = command(commandName, commandArgs, options)
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`${commandName} ${commandArgs.join(' ')} failed\n${detail}`)
  }
  return result.stdout ?? ''
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function findDevice() {
  const payload = JSON.parse(run('xcrun', ['simctl', 'list', 'devices', 'available', '-j']))
  const devices = Object.values(payload.devices ?? {}).flat()
  if (devices.length === 0) {
    throw new Error(
      'No iOS simulator devices are available. Install an iOS runtime in Xcode Settings > Components.',
    )
  }
  const requested = process.env.TINY_IOS_DEVICE
  if (requested) {
    const match = devices.find((device) => device.udid === requested || device.name === requested)
    if (!match) throw new Error(`No simulator matches TINY_IOS_DEVICE=${requested}`)
    return match
  }
  return devices.find((device) => device.name.startsWith('iPhone')) ?? devices[0]
}

async function main() {
  const device = findDevice()
  console.log(`Simulator: ${device.name} (${device.udid})`)

  if (device.state !== 'Booted') {
    console.log('Booting simulator...')
    const boot = command('xcrun', ['simctl', 'boot', device.udid], { stdio: 'inherit' })
    if (boot.status !== 0) {
      // "Unable to boot device in current state: Booted" is harmless.
    }
    run('xcrun', ['simctl', 'bootstatus', device.udid, '-b'], { stdio: 'inherit' })
  }

  if (!skipAssets) {
    console.log('Building WKWebView/JavaScriptCore assets...')
    run('node', [path.join(iosDir, 'scripts/build.mjs'), ...apps], { stdio: 'inherit' })
  }

  if (apps.length === 0) {
    const registryFile = path.join(iosDir, 'Generated/apps.json')
    if (!fs.existsSync(registryFile)) {
      throw new Error('No generated apps found. Run pnpm ios:assets first.')
    }
    const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'))
    apps = (registry.apps ?? []).map((app) => app.id)
    if (apps.length === 0) throw new Error('Generated/apps.json has no apps')
  }
  console.log(`Apps: ${apps.join(', ')}`)

  if (!skipBuild) {
    console.log('Building TinyHost.app...')
    const archArgs = process.arch === 'arm64'
      ? ['ARCHS=arm64', 'ONLY_ACTIVE_ARCH=YES']
      : []
    const result = command('xcodebuild', [
      '-project', path.join(iosDir, 'TinyHost.xcodeproj'),
      '-scheme', 'TinyHost',
      '-configuration', 'Debug',
      '-sdk', 'iphonesimulator',
      '-destination', `platform=iOS Simulator,id=${device.udid}`,
      '-derivedDataPath', derivedDir,
      'CODE_SIGNING_ALLOWED=NO',
      ...archArgs,
      'build',
    ], { encoding: 'utf8' })
    if (result.status !== 0) {
      const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim()
      const lines = output.split('\n')
      console.error(lines.slice(-60).join('\n'))
      throw new Error('xcodebuild failed; see the log above')
    }
  }

  if (!fs.existsSync(appPath)) {
    throw new Error(`Built app was not found at ${appPath}`)
  }

  await fsp.mkdir(artifactDir, { recursive: true })
  run('xcrun', ['simctl', 'install', device.udid, appPath], { stdio: 'inherit' })

  const results = []
  for (const appId of apps) {
    const container = run(
      'xcrun',
      ['simctl', 'get_app_container', device.udid, bundleId, 'data'],
    ).trim()
    const documents = path.join(container, 'Documents')
    const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    console.log(`\nLaunching ${appId} with smoke mode...`)
    run('xcrun', [
      'simctl', 'launch', '--terminate-running-process',
      device.udid, bundleId,
      '-TINY_AUTOLAUNCH', appId,
      '-TINY_SMOKE',
      '-TINY_RUN_ID', runId,
    ])

    const deadline = Date.now() + 30_000
    let smoke
    while (Date.now() < deadline) {
      const file = path.join(documents, 'smoke-result.json')
      if (fs.existsSync(file)) {
        try {
          const candidate = JSON.parse(await fsp.readFile(file, 'utf8'))
          if (candidate.runId === runId) {
            smoke = candidate
            break
          }
        } catch {
          // The app may still be writing it.
        }
      }
      await sleep(400)
    }

    const screenshot = path.join(artifactDir, `ios-${appId}.png`)
    run('xcrun', ['simctl', 'io', device.udid, 'screenshot', screenshot])

    const stateFile = path.join(documents, 'ui-state.json')
    const stateValue = fs.existsSync(stateFile)
      ? JSON.parse(await fsp.readFile(stateFile, 'utf8'))
      : null
    const state = stateValue?.runId === runId ? stateValue : null
    const errorFile = path.join(documents, 'error.json')
    const error = fs.existsSync(errorFile)
      ? JSON.parse(await fsp.readFile(errorFile, 'utf8'))
      : null
    const currentError = error?.runId === runId ? error : null

    if (!smoke?.ok) {
      const logFile = path.join(documents, 'tiny-host.log')
      if (fs.existsSync(logFile)) {
        console.error(await fsp.readFile(logFile, 'utf8'))
      }
      throw new Error(
        `Smoke failed for ${appId}: ${JSON.stringify(smoke ?? currentError ?? { error: 'no smoke result' })}`,
      )
    }

    results.push({ appId, smoke, state })
    console.log(
      `  ✅ ${appId}: ${state?.title ?? '?'} (${state?.path ?? '?'}) ` +
      `navigated=${smoke.details?.navigated ?? false} -> ${path.relative(rootDir, screenshot)}`,
    )
    run('xcrun', ['simctl', 'terminate', device.udid, bundleId], { stdio: 'ignore' })
  }

  // Leave the user on the launcher with a fresh screenshot.
  run('xcrun', ['simctl', 'launch', '--terminate-running-process', device.udid, bundleId])
  await sleep(2500)
  const launcherShot = path.join(artifactDir, 'ios-launcher.png')
  run('xcrun', ['simctl', 'io', device.udid, 'screenshot', launcherShot])

  console.log('\n✅ iOS simulator smoke passed')
  console.log(`   apps: ${results.map((item) => item.appId).join(', ')}`)
  console.log(`   screenshots: ${path.relative(rootDir, artifactDir)}`)
  console.log(`   launcher: ${path.relative(rootDir, launcherShot)}`)
}

main().catch((error) => {
  console.error(`\n❌ iOS simulator verification failed: ${error instanceof Error ? error.message : error}`)
  process.exit(1)
})
