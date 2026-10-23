import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runBrowserAcceptance } from './glass-easel-browser.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.env.TINY_ACCEPT_PORT ?? 5199)
const baseUrl = `http://127.0.0.1:${port}`

const steps = [
  ['Build active glass-easel packages', ['pnpm', 'build:glass-easel']],
  ['Run bridge protocol tests', ['pnpm', '--filter', '@tiny/bridge', 'test']],
  ['Run template compiler tests', ['pnpm', '--filter', '@tiny/template-compiler', 'test']],
  ['Run stylesheet compiler tests', ['pnpm', '--filter', '@tiny/stylesheet-compiler', 'test']],
  ['Run compiler-next tests', ['pnpm', '--filter', '@tiny/compiler-next', 'test']],
  ['Run built-in component tests', ['pnpm', '--filter', '@tiny/builtin-components', 'test']],
  ['Run runtime tests', ['pnpm', '--filter', '@tiny/runtime', 'test']],
  ['Compile P0 example', ['pnpm', 'compile:glass-easel']],
]

for (const [name, command] of steps) {
  console.log(`\n▶ ${name}`)
  const result = spawnSync(command[0], command.slice(1), { stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`\n✘ ${name} failed`)
    process.exit(result.status ?? 1)
  }
}

if (process.env.SKIP_BROWSER === '1') {
  console.log('\n⚠ Browser acceptance skipped because SKIP_BROWSER=1')
} else {
  const server = startDevServer()
  try {
    await waitForServer(baseUrl, server.log)
    await runBrowserAcceptance({ baseUrl })
  } finally {
    await stopDevServer(server.child)
  }
}

console.log(`
✅ P0 acceptance gate passed.

Automated: build, protocol/compiler/runtime tests, example compile, dual-thread browser flow.
Manual debug host: pnpm dev:glass-easel
`)

function startDevServer() {
  const child = spawn(
    'pnpm',
    [
      '--filter',
      '@tiny/compiler-next',
      'exec',
      'vite',
      '--config',
      '../../example/glass-easel/vite.config.ts',
      '--port',
      String(port),
      '--host',
      '127.0.0.1',
      '--strictPort',
      '--clearScreen',
      'false',
    ],
    {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
    },
  )
  const log = []
  child.stdout.on('data', (chunk) => log.push(chunk.toString()))
  child.stderr.on('data', (chunk) => log.push(chunk.toString()))
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n✘ dev server exited with code ${code}\n${log.join('')}`)
    }
  })
  return { child, log }
}

async function waitForServer(url, log, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: 'GET' })
      if (response.ok) {
        console.log(`\n▶ Browser acceptance against ${url}`)
        return
      }
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(
    `dev server did not become ready at ${url} within ${timeoutMs}ms\n${log.join('')}`,
  )
}

async function stopDevServer(child) {
  if (child.exitCode !== null) return
  const exited = new Promise((resolve) => child.once('exit', resolve))
  try {
    if (process.platform === 'win32') child.kill('SIGTERM')
    else process.kill(-child.pid, 'SIGTERM')
  } catch {
    child.kill('SIGTERM')
  }
  const timeout = new Promise((resolve) => setTimeout(resolve, 3_000))
  const finished = await Promise.race([exited.then(() => true), timeout.then(() => false)])
  if (!finished) {
    try {
      if (process.platform === 'win32') child.kill('SIGKILL')
      else process.kill(-child.pid, 'SIGKILL')
    } catch {
      child.kill('SIGKILL')
    }
  }
}
