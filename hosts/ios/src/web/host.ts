/**
 * Current iOS host orchestration.
 *
 * Planned follow-up: move this createTinyRuntime wiring, page stack,
 * render connector and host APIs into Swift so the WKWebView only owns page
 * rendering. See the "host 编排收敛到 Swift" section in ios/README.md.
 * The Bridge protocol, JSCore service engine and render entries stay as-is.
 */
import './host.css'

import { createTinyRuntime } from '@tiny/runtime'
import type { RuntimeDiagnostic, TinyRuntimeHost } from '@tiny/runtime'
import { createBrowserApiHandlers } from '@tiny/host-browser'
import {
  getInjectedConfig,
  postControl,
  postHostLog,
  tinyWindow,
} from './native'
import { createNativeServiceTransport } from './transport'
import { PageFrameConnector } from './pages'
import { readStorageSnapshot, storageApiHandlers } from './storage'
import { buildUIState } from './state'
import type { AppMeta, RuntimeStateDetails } from './state'

type NavigateResult = {
  pageId?: string
  path?: string
}

const injected = getInjectedConfig()
const appId = injected.appId || new URLSearchParams(window.location.search).get('app') || ''

let host: TinyRuntimeHost | undefined
let connector: PageFrameConnector | undefined
let meta: AppMeta | undefined
let currentPageId: string | undefined
let appVisible = true
let startPromise: Promise<void> | undefined
const pendingCanvasCommands: string[] = []

