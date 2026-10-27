import { BridgeConnection } from '@tiny/bridge'
import type { Transport } from '@tiny/bridge'
import type { RenderNode, RenderPatch } from './tree/protocol'

export type TreeEventPayload = {
  id: string
  name: string
  pageId?: string
  detail?: unknown
  native?: Record<string, unknown>
  touches?: unknown[]
  changedTouches?: unknown[]
}

export type TreeRenderer = {
  mount: (root: RenderNode) => void
  applyPatches: (patches: RenderPatch[]) => void
  setEventSink?: (sink: (event: TreeEventPayload) => void) => void
  applyStyles?: (styles: string[]) => void
  setPagePath?: (pagePath: string) => void
  measureCanvas?: (selector: string, canvasId: string) => {
    width: number
    height: number
    canvasId: string
    hasCanvas: boolean
  }
  setDiagnosticSink?: (sink: (diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void) => void
  inspectTree?: () => unknown
  measure?: (ids: string[]) => Record<string, unknown>
  query?: (selector: string, all: boolean) => unknown[]
  dispose?: () => void
}

export type TreeThreadOptions = {
  transport: Transport
  renderer: TreeRenderer
  initialPageId?: string
}

export type TreeThreadRuntime = {
  connection: BridgeConnection
}

/** Render-side thread for the WeChat-style split-tree protocol. */
export function bootTreeThread(options: TreeThreadOptions): TreeThreadRuntime {
  const connection = new BridgeConnection({
    localRole: 'render',
    peerRole: 'host',
    transport: options.transport,
    capabilities: { role: 'render', mode: 'tree' },
  })
  let currentPageId = options.initialPageId

  options.renderer.setDiagnosticSink?.((diagnostic) => {
    connection.sendDiagnostic(
      diagnostic.severity === 'error' ? 'error' : 'warn',
      diagnostic,
    )
  })

  options.renderer.setEventSink?.((event) => {
    connection.sendEvent(
      'tree',
      'event',
      { ...event, pageId: event.pageId ?? currentPageId },
      currentPageId ? { pageId: currentPageId } : {},
    )
  })

  connection.onControl('runtime', 'bootstrap', (message) => {
    const payload = (message.payload ?? {}) as {
      initialPath?: string
      pageId?: string
    }
    currentPageId = payload.pageId ?? message.pageId ?? currentPageId
    return {
      status: 'ready',
      currentPath: payload.initialPath ?? '',
      pageId: currentPageId,
      components: [],
    }
  })

  connection.onEvent('tree', 'snapshot', (message) => {
    const payload = (message.payload ?? {}) as {
      root?: RenderNode
      pageId?: string
      pagePath?: string
      styles?: string[]
      fallbackAppStyles?: string[]
    }
    currentPageId = payload.pageId ?? message.pageId ?? currentPageId
    options.renderer.setPagePath?.(payload.pagePath ?? '')
    if (payload.root) options.renderer.mount(payload.root)
    const styles = [...(payload.styles ?? []), ...(payload.fallbackAppStyles ?? [])]
    if (styles.length > 0) options.renderer.applyStyles?.(styles)
  })
  connection.onEvent('tree', 'patch', (message) => {
    const payload = (message.payload ?? {}) as { patches?: RenderPatch[] }
    options.renderer.applyPatches(payload.patches ?? [])
  })
  for (const method of ['navigateTo', 'redirectTo', 'reLaunch', 'navigateBack', 'switchTab'] as const) {
    connection.onControl('page', method, (message) => {
      const payload = (message.payload ?? {}) as { path?: string; pageId?: string }
      if (payload.pageId) currentPageId = payload.pageId
      return { status: 'ready', path: payload.path ?? '', pageId: payload.pageId ?? currentPageId, components: [] }
    })
  }

  connection.onControl('runtime', 'inspectTree', () => options.renderer.inspectTree?.() ?? null)
  connection.onControl('runtime', 'measure', (message) => {
    const payload = (message.payload ?? {}) as { ids?: string[] }
    return options.renderer.measure?.(payload.ids ?? []) ?? {}
  })
  connection.onControl('query', 'select', (message) => {
    const payload = (message.payload ?? {}) as { selector?: string; all?: boolean }
    return { nodes: options.renderer.query?.(String(payload.selector ?? ''), payload.all === true) ?? [] }
  })
  connection.onControl('query', 'intersection', () => ({ status: 'missing-intersection' }))
  connection.onControl('tree', 'inspectTree', () => options.renderer.inspectTree?.() ?? null)
  connection.onControl('canvas', 'measure', (message) => {
    const payload = (message.payload ?? {}) as { selector?: string; canvasId?: string }
    return options.renderer.measureCanvas?.(
      String(payload.selector ?? ''),
      String(payload.canvasId ?? ''),
    ) ?? { width: 0, height: 0, canvasId: '', hasCanvas: false }
  })

  connection.onControl('tree', 'measure', (message) => {
    const payload = (message.payload ?? {}) as { ids?: string[] }
    return options.renderer.measure?.(payload.ids ?? []) ?? {}
  })

  return { connection }
}
