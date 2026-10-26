import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import playwright from 'playwright-core'
import { discoverTestApps } from './devtool-apps.mjs'

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

    const activeRender = async () => {
      await page.waitForSelector('iframe.tiny-runtime-render-frame[data-state="active"]', {
        state: 'attached',
        timeout: STEP_TIMEOUT,
      })
      const src = await page.locator('iframe.tiny-runtime-render-frame[data-state="active"]').getAttribute('src')
      const url = src ? new URL(src, baseUrl).href : ''
      const frame = page.frames().find((item) => item.url() === url)
      assert.ok(frame, 'active render iframe was not found')
      return frame
    }
    let render = await activeRender()

    const renderFrameBox = await page.locator('iframe.tiny-runtime-render-frame').boundingBox()
    assert.ok(
      renderFrameBox && renderFrameBox.y < 5 && renderFrameBox.height > 300,
      'render iframe should fill the host container',
    )

    const text = async () => {
      render = await activeRender()
      return render.locator('#app').innerText()
    }
    const waitForText = async (needle) => {
      currentStep = `wait for text "${needle}"`
      const deadline = Date.now() + STEP_TIMEOUT
      let lastText = ''
      while (Date.now() < deadline) {
        try {
          render = await activeRender()
          lastText = await render.locator('#app').innerText()
          if (lastText.includes(needle)) return
        } catch {
          // The active frame may be between iframe creation and activation.
        }
        await page.waitForTimeout(100)
      }
      throw new Error(`text "${needle}" was not found in the active render frame: ${lastText}`)
    }

    await step('render the todos page structure', async () => {
      currentStep = 'render the todos page structure'
      const html = await render.locator('#app').evaluate((element) => element.innerHTML)
      assert.ok(html.length > 0, 'rendered app is empty')
      for (const selector of [
        'tiny-scroll-view',
        'tiny-button',
        'tiny-checkbox',
        'tiny-slider',
        'tiny-switch',
        'tiny-progress',
        'tiny-icon',
        'tiny-swiper',
        'tiny-swiper-item',
        'tiny-image',
        'tiny-canvas',
      ]) {
        assert.ok((await render.locator(selector).count()) > 0, `missing rendered element: ${selector}`)
      }
      assert.equal(await render.locator('tiny-swiper-item').count(), 2, 'swiper should render two items')
      assert.equal(await render.locator('input.tiny-slider').inputValue(), '20')
      assert.match(await render.locator('.tiny-progress-info').innerText(), /^20%$/)
      const iconMetrics = await render.locator('tiny-icon .tiny-icon').first().evaluate((element) => {
        const style = getComputedStyle(element)
        const before = getComputedStyle(element, '::before')
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          color: style.color,
          content: before.content,
          width: element.getBoundingClientRect().width,
        }
      })
      assert.ok(iconMetrics.fontFamily.includes('weui'), 'icon should use the weui font')
      assert.equal(iconMetrics.fontSize, '23px', 'icon default size mismatch')
      assert.equal(iconMetrics.color, 'rgb(9, 187, 7)', 'icon success color mismatch')
      assert.notEqual(iconMetrics.content, 'none', 'icon should render a font glyph')
      assert.equal(iconMetrics.width, 23, 'icon width mismatch')
      const imageLoaded = await render.locator('img.tiny-image-probe, img.tiny-image-img').first().evaluate(
        (element) => element.naturalWidth > 0,
      )
      assert.ok(imageLoaded, 'inlined image did not load')

      const checkboxMetrics = await render.locator('tiny-checkbox .tiny-checkbox-input').first().evaluate((element) => {
        const style = getComputedStyle(element)
        const check = getComputedStyle(element, '::before')
        return {
          width: style.width,
          height: style.height,
          borderWidth: style.borderTopWidth,
          checkContent: check.content,
        }
      })
      assert.deepEqual(
        [checkboxMetrics.width, checkboxMetrics.height, checkboxMetrics.borderWidth],
        ['22px', '22px', '1px'],
        'checkbox visual structure does not match WeChat',
      )
      assert.notEqual(checkboxMetrics.checkContent, 'none', 'checked checkbox should draw a check mark')

      const switchMetrics = await render.locator('tiny-switch .tiny-switch-input').first().evaluate((element) => {
        const style = getComputedStyle(element)
        const knob = getComputedStyle(element, '::after')
        return { width: style.width, height: style.height, radius: style.borderTopLeftRadius, knobWidth: knob.width }
      })
      assert.deepEqual(
        [switchMetrics.width, switchMetrics.height, switchMetrics.radius, switchMetrics.knobWidth],
        ['52px', '32px', '16px', '30px'],
        'switch visual structure does not match WeChat',
      )

      const sliderMetrics = await render.locator('tiny-slider').first().evaluate((element) => {
        const track = element.querySelector('.tiny-slider-track')
        const thumb = element.querySelector('.tiny-slider-thumb')
        return {
          trackHeight: track ? getComputedStyle(track).height : '',
          thumbWidth: thumb ? getComputedStyle(thumb).width : '',
          thumbRadius: thumb ? getComputedStyle(thumb).borderTopLeftRadius : '',
        }
      })
      assert.deepEqual(
        [sliderMetrics.trackHeight, sliderMetrics.thumbWidth, sliderMetrics.thumbRadius],
        ['2px', '28px', '50%'],
        'slider visual structure does not match WeChat',
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
      const pageScopeProbe = await render.locator('page').evaluate((element) => ({
        page: getComputedStyle(element).getPropertyValue('--tiny-page-scope-probe').trim(),
        componentLeak: getComputedStyle(element).getPropertyValue('--tiny-component-page-probe').trim(),
      }))
      assert.equal(pageScopeProbe.page, 'todos', 'page tag selector did not match the page root scope')
      assert.equal(pageScopeProbe.componentLeak, '', 'component page selector leaked to the page root')
      assert.equal(
        await render.locator('page').evaluate((element) => getComputedStyle(element).outlineColor),
        'rgb(9, 8, 7)',
        'universal selector did not match the page host scope',
      )

      const tagSpecificButton = render.locator('tiny-button').filter({ hasText: 'Show toast' }).first()
      assert.equal(
        await tagSpecificButton.evaluate((element) => getComputedStyle(element).letterSpacing),
        '4px',
        'tag marker selector changed class-over-tag cascade specificity',
      )

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

      const scrollPadding = await render.locator('tiny-scroll-view').evaluate(
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
      await render.locator('add-button tiny-button').click()
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
      await render.locator('tiny-switch').first().click()
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
      const todoInput = render.locator('input[placeholder="Todo name"]')
      await todoInput.click()
      await todoInput.pressSequentially('Buy milk', { delay: 10 })
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

    await step('open the component semantics page', async () => {
      currentStep = 'open the component semantics page'
      await render.getByText('Semantics', { exact: true }).first().click()
      await waitForText('Component semantics')
    })

    await step('apply component style isolation and external classes', async () => {
      currentStep = 'apply component style isolation and external classes'
      const colorOf = (label) => render.getByText(label, { exact: true }).first().evaluate(
        (element) => getComputedStyle(element).color,
      )
      assert.equal(await colorOf('page color'), 'rgb(255, 0, 0)', 'page style did not apply')
      assert.notEqual(await colorOf('isolated color'), 'rgb(255, 0, 0)', 'isolated component leaked page style')
      assert.equal(await colorOf('page escape color'), 'rgb(255, 0, 0)', '~page-class did not resolve page scope')
      assert.equal(await colorOf('apply shared color'), 'rgb(255, 0, 0)', 'apply-shared did not receive page style')
      assert.equal(await colorOf('shared color'), 'rgb(255, 0, 0)', 'shared did not receive page style')
      assert.equal(await colorOf('external class'), 'rgb(255, 0, 0)', 'external class was not resolved')
      assert.equal(await colorOf('page target'), 'rgb(0, 0, 255)', 'shared component style did not affect page')
      assert.notEqual(await colorOf('isolated target'), 'rgb(0, 0, 255)', 'shared style leaked into isolated component')
      assert.equal(await colorOf('app shared probe'), 'rgb(0, 128, 0)', 'app.wxss did not reach apply-shared component')
      assert.notEqual(await colorOf('isolated app probe'), 'rgb(0, 128, 0)', 'app.wxss leaked into isolated component')
      assert.equal(await colorOf('parent escape'), 'rgb(12, 34, 56)', '^parent-class did not resolve parent scope')
      assert.equal(await colorOf('ancestor escape'), 'rgb(255, 0, 0)', '^^page-class did not resolve ancestor scope')
      const isolatedHostBorder = await render.locator('isolated-box').first().evaluate(
        (element) => getComputedStyle(element).borderLeftWidth,
      )
      assert.equal(isolatedHostBorder, '3px', ':host styles did not apply to the component host')
      const isolatedOutline = await render.getByText('isolated color', { exact: true }).first().evaluate(
        (element) => getComputedStyle(element).outlineColor,
      )
      assert.notEqual(isolatedOutline, 'rgb(9, 8, 7)', 'page universal selector leaked into an isolated component')
    })

    await step('render WeChat button variants', async () => {
      currentStep = 'render WeChat button variants'
      await waitForText('WeChat button variants')
      const buttonByText = (text) => render.locator('tiny-button').filter({ hasText: text }).first()
      const styleOf = (text) => buttonByText(text).evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          fontSize: style.fontSize,
          paddingLeft: style.paddingLeft,
          display: style.display,
          borderTopWidth: style.borderTopWidth,
          borderTopColor: style.borderTopColor,
          opacity: style.opacity,
        }
      })
      assert.deepEqual(
        await styleOf('Default button'),
        {
          color: 'rgb(0, 0, 0)',
          backgroundColor: 'rgb(248, 248, 248)',
          borderRadius: '5px',
          fontSize: '18px',
          paddingLeft: '14px',
          display: 'block',
          borderTopWidth: '0px',
          borderTopColor: 'rgb(0, 0, 0)',
          opacity: '1',
        },
        'default button does not match WeChat defaults',
      )
      const primary = await styleOf('Primary button')
      assert.equal(primary.color, 'rgb(255, 255, 255)', 'primary button text color mismatch')
      assert.equal(primary.backgroundColor, 'rgb(26, 173, 25)', 'primary button background mismatch')
      const warnPlain = await styleOf('Warn plain')
      assert.equal(warnPlain.color, 'rgb(230, 67, 64)', 'warn plain button text color mismatch')
      assert.equal(warnPlain.backgroundColor, 'rgba(0, 0, 0, 0)', 'plain button must be transparent')
      assert.equal(warnPlain.borderTopWidth, '1px', 'plain button border width mismatch')
      assert.equal(warnPlain.borderTopColor, 'rgb(230, 67, 64)', 'plain button border color mismatch')
      const mini = await styleOf('Mini button')
      assert.equal(mini.fontSize, '13px', 'mini button font size mismatch')
      assert.equal(mini.display, 'inline-block', 'mini button display mismatch')
      const disabled = await styleOf('Disabled button')
      assert.equal(disabled.color, 'rgba(0, 0, 0, 0.3)', 'disabled button text color mismatch')
      assert.equal(disabled.backgroundColor, 'rgb(247, 247, 247)', 'disabled button background mismatch')
      assert.equal(disabled.opacity, '1', 'disabled button opacity must not be reduced')
      const loading = await buttonByText('Loading button').evaluate((element) => {
        const style = getComputedStyle(element, '::before')
        return { animationName: style.animationName, width: style.width, content: style.content }
      })
      assert.equal(loading.animationName, 'tiny-button-loading-animate', 'loading spinner animation missing')
      assert.equal(loading.width, '18px', 'loading spinner width mismatch')
      assert.notEqual(loading.content, 'none', 'loading spinner pseudo-element missing')
    })

    await step('run behavior observers and selectComponent', async () => {
      currentStep = 'run behavior observers and selectComponent'
      await waitForText('from-behavior')
      await waitForText('behavior-obs:first')
      await waitForText('box-obs:first')
      await waitForText('probe:probe-ok')
      await render.getByText('Change value', { exact: true }).first().click()
      await waitForText('behavior-obs:second')
      await waitForText('box-obs:second')
      await waitForText('second:first')
    })

    await step('link and unlink component relations', async () => {
      currentStep = 'link and unlink component relations'
      await waitForText('parent-linked:1')
      await waitForText('child-linked:1')
      await render.getByText('Toggle child', { exact: true }).first().click()
      await waitForText('parent-linked:0')
      assert.ok(!(await text()).includes('child-linked'), 'child relation was not unlinked')
    })

    await step('return to the P0 page', async () => {
      currentStep = 'return to the P0 page'
      await render.getByText('Back', { exact: true }).first().click()
      await waitForText('Open add todo')
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

    const activeRender = async () => {
      await page.waitForSelector('iframe.tiny-runtime-render-frame[data-state="active"]', {
        state: 'attached',
        timeout: STEP_TIMEOUT,
      })
      const src = await page.locator('iframe.tiny-runtime-render-frame[data-state="active"]').getAttribute('src')
      const url = src ? new URL(src, baseUrl).href : ''
      const frame = page.frames().find((item) => item.url() === url)
      assert.ok(frame, 'active render iframe was not found')
      return frame
    }
    let render = await activeRender()
    const text = async () => {
      render = await activeRender()
      return render.locator('#app').innerText()
    }
    const waitForText = async (needle) => {
      currentStep = `wait for text "${needle}"`
      const deadline = Date.now() + STEP_TIMEOUT
      let lastText = ''
      while (Date.now() < deadline) {
        try {
          render = await activeRender()
          lastText = await render.locator('#app').innerText()
          if (lastText.includes(needle)) return
        } catch {
          // The active frame may be between iframe creation and activation.
        }
        await page.waitForTimeout(100)
      }
      throw new Error(`text "${needle}" was not found in the active render frame: ${lastText}`)
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
      for (const selector of ['tiny-checkbox', 'tiny-slider', 'tiny-progress', 'tiny-switch', 'tiny-swiper', 'tiny-canvas']) {
        assert.ok((await render.locator(selector).count()) > 0, `missing rendered element: ${selector}`)
      }
      const legacyCanvas = render.locator('canvas[canvas-id="canvas"]').first()
      await waitForCanvasHandoff(render, 'canvas[canvas-id="canvas"]')
      await waitForCanvasStats(page, legacyCanvas, 100)
      const background = await render.locator('page').evaluate((element) => getComputedStyle(element).backgroundColor)
      assert.equal(background, 'rgb(50, 50, 57)', 'app.wxss page rule did not apply to the real app')

      const avatar = render.locator('tiny-image').first()
      assert.ok(
        ((await avatar.getAttribute('class')) ?? '').includes('tiny-pages-todos-todos--avatar'),
        'external class was not scoped to the page',
      )
      assert.ok(
        (await avatar.evaluate((element) => element.getBoundingClientRect().width)) > 50,
        'external class styles did not apply to the image',
      )
      const avatarLayer = await avatar.locator('.tiny-image-div').evaluate((element) => {
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return { width: rect.width, height: rect.height, backgroundImage: style.backgroundImage }
      })
      assert.ok(avatarLayer.width > 0 && avatarLayer.height > 0, 'image background layer has no box')
      assert.ok(avatarLayer.backgroundImage.includes('url('), 'image background did not resolve')

    })

    await step('drive the existing todos page interactions', async () => {
      currentStep = 'drive the existing todos page interactions'
      await render.waitForFunction(() => document.querySelector('img')?.naturalWidth > 0, null, { timeout: STEP_TIMEOUT })
      assert.equal(await render.locator('tiny-label[class*="--todo-item"][class*="--checked"]').count(), 2, 'initial checked todos are wrong')

      await render.getByText('Learning 小程序', { exact: true }).click()
      await render.waitForFunction(
        () => document.querySelectorAll('tiny-label[class*="--todo-item"][class*="--checked"]').length === 3,
        null,
        { timeout: STEP_TIMEOUT },
      )

      const componentButton = render.locator('add-button tiny-button').first()
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

      const pageButton = render.locator('tiny-button').filter({ hasText: 'nav' }).first()
      const pageButtonSpacing = await pageButton.evaluate((element) => getComputedStyle(element).letterSpacing)
      assert.equal(pageButtonSpacing, '2px', 'page tag selector did not apply')

      await render.locator('add-button').first().locator('tiny-button').first().click()
      await render.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('def'),
        null,
        { timeout: STEP_TIMEOUT },
      )

      await render.locator('tiny-switch').first().click()
      assert.equal(await render.locator('tiny-switch').first().locator('input[type="checkbox"]').isChecked(), true)

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

      assert.equal(await render.locator('tiny-radio input[type="radio"]').isChecked(), true, 'radio is not checked')
      assert.ok((await render.locator('.tiny-icon-success_no_circle').count()) > 0, 'icon type was not applied')

      const swiper = render.locator('.tiny-swiper')
      assert.equal(await swiper.locator('.tiny-swiper-dot').count(), 3, 'swiper dots did not render')
      await swiper.locator('.tiny-swiper-dot').nth(1).click()
      await render.waitForFunction(
        () => document.querySelector('.tiny-swiper-track')?.getAttribute('style')?.includes('translateX(-100%)'),
        null,
        { timeout: STEP_TIMEOUT },
      )

      const animated = await render.evaluate(() => [...document.querySelectorAll('tiny-view, view')].some((element) => {
        const style = element.getAttribute('style') ?? ''
        return style.includes('transition: all') && getComputedStyle(element).transform !== 'none'
      }))
      assert.ok(animated, 'animation data did not produce a transform')
    })

    await step('render WXML import/include and named templates', async () => {
      currentStep = 'render WXML import/include and named templates'
      await render.locator('add-button').nth(1).locator('tiny-button').first().click()
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

    await step('render the ECharts page through the canvas bridge', async () => {
      currentStep = 'render the ECharts page through the canvas bridge'
      const previousRenderUrl = render.url()
      await render.getByText('nav', { exact: true }).first().click()
      await page.waitForFunction(
        () => window.__tinyRuntime.host.diagnostics.some(
          (item) => item.code === 'RUNTIME_STATE' && item.details?.currentPage === 'pages/bar/index',
        ),
        null,
        { timeout: STEP_TIMEOUT },
      )
      await page.waitForFunction(
        (previousUrl) => {
          const frame = document.querySelector('iframe.tiny-runtime-render-frame[data-state="active"]')
          return Boolean(frame && frame.src !== previousUrl)
        },
        previousRenderUrl,
        { timeout: STEP_TIMEOUT },
      )
      render = await activeRender()
      const canvasClass = (await render.locator('tiny-canvas').first().getAttribute('class')) ?? ''
      assert.ok(
        canvasClass.includes('tiny-components-ec-canvas-ec-canvas--ec-canvas'),
        'component canvas class was not scoped',
      )
      const chartCanvas = render.locator('canvas[canvas-id="mychart-bar"]').first()
      await waitForCanvasHandoff(render, 'canvas[canvas-id="mychart-bar"]')
      await waitForCanvasStats(page, chartCanvas, 100)
      const errorsAfterBar = (await diagnostics()).filter((item) => item.severity === 'error')
      assert.equal(errorsAfterBar.length, 0, `bar page raised errors: ${errorsAfterBar.map((item) => item.message).join(' | ')}`)
    })

    await step('interact with the ECharts canvas', async () => {
      currentStep = 'interact with the ECharts canvas'
      const chartCanvas = render.locator('canvas[canvas-id="mychart-bar"]').first()
      const box = await chartCanvas.boundingBox()
      assert.ok(box && box.width > 100 && box.height > 100, 'bar chart canvas has no layout box')
      const transferred = await chartCanvas.evaluate((element) => {
        try {
          element.getContext('2d')
          return false
        } catch (error) {
          return error instanceof Error && error.name === 'InvalidStateError'
        }
      })
      assert.ok(transferred, 'ECharts canvas was not handed off through OffscreenCanvas')
      // Let the initial ECharts animation settle so the next frame change is
      // attributable to the drag.
      await page.waitForTimeout(1200)
      const before = await chartCanvas.screenshot()
      const x = box.x + box.width * 0.7
      const y = box.y + box.height * 0.4
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.mouse.move(x + 24, y + 12, { steps: 6 })
      await page.mouse.up()
      await page.waitForTimeout(300)
      const after = await chartCanvas.screenshot()
      assert.ok(!before.equals(after), 'canvas interaction did not repaint the chart')
      const interactionErrors = (await diagnostics()).filter(
        (item) => item.severity === 'error' || item.code === 'EVENT_HANDLER_ERROR',
      )
      assert.equal(
        interactionErrors.length,
        0,
        `canvas interaction raised errors: ${interactionErrors.map((item) => item.message).join(' | ')}`,
      )
    })

    await step('report unsupported capabilities as warnings, not failures', async () => {
      currentStep = 'report unsupported capabilities as warnings, not failures'
      const items = await diagnostics()
      const warningCodes = items.filter((item) => item.severity === 'warning').map((item) => item.code)
      const infoCodes = items.filter((item) => item.severity === 'info').map((item) => item.code)
      assert.ok(warningCodes.includes('UNSUPPORTED_CANVAS'), 'canvas placeholder was not reported')
      assert.ok(infoCodes.includes('CANVAS_OFFSCREEN'), 'canvas bridging was not reported')
      assert.equal(items.filter((item) => item.severity === 'error').length, 0, 'real app raised fatal diagnostics')
    })

    await step('boot the subpackage page directly', async () => {
      currentStep = 'boot the subpackage page directly'
      await page.goto(`${baseUrl}/?path=packageA/pages/c/c`, {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const subpackageRender = await activeRender()
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

export async function runWechatDemoAcceptance({ baseUrl }) {
  const browser = await launchBrowser()
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } })
  const pageErrors = []
  const consoleErrors = []
  const canvasImageResponses = []
  const shot = path.join(rootDir, 'tests/host/generated/acceptance-wechat-demo-failure.png')
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('response', (response) => {
    if (response.url().includes('/canvas-2d/car.png')) canvasImageResponses.push(response.status())
  })

  let currentStep = 'start'
  try {
    const activeRender = async () => {
      await page.waitForSelector('iframe.tiny-runtime-render-frame[data-state="active"]', {
        state: 'attached',
        timeout: STEP_TIMEOUT,
      })
      const src = await page.locator('iframe.tiny-runtime-render-frame[data-state="active"]').getAttribute('src')
      const url = src ? new URL(src, baseUrl).href : ''
      const frame = page.frames().find((item) => item.url() === url)
      assert.ok(frame, 'active render iframe was not found')
      return frame
    }

    await step('boot the WeChat component demo', async () => {
      currentStep = 'boot the WeChat component demo'
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto(`${baseUrl}?path=page/component/index`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      await render.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('视图容器'),
        null,
        { timeout: STEP_TIMEOUT },
      )
      const body = await render.locator('#app').innerText()
      assert.ok(body.includes('表单组件'), 'component categories did not render')
      await render.waitForFunction(() => {
        const images = [...document.querySelectorAll('img[src*="resources/kind"]')]
        return images.length > 0 && images.every((image) => image.complete && image.naturalWidth > 0)
      }, null, { timeout: STEP_TIMEOUT })
      const theme = await render.evaluate(() => {
        const element = document.querySelector('[data-weui-theme]')
        return {
          value: element?.getAttribute('data-weui-theme'),
          background: element ? getComputedStyle(element).getPropertyValue('--weui-BG-2').trim() : '',
        }
      })
      assert.equal(theme.value, 'light', 'WeUI light theme attribute was not forwarded to the built-in view root')
      assert.equal(theme.background, '#fff', 'WeUI light theme variables did not win over the dark color scheme')
      assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(' | ')}`)
      await page.emulateMedia({ colorScheme: 'light' })
    })

    await step('render a component example page', async () => {
      currentStep = 'render a component example page'
      await page.goto(`${baseUrl}?path=packageComponent/pages/form/button/button`, {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      await render.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('页面主操作 Normal'),
        null,
        { timeout: STEP_TIMEOUT },
      )
      assert.ok((await render.locator('tiny-button').count()) > 0, 'component buttons did not render')
    })

    await step('render an API example page', async () => {
      currentStep = 'render an API example page'
      await page.goto(`${baseUrl}?path=packageAPI/pages/storage/storage/storage`, {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      await render.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('get/set/clearStorage'),
        null,
        { timeout: STEP_TIMEOUT },
      )
    })

    await step('run the canvas 2D node example', async () => {
      currentStep = 'run the canvas 2D node example'
      await page.goto(`${baseUrl}?path=packageComponent/pages/canvas/canvas-2d/canvas-2d`, {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      const canvas = render.locator('#canvas2D canvas').first()
      await waitForCanvasHandoff(render, '#canvas2D canvas')
      await waitForCanvasStats(page, canvas, 100)
      const before = await canvas.screenshot()
      await page.waitForTimeout(300)
      const after = await canvas.screenshot()
      assert.ok(!before.equals(after), 'canvas 2D requestAnimationFrame loop did not advance')
      assert.ok(canvasImageResponses.includes(200), 'canvas 2D createImage() did not load car.png')
      assert.ok(
        !(await render.locator('#app').innerText()).includes('微信版本过低'),
        'canvas 2D node was reported as unavailable',
      )
      const transferred = await canvas.evaluate((element) => {
        try {
          element.getContext('2d')
          return false
        } catch (error) {
          return error instanceof Error && error.name === 'InvalidStateError'
        }
      })
      assert.ok(transferred, 'canvas 2D node was not handed off through OffscreenCanvas')
      const service = page.frames().find((frame) => frame.url().includes('service.html'))
      assert.ok(service, 'service iframe was not created for the canvas 2D page')
      const sync = await service.evaluate(async () => {
        const result = await new Promise((resolve) => {
          wx.createSelectorQuery().select('#canvas2D').fields({ node: true, size: true }).exec(resolve)
        })
        const node = result[0].node
        const context = node.getContext('2d')
        const metrics = context.measureText('sync')
        return {
          width: metrics.width,
          bytes: context.getImageData(0, 0, 1, 1).data.length,
          dataUrl: node.toDataURL().startsWith('data:image/png'),
        }
      })
      assert.ok(sync.width > 0, 'measureText() did not return synchronously')
      assert.equal(sync.bytes, 4, 'getImageData() did not return synchronously')
      assert.ok(sync.dataUrl, 'toDataURL() did not return a PNG data URL')
      const errors = (await page.evaluate(() => window.__tinyRuntime.host.diagnostics))
        .filter((item) => item.severity === 'error' || item.code === 'EVENT_HANDLER_ERROR')
      assert.equal(errors.length, 0, `canvas 2D errors: ${errors.map((item) => item.message).join(' | ')}`)
    })

    await step('run the canvas WebGL example', async () => {
      currentStep = 'run the canvas WebGL example'
      await page.goto(`${baseUrl}?path=packageComponent/pages/canvas/webgl/webgl`, {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      const canvas = render.locator('#canvasWebGL canvas').first()
      await waitForCanvasHandoff(render, '#canvasWebGL canvas')
      await waitForCanvasStats(page, canvas, 100)
      const transferInfo = await canvas.evaluate((element) => {
        let context = null
        let errorName = null
        try {
          context = element.getContext('2d') ? 'context' : null
        } catch (error) {
          errorName = error instanceof Error ? error.name : String(error)
        }
        return {
          transferred: context === null && errorName === 'InvalidStateError',
          context,
          errorName,
          id: element.id,
          canvasId: element.getAttribute('canvas-id'),
          connected: element.isConnected,
          width: element.width,
          height: element.height,
          matches: document.querySelectorAll('#canvasWebGL canvas').length,
        }
      })
      assert.ok(
        transferInfo.transferred,
        `canvas WebGL node was not handed off through OffscreenCanvas: ${JSON.stringify(transferInfo)}`,
      )
      assert.ok(
        !(await render.locator('#app').innerText()).includes('微信版本过低'),
        'canvas WebGL node was reported as unavailable',
      )
      const errors = (await page.evaluate(() => window.__tinyRuntime.host.diagnostics))
        .filter((item) => item.severity === 'error' || item.code === 'EVENT_HANDLER_ERROR')
      assert.equal(errors.length, 0, `canvas WebGL errors: ${errors.map((item) => item.message).join(' | ')}`)
    })

    await step('keep the WeChat demo console free of errors', async () => {
      currentStep = 'keep the WeChat demo console free of errors'
      assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(' | ')}`)
      assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(' | ')}`)
      const errors = (await page.evaluate(() => window.__tinyRuntime.host.diagnostics))
        .filter((item) => item.severity === 'error')
      assert.equal(errors.length, 0, `runtime errors: ${errors.map((item) => item.message).join(' | ')}`)
    })

    console.log('\n✅ WeChat demo acceptance passed.')
  } catch (error) {
    try {
      await fs.mkdir(path.dirname(shot), { recursive: true })
      await page.screenshot({ path: shot, fullPage: true })
    } catch {
      // Screenshots are best-effort diagnostics.
    }
    throw new Error(
      `WeChat demo acceptance failed during "${currentStep}": ${error instanceof Error ? error.message : String(error)}` +
        `\nScreenshot: ${shot}`,
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
    const activeRender = async () => {
      await page.waitForSelector('iframe.tiny-runtime-render-frame[data-state="active"]', {
        state: 'attached',
        timeout: STEP_TIMEOUT,
      })
      const src = await page.locator('iframe.tiny-runtime-render-frame[data-state="active"]').getAttribute('src')
      const url = src ? new URL(src, baseUrl).href : ''
      const frame = page.frames().find((item) => item.url() === url)
      assert.ok(frame, 'active render iframe was not found')
      return frame
    }

    await step('boot the Taro 3 app', async () => {
      currentStep = 'boot the Taro 3 app'
      await page.goto(`${baseUrl}?path=pages/index/index`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      assert.equal(pageErrors.length, 0, `page errors during boot: ${pageErrors.join(' | ')}`)
    })

    const render = await activeRender()
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
      await render.locator('tiny-checkbox').first().click()
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
    if (message.type() !== 'error') return
    const url = message.location().url
    consoleErrors.push(url ? `${message.text()} (${url})` : message.text())
  })

  let currentStep = 'start'
  try {
    const fixtures = discoverTestApps()
    assert.ok(fixtures.length > 0, 'no tests/apps fixtures were discovered')
    const expectedText = {
      demo: 'Tiny Glass-easel P0',
      mini: 'Learning Javascript',
      todo: 'Use Redux',
      'wechat-demo': '视图容器',
      echarts: '柱状图',
    }
    const imageFixtures = new Set(['demo', 'mini', 'wechat-demo', 'echarts'])
    const fixtureById = new Map(fixtures.map((fixture) => [fixture.id, fixture]))
    const state = () => page.evaluate(() => window.__tinyDevtool.getState())
    const waitForStatus = (status) => page.waitForFunction(
      (expected) => window.__tinyDevtool?.getState().status === expected,
      status,
      { timeout: STEP_TIMEOUT },
    )
    const managerState = () => page.evaluate(() => ({
      active: window.__tinyDevtoolApps?.getActiveAppId() ?? null,
      sessions: window.__tinyDevtoolApps?.getSessions() ?? [],
      maxLive: window.__tinyDevtoolApps?.getMaxLiveApps(),
      maxStack: window.__tinyDevtoolApps?.getMaxPageStack(),
    }))
    const sessionIds = async () => (await managerState()).sessions.map((session) => session.appId).sort()
    const waitForLauncher = () => page.waitForSelector('.td-launcher', {
      state: 'visible',
      timeout: STEP_TIMEOUT,
    })
    const ensureLauncher = async () => {
      if (await page.locator('.td-launcher').isVisible().catch(() => false)) return
      const background = page.getByRole('button', { name: 'Background app' })
      assert.equal(await background.count(), 1, 'background control is missing')
      await background.click()
      await waitForLauncher()
      await page.waitForFunction(
        () => window.__tinyDevtoolApps?.getActiveAppId() === null,
        null,
        { timeout: STEP_TIMEOUT },
      )
    }
    const openFixture = async (fixture) => {
      if (!(await page.locator('.td-launcher').isVisible().catch(() => false))) {
        await ensureLauncher()
      }
      const row = page.locator(`.td-launcher-main[aria-label$="${fixture.label}"]`)
      assert.equal(await row.count(), 1, `launcher row for ${fixture.label} is missing`)
      await row.click()
      await page.waitForFunction(
        (appId) => window.__tinyDevtoolApps?.getActiveAppId() === appId,
        fixture.id,
        { timeout: STEP_TIMEOUT },
      )
      await waitForStatus('running')
    }
    const surfaceSelector = (appId) => `.td-app-surface[data-app-id="${appId}"]`
    const activeRenderFrame = (appId, pageId) => page.frames().find(
      (frame) => frame.url().includes('next-render.html')
        && frame.url().includes(`app=${appId}`)
        && frame.url().includes(`pageId=${pageId}`),
    )
    const waitForSession = async (appId, present = true) => {
      await page.waitForFunction(
        ({ expectedAppId, expectedPresent }) => {
          const ids = window.__tinyDevtoolApps?.getSessions().map((session) => session.appId) ?? []
          return ids.includes(expectedAppId) === expectedPresent
        },
        { expectedAppId: appId, expectedPresent: present },
        { timeout: STEP_TIMEOUT },
      )
    }

    await step('gate mobile browsers to a desktop-only notice', async () => {
      currentStep = 'gate mobile browsers to a desktop-only notice'
      const mobilePage = await browser.newPage({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        isMobile: true,
        hasTouch: true,
      })
      const mobileErrors = []
      mobilePage.on('pageerror', (error) => mobileErrors.push(error.message))
      await mobilePage.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await mobilePage.waitForSelector('.td-mobile-gate', { state: 'visible', timeout: STEP_TIMEOUT })
      const mobileText = await mobilePage.locator('.td-mobile-gate').innerText()
      assert.ok(mobileText.includes('请在电脑端访问'), 'mobile notice text is missing')
      assert.equal(await mobilePage.locator('.td-launcher').count(), 0, 'mobile page started the launcher')
      assert.equal(await mobilePage.locator('iframe').count(), 0, 'mobile page started a runtime')
      assert.deepEqual(mobileErrors, [], `mobile page errors: ${mobileErrors.join(' | ')}`)
      await mobilePage.close()
    })

    await step('show the app launcher by default', async () => {
      currentStep = 'show the app launcher by default'
      await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await page.waitForFunction(
        (count) => window.__tinyDevtoolApps?.getApps().length === count,
        fixtures.length,
        { timeout: STEP_TIMEOUT },
      )
      await waitForLauncher()
      assert.equal(await page.locator('iframe').count(), 0, 'launcher should not start a runtime')
      const manager = await managerState()
      assert.deepEqual(manager.sessions, [], 'launcher should start with no warm apps')
      assert.equal(manager.maxLive, 3, 'keepalive budget is not 3')
      assert.equal(manager.maxStack, 10, 'default page stack limit is not 10')
      assert.equal(await page.locator('.td-launcher-main').count(), fixtures.length)
      assert.deepEqual(
        await page.locator('.td-launcher-name').allInnerTexts(),
        fixtures.map((fixture) => fixture.title),
        'launcher does not list every fixture title in registry order',
      )
      assert.deepEqual(
        await page.locator('.td-launcher-meta').allInnerTexts(),
        fixtures.map((fixture) => `${fixture.id} · ${fixture.pages} pages`),
        'launcher meta does not show every fixture id and page count',
      )
      assert.equal(await page.locator('.td-nav-title').innerText(), 'Test apps')
      assert.equal(
        await page.locator('.td-warm-count').innerText(),
        '0 / 3 warm',
        'warm-app counter is missing',
      )
      assert.equal(
        await page.evaluate(() => new URL(window.location.href).searchParams.has('app')),
        false,
        'default launcher URL should not pin an app',
      )
    })

    await step('launch an app from the list', async () => {
      currentStep = 'launch an app from the list'
      await openFixture(fixtureById.get('demo'))
      assert.equal((await managerState()).active, 'demo')
      assert.equal(await page.locator('.td-launcher').count(), 0, 'launcher stayed visible after launch')
      assert.equal(
        await page.evaluate(() => new URL(window.location.href).searchParams.get('app')),
        'demo',
        'launch did not update the URL',
      )
      assert.equal(await page.locator('iframe[data-page-id]').count(), 1)
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
      assert.equal(
        await page.locator('.td-nav-title').innerText(),
        fixtureById.get('demo').title,
        'host navigation bar did not project the app title',
      )
      assert.equal(
        await page.getByRole('button', { name: 'Back in preview' }).isDisabled(),
        true,
        'host navigation back should be disabled on the first page',
      )
      assert.equal(await page.getByRole('tab').count(), 3, 'console/lifecycle/elements tabs are missing')
      const lifecycleTab = page.getByRole('tab', { name: /Lifecycle/ })
      await lifecycleTab.click()
      assert.equal(await lifecycleTab.getAttribute('aria-selected'), 'true')
      const lifecycleText = (await page.getByRole('tabpanel').innerText()).toLowerCase()
      assert.ok(lifecycleText.includes('page webviews'), 'page webviews are not listed')
      assert.ok(lifecycleText.includes('onshow'), 'page lifecycle timeline has no onShow event')
      assert.ok(lifecycleText.includes('onready'), 'page lifecycle timeline has no onReady event')
      const elementsTab = page.getByRole('tab', { name: 'Elements' })
      await elementsTab.click()
      assert.equal(await elementsTab.getAttribute('aria-selected'), 'true')
      assert.ok(
        (await page.getByRole('tabpanel').innerText()).includes('page'),
        'element tree is not rendered in the debug panel',
      )
    })

    await step('render the mini program inside the debugger', async () => {
      currentStep = 'render the mini program inside the debugger'
      const demoSurface = surfaceSelector('demo')
      assert.equal(
        await page.locator(`${demoSurface} iframe[data-page-id]`).count(),
        1,
        'the first page should own exactly one render iframe',
      )
      assert.equal(
        await page.locator(`${demoSurface} iframe[data-page-id="page-1"]`).getAttribute('data-state'),
        'active',
      )
      const renderFrame = page.frameLocator(`${demoSurface} iframe[data-page-id="page-1"]`)
      const body = await renderFrame.locator('#app').innerText()
      assert.ok(body.includes('Tiny Glass-easel P0'), 'mini program did not render in the debugger')
      assert.ok(body.includes('Learn glass-easel'), 'page data did not render in the debugger')
      const firstPageCss = (
        await renderFrame.locator('head style[wx-style-scope]').allTextContents()
      ).join('\n')
      assert.ok(firstPageCss.includes('.tiny-pages-todos-todos--'), 'first page WXSS was not registered')
      assert.ok(
        !firstPageCss.includes('.tiny-pages-add-todo-add-todo--'),
        'first page iframe registered another page\'s WXSS',
      )
    })

    await step('navigate and go back from the debugger', async () => {
      currentStep = 'navigate and go back from the debugger'
      const demoSurface = surfaceSelector('demo')
      await page.locator('input[placeholder="pages/..."]').fill('/pages/add-todo/add-todo')
      await page.getByText('Navigate', { exact: true }).click()
      await page.waitForFunction(
        () => window.__tinyDevtool.getState().currentPage === 'pages/add-todo/add-todo',
        null,
        { timeout: STEP_TIMEOUT },
      )
      assert.deepEqual((await state()).pageStack, ['page-1', 'page-2'])
      await page.waitForFunction(
        () => JSON.stringify(window.__tinyDevtool.getState().tree ?? {}).includes('Add todo'),
        null,
        { timeout: STEP_TIMEOUT },
      )
      await page.waitForSelector(`${demoSurface} iframe[data-page-id="page-2"][data-state="active"]`, {
        timeout: STEP_TIMEOUT,
      })
      // The previous page keeps its own iframe and DOM while it is hidden.
      assert.equal(
        await page.locator(`${demoSurface} iframe[data-page-id="page-1"]`).getAttribute('data-state'),
        'hidden',
      )
      const previousFrame = page.frameLocator(`${demoSurface} iframe[data-page-id="page-1"]`)
      assert.ok(
        (await previousFrame.locator('#app').innerText()).includes('Tiny Glass-easel P0'),
        'hidden page lost its rendered DOM',
      )
      const nextFrame = page.frameLocator(`${demoSurface} iframe[data-page-id="page-2"]`)
      const nextFrameCss = (
        await nextFrame.locator('head style[wx-style-scope]').allTextContents()
      ).join('\n')
      assert.ok(nextFrameCss.includes('.tiny-pages-add-todo-add-todo--'), 'second page WXSS was not registered')
      assert.ok(
        !nextFrameCss.includes('.tiny-pages-todos-todos--'),
        'second page iframe registered another page\'s WXSS',
      )
      const previousFrameCss = (
        await previousFrame.locator('head style[wx-style-scope]').allTextContents()
      ).join('\n')
      assert.ok(
        !previousFrameCss.includes('.tiny-pages-add-todo-add-todo--'),
        'hidden page iframe registered another page\'s WXSS',
      )
      const phases = await page.evaluate(
        () => window.__tinyDevtool.getState().lifecycle.map((event) => event.phase),
      )
      assert.ok(phases.includes('onHide'), 'navigateTo did not record page onHide')
      assert.ok(phases.includes('onShow'), 'navigateTo did not record page onShow')

      const previewBack = page.getByRole('button', { name: 'Back in preview' })
      assert.equal(await previewBack.isDisabled(), false, 'host navigation back should be enabled')
      await previewBack.click()
      await page.waitForFunction(
        () => window.__tinyDevtool.getState().currentPage === 'pages/todos/todos',
        null,
        { timeout: STEP_TIMEOUT },
      )
      await page.waitForFunction(
        (selector) => !document.querySelector(`${selector} iframe[data-page-id="page-2"]`),
        demoSurface,
        { timeout: STEP_TIMEOUT },
      )
      assert.deepEqual((await state()).pageStack, ['page-1'])
      assert.equal(
        await page.locator(`${demoSurface} iframe[data-page-id="page-1"]`).getAttribute('data-state'),
        'active',
      )
    })

    await step('preview every fixture and keep the three most recent warm', async () => {
      currentStep = 'preview every fixture and keep the three most recent warm'
      await ensureLauncher()
      assert.deepEqual(await sessionIds(), ['demo'])
      await page.waitForFunction(
        () => document.querySelector('.td-warm-count')?.textContent === '1 / 3 warm',
        null,
        { timeout: STEP_TIMEOUT },
      )

      for (const fixture of fixtures) {
        currentStep = `preview tests/apps/${fixture.id}`
        await openFixture(fixture)
        await page.waitForFunction(
          (expectedPage) => window.__tinyDevtool?.getState().currentPage === expectedPage,
          fixture.firstPage,
          { timeout: STEP_TIMEOUT },
        )

        const needle = expectedText[fixture.id]
        if (needle) {
          await page.waitForFunction(
            (expected) => JSON.stringify(window.__tinyDevtool?.getState().tree ?? {}).includes(expected),
            needle,
            { timeout: STEP_TIMEOUT },
          )
        } else {
          await page.waitForFunction(
            () => Boolean(window.__tinyDevtool?.getState().tree),
            null,
            { timeout: STEP_TIMEOUT },
          )
        }

        const preview = await state()
        const appId = (await managerState()).active
        assert.equal(appId, fixture.id)
        assert.equal(preview.currentPage, fixture.firstPage, `${fixture.id} booted the wrong page`)
        assert.equal(
          preview.diagnostics.filter((item) => item.severity === 'error').length,
          0,
          `${fixture.id} reported a fatal diagnostic`,
        )
        assert.ok(preview.tree, `${fixture.id} did not project an element tree`)
        if (needle) {
          assert.ok(
            JSON.stringify(preview.tree).includes(needle),
            `${fixture.id} element tree does not contain "${needle}"`,
          )
        }

        const surface = surfaceSelector(fixture.id)
        const currentPageId = preview.pageStack.at(-1)
        const renderFrame = activeRenderFrame(fixture.id, currentPageId)
        assert.ok(renderFrame, `${fixture.id} did not create a render thread iframe`)
        assert.ok(
          await page.locator(`${surface} iframe[data-page-id]`).count()
            >= Math.max(preview.pageStack.length, 1),
          `${fixture.id} did not create a render frame for every live page`,
        )
        if (imageFixtures.has(fixture.id)) {
          await renderFrame.waitForFunction(() => {
            const images = [...document.querySelectorAll('img')]
            return images.length > 0 && images.every((image) => image.complete && image.naturalWidth > 0)
          }, null, { timeout: STEP_TIMEOUT })
        }
        if (needle) {
          await renderFrame.waitForFunction(
            (expected) => (document.querySelector('#app')?.innerText ?? '').includes(expected),
            needle,
            { timeout: STEP_TIMEOUT },
          )
        } else {
          await renderFrame.locator('#app').waitFor({ state: 'attached', timeout: STEP_TIMEOUT })
        }

        if (fixture.id === 'mini') {
          // The mini fixture declares a two-item tabBar. Switching tabs keeps
          // both page frames mounted and only changes which one is visible.
          const tabBar = page.locator('.td-tabbar')
          await tabBar.waitFor({ state: 'visible', timeout: STEP_TIMEOUT })
          assert.equal(await tabBar.getByRole('tab').count(), 2, 'mini tabBar did not render two items')
          const firstTab = tabBar.getByRole('tab', { name: 'Todos' })
          assert.equal(await firstTab.getAttribute('aria-selected'), 'true')
          const tabBarBox = await tabBar.boundingBox()
          assert.ok(tabBarBox && tabBarBox.height >= 49, 'tabBar height is not reserved')
          const tabIcon = tabBar.locator('img').first()
          await tabIcon.waitFor({ state: 'visible', timeout: STEP_TIMEOUT })
          assert.equal(
            await tabIcon.evaluate((image) => image.complete && image.naturalWidth > 0),
            true,
            'tabBar icon did not load',
          )

          await tabBar.getByRole('tab', { name: 'Chart' }).click()
          await page.waitForFunction(
            () => window.__tinyDevtool?.getState().currentPage === 'pages/bar/index',
            null,
            { timeout: STEP_TIMEOUT },
          )
          await page.waitForFunction(
            (selector) => document.querySelector(`${selector} iframe[data-page-id="page-2"]`)?.dataset.state === 'active',
            surface,
            { timeout: STEP_TIMEOUT },
          )
          assert.equal(
            await page.locator(`${surface} iframe[data-page-id="page-1"]`).getAttribute('data-state'),
            'hidden',
            'previous tab frame was not hidden',
          )
          assert.equal(
            await tabBar.getByRole('tab', { name: 'Chart' }).getAttribute('aria-selected'),
            'true',
            'tabBar did not select the Chart tab',
          )
          await page.frameLocator(`${surface} iframe[data-page-id="page-2"]`).locator('#app')
            .waitFor({ state: 'attached', timeout: STEP_TIMEOUT })

          await tabBar.getByRole('tab', { name: 'Todos' }).click()
          await page.waitForFunction(
            () => window.__tinyDevtool?.getState().currentPage === 'pages/todos/todos',
            null,
            { timeout: STEP_TIMEOUT },
          )
          await page.waitForFunction(
            (selector) => document.querySelector(`${selector} iframe[data-page-id="page-1"]`)?.dataset.state === 'active',
            surface,
            { timeout: STEP_TIMEOUT },
          )
          assert.equal(
            await tabBar.getByRole('tab', { name: 'Todos' }).getAttribute('aria-selected'),
            'true',
            'tabBar did not return to the Todos tab',
          )
          assert.ok(
            await page.locator(`${surface} iframe[data-page-id]`).count() >= 2,
            'cached tab frames were removed on switchTab',
          )
        }

        await ensureLauncher()
        const ids = await sessionIds()
        assert.ok(ids.length <= 3, `keepalive exceeded 3 apps after ${fixture.id}`)
        if (fixture.id === 'wechat-demo') {
          assert.deepEqual(ids, ['mini', 'todo', 'wechat-demo'], 'LRU did not evict demo')
        }
        if (fixture.id === 'echarts') {
          assert.deepEqual(ids, ['echarts', 'todo', 'wechat-demo'], 'LRU did not evict mini')
        }
      }

      assert.deepEqual(await sessionIds(), ['echarts', 'todo', 'wechat-demo'])
      const evictedDemoRow = page.locator(
        `.td-launcher-main[aria-label$="${fixtureById.get('demo').label}"] .td-launcher-state`,
      )
      assert.equal(
        await evictedDemoRow.innerText(),
        'Launch',
        'evicted app did not return to the Launch state',
      )
    })

    await step('reload, close apps, and honor deep links', async () => {
      currentStep = 'reload, close apps, and honor deep links'
      await openFixture(fixtureById.get('demo'))
      assert.equal((await managerState()).active, 'demo')
      await page.getByText('Reload', { exact: true }).click()
      await waitForStatus('running')
      assert.deepEqual((await state()).pageStack, ['page-1'])

      await ensureLauncher()
      await waitForSession('demo', true)
      await openFixture(fixtureById.get('demo'))
      assert.equal((await state()).currentPage, 'pages/todos/todos')

      await page.getByText('Close app', { exact: true }).click()
      await waitForLauncher()
      await waitForSession('demo', false)
      assert.equal(
        await page.locator(`${surfaceSelector('demo')} iframe`).count(),
        0,
        'closing the active app did not remove its surface',
      )

      while (await page.locator('.td-launcher-close').count()) {
        const before = (await managerState()).sessions.length
        await page.locator('.td-launcher-close').first().click()
        await page.waitForFunction(
          (count) => window.__tinyDevtoolApps?.getSessions().length < count,
          before,
          { timeout: STEP_TIMEOUT },
        )
      }
      const cleared = await managerState()
      assert.deepEqual(cleared.sessions, [], 'warm apps were not closed')
      assert.equal(await page.locator('iframe').count(), 0, 'runtime iframes were not removed')

      await page.goto(`${baseUrl}/?app=wechat-demo&path=page/component/index`, {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await waitForStatus('running')
      assert.equal((await state()).currentPage, 'page/component/index')
      assert.equal(await page.locator('.td-host-chrome').count(), 0, 'custom nav app should own its bar')
      await page.getByRole('button', { name: 'Background app' }).click()
      await waitForLauncher()
      await waitForSession('wechat-demo', true)
      while (await page.locator('.td-launcher-close').count()) {
        await page.locator('.td-launcher-close').first().click()
        await page.waitForFunction(
          () => window.__tinyDevtoolApps?.getSessions().length === 0,
          null,
          { timeout: STEP_TIMEOUT },
        )
      }

      await page.goto(`${baseUrl}/?app=demo&maxPageStack=1`, {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await waitForStatus('running')
      assert.equal((await managerState()).maxStack, 1)
      await page.locator('input[placeholder="pages/..."]').fill('/pages/add-todo/add-todo')
      await page.getByText('Navigate', { exact: true }).click()
      await page.waitForSelector('.td-alert', { state: 'visible', timeout: STEP_TIMEOUT })
      assert.ok(
        (await page.locator('.td-alert').innerText()).includes('page stack limit 1'),
        'page stack limit error was not surfaced',
      )
      assert.equal((await state()).currentPage, 'pages/todos/todos')
      assert.deepEqual((await state()).pageStack, ['page-1'])
      await page.getByText('Close app', { exact: true }).click()
      await waitForLauncher()
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


async function canvasScreenshotStats(page, locator) {
  const buffer = await locator.screenshot()
  const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`
  return page.evaluate(async (url) => {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) return { changed: 0, width: 0, height: 0 }
    context.drawImage(image, 0, 0)
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data
    const background = [data[0], data[1], data[2], data[3]]
    let changed = 0
    for (let index = 0; index < data.length; index += 4) {
      const alphaDelta = Math.abs(data[index + 3] - background[3])
      const colorDelta = background[3] === 0
        ? 0
        : Math.abs(data[index] - background[0])
          + Math.abs(data[index + 1] - background[1])
          + Math.abs(data[index + 2] - background[2])
      if (alphaDelta > 4 || colorDelta > 24) changed += 1
    }
    return { changed, width: canvas.width, height: canvas.height }
  }, dataUrl)
}

async function waitForCanvasHandoff(render, selector, timeout = STEP_TIMEOUT) {
  await render.waitForFunction(
    (target) => {
      const element = document.querySelector(target)
      return element?.getAttribute('data-tiny-canvas-offscreen') === 'true'
    },
    selector,
    { timeout },
  )
}

async function waitForCanvasStats(page, locator, minimum, timeout = STEP_TIMEOUT) {
  const deadline = Date.now() + timeout
  let last = { changed: 0, width: 0, height: 0 }
  while (Date.now() < deadline) {
    try {
      last = await canvasScreenshotStats(page, locator)
      if (last.changed >= minimum && last.width > 50 && last.height > 50) return last
    } catch {
      // The canvas may not be mounted yet.
    }
    await page.waitForTimeout(150)
  }
  throw new Error(
    `canvas screenshot stayed blank (${last.changed} changed pixels, ${last.width}x${last.height})`,
  )
}

async function step(name, run) {
  console.log(`\n▶ ${name}`)
  await run()
  console.log(`  ✓ ${name}`)
}
