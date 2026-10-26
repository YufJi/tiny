import { resolveAssetPath } from '../assets'
import type { ServiceApiContext } from './types'

type SelectorQuerySelection = {
  selector?: string
  rectCallback?: (rect: Record<string, unknown>) => void
  fieldsCallback?: (fields: Record<string, unknown>) => void
  nodeCallback?: (node: unknown) => void
  wantsNode?: boolean
}

export function createSelectorQueryStub(context: ServiceApiContext): Record<string, unknown> {
  const selections: SelectorQuerySelection[] = []
  let component: { data?: Record<string, unknown> } | undefined
  let execCallback: ((results: unknown[]) => void) | undefined
  let scheduled = false

  const schedule = () => {
    if (scheduled) return
    scheduled = true
    void (async () => {
      const results: Record<string, unknown>[] = []
      for (const selection of selections) {
        results.push(await buildSelectorResult(context, selection, component))
      }
      for (const [index, selection] of selections.entries()) {
        const result = results[index]!
        selection.rectCallback?.(result)
        selection.fieldsCallback?.(result)
        selection.nodeCallback?.(result.node)
      }
      execCallback?.(results)
    })()
  }

  const createSelection = (selector?: string): Record<string, unknown> => {
    const selection: SelectorQuerySelection = { selector }
    selections.push(selection)
    const api: Record<string, unknown> = {
      boundingClientRect: (callback?: (rect: Record<string, unknown>) => void) => {
        selection.rectCallback = callback
        return api
      },
      fields: (
        options: Record<string, unknown>,
        callback?: (fields: Record<string, unknown>) => void,
      ) => {
        if (options?.node === true) selection.wantsNode = true
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
      component = target as { data?: Record<string, unknown> } | undefined
      return query
    },
    select: (selector?: string) => createSelection(selector),
    selectAll: (selector?: string) => createSelection(selector),
    exec: (callback?: (results: unknown[]) => void) => {
      if (callback) execCallback = callback
      schedule()
      return query
    },
  }
  return query
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
