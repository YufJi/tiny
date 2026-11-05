import type { Transport, TransportFrame } from '@tiny/bridge'
import { bootTreeThread, resolveAssetPath } from '@tiny/runtime'
import type { TemplateRegistry, TreeRenderer } from '@tiny/runtime'
import { installPageLifecycleBridge } from '@tiny/host-browser'
import { createGlassRenderEntry } from '@tiny/host-web-components'
import { installRemoteCanvas } from './canvas'

type NativeRenderWindow = Window & {
  __tinyRenderReceive?: (raw: string) => void
  webkit?: {
    messageHandlers?: {
      tinyRender?: { postMessage(message: unknown): void }
    }
  }
}

function bootNativeRenderEntry(options: {
  pageId?: string
  renderer: TreeRenderer
}): void {
  const nativeWindow = window as NativeRenderWindow
  const handler = nativeWindow.webkit?.messageHandlers?.tinyRender
  if (!handler) throw new Error('tinyRender script message handler is missing')
  window.addEventListener('error', (event) => {
    handler.postMessage({ type: 'error', message: String(event.message) })
  })
  window.addEventListener('unhandledrejection', (event) => {
    handler.postMessage({ type: 'error', message: String(event.reason) })
  })

  let listener: ((frame: TransportFrame) => void) | undefined
  const pending: string[] = []
  let disposed = false

  nativeWindow.__tinyRenderReceive = (raw: string) => {
    if (disposed) return
    if (!listener) {
      pending.push(raw)
      return
    }
    try {
      listener(JSON.parse(raw) as TransportFrame)
    } catch (error) {
      console.error('[tiny native render] invalid frame', error)
    }
  }

  const transport: Transport = {
    send(frame) {
      if (disposed) return
      handler.postMessage({ type: 'frame', frame: JSON.stringify(frame) })
    },
    close() {
      disposed = true
      listener = undefined
      pending.length = 0
    },
    onFrame(next) {
      listener = next
      while (pending.length > 0) {
        const raw = pending.shift()!
        try {
          next(JSON.parse(raw) as TransportFrame)
        } catch (error) {
          console.error('[tiny native render] invalid queued frame', error)
        }
      }
      return () => {
        if (listener === next) listener = undefined
      }
    },
  }

  try {
    const runtime = bootTreeThread({
      transport,
      renderer: options.renderer,
      ...(options.pageId ? { initialPageId: options.pageId } : {}),
    })
    installPageLifecycleBridge(runtime.connection)
    handler.postMessage({ type: 'ready', pageId: options.pageId ?? null })
  } catch (error) {
    handler.postMessage({ type: 'error', message: String(error) })
  }
}

const params = new URLSearchParams(window.location.search)
const appId = params.get('app') ?? ''
const assetsBase = new URL(
  `../apps/${encodeURIComponent(appId)}/assets/`,
  window.location.href,
).href

installRemoteCanvas()

/**
 * The render WebView evaluates component templates itself, so it loads the
 * same compiled bundle the service evaluates. `templates.js` is the compiler's
 * ESM entry; JSCore-side entries rewrite its `export default` the same way.
 */
async function loadRenderTemplates(): Promise<TemplateRegistry | undefined> {
  try {
    const response = await fetch(`${assetsBase}templates.js`)
    if (!response.ok) return undefined
    const source = await response.text()
    const transformed = source.replace(/\bexport\s+default\s+/, 'return ')
    if (transformed === source) return undefined
    return new Function(transformed)() as TemplateRegistry
  } catch {
    return undefined
  }
}

const entry = createGlassRenderEntry({
  container: document.getElementById('app') ?? document.body,
  resolveAssetUrl: (src, sourcePath) => {
    const resolved = resolveAssetPath(sourcePath || '', src)
    if (!resolved) return undefined
    return assetsBase + resolved.split('/').map(encodeURIComponent).join('/')
  },
})

entry.prepare?.()
void (async () => {
  const templates = await loadRenderTemplates()
  if (!templates) {
    console.error('[tiny native render] templates.js is missing; component shadow trees cannot be evaluated')
  }
  const renderer = entry.createRenderer()
  if (templates) renderer.setTemplates?.(templates)
  bootNativeRenderEntry({
    pageId: params.get('pageId') ?? undefined,
    renderer,
  })
})()
