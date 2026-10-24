import { BridgeConnection } from '@tiny/bridge'
import type { PageArtifact } from '@tiny/manifest'
import { GlassEaselRuntimeAdapter, type GlassEaselAdapterOptions } from './glass-easel-adapter'
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
    mountComponent: options.mountComponent as GlassEaselAdapterOptions['mountComponent'],
    unmountComponent: options.unmountComponent as GlassEaselAdapterOptions['unmountComponent'],
    onMiniProgramEvent: (pageId, event) => {
      connection.sendEvent('event', 'dispatch', event, { pageId })
    },
    onComponentLifecycle: (componentId, path, phase, data, meta) => {
      connection.sendEvent('runtime', 'componentLifecycle', {
        componentId,
        path,
        phase,
        data,
        ...meta,
      })
    },
    onComponentPageLifetime: (componentId, path, phase, data) => {
      connection.sendEvent('runtime', 'componentPageLifetime', { componentId, path, phase, data })
    },
    onComponentData: (payload) => {
      connection.sendEvent('runtime', 'componentData', payload)
    },
    onComponentObserved: (payload) => {
      connection.sendEvent('runtime', 'componentObserved', payload)
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
  let manifestForRender = options.manifest

  connection.onControl('runtime', 'bootstrap', async (message) => {
    try {
      const payload = message.payload as {
        manifest?: RenderThreadOptions['manifest']
        initialPath?: string
        initialData?: Record<string, unknown>
        pageId?: string
        componentSchemas?: import('./types').MiniProgramComponentSchema[]
      }
      const manifest = payload.manifest ?? options.manifest
      manifestForRender = manifest
      const initialPath = payload.initialPath ?? currentPath
      const initialData = payload.initialData ?? options.initialData ?? {}
      const pageId = payload.pageId
      // Register styles before component definitions so component definitions
      // receive their style scope; otherwise their classes are never prefixed.
      adapter.registerStyles(manifest, options.loadStyle)
      adapter.registerComponentSchemas(payload.componentSchemas ?? [])
      const page = findPage(manifest, initialPath)
      if (!page) throw new Error(`page is not declared: ${initialPath}`)
      adapter.registerPageArtifact(page)
      const component = adapter.mountPage(initialPath, initialData, pageId)
      if (!pageId) adapter.registerPageComponent(initialPath, component)
      currentPath = initialPath
      const components = await settlePage(adapter, page)
      return { status: 'ready', currentPath, components }
    } catch (error) {
      connection.sendDiagnostic('error', {
        code: 'RENDER_BOOTSTRAP_ERROR',
        message: error instanceof Error ? error.message : String(error),
        details: error instanceof Error && error.stack ? { stack: error.stack } : {},
      })
      throw error
    }
  })

  connection.onControl('page', 'navigateTo', async (message) => {
    const payload = message.payload as {
      path?: string
      pageId?: string
      initialData?: Record<string, unknown>
      previousPageId?: string
    }
    if (payload.previousPageId) adapter.unmountPage(payload.previousPageId)
    if (!payload.path || !payload.pageId) throw new Error('navigateTo requires a rendered page')
    const page = findPage(manifestForRender, payload.path)
    if (!page) throw new Error(`page is not declared: ${payload.path}`)
    adapter.mountPage(payload.path, payload.initialData ?? {}, payload.pageId)
    const components = await settlePage(adapter, page)
    return { status: 'ready', path: payload.path, pageId: payload.pageId, components }
  })

  connection.onControl('page', 'navigateBack', async (message) => {
    const payload = message.payload as {
      path?: string
      pageId?: string
      initialData?: Record<string, unknown>
      unloadedPageIds?: string[]
    }
    for (const pageId of payload.unloadedPageIds ?? []) adapter.unmountPage(pageId)
    if (!payload.path || !payload.pageId) throw new Error('navigateBack requires a rendered page')
    const page = findPage(manifestForRender, payload.path)
    adapter.mountPage(payload.path, payload.initialData ?? {}, payload.pageId)
    const components = page ? await settlePage(adapter, page) : []
    return { status: 'ready', path: payload.path, pageId: payload.pageId, components }
  })

  connection.onControl('runtime', 'inspectTree', (message) => {
    const payload = (message.payload ?? {}) as { pageId?: string }
    return adapter.inspectTree(payload.pageId)
  })

  connection.onControl('canvas', 'measure', (message) => {
    const payload = (message.payload ?? {}) as { selector?: string }
    return options.canvas?.measure(payload.selector) ?? { width: 0, height: 0 }
  })

  connection.onEvent('canvas', 'frame', (message) => {
    options.canvas?.paint(message.payload as { canvasId?: string; dataUrl?: string })
  })

  connection.onEvent('data', 'setData', (message) => {
    const payload = message.payload as { pageId?: string; componentId?: string; patch?: DataPatch }
    const component = payload.componentId
      ? adapter.getMountedComponentByComponentId(payload.componentId)
      : payload.pageId
        ? adapter.getMountedComponentByPageId(payload.pageId)
        : undefined
    if (!component) return
    adapter.beginServicePatch(component)
    try {
      component.setData(payload.patch ?? {})
    } finally {
      adapter.endServicePatch(component)
    }
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

async function settlePage(
  adapter: import('./glass-easel-adapter').GlassEaselRuntimeAdapter,
  page: PageArtifact,
): Promise<import('./glass-easel-adapter').ComponentSnapshot[]> {
  await adapter.whenRendered()
  if (hasUsingComponents(page)) {
    let lastCount = -1
    let stable = 0
    const deadline = Date.now() + 100
    while (Date.now() < deadline) {
      const count = adapter.getComponentCount()
      if (count === lastCount) stable += 1
      else { stable = 0; lastCount = count }
      if (count > 0 && stable >= 2) break
      await new Promise((resolve) => setTimeout(resolve, 1))
      await adapter.whenRendered()
    }
  }
  return adapter.getComponentSnapshot()
}

function hasUsingComponents(page: PageArtifact): boolean {
  const effective = page.configuration?.effective ?? {}
  const using = effective.usingComponents
  return Boolean(using && typeof using === 'object' && Object.keys(using).length > 0)
}
