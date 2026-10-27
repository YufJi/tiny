import { resolveAssetPath } from '../assets'
import type { QueryNodeSnapshot } from '../types'
import type { ServiceApiContext } from './types'

type SelectorQuerySelection = {
  selector?: string
  all: boolean
  rectCallback?: (result: unknown) => void
  fieldsCallback?: (result: unknown) => void
  nodeCallback?: (node: unknown) => void
  wantsNode?: boolean
}

/**
 * WeChat-compatible selector query. Node lookups round-trip to the render
 * thread, which resolves them against the real DOM (scoped to the component or
 * page); canvas `.node()` selections keep using the host canvas handoff.
 */
export function createSelectorQuery(
  context: ServiceApiContext,
  options: { componentId?: string } = {},
): Record<string, unknown> {
  const selections: SelectorQuerySelection[] = []
  let scopedComponentId = options.componentId
  let scopedComponent: { data?: Record<string, unknown>; path?: string } | undefined
  let execCallback: ((results: unknown[]) => void) | undefined
  let scheduled = false

  const schedule = () => {
    if (scheduled) return
    scheduled = true
    void (async () => {
      const results: unknown[] = []
      for (const selection of selections) {
        const result = await resolveSelection(
          context,
          selection,
          scopedComponent,
          scopedComponentId,
        )
        results.push(result)
      }
      for (const [index, selection] of selections.entries()) {
        const result = results[index]
        selection.rectCallback?.(result)
        selection.fieldsCallback?.(result)
        const node = (result as { node?: unknown } | null | undefined)?.node
        selection.nodeCallback?.(node)
      }
      execCallback?.(results)
    })()
  }

  const createSelection = (selector: string | undefined, all: boolean): Record<string, unknown> => {
    const selection: SelectorQuerySelection = { selector, all }
    selections.push(selection)
    const api: Record<string, unknown> = {
      boundingClientRect: (callback?: (rect: unknown) => void) => {
        selection.rectCallback = callback
        return api
      },
      fields: (
        fields: Record<string, unknown>,
        callback?: (result: unknown) => void,
      ) => {
        if (fields?.node === true) selection.wantsNode = true
        selection.fieldsCallback = callback
        return api
      },
      node: (callback?: (node: unknown) => void) => {
        selection.wantsNode = true
        selection.nodeCallback = callback
        return api
      },
      exec: (callback?: (results: unknown[]) => void) => {
        if (callback) execCallback = callback
        schedule()
        return api
      },
    }
    return api
  }

  const query: Record<string, unknown> = {
    in: (target?: unknown) => {
      const componentId = (target as { componentId?: unknown } | undefined)?.componentId
      if (typeof componentId === 'string' && componentId.length > 0) {
        // Page instances use a `page:` prefix and scope to the active page.
        scopedComponentId = componentId.startsWith('page:') ? undefined : componentId
        scopedComponent = target as { data?: Record<string, unknown>; path?: string }
      } else {
        scopedComponent = target as { data?: Record<string, unknown>; path?: string } | undefined
        scopedComponentId = undefined
      }
      return query
    },
    select: (selector?: string) => createSelection(selector, false),
    selectAll: (selector?: string) => createSelection(selector, true),
    exec: (callback?: (results: unknown[]) => void) => {
      if (callback) execCallback = callback
      schedule()
      return query
    },
  }
  return query
}

async function resolveSelection(
  context: ServiceApiContext,
  selection: SelectorQuerySelection,
  component: { data?: Record<string, unknown>; path?: string } | undefined,
  componentId: string | undefined,
): Promise<unknown> {
  const selector = String(selection.selector ?? '')
  let nodes: QueryNodeSnapshot[] = []
  try {
    const response = await context.connection.call<{ nodes?: QueryNodeSnapshot[] }>(
      'query',
      'select',
      {
        pageId: context.pageId,
        ...(componentId ? { componentId } : {}),
        selector,
        all: selection.all,
      },
      { pageId: context.pageId },
    )
    nodes = Array.isArray(response?.nodes) ? response.nodes : []
  } catch {
    // Hosts without render-thread query support resolve to no nodes.
    nodes = []
  }
  if (selection.wantsNode) {
    const canvasResult = await buildSelectorResult(context, selection, component)
    if (!nodes[0]) return canvasResult
    // Prefer the real DOM rect/dataset; keep the host canvas node handle.
    return { ...canvasResult, ...nodes[0], node: canvasResult.node }
  }
  if (selection.all) return nodes
  return nodes[0] ?? null
}

async function buildSelectorResult(
  context: ServiceApiContext,
  selection: SelectorQuerySelection,
  component?: { data?: Record<string, unknown>; path?: string },
): Promise<Record<string, unknown>> {
  let width = 0
  let height = 0
  let measured: {
    width?: number
    height?: number
    canvasId?: string
    hasCanvas?: boolean
  } | undefined
  const attempts = selection.wantsNode ? 20 : 1
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      measured = await context.connection.call<{
        width?: number
        height?: number
        canvasId?: string
        hasCanvas?: boolean
      }>(
        'canvas',
        'measure',
        {
          selector: selection.selector,
          canvasId: String(component?.data?.canvasId || ''),
        },
        { pageId: context.pageId },
      )
    } catch {
      measured = undefined
    }
    const found = measured?.hasCanvas === true
      || (Number(measured?.width) > 0 && Number(measured?.height) > 0)
    if (found || attempt === attempts - 1) break
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  if (measured && Number(measured.width) > 0 && Number(measured.height) > 0) {
    width = Math.round(Number(measured.width))
    height = Math.round(Number(measured.height))
  }
  const canvasId = String(component?.data?.canvasId || measured?.canvasId || '')
  const sourcePath = component?.path ?? context.getCurrentPagePath?.() ?? ''
  const resolveAssetUrl = context.resolveAssetUrl
  const resolveCanvasAssetUrl = resolveAssetUrl
    ? (src: string) => {
        const assetPath = resolveAssetPath(sourcePath, src)
        if (!assetPath) return undefined
        return resolveAssetUrl(assetPath, { sourcePath }) ?? undefined
      }
    : undefined
  const node = selection.wantsNode
    ? (await context.canvas?.acquireCanvasNode?.({
        selector: selection.selector,
        pageId: context.pageId,
        canvasId,
        width,
        height,
        resolveAssetUrl: resolveCanvasAssetUrl,
      })) ?? null
    : null
  return {
    node,
    id: canvasId,
    dataset: {},
    width,
    height,
    left: 0,
    top: 0,
    right: width,
    bottom: height,
  }
}
