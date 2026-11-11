import playwright from 'playwright-core'

const { chromium } = playwright
const baseUrl = process.env.TINY_BASE_URL ?? 'http://localhost:5199'
const app = process.env.TINY_PARITY_APP ?? 'wechat-parity'

const browser = await chromium.launch({
  headless: process.env.HEADED !== '1',
  ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : { channel: 'chrome' }),
})
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.setDefaultTimeout(5_000)
const errors = []
const consoleMessages = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  consoleMessages.push(`${message.type()}:${message.text()}`)
  if (message.type() === 'error') errors.push(message.text())
})

const url = new URL(baseUrl)
url.searchParams.set('app', app)
url.searchParams.set('path', 'pages/a/a')
await page.goto(url.href, { waitUntil: 'domcontentloaded' })
try {
  await page.waitForFunction(() => Boolean(globalThis.__tinyRuntime), null, { timeout: 20_000 })
} catch (error) {
  const failure = error instanceof Error ? error.message : String(error)
  const frames = await Promise.all(page.frames().map(async (frame) => ({
    url: frame.url(),
    body: await frame.evaluate(() => document.body?.innerText.slice(0, 2000) ?? '')
      .catch(() => ''),
  })))
  console.log(JSON.stringify({
    url: url.href,
    trace: [],
    errors,
    console: consoleMessages,
    frames,
    failure,
  }, null, 2))
  await browser.close()
  process.exit(1)
}

async function renderFrame() {
  const frameElement = page.locator('iframe.tiny-runtime-render-frame[data-state="active"]')
  await frameElement.waitFor({ state: 'attached' })
  const src = await frameElement.getAttribute('src')
  const frameUrl = src ? new URL(src, baseUrl).href : ''
  const frame = page.frames().find((item) => item.url() === frameUrl)
  if (!frame) throw new Error('active render frame not found')
  return frame
}

async function snapshot(label) {
  const render = await renderFrame()
  const result = await render.evaluate((label) => {
    const text = (className) => {
      const element = [...document.querySelectorAll('*')].find((candidate) => (
        [...candidate.classList].some((token) => (
          token === className || token.endsWith(`--${className}`)
        ))
      ))
      return element?.textContent?.trim() ?? null
    }
    const wxs = (moduleId, method) => {
      try {
        const runtime = globalThis.__tinyWxsRuntime
        const value = runtime?.require(moduleId)?.[method]
        return typeof value === 'function' ? value() : value
      } catch (error) {
        return `error:${error instanceof Error ? error.message : String(error)}`
      }
    }
    const components = [...document.querySelectorAll('tiny-probe, probe')].map((element) => ({
      tag: element.tagName,
      text: element.textContent?.trim() ?? '',
      shadow: element.shadowRoot?.textContent?.trim() ?? '',
    }))
    return {
      label,
      page: text('page-state'),
      event: text('event-state'),
      lifecycle: text('flow-state') ?? text('move-state'),
      components,
      wxs: {
        event: wxs('wxs/event-state.wxs', 'peek'),
        component: wxs('wxs/component-state.wxs', 'peek'),
      },
    }
  }, label)
  const diagnostics = await page.evaluate(() => (
    globalThis.__tinyRuntime?.host?.diagnostics ?? []
  ).filter((item) => item.severity === 'error').map((item) => ({
    code: item.code,
    message: item.message,
    details: item.details,
  })))
  return { ...result, diagnostics }
}

const trace = []
let failure = null
try {
  trace.push(await snapshot('A-initial'))
  let render = await renderFrame()
  await render.getByText('Bump Key', { exact: true }).click()
  await page.waitForTimeout(150)
  trace.push(await snapshot('A-after-props'))
  render = await renderFrame()
  await render.getByText('Hit WXS', { exact: true }).click()
  await page.waitForTimeout(100)
  trace.push(await snapshot('A-after-event'))
  render = await renderFrame()
  await render.getByText('To B', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('B-initial'))
  render = await renderFrame()
  await render.getByText('Back to A', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('A-back'))
  render = await renderFrame()
  await render.getByText('ReLaunch A', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('A-relaunch'))
  render = await renderFrame()
  await render.getByText('To Flow', { exact: true }).click()
  await page.waitForTimeout(300)
  trace.push(await snapshot('Flow-initial'))
  render = await renderFrame()
  await render.getByText('Toggle Slot Child', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('Flow-slot-hidden'))
  render = await renderFrame()
  await render.getByText('Toggle Slot Child', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('Flow-slot-shown'))
  render = await renderFrame()
  await render.getByText('Toggle Inner Child', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('Flow-inner-hidden'))
  render = await renderFrame()
  await render.getByText('Toggle Inner Child', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('Flow-inner-shown'))
  render = await renderFrame()
  await render.getByText('Toggle Host', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('Flow-host-hidden'))
  render = await renderFrame()
  await render.getByText('Toggle Host', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('Flow-host-shown'))
  render = await renderFrame()
  await render.getByText('To Move', { exact: true }).click()
  await page.waitForTimeout(300)
  trace.push(await snapshot('Move-initial'))
  render = await renderFrame()
  await render.getByText('Reverse', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('Move-reversed'))
  render = await renderFrame()
  await render.getByText('Rotate', { exact: true }).click()
  await page.waitForTimeout(250)
  trace.push(await snapshot('Move-rotated'))
} catch (error) {
  failure = error instanceof Error ? error.message : String(error)
  errors.push(failure)
  try {
    trace.push(await snapshot('failure'))
  } catch {
    // Keep the original failure; the snapshot is best-effort diagnostics.
  }
} finally {
  const diagnostics = await page.evaluate(
    () => globalThis.__tinyRuntime?.host?.diagnostics ?? [],
  )
  console.log(JSON.stringify({ url: url.href, trace, errors, diagnostics, failure }, null, 2))
  await browser.close()
}
if (failure) process.exitCode = 1
