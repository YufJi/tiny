import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  runBrowserAcceptance,
  runDevtoolAcceptance,
  runMiniProgramAcceptance,
  runTaroAcceptance,
  runWechatDemoAcceptance,
} from './glass-easel-browser.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.env.TINY_ACCEPT_PORT ?? 5199)
const baseUrl = `http://127.0.0.1:${port}`
const devtoolPort = Number(process.env.TINY_DEVTOOL_PORT ?? 5180)
const devtoolUrl = `http://127.0.0.1:${devtoolPort}`

const steps = [
  ['Build active glass-easel packages', ['pnpm', 'build:glass-easel']],
  ['Check runtime core purity', ['node', 'scripts/check-runtime-purity.mjs']],
  ['Run bridge protocol tests', ['pnpm', '--filter', '@tiny/bridge', 'test']],
  ['Run manifest tests', ['pnpm', '--filter', '@tiny/manifest', 'test']],
  ['Run CSS unit tests', ['pnpm', '--filter', '@tiny/css-units', 'test']],
  ['Run WXS runtime tests', ['pnpm', '--filter', '@tiny/wxs-runtime', 'test']],
  ['Run template compiler tests', ['pnpm', '--filter', '@tiny/template-compiler', 'test']],
  ['Run stylesheet compiler tests', ['pnpm', '--filter', '@tiny/stylesheet-compiler', 'test']],
  ['Run cli tests', ['pnpm', '--filter', '@tiny/cli', 'test']],
  ['Run web built-in component tests', ['pnpm', '--filter', '@tiny/host-web-components', 'test']],
  ['Run runtime tests', ['pnpm', '--filter', '@tiny/runtime', 'test']],
  ['Compile P0 example', ['pnpm', 'compile:glass-easel']],
]

for (const [name, command] of steps) {
  runStep(name, command)
}

if (process.env.SKIP_BROWSER === '1') {
  console.log('\n⚠ Browser acceptance skipped because SKIP_BROWSER=1')
} else {
  await withServer(() => runBrowserAcceptance({ baseUrl }))

  runStep('Compile existing example app', [
    'node',
    'scripts/compile-mini.mjs',
    'tests/apps/mini',
    'tests/host/generated',
  ])
  await withServer(() => runMiniProgramAcceptance({ baseUrl }))

  runStep('Compile Taro 3 example', [
    'node',
    'scripts/compile-mini.mjs',
    'tests/apps/todo',
    'tests/host/generated',
  ])
  await withServer(() => runTaroAcceptance({ baseUrl }))

  runStep('Compile WeChat demo subset', ['pnpm', 'compile:wechat-demo'])
  await withServer(() => runWechatDemoAcceptance({ baseUrl }))

  runStep('Restore P0 demo artifacts', ['pnpm', 'compile:glass-easel'])

  runStep('Compile devtool runtime artifacts', ['pnpm', 'compile:devtool:all'])
  await withDevtoolServer(() => runDevtoolAcceptance({ baseUrl: devtoolUrl }))
}

console.log(`
✅ P0 acceptance gate passed.

Automated: build, compiler/runtime tests, P0 demo browser flow, the existing example app
flow, the Taro 3 output flow, and the runtime debugger flow
(launcher → per-app preview → 3-app LRU keepalive → reload/close/deep links).
Manual debug hosts: pnpm dev:glass-easel, pnpm dev:devtool
`)

function runStep(name, command) {
  console.log(`\n▶ ${name}`)
  const result = spawnSync(command[0], command.slice(1), { stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`\n✘ ${name} failed`)
    process.exit(result.status ?? 1)
  }
}

async function withServer(run) {
  const server = startDevServer()
  try {
    await waitForServer(baseUrl, server.log, baseUrl, server.child)
    await run()
  } finally {
    await stopDevServer(server.child)
  }
}

async function withDevtoolServer(run) {
  const server = startDevtoolServer()
  try {
    await waitForServer(devtoolUrl, server.log, `${devtoolUrl}/`, server.child)
    await run()
  } finally {
    await stopDevServer(server.child)
  }
}

function startDevtoolServer() {
  const child = spawn(
    'pnpm',
    [
      '--filter',
      'devtool',
      'exec',
      'vite',
      '--host',
      '127.0.0.1',
      '--port',
      String(devtoolPort),
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
      console.error(`\n✘ devtool server exited with code ${code}\n${log.join('')}`)
    }
  })
  return { child, log }
}

function startDevServer() {
  const child = spawn(
    'pnpm',
    [
      '--filter',
      '@tiny/cli',
      'exec',
      'vite',
      '--config',
      '../../tests/host/vite.config.ts',
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

async function waitForServer(url, log, probeUrl = url, child, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (child && child.exitCode !== null) {
      throw new Error(`dev server exited before becoming ready (code ${child.exitCode})\n${log.join('')}`)
    }
    try {
      const response = await fetch(probeUrl, { method: 'GET' })
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
    `dev server did not become ready at ${probeUrl} within ${timeoutMs}ms\n${log.join('')}`,
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
