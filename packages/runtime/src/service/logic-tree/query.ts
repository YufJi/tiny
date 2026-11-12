import type { ViewRect } from './events'
import type { LogicBackendContext, LogicBackendElement } from './backend'

/** One DOM node resolved by a component/page selector query. */
export type QueryNodeSnapshot = {
  /** Logic-layer node identity, present for service-side query results. */
  viewId?: string
  /** Component-scoped locator of an element (render-side addressing). */
  locator?: string
  id: string
  dataset: Record<string, unknown>
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  scrollLeft: number
  scrollTop: number
}

function classMatches(node: LogicBackendElement, className: string): boolean {
  return node.classes.some((value) => value === className || value.endsWith(`--${className}`))
}

function matchesSimple(node: LogicBackendElement, token: string): boolean {
  const match = /^([A-Za-z_][\w-]*)?(#[\w-]+)?((?:\.[\w-]+)*)$/.exec(token)
  if (!match) return false
  const [, tag, id, classes] = match
  if (tag && node.tagName !== tag && node.tagName !== `tiny-${tag}`) return false
  if (id && node.id !== id.slice(1)) return false
  if (classes) {
    for (const className of classes.split('.').filter(Boolean)) {
      if (!classMatches(node, className)) return false
    }
  }
  return Boolean(tag || id || classes)
}

function ancestorMatches(node: LogicBackendElement | null, token: string): boolean {
  let current = node
  while (current) {
    if (matchesSimple(current, token)) return true
    current = current.parentNode
  }
  return false
}

function matchesSelector(node: LogicBackendElement, selector: string): boolean {
  const parts = selector.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return false
  if (!matchesSimple(node, parts[parts.length - 1]!)) return false
  let parent = node.parentNode
  for (let index = parts.length - 2; index >= 0; index -= 1) {
    if (!ancestorMatches(parent, parts[index]!)) return false
    // Approximate: continue from the matched ancestor.
    while (parent && !matchesSimple(parent, parts[index]!)) parent = parent.parentNode
    parent = parent?.parentNode ?? null
  }
  return true
}

function visit(
  node: LogicBackendElement,
  selector: string,
  all: boolean,
  results: LogicBackendElement[],
  pageScope: boolean,
): boolean {
  if (matchesSelector(node, selector)) {
    results.push(node)
    if (!all) return true
  }
  if (node.shadowRoot && !(pageScope && node.nodeType === 'component')) {
    for (const child of node.shadowRoot.children) {
      if (visit(child, selector, all, results, pageScope)) return true
    }
  }
  for (const child of node.children) {
    if (visit(child, selector, all, results, pageScope)) return true
  }
  return false
}

export function queryLogicNodes(
  root: LogicBackendElement,
  selector: string,
  all: boolean,
  pageScope = false,
): LogicBackendElement[] {
  const results: LogicBackendElement[] = []
  const searchRoot = root.shadowRoot ?? root
  for (const child of searchRoot.children) {
    if (visit(child, selector, all, results, pageScope)) break
  }
  return results
}

export function snapshotLogicNode(
  backend: LogicBackendContext,
  node: LogicBackendElement,
): QueryNodeSnapshot {
  const dataset: Record<string, unknown> = {}
  for (const [key, value] of node.dataset) dataset[key] = value
  return {
    viewId: backend.ensureViewId(node),
    ...(backend.locatorOf(node) ? { locator: backend.locatorOf(node) } : {}),
    id: node.id,
    dataset,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    scrollLeft: 0,
    scrollTop: 0,
  }
}

type Selection = {
  selector: string
  all: boolean
  rectCallback?: (value: unknown) => void
  fieldsCallback?: (value: unknown) => void
  nodeCallback?: (value: unknown) => void
}

/** Render-side selector query, scoped to the component that owns the nodes. */
export type QueryViewRequest = {
  scopeId?: string
  selector: string
  all: boolean
}

export type QueryViewResult = Array<Partial<ViewRect>>

/**
 * Selector-query shape backed by the logic tree. Geometry is not available in
 * the logic layer (the view owns layout), but node identity and typed dataset
 * are exact.
 *
 * Nodes inside an evaluated component shadow tree have no render-side node id,
 * so `measure` cannot resolve them. Those fall back to a scoped render query
 * (`queryView`), matched to the logic nodes by position.
 */
export function createLogicSelectorQuery(
  backend: LogicBackendContext,
  root: LogicBackendElement,
  measure?: (viewIds: string[]) => Promise<Record<string, ViewRect>>,
  queryView?: (request: QueryViewRequest) => Promise<QueryViewResult>,
  measureLocators?: (locators: string[]) => Promise<Record<string, ViewRect>>,
): Record<string, unknown> {
  const selections: Selection[] = []
  let execCallback: ((results: unknown[]) => void) | undefined

  const run = (): void => {
    void (async () => {
      const perSelection = selections.map((selection) => {
        const nodes = queryLogicNodes(root, selection.selector, selection.all)
          .map((node) => snapshotLogicNode(backend, node))
        return { selection, nodes }
      })
      const viewIds = [...new Set(perSelection.flatMap(({ nodes }) => (
        nodes.map((node) => node.viewId).filter((value): value is string => Boolean(value))
      )))]
      const locators = [...new Set(perSelection.flatMap(({ nodes }) => (
        nodes.map((node) => node.locator).filter((value): value is string => Boolean(value))
      )))]
      const rects = measure && viewIds.length > 0 ? await measure(viewIds) : {}
      const locatorRects = measureLocators && locators.length > 0
        ? await measureLocators(locators)
        : {}
      const scopeId = queryView ? backend.ensureViewId(root) : undefined
      const results: unknown[] = []
      for (const { selection, nodes } of perSelection) {
        const needsFallback = queryView && nodes.some((node) => !node.viewId || !rects[node.viewId])
        const scoped = needsFallback
          ? await queryView({ selector: selection.selector, all: selection.all, scopeId })
            .catch(() => [] as QueryViewResult)
          : []
        const withRects = nodes.map((node, index) => {
          const rect = (node.viewId ? rects[node.viewId] : undefined)
            ?? (node.locator ? locatorRects[node.locator] : undefined)
          if (rect) return { ...node, ...rect }
          const fallback = scoped[index]
          return fallback ? { ...node, ...fallback } : node
        })
        const value = selection.all ? withRects : (withRects[0] ?? null)
        selection.rectCallback?.(value)
        selection.fieldsCallback?.(value)
        selection.nodeCallback?.(null)
        results.push(value)
      }
      execCallback?.(results)
    })()
  }

  const createSelection = (selector: string, all: boolean): Record<string, unknown> => {
    const selection: Selection = { selector, all }
    selections.push(selection)
    const api: Record<string, unknown> = {
      boundingClientRect: (callback?: (value: unknown) => void) => {
        selection.rectCallback = callback
        return api
      },
      fields: (_options: Record<string, unknown>, callback?: (value: unknown) => void) => {
        selection.fieldsCallback = callback
        return api
      },
      node: (callback?: (value: unknown) => void) => {
        selection.nodeCallback = callback
        return api
      },
      exec: (callback?: (results: unknown[]) => void) => {
        if (callback) execCallback = callback
        run()
        return api
      },
    }
    return api
  }

  const query: Record<string, unknown> = {
    in: () => query,
    select: (selector?: string) => createSelection(String(selector ?? ''), false),
    selectAll: (selector?: string) => createSelection(String(selector ?? ''), true),
    exec: (callback?: (results: unknown[]) => void) => {
      if (callback) execCallback = callback
      run()
      return query
    },
  }
  return query
}
