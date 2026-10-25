import type { ServiceApiContext } from './types'

type SelectorQuerySelection = {
  selector?: string
  rectCallback?: (rect: Record<string, unknown>) => void
  fieldsCallback?: (fields: Record<string, unknown>) => void
  nodeCallback?: (node: unknown) => void
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
        _options: Record<string, unknown>,
        callback?: (fields: Record<string, unknown>) => void,
      ) => {
        selection.fieldsCallback = callback
        return api
      },
      node: (callback?: (node: unknown) => void) => {
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
  component?: { data?: Record<string, unknown> },
): Promise<Record<string, unknown>> {
  let width = 0
  let height = 0
  let measured: { width?: number; height?: number; canvasId?: string } | undefined
  try {
    measured = await context.connection.call<{ width?: number; height?: number; canvasId?: string }>(
      'canvas',
      'measure',
      { selector: selection.selector },
      { pageId: context.pageId },
    )
    if (measured && Number(measured.width) > 0 && Number(measured.height) > 0) {
      width = Math.round(Number(measured.width))
      height = Math.round(Number(measured.height))
    }
  } catch {
    // The host did not provide a measurement; leave the size unknown.
  }
  const canvasId = String(component?.data?.canvasId ?? measured?.canvasId ?? 'canvas')
  const node = context.canvas?.createCanvasNode(width, height, canvasId, (frame) => {
    context.connection.sendEvent('canvas', 'frame', frame, { pageId: context.pageId })
  }) ?? null
  return {
    node,
    id: '',
    dataset: {},
    width,
    height,
    left: 0,
    top: 0,
    right: width,
    bottom: height,
  }
}
