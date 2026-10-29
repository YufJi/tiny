import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import { cloneJsonSafe } from '../data'
import type { LogicBackendElement, LogicTreeAdapter } from '../tree/logic'
import { findLogicNodeByElement, queryLogicNodes } from '../tree/logic'
import type { MiniProgramPageInstance } from './page-instance'

/**
 * WXS event handlers run inside the logic tree and receive a component
 * descriptor as their second argument:
 *
 * ```js
 * function touchmove(event, ins) {
 *   ins.selectComponent('.movable').setStyle({ left: '10px' })
 * }
 * ```
 *
 * The descriptor is built service-side because that is where the logic tree,
 * the page/component data and the methods live. The compiler-side wrapper
 * (`Q.C` in `@tiny/template-compiler`) only knows the element the listener is
 * attached to, so it asks this host for the descriptor through a global hook.
 */

/** Global the generated event wrapper reads; one service thread per app. */
const WXS_EVENT_HOST_KEY = '__tinyWxsEventHost'

export type WxsEventHostOptions = {
  getLogicTree: () => LogicTreeAdapter | undefined
  getPage: (pageId: string) => MiniProgramPageInstance | undefined
  /** Re-diff the page after a WXS mutation so the render thread picks it up. */
  requestRenderUpdate: (pageId: string) => void
  onDiagnostic?: (pageId: string, code: string, message: string, details?: unknown) => void
}

type DescriptorScope = {
  /** Element the descriptor acts on (`setStyle`, `getDataset`). */
  node: LogicBackendElement
  /** Page/component root that `selectComponent` and `getData` are scoped to. */
  root: LogicBackendElement
  pageId: string
}

/** `ins` and every descriptor returned by `selectComponent`. */
export type WxsComponentDescriptor = {
  selectComponent: (selector: string) => WxsComponentDescriptor | null
  selectAllComponents: (selector: string) => WxsComponentDescriptor[]
  getDataset: () => Record<string, unknown>
  getData: () => Record<string, unknown>
  setStyle: (style: unknown) => void
  callMethod: (name: string, ...args: unknown[]) => unknown
  triggerEvent: (name: string, detail?: unknown, options?: Record<string, unknown>) => unknown
}

const camelToKebab = (name: string): string => {
  if (name.startsWith('--')) return name
  return name.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)
}

/** Parse `a: b; c: d` into an ordered style map, tolerating stray semicolons. */
function parseStyleText(text: string): Map<string, string> {
  const entries = new Map<string, string>()
  for (const part of text.split(';')) {
    const separator = part.indexOf(':')
    if (separator <= 0) continue
    const name = part.slice(0, separator).trim()
    const value = part.slice(separator + 1).trim()
    if (name && value) entries.set(name, value)
  }
  return entries
}

function serializeStyle(entries: Map<string, string>): string {
  return [...entries].map(([name, value]) => `${name}: ${value};`).join(' ')
}

export function installWxsEventHost(options: WxsEventHostOptions): () => void {
  const globalObject = globalThis as unknown as Record<string, unknown>
  const previous = globalObject[WXS_EVENT_HOST_KEY]
  const host = {
    descriptorFor: (element: unknown): WxsComponentDescriptor | undefined => {
      const tree = options.getLogicTree()
      const node = findLogicNodeByElement(element)
      if (!tree || !node) return undefined
      const pageId = tree.glass.pageIdFor(element) ?? ''
      if (!pageId) return undefined
      // `ins.selectComponent()` searches the page/component that owns the
      // binding, not the element the listener was attached to.
      return createDescriptor(options, tree, { node, root: ownerRoot(node), pageId })
    },
  }
  globalObject[WXS_EVENT_HOST_KEY] = host
  return () => {
    if (globalObject[WXS_EVENT_HOST_KEY] === host) globalObject[WXS_EVENT_HOST_KEY] = previous
  }
}

