import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import playwright from 'playwright-core'

const { chromium } = playwright
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const project = path.join(repoRoot, 'tests/apps/wechat-parity')
const reportDir = path.join(repoRoot, 'tests/host/generated/parity')
const reportPath = path.join(reportDir, 'button-style-comparison.json')
const clientName = process.env.WECHATIDE_CLIENT ?? 'Codex'
const wechatide = process.env.WECHATIDE_BIN ?? 'wechatide'
const baseUrl = process.env.TINY_BASE_URL ?? 'http://127.0.0.1:5199'
const DEFAULT_PORT = 5199

const STYLE_PROPS = [
  'display',
  'width',
  'height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'font-size',
  'font-family',
  'font-weight',
  'line-height',
  'color',
  'background-color',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'box-sizing',
  'text-align',
  'white-space',
  'overflow',
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function parseToolOutput(output, tool) {
  const start = output.indexOf('{')
  if (start < 0) throw new Error(`${tool} returned no JSON:\n${output}`)
  const parsed = JSON.parse(output.slice(start))
  if (parsed.ok !== true) throw new Error(`${tool} failed:\n${output}`)
  return parsed.result
}

function runTool(tool, args = []) {
  const result = spawnSync(
    wechatide,
    ['-c', clientName, tool, '--project', project, ...args],
    { encoding: 'utf8' },
  )
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(
      `${tool} exited with ${result.status}\n${result.stdout}\n${result.stderr}`,
    )
  }
  return parseToolOutput(
    result.stdout.includes('{') ? result.stdout : result.stderr,
    tool,
  )
}

async function readWechatStyles() {
  runTool('open_project_window', ['--window-mode', 'liteMode'])
  runTool('simulator_open_page', ['--page', 'pages/button/button'])
  const deadline = Date.now() + 20_000
  let lastError = null
  while (Date.now() < deadline) {
    try {
      const result = runTool('automation_evaluate', [
        '--fn-source',
        'function(){ return JSON.stringify(getApp().globalData.buttonStyles || null) }',
      ])
      const payload = result?.result?.result
      if (typeof payload === 'string' && payload !== 'null') {
        return JSON.parse(payload).map((item) => ({
          key: item.dataset?.key,
          ...item,
        }))
      }
    } catch (error) {
      lastError = error
    }
    await sleep(500)
  }
  throw new Error(
    `WeChat button page did not publish buttonStyles${lastError ? `: ${lastError.message}` : ''}`,
  )
}

function startServer(port) {
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
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' },
  )
  const log = []
  child.stdout.on('data', (chunk) => log.push(chunk.toString()))
  child.stderr.on('data', (chunk) => log.push(chunk.toString()))
  return { child, log }
}

async function waitForServer(url, server) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (server?.child.exitCode !== null) {
      throw new Error(`dev server exited (${server.child.exitCode})\n${server.log.join('')}`)
    }
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // still starting
    }
    await sleep(250)
  }
  throw new Error(`dev server did not become ready at ${url}\n${server?.log.join('') ?? ''}`)
}

async function readTinyStyles(url) {
  const browser = await chromium.launch({
    headless: process.env.HEADED !== '1',
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : { channel: 'chrome' }),
  })
  try {
    const page = await browser.newPage({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 1,
    })
    const frameUrl = new URL(url)
    frameUrl.searchParams.set('app', 'wechat-parity')
    frameUrl.searchParams.set('path', 'pages/button/button')
    await page.goto(frameUrl.href, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => Boolean(globalThis.__tinyRuntime), null, { timeout: 20_000 })
    const frameElement = page.locator('iframe.tiny-runtime-render-frame[data-state="active"]')
    await frameElement.waitFor({ state: 'attached' })
    const src = await frameElement.getAttribute('src')
    const renderUrl = src ? new URL(src, url).href : ''
    const frame = page.frames().find((item) => item.url() === renderUrl)
    if (!frame) throw new Error('active render frame not found')
    await frame.locator('.case').first().waitFor({ state: 'attached', timeout: 15_000 })
    await frame.waitForTimeout(200)
    return await frame.evaluate((props) => (
      [...document.querySelectorAll('.case')].map((element) => {
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        const result = {
          key: element.dataset.key,
          width: rect.width,
          height: rect.height,
        }
        for (const prop of props) result[prop] = style.getPropertyValue(prop)
        return result
      })
    ), STYLE_PROPS)
  } finally {
    await browser.close()
  }
}

function normalizeValue(value) {
  if (value == null) return value
  return String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/rgba\(([^)]+)\)/g, (match, body) => {
      const [r, g, b, a] = body.split(',').map((part) => part.trim())
      return a === '0' ? 'transparent' : `rgba(${r},${g},${b},${a})`
    })
}

function numberMatches(prop, left, right) {
  const a = Number.parseFloat(left)
  const b = Number.parseFloat(right)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false
  return Math.abs(a - b) <= (prop === 'width' ? 1.5 : 0.75)
}

function compareStyles(wechat, tiny) {
  const tinyByKey = new Map(tiny.map((item) => [item.key, item]))
  const differences = []
  const seen = new Set()
  for (const reference of wechat) {
    const { key } = reference
    seen.add(key)
    const candidate = tinyByKey.get(key)
    if (!candidate) {
      differences.push({ key, prop: null, wechat: 'present', tiny: 'missing' })
      continue
    }
    for (const prop of STYLE_PROPS) {
      const left = normalizeValue(reference[prop])
      const right = normalizeValue(candidate[prop])
      if (left === right) continue
      if ((prop === 'width' || prop === 'height') && numberMatches(prop, left, right)) continue
      if (left === 'rgba(0,0,0,0)' && right === 'transparent') continue
      differences.push({ key, prop, wechat: left, tiny: right })
    }
  }
  for (const candidate of tiny) {
    if (seen.has(candidate.key)) continue
    differences.push({ key: candidate.key, prop: null, wechat: 'missing', tiny: 'present' })
  }
  return differences
}

function writeReport(value) {
  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(reportPath, `${JSON.stringify(value, null, 2)}\n`)
}

async function main() {
  let server
  let url = baseUrl
  try {
    if (!process.env.TINY_BASE_URL) {
      const port = Number(process.env.TINY_PARITY_PORT ?? DEFAULT_PORT)
      console.log(`▶ compiling tests/apps/wechat-parity`)
      const compile = spawnSync('pnpm', ['compile:wechat-parity'], {
        cwd: repoRoot,
        stdio: 'inherit',
      })
      if (compile.status !== 0) throw new Error('compile:wechat-parity failed')
      server = startServer(port)
      url = `http://127.0.0.1:${port}/`
      await waitForServer(url, server)
    }

    const [wechat, tiny] = await Promise.all([
      readWechatStyles(),
      readTinyStyles(url),
    ])
    const differences = compareStyles(wechat, tiny)
    writeReport({ same: differences.length === 0, differences, wechat, tiny })
    if (differences.length > 0) {
      console.error(JSON.stringify({
        message: 'WeChat/Tiny button style matrix differs',
        differences,
        report: reportPath,
      }, null, 2))
      process.exitCode = 1
      return
    }
    console.log(`WeChat/Tiny button style matrix is 1:1 (${wechat.length} combinations)`)
  } finally {
    if (server) {
      try {
        if (process.platform === 'win32') server.child.kill()
        else process.kill(-server.child.pid, 'SIGTERM')
      } catch {
        // The child already exited; nothing to clean up.
      }
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exitCode = 1
})
