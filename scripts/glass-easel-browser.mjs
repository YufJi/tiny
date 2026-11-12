import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import playwright from 'playwright-core'
import { discoverTestApps } from './devtool-apps.mjs'

const { chromium } = playwright

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failureShot = path.join(rootDir, 'tests/host/generated/acceptance-failure.png')
const STEP_TIMEOUT = 20_000

/** `text` keeps the hidden source node, so text locators only match visible nodes. */
const byText = (frame, text, options) => frame.getByText(text, options).filter({ visible: true })

/** Click a slider track at the position for `value` (ranges come from the host attrs). */
async function setSliderValue(slider, value) {
  const range = await slider.evaluate((element) => ({
    min: Number(element.getAttribute('min') ?? 0),
    max: Number(element.getAttribute('max') ?? 100),
  }))
  const track = slider.locator('[class*="slider-handle-wrapper"]')
  const box = await track.boundingBox()
  if (!box) throw new Error('slider track has no bounding box')
  const ratio = Math.min(1, Math.max(0, (value - range.min) / (range.max - range.min)))
  await track.click({
    position: {
      x: Math.min(box.width - 1, Math.max(1, box.width * ratio)),
      y: box.height / 2,
    },
  })
}

/**
 * Launch the one browser the whole gate shares.
 *
 * `launchServer()` + `kill()` replaces `launch()` + `close()`: Chrome on macOS
 * takes ~6s to shut down gracefully, while killing the browser server returns
 * in ~20ms. The runners below each open their own page (a fresh browser
 * context), so stages stay isolated while the browser-level HTTP cache and
 * process warm up once.
 */
