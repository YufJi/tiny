import type {
  QueryIntersectionEntry,
  QueryNodeSnapshot,
  RenderIntersectionHandle,
  RenderIntersectionRequest,
  RenderQueryAdapter,
} from '@tiny/runtime'

/**
 * Mini-program selectors use author class names, while the DOM carries
 * style-scoped classes (`<scope>--<class>`). Match the original token and its
 * scoped variants so `.van-tab` keeps working inside a component.
 */
export function scopedQuerySelector(selector: string): string {
  const match = /^\.([A-Za-z_][\w-]*)$/.exec(selector)
  if (!match) return selector
  const className = match[1]!
  return [
    `[class~="${className}"]`,
    `[class$="--${className}"]`,
    `[class*="--${className} "]`,
  ].join(', ')
}

function asElement(value: unknown): Element | null {
  if (!value || typeof (value as Element).querySelectorAll !== 'function') return null
  return value as Element
}

function queryElements(root: Element, selector: string, all: boolean): Element[] {
  try {
    const scoped = scopedQuerySelector(selector)
    if (all) return Array.from(root.querySelectorAll(scoped))
    const node = root.querySelector(scoped)
    return node ? [node] : []
  } catch {
    return []
  }
}

export function snapshotQueryNode(node: Element): QueryNodeSnapshot {
  const element = node as HTMLElement
  const rect = node.getBoundingClientRect()
  return {
    id: element.id || '',
    dataset: { ...element.dataset },
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop,
  }
}

function rectSnapshot(rect: {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}): QueryNodeSnapshot {
  return {
    id: '',
    dataset: {},
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
    scrollLeft: 0,
    scrollTop: 0,
  }
}

function viewportSnapshot(): QueryNodeSnapshot {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  return {
    id: '',
    dataset: {},
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    width,
    height,
    scrollLeft: 0,
    scrollTop: 0,
  }
}

/**
 * Browser implementation of the render-thread DOM capabilities the kernel
 * asks for through `RenderThreadOptions.query`.
 */
export function createBrowserRenderQuery(): RenderQueryAdapter {
  return {
    query(root, selector, all) {
      const element = asElement(root)
      if (!element) return []
      return queryElements(element, selector, all).map(snapshotQueryNode)
    },

    createIntersectionObserver(request: RenderIntersectionRequest, onEntries) {
      const root = asElement(request.root)
      const empty: RenderIntersectionHandle = {
        start: () => undefined,
        disconnect: () => undefined,
      }
      if (!root || !request.selector) return empty
      const targets = queryElements(root, request.selector, request.all)
      if (targets.length === 0) return empty
      let relativeRoot: Element | null = null
      if (request.relativeTo?.type === 'selector' && request.relativeTo.selector) {
        relativeRoot = queryElements(root, request.relativeTo.selector, false)[0] ?? null
      }
      const margins = request.relativeTo?.margins ?? {}
      const rootMargin = [
        margins.top ?? 0,
        margins.right ?? 0,
        margins.bottom ?? 0,
        margins.left ?? 0,
      ].map((value) => `${Number(value) || 0}px`).join(' ')
      let observer: IntersectionObserver | null = null
      return {
        start() {
          if (observer || typeof IntersectionObserver === 'undefined') return
          observer = new IntersectionObserver((entries) => {
            const projected: QueryIntersectionEntry[] = entries.map((entry) => ({
              id: (entry.target as Element).id || '',
              dataset: { ...((entry.target as HTMLElement).dataset ?? {}) },
              boundingClientRect: snapshotQueryNode(entry.target as Element),
              intersectionRect: rectSnapshot(entry.intersectionRect),
              relativeRect: relativeRoot
                ? rectSnapshot(relativeRoot.getBoundingClientRect())
                : viewportSnapshot(),
              intersectionRatio: entry.intersectionRatio,
              time: entry.time,
            }))
            onEntries(projected)
          }, {
            threshold: request.thresholds?.length ? request.thresholds : [0],
            root: relativeRoot,
            rootMargin,
          })
          for (const target of targets) observer.observe(target)
        },
        disconnect() {
          observer?.disconnect()
          observer = null
        },
      }
    },
  }
}
