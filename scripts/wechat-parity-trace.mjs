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
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})

const url = new URL(baseUrl)
url.searchParams.set('app', app)
url.searchParams.set('path', 'pages/a/a')
await page.goto(url.href, { waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => Boolean(globalThis.__tinyRuntime), null, { timeout: 20_000 })

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
  return render.evaluate((label) => {
    const text = (selector) => document.querySelector(selector)?.textContent?.trim() ?? null
    const components = [...document.querySelectorAll('tiny-probe, probe')].map((element) => ({
      tag: element.tagName,
      text: element.textContent?.trim() ?? '',
      shadow: element.shadowRoot?.textContent?.trim() ?? '',
    }))
    return {
      label,
      page: text('.page-state'),
      event: text('.event-state'),
      components,
    }
  }, label)
}

const trace = []
trace.push(await snapshot('A-initial'))
let render = await renderFrame()
await render.locator('.hit-wxs').click()
await page.waitForTimeout(100)
trace.push(await snapshot('A-after-event'))
render = await renderFrame()
await render.locator('.to-b').click()
await page.waitForTimeout(250)
trace.push(await snapshot('B-initial'))
render = await renderFrame()
await render.locator('.back').click()
await page.waitForTimeout(250)
trace.push(await snapshot('A-back'))
render = await renderFrame()
await render.locator('.relaunch').click()
await page.waitForTimeout(250)
trace.push(await snapshot('A-relaunch'))

console.log(JSON.stringify({ url: url.href, trace, errors }, null, 2))
await browser.close()