export async function launchAcceptanceBrowser() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH
  const attempts = executablePath
    ? [{ label: `executablePath ${executablePath}`, options: { executablePath } }]
    : [
        { label: 'system Chrome', options: { channel: 'chrome' } },
        { label: 'system Edge', options: { channel: 'msedge' } },
      ]

  const errors = []
  for (const attempt of attempts) {
    let server
    try {
      server = await chromium.launchServer({ headless: process.env.HEADED !== '1', ...attempt.options })
      const browser = await chromium.connect(server.wsEndpoint())
      return {
        browser,
        close: async () => {
          await server.kill()
        },
      }
    } catch (error) {
      errors.push(`${attempt.label}: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
      await server?.kill().catch(() => {})
    }
  }
  throw new Error(
    `Unable to launch a Chromium browser for acceptance:\n${errors.join('\n')}\n` +
      'Install Google Chrome or set PLAYWRIGHT_CHROMIUM_PATH to a Chromium binary.',
  )
}

/** Build a test-host URL: `?app=<fixture>` plus per-stage parameters. */
function appUrl(baseUrl, appId, params = {}) {
  const url = new URL(baseUrl)
  url.searchParams.set('app', appId)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  return url.href
}

/** Step logger with a stage prefix, so concurrent stages stay readable. */
function createStep(label) {
  return async (name, run) => {
    console.log(`\n▶ [${label}] ${name}`)
    await run()
    console.log(`  ✓ [${label}] ${name}`)
  }
}

export async function runBrowserAcceptance({ baseUrl, app = 'demo', browser }) {
  const step = createStep('P0')
  // `hasTouch` lets the gate drive the same touch path a phone uses; the
  // devtool flows below stay on mouse clicks on purpose.
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, hasTouch: true })
  const pageErrors = []
  const consoleErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  let currentStep = 'start'
  let render
  try {
    await step('boot the dual-thread host', async () => {
      currentStep = 'boot the dual-thread host'
      await page.goto(appUrl(baseUrl, app), { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
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
    render = await activeRender()

    await step('deliver host global events to wx listeners', async () => {
      currentStep = 'deliver host global events to wx listeners'
      const service = page.frames().find((frame) => frame.url().includes('/service.html'))
      assert.ok(service, 'service frame was not found')
      await service.evaluate(() => {
        window.__appShowEvents = []
        window.__networkEvents = []
        wx.onAppShow((info) => window.__appShowEvents.push(info))
        wx.onNetworkStatusChange((info) => window.__networkEvents.push(info))
      })
      await page.evaluate(() => {
        window.__tinyRuntime.host.emitGlobalEvent('appShow', { scene: 1001 })
        window.__tinyRuntime.host.emitGlobalEvent('networkStatusChange', {
          isConnected: true,
          networkType: 'wifi',
        })
      })
      await service.waitForFunction(
        () => window.__appShowEvents.length === 1 && window.__networkEvents.length === 1,
        null,
        { timeout: STEP_TIMEOUT },
      )
      const events = await service.evaluate(() => ({
        appShow: window.__appShowEvents,
        network: window.__networkEvents,
      }))
      assert.deepEqual(events.appShow, [{ scene: 1001 }])
      assert.deepEqual(events.network, [{ isConnected: true, networkType: 'wifi' }])
    })

    const touchSwipe = async (locator, fromRatio = 0.75, toRatio = 0.35) => {
      const box = await locator.boundingBox()
      assert.ok(box, 'swipe target has no bounding box')
      const x = box.x + box.width / 2
      const startY = box.y + box.height * fromRatio
      const endY = box.y + box.height * toRatio
      const cdp = await page.context().newCDPSession(page)
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x, y: startY }],
      })
      const steps = 6
      for (let index = 1; index <= steps; index += 1) {
        const y = startY + ((endY - startY) * index) / steps
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x, y }],
        })
        await page.waitForTimeout(16)
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await cdp.detach()
    }

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

    const activePageId = async () => {
      await page.waitForSelector('iframe.tiny-runtime-render-frame[data-state="active"]', {
        state: 'attached',
        timeout: STEP_TIMEOUT,
      })
      return page
        .locator('iframe.tiny-runtime-render-frame[data-state="active"]')
        .getAttribute('data-page-id')
    }

    /**
     * Dispatch the real touch sequence without `locator.tap()`.
     *
     * A navigation tap replaces the page under the pointer, and Playwright
     * re-checks the hit target once the touch is in: the retry can then stall on
     * a page the tap itself opened (or closed), for the full action timeout,
     * even though the engine handled the gesture. Sending the same
     * `touchstart`/`touchend` to the control's centre exercises the identical
     * engine path without that post-action check.
     */
    const touchTap = async (locator) => {
      await locator.waitFor({ state: 'visible', timeout: STEP_TIMEOUT })
      await locator.scrollIntoViewIfNeeded()
      const box = await locator.boundingBox()
      assert.ok(box, 'tap target has no bounding box')
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
    }

    /**
     * Tap a control that opens or closes a page, then wait for the new page.
     *
     * A touch can be dropped while the page underneath is being swapped (it is
     * then delivered to neither page) and the test would keep driving the old
     * page. The active page id and the expected text tell that apart from a slow
     * transition, so a tap that changed nothing is retried once from the
     * still-active page; a tap that already moved the app is never repeated.
     */
    const tapToPage = async (label, expectedText) => {
      const before = await activePageId()
      const arrived = async (deadline) => {
        while (Date.now() < deadline) {
          const current = await activePageId().catch(() => before)
          const body = await render.locator('#app').innerText().catch(() => '')
          if (current !== before || body.includes(expectedText)) return true
          await page.waitForTimeout(50)
        }
        return false
      }
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        render = await activeRender()
        if (attempt > 1) console.log(`\n  ↻ retried tap "${label}" (still on ${before})`)
        await touchTap(byText(render, label, { exact: true }).first())
        // The first tap gets a settle window; a retry goes straight to the wait.
        if (await arrived(Date.now() + (attempt === 1 ? 3_000 : 0))) break
      }
      await waitForText(expectedText)
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
      assert.equal(
        await render.locator('tiny-slider').first().locator('[class*="slider-track"]').evaluate((element) => element.style.width),
        '20%',
      )
      assert.match(await render.locator('.tiny-builtin-progress--tiny-progress-info').innerText(), /^20%$/)
      const iconMetrics = await render.locator('tiny-icon i').first().evaluate((element) => {
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
      const imageLoaded = await render.waitForFunction(
        () => {
          const layer = document.querySelector('tiny-image > div')
          return layer ? getComputedStyle(layer).backgroundImage.includes('url(') : false
        },
        null,
        { timeout: STEP_TIMEOUT },
      ).then(() => true, () => false)
      assert.ok(imageLoaded, 'inlined image did not load')
      // WeChat renders `<div id="div">` for the bitmap and a sibling
      // `<span><slot/></span>` for children; the fallback wrapper is gone.
      const imageShape = await render.locator('tiny-image').first().evaluate((element) => ({
        children: [...element.children].map((child) => child.tagName.toLowerCase()),
      }))
      assert.deepEqual(imageShape.children.slice(0, 2), ['div', 'span'], 'image structure does not match WeChat')

      const checkboxMetrics = await render.locator(
        'tiny-checkbox .tiny-builtin-checkbox--tiny-checkbox-input',
      ).first().evaluate((element) => {
        const style = getComputedStyle(element)
        const check = getComputedStyle(element, '::before')
        return {
          width: style.width,
          height: style.height,
          borderWidth: style.borderTopWidth,
          checkContent: check.content,
          checkFont: check.fontFamily,
          checkSize: check.fontSize,
        }
      })
      assert.deepEqual(
        [checkboxMetrics.width, checkboxMetrics.height, checkboxMetrics.borderWidth],
        ['22px', '22px', '1px'],
        'checkbox visual structure does not match WeChat',
      )
      assert.ok(checkboxMetrics.checkFont.includes('weui'), 'checkbox check mark should use the weui font')
      assert.equal(checkboxMetrics.checkSize, '22px', 'checkbox check mark size mismatch')
      assert.notEqual(checkboxMetrics.checkContent, 'none', 'checked checkbox should draw a check mark')

      const switchMetrics = await render.locator(
        'tiny-switch .tiny-builtin-switch--tiny-switch-input',
      ).first().evaluate((element) => {
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
        const track = element.querySelector('.tiny-builtin-slider--tiny-slider-track')
        const thumb = element.querySelector('.tiny-builtin-slider--tiny-slider-thumb')
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
      assert.ok(
        (await render.locator('tiny-checkbox [class*="tiny-checkbox-input-checked"]').count()) > 0,
        'checked checkbox should render the checked marker class',
      )
    })

    await step('apply scoped styles and built-in base layout', async () => {
      currentStep = 'apply scoped styles and built-in base layout'
      const pageBackground = await render.locator('tiny-page').evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      )
      assert.equal(pageBackground, 'rgb(16, 24, 40)', 'app.wxss page rule did not apply')
      assert.ok(
        (await render.locator('tiny-page[wx-host]').count()) > 0,
        'temporary glass-easel wx-host boundary is missing',
      )
      assert.ok(
        (await render.locator('style[wx-style-scope]').count()) > 0,
        'temporary glass-easel wx-style-scope boundary is missing',
      )
      assert.equal(
        await render.locator('[tiny-host], [tiny-style-scope]').count(),
        0,
        'unexpected Tiny host attributes appeared before the glass-easel naming issue is resolved',
      )
      const pageScopeProbe = await render.locator('tiny-page').evaluate((element) => ({
        page: getComputedStyle(element).getPropertyValue('--tiny-page-scope-probe').trim(),
        componentLeak: getComputedStyle(element).getPropertyValue('--tiny-component-page-probe').trim(),
      }))
      assert.equal(pageScopeProbe.page, 'todos', 'page tag selector did not match the page root scope')
      assert.equal(pageScopeProbe.componentLeak, '', 'component page selector leaked to the page root')
      assert.equal(
        await render.locator('tiny-page').evaluate((element) => getComputedStyle(element).outlineColor),
        'rgb(9, 8, 7)',
        'universal selector did not match the page host scope',
      )
      assert.equal(
        await render.locator('tiny-page').evaluate((element) => getComputedStyle(element).outlineStyle),
        'dotted',
        'app universal selector did not match the page root marker',
      )
      const internalTextOutline = await render.locator('tiny-text span:last-child').first().evaluate(
        (element) => getComputedStyle(element).outlineStyle,
      )
      assert.equal(internalTextOutline, 'none', 'app global selectors leaked into built-in component internals')

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
        [...document.querySelectorAll('tiny-text span:last-child')].some(
          (element) => getComputedStyle(element).display === 'inline',
        ),
      )
      assert.ok(hasInlineText, 'plain text should be inline')
    })

    await step('render app, page, and system snapshots', async () => {
      currentStep = 'render app, page, and system snapshots'
      assert.match(await text(), /system: [\d.]+ \/ \d+x\d+/, 'system info was not rendered')
      // `wx.canIUse` answers from the generated component inventory and the
      // installed API table: a built-in attribute, an unsupported option of a
      // supported attribute, and a bare API name.
      assert.ok(
        (await text()).includes('canIUse: true,false,true'),
        `wx.canIUse did not report engine facts: ${await text()}`,
      )
      const dimensions = /system: [\d.]+ \/ (\d+)x(\d+)/.exec(await text())
      assert.ok(dimensions && Number(dimensions[1]) > 0 && Number(dimensions[2]) > 0, 'system info has no window size')
    })

    await step('dispatch a custom component event through a slot', async () => {
      currentStep = 'dispatch a custom component event through a slot'
      assert.equal(await render.locator('tiny-add-button').count(), 1, 'add-button component did not render')
      assert.ok(((await render.locator('tiny-add-button').innerText()) ?? '').includes('Custom slot'), 'slot content missing')
      await render.locator('tiny-add-button tiny-button').click()
      await waitForText('custom: Add')
    })

    await step('update page data from a checkbox change', async () => {
      currentStep = 'update page data from a checkbox change'
      await byText(render, 'Run P0 acceptance', { exact: true }).first().click()
      await render.waitForFunction(() => {
        const body = document.querySelector('#app')?.innerText ?? ''
        const index = body.indexOf('checked:')
        return index >= 0 && body.slice(index).includes('Run P0 acceptance')
      }, null, { timeout: STEP_TIMEOUT })
    })

    await step('update progress and data from a slider change', async () => {
      currentStep = 'update progress and data from a slider change'
      await setSliderValue(render.locator('tiny-slider').first(), 65)
      await waitForText('slider: 65')
      await render.waitForFunction(
        () => document.querySelector('.tiny-builtin-progress--tiny-progress-info')?.textContent?.trim() === '65%',
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
      // Touch-first: navigation is driven by a real touch sequence, not a
      // synthetic mouse click.
      await tapToPage('Open add todo', 'Add todo')
      assert.ok((await text()).includes('from: todos'), `page query was not delivered: ${await text()}`)
      // The opener emitted through `success({ eventChannel })`; the page reads it
      // back with `this.getOpenerEventChannel()` in `onLoad`.
      await waitForText('opener: marker:fresh')
      assert.ok(!(await text()).includes('Tiny Glass-easel P0'), 'previous page was not unmounted')
      assert.equal(await render.locator('input[placeholder="Todo name"]').isVisible(), true, 'input is not visible')
      const inputBox = await render.locator('input[placeholder="Todo name"]').evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return { width: rect.width, display: getComputedStyle(element).display }
      })
      assert.equal(inputBox.display, 'block', 'input should be block-level')
      assert.ok(inputBox.width > 100, 'input did not fill its container')
      const placeholderColor = await render.locator('.tiny-builtin-input--tiny-input-placeholder').evaluate(
        (element) => getComputedStyle(element).color,
      )
      assert.equal(placeholderColor, 'rgb(77, 88, 99)', 'placeholder-class external style did not cross into input internals')
    })

    await step('propagate input changes to page data', async () => {
      currentStep = 'propagate input changes to page data'
      const todoInput = render.locator('input[placeholder="Todo name"]')
      await todoInput.click()
      // Fill once instead of typing key-by-key: the input is controlled by the
      // service/render patch loop, and per-key delays can race a value patch on
      // slower CI runners (dropping a character).
      await todoInput.fill('Buy milk')
      await waitForText('value: Buy milk')
      await todoInput.press('Enter')
      await page.waitForTimeout(50)
      const caret = await todoInput.evaluate((element) => ({
        value: element.value,
        selectionStart: element.selectionStart,
        active: document.activeElement === element,
      }))
      assert.equal(caret.value, 'Buy milk', 'Enter cleared the input value')
      assert.equal(caret.active, true, 'Enter removed input focus')
      assert.equal(caret.selectionStart, 'Buy milk'.length, 'Enter moved the caret to the start')
    })

    await step('save, navigate back, and preserve storage state', async () => {
      currentStep = 'save, navigate back, and preserve storage state'
      await tapToPage('Save and back', 'marker: Buy milk')
      // The page emitted on save; the opener's `events.todoSaved` handler
      // updated the (hidden) P0 page data.
      await waitForText('saved: Buy milk')
      assert.ok(!(await text()).includes('Save and back'), 'add-todo page was not unmounted')
      assert.equal(await render.locator('tiny-page[wx-host]').count(), 1, 'previous pages were not released')
      const storage = await page.evaluate(() => window.__tinyRuntime.host.apiRegistry.storage)
      assert.equal(storage.todoMarker, 'Buy milk', 'host storage did not receive the write')
    })

    // Router coverage: navigation is driven by touch taps (like the add-todo
    // step). The render compositor drops mouse events that replay within
    // 700ms of a touch on the same frame, so `.click()` right after a tap can
    // be swallowed.
    await step('navigate with this.pageRouter and expose route/options', async () => {
      currentStep = 'navigate with this.pageRouter and expose route/options'
      // `navigateBack` re-activates a page whose render iframe already existed;
      // `tapToPage` refreshes the frame reference before driving it.
      await text()
      await tapToPage('Router page', 'Router demo')
      const body = await text()
      assert.ok(
        body.includes('route: pages/router/router'),
        `this.route was not exposed on the page: ${body}`,
      )
      assert.ok(
        body.includes('options: {"from":"page-router"}'),
        `this.options did not carry the route query: ${body}`,
      )
      assert.ok(
        body.includes('same router: true'),
        'a page must expose the same object for this.router and this.pageRouter',
      )
    })

    await step('navigate from a component with this.router', async () => {
      currentStep = 'navigate from a component with this.router'
      // components/router-probe -> pages/add-todo via `../../`; the query proves
      // which base the component router used.
      await tapToPage('Component router', 'from: component-router')
      // The probe emitted through the opener channel in navigateTo.success.
      await waitForText('opener: probe:component-router')

      const input = render.locator('input[placeholder="Todo name"]')
      await input.click()
      await input.fill('Channel todo')
      await waitForText('value: Channel todo')
      await tapToPage('Save and back', 'Router demo')
      const storage = await page.evaluate(() => window.__tinyRuntime.host.apiRegistry.storage)
      assert.equal(
        storage.routerProbe,
        'Channel todo',
        'the navigateTo events handler did not receive the page emit',
      )
    })

    await step('navigate from a component with this.pageRouter', async () => {
      currentStep = 'navigate from a component with this.pageRouter'
      // pages/router/router -> pages/add-todo via `../`: a page-relative base, so
      // the query differs from the component-relative run above.
      await tapToPage('Component page router', 'from: component-page-router')
      await tapToPage('Save and back', 'Router demo')
    })

    await step('return to the P0 page with this.router.navigateBack', async () => {
      currentStep = 'return to the P0 page with this.router.navigateBack'
      await tapToPage('Router back', 'Tiny Glass-easel P0')
    })

    await step('resolve the toast API without fatal errors', async () => {
      currentStep = 'resolve the toast API without fatal errors'
      await byText(render, 'Show toast', { exact: true }).first().click()
      await page.waitForTimeout(300)
      const diagnostics = await page.evaluate(() => window.__tinyRuntime.host.diagnostics)
      assert.equal(
        diagnostics.filter((item) => item.severity === 'error').length,
        0,
        'toast produced a fatal diagnostic',
      )
    })

    await step('mutate the first page after navigating back', async () => {
      currentStep = 'mutate the first page after navigating back'
      // The hidden page stays mounted on the service side; a data change raised
      // after navigateBack must patch that page, not the most recently mounted one.
      await byText(render, 'Run P0 acceptance', { exact: true }).first().click()
      await render.waitForFunction(() => {
        const body = document.querySelector('#app')?.innerText ?? ''
        const index = body.indexOf('checked:')
        return index >= 0 && !body.slice(index).includes('Run P0 acceptance')
      }, null, { timeout: STEP_TIMEOUT })
    })

    await step('open the component semantics page', async () => {
      currentStep = 'open the component semantics page'
      await byText(render, 'Semantics', { exact: true }).first().click()
      await waitForText('Component semantics')
    })

    await step('apply component style isolation and external classes', async () => {
      currentStep = 'apply component style isolation and external classes'
      const colorOf = (label) => byText(render, label, { exact: true }).first().evaluate(
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
      assert.equal(
        await render.locator('tiny-apply-shared-box tiny-view').first().evaluate(
          (element) => getComputedStyle(element).outlineStyle,
        ),
        'dotted',
        'app universal selector did not reach page-scoped component nodes',
      )
      assert.equal(
        await render.locator('tiny-apply-shared-box tiny-text span:last-child').first().evaluate(
          (element) => getComputedStyle(element).outlineStyle,
        ),
        'none',
        'app page-scope selectors leaked into built-in internal DOM',
      )
      const verticalItems = await render.locator('#vertical-swiper tiny-swiper-item').evaluateAll(
        (elements) => elements.map((element) => {
          const rect = element.getBoundingClientRect()
          return { left: rect.left, top: rect.top }
        }),
      )
      assert.equal(verticalItems.length, 2, 'vertical swiper items did not render')
      assert.ok(verticalItems[1].top > verticalItems[0].top, 'vertical swiper item offset did not cross the component boundary')
      assert.equal(verticalItems[1].left, verticalItems[0].left, 'vertical swiper item retained a horizontal offset')
      assert.equal(await colorOf('parent escape'), 'rgb(12, 34, 56)', '^parent-class did not resolve parent scope')
      assert.equal(await colorOf('ancestor escape'), 'rgb(255, 0, 0)', '^^page-class did not resolve ancestor scope')
      const isolatedHostBorder = await render.locator('tiny-isolated-box').first().evaluate(
        (element) => getComputedStyle(element).borderLeftWidth,
      )
      assert.equal(isolatedHostBorder, '3px', ':host styles did not apply to the component host')
      const isolatedOutline = await byText(render, 'isolated color', { exact: true }).first().evaluate(
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
      await byText(render, 'Change value', { exact: true }).first().click()
      await waitForText('behavior-obs:second')
      await waitForText('box-obs:second')
      await waitForText('second:first')
    })

    await step('link and unlink component relations', async () => {
      currentStep = 'link and unlink component relations'
      await waitForText('parent-linked:1')
      await waitForText('child-linked:1')
      await byText(render, 'Toggle child', { exact: true }).first().click()
      await waitForText('parent-linked:0')
      assert.ok(!(await text()).includes('child-linked'), 'child relation was not unlinked')
    })

    await step('return to the P0 page', async () => {
      currentStep = 'return to the P0 page'
      await byText(render, 'Back', { exact: true }).first().click()
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
      assert.ok(paths.includes('pages/router/router'), 'router page state was not observed')
      assert.equal(paths.at(-1), 'pages/todos/todos', 'navigation back state was not observed')
      assert.equal(
        diagnostics.filter((item) => item.severity === 'error').length,
        0,
        'runtime reported a fatal diagnostic',
      )
    })

    await step('run WXS local events, change:prop and callMethod', async () => {
      currentStep = 'run WXS local events, change:prop and callMethod'
      await byText(render, 'WXS runtime', { exact: true }).first().click()
      await waitForText('WXS runtime')
      await waitForText('status: observe:2:none:state=object')
      await waitForText('probe-seen: observe-probe:2:none:1:computed=string')
      await render.locator('tiny-wxs-probe #fire').click()
      await waitForText('probe-seen: probe-event:2:1:call=1')
      // The service JS listener runs once; the render WXS dispatch must not
      // replay the event into the service.
      await waitForText('probe-js-count: 1')
      const probeWidth = await render.locator('tiny-wxs-probe #probe').evaluate(
        (element) => element.style.width,
      )
      assert.equal(probeWidth, '123px', 'WXS custom-event setStyle did not update the target')
      await render.locator('tiny-wxs-probe #probe').click()
      await waitForText('probe-seen: probe-tap:component-data')
      await render.locator('tiny-wxs-probe #probe-target-inner').click()
      await waitForText('probe-target: probe-target-inner/inner->probe-target-outer/outer')
      await render.locator('#target').click()
      await waitForText('status: tap:2:box')
      const targetStyle = await render.locator('#target').evaluate((element) => ({
        left: element.style.left,
        width: element.style.width,
      }))
      assert.equal(targetStyle.left, '12px', 'WXS setStyle did not update the local element')
      assert.equal(targetStyle.width, '10vw', 'WXS setStyle did not normalize rpx')
      await waitForText('state-status: state:1')
      await waitForText('computed-status: computed:128px')
      await render.locator('#target').click()
      await waitForText('state-status: state:2')
      await render.locator('#bubble-child').click()
      await waitForText('child-status: child')
      await waitForText('parent-status: parent')
      await render.locator('#stop-child').click()
      await waitForText('stop-status: stop')
      assert.ok(
        (await render.locator('#app').innerText()).includes('stop-parent-status: idle'),
        'catch/return false still reached the service parent',
      )
      await render.locator('#capture-child').click()
      await waitForText('capture-status: capture')
      await waitForText('capture-parent-status: capture-parent')
      await render.locator('#mut-inner').click()
      await waitForText('mut-status: inner')
      await render.locator('#mut-normal-child').click()
      await waitForText('mut-status: inner,normal-child,normal-parent')
      await render.locator('#target-inner').click()
      await waitForText('target-status: target:target-inner/inner->target-outer/outer')
      await waitForText('trait-probe: trait:PROBE:7:true:1')
      await waitForText('trait-relation: relation:CHILD')
      await setSliderValue(render.locator('tiny-slider').first(), 5)
      await waitForText('status: change:5')
      await render.locator('#dynamic').click()
      await waitForText('dynamic-status: wxs:2')
      await byText(render, 'Toggle dynamic handler', { exact: true }).first().click()
      await render.locator('#dynamic').click()
      await waitForText('dynamic-status: service')
      await byText(render, 'Toggle dynamic handler', { exact: true }).first().click()
      await render.locator('#dynamic').click()
      await waitForText('dynamic-status: wxs:2')
      await render.locator('#counter').click()
      await waitForText('counter-status: counter:1')
      await byText(render, 'Toggle counter handler', { exact: true }).first().click()
      await render.locator('#counter').click()
      await waitForText('counter-status: service')
      await byText(render, 'Toggle counter handler', { exact: true }).first().click()
      await render.locator('#counter').click()
      await waitForText('counter-status: counter:2')
      await byText(render, 'Bump value', { exact: true }).first().click()
      await waitForText('probe-seen: observe-probe:3:2:2:computed=string')
      await byText(render, 'Back', { exact: true }).first().click()
      await waitForText('Tiny Glass-easel P0')
    })

    await step('lock page scroll under catchtouchmove', async () => {
      currentStep = 'lock page scroll under catchtouchmove'
      await byText(render, 'Touch lock', { exact: true }).first().click()
      await waitForText('Touch lock probe')
      await render.evaluate(() => window.scrollTo(0, 200))
      await page.waitForTimeout(50)
      const before = await render.evaluate(() => window.scrollY)
      // Swipe the bare mask (above the sheet), where no inner scroller exists.
      await touchSwipe(render.locator('[class*="--mask"]').first(), 0.25, 0.05)
      await page.waitForTimeout(150)
      const after = await render.evaluate(() => window.scrollY)
      assert.equal(after, before, `page scrolled through catchtouchmove (${before} -> ${after})`)

      // The inner scroll-view must keep scrolling inside the locked mask.
      await touchSwipe(render.locator('[class*="--inner"]').first(), 0.8, 0.4)
      let innerTop = 0
      const innerDeadline = Date.now() + 2000
      while (Date.now() < innerDeadline && innerTop === 0) {
        const current = await text()
        innerTop = Number(/inner: (\d+)/.exec(current)?.[1] ?? 0)
        if (innerTop === 0) await page.waitForTimeout(50)
      }
      assert.ok(innerTop > 0, 'inner scroll-view did not scroll inside the locked mask')

      // Reload the host to get back to the P0 page; the probe intentionally
      // keeps the mask up so it does not need an in-app exit.
      await page.goto(appUrl(baseUrl, app), { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      render = await activeRender()
      await waitForText('Tiny Glass-easel P0')
    })

    await step('deliver onPageScroll from the render scroll container', async () => {
      currentStep = 'deliver onPageScroll from the render scroll container'
      await byText(render, 'Scroll page', { exact: true }).first().click()
      await waitForText('Scroll probe')
      const metrics = await render.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      }))
      assert.ok(
        metrics.scrollHeight > metrics.innerHeight + 200,
        `scroll page should be taller than the viewport (${metrics.scrollHeight} <= ${metrics.innerHeight})`,
      )
      await render.evaluate(() => window.scrollTo(0, 900))
      const deadline = Date.now() + STEP_TIMEOUT
      let lastText = ''
      let scrollTop = 0
      while (Date.now() < deadline) {
        lastText = await text()
        const match = /scroll: (\d+)/.exec(lastText)
        scrollTop = match ? Number(match[1]) : 0
        if (scrollTop > 0) break
        await page.waitForTimeout(50)
      }
      assert.ok(scrollTop > 0, `onPageScroll did not update page data: ${lastText}`)
      const windowScrollTop = await render.evaluate(() => Math.round(window.scrollY))
      assert.ok(
        Math.abs(windowScrollTop - scrollTop) <= 24,
        `page data scrollTop ${scrollTop} did not track window.scrollY ${windowScrollTop}`,
      )
    })

    await step('keep the console free of errors', async () => {
      currentStep = 'keep the console free of errors'
      assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(' | ')}`)
      assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(' | ')}`)
    })

    console.log('\n✅ [P0] browser acceptance passed.')
  } catch (error) {
    const failureDiagnostics = await page.evaluate(() => {
      const items = window.__tinyRuntime?.host?.diagnostics ?? []
      return items.filter((item) => item.severity === 'error').slice(-5)
    }).catch(() => [])
    const serviceState = await (async () => {
      const service = page.frames().find((frame) => frame.url().includes('/service.html'))
      if (!service) return null
      return service.evaluate(() => {
        const pages = globalThis.getCurrentPages?.() ?? []
        const last = pages[pages.length - 1]
        return {
          routes: pages.map((page) => page.route),
          probe: last?.data?.probe,
        }
      }).catch((cause) => String(cause))
    })()
    const hostState = await page.evaluate(() => {
      const frames = [...document.querySelectorAll('iframe.tiny-runtime-render-frame')].map((iframe) => ({
        pageId: iframe.dataset.pageId,
        state: iframe.dataset.state,
      }))
      return { activePageId: window.__tinyRuntime?.host?.activePage, frames }
    }).catch(() => null)
    const renderState = await render?.evaluate(() => ({
      pageRoots: document.querySelectorAll('tiny-page').length,
      labels: document.querySelectorAll('tiny-label').length,
      labelListeners: [...document.querySelectorAll('tiny-label')].map(
        (element) => element.__wxElement?._hostListeners?.length ?? 0,
      ),
      checkboxes: [...document.querySelectorAll('tiny-checkbox')].map((element) => ({
        checked: Boolean(element.__wxElement?.data?.checked),
        listeners: element.__wxElement?._hostListeners?.length ?? 0,
      })),
    })).catch(() => null)
    try {
      await fs.mkdir(path.dirname(failureShot), { recursive: true })
      await page.screenshot({ path: failureShot, fullPage: true })
    } catch {
      // Screenshots are best-effort diagnostics.
    }
    throw new Error(
      `Browser acceptance failed during "${currentStep}": ${error instanceof Error ? error.message : String(error)}` +
        `\nPage errors: ${pageErrors.join(' | ') || '(none)'}` +
        `\nConsole errors: ${consoleErrors.join(' | ') || '(none)'}` +
        `\nRuntime errors: ${JSON.stringify(failureDiagnostics)}` +
        `\nService state: ${JSON.stringify(serviceState)}` +
        `\nHost state: ${JSON.stringify(hostState)}` +
        `\nRender state: ${JSON.stringify(renderState)}` +
        `\nScreenshot: ${failureShot}`,
    )
  } finally {
    await page.close().catch(() => {})
  }
}

export async function runMiniProgramAcceptance({ baseUrl, app = 'mini', browser }) {
  const step = createStep('mini')
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
      await page.goto(appUrl(baseUrl, app), { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
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
      assert.equal(await render.locator('tiny-add-button').count(), 2, 'both add-button instances should render')
      assert.ok(body.includes('i am slot'), 'component slot content did not render')
      for (const selector of ['tiny-checkbox', 'tiny-slider', 'tiny-progress', 'tiny-switch', 'tiny-swiper', 'tiny-canvas']) {
        assert.ok((await render.locator(selector).count()) > 0, `missing rendered element: ${selector}`)
      }
      const legacyCanvas = render.locator('canvas[canvas-id="canvas"]').first()
      await waitForCanvasHandoff(render, 'canvas[canvas-id="canvas"]')
      await waitForCanvasStats(page, legacyCanvas, 100)
      const background = await render.locator('tiny-page').evaluate((element) => getComputedStyle(element).backgroundColor)
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
      const avatarLayer = await avatar.locator('div').first().evaluate((element) => {
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return { width: rect.width, height: rect.height, backgroundImage: style.backgroundImage }
      })
      assert.ok(avatarLayer.width > 0 && avatarLayer.height > 0, 'image background layer has no box')
      assert.ok(avatarLayer.backgroundImage.includes('url('), 'image background did not resolve')

    })

    await step('drive the existing todos page interactions', async () => {
      currentStep = 'drive the existing todos page interactions'
      await render.waitForFunction(() => {
        const layer = document.querySelector('tiny-image > div')
        return layer ? getComputedStyle(layer).backgroundImage.includes('url(') : false
      }, null, { timeout: STEP_TIMEOUT })
      assert.equal(await render.locator('tiny-label[class*="--todo-item"][class*="--checked"]').count(), 2, 'initial checked todos are wrong')

      await byText(render, 'Learning 小程序', { exact: true }).click()
      await render.waitForFunction(
        () => document.querySelectorAll('tiny-label[class*="--todo-item"][class*="--checked"]').length === 3,
        null,
        { timeout: STEP_TIMEOUT },
      )

      const componentButton = render.locator('tiny-add-button tiny-button').first()
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

      await render.locator('tiny-add-button').first().locator('tiny-button').first().click()
      await render.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('def'),
        null,
        { timeout: STEP_TIMEOUT },
      )

      await render.locator('tiny-switch').first().click()
      assert.ok(
        (await render.locator('tiny-switch [class*="-input-checked"]').count()) > 0,
        'switch did not render a checked branch',
      )
      // `type="checkbox"` switches use the reference checkbox visual.
      const switchCheckbox = await render.locator('tiny-switch .tiny-builtin-switch--tiny-checkbox-input').first().evaluate((element) => {
        const style = getComputedStyle(element)
        const check = getComputedStyle(element, '::before')
        return {
          tag: element.tagName.toLowerCase(),
          width: style.width,
          height: style.height,
          radius: style.borderTopLeftRadius,
          background: style.backgroundColor,
          fontFamily: check.fontFamily,
          fontSize: check.fontSize,
          content: check.content,
        }
      })
      assert.deepEqual(
        [switchCheckbox.tag, switchCheckbox.width, switchCheckbox.height, switchCheckbox.radius, switchCheckbox.background],
        ['div', '22px', '22px', '3px', 'rgb(255, 255, 255)'],
        'switch type=checkbox visual structure does not match WeChat',
      )
      assert.ok(switchCheckbox.fontFamily.includes('weui'), 'switch checkbox mark should use the weui font')
      assert.equal(switchCheckbox.fontSize, '22px', 'switch checkbox mark size mismatch')
      assert.notEqual(switchCheckbox.content, 'none', 'checked switch checkbox should draw its check glyph')

      await setSliderValue(render.locator('tiny-slider').nth(1), 1500)
      await setSliderValue(render.locator('tiny-slider').nth(2), 7000)
      // Touch coordinates quantize to about one CSS pixel, so these wide
      // ranges land within a few units of the requested value.
      await render.waitForFunction(
        () => {
          const values = [...document.querySelectorAll('tiny-slider')].map((element) => Number(element.getAttribute('value')))
          return Math.abs(values[1] - 1500) <= 5 && Math.abs(values[2] - 7000) <= 10
        },
        null,
        { timeout: STEP_TIMEOUT },
      )

      assert.ok(
        (await render.locator('tiny-radio [class*="tiny-radio-input-checked"]').count()) > 0,
        'radio is not checked',
      )
      assert.ok(
        (await render.locator('.tiny-builtin-icon--tiny-icon-success_no_circle').count()) > 0,
        'icon type was not applied',
      )

      const swiper = render.locator('tiny-swiper')
      assert.equal(
        await swiper.locator('.tiny-builtin-swiper--tiny-swiper-dot').count(),
        3,
        'swiper dots did not render',
      )
      await swiper.locator('.tiny-builtin-swiper--tiny-swiper-dot').nth(1).click()
      await render.waitForFunction(
        () => document.querySelector('.tiny-builtin-swiper--tiny-swiper-slide-frame')
          ?.getAttribute('style')?.includes('translate(-100%, 0'),
        null,
        { timeout: STEP_TIMEOUT },
      )
      // WeChat translates each swiper-item by its own index and keeps the
      // frame in place, so items must be absolutely positioned siblings.
      const swiperLayout = await swiper.evaluate((element) => {
        const wrapper = element.firstElementChild
        const slides = wrapper?.children[0]
        const frame = slides?.children[0]
        const items = [...element.querySelectorAll('tiny-swiper-item')]
        return {
          tree: [wrapper?.tagName.toLowerCase(), slides?.tagName.toLowerCase(), frame?.tagName.toLowerCase()],
          frameWidth: Math.round(frame?.getBoundingClientRect().width ?? 0),
          wrapperWidth: Math.round(wrapper?.getBoundingClientRect().width ?? 0),
          items: items.slice(0, 3).map((item) => ({
            transform: item.style.transform,
            position: getComputedStyle(item).position,
            width: Math.round(item.getBoundingClientRect().width),
          })),
        }
      })
      assert.deepEqual(swiperLayout.tree, ['div', 'div', 'div'], 'swiper structure does not match WeChat')
      assert.equal(swiperLayout.frameWidth, swiperLayout.wrapperWidth, 'swiper frame should fill the wrapper')
      assert.deepEqual(
        swiperLayout.items.map((item) => item.position),
        ['absolute', 'absolute', 'absolute'],
        'swiper items should be absolutely positioned like WeChat',
      )
      assert.ok(
        swiperLayout.items.every((item) => item.width === swiperLayout.frameWidth),
        'swiper items should fill the frame',
      )
      assert.ok(
        swiperLayout.items[1]?.transform.includes('100%'),
        'swiper items should be translated by their own index',
      )

      const animated = await render.evaluate(() => [...document.querySelectorAll('tiny-view, view')].some((element) => {
        const style = element.getAttribute('style') ?? ''
        return style.includes('transition: all') && getComputedStyle(element).transform !== 'none'
      }))
      assert.ok(animated, 'animation data did not produce a transform')
    })

    await step('render WXML import/include and named templates', async () => {
      currentStep = 'render WXML import/include and named templates'
      await render.locator('tiny-add-button').nth(1).locator('tiny-button').first().click()
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
      await render.locator('tiny-add-button').first().locator('tiny-button').first().click()
      await waitForText('Learning Javascript')
      const stateEvents = (await diagnostics()).filter((item) => item.code === 'RUNTIME_STATE')
      assert.equal(stateEvents.at(-1)?.details?.currentPage, 'pages/todos/todos', 'did not return to todos')
    })

    await step('render the ECharts page through the canvas bridge', async () => {
      currentStep = 'render the ECharts page through the canvas bridge'
      const previousRenderUrl = render.url()
      await byText(render, 'nav', { exact: true }).first().click()
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
      await page.goto(appUrl(baseUrl, app, { path: 'packageA/pages/c/c' }), {
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

    await step('replace an async component placeholder after loading its subpackage', async () => {
      currentStep = 'replace an async component placeholder after loading its subpackage'
      await page.goto(appUrl(baseUrl, app, { path: 'pages/add-todo/add-todo' }), {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const asyncRender = await activeRender()
      await asyncRender.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('lazy-ok'),
        null,
        { timeout: STEP_TIMEOUT },
      )
    })

    await step('boot an independent subpackage without the main package', async () => {
      currentStep = 'boot an independent subpackage without the main package'
      await page.goto(appUrl(baseUrl, app, { path: 'independent/pages/standalone/standalone' }), {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const independentRender = await activeRender()
      await independentRender.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('independent no-app'),
        null,
        { timeout: STEP_TIMEOUT },
      )
      const state = await page.evaluate(() => window.__tinyRuntime.host.diagnostics.filter(
        (item) => item.code === 'RUNTIME_STATE',
      ).at(-1))
      assert.equal(state?.details?.currentPage, 'independent/pages/standalone/standalone')
      const color = await independentRender.evaluate(
        () => getComputedStyle(document.querySelector('#standalone')).color,
      )
      assert.notEqual(color, 'rgb(1, 2, 3)')
    })

    await step('keep the example console free of errors', async () => {
      currentStep = 'keep the example console free of errors'
      assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(' | ')}`)
      assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(' | ')}`)
    })

    console.log('\n✅ [mini] acceptance passed.')
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
    await page.close().catch(() => {})
  }
}

export async function runWechatDemoAcceptance({ baseUrl, app = 'wechat-demo', browser }) {
  const step = createStep('wechat')
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
      await page.goto(appUrl(baseUrl, app, { path: 'page/component/index' }), { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
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
        const layers = [...document.querySelectorAll('tiny-image > div')]
          .filter((layer) => getComputedStyle(layer).backgroundImage.includes('resources/kind'))
        return layers.length > 0
          && layers.every((layer) => getComputedStyle(layer).backgroundImage !== 'none')
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
      await page.goto(appUrl(baseUrl, app, { path: 'packageComponent/pages/form/button/button' }), {
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

    await step('expose view aria roles', async () => {
      currentStep = 'expose view aria roles'
      await page.goto(appUrl(baseUrl, app, { path: 'packageComponent/pages/obstacle-free/aria-component/aria-component' }), {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      await render.waitForFunction(
        () => document.querySelector('tiny-view[aria-role="button"]')?.getAttribute('role') === 'button',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const view = render.locator('tiny-view[aria-role="button"]').first()
      assert.equal(await view.getAttribute('role'), 'button', 'view aria-role was not forwarded')
      assert.equal(await view.getAttribute('aria-label'), '提交表单', 'view aria-label was not forwarded')
    })

    await step('extend the text example', async () => {
      currentStep = 'extend the text example'
      await page.goto(appUrl(baseUrl, app, { path: 'packageComponent/pages/content/text/text' }), {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      await render.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('add line'),
        null,
        { timeout: STEP_TIMEOUT },
      )
      await byText(render, 'add line', { exact: true }).click()
      await render.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('2011年1月，微信1.0发布'),
        null,
        { timeout: STEP_TIMEOUT },
      )
      const textBody = await render.locator('#app').innerText()
      assert.ok(textBody.includes('微信1.0发布'), 'added text line did not render')
      await byText(render, 'remove line', { exact: true }).click()
      await render.waitForFunction(
        () => !(document.querySelector('#app')?.innerText ?? '').includes('2011年1月，微信1.0发布'),
        null,
        { timeout: STEP_TIMEOUT },
      )
    })

    await step('toggle autoplay in the swiper demo', async () => {
      currentStep = 'toggle autoplay in the swiper demo'
      await page.goto(appUrl(baseUrl, app, { path: 'packageComponent/pages/view/swiper/swiper' }), {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      await render.waitForFunction(
        () => document.querySelectorAll('tiny-radio').length >= 2,
        null,
        { timeout: STEP_TIMEOUT },
      )
      const autoplay = render.locator('tiny-radio').nth(1)
      assert.equal(
        await autoplay.locator('[class*="tiny-radio-input-checked"]').count(),
        0,
        'autoplay radio should start unchecked',
      )
      await autoplay.click()
      await render.waitForFunction(
        () => document.querySelectorAll('tiny-radio')[1]
          ?.querySelector('[class*="tiny-radio-input-checked"]') != null,
        null,
        { timeout: STEP_TIMEOUT },
      )
      await page.waitForTimeout(2300)
      const activeDot = await render.evaluate(() => {
        const dots = [...document.querySelectorAll('.tiny-builtin-swiper--tiny-swiper-dot')]
        return dots.findIndex((dot) => getComputedStyle(dot).backgroundColor === 'rgb(0, 0, 0)')
      })
      assert.notEqual(activeDot, 0, 'swiper autoplay did not advance after enabling it')
    })

    await step('render the radio demo', async () => {
      currentStep = 'render the radio demo'
      await page.goto(appUrl(baseUrl, app, { path: 'packageComponent/pages/form/radio/radio' }), {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      await render.waitForFunction(
        () => document.querySelectorAll('tiny-radio').length >= 2,
        null,
        { timeout: STEP_TIMEOUT },
      )
      const radio = render.locator('tiny-radio').nth(1)
      assert.equal(
        await radio.locator('[class*="tiny-radio-input-checked"]').count(),
        0,
        'second radio should start unchecked',
      )
      await radio.click()
      await render.waitForFunction(
        () => document.querySelectorAll('tiny-radio')[1]
          ?.querySelector('[class*="tiny-radio-input-checked"]') != null,
        null,
        { timeout: STEP_TIMEOUT },
      )
      // The checked radio uses the reference structure and WeUI check glyph.
      const radioVisual = await render.evaluate(() => {
        const radio = document.querySelectorAll('tiny-radio')[1]
        const visual = radio?.querySelector('[class*="radio-input"]')
        if (!visual) return null
        const style = getComputedStyle(visual)
        const check = getComputedStyle(visual, '::before')
        return {
          tag: visual.tagName.toLowerCase(),
          width: style.width,
          radius: style.borderTopLeftRadius,
          background: style.backgroundColor,
          fontFamily: check.fontFamily,
          fontSize: check.fontSize,
          content: check.content,
        }
      })
      assert.deepEqual(
        [radioVisual?.tag, radioVisual?.width, radioVisual?.radius, radioVisual?.background],
        ['div', '22px', '50%', 'rgb(9, 187, 7)'],
        'radio visual structure does not match WeChat',
      )
      assert.ok(radioVisual?.fontFamily.includes('weui'), 'radio check glyph should use the weui font')
      assert.equal(radioVisual?.fontSize, '18px', 'radio check glyph size mismatch')
      assert.notEqual(radioVisual?.content, 'none', 'checked radio should draw its check glyph')
    })

    await step('render an API example page', async () => {
      currentStep = 'render an API example page'
      await page.goto(appUrl(baseUrl, app, { path: 'packageAPI/pages/storage/storage/storage' }), {
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

    await step('navigate with a built-in navigator', async () => {
      currentStep = 'navigate with a built-in navigator'
      await page.goto(appUrl(baseUrl, app, { path: 'packageComponent/pages/nav/navigator/navigator' }), {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      await render.waitForFunction(
        () => document.querySelectorAll('tiny-navigator').length > 0,
        null,
        { timeout: STEP_TIMEOUT },
      )
      const framesBefore = await page.locator('iframe.tiny-runtime-render-frame').count()
      // The first navigator is `open-type="navigate"` with a relative url.
      await render.locator('tiny-navigator').first().click()
      await page.waitForFunction(() => {
        const state = window.__tinyRuntime?.host?.diagnostics
          ?.filter((item) => item.code === 'RUNTIME_STATE').at(-1)
        return state?.details?.currentPage === 'packageComponent/pages/nav/navigator/navigate'
      }, null, { timeout: STEP_TIMEOUT })
      await page.waitForTimeout(200)
      const framesAfter = await page.locator('iframe.tiny-runtime-render-frame').count()
      assert.equal(framesAfter, framesBefore + 1, 'navigate did not push a render page')
      assert.equal(pageErrors.length, 0, `page errors after navigator tap: ${pageErrors.join(' | ')}`)
    })

    await step('drag a view from a WXS handler', async () => {
      currentStep = 'drag a view from a WXS handler'
      await page.goto(appUrl(baseUrl, app, { path: 'packageAPI/pages/framework/wxs/movable' }), {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForFunction(() => Boolean(window.__tinyRuntime), null, { timeout: STEP_TIMEOUT })
      const render = await activeRender()
      await render.waitForFunction(
        () => Boolean(document.querySelector('[class*="--movable"]')),
        null,
        { timeout: STEP_TIMEOUT },
      )
      const position = () => render.evaluate(() => {
        const element = document.querySelector('[class*="--movable"]')
        if (!element) return ''
        const style = getComputedStyle(element)
        return `${style.left}/${style.top}`
      })
      assert.equal(await position(), '50px/50px', 'movable did not start at its WXML position')
      // The demo binds touch handlers from a WXS module; the handler receives
      // the component descriptor (`ins`) and moves the node with setStyle.
      await render.evaluate(() => {
        const element = document.querySelector('[class*="--movable"]')
        const touch = (x, y) => new Touch({
          identifier: 1,
          target: element,
          clientX: x,
          clientY: y,
          pageX: x,
          pageY: y,
        })
        const fire = (type, x, y) => element.dispatchEvent(new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          touches: [touch(x, y)],
          targetTouches: [touch(x, y)],
          changedTouches: [touch(x, y)],
        }))
        fire('touchstart', 100, 100)
        fire('touchmove', 130, 120)
        fire('touchend', 130, 120)
      })
      await render.waitForFunction(
        () => getComputedStyle(document.querySelector('[class*="--movable"]')).left === '80px',
        null,
        { timeout: STEP_TIMEOUT },
      )
      assert.equal(await position(), '80px/70px', 'WXS setStyle did not move the node by the drag delta')
      const style = await render.evaluate(
        () => document.querySelector('[class*="--movable"]')?.getAttribute('style') ?? '',
      )
      assert.ok(style.includes('position: absolute'), 'WXS setStyle replaced the WXML inline style')
      assert.equal(pageErrors.length, 0, `WXS drag raised page errors: ${pageErrors.join(' | ')}`)
    })

    await step('run the canvas 2D node example', async () => {
      currentStep = 'run the canvas 2D node example'
      await page.goto(appUrl(baseUrl, app, { path: 'packageComponent/pages/canvas/canvas-2d/canvas-2d' }), {
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
      await page.goto(appUrl(baseUrl, app, { path: 'packageComponent/pages/canvas/webgl/webgl' }), {
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

    console.log('\n✅ [wechat] acceptance passed.')
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
    await page.close().catch(() => {})
  }
}

export async function runTaroAcceptance({ baseUrl, app = 'todo', browser }) {
  const step = createStep('taro')
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
      await page.goto(appUrl(baseUrl, app, { path: 'pages/index/index' }), { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
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
      await render.waitForFunction(
        () => document.querySelector('input[placeholder="What needs to be done?"]')?.value === '',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const taroInputState = await input.evaluate((element) => ({
        value: element.value,
        selectionStart: element.selectionStart,
        active: document.activeElement === element,
      }))
      assert.equal(taroInputState.value, '', 'Taro input retained the submitted value')
      assert.equal(taroInputState.active, true, 'Taro input lost focus after Enter')
      assert.equal(taroInputState.selectionStart, 0, 'Taro input caret was not reset with the value')
    })

    await step('toggle and filter Taro todos', async () => {
      currentStep = 'toggle and filter Taro todos'
      await render.locator('tiny-checkbox').first().click()
      await waitForText('1 item left')
      await byText(render, 'Active', { exact: true }).click()
      await waitForText('Taro item')
      await byText(render, 'Completed', { exact: true }).click()
      await waitForText('Use Redux')
      // Rebuilding the filtered list recreates the checkbox nodes; the
      // completed item must still render as checked.
      const checkedCompleted = await render.evaluate(() =>
        [...document.querySelectorAll('tiny-checkbox')]
          .filter((box) => box.querySelector('[class*="checkbox-input"]')?.className.includes('tiny-checkbox-input-checked')).length,
      )
      assert.equal(checkedCompleted, 1, 'completed Taro todo lost its checked state after switching tabs')
    })

    await step('clear completed Taro todos', async () => {
      currentStep = 'clear completed Taro todos'
      await byText(render, 'Clear completed', { exact: true }).click()
      await byText(render, 'All', { exact: true }).click()
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

    console.log('\n✅ [taro] acceptance passed.')
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
    await page.close().catch(() => {})
  }
}

export async function runDevtoolAcceptance({ baseUrl, browser }) {
  const step = createStep('devtool')
  // `hasTouch` lets the echarts canvas step drive a real touch sequence; the
  // mobile gate still keys off the user agent only.
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, hasTouch: true })
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
    // The launcher ships every fixture; only the CI-built public site hides
    // the local-only P0 demo.
    const fixtures = discoverTestApps()
    assert.ok(fixtures.length > 0, 'no tests/apps fixtures were discovered')
    const expectedText = {
      demo: 'Tiny Glass-easel P0',
      mini: 'Learning Javascript',
      todo: 'Use Redux',
      'wechat-demo': '视图容器',
      echarts: '柱状图',
      vant: 'Vant Weapp',
      weui: 'WeUI 是一套同微信原生视觉体验一致的',
      'custom-tab': 'Custom Tab home',
      'wechat-parity': 'PAGE: A:1',
    }
    const imageFixtures = new Set(['mini', 'wechat-demo', 'echarts'])
    const fixtureById = new Map(fixtures.map((fixture) => [fixture.id, fixture]))
    // Exercise host navigation against the first launcher entry (mini).
    const primary = fixtureById.get('mini')
    assert.ok(primary, 'tests/apps/mini is required for the devtool flow')
    const state = () => page.evaluate(() => window.__tinyDevtool.getState())
    const waitForStatus = (status) => page.waitForFunction(
      (expected) => window.__tinyDevtool?.getState().status === expected,
      status,
      { timeout: STEP_TIMEOUT },
    )
    // `navigate()`/`launch()` inspect the element tree once, right after the
    // page becomes active; the first patch can still be in flight, so the
    // panel may hold an empty tree until the next action. Re-inspect while
    // waiting for the expected content instead of racing a single snapshot.
    const waitForTree = (needle) => page.waitForFunction(
      async (expected) => {
        await window.__tinyDevtool?.inspectTree?.()
        const tree = window.__tinyDevtool?.getState().tree
        if (!tree) return false
        return expected === null || JSON.stringify(tree).includes(expected)
      },
      needle ?? null,
      { timeout: STEP_TIMEOUT, polling: 200 },
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
      (frame) => frame.url().includes('render.html')
        && frame.url().includes(`app=${appId}`)
        && frame.url().includes(`pageId=${pageId}`),
    )
    const waitForActiveRenderFrame = async (appId, pageId) => {
      await page.waitForSelector(
        `.td-app-surface[data-app-id="${appId}"] iframe[data-page-id="${pageId}"][data-state="active"]`,
        { timeout: STEP_TIMEOUT },
      )
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const frame = activeRenderFrame(appId, pageId)
        if (frame) return frame
        await page.waitForTimeout(50)
      }
      return undefined
    }
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
      await openFixture(primary)
      assert.equal((await managerState()).active, primary.id)
      assert.equal(await page.locator('.td-launcher').count(), 0, 'launcher stayed visible after launch')
      assert.equal(
        await page.evaluate(() => new URL(window.location.href).searchParams.get('app')),
        primary.id,
        'launch did not update the URL',
      )
      assert.equal(await page.locator('iframe[data-page-id]').count(), 1)
      assert.equal(pageErrors.length, 0, `page errors during boot: ${pageErrors.join(' | ')}`)
    })

    await step('project runtime state into the debugger', async () => {
      currentStep = 'project runtime state into the debugger'
      await waitForTree('Learning Javascript')
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
      assert.equal(current.tree.tag, 'tiny-page')
      assert.ok(
        JSON.stringify(current.tree).includes('Learning Javascript'),
        'element tree does not contain rendered text',
      )
      assert.ok(
        JSON.stringify(current.tree).includes('tiny-view'),
        'element tree does not contain nested page views',
      )
      // The host bar shows the effective page title (`pages/todos/todos.json`).
      assert.equal(
        await page.locator('.td-nav-title').innerText(),
        'Index',
        'host navigation bar did not project the page title',
      )
      assert.equal(
        await page.getByRole('button', { name: 'Back in preview' }).isDisabled(),
        true,
        'host navigation back should be disabled on the first page',
      )
      assert.equal(
        await page.locator('.td-tabs [role="tab"]').count(),
        3,
        'console/lifecycle/elements tabs are missing',
      )
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
        (await page.getByRole('tabpanel').innerText()).includes('tiny-page'),
        'element tree is not rendered in the debug panel',
      )
    })

    await step('apply navigation bar runtime mutations', async () => {
      currentStep = 'apply navigation bar runtime mutations'
      const service = page.frames().find((frame) => (
        frame.url().includes('service.html') && frame.url().includes(`app=${primary.id}`)
      ))
      assert.ok(service, 'service frame is missing')
      await service.evaluate(() => {
        wx.setNavigationBarTitle({ title: 'Runtime title' })
        wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#112233' })
        wx.showNavigationBarLoading()
      })
      await page.waitForFunction(
        () => document.querySelector('.td-nav-title')?.textContent === 'Runtime title',
        null,
        { timeout: STEP_TIMEOUT },
      )
      assert.equal(await page.locator('.td-nav-loading').count(), 1, 'loading indicator is missing')
      const chromeColor = await page.locator('.td-host-navbar').first().evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      )
      assert.equal(chromeColor, 'rgb(17, 34, 51)', 'navigation background did not update')
      await service.evaluate(() => wx.hideNavigationBarLoading())
      await page.waitForFunction(
        () => !document.querySelector('.td-nav-loading'),
        null,
        { timeout: STEP_TIMEOUT },
      )
    })

    await step('open the share sheet and invoke the page callback', async () => {
      currentStep = 'open the share sheet and invoke the page callback'
      await page.getByRole('button', { name: 'Host controls' }).click()
      await page.getByRole('menuitem', { name: 'Share' }).click()
      const sheet = page.getByRole('dialog', { name: 'Share mini program page' })
      assert.equal(await sheet.count(), 1, 'share sheet did not open')
      await sheet.getByRole('button', { name: /发送给朋友/ }).click()
      await page.waitForFunction(
        () => document.querySelector('.td-share-result')?.textContent?.includes('Tiny todos'),
        null,
        { timeout: STEP_TIMEOUT },
      )
      await sheet.getByRole('button', { name: 'Close share sheet' }).click()
      assert.equal(await sheet.count(), 0, 'share sheet did not close')
    })

    await step('honor showShareMenu and hideShareMenu in the chrome menu', async () => {
      currentStep = 'honor showShareMenu and hideShareMenu in the chrome menu'
      const service = page.frames().find((frame) => (
        frame.url().includes('service.html') && frame.url().includes(`app=${primary.id}`)
      ))
      assert.ok(service, 'service frame is missing')
      await service.evaluate(() => wx.hideShareMenu())
      await page.getByRole('button', { name: 'Host controls' }).click()
      assert.equal(
        await page.getByRole('menuitem', { name: 'Share' }).count(),
        0,
        'hideShareMenu did not hide the Share item',
      )
      await page.getByRole('button', { name: 'Host controls' }).click()
      await service.evaluate(() => wx.showShareMenu())
      await page.getByRole('button', { name: 'Host controls' }).click()
      assert.equal(
        await page.getByRole('menuitem', { name: 'Share' }).count(),
        1,
        'showShareMenu did not restore the Share item',
      )
      await page.getByRole('button', { name: 'Host controls' }).click()
    })

    await step('show and hide the pull-down refresh indicator', async () => {
      currentStep = 'show and hide the pull-down refresh indicator'
      const service = page.frames().find((frame) => (
        frame.url().includes('service.html') && frame.url().includes(`app=${primary.id}`)
      ))
      assert.ok(service, 'service frame is missing')
      await service.evaluate(() => wx.startPullDownRefresh())
      await page.waitForSelector('.td-pull-refresh', { state: 'visible', timeout: STEP_TIMEOUT })
      await service.evaluate(() => wx.stopPullDownRefresh())
      await page.waitForSelector('.td-pull-refresh', { state: 'detached', timeout: STEP_TIMEOUT })
    })

    await step('render the mini program inside the debugger', async () => {
      currentStep = 'render the mini program inside the debugger'
      const primarySurface = surfaceSelector(primary.id)
      assert.equal(
        await page.locator(`${primarySurface} iframe[data-page-id]`).count(),
        1,
        'the first page should own exactly one render iframe',
      )
      assert.equal(
        await page.locator(`${primarySurface} iframe[data-page-id="page-1"]`).getAttribute('data-state'),
        'active',
      )
      const renderFrame = page.frameLocator(`${primarySurface} iframe[data-page-id="page-1"]`)
      const body = await renderFrame.locator('#app').innerText()
      assert.ok(body.includes('Learning Javascript'), 'mini program did not render in the debugger')
      assert.ok(body.includes('tiny Todo List'), 'page data did not render in the debugger')
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
      const primarySurface = surfaceSelector(primary.id)
      await page.locator('input[placeholder="pages/..."]').fill('/pages/add-todo/add-todo')
      await page.getByText('Navigate', { exact: true }).click()
      await page.waitForFunction(
        () => window.__tinyDevtool.getState().currentPage === 'pages/add-todo/add-todo',
        null,
        { timeout: STEP_TIMEOUT },
      )
      assert.deepEqual((await state()).pageStack, ['page-1', 'page-2'])
      await waitForTree('Add Todo')
      await page.waitForSelector(`${primarySurface} iframe[data-page-id="page-2"][data-state="active"]`, {
        timeout: STEP_TIMEOUT,
      })
      assert.equal(
        await page.locator(primarySurface).getAttribute('data-transition'),
        'forward',
        'navigateTo did not mark a forward page transition',
      )
      // The previous page keeps its own iframe and DOM while it is hidden.
      assert.equal(
        await page.locator(`${primarySurface} iframe[data-page-id="page-1"]`).getAttribute('data-state'),
        'hidden',
      )
      const previousFrame = page.frameLocator(`${primarySurface} iframe[data-page-id="page-1"]`)
      assert.ok(
        (await previousFrame.locator('#app').innerText()).includes('Learning Javascript'),
        'hidden page lost its rendered DOM',
      )
      const nextFrame = page.frameLocator(`${primarySurface} iframe[data-page-id="page-2"]`)
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
      assert.equal(
        await page.locator(primarySurface).getAttribute('data-transition'),
        'back',
        'navigateBack did not mark a back page transition',
      )
      await page.waitForFunction(
        (selector) => !document.querySelector(`${selector} iframe[data-page-id="page-2"]`),
        primarySurface,
        { timeout: STEP_TIMEOUT },
      )
      assert.deepEqual((await state()).pageStack, ['page-1'])
      assert.equal(
        await page.locator(`${primarySurface} iframe[data-page-id="page-1"]`).getAttribute('data-state'),
        'active',
      )
      const restoredFrame = activeRenderFrame(primary.id, 'page-1')
      assert.ok(restoredFrame, 'restored page render frame was not found')
      const checkedLabels = 'tiny-label[class*="--todo-item"][class*="--checked"]'
      assert.equal(await restoredFrame.locator(checkedLabels).count(), 2, 'restored page lost its initial state')
      await byText(restoredFrame, 'Learning 小程序', { exact: true }).click()
      await restoredFrame.waitForFunction(
        (selector) => document.querySelectorAll(selector).length === 3,
        checkedLabels,
        { timeout: STEP_TIMEOUT },
      )
    })

    await step('preview every fixture and keep the three most recent warm', async () => {
      currentStep = 'preview every fixture and keep the three most recent warm'
      await ensureLauncher()
      assert.deepEqual(await sessionIds(), [primary.id])
      await page.waitForFunction(
        () => document.querySelector('.td-warm-count')?.textContent === '1 / 3 warm',
        null,
        { timeout: STEP_TIMEOUT },
      )

      for (const fixture of fixtures) {
        currentStep = `preview tests/apps/${fixture.id}`
        await openFixture(fixture)
        currentStep = `preview ${fixture.id}: wait for ${fixture.firstPage}`
        await page.waitForFunction(
          (expectedPage) => window.__tinyDevtool?.getState().currentPage === expectedPage,
          fixture.firstPage,
          { timeout: STEP_TIMEOUT },
        )

        const needle = expectedText[fixture.id]
        await waitForTree(needle)

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
            const layers = [...document.querySelectorAll('tiny-image > div')]
            const images = [...document.querySelectorAll('img')]
              .filter((image) => image.complete && image.naturalWidth > 0)
            return (layers.length > 0
              && layers.every((layer) => getComputedStyle(layer).backgroundImage !== 'none'))
              || images.length > 0
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

        if (fixture.id === 'vant') {
          // Vant's overlay/popup path combines two host contracts: WXS
          // `.constructor` reads and external classes that arrive after the
          // transition's root view is inserted.
          currentStep = 'preview vant: open a popup'
          await page.locator('input[placeholder="pages/..."]').fill('/pages/popup/index')
          await page.getByText('Navigate', { exact: true }).click()
          await page.waitForFunction(
            () => window.__tinyDevtool?.getState().currentPage === 'pages/popup/index',
            null,
            { timeout: STEP_TIMEOUT },
          )
          const popupPageId = (await state()).pageStack.at(-1)
          const popupFrame = await waitForActiveRenderFrame(fixture.id, popupPageId)
          assert.ok(popupFrame, 'vant popup page did not create a render frame')
          await popupFrame.locator('tiny-van-cell').first().click()
          const popupMetrics = await popupFrame.waitForFunction(() => {
            const popup = document.querySelector('tiny-van-popup')
            const popupView = popup?.querySelector(':scope > tiny-view')
            const overlayView = popup?.querySelector('tiny-van-overlay tiny-view')
            if (!popupView || !overlayView) return false
            const popupRect = popupView.getBoundingClientRect()
            const overlayRect = overlayView.getBoundingClientRect()
            if (popupRect.width < 100 || overlayRect.width < 300) return false
            return {
              popupClass: popupView.className,
              popupStyle: popupView.getAttribute('style') ?? '',
              popupRect: popupRect.toJSON(),
              overlayClass: overlayView.className,
              overlayPosition: getComputedStyle(overlayView).position,
              overlayRect: overlayRect.toJSON(),
              viewport: { width: window.innerWidth, height: window.innerHeight },
            }
          }, null, { timeout: STEP_TIMEOUT })
          const metrics = await popupMetrics.jsonValue()
          assert.ok(metrics.popupClass.includes('van-popup--center'), 'van-popup lost its center modifier')
          assert.ok(metrics.popupStyle.includes('z-index'), 'van-popup lost its WXS-computed style')
          assert.ok(metrics.overlayClass.includes('van-overlay'), 'van-overlay lost its external class')
          assert.equal(metrics.overlayPosition, 'fixed', 'van-overlay is not fixed')
          assert.ok(
            Math.abs(metrics.overlayRect.width - metrics.viewport.width) < 2
              && Math.abs(metrics.overlayRect.height - metrics.viewport.height) < 2,
            'van-overlay does not cover the viewport',
          )
          assert.ok(
            Math.abs(metrics.popupRect.x + metrics.popupRect.width / 2 - metrics.viewport.width / 2) < 2
              && Math.abs(metrics.popupRect.y + metrics.popupRect.height / 2 - metrics.viewport.height / 2) < 2,
            'van-popup is not centered',
          )
        }

        if (fixture.id === 'weui') {
          // The WeUI footer logo carries an inline `width: 84px; height: 19px`.
          // The image component must not reset host dimensions it does not own.
          const footerLogo = renderFrame.locator('.page__ft tiny-image').first()
          await footerLogo.waitFor({ state: 'attached', timeout: STEP_TIMEOUT })
          const logoBox = await footerLogo.evaluate((element) => {
            const rect = element.getBoundingClientRect()
            return { width: rect.width, height: rect.height }
          })
          assert.ok(
            Math.abs(logoBox.width - 84) < 1 && Math.abs(logoBox.height - 19) < 1,
            `weui footer image lost its inline size: ${logoBox.width}x${logoBox.height}`,
          )
        }

        if (fixture.id === 'echarts') {
          // The legend lives on a `<canvas>`, so toggling it is the only
          // acceptance path that sends a built-in touch event over the bridge.
          // It regressed twice: live `TouchList` values in the detail made the
          // bridge drop the handler call, and the mouse projection lost the
          // canvas-relative coordinates the chart needs.
          currentStep = 'preview echarts: toggle the canvas legend'
          await page.locator('input[placeholder="pages/..."]').fill('/pages/bar/index')
          await page.getByText('Navigate', { exact: true }).click()
          await page.waitForFunction(
            () => window.__tinyDevtool?.getState().currentPage === 'pages/bar/index',
            null,
            { timeout: STEP_TIMEOUT },
          )
          const barPageId = (await state()).pageStack.at(-1)
          const barFrame = await waitForActiveRenderFrame(fixture.id, barPageId)
          assert.ok(barFrame, 'echarts bar page did not create a render frame')
          await barFrame.waitForSelector('canvas', { timeout: STEP_TIMEOUT })

          const serviceFrame = page.frames().find((frame) => (
            frame.url().includes('service.html') && frame.url().includes(`app=${fixture.id}`)
          ))
          assert.ok(serviceFrame, 'echarts service frame is missing')
          const legendSelected = () => serviceFrame.evaluate(() => {
            const pages = globalThis.getCurrentPages?.() ?? []
            const chart = pages[pages.length - 1]?.selectComponent?.('#mychart-dom-bar')?.chart
            return chart?.getOption().legend?.[0]?.selected ?? null
          })
          const legendPoint = (label) => serviceFrame.evaluate((name) => {
            const pages = globalThis.getCurrentPages?.() ?? []
            const chart = pages[pages.length - 1]?.selectComponent?.('#mychart-dom-bar')?.chart
            const text = (chart?.getZr?.().storage.getDisplayList() ?? [])
              .find((element) => element.style?.text === name)
            if (!text) return null
            const rect = text.getBoundingRect()
            const transform = text.getComputedTransform?.() ?? [1, 0, 0, 1, 0, 0]
            const localX = rect.x + rect.width / 2
            const localY = rect.y + rect.height / 2
            return {
              x: localX * transform[0] + localY * transform[2] + transform[4],
              y: localX * transform[1] + localY * transform[3] + transform[5],
            }
          }, label)
          const waitForLegendToggle = (label) => serviceFrame.waitForFunction((name) => {
            const pages = globalThis.getCurrentPages?.() ?? []
            const chart = pages[pages.length - 1]?.selectComponent?.('#mychart-dom-bar')?.chart
            return chart?.getOption().legend?.[0]?.selected?.[name] === false
          }, label, { timeout: STEP_TIMEOUT })

          await serviceFrame.waitForFunction(() => {
            const pages = globalThis.getCurrentPages?.() ?? []
            const chart = pages[pages.length - 1]?.selectComponent?.('#mychart-dom-bar')?.chart
            const list = chart?.getZr?.().storage.getDisplayList() ?? []
            return list.some((element) => element.style?.text === '热度')
          }, null, { timeout: STEP_TIMEOUT })
          assert.deepEqual(await legendSelected(), {}, 'echarts legend did not start fully selected')

          const hotPoint = await legendPoint('热度')
          const positivePoint = await legendPoint('正面')
          assert.ok(hotPoint && positivePoint, 'echarts legend items were not rendered')
          const frameBox = await page.locator(`${surface} iframe[data-page-id="${barPageId}"]`).boundingBox()
          assert.ok(frameBox, 'echarts render frame has no bounding box')

          // PC mode: the devtool projects mouse input into the touch sequence.
          await page.mouse.click(frameBox.x + hotPoint.x, frameBox.y + hotPoint.y)
          await waitForLegendToggle('热度')
          assert.equal(
            consoleErrors.length,
            0,
            `echarts mouse legend toggle reported: ${consoleErrors.join(' | ')}`,
          )

          // Mobile mode: a real touch must deliver the handler once. A double
          // dispatch (raw DOM projection plus the built-in's normalized event)
          // would toggle the item back on and time out above.
          await page.touchscreen.tap(frameBox.x + positivePoint.x, frameBox.y + positivePoint.y)
          await waitForLegendToggle('正面')
          assert.equal(
            consoleErrors.length,
            0,
            `echarts touch legend toggle reported: ${consoleErrors.join(' | ')}`,
          )
          const selected = await legendSelected()
          assert.equal(selected?.['热度'], false, 'echarts mouse toggle did not stick')
          assert.equal(selected?.['正面'], false, 'echarts touch toggle did not stick')
          assert.notEqual(selected?.['负面'], false, 'echarts toggled an untouched series')

          // Chart pages share the canvas template. Mounting a second chart page
          // must not re-run the previous page's component `ready` (which would
          // repaint that chart into the new page's canvas).
          const canvasImage = (selector) => serviceFrame.evaluate((sel) => {
            const pages = globalThis.getCurrentPages?.() ?? []
            return pages[pages.length - 1]?.selectComponent?.(sel)?.canvasNode?.toDataURL?.() ?? null
          }, selector)
          const openChartPage = async (label, route, type, selector) => {
            const stack = (await state()).pageStack
            const indexFrame = await waitForActiveRenderFrame(fixture.id, stack.at(-1))
            assert.ok(indexFrame, 'echarts index page frame is missing')
            await indexFrame.locator('.chart-with-img', { hasText: label }).locator('tiny-image').click()
            await page.waitForFunction(
              (expected) => window.__tinyDevtool?.getState().currentPage === expected,
              `pages/${route}/index`,
              { timeout: STEP_TIMEOUT },
            )
            await serviceFrame.waitForFunction(({ selector: sel, expectedType }) => {
              const pages = globalThis.getCurrentPages?.() ?? []
              const chart = pages[pages.length - 1]?.selectComponent?.(sel)?.chart
              return chart?.getOption?.().series?.[0]?.type === expectedType
            }, { selector, expectedType: type }, { timeout: STEP_TIMEOUT })
            // Let the entry animation settle so the snapshot is stable.
            await page.waitForTimeout(1500)
            return canvasImage(selector)
          }
          const backToIndex = async () => {
            await page.getByRole('button', { name: 'Back in preview' }).click()
            await page.waitForFunction(
              () => window.__tinyDevtool?.getState().currentPage === 'pages/index/index',
              null,
              { timeout: STEP_TIMEOUT },
            )
          }

          await backToIndex()
          const boxplotImage = await openChartPage('箱型图', 'boxplot', 'boxplot', '#mychart-dom-pie')
          await backToIndex()
          const sankeyImage = await openChartPage('桑基图', 'sankey', 'sankey', '#mychart-dom-sankey')
          assert.equal(
            pageErrors.length,
            0,
            `echarts chart pages reported: ${pageErrors.join(' | ')}`,
          )
          assert.ok(boxplotImage && sankeyImage, 'echarts chart pages did not paint their canvas')
          assert.notEqual(
            sankeyImage,
            boxplotImage,
            'echarts replayed the previous page chart into the new canvas',
          )
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

          currentStep = 'preview mini: switch to the Chart tab'
          await tabBar.getByRole('tab', { name: 'Chart' }).click()
          await page.waitForFunction(
            () => window.__tinyDevtool?.getState().currentPage === 'pages/bar/index',
            null,
            { timeout: STEP_TIMEOUT },
          )
          const barPageId = (await state()).pageStack.at(-1)
          await page.waitForFunction(
            ({ selector, pageId }) => document
              .querySelector(`${selector} iframe[data-page-id="${pageId}"]`)?.dataset.state === 'active',
            { selector: surface, pageId: barPageId },
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
          await page.frameLocator(`${surface} iframe[data-page-id="${barPageId}"]`).locator('#app')
            .waitFor({ state: 'attached', timeout: STEP_TIMEOUT })

          currentStep = 'preview mini: switch back to the Todos tab'
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
          assert.deepEqual(ids, ['mini', 'todo', 'wechat-demo'], 'LRU kept the wrong warm apps')
        }
        if (fixture.id === 'echarts') {
          assert.deepEqual(ids, ['echarts', 'todo', 'wechat-demo'], 'LRU kept the wrong warm apps')
        }
      }

      assert.deepEqual(
        await sessionIds(),
        fixtures.slice(-3).map((fixture) => fixture.id).sort(),
        'keepalive did not retain the three most recent apps',
      )
      const evictedRow = page.locator(
        `.td-launcher-main[aria-label$="${fixtures[0].label}"] .td-launcher-state`,
      )
      assert.equal(
        await evictedRow.innerText(),
        'Launch',
        'evicted app did not return to the Launch state',
      )
    })

    await step('render and switch a custom tabBar', async () => {
      currentStep = 'render and switch a custom tabBar'
      const customTab = fixtureById.get('custom-tab')
      assert.ok(customTab, 'tests/apps/custom-tab is required for the custom tabBar flow')
      await openFixture(customTab)
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().currentPage === 'pages/home/home',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const homePageId = (await state()).pageStack.at(-1)
      const homeFrame = await waitForActiveRenderFrame(customTab.id, homePageId)
      assert.ok(homeFrame, 'custom tabBar home page did not create a render frame')
      await homeFrame.waitForSelector('tiny-custom-tab-bar [data-index]', { timeout: STEP_TIMEOUT })
      assert.equal(
        await homeFrame.evaluate(() => {
          const tabBar = document.querySelector('tiny-custom-tab-bar')
          const pageRoot = document.querySelector('tiny-page')
          return Boolean(tabBar && pageRoot?.contains(tabBar))
        }),
        false,
        'custom tabBar rendered inside the page root',
      )
      assert.equal(
        await homeFrame.evaluate(() => {
          const tabBar = document.querySelector('tiny-custom-tab-bar')
          const tabRoot = document.querySelector('[data-tiny-tabbar-root]')
          return Boolean(tabBar && tabRoot?.contains(tabBar))
        }),
        true,
        'custom tabBar did not render in the independent tab root',
      )
      assert.equal(
        await homeFrame.locator('tiny-custom-tab-bar [data-index]').count(),
        2,
        'custom tabBar did not render two items',
      )
      await homeFrame.locator('tiny-custom-tab-bar [data-index="1"]').click()
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().currentPage === 'pages/settings/settings',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const settingsFrame = await waitForActiveRenderFrame(
        customTab.id,
        (await state()).pageStack.at(-1),
      )
      assert.ok(settingsFrame, 'custom tabBar settings page did not create a render frame')
      await settingsFrame.waitForFunction(
        () => (document.querySelector('#app')?.innerText ?? '').includes('Custom Tab settings'),
        null,
        { timeout: STEP_TIMEOUT },
      )
      const selectedIndex = (frame) => frame.evaluate(() => {
        const active = document.querySelector('tiny-custom-tab-bar [data-index].tiny-custom-tab-bar-index--custom-tab-item--active')
        return active?.getAttribute('data-index') ?? null
      })
      await settingsFrame.waitForFunction(
        () => document.querySelectorAll('tiny-custom-tab-bar [data-index]').length === 2,
        null,
        { timeout: STEP_TIMEOUT },
      )
      assert.equal(await selectedIndex(settingsFrame), '1', 'settings tabBar did not select the settings item')
      await settingsFrame.locator('tiny-custom-tab-bar [data-index="0"]').click()
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().currentPage === 'pages/home/home',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const homeAgain = await waitForActiveRenderFrame(customTab.id, (await state()).pageStack.at(-1))
      assert.ok(homeAgain, 'custom tabBar home page was not remounted')
      await homeAgain.waitForFunction(
        () => document.querySelectorAll('tiny-custom-tab-bar [data-index]').length === 2,
        null,
        { timeout: STEP_TIMEOUT },
      )
      assert.equal(await selectedIndex(homeAgain), '0', 'home tabBar kept the stale selected item')
    })

    await step('reload, close apps, and honor deep links', async () => {
      currentStep = 'reload, close apps, and honor deep links'
      await openFixture(primary)
      assert.equal((await managerState()).active, primary.id)
      const previousPageFrame = await page
        .locator(`${surfaceSelector(primary.id)} iframe[data-page-id]`)
        .first()
        .elementHandle()
      assert.ok(previousPageFrame, 'reload target has no page frame')
      await page.getByText('Reload', { exact: true }).click()
      // The toolbar handler starts reload asynchronously. Waiting only for the
      // current `running` state can observe the pre-reload snapshot and race the
      // teardown; wait for the old page frame to detach first.
      await page.waitForFunction(
        (frame) => !frame?.isConnected,
        previousPageFrame,
        { timeout: STEP_TIMEOUT },
      )
      await page.waitForFunction(
        () => {
          const current = window.__tinyDevtool?.getState()
          return current?.status === 'running'
            && current.pageStack.length === 1
            && current.pageStack[0] === 'page-1'
        },
        null,
        { timeout: STEP_TIMEOUT },
      )
      assert.deepEqual((await state()).pageStack, ['page-1'])

      await ensureLauncher()
      await waitForSession(primary.id, true)
      await openFixture(primary)
      assert.equal((await state()).currentPage, 'pages/todos/todos')

      await page.getByText('Close app', { exact: true }).click()
      await waitForLauncher()
      await waitForSession(primary.id, false)
      assert.equal(
        await page.locator(`${surfaceSelector(primary.id)} iframe`).count(),
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
      assert.equal(
        await page.locator('.td-host-navbar').count(),
        0,
        'custom nav app should own its navigation bar',
      )
      assert.equal(
        await page.locator('.td-statusbar').count(),
        1,
        'custom nav app should keep the host status bar',
      )
      assert.equal(
        await page.locator('.td-host-capsule').count(),
        1,
        'custom nav app should keep the native capsule',
      )
      const capsule = await page.locator('.td-host-capsule').evaluate((element) => {
        const screen = element.closest('.td-screen')
        if (!screen) return null
        const capsuleRect = element.getBoundingClientRect()
        const screenRect = screen.getBoundingClientRect()
        return {
          top: capsuleRect.top - screenRect.top,
          right: screenRect.right - capsuleRect.right,
          width: capsuleRect.width,
          height: capsuleRect.height,
        }
      })
      assert.deepEqual(capsule, {
        top: 48,
        right: 10,
        width: 87,
        height: 32,
      }, 'custom nav capsule does not match getMenuButtonBoundingClientRect')
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

      await page.goto(`${baseUrl}/?app=mini&maxPageStack=1`, {
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

    await step('restore the page stack after a debugger refresh', async () => {
      currentStep = 'restore the page stack after a debugger refresh'
      await page.goto(`${baseUrl}/?app=${primary.id}&maxPageStack=10&restore=1`, {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await waitForStatus('running')
      await page.locator('input[placeholder="pages/..."]').fill('/pages/add-todo/add-todo?from=restore')
      await page.getByText('Navigate', { exact: true }).click()
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().currentPage === 'pages/add-todo/add-todo',
        null,
        { timeout: STEP_TIMEOUT },
      )
      await page.reload({ waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().currentPage === 'pages/add-todo/add-todo',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const restored = await state()
      assert.deepEqual(restored.pageStack, ['page-1', 'page-2'])
      assert.equal(restored.pages.at(-1)?.query?.from, 'restore', 'page query was not restored')
      const addTodoFrame = await waitForActiveRenderFrame(primary.id, restored.pageStack.at(-1))
      assert.ok(addTodoFrame, 'restored add-todo page did not create a render frame')
      const inputSelector = 'input[placeholder="What needs to be done?"]'
      await addTodoFrame.waitForSelector(inputSelector, { timeout: STEP_TIMEOUT })
      const input = addTodoFrame.locator(inputSelector)
      await input.fill('persisted input')
      await page.waitForTimeout(50)
      await page.getByText('Reload', { exact: true }).click()
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().status !== 'running',
        null,
        { timeout: STEP_TIMEOUT },
      )
      await waitForStatus('running')
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().currentPage === 'pages/add-todo/add-todo',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const reloadedFrame = await waitForActiveRenderFrame(
        primary.id,
        (await state()).pageStack.at(-1),
      )
      assert.ok(reloadedFrame, 'reloaded add-todo page did not create a render frame')
      await reloadedFrame.waitForSelector(inputSelector, { timeout: STEP_TIMEOUT })
      assert.equal(
        await reloadedFrame.locator(inputSelector).inputValue(),
        'persisted input',
        'page data was not restored after debugger reload',
      )
      await page.reload({ waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
      await waitForStatus('running')
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().currentPage === 'pages/add-todo/add-todo',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const refreshedState = await state()
      assert.deepEqual(refreshedState.pageStack, ['page-1', 'page-2'])
      const refreshedFrame = await waitForActiveRenderFrame(
        primary.id,
        refreshedState.pageStack.at(-1),
      )
      assert.ok(refreshedFrame, 'browser-refreshed add-todo page did not create a render frame')
      await refreshedFrame.waitForSelector(inputSelector, { timeout: STEP_TIMEOUT })
      assert.equal(
        await refreshedFrame.locator(inputSelector).inputValue(),
        'persisted input',
        'saved page data was overwritten by a later runtime state update',
      )
      await page.getByText('Close app', { exact: true }).click()
      await waitForLauncher()

      await page.goto(`${baseUrl}/?app=${primary.id}&path=pages/add-todo/add-todo`, {
        waitUntil: 'domcontentloaded',
        timeout: STEP_TIMEOUT,
      })
      await waitForStatus('running')
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().currentPage === 'pages/add-todo/add-todo',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const exitStatePage = await state()
      const exitStatePageFrame = await waitForActiveRenderFrame(
        primary.id,
        exitStatePage.pageStack.at(-1),
      )
      assert.ok(exitStatePageFrame, 'direct add-todo page did not create a render frame')
      await exitStatePageFrame.waitForSelector(inputSelector, { timeout: STEP_TIMEOUT })
      await exitStatePageFrame.locator(inputSelector).fill('exit state only')
      await page.waitForTimeout(50)
      await page.getByRole('button', { name: 'Background app' }).click()
      await waitForLauncher()
      await page.waitForTimeout(50)
      await openFixture(primary)
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().currentPage === 'pages/add-todo/add-todo',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const savedExitState = await page.evaluate(() => window.__tinyDevtool.snapshotPageState())
      assert.equal(
        savedExitState.at(-1)?.savedExitState?.draft,
        'exit state only',
        `page did not save exit state on background: ${JSON.stringify(savedExitState)}`,
      )
      await page.getByText('Reload', { exact: true }).click()
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().status !== 'running',
        null,
        { timeout: STEP_TIMEOUT },
      )
      await waitForStatus('running')
      await page.waitForFunction(
        () => window.__tinyDevtool?.getState().currentPage === 'pages/add-todo/add-todo',
        null,
        { timeout: STEP_TIMEOUT },
      )
      const exitStateReloaded = await state()
      const exitStateReloadedFrame = await waitForActiveRenderFrame(
        primary.id,
        exitStateReloaded.pageStack.at(-1),
      )
      assert.ok(exitStateReloadedFrame, 'exit-state page did not recreate a render frame')
      await exitStateReloadedFrame.waitForSelector('.add-todo-show-exit-state', {
        timeout: STEP_TIMEOUT,
      })
      await exitStateReloadedFrame.locator('.add-todo-show-exit-state').click()
      await exitStateReloadedFrame.waitForSelector('.add-todo-exit-state', {
        state: 'attached',
        timeout: STEP_TIMEOUT,
      })
      await page.waitForTimeout(100)
      const restoredExitState = await exitStateReloadedFrame
        .locator('.add-todo-exit-state')
        .textContent()
      assert.ok(
        restoredExitState?.includes('exit state only'),
        `onLoad did not receive this.exitState after debugger reload: ${restoredExitState}`,
      )
      await page.getByText('Close app', { exact: true }).click()
      await waitForLauncher()
    })

    await step('keep the debugger console free of errors', async () => {
      currentStep = 'keep the debugger console free of errors'
      assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(' | ')}`)
      assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(' | ')}`)
    })

    console.log('\n✅ [devtool] acceptance passed.')
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
    await page.close().catch(() => {})
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
