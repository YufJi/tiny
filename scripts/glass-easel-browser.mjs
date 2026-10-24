import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import playwright from 'playwright-core'

const { chromium } = playwright

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failureShot = path.join(rootDir, 'tests/host/generated/acceptance-failure.png')
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
      const imageLoaded = await render.locator('img.tiny-image').first().evaluate(
        (element) => element.naturalWidth > 0,
      )
      assert.ok(imageLoaded, 'inlined image did not load')
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
          (element) => getComputedStyle(element).display === 'inline',
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
      await render.waitForFunction(() => {
        const body = document.querySelector('#app')?.innerText ?? ''
        const index = body.indexOf('checked:')
        return index >= 0 && body.slice(index).includes('Run P0 acceptance')
      }, null, { timeout: STEP_TIMEOUT })
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

export async function runMiniProgramAcceptance({ baseUrl }) {
  const browser = await launchBrowser()
  const page = await browser.newPage({ viewport: { width: 1000, height: 760 } })
  const pageErrors = []
  const consoleErrors = []
  const realFailureShot = path.join(rootDir, 'tests/host/generated/acceptance-real-failure.png')
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  let currentStep = 'start'
  try {
    await step('boot the existing example app', async () => {
      currentStep = 'boot the existing example app'
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      assert.equal(pageErrors.length, 0, `page errors during boot: ${pageErrors.join(' | ')}`)
    })

    const render = page.frames().find((frame) => frame.url().includes('render.html'))
    assert.ok(render, 'render iframe was not created')
    const text = () => render.locator('#app').innerText()
    const waitForText = async (needle) => {
      currentStep = `wait for text "${needle}"`
      await render.waitForFunction(
        (expected) => (document.querySelector('#app')?.innerText ?? '').includes(expected),
        needle,
        { timeout: STEP_TIMEOUT },
      )
    }
    const diagnostics = () => page.evaluate(() => window.__tinyRuntime.host.diagnostics)

    await step('render the existing todos page from app state', async () => {
      currentStep = 'render the existing todos page from app state'
      await waitForText('Learning Javascript')
      const body = await text()
      for (const expected of ['Learning Javascript', 'Learning ES2016', 'Learning 小程序', 'tiny Todo List']) {
        assert.ok(body.includes(expected), `missing app-backed content: ${expected}`)
      }
      assert.equal(await render.locator('add-button').count(), 2, 'both add-button instances should render')
      assert.ok(body.includes('i am slot'), 'component slot content did not render')
      for (const selector of ['.tiny-checkbox', '.tiny-slider', '.tiny-progress', '.tiny-switch', '.tiny-swiper', '.tiny-canvas']) {
        assert.ok((await render.locator(selector).count()) > 0, `missing rendered element: ${selector}`)
      }
      const background = await render.locator('page').evaluate((element) => getComputedStyle(element).backgroundColor)
      assert.equal(background, 'rgb(50, 50, 57)', 'app.wxss page rule did not apply to the real app')

      const avatar = render.locator('img').first()
      assert.ok(
        ((await avatar.getAttribute('class')) ?? '').includes('tiny-pages-todos-todos--avatar'),
        'external class was not scoped to the page',
      )
      assert.ok(
        (await avatar.evaluate((element) => element.getBoundingClientRect().width)) > 50,
        'external class styles did not apply to the image',
      )
    })

    await step('drive the existing todos page interactions', async () => {
      currentStep = 'drive the existing todos page interactions'
      await render.waitForFunction(() => document.querySelector('img')?.naturalWidth > 0, null, { timeout: STEP_TIMEOUT })
      assert.equal(await render.locator('label[class*="--todo-item"][class*="--checked"]').count(), 2, 'initial checked todos are wrong')

      await render.getByText('Learning 小程序', { exact: true }).click()
      await render.waitForFunction(
        () => document.querySelectorAll('label[class*="--todo-item"][class*="--checked"]').length === 3,
        null,
        { timeout: STEP_TIMEOUT },
      )

      const componentButton = render.locator('add-button .tiny-button').first()
      assert.ok(
        ((await componentButton.getAttribute('class')) ?? '').includes('tiny-components-add-button-add-button--add-button'),
        'component class was not scoped to the component',
      )
      const componentButtonWidth = await componentButton.evaluate((element) => element.getBoundingClientRect().width)
      assert.ok(componentButtonWidth > 100, 'component stylesheet did not apply')
      const componentButtonStyle = await componentButton.evaluate((element) => {
        const style = getComputedStyle(element)
        return { radius: Number.parseFloat(style.borderRadius), spacing: style.letterSpacing }
      })
      assert.ok(componentButtonStyle.radius > 15, 'component tag selector did not apply')
      assert.equal(componentButtonStyle.spacing, 'normal', 'page tag selector leaked into the component')

      const pageButton = render.locator('button').filter({ hasText: 'nav' }).first()
      const pageButtonSpacing = await pageButton.evaluate((element) => getComputedStyle(element).letterSpacing)
      assert.equal(pageButtonSpacing, '2px', 'page tag selector did not apply')

      await render.locator('add-button').first().locator('button').first().click()
      await render.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('def'),
        null,
        { timeout: STEP_TIMEOUT },
      )

      await render.locator('switch').first().locator('input[type="checkbox"]').click()
      assert.equal(await render.locator('switch').first().locator('input[type="checkbox"]').isChecked(), true)

      await render.locator('input.tiny-slider').nth(1).evaluate((element) => {
        element.value = '1500'
        element.dispatchEvent(new Event('change', { bubbles: true }))
      })
      await render.locator('input.tiny-slider').nth(2).evaluate((element) => {
        element.value = '7000'
        element.dispatchEvent(new Event('change', { bubbles: true }))
      })
      await render.waitForFunction(
        () => [...document.querySelectorAll('[class*="--info"]')].map((element) => element.textContent?.trim()).includes('1500')
          && [...document.querySelectorAll('[class*="--info"]')].map((element) => element.textContent?.trim()).includes('7000'),
        null,
        { timeout: STEP_TIMEOUT },
      )

      assert.equal(await render.locator('radio input[type="radio"]').isChecked(), true, 'radio is not checked')
      assert.ok((await render.locator('.tiny-icon-success_no_circle').count()) > 0, 'icon type was not applied')

      const swiper = render.locator('.tiny-swiper')
      assert.equal(await swiper.locator('.tiny-swiper-dot').count(), 3, 'swiper dots did not render')
      await swiper.locator('.tiny-swiper-dot').nth(1).click()
      await render.waitForFunction(
        () => document.querySelector('.tiny-swiper-track')?.getAttribute('style')?.includes('translateX(-100%)'),
        null,
        { timeout: STEP_TIMEOUT },
      )

      const animated = await render.evaluate(() => [...document.querySelectorAll('view')].some((element) => {
        const style = element.getAttribute('style') ?? ''
        return style.includes('transition: all') && getComputedStyle(element).transform !== 'none'
      }))
      assert.ok(animated, 'animation data did not produce a transform')
    })

    await step('render WXML import/include and named templates', async () => {
      currentStep = 'render WXML import/include and named templates'
      await render.locator('add-button').nth(1).locator('button').first().click()
      await waitForText('capture-catch:tap')
      const body = await text()
      assert.ok(body.includes('include'), 'include content did not render')
      assert.ok(body.includes('template a'), 'named template content did not render')
      assert.equal(await render.locator('input[placeholder="What needs to be done?"]').isVisible(), true)
    })

    await step('update component input and navigate back', async () => {
      currentStep = 'update component input and navigate back'
      const input = render.locator('input[placeholder="What needs to be done?"]')
      await input.fill('Core chain todo')
      assert.equal(await input.inputValue(), 'Core chain todo')
      await render.getByText('12121', { exact: true }).first().click()
      await waitForText('Learning Javascript')
      const stateEvents = (await diagnostics()).filter((item) => item.code === 'RUNTIME_STATE')
      assert.equal(stateEvents.at(-1)?.details?.currentPage, 'pages/todos/todos', 'did not return to todos')
    })

    await step('render the ECharts page through mirrored canvas frames', async () => {
      currentStep = 'render the ECharts page through mirrored canvas frames'
      await render.getByText('nav', { exact: true }).first().click()
      await page.waitForFunction(
        () => window.__tinyRuntime.host.diagnostics.some(
          (item) => item.code === 'RUNTIME_STATE' && item.details?.currentPage === 'pages/bar/index',
        ),
        null,
        { timeout: STEP_TIMEOUT },
      )
      const canvasClass = (await render.locator('canvas').first().getAttribute('class')) ?? ''
      assert.ok(
        canvasClass.includes('tiny-components-ec-canvas-ec-canvas--ec-canvas'),
        'component canvas class was not scoped',
      )
      await render.waitForFunction(() => {
        const canvas = document.querySelector('canvas')
        if (!canvas || canvas.width < 100 || canvas.height < 100) return false
        const context = canvas.getContext('2d')
        if (!context) return false
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data
        for (let index = 3; index < data.length; index += 4) {
          if (data[index] !== 0) return true
        }
        return false
      }, null, { timeout: STEP_TIMEOUT })
      const errorsAfterBar = (await diagnostics()).filter((item) => item.severity === 'error')
      assert.equal(errorsAfterBar.length, 0, `bar page raised errors: ${errorsAfterBar.map((item) => item.message).join(' | ')}`)
    })

    await step('report unsupported capabilities as warnings, not failures', async () => {
      currentStep = 'report unsupported capabilities as warnings, not failures'
      const items = await diagnostics()
      const warningCodes = items.filter((item) => item.severity === 'warning').map((item) => item.code)
      const infoCodes = items.filter((item) => item.severity === 'info').map((item) => item.code)
      assert.ok(warningCodes.includes('UNSUPPORTED_CANVAS'), 'canvas placeholder was not reported')
      assert.ok(infoCodes.includes('CANVAS_OFFSCREEN'), 'canvas mirroring was not reported')
      assert.equal(items.filter((item) => item.severity === 'error').length, 0, 'real app raised fatal diagnostics')
    })

    await step('boot the subpackage page directly', async () => {
      currentStep = 'boot the subpackage page directly'
      await page.goto(`${baseUrl}/?path=packageA/pages/c/c`, {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const subpackageRender = page.frames().find((frame) => frame.url().includes('render.html'))
      assert.ok(subpackageRender, 'render iframe was not created for the subpackage page')
      await subpackageRender.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('ccccc'),
        null,
        { timeout: STEP_TIMEOUT },
      )
      const state = await page.evaluate(() => window.__tinyRuntime.host.diagnostics.filter(
        (item) => item.code === 'RUNTIME_STATE',
      ).at(-1))
      assert.equal(state?.details?.currentPage, 'packageA/pages/c/c')
    })

    await step('keep the example console free of errors', async () => {
      currentStep = 'keep the example console free of errors'
      assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(' | ')}`)
      assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(' | ')}`)
    })

    console.log('\n✅ Existing example app acceptance passed.')
  } catch (error) {
    try {
      await fs.mkdir(path.dirname(realFailureShot), { recursive: true })
      await page.screenshot({ path: realFailureShot, fullPage: true })
    } catch {
      // Screenshots are best-effort diagnostics.
    }
    throw new Error(
      `Existing example acceptance failed during "${currentStep}": ${error instanceof Error ? error.message : String(error)}` +
        `\nScreenshot: ${realFailureShot}`,
    )
  } finally {
    await browser.close()
  }
}

