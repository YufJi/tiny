import fs from 'node:fs'
import fsp from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import playwright from 'playwright-core'

const { chromium } = playwright
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const iosDir = path.resolve(scriptDir, '..')
const rootDir = path.resolve(iosDir, '..')
const generatedDir = path.join(iosDir, 'Generated')
const artifactDir = path.join(iosDir, '.artifacts')
const testServiceFile = path.join(iosDir, 'test/service.html')
const appId = process.argv[2] ?? 'demo'

if (!fs.existsSync(path.join(generatedDir, 'www/host.html'))) {
  console.error('Missing Generated/www. Run "node ios/scripts/build.mjs" first.')
  process.exit(1)
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  let pathname = decodeURIComponent(url.pathname)
  if (pathname === '/') pathname = '/www/host.html'
  const file = pathname === '/service.html'
    ? testServiceFile
    : path.join(generatedDir, pathname)
  if (file !== testServiceFile && !file.startsWith(generatedDir)) {
    response.writeHead(403)
    response.end('forbidden')
    return
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      response.end(`not found: ${pathname}`)
      return
    }
    response.writeHead(200, {
      'content-type': mimeTypes[path.extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    })
    response.end(data)
  })
})

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const address = server.address()
const baseUrl = `http://127.0.0.1:${address.port}`

await fsp.mkdir(artifactDir, { recursive: true })

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
})
const page = await browser.newPage({
  viewport: { width: 390, height: 780 },
  deviceScaleFactor: 2,
  hasTouch: true,
})

const consoleErrors = []
const pageErrors = []
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text())
})
page.on('pageerror', (error) => pageErrors.push(error.message))

await page.addInitScript(({ appId }) => {
  if (window.top !== window) return

  const pendingToHost = []
  let runtimeReady = false
  let serviceReady = false
  let hostReady = false
  let serviceFrame
  let started = false
  const storage = {}

  window.__TINY_IOS__ = {
    appId,
    smoke: true,
    system: {
      pixelRatio: 2,
      windowWidth: 390,
      windowHeight: 700,
      screenWidth: 390,
      screenHeight: 844,
      statusBarHeight: 47,
      safeArea: { top: 47, left: 0, right: 0, bottom: 34 },
      platform: 'ios',
      system: 'iOS 18.0',
      model: 'iPhone',
      brand: 'Apple',
      language: 'zh_CN',
      version: '18.0',
      SDKVersion: '3.0.0',
      theme: 'light',
    },
    menuButton: {
      width: 87,
      height: 32,
      top: 51,
      right: 382,
      bottom: 83,
      left: 295,
    },
  }

  const replyStorage = (requestId, result) => {
    window.__tinyStorageResult?.(requestId, result)
  }

  const deliverToHost = (frame) => {
    if (!runtimeReady || typeof window.__tinyHostReceive !== 'function') {
      pendingToHost.push(frame)
      return
    }
    window.__tinyHostReceive(frame)
  }

  const flushToHost = () => {
    if (!runtimeReady || typeof window.__tinyHostReceive !== 'function') return
    const frames = pendingToHost.splice(0)
    for (const frame of frames) window.__tinyHostReceive(frame)
  }

  const sendToService = (frame) => {
    serviceFrame?.contentWindow?.postMessage({ type: 'frame', frame }, '*')
  }

  const maybeStart = () => {
    if (!hostReady || !serviceReady || started) return
    if (typeof window.__tinyServiceReady !== 'function') return
    started = true
    window.__tinyServiceReady()
  }

  window.webkit = {
    messageHandlers: {
      tinyControl: {
        postMessage(message) {
          if (!message || typeof message !== 'object') return
          switch (message.type) {
            case 'hostReady':
              hostReady = true
              maybeStart()
              break
            case 'runtimeReady':
              runtimeReady = true
              flushToHost()
              break
            case 'frame':
              sendToService(message.frame)
              break
            case 'storage': {
              const requestId = message.requestId
              if (message.action === 'all') {
                replyStorage(requestId, { ok: true, value: storage })
              } else if (message.action === 'get') {
                replyStorage(requestId, {
                  ok: true,
                  value: Object.prototype.hasOwnProperty.call(storage, message.key)
                    ? storage[message.key]
                    : null,
                })
              } else if (message.action === 'set') {
                storage[message.key] = message.value
                replyStorage(requestId, { ok: true, value: null })
              } else if (message.action === 'remove') {
                delete storage[message.key]
                replyStorage(requestId, { ok: true, value: null })
              } else if (message.action === 'clear') {
                for (const key of Object.keys(storage)) delete storage[key]
                replyStorage(requestId, { ok: true, value: null })
              } else if (message.action === 'info') {
                replyStorage(requestId, {
                  ok: true,
                  value: {
                    keys: Object.keys(storage),
                    currentSize: JSON.stringify(storage).length,
                    limitSize: 10240,
                  },
                })
              }
              break
            }
            case 'state':
              window.__tinyState = message.state
              break
            case 'smoke':
              window.__tinySmoke = message
              break
            case 'diagnostic':
              window.__tinyDiagnostics = window.__tinyDiagnostics ?? []
              window.__tinyDiagnostics.push(message)
              break
            case 'error':
              window.__tinyError = message.message
              break
          }
        },
      },
      tinyService: {
        postMessage(message) {
          if (message?.type === 'frame') sendToService(message.frame)
        },
      },
    },
  }

  window.addEventListener('message', (event) => {
    const data = event.data
    if (!data || data.source !== 'tiny-service') return
    if (data.type === 'ready') {
      serviceReady = true
      maybeStart()
    } else if (data.type === 'frame') {
      deliverToHost(data.frame)
    } else if (data.type === 'error') {
      console.error(`[service] ${data.message}`)
    }
  })

  document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = '/service.html'
    document.body.appendChild(iframe)
    serviceFrame = iframe
  })
}, { appId })

