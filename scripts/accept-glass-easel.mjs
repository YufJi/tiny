import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  launchAcceptanceBrowser,
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
const generatedRoot = path.join(rootDir, 'tests/host/generated')
const startedAt = Date.now()
const activeServers = new Set()

const steps = [
  ['Build active glass-easel packages', ['pnpm', 'build:glass-easel']],
  ['Check runtime core purity', ['node', 'scripts/check-runtime-purity.mjs']],
  ['Check runtime layer boundaries', ['node', 'scripts/check-runtime-layers.mjs']],
  ['Run unit tests', ['pnpm', 'test']],
]

let ok = true
for (const [name, command] of steps) {
  if (!runStep(name, command)) {
    ok = false
    break
  }
}

if (ok && process.env.SKIP_BROWSER === '1') {
  console.log('\n⚠ Browser acceptance skipped because SKIP_BROWSER=1')
} else if (ok) {
  // Fixtures compile once into the shared tree; the browser stages below only
  // read it, so they can run at the same time.
  if (runStep('Compile every test app fixture', ['node', 'scripts/compile-apps.mjs', '--all'])) {
    ok = await runBrowserStages()
  } else {
    ok = false
  }
}
finish(ok)

/**
 * Run all five browser stages concurrently against one browser and two dev
 * servers. Artifacts are compiled once into `tests/host/generated/apps/<id>`,
 * so no stage rewrites another stage's files. Every stage still owns its page
 * (and therefore its storage/console), and every failure keeps its
 * `currentStep` message and screenshot.
 */
async function runBrowserStages() {
  const host = startServer([
    'pnpm',
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
  ])
  const devtool = startServer([
    'pnpm',
    '--filter',
    'devtool',
    'exec',
    'vite',
    '--host',
    '127.0.0.1',
    '--port',
    String(devtoolPort),
  ], {
    // The debugger previews the same tree the browser stages use instead of
    // recompiling seven fixtures into `apps/devtool/static/runtime`.
    TINY_DEVTOOL_RUNTIME_ROOT: generatedRoot,
  })
  const serversReady = Promise.all([
    waitForServer(baseUrl, host.log, baseUrl, host.child),
    waitForServer(devtoolUrl, devtool.log, `${devtoolUrl}/`, devtool.child),
  ])

  let browserSession
  const failures = []
  try {
    browserSession = await launchAcceptanceBrowser()
    await serversReady
    const browser = browserSession.browser
    const stages = [
      ['P0 demo', () => runBrowserAcceptance({ baseUrl, app: 'demo', browser })],
      ['existing example', () => runMiniProgramAcceptance({ baseUrl, app: 'mini', browser })],
      ['Taro 3', () => runTaroAcceptance({ baseUrl, app: 'todo', browser })],
      ['WeChat demo', () => runWechatDemoAcceptance({ baseUrl, app: 'wechat-demo', browser })],
      ['debugger', () => runDevtoolAcceptance({ baseUrl: devtoolUrl, browser })],
    ]
    const results = await Promise.allSettled(stages.map(([, run]) => run()))
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const reason = result.reason instanceof Error ? result.reason.message : String(result.reason)
        failures.push(`${stages[index][0]}: ${reason}`)
      }
    })
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error))
  } finally {
    await browserSession?.close()
    await Promise.all([stopServer(host.child), stopServer(devtool.child)])
  }

  if (failures.length > 0) {
    console.error('\n✘ Browser acceptance failed:')
    for (const failure of failures) console.error(`\n  ${failure}`)
    return false
  }
  console.log('\n✅ Every browser stage passed.')
  return true
}

function runStep(name, command) {
  const started = Date.now()
  console.log(`\n▶ ${name}`)
  const result = spawnSync(command[0], command.slice(1), { stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`\n✘ ${name} failed`)
    return false
  }
  console.log(`  ✓ ${name} (${secondsSince(started)}s)`)
  return true
}

function finish(ok) {
  const total = secondsSince(startedAt)
  if (ok) {
    console.log(`
✅ P0 acceptance gate passed in ${total}s.

Automated: build, compiler/runtime tests, P0 demo browser flow, the existing example app
flow, the Taro 3 output flow, the WeChat demo flow and the runtime debugger flow
(launcher → per-app preview → 3-app LRU keepalive → reload/close/deep links).
Manual debug hosts: pnpm dev:glass-easel, pnpm dev:devtool
`)
  } else {
    console.error(`\n✘ P0 acceptance gate failed after ${total}s`)
  }
  // Let Node flush stdout/stderr before exiting; process.exit() can drop
  // buffered output when the gate is piped into a CI log.
  process.exitCode = ok ? 0 : 1
}

function secondsSince(start) {
  return ((Date.now() - start) / 1000).toFixed(1)
}

function startServer(command, extraEnv = {}) {
  const child = spawn(command[0], command.slice(1), {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
    env: { ...process.env, ...extraEnv },
  })
  activeServers.add(child)
  const log = []
  child.stdout.on('data', (chunk) => log.push(chunk.toString()))
  child.stderr.on('data', (chunk) => log.push(chunk.toString()))
  child.on('exit', (code) => {
    activeServers.delete(child)
    if (code !== 0 && code !== null) {
      console.error(`\n✘ ${command.join(' ')} exited with code ${code}\n${log.join('')}`)
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

async function stopServer(child) {
  activeServers.delete(child)
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

// A gate that is interrupted must not leave detached Vite servers behind.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    for (const child of activeServers) {
      try {
        if (process.platform === 'win32') child.kill('SIGTERM')
        else process.kill(-child.pid, 'SIGTERM')
      } catch {
        child.kill('SIGTERM')
      }
    }
    process.exit(130)
  })
}
