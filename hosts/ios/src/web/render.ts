import type { Transport, TransportFrame } from '@tiny/bridge'
import { bootTreeThread, resolveAssetReference } from '@tiny/runtime'
import { connectHostBridge, installHostBridge } from '@tiny/bridge'
import type { TemplateRegistry, TreeRenderer } from '@tiny/runtime'
import { createGlassRenderEntry, installPageLifecycleBridge } from '@tiny/host-web'
import { installRemoteCanvas } from './canvas'

type NativeRenderWindow = Window & {
  __tinyRenderReceive?: (raw: string) => void
  __TINY_NATIVE_TEMPLATES_SOURCE__?: string
  webkit?: {
    messageHandlers?: {
      tinyRender?: { postMessage(message: unknown): void }
    }
  }
}

function reportRenderError(message: string): void {
  try {
    (window as NativeRenderWindow).webkit?.messageHandlers?.tinyRender?.postMessage({
      type: 'error',
      message,
    })
  } catch {
    // The native handler is installed before the render bundle runs.
  }
}

function evaluateTemplates(source: string): TemplateRegistry {
  const transformed = source.replace(/\bexport\s+default\s+/, 'return ')
  if (transformed === source) {
    throw new Error('templates.js does not contain an export default')
  }
  return new Function(transformed)() as TemplateRegistry
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
    sendSync() {
      throw new Error('The native render transport has no synchronous path')
    },
  }

  try {
    installHostBridge(transport)
    const connection = connectHostBridge({
      localRole: 'render',
      peerRole: 'host',
      capabilities: { role: 'render', mode: 'tree' },
    })
    const runtime = bootTreeThread({
      connection,
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
 * The render WebView owns page/component WXML evaluation, so it loads the same
 * compiled bundle the service uses for its logic tree. `templates.js` is the
 * compiler's ESM entry; JSCore-side entries rewrite its `export default` the
 * same way.
 */
async function loadRenderTemplates(): Promise<TemplateRegistry | undefined> {
  const injectedSource = (window as NativeRenderWindow).__TINY_NATIVE_TEMPLATES_SOURCE__
  const errors: string[] = []
  if (injectedSource) {
    try {
      return evaluateTemplates(injectedSource)
    } catch (error) {
      errors.push(`native injection: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const templatesURL = `${assetsBase}templates.js`
  try {
    const response = await fetch(templatesURL)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const source = await response.text()
    return evaluateTemplates(source)
  } catch (error) {
    errors.push(`fetch ${templatesURL}: ${error instanceof Error ? error.message : String(error)}`)
  }

  reportRenderError(`templates.js unavailable; ${errors.join(' | ')}`)
  return undefined
}

const entry = createGlassRenderEntry({
  container: document.getElementById('app') ?? document.body,
  resolveAssetUrl: (src, sourcePath) => {
    const reference = resolveAssetReference(sourcePath || '', src)
    if (!reference) return undefined
    return assetsBase
      + reference.path.split('/').map(encodeURIComponent).join('/')
      + reference.suffix
  },
})

entry.prepare?.()
void (async () => {
  // `createRenderer` installs the WXS runtime global required while evaluating
  // compiled WXML bundles. Templates must be evaluated after this point.
  const renderer = entry.createRenderer()
  const templates = await loadRenderTemplates()
  if (!templates) {
    console.error('[tiny native render] templates.js is missing; component shadow trees cannot be evaluated')
  }
  if (templates) renderer.setTemplates?.(templates)
  bootNativeRenderEntry({
    pageId: params.get('pageId') ?? undefined,
    renderer,
  })
})()
