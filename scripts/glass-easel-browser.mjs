import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import playwright from 'playwright-core'

const { chromium } = playwright

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failureShot = path.join(rootDir, 'example/glass-easel/generated/acceptance-failure.png')
const STEP_TIMEOUT = 15_000

async function launchBrowser() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  const attempts = executablePath
    ? [{ label: `executablePath ${executablePath}`, options: { executablePath } }]
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
    `Unable to launch a Chromium browser for acceptance:\n${errors.join('\n')}\n` +
      'Install Google Chrome or set PLAYWRIGHT_CHROMIUM_PATH to a Chromium binary.',
  )
}

export async function runBrowserAcceptance({ baseUrl }) {
  const browser = await launchBrowser()
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  const pageErrors = []
  const consoleErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  let currentStep = 'start'
  try {
    await step('boot the dual-thread host', async () => {
      currentStep = 'boot the dual-thread host'
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      assert.equal(pageErrors.length, 0, `page errors during boot: ${pageErrors.join(' | ')}`)
    })

    const render = page.frames().find((frame) => frame.url().includes('render.html'))
    assert.ok(render, 'render iframe was not created')

    const renderFrameBox = await page.locator('iframe.tiny-runtime-render-frame').boundingBox()
    assert.ok(
      renderFrameBox && renderFrameBox.y < 5 && renderFrameBox.height > 300,
      'render iframe should fill the host container',
    )

    const text = () => render.locator('#app').innerText()
    const waitForText = async (needle) => {
      currentStep = `wait for text "${needle}"`
      await render.waitForFunction(
        (expected) => (document.querySelector('#app')?.innerText ?? '').includes(expected),
        needle,
        { timeout: STEP_TIMEOUT },
      )
    }

    await step('render the todos page structure', async () => {
      currentStep = 'render the todos page structure'
      const html = await render.locator('#app').evaluate((element) => element.innerHTML)
      assert.ok(html.length > 0, 'rendered app is empty')
      for (const selector of [
        '.tiny-scroll-view',
        '.tiny-button',
        '.tiny-checkbox',
        '.tiny-slider',
        '.tiny-switch',
        '.tiny-progress',
        '.tiny-icon',
        '.tiny-swiper',
        '.tiny-swiper-item',
        '.tiny-image',
        '.tiny-canvas',
      ]) {
        assert.ok((await render.locator(selector).count()) > 0, `missing rendered element: ${selector}`)
      }
      assert.equal(await render.locator('.tiny-swiper-item').count(), 2, 'swiper should render two items')
      assert.equal(await render.locator('input.tiny-slider').inputValue(), '20')
      assert.match(await render.locator('.tiny-progress-info').innerText(), /^20%$/)
      assert.equal((await render.locator('.tiny-icon').innerText()).trim(), '✓')
      assert.ok(
        (await render.locator('.tiny-image[src="/logo.svg"]').count()) > 0,
        'image src was not forwarded',
      )
      assert.ok((await text()).includes('Learn glass-easel'), 'todos list did not render')
      assert.ok((await text()).includes('Run P0 acceptance'), 'todos list did not render')
      assert.equal(await render.locator('input[type="checkbox"]').first().isChecked(), true)
    })

    await step('apply scoped styles and built-in base layout', async () => {
      currentStep = 'apply scoped styles and built-in base layout'
      const pageBackground = await render.locator('page').evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      )
      assert.equal(pageBackground, 'rgb(16, 24, 40)', 'app.wxss page rule did not apply')

      const card = await render.locator('.tiny-pages-todos-todos--card').first().evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          display: style.display,
          paddingTop: Number.parseFloat(style.paddingTop),
          borderTopWidth: style.borderTopWidth,
        }
      })
      assert.equal(card.display, 'block', 'view should be block-level')
      assert.ok(card.paddingTop > 0, 'scoped card padding did not apply')
      assert.equal(card.borderTopWidth, '1px', 'scoped card border did not apply')

      const scrollPadding = await render.locator('.tiny-scroll-view').evaluate(
        (element) => Number.parseFloat(getComputedStyle(element).paddingTop),
      )
      assert.ok(scrollPadding > 0, 'scoped page padding did not apply')

      const hasInlineText = await render.evaluate(() =>
        [...document.querySelectorAll('.tiny-text')].some(
          (element) => element.className.trim() === 'tiny-text' && getComputedStyle(element).display === 'inline',
        ),
      )
      assert.ok(hasInlineText, 'plain text should be inline')
    })

    await step('render app, page, and system snapshots', async () => {
      currentStep = 'render app, page, and system snapshots'
      assert.match(await text(), /system: [\d.]+ \/ \d+x\d+/, 'system info was not rendered')
      const dimensions = /system: [\d.]+ \/ (\d+)x(\d+)/.exec(await text())
      assert.ok(dimensions && Number(dimensions[1]) > 0 && Number(dimensions[2]) > 0, 'system info has no window size')
    })

    await step('dispatch a custom component event through a slot', async () => {
      currentStep = 'dispatch a custom component event through a slot'
      assert.equal(await render.locator('add-button').count(), 1, 'add-button component did not render')
      assert.ok(((await render.locator('add-button').innerText()) ?? '').includes('Custom slot'), 'slot content missing')
      await render.locator('add-button .tiny-button').click()
      await waitForText('custom: Add')
    })

    await step('update page data from a checkbox change', async () => {
      currentStep = 'update page data from a checkbox change'
      await render.getByText('Run P0 acceptance', { exact: true }).first().click()
      await waitForText('checked: Run P0 acceptance')
    })

    await step('update progress and data from a slider change', async () => {
      currentStep = 'update progress and data from a slider change'
      await render.locator('input.tiny-slider').evaluate((element) => {
        element.value = '65'
        element.dispatchEvent(new Event('change', { bubbles: true }))
      })
      await waitForText('slider: 65')
      await render.waitForFunction(
        () => document.querySelector('.tiny-progress-info')?.textContent?.trim() === '65%',
        null,
        { timeout: STEP_TIMEOUT },
      )
    })

    await step('update page data from a switch change', async () => {
      currentStep = 'update page data from a switch change'
      await render.locator('switch input[type="checkbox"]').click()
      await waitForText('switch: true')
    })

    await step('navigate to add-todo and expose page query', async () => {
      currentStep = 'navigate to add-todo and expose page query'
      await render.getByText('Open add todo', { exact: true }).first().click()
      await waitForText('Add todo')
      assert.ok((await text()).includes('from: todos'), `page query was not delivered: ${await text()}`)
      assert.ok(!(await text()).includes('Tiny Glass-easel P0'), 'previous page was not unmounted')
      assert.equal(await render.locator('input[placeholder="Todo name"]').isVisible(), true, 'input is not visible')
      const inputBox = await render.locator('input[placeholder="Todo name"]').evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return { width: rect.width, display: getComputedStyle(element).display }
      })
      assert.equal(inputBox.display, 'block', 'input should be block-level')
      assert.ok(inputBox.width > 100, 'input did not fill its container')
    })

    await step('propagate input changes to page data', async () => {
      currentStep = 'propagate input changes to page data'
      await render.locator('input[placeholder="Todo name"]').fill('Buy milk')
      await waitForText('value: Buy milk')
    })

    await step('save, navigate back, and preserve storage state', async () => {
      currentStep = 'save, navigate back, and preserve storage state'
      await render.getByText('Save and back', { exact: true }).first().click()
      await waitForText('marker: Buy milk')
      assert.ok(!(await text()).includes('Save and back'), 'add-todo page was not unmounted')
      assert.equal(await render.locator('page[wx-host]').count(), 1, 'previous pages were not released')
      const storage = await page.evaluate(() => window.__tinyRuntime.host.apiRegistry.storage)
      assert.equal(storage.todoMarker, 'Buy milk', 'host storage did not receive the write')
    })

    await step('resolve the toast API without fatal errors', async () => {
      currentStep = 'resolve the toast API without fatal errors'
      await render.getByText('Show toast', { exact: true }).first().click()
      await page.waitForTimeout(300)
      const diagnostics = await page.evaluate(() => window.__tinyRuntime.host.diagnostics)
      assert.equal(
        diagnostics.filter((item) => item.severity === 'error').length,
        0,
        'toast produced a fatal diagnostic',
      )
    })

    await step('report observable runtime state and canvas diagnostics', async () => {
      currentStep = 'report observable runtime state and canvas diagnostics'
      const diagnostics = await page.evaluate(() => window.__tinyRuntime.host.diagnostics)
      assert.ok(
        diagnostics.some((item) => item.code === 'UNSUPPORTED_CANVAS' && item.severity === 'warning'),
        'canvas did not emit an unsupported diagnostic',
      )
      const stateEvents = diagnostics.filter((item) => item.code === 'RUNTIME_STATE')
      const paths = stateEvents.map((item) => item.details?.currentPage)
      assert.ok(paths.includes('pages/todos/todos'), 'initial page state was not observed')
      assert.ok(paths.includes('pages/add-todo/add-todo'), 'navigation state was not observed')
      assert.equal(paths.at(-1), 'pages/todos/todos', 'navigation back state was not observed')
      assert.equal(
        diagnostics.filter((item) => item.severity === 'error').length,
        0,
        'runtime reported a fatal diagnostic',
      )
    })

    await step('keep the console free of errors', async () => {
      currentStep = 'keep the console free of errors'
      assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(' | ')}`)
      assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(' | ')}`)
    })

    console.log('\n✅ P0 browser acceptance passed.')
  } catch (error) {
    try {
      await fs.mkdir(path.dirname(failureShot), { recursive: true })
      await page.screenshot({ path: failureShot, fullPage: true })
    } catch {
      // Screenshots are best-effort diagnostics.
    }
    throw new Error(
      `Browser acceptance failed during "${currentStep}": ${error instanceof Error ? error.message : String(error)}` +
        `\nScreenshot: ${failureShot}`,
    )
  } finally {
    await browser.close()
  }
}

async function step(name, run) {
  console.log(`\n▶ ${name}`)
  await run()
  console.log(`  ✓ ${name}`)
}
