/**
 * Native host contract for the split tree. A native host maps these operations
 * onto its own view system (iOS/Android/macOS); the adapter keeps the service
 * node ids and patch semantics identical to the web glass render tree.
 */
import { RENDER_TEXT_TAG } from './protocol'
import type { RenderElement, RenderNode, RenderPatch, RenderText } from './protocol'
import type { TreeEventPayload, TreeRenderer } from '../tree-thread'

export type NativeNodeSpec = {
  id: string
  tag: string
  text?: string
  props?: Record<string, unknown>
  dataset?: Record<string, unknown>
  scopes?: string[]
  scopeChain?: string[]
  externalClasses?: Record<string, string[]>
  events?: Array<{ name: string; capture?: boolean }>
}

export type NativeTreeHost = {
  clear: () => void
  createNode: (spec: NativeNodeSpec) => void
  setText: (id: string, text: string) => void
  setProps: (id: string, props: Record<string, unknown>, removed?: string[]) => void
  insert: (parentId: string, index: number, id: string) => void
  remove: (parentId: string, index: number, count: number) => void
  reorder: (parentId: string, moves: Array<{ from: number; to: number }>) => void
  replace: (id: string, spec: NativeNodeSpec) => void
  measure?: (ids: string[]) => Record<string, unknown>
  query?: (selector: string, all: boolean) => unknown[]
}

export type NativeTreeRenderer = TreeRenderer & {
  dispatchEvent: (event: TreeEventPayload) => void
  getNode: (id: string) => RenderNode | undefined
}

const specOf = (node: RenderNode): NativeNodeSpec => (
  node.type === 'text'
    ? { id: node.id, tag: RENDER_TEXT_TAG, text: node.text }
    : {
        id: node.id,
        tag: node.tag,
        ...(node.props ? { props: node.props } : {}),
        ...(node.dataset ? { dataset: node.dataset } : {}),
        ...(node.scopes ? { scopes: node.scopes } : {}),
        ...(node.scopeChain ? { scopeChain: node.scopeChain } : {}),
        ...(node.externalClasses ? { externalClasses: node.externalClasses } : {}),
        ...(node.events ? { events: node.events } : {}),
      }
)

export function createNativeTreeRenderer(host: NativeTreeHost): NativeTreeRenderer {
  const nodes = new Map<string, RenderNode>()
  let eventSink: ((event: TreeEventPayload) => void) | undefined
  let styles: string[] = []
  let pagePath = ''

  const create = (node: RenderNode): void => {
    nodes.set(node.id, node)
    host.createNode(specOf(node))
  }

  const build = (node: RenderElement): void => {
    create(node)
    for (const [index, child] of (node.children ?? []).entries()) {
      if (child.type === 'element') build(child)
      else create(child)
      host.insert(node.id, index, child.id)
    }
  }

  const mount = (root: RenderNode): void => {
    nodes.clear()
    host.clear()
    if (root.type === 'text') {
      create(root)
      return
    }
    build(root)
  }

  const applyPatches = (patches: RenderPatch[]): void => {
    for (const patch of patches) {
      if (patch.type === 'text') {
        const node = nodes.get(patch.id)
        if (node?.type === 'text') {
          node.text = patch.text
          host.setText(patch.id, patch.text)
        }
        continue
      }
      if (patch.type === 'props') {
        const node = nodes.get(patch.id)
        if (node?.type !== 'element') continue
        const props = { ...(node.props ?? {}), ...patch.props }
        for (const name of patch.removed ?? []) delete props[name]
        node.props = props
        host.setProps(patch.id, props, patch.removed)
        continue
      }
      if (patch.type === 'insert') {
        const parent = nodes.get(patch.parentId)
        if (parent?.type !== 'element') continue
        const node = patch.node
        nodes.set(node.id, node)
        host.createNode(specOf(node))
        parent.children ??= []
        parent.children.splice(patch.index, 0, node)
        host.insert(patch.parentId, patch.index, node.id)
        continue
      }
      if (patch.type === 'remove') {
        const parent = nodes.get(patch.parentId)
        if (parent?.type !== 'element') continue
        for (const child of (parent.children ?? []).splice(patch.index, patch.count)) {
          nodes.delete(child.id)
        }
        host.remove(patch.parentId, patch.index, patch.count)
        continue
      }
      if (patch.type === 'reorder') {
        const parent = nodes.get(patch.parentId)
        if (parent?.type !== 'element') continue
        for (const move of patch.moves) {
          const children = parent.children ?? []
          if (move.from < 0 || move.from >= children.length) continue
          const [child] = children.splice(move.from, 1)
          if (child) children.splice(move.to, 0, child)
        }
        host.reorder(patch.parentId, patch.moves)
        continue
      }
      if (patch.type === 'replace') {
        const node = patch.node
        nodes.set(patch.id, node)
        host.replace(patch.id, specOf(node))
      }
    }
  }

  return {
    mount,
    applyPatches,
    applyStyles: (value) => {
      styles = value
    },
    setPagePath: (value) => {
      pagePath = value
    },
    setEventSink: (sink) => {
      eventSink = sink
    },
    inspectTree: () => {
      const toInspect = (node: RenderNode): unknown => (
        node.type === 'text'
          ? { id: node.id, type: 'text', tag: RENDER_TEXT_TAG, text: node.text, children: [] }
          : {
              id: node.id,
              type: 'element',
              tag: node.tag,
              attributes: Object.fromEntries(
                Object.entries(node.props ?? {}).map(([key, value]) => [key, String(value ?? '')]),
              ),
              className: String(node.props?.class ?? ''),
              style: String(node.props?.style ?? ''),
              children: (node.children ?? []).map(toInspect),
            }
      )
      const root = [...nodes.values()].find((node) => node.type === 'element')
      return root ? toInspect(root) : null
    },
    measure: (ids) => host.measure?.(ids) ?? {},
    query: (selector, all) => host.query?.(selector, all) ?? [],
    dispatchEvent: (event) => {
      eventSink?.(event)
    },
    getNode: (id) => nodes.get(id),
  }
}
