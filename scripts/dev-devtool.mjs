import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverTestApps, writeDevtoolAppsRegistry } from './devtool-apps.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apps = discoverTestApps()

if (apps.length === 0) {
  console.error('[dev:devtool] no test apps found under tests/apps')
  process.exit(1)
}

// The panel reads this registry before it requests a manifest. Write it before
// the dev server starts so the selector always matches the watched fixtures.
writeDevtoolAppsRegistry(apps)
console.log(
  `[dev:devtool] watching ${apps.length} test apps: ${apps.map((app) => app.id).join(', ')} ` +
    '(restart after adding or removing tests/apps fixtures)',
)

let stopping = false
const children = apps.map((app) => {
  const child = spawn(process.execPath, ['scripts/watch-mini.mjs', app.source, app.output], {
    cwd: rootDir,
    stdio: 'inherit',
  })
  child.on('exit', (code) => {
    if (!stopping && code !== 0) {
      console.error(`[dev:devtool] ${app.id} watcher exited with ${code}`)
    }
  })
  return child
})

const devtool = spawn('pnpm', ['--filter', 'devtool', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  detached: process.platform !== 'win32',
})
children.push(devtool)

function shutdown(exitCode = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode !== null) continue
    try {
      if (process.platform === 'win32') child.kill('SIGTERM')
      else process.kill(-child.pid, 'SIGTERM')
    } catch {
      child.kill('SIGTERM')
    }
  }
  setTimeout(() => process.exit(exitCode), 500)
}

devtool.on('exit', (code, signal) => {
  if (stopping) return
  const reason = signal ? `signal ${signal}` : `code ${code ?? 1}`
  console.error(`[dev:devtool] devtool server exited (${reason})`)
  shutdown(code ?? 1)
})

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