let failure
try {
  await page.goto(`${baseUrl}/www/host.html?app=${encodeURIComponent(appId)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  })
  await page.waitForFunction(() => Boolean(window.__tinySmoke), null, { timeout: 60_000 })
  const result = await page.evaluate(() => ({
    smoke: window.__tinySmoke,
    state: window.__tinyState,
    diagnostics: window.__tinyDiagnostics ?? [],
    hostError: window.__tinyError ?? null,
  }))
  if (!result.smoke?.ok) {
    throw new Error(`Web smoke failed: ${JSON.stringify(result.smoke)}`)
  }
  if (!result.state?.title) {
    throw new Error('Host did not publish a UI state')
  }
  if (result.hostError) {
    throw new Error(`Host error: ${result.hostError}`)
  }

  const renderFrame = page.frames().find((frame) => frame.url().includes('/www/render.html'))
  if (!renderFrame) throw new Error('render iframe was not created')
  const text = await renderFrame.locator('#app').innerText({ timeout: 10_000 })
  if (!text || text.length < 4) throw new Error('render iframe is empty')
  const pageRoot = await renderFrame.evaluate(() => {
    const root = document.querySelector('tiny-page')
    if (!root) return null
    const style = getComputedStyle(root)
    return { display: style.display, background: style.backgroundColor }
  })
  if (pageRoot?.display !== 'block') {
    throw new Error(`page root did not get block layout: ${JSON.stringify(pageRoot)}`)
  }
  if (pageErrors.length > 0) throw new Error(`page errors: ${pageErrors.join(' | ')}`)
  if (consoleErrors.length > 0) throw new Error(`console errors: ${consoleErrors.join(' | ')}`)

  await page.screenshot({ path: path.join(artifactDir, 'web-smoke.png'), fullPage: false })
  console.log(`✅ Web host smoke passed for ${appId}`)
  console.log(`   state: ${result.state.title} (${result.state.path})`)
  console.log(`   render text: ${text.slice(0, 120).replace(/\s+/g, ' ')}`)
} catch (error) {
  failure = error
  try {
    await page.screenshot({ path: path.join(artifactDir, 'web-smoke-failure.png'), fullPage: false })
  } catch {
    // Screenshot is best effort.
  }
  console.error(`Web host smoke failed: ${error instanceof Error ? error.stack || error.message : String(error)}`)
  console.error(`console errors: ${consoleErrors.join(' | ') || '(none)'}`)
  console.error(`page errors: ${pageErrors.join(' | ') || '(none)'}`)
} finally {
  await browser.close()
  server.close()
}

if (failure) process.exit(1)