export async function runTaroAcceptance({ baseUrl }) {
  const browser = await launchBrowser()
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } })
  const pageErrors = []
  const consoleErrors = []
  const taroFailureShot = path.join(rootDir, 'tests/host/generated/acceptance-taro-failure.png')
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  let currentStep = 'start'
  try {
    await step('boot the Taro 3 app', async () => {
      currentStep = 'boot the Taro 3 app'
      await page.goto(`${baseUrl}?path=pages/index/index`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      assert.equal(pageErrors.length, 0, `page errors during boot: ${pageErrors.join(' | ')}`)
    })

    const render = page.frames().find((frame) => frame.url().includes('render.html'))
    assert.ok(render, 'render iframe was not created')
    const text = () => render.locator('#app').innerText()
    const waitForText = async (needle) => {
      currentStep = `wait for text "${needle}"`
      await render.waitForFunction(
        (expected) => (document.querySelector('#app')?.innerText ?? '').includes(expected),
        needle,
        { timeout: STEP_TIMEOUT },
      )
    }

    await step('render the Taro todos page', async () => {
      currentStep = 'render the Taro todos page'
      const body = await waitForText('Use Redux').then(text)
      assert.ok(body.includes('1 item left'), 'Taro state did not render')
      assert.ok(body.includes('What needs to be done?') || (await render.locator('input').count()) > 0, 'Taro input did not render')
    })

    await step('add a todo through the Taro input', async () => {
      currentStep = 'add a todo through the Taro input'
      const input = render.locator('input[placeholder="What needs to be done?"]')
      await input.fill('Taro item')
      await input.press('Enter')
      await waitForText('Taro item')
      await waitForText('2 items left')
    })

    await step('toggle and filter Taro todos', async () => {
      currentStep = 'toggle and filter Taro todos'
      await render.locator('input[type="checkbox"]').first().click()
      await waitForText('1 item left')
      await render.getByText('Active', { exact: true }).click()
      await waitForText('Taro item')
      await render.getByText('Completed', { exact: true }).click()
      await waitForText('Use Redux')
    })

    await step('clear completed Taro todos', async () => {
      currentStep = 'clear completed Taro todos'
      await render.getByText('Clear completed', { exact: true }).click()
      await render.getByText('All', { exact: true }).click()
      await waitForText('Taro item')
      const remaining = await text()
      assert.ok(!remaining.includes('Use Redux'), 'completed todo was not removed')
    })

    await step('keep the Taro console free of errors', async () => {
      currentStep = 'keep the Taro console free of errors'
      assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(' | ')}`)
      assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(' | ')}`)
      const errors = (await page.evaluate(() => window.__tinyRuntime.host.diagnostics))
        .filter((item) => item.severity === 'error')
      assert.equal(errors.length, 0, `runtime errors: ${errors.map((item) => item.message).join(' | ')}`)
    })

    console.log('\n✅ Taro 3 example acceptance passed.')
  } catch (error) {
    try {
      await fs.mkdir(path.dirname(taroFailureShot), { recursive: true })
      await page.screenshot({ path: taroFailureShot, fullPage: true })
    } catch {
      // Screenshots are best-effort diagnostics.
    }
    throw new Error(
      `Taro 3 acceptance failed during "${currentStep}": ${error instanceof Error ? error.message : String(error)}` +
        `\nScreenshot: ${taroFailureShot}`,
    )
  } finally {
    await browser.close()
  }
}