function createDescriptor(
  options: WxsEventHostOptions,
  tree: LogicTreeAdapter,
  scope: DescriptorScope,
): WxsComponentDescriptor {
  const { node, root, pageId } = scope
  return {
    selectComponent(selector: string) {
      const [match] = queryLogicNodes(root, String(selector), false)
      return match ? createDescriptor(options, tree, { node: match, root: match, pageId }) : null
    },
    selectAllComponents(selector: string) {
      return queryLogicNodes(root, String(selector), true)
        .map((match) => createDescriptor(options, tree, { node: match, root: match, pageId }))
    },
    getDataset() {
      return Object.fromEntries(node.dataset)
    },
    getData() {
      return cloneJsonSafe(ownerData(options, tree, scope) ?? {})
    },
    setStyle(style: unknown) {
      if (!style || typeof style !== 'object') return
      const updates = new Map<string, string>()
      for (const [rawName, rawValue] of Object.entries(style as Record<string, unknown>)) {
        if (rawValue === undefined || rawValue === null) continue
        updates.set(camelToKebab(rawName), String(rawValue))
      }
      if (updates.size === 0) return
      // WXS setStyle merges into the existing inline style; the element keeps
      // its WXML `style` (position/size) while the handler moves it.
      const merged = parseStyleText(node.styleText)
      for (const [name, value] of updates) merged.set(name, value)
      node.setStyle(serializeStyle(merged))
      options.requestRenderUpdate(pageId)
    },
    callMethod(name: string, ...args: unknown[]) {
      return callOwnerMethod(options, tree, scope, String(name), args)
    },
    triggerEvent(name: string, detail?: unknown, options?: Record<string, unknown>) {
      const element = node.__wxElement as unknown as {
        triggerEvent?: (eventName: string, eventDetail?: unknown, eventOptions?: unknown) => unknown
      } | undefined
      return element?.triggerEvent?.(String(name), detail, options)
    },
  }
}

/** Apply a WXS effect forwarded from the render thread. */
export function dispatchWxsEffect(
  tree: LogicTreeAdapter,
  pageId: string,
  effect: {
    kind: 'callMethod' | 'triggerEvent'
    viewId: string
    method?: string
    args?: unknown[]
    name?: string
    detail?: unknown
    options?: Record<string, unknown>
  },
  options: WxsEventHostOptions,
): void {
  const node = tree.findNodeByViewId(effect.viewId)
  if (!node) return
  const descriptor = createDescriptor(options, tree, {
    node,
    root: ownerRoot(node),
    pageId,
  })
  if (effect.kind === 'callMethod' && effect.method) {
    descriptor.callMethod(effect.method, ...(effect.args ?? []))
  } else if (effect.kind === 'triggerEvent' && effect.name) {
    descriptor.triggerEvent(effect.name, effect.detail, effect.options)
  }
}

/** Nearest component (or page) node above an element: the descriptor root. */
function ownerRoot(node: LogicBackendElement): LogicBackendElement {
  let current: LogicBackendElement | null = node
  for (let depth = 0; current && depth < 64; depth += 1) {
    if (current.nodeType === 'component') return current
    // Template nodes sit inside the shadow tree; hop back to its host.
    if (current.nodeType === 'root' && current.host) {
      current = current.host
      continue
    }
    current = current.parentNode
  }
  return node
}

/** Owning component instance; page-level descriptors return undefined. */
function ownerComponent(
  tree: LogicTreeAdapter,
  scope: DescriptorScope,
): Record<string, unknown> | undefined {
  if (scope.root.nodeType !== 'component' || !scope.root.__wxElement) return undefined
  const pageRoot = tree.glass.getMountedComponentByPageId(scope.pageId)
  const element = scope.root.__wxElement as unknown as {
    asGeneralComponent?: () => Record<string, unknown>
  }
  const component = element.asGeneralComponent?.() ?? element as unknown as Record<string, unknown>
  return component === (pageRoot as unknown) ? undefined : component
}

function ownerData(
  options: WxsEventHostOptions,
  tree: LogicTreeAdapter,
  scope: DescriptorScope,
): Record<string, unknown> | undefined {
  const component = ownerComponent(tree, scope)
  if (component) return component.data as Record<string, unknown> | undefined
  return options.getPage(scope.pageId)?.data
}

function callOwnerMethod(
  options: WxsEventHostOptions,
  tree: LogicTreeAdapter,
  scope: DescriptorScope,
  name: string,
  args: unknown[],
): unknown {
  const component = ownerComponent(tree, scope)
  if (component) {
    const method = (component as Record<string, unknown>)[name]
    if (typeof method === 'function') {
      return (method as (...inner: unknown[]) => unknown).apply(component, args)
    }
  } else {
    const page = options.getPage(scope.pageId)
    if (page) {
      try {
        return page.invokeMethod(name, args)
      } catch {
        // Reported below; a missing handler must not break the WXS frame.
      }
    }
  }
  options.onDiagnostic?.(
    scope.pageId,
    DIAGNOSTIC_CODES.EVENT_HANDLER_MISSING,
    `WXS callMethod("${name}") has no handler on the ${component ? 'component' : 'page'}`,
    { method: name, from: 'wxs' },
  )
  return undefined
}
