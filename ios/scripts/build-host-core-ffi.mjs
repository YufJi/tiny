import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const iosDir = path.resolve(scriptDir, '..')
const rootDir = path.resolve(iosDir, '..')
const nativeDir = path.join(rootDir, 'native')
const target = process.env.TINY_IOS_RUST_TARGET ?? 'aarch64-apple-ios-sim'
const generatedDir = path.join(iosDir, 'HostCoreGenerated')
const vendorDir = path.join(iosDir, 'Vendor')
const library = path.join(nativeDir, 'target', target, 'release', 'libtiny_host_core_ffi.a')

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed`)
  }
}

console.log(`Building UniFFI HostCore for ${target}...`)
run('cargo', ['build', '-p', 'tiny-host-core-ffi', '--target', target, '--release'], nativeDir)
if (!fs.existsSync(library)) {
  throw new Error(`Rust static library was not produced: ${library}`)
}

await fsp.mkdir(vendorDir, { recursive: true })
await fsp.copyFile(library, path.join(vendorDir, 'libtiny_host_core_ffi.a'))
await fsp.mkdir(generatedDir, { recursive: true })
run(
  'cargo',
  [
    'run', '-p', 'tiny-host-core-ffi', '--features', 'cli', '--bin', 'uniffi-bindgen',
    '--', 'generate',
    '--library', path.join(nativeDir, 'target', target, 'release', 'libtiny_host_core_ffi.a'),
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