function errorMessage(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}\n${error.stack ?? ''}`
  return String(error)
}

function fail(error: unknown): void {
  const message = errorMessage(error)
  console.error('[tiny ios]', message)
  postControl({ type: 'error', message })
}

function publish(details: RuntimeStateDetails): void {
  if (!meta) return
  if (details.pageStack && details.pageStack.length > 0) {
    currentPageId = details.pageStack[details.pageStack.length - 1]
  }
  postControl({
    type: 'state',
    state: buildUIState(meta, details),
  })
}

function onDiagnostic(diagnostic: RuntimeDiagnostic): void {
  if (diagnostic.code === 'RUNTIME_STATE') {
    publish((diagnostic.details ?? {}) as RuntimeStateDetails)
    return
  }
  if (diagnostic.severity === 'error') {
    console.error(`[tiny ${diagnostic.source}] ${diagnostic.code}: ${diagnostic.message}`)
  } else if (diagnostic.severity === 'warning') {
    console.warn(`[tiny ${diagnostic.source}] ${diagnostic.code}: ${diagnostic.message}`)
  }
  if (diagnostic.severity === 'error' || diagnostic.severity === 'warning') {
    postControl({
      type: 'diagnostic',
      severity: diagnostic.severity,
      code: diagnostic.code,
      message: diagnostic.message,
    })
  }
}

async function invoke(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const handler = host?.apiRegistry.handlers[method]
  if (!handler) throw new Error(`host API ${method} is not available`)
  return await handler(params, { pageId: currentPageId })
}

async function setAppVisible(visible: boolean): Promise<void> {
  if (appVisible === visible) return
  appVisible = visible
  if (!host) return
  host.setAppVisible(visible)
  if (currentPageId) {
    await host.service.control('page', visible ? 'show' : 'hide', {}, { pageId: currentPageId })
  }
}

async function disposeRuntime(): Promise<void> {
  const current = host
  host = undefined
  connector?.dispose()
  connector = undefined
  currentPageId = undefined
  if (current) await current.close()
}

tinyWindow.__tinyCanvasCommand = (payload: string | Record<string, unknown>): void => {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload)
  if (!connector) {
    pendingCanvasCommands.push(text)
    if (pendingCanvasCommands.length > 128) pendingCanvasCommands.shift()
    return
  }
  try {
    const command = JSON.parse(text) as Record<string, unknown>
    connector.postToPage(
      typeof command.pageId === 'string' ? command.pageId : undefined,
      { type: 'tiny-ios-canvas', command },
    )
  } catch (error) {
    console.warn('[tiny ios] invalid canvas command', error)
  }
}

tinyWindow.__tinyHostConsole = (level: string, message: string): void => {
  const text = `[service] ${message}`
  if (level === 'error') console.error(text)
  else if (level === 'warn') console.warn(text)
  else console.log(text)
}

tinyWindow.__tinyHostCommand = async (command: Record<string, unknown>): Promise<unknown> => {
  switch (command?.type) {
    case 'back':
      return invoke('navigate.back', { delta: Number(command.delta ?? 1) })
    case 'switchTab':
      return invoke('navigate.switchTab', { index: Number(command.index) })
    case 'appVisible':
      await setAppVisible(Boolean(command.visible))
      return { ok: true }
    case 'dispose':
      await disposeRuntime()
      return { ok: true }
    default:
      throw new Error(`unknown host command: ${String(command?.type)}`)
  }
}

tinyWindow.__tinyServiceReady = (): void => {
  if (startPromise) return
  startPromise = start().catch(fail)
}

postControl({ type: 'hostReady' })

async function loadMeta(id: string): Promise<AppMeta> {
  if (!id) throw new Error('no app id was provided to the iOS host')
  const url = new URL(`../apps/${encodeURIComponent(id)}/meta.json`, window.location.href)
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`failed to load ${url.href}: HTTP ${response.status}`)
  const value = await response.json() as AppMeta
  if (!value?.manifest || !Array.isArray(value.manifest.pages)) {
    throw new Error(`invalid app meta: ${url.href}`)
  }
  if (!value.firstPage) {
    value.firstPage = value.manifest.pages.find((page) => page.bodyType !== 'component')?.path
      ?? value.manifest.pages[0]?.path
      ?? ''
  }
  return value
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

type CanvasProbe = {
  pageId: string
  path: string
  canvasId: string
  width: number
  height: number
  paintedPixels: number
}

async function probeCanvases(pageId: string, path: string): Promise<CanvasProbe[]> {
  const frame = connector?.getPageFrame(pageId)
  const document = frame?.contentDocument
  if (!document) return []
  const results: CanvasProbe[] = []
  for (const canvas of Array.from(document.querySelectorAll('canvas'))) {
    const context = canvas.getContext('2d')
    let paintedPixels = 0
    if (context && canvas.width > 0 && canvas.height > 0) {
      try {
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data
        for (let index = 3; index < data.length; index += 4) {
          if (data[index] !== 0) paintedPixels += 1
        }
      } catch {
        paintedPixels = -1
      }
    }
    results.push({
      pageId,
      path,
      canvasId: canvas.getAttribute('canvas-id') ?? '',
      width: canvas.width,
      height: canvas.height,
      paintedPixels,
    })
  }
  return results
}

async function runSmoke(appMeta: AppMeta): Promise<void> {
  try {
    await wait(300)
    if (!host || !currentPageId) throw new Error('runtime is not ready')
    const firstTree = JSON.stringify(await host.inspectTree(currentPageId))
    if (firstTree.length < 40) throw new Error('first page tree is empty')

    let navigated = false
    const normalizePath = (value: string) => value.replace(/^\/+/, '')
    const appWindow = (appMeta.manifest.app?.configuration?.effective ?? {}) as Record<string, unknown>
    const tabBarConfig = appWindow.tabBar as { list?: Array<{ pagePath?: string }> } | undefined
    const tabPages = new Set(
      (tabBarConfig?.list ?? [])
        .map((item) => normalizePath(String(item.pagePath ?? '')))
        .filter(Boolean),
    )
    const nextPage = appMeta.manifest.pages.find((page) => (
      page.path !== appMeta.firstPage
      && page.bodyType !== 'component'
      && !tabPages.has(normalizePath(page.path))
    ))

    if (nextPage) {
      const result = await invoke('navigate.to', { url: `/${nextPage.path}` }) as NavigateResult
      await wait(400)
      const pageId = result.pageId ?? currentPageId
      if (!pageId) throw new Error('navigation did not create a page')
      const nextTree = JSON.stringify(await host.inspectTree(pageId))
      if (nextTree.length < 40) throw new Error('second page tree is empty')
      navigated = true
      await invoke('navigate.back', { delta: 1 })
      await wait(300)
    } else {
      const targetIndex = (tabBarConfig?.list ?? []).findIndex((item, index) => (
        index > 0 || normalizePath(String(item.pagePath ?? '')) !== normalizePath(appMeta.firstPage)
      ))
      if (targetIndex >= 0) {
        const result = await invoke('navigate.switchTab', { index: targetIndex }) as NavigateResult
        await wait(500)
        const pageId = result.pageId ?? currentPageId
        if (!pageId) throw new Error('switchTab did not create a page')
        const nextTree = JSON.stringify(await host.inspectTree(pageId))
        if (nextTree.length < 40) throw new Error('tab page tree is empty')
        navigated = true
        const firstTabIndex = (tabBarConfig?.list ?? []).findIndex((item) => (
          normalizePath(String(item.pagePath ?? '')) === normalizePath(appMeta.firstPage)
        ))
        if (firstTabIndex >= 0) {
          await invoke('navigate.switchTab', { index: firstTabIndex })
          await wait(300)
        }
      }
    }

    const canvases = await probeCanvases(currentPageId, appMeta.firstPage)

    // Exercise tab pages that may own canvas surfaces. The last probed tab
    // stays active so the smoke screenshot shows the final canvas surface.
    const tabList = (appMeta.manifest.app?.configuration?.effective as Record<string, unknown> | undefined)
      ?.tabBar as { list?: Array<{ pagePath?: string }> } | undefined
    const tabItems = (tabList?.list ?? [])
      .map((item) => normalizePath(String(item.pagePath ?? '')))
      .filter(Boolean)
    if (tabItems.length > 1) {
      for (const tabPath of tabItems) {
        if (tabPath === normalizePath(appMeta.firstPage)) continue
        const index = (tabList?.list ?? []).findIndex((item) => normalizePath(String(item.pagePath ?? '')) === tabPath)
        if (index < 0) continue
        const result = await invoke('navigate.switchTab', { index }) as NavigateResult
        await wait(900)
        const pageId = result.pageId
        if (pageId) canvases.push(...await probeCanvases(pageId, tabPath))
      }
    }

    if (appMeta.id === 'mini') {
      const legacyCanvas = canvases.find((item) => item.canvasId === 'canvas')
      const chartCanvas = canvases.find((item) => item.canvasId === 'mychart-bar')
      if (!legacyCanvas || legacyCanvas.paintedPixels <= 0) {
        throw new Error('mini legacy canvas did not paint any pixels')
      }
      if (!chartCanvas || chartCanvas.paintedPixels <= 0) {
        throw new Error('mini ECharts canvas did not paint any pixels')
      }
    }

    postControl({
      type: 'smoke',
      ok: true,
      details: {
        appId: appMeta.id,
        firstPage: appMeta.firstPage,
        navigated,
        treeLength: firstTree.length,
        canvases,
      },
    })
  } catch (error) {
    postControl({ type: 'smoke', ok: false, error: errorMessage(error) })
  }
}

async function start(): Promise<void> {
  meta = await loadMeta(appId)
  const storage = await readStorageSnapshot()
  const container = document.getElementById('pages')
  if (!container) throw new Error('the host document has no #pages container')

  connector = new PageFrameConnector(appId, container)
  for (const payload of pendingCanvasCommands.splice(0)) {
    tinyWindow.__tinyCanvasCommand?.(payload)
  }
  const injectedSystem = injected.system ?? {}
  const systemInfo = {
    ...injectedSystem,
    pixelRatio: window.devicePixelRatio || injectedSystem.pixelRatio || 2,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    language: injectedSystem.language ?? 'en',
    platform: injectedSystem.platform ?? 'ios',
    SDKVersion: injectedSystem.SDKVersion ?? '3.0.0',
  }

  host = createTinyRuntime({
    serviceTransport: createNativeServiceTransport(),
    renderConnector: connector,
    manifest: meta.manifest,
    initialPath: meta.firstPage,
    systemInfo,
    storage,
    maxPageStack: 10,
    apiHandlers: {
      ...createBrowserApiHandlers(),
      ...storageApiHandlers,
    },
    onDiagnostic,
  })

  postControl({ type: 'runtimeReady' })
  await host.service.handshake()
  const result = await host.bootstrap()
  const serviceResult = result.service as { pageId?: string }
  currentPageId = serviceResult.pageId
  postControl({ type: 'ready' })

  if (injected.smoke) {
    void runSmoke(meta)
  }
}

let resizeTimer = 0
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    if (!host) return
    void host.setWindowSize(window.innerWidth, window.innerHeight).catch((error) => {
      console.error('[tiny ios] resize failed', error)
    })
  }, 80)
})

document.addEventListener('visibilitychange', () => {
  if (!host) return
  void setAppVisible(document.visibilityState === 'visible').catch((error) => {
    console.error('[tiny ios] visibility change failed', error)
  })
})

window.addEventListener('error', (event) => {
  postHostLog('error', event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  postHostLog('error', errorMessage(event.reason))
})
