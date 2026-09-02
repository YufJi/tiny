import { BridgeConnection } from '@tiny/bridge'
import type { PageArtifact } from '@tiny/compiler-next'
import { GlassEaselRuntimeAdapter } from './glass-easel-adapter'
import { applyDataPatch, type DataPatch } from './data'
import type { RenderThreadOptions } from './types'

export type RenderThreadRuntime = {
  connection: BridgeConnection
  adapter: GlassEaselRuntimeAdapter
  manifest: RenderThreadOptions['manifest']
  currentPath: string
}

export function bootRenderThread(options: RenderThreadOptions): RenderThreadRuntime {
  const connection = new BridgeConnection({
    localRole: 'render',
    peerRole: 'host',
    transport: options.transport,
    capabilities: { role: 'render' },
  })
  const adapter = new GlassEaselRuntimeAdapter({
    backend: options.backend as never,
    manifest: options.manifest,
    templates: options.artifacts.templates,
    onMiniProgramEvent: (pageId, event) => {
      connection.sendEvent('event', 'dispatch', event, { pageId })
    },
    onComponentLifecycle: (componentId, path, phase, data) => {
      connection.sendEvent('runtime', 'componentLifecycle', { componentId, path, phase, data })
    },
    onComponentPageLifetime: (componentId, path, phase, data) => {
      connection.sendEvent('runtime', 'componentPageLifetime', { componentId, path, phase, data })
    },
    onDiagnostic: (diagnostic) => {
      options.onDiagnostic?.(diagnostic)
      connection.sendDiagnostic(
        diagnostic.severity === 'error' ? 'error' : diagnostic.severity === 'state' ? 'state' : diagnostic.severity === 'info' ? 'log' : 'warn',
        diagnostic,
      )
    },
  })
  for (const page of options.manifest.pages) adapter.registerPageArtifact(page)
  let currentPath = options.initialPath

  connection.onControl('runtime', 'bootstrap', async (message) => {
    const payload = message.payload as {
      manifest?: RenderThreadOptions['manifest']
      initialPath?: string
      initialData?: Record<string, unknown>
      pageId?: string
      componentSchemas?: import('./types').MiniProgramComponentSchema[]
    }
    const manifest = payload.manifest ?? options.manifest
    const initialPath = payload.initialPath ?? currentPath
    const initialData = payload.initialData ?? options.initialData ?? {}
    const pageId = payload.pageId
    adapter.registerComponentSchemas(payload.componentSchemas ?? [])
    adapter.registerStyles(manifest, options.loadStyle)
    const page = findPage(manifest, initialPath)
    if (!page) throw new Error(`page is not declared: ${initialPath}`)
    adapter.registerPageArtifact(page)
    const component = adapter.mountPage(initialPath, initialData, pageId)
    if (!pageId) adapter.registerPageComponent(initialPath, component)
    currentPath = initialPath
    return { status: 'ready', currentPath }
  })

  connection.onControl('page', 'navigateTo', (message) => {
    const payload = message.payload as {
      path?: string
      pageId?: string
      initialData?: Record<string, unknown>
      previousPageId?: string
    }
    if (payload.previousPageId) adapter.unmountPage(payload.previousPageId)
    if (!payload.path || !payload.pageId) throw new Error('navigateTo requires a rendered page')
    adapter.mountPage(payload.path, payload.initialData ?? {}, payload.pageId)
    return { status: 'ready', path: payload.path, pageId: payload.pageId }
  })

  connection.onControl('page', 'navigateBack', (message) => {
    const payload = message.payload as {
      path?: string
      pageId?: string
      initialData?: Record<string, unknown>
      unloadedPageIds?: string[]
    }
    for (const pageId of payload.unloadedPageIds ?? []) adapter.unmountPage(pageId)
    if (!payload.path || !payload.pageId) throw new Error('navigateBack requires a rendered page')
    adapter.mountPage(payload.path, payload.initialData ?? {}, payload.pageId)
    return { status: 'ready', path: payload.path, pageId: payload.pageId }
  })

  connection.onEvent('data', 'setData', (message) => {
    const payload = message.payload as { pageId?: string; componentId?: string; patch?: DataPatch }
    const component = payload.componentId
      ? adapter.getMountedComponentByComponentId(payload.componentId)
      : payload.pageId
        ? adapter.getMountedComponentByPageId(payload.pageId)
        : undefined
    if (!component) return
    component.setData(payload.patch ?? {})
  })

  connection.onEvent('event', 'trigger', (message) => {
    const payload = message.payload as {
      componentId: string
      name: string
      detail?: unknown
      options?: Record<string, unknown>
    }
    adapter.triggerComponentEvent(payload.componentId, payload.name, payload.detail, payload.options)
  })

  return {
    connection,
    adapter,
    manifest: options.manifest,
    currentPath,
  }
}

function findPage(manifest: RenderThreadOptions['manifest'], path: string): PageArtifact | undefined {
  return manifest.pages.find((page) => page.path === path)
}
