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
  })
  for (const page of options.manifest.pages) adapter.registerPageArtifact(page)
  let currentPath = options.initialPath

  connection.onControl('runtime', 'bootstrap', async (message) => {
    const payload = message.payload as {
      manifest?: RenderThreadOptions['manifest']
      initialPath?: string
      initialData?: Record<string, unknown>
      pageId?: string
    }
    const manifest = payload.manifest ?? options.manifest
    const initialPath = payload.initialPath ?? currentPath
    const initialData = payload.initialData ?? options.initialData ?? {}
    const pageId = payload.pageId
    adapter.registerStyles(manifest, options.loadStyle)
    const page = findPage(manifest, initialPath)
    if (!page) throw new Error(`page is not declared: ${initialPath}`)
    adapter.registerPageArtifact(page)
    const component = adapter.mountPage(initialPath, initialData, pageId)
    if (!pageId) adapter.registerPageComponent(initialPath, component)
    currentPath = initialPath
    return { status: 'ready', currentPath }
  })

  connection.onEvent('data', 'setData', (message) => {
    const payload = message.payload as { pageId?: string; patch?: DataPatch }
    const pageId = payload.pageId
    const component = pageId ? adapter.getMountedComponentByPageId(pageId) : undefined
    if (!component) return
    component.setData(payload.patch ?? {})
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