export async function runDevtoolAcceptance({ baseUrl }) {
  const browser = await launchBrowser()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  const pageErrors = []
  const consoleErrors = []
  const failureShot = path.join(rootDir, 'tests/host/generated/acceptance-devtool-failure.png')
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  let currentStep = 'start'
  try {
    const state = () => page.evaluate(() => window.__tinyDevtool.getState())
    const waitForStatus = (status) => page.waitForFunction(
      (expected) => window.__tinyDevtool?.getState().status === expected,
      status,
      { timeout: STEP_TIMEOUT },
    )

    await step('boot the runtime debugger', async () => {
      currentStep = 'boot the runtime debugger'
      await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await waitForStatus('running')
      assert.equal(pageErrors.length, 0, `page errors during boot: ${pageErrors.join(' | ')}`)
    })

    await step('project runtime state into the debugger', async () => {
      currentStep = 'project runtime state into the debugger'
      const current = await state()
      assert.equal(current.currentPage, 'pages/todos/todos')
      assert.deepEqual(current.pageStack, ['page-1'])
      const codes = current.diagnostics.map((item) => item.code)
      assert.ok(codes.includes('RUNTIME_STATE'), 'runtime state diagnostics were not projected')
      assert.ok(codes.includes('UNSUPPORTED_CANVAS'), 'canvas diagnostics were not projected')
      assert.equal(
        current.diagnostics.filter((item) => item.severity === 'error').length,
        0,
        'runtime reported a fatal diagnostic',
      )
      assert.ok(current.tree, 'element tree was not projected')
      assert.equal(current.tree.tag, 'page')
      assert.ok(
        JSON.stringify(current.tree).includes('Tiny Glass-easel P0'),
        'element tree does not contain rendered text',
      )
      assert.ok((await page.locator('body').innerText()).includes('element tree'), 'tree panel is not visible')
    })

    await step('render the mini program inside the debugger', async () => {
      currentStep = 'render the mini program inside the debugger'
      const renderFrame = page.frames().find((frame) => frame.url().includes('next-render.html'))
      assert.ok(renderFrame, 'render thread iframe was not created')
      const body = await renderFrame.locator('#app').innerText()
      assert.ok(body.includes('Tiny Glass-easel P0'), 'mini program did not render in the debugger')
      assert.ok(body.includes('Learn glass-easel'), 'page data did not render in the debugger')
    })

    await step('navigate and go back from the debugger', async () => {
      currentStep = 'navigate and go back from the debugger'
      await page.locator('input[placeholder="pages/..."]').fill('/pages/add-todo/add-todo')
      await page.getByText('Navigate', { exact: true }).click()
      await page.waitForFunction(
        () => window.__tinyDevtool.getState().currentPage === 'pages/add-todo/add-todo',
        null,
        { timeout: STEP_TIMEOUT },
      )
      assert.deepEqual((await state()).pageStack, ['page-1', 'page-2'])
      assert.ok(
        JSON.stringify((await state()).tree).includes('Add todo'),
        'element tree did not refresh after navigation',
      )

      await page.getByText('Back', { exact: true }).click()
      await page.waitForFunction(
        () => window.__tinyDevtool.getState().currentPage === 'pages/todos/todos',
        null,
        { timeout: STEP_TIMEOUT },
      )
      assert.deepEqual((await state()).pageStack, ['page-1'])
    })

    await step('switch the debugger to the existing example app', async () => {
      currentStep = 'switch the debugger to the existing example app'
      assert.equal(await page.locator('select').count(), 1, 'app selector is missing')
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT }),
        page.selectOption('select', 'real'),
      ])
      await waitForStatus('running')
      await page.waitForFunction(
        () => {
          const tree = window.__tinyDevtool?.getState().tree
          return Boolean(tree) && JSON.stringify(tree).includes('Learning Javascript')
        },
        null,
        { timeout: STEP_TIMEOUT },
      )
      const switched = await state()
      assert.equal(switched.currentPage, 'pages/todos/todos')
      assert.equal(
        switched.diagnostics.filter((item) => item.severity === 'error').length,
        0,
        'switched app reported a fatal diagnostic',
      )
      assert.ok(
        JSON.stringify(switched.tree).includes('Learning Javascript'),
        'element tree did not switch to the existing example app',
      )
      const renderFrame = page.frames().find((frame) => frame.url().includes('next-render.html'))
      assert.ok(renderFrame, 'render thread iframe was not created for the switched app')
      const body = await renderFrame.locator('#app').innerText()
      assert.ok(body.includes('Learning Javascript'), 'existing example app did not render in the debugger')
    })

    await step('reload and terminate from the debugger', async () => {
      currentStep = 'reload and terminate from the debugger'
      await page.getByText('Reload', { exact: true }).click()
      await waitForStatus('running')
      assert.deepEqual((await state()).pageStack, ['page-1'])

      await page.getByText('Terminate', { exact: true }).click()
      await waitForStatus('terminated')
      assert.equal(await page.locator('iframe').count(), 0, 'runtime iframes were not removed')
    })

    await step('keep the debugger console free of errors', async () => {
      currentStep = 'keep the debugger console free of errors'
      assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(' | ')}`)
      assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(' | ')}`)
    })

    console.log('\n✅ Runtime debugger acceptance passed.')
  } catch (error) {
    try {
      await fs.mkdir(path.dirname(failureShot), { recursive: true })
      await page.screenshot({ path: failureShot, fullPage: true })
    } catch {
      // Screenshots are best-effort diagnostics.
    }
    throw new Error(
      `Runtime debugger acceptance failed during "${currentStep}": ${error instanceof Error ? error.message : String(error)}` +
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
