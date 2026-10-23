import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apps = [
  ['example/glass-easel/mini', 'packages/devtool/static/runtime/apps/demo/generated', 'demo'],
  ['example/mini', 'packages/devtool/static/runtime/apps/real/generated', 'real'],
]

const children = apps.map(([source, output, label]) => {
  const child = spawn(process.execPath, ['scripts/watch-mini.mjs', source, output], {
    cwd: rootDir,
    stdio: 'inherit',
  })
  child.on('exit', (code) => {
    if (code !== 0) console.error(`[dev:devtool] ${label} watcher exited with ${code}`)
  })
  return child
})

const devtool = spawn('pnpm', ['--filter', 'devtool', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  detached: process.platform !== 'win32',
})
children.push(devtool)

let stopping = false
function shutdown() {
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
  setTimeout(() => process.exit(0), 500)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
