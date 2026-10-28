import { createInMemoryTransportPair } from '@tiny/bridge'
import type { RenderThreadConnector } from '../../src/types'
import {
  bootSplitTreeHarness,
  logicTreeAdapter,
  type RenderThreadRuntime,
  type SplitTreeHarnessOptions,
} from './split-tree-harness'
import { provideHarnessConfig } from './split-service'

export type HarnessRenderConnector = RenderThreadConnector & {
  /** Render thread booted for a page, for tests that push render→host messages. */
  session: (pageId: string) => RenderThreadRuntime | undefined
  /** Page ids in `connect` order. */
  connected: string[]
  /** Last page the host asked to show. */
  activePageId: () => string | undefined
  /** Render thread of the page the host last activated. */
  activeSession: () => RenderThreadRuntime | undefined
}

/**
 * Compatibility view for tests that assert the active page: `render.adapter`
 * (the logic tree), `render.connection` (the active render thread) and the
 * manifest/currentPath of that session.
 */
export function harnessRenderView(connector: HarnessRenderConnector): RenderThreadRuntime {
  const activeSession = () => {
    const session = connector.activeSession()
    if (!session) throw new Error('no active render session')
    return session
  }
  return {
    get connection() {
      return activeSession().connection
    },
    get adapter() {
      return activeSession().adapter
    },
    get manifest() {
      return activeSession().manifest
    },
    get currentPath() {
      return activeSession().currentPath
    },
  }
}

/**
 * In-memory render connector: one render thread per page, exactly like the
 * browser host. Tests use the same `renderConnector` seam as production, so
 * page activation, disconnect and per-page routing are covered by unit tests
 * instead of only by the browser gate.
 */
export function createHarnessRenderConnector(
  options: Omit<SplitTreeHarnessOptions, 'transport'>,
): HarnessRenderConnector {
  // The service thread asks for templates while it bootstraps, which happens
  // before the host connects the first render page; register the config now.
  provideHarnessConfig({
    templates: options.artifacts.templates,
    loadStyle: options.loadStyle ?? (() => ''),
  })
  const sessions = new Map<string, RenderThreadRuntime>()
  const connected: string[] = []
  let active: string | undefined
  return {
    connected,
    session: (pageId) => sessions.get(pageId),
    activePageId: () => active,
    activeSession: () => {
      if (active) {
        const session = sessions.get(active)
        if (session) return session
      }
      const [lastId] = connected.slice(-1)
      return lastId ? sessions.get(lastId) : undefined
    },
    async connect(pageId) {
      const [hostSide, renderSide] = createInMemoryTransportPair()
      sessions.set(pageId, bootSplitTreeHarness({ ...options, transport: renderSide }))
      connected.push(pageId)
      return hostSide
    },
    activate(pageId) {
      active = pageId
    },
    async disconnect(pageId) {
      const session = sessions.get(pageId)
      sessions.delete(pageId)
      if (active === pageId) active = undefined
      await session?.connection.close().catch(() => undefined)
    },
  }
}
