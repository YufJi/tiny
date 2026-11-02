import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const iosDir = path.resolve(scriptDir, '..')
const rootDir = path.resolve(iosDir, '..')
const derivedDir = path.join(iosDir, '.derived-device')
const bundleId = 'com.tiny.host'
const appPath = path.join(derivedDir, 'Build/Products/Debug-iphoneos/TinyHost.app')
const deviceJson = path.join(os.tmpdir(), `tiny-ios-devices-${process.pid}.json`)
const args = process.argv.slice(2)
const skipAssets = args.includes('--skip-assets')
const skipBuild = args.includes('--skip-build')
const developmentTeam = process.env.TINY_IOS_DEVELOPMENT_TEAM ?? 'X2Q4JBR5PU'

if (process.platform !== 'darwin') {
  console.error('iOS device deployment requires macOS.')
  process.exit(1)
}

function command(name, commandArgs, options = {}) {
  return spawnSync(name, commandArgs, {
    cwd: rootDir,
    encoding: 'utf8',
    ...options,
  })
}

function run(name, commandArgs, options = {}) {
  const result = command(name, commandArgs, options)
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`${name} ${commandArgs.join(' ')} failed\n${detail}`)
  }
  return result.stdout ?? ''
}

function findDevice() {
  run('xcrun', ['devicectl', 'list', 'devices', '--json-output', deviceJson])
  const payload = JSON.parse(fs.readFileSync(deviceJson, 'utf8'))
  const physical = (payload.result?.devices ?? []).filter((device) => {
    const properties = device.properties ?? {}
    return properties.hardware?.reality === 'physical'
      && properties.hardware?.deviceType === 'iPhone'
      && properties.connection?.state === 'connected'
  })
  if (physical.length === 0) {
    throw new Error('No connected physical iPhone. Connect the device and trust this Mac.')
  }
  const requested = process.env.TINY_IOS_DEVICE
  if (requested) {
    const match = physical.find((device) => {
      const properties = device.properties ?? {}
      return properties.hardware?.udid === requested
        || properties.hardware?.marketingName === requested
        || properties.hardware?.productType === requested
    })
    if (!match) throw new Error(`No connected physical iPhone matches TINY_IOS_DEVICE=${requested}`)
    return match
  }
  return physical[0]
}

function deviceInfo(device) {
  const properties = device.properties ?? {}
  return {
    udid: properties.hardware?.udid,
    name: properties.hardware?.marketingName ?? 'iPhone',
    model: properties.hardware?.productType ?? 'unknown',
  }
}

function main() {
  const device = findDevice()
  const info = deviceInfo(device)
  console.log(`Device: ${info.name} (${info.model}) ${info.udid}`)

  if (!skipAssets) {
    console.log('Building iOS assets (including simulator/device HostCore slices)...')
    run('node', [path.join(iosDir, 'scripts/build.mjs')], {
      stdio: 'inherit',
      env: {
        ...process.env,
        TINY_IOS_RUST_TARGETS: 'aarch64-apple-ios-sim,aarch64-apple-ios',
      },
    })
  } else {
    console.log('Reusing iOS assets; rebuilding simulator/device HostCore FFI...')
    run('node', [path.join(iosDir, 'scripts/build-host-core-ffi.mjs')], {
      stdio: 'inherit',
      env: {
        ...process.env,
        TINY_IOS_RUST_TARGETS: 'aarch64-apple-ios-sim,aarch64-apple-ios',
      },
    })
  }

  if (!skipBuild) {
    console.log('Building TinyHost.app for the device...')
    run('xcodebuild', [
      '-project', path.join(iosDir, 'TinyHost.xcodeproj'),
      '-scheme', 'TinyHost',
      '-configuration', 'Debug',
      '-sdk', 'iphoneos',
      '-destination', `platform=iOS,id=${info.udid}`,
      '-derivedDataPath', derivedDir,
      '-allowProvisioningUpdates',
      `DEVELOPMENT_TEAM=${developmentTeam}`,
      'build',
    ], { stdio: 'inherit' })
  }

  if (!fs.existsSync(appPath)) {
    throw new Error(`Built app was not found at ${appPath}`)
  }

  console.log('Installing on the device...')
  run('xcrun', ['devicectl', 'device', 'install', 'app', '--device', info.udid, appPath], {
    stdio: 'inherit',
  })
  console.log('Launching...')
  run('xcrun', [
    'devicectl', 'device', 'process', 'launch',
    '--device', info.udid,
    '--terminate-existing',
    bundleId,
  ], { stdio: 'inherit' })
  console.log(`Installed and launched ${bundleId} on ${info.name}.`)
}

try {
  main()
} finally {
  fs.rmSync(deviceJson, { force: true })
}
