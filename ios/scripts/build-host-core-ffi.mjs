import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const iosDir = path.resolve(scriptDir, '..')
const rootDir = path.resolve(iosDir, '..')
const nativeDir = path.join(rootDir, 'native')
const requestedTargets = process.env.TINY_IOS_RUST_TARGETS
  ?? process.env.TINY_IOS_RUST_TARGET
  ?? 'aarch64-apple-ios-sim'
const targets = requestedTargets.split(',').map((value) => value.trim()).filter(Boolean)
const generatedDir = path.join(iosDir, 'HostCoreGenerated')
const vendorDir = path.join(iosDir, 'Vendor')
const libraries = targets.map((target) => path.join(nativeDir, 'target', target, 'release', 'libtiny_host_core_ffi.a'))
const vendorLibraries = targets.map((target) => path.join(
  vendorDir,
  target.includes('sim') ? 'sim' : 'device',
  'libtiny_host_core_ffi.a',
))

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed`)
  }
}

console.log(`Building UniFFI HostCore for ${targets.join(', ')}...`)
for (const [index, target] of targets.entries()) {
  run('cargo', ['build', '-p', 'tiny-host-core-ffi', '--target', target, '--release'], nativeDir)
  if (!fs.existsSync(libraries[index])) {
    throw new Error(`Rust static library was not produced: ${libraries[index]}`)
  }
}

for (const [index, vendorLibrary] of vendorLibraries.entries()) {
  await fsp.mkdir(path.dirname(vendorLibrary), { recursive: true })
  await fsp.copyFile(libraries[index], vendorLibrary)
  console.log(`  ${targets[index]} -> ${path.relative(rootDir, vendorLibrary)}`)
}
await fsp.mkdir(generatedDir, { recursive: true })
run(
  'cargo',
  [
    'run', '-p', 'tiny-host-core-ffi', '--features', 'cli', '--bin', 'uniffi-bindgen',
    '--', 'generate',
    '--library', libraries[0],
    '--language', 'swift',
    '--out-dir', generatedDir,
  ],
  nativeDir,
)
await fsp.copyFile(
  path.join(generatedDir, 'tiny_host_core_ffiFFI.modulemap'),
  path.join(generatedDir, 'module.modulemap'),
)
console.log('UniFFI Swift bindings generated in ios/HostCoreGenerated')
