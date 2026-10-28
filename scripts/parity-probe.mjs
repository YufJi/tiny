#!/usr/bin/env node
/**
 * 117-page WeChat demo probe (`tests/apps/wechat-demo`).
 *
 * Compiles the fixture, serves `tests/host`, opens every page with `?path=`,
 * and records boot state, visible text, page errors and runtime diagnostics.
 * The number this script prints is the one quoted in
 * `docs/wechat-webview-parity.md` §5.2.
 *
 * Usage:
 *   node scripts/parity-probe.mjs                 # compile + serve + probe all
 *   node scripts/parity-probe.mjs --limit 10      # first 10 pages
 *   node scripts/parity-probe.mjs --only packageAPI
 *   TINY_PROBE_BASE_URL=http://127.0.0.1:5174 node scripts/parity-probe.mjs
 *                                                 # reuse a running host (skip compile/serve)
 *
 * Env: TINY_PROBE_PORT (default 5198), HEADED=1, PLAYWRIGHT_CHROMIUM_PATH.
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import playwright from 'playwright-core'

const { chromium } = playwright

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const generatedDir = path.join(rootDir, 'tests/host/generated')
const DEFAULT_PORT = 5198
const PAGE_TIMEOUT = 10_000
const BOOT_TIMEOUT = 6_000
const FRAME_TIMEOUT = 4_000
const SETTLE_MS = 350

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const limit = Number(option('limit', '0')) || 0
const only = option('only', '')
const outFile = path.resolve(rootDir, option('out', 'tests/host/generated/parity-report.json'))
const externalBaseUrl = process.env.TINY_PROBE_BASE_URL ?? ''
const port = Number(process.env.TINY_PROBE_PORT ?? option('port', String(DEFAULT_PORT)))

async function launchBrowser() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  const attempts = executablePath
    ? [{ label: executablePath, options: { executablePath } }]
    : [
        { label: 'system Chrome', options: { channel: 'chrome' } },
        { label: 'system Edge', options: { channel: 'msedge' } },
      ]
  const errors = []
  for (const attempt of attempts) {
    try {
      return await chromium.launch({ headless: process.env.HEADED !== '1', ...attempt.options })
    } catch (error) {
      errors.push(`${attempt.label}: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
    }
  }
  throw new Error(
    `Unable to launch a Chromium browser:\n${errors.join('\n')}\n` +
      'Install Google Chrome or set PLAYWRIGHT_CHROMIUM_PATH to a Chromium binary.',
  )
}

function compileFixture() {
  console.log('▶ compiling tests/apps/wechat-demo')
  const result = spawnSync('pnpm', ['compile:wechat-demo'], { cwd: rootDir, stdio: 'inherit' })
  if (result.status !== 0) throw new Error('compile:wechat-demo failed')
}

async function readPagePaths() {
  const manifestPath = path.join(generatedDir, 'manifest.json')
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  const paths = (manifest.pages ?? []).map((page) => page.path).filter(Boolean)
  if (paths.length === 0) throw new Error(`no pages found in ${manifestPath}`)
  return [...new Set(paths)]
}

function startServer() {
  const child = spawn(
    'pnpm',
    [
      '--filter', '@tiny/cli', 'exec', 'vite',
      '--config', '../../tests/host/vite.config.ts',
      '--port', String(port),
      '--host', '127.0.0.1',
      '--strictPort',
      '--clearScreen', 'false',
    ],
    { cwd: rootDir, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' },
  )
  const log = []
  child.stdout.on('data', (chunk) => log.push(chunk.toString()))
  child.stderr.on('data', (chunk) => log.push(chunk.toString()))
  return { child, log }
}

async function waitForServer(baseUrl, server) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (server && server.child.exitCode !== null) {
      throw new Error(`dev server exited (${server.child.exitCode})\n${server.log.join('')}`)
    }
    try {
      const response = await fetch(`${baseUrl}/`, { method: 'GET' })
      if (response.ok) return
    } catch {
      // still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`dev server did not become ready at ${baseUrl}\n${(server?.log ?? []).join('')}`)
}

async function stopServer(server) {
  if (!server || server.child.exitCode !== null) return
  const exited = new Promise((resolve) => server.child.once('exit', resolve))
  try {
    if (process.platform === 'win32') server.child.kill('SIGTERM')
    else process.kill(-server.child.pid, 'SIGTERM')
  } catch {
    server.child.kill('SIGTERM')
  }
  const done = await Promise.race([
    exited.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 3_000)),
  ])
  if (!done) {
    try {
      if (process.platform === 'win32') server.child.kill('SIGKILL')
      else process.kill(-server.child.pid, 'SIGKILL')
    } catch {
      server.child.kill('SIGKILL')
    }
  }
}

async function activeRenderFrame(page) {
  await page.waitForSelector('iframe.tiny-runtime-render-frame[data-state="active"]', {
    state: 'attached',
    timeout: FRAME_TIMEOUT,
  })
  const src = await page
    .locator('iframe.tiny-runtime-render-frame[data-state="active"]')
    .getAttribute('src')
  if (!src) return null
  const url = new URL(src, page.url()).href
  return page.frames().find((frame) => frame.url() === url) ?? null
}

const text = (value) => (typeof value === 'string' ? value.trim() : '')

const isDetachedFrameError = (error) =>
  /detached|Target closed|Frame was detached|Execution context was destroyed/i
    .test(error instanceof Error ? error.message : String(error))

async function probePage(page, baseUrl, pagePath) {
  const startedAt = Date.now()
  const pageErrors = []
  const consoleErrors = []
  const onPageError = (error) => pageErrors.push(error.message)
  const onConsole = (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  }
  page.on('pageerror', onPageError)
  page.on('console', onConsole)

  const result = {
    path: pagePath,
    booted: false,
    hasVisibleText: false,
    failureClass: null,
    currentPage: null,
    renderFrame: false,
    appChildCount: 0,
    pageErrors,
    consoleErrors,
    diagnosticCodes: [],
    errorDiagnostics: [],
    diagnosticCounts: { error: 0, warning: 0, info: 0, state: 0 },
    timings: { gotoMs: 0, bootMs: 0, frameMs: 0, totalMs: 0 },
  }

  try {
    const gotoStarted = Date.now()
    await page.goto(`${baseUrl}/?path=${encodeURIComponent(pagePath)}`, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_TIMEOUT,
    })
    result.timings.gotoMs = Date.now() - gotoStarted

    const bootStarted = Date.now()
    let runtimeSeen = false
    try {
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: BOOT_TIMEOUT })
      runtimeSeen = true
    } catch {
      runtimeSeen = false
    }
    result.timings.bootMs = Date.now() - bootStarted
    if (!runtimeSeen) {
      result.failureClass = 'NO_RUNTIME'
      return result
    }

    await page.waitForTimeout(SETTLE_MS)

    const frameStarted = Date.now()
    let frame = null
    try {
      frame = await activeRenderFrame(page)
    } catch {
      frame = null
    }
    result.timings.frameMs = Date.now() - frameStarted
    result.renderFrame = Boolean(frame)

    if (frame) {
      // The render iframe is replaced when a page remounts (canvas handoff,
      // re-render); re-acquire it instead of failing the probe.
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          await frame.waitForFunction(
            () => (document.querySelector('#app')?.childElementCount ?? 0) > 0,
            null,
            { timeout: FRAME_TIMEOUT },
          )
          const snapshot = await frame.evaluate(() => {
            const app = document.querySelector('#app')
            return {
              childCount: app?.childElementCount ?? 0,
              text: (app?.innerText ?? '').slice(0, 4_000),
            }
          })
          result.appChildCount = snapshot.childCount
          result.hasVisibleText = text(snapshot.text).length > 0
          break
        } catch (error) {
          if (!isDetachedFrameError(error)) throw error
          frame = await activeRenderFrame(page)
          result.renderFrame = Boolean(frame)
          if (!frame) break
        }
      }
    }

    const diagnostics = await page.evaluate(() => {
      const runtime = window.__tinyRuntime
      const items = runtime?.host?.diagnostics ?? []
      return items.map((item) => ({
        severity: item?.severity ?? 'info',
        code: item?.code ?? '',
        message: item?.message ?? '',
        source: item?.source ?? '',
        pageId: item?.pageId ?? null,
        details: item?.details ?? null,
      }))
    })
    result.diagnosticCodes = [...new Set(diagnostics.map((item) => item.code).filter(Boolean))]
    result.errorDiagnostics = diagnostics
      .filter((item) => item.severity === 'error')
      .map((item) => ({ code: item.code, message: item.message, source: item.source }))
    for (const item of diagnostics) {
      if (item.severity === 'error') result.diagnosticCounts.error += 1
      else if (item.severity === 'warning') result.diagnosticCounts.warning += 1
      else if (item.severity === 'state') result.diagnosticCounts.state += 1
      else result.diagnosticCounts.info += 1
    }
    const stateItems = diagnostics.filter((item) => item.code === 'RUNTIME_STATE')
    const lastState = stateItems[stateItems.length - 1]
    result.currentPage = lastState?.details?.currentPage ?? null

    const bootstrapErrors = diagnostics.filter(
      (item) => item.severity === 'error' && /BOOTSTRAP|LOGIC_TREE/.test(item.code),
    )
    if (bootstrapErrors.length > 0) {
      result.failureClass = 'SERVICE_BOOTSTRAP_ERROR'
    } else if (!frame || result.appChildCount === 0) {
      result.failureClass = 'RENDER_BOOTSTRAP_ERROR'
    } else if (pageErrors.length > 0) {
      result.failureClass = 'PAGE_ERROR'
    }

    result.booted = result.failureClass === null
    return result
  } catch (error) {
    result.failureClass = 'PROBE_ERROR'
    result.pageErrors.push(error instanceof Error ? error.message : String(error))
    return result
  } finally {
    page.off('pageerror', onPageError)
    page.off('console', onConsole)
    result.timings.totalMs = Date.now() - startedAt
    // Storage persists per origin; clear it so one page cannot seed the next.
    await page.evaluate(() => {
      try {
        localStorage.clear()
      } catch {
        // Storage may be unavailable on error pages.
      }
    }).catch(() => {})
  }
}

function summarize(pages) {
  return {
    pageCount: pages.length,
    booted: pages.filter((page) => page.booted).length,
    visibleText: pages.filter((page) => page.hasVisibleText).length,
    withPageErrors: pages.filter((page) => page.pageErrors.length > 0).length,
    consoleErrorCount: pages.reduce((total, page) => total + page.consoleErrors.length, 0),
    durationMs: pages.reduce((total, page) => total + page.timings.totalMs, 0),
  }
}

async function main() {
  let server = null
  let browser = null
  try {
    let baseUrl = externalBaseUrl.replace(/\/$/, '')
    if (!baseUrl) {
      if (!flag('no-compile')) compileFixture()
      server = startServer()
      baseUrl = `http://127.0.0.1:${port}`
      await waitForServer(baseUrl, server)
    } else {
      console.log(`▶ using running host at ${baseUrl}`)
    }

    let pagePaths = await readPagePaths()
    if (only) pagePaths = pagePaths.filter((pagePath) => pagePath.includes(only))
    if (limit > 0) pagePaths = pagePaths.slice(0, limit)
    if (pagePaths.length === 0) throw new Error('no pages matched the filter')
    console.log(`▶ probing ${pagePaths.length} page(s) against ${baseUrl}`)

    browser = await launchBrowser()
    const page = await browser.newPage({ viewport: { width: 420, height: 900 } })
    const results = []
    const startedAt = Date.now()
    for (const [index, pagePath] of pagePaths.entries()) {
      const result = await probePage(page, baseUrl, pagePath)
      results.push(result)
      const mark = result.booted ? '✓' : '✗'
      const detail = result.failureClass ?? 'ok'
      const firstError = result.pageErrors[0] ?? result.errorDiagnostics[0]?.message ?? ''
      console.log(
        `${mark} [${String(index + 1).padStart(3)}/${pagePaths.length}] ${pagePath} — ${detail}` +
          (firstError ? ` — ${firstError.split('\n')[0]}` : ''),
      )
    }

    const summary = summarize(results)
    const report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      baseUrl,
      fixture: 'tests/apps/wechat-demo',
      pageCount: results.length,
      summary: { ...summary, wallMs: Date.now() - startedAt },
      pages: results,
    }
    await fs.mkdir(path.dirname(outFile), { recursive: true })
    await fs.writeFile(outFile, `${JSON.stringify(report, null, 2)}\n`)

    console.log('')
    console.log(`▶ ${summary.booted}/${summary.pageCount} booted`)
    console.log(`▶ ${summary.visibleText}/${summary.pageCount} with visible text`)
    console.log(`▶ ${summary.withPageErrors} page(s) with pageerror, ${summary.consoleErrorCount} console error(s)`)
    console.log(`▶ report: ${path.relative(rootDir, outFile)}`)

    const failures = results.filter((result) => !result.booted)
    if (failures.length > 0) {
      console.log('')
      console.log('failures:')
      for (const failure of failures) {
        console.log(`  - ${failure.path} [${failure.failureClass}]`)
        for (const message of failure.pageErrors.slice(0, 3)) console.log(`      ${message.split('\n')[0]}`)
        for (const item of failure.errorDiagnostics.slice(0, 3)) {
          console.log(`      ${item.code}: ${String(item.message).split('\n')[0]}`)
        }
      }
    }
  } finally {
    if (browser) await browser.close().catch(() => {})
    await stopServer(server)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
