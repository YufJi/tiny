import type { BridgeConnection } from '@tiny/bridge'
import { cloneJsonSafe } from '../../shared/data'
import {
  createRuntimeStateDiagnostic,
  type RuntimePageState,
} from '../../shared/diagnostics'
import type { ServiceTabBar } from '../app/tab-bar'
import type { MiniProgramPageInstance } from './instance'

export type PageStateSnapshot = {
  pageId: string
  path: string
  query: Record<string, string>
  data: Record<string, unknown>
  savedExitState: unknown
  exitState: unknown
}

export type RuntimeStateInput = {
  stack: MiniProgramPageInstance[]
  tabPages: Map<string, MiniProgramPageInstance>
  active: MiniProgramPageInstance | null
  visible: boolean
  maxStack: number
  tabBar: ServiceTabBar
  connection: BridgeConnection
}

/** Serializable state of the live page stack, for host-level restore. */
export function snapshotPageStack(
  stack: MiniProgramPageInstance[],
): PageStateSnapshot[] {
  return stack.map((page) => ({
    pageId: page.pageId,
    path: page.path,
    query: { ...page.query },
    data: cloneJsonSafe(page.data),
    savedExitState: cloneJsonSafe(page.savedExitState ?? null),
    exitState: cloneJsonSafe(page.exitState ?? null),
  }))
}

/** Apply a host-restored page state after the page has been recreated. */
export function restorePageState(
  pageInstances: Map<string, MiniProgramPageInstance>,
  pageId: string,
  data: Record<string, unknown>,
  savedExitState?: unknown,
  exitState?: unknown,
): Record<string, unknown> {
  const page = pageInstances.get(pageId)
  if (!page) return { status: 'missing', pageId }
  if (data && typeof data === 'object' && Object.keys(data).length > 0) page.setData(data)
  if (savedExitState !== undefined) page.savedExitState = cloneJsonSafe(savedExitState)
  if (exitState !== undefined) page.exitState = cloneJsonSafe(exitState)
  else if (savedExitState !== undefined) page.exitState = cloneJsonSafe(savedExitState)
  return {
    status: 'restored',
    pageId,
    path: page.path,
    data: cloneJsonSafe(page.data),
  }
}

export function publishRuntimeState(input: RuntimeStateInput): void {
  const pageStackIds = input.stack.map((page) => page.pageId)
  const pages: RuntimePageState[] = input.stack.map((page) => ({
    pageId: page.pageId,
    path: page.path,
    query: { ...page.query },
    visible: input.visible && page === input.active,
  }))
  const livePageIds = new Set(pageStackIds)
  for (const cachedPage of input.tabPages.values()) {
    if (livePageIds.has(cachedPage.pageId)) continue
    pages.push({
      pageId: cachedPage.pageId,
      path: cachedPage.path,
      query: { ...cachedPage.query },
      visible: false,
      cached: true,
    })
  }
  const tabBar = input.tabBar.state(input.active?.path)
  input.connection.sendDiagnostic('state', createRuntimeStateDiagnostic(
    'service',
    {
      pageStack: pageStackIds,
      currentPage: input.active?.path ?? '',
      pages,
      appVisible: input.visible,
      ...(tabBar ? { tabBar } : {}),
      maxPageStack: input.maxStack,
      transport: 'connected',
    },
    input.active?.pageId,
  ))
}
