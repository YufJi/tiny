import type { RenderElement, RenderNode, RenderPatch } from './protocol'

function sameProps(
  left: Record<string, unknown> | undefined,
  right: Record<string, unknown> | undefined,
): boolean {
  const leftKeys = Object.keys(left ?? {})
  const rightKeys = Object.keys(right ?? {})
  if (leftKeys.length !== rightKeys.length) return false
  for (const key of leftKeys) {
    if (!Object.is((left ?? {})[key], (right ?? {})[key])) return false
  }
  return true
}

function diffProps(
  previous: Record<string, unknown> | undefined,
  next: Record<string, unknown> | undefined,
): { props: Record<string, unknown>; removed: string[] } | null {
  if (sameProps(previous, next)) return null
  const props: Record<string, unknown> = {}
  const removed: string[] = []
  for (const [key, value] of Object.entries(next ?? {})) {
    if (!Object.is((previous ?? {})[key], value)) props[key] = value
  }
  for (const key of Object.keys(previous ?? {})) {
    if (!(key in (next ?? {}))) removed.push(key)
  }
  return { props, removed }
}

/**
 * Structural mirror of the previous tree.
 *
 * Patches address elements by a component-scoped locator (`owner#index.path`)
 * instead of a shared node id, so every operation is simulated here first: the
 * locator sent to the render side is always the one valid at that point of the
 * patch sequence. Components (and the page root) keep their shared id.
 */
type Mirror = {
  node: RenderNode
  parent: Mirror | null
  children: Mirror[]
}

function buildMirror(node: RenderNode, parent: Mirror | null): Mirror {
  const mirror: Mirror = { node, parent, children: [] }
  if (node.type === 'element') {
    mirror.children = (node.children ?? []).map((child) => buildMirror(child, mirror))
  }
  return mirror
}

function isOwner(node: RenderNode, parent: Mirror | null): boolean {
  if (node.type !== 'element') return false
  return parent === null || node.component === true
}

function ownerOf(mirror: Mirror): Mirror | null {
  let current = mirror.parent
  while (current) {
    if (isOwner(current.node, current.parent)) return current
    current = current.parent
  }
  return null
}

function indexOf(mirror: Mirror): number {
  return mirror.parent ? mirror.parent.children.indexOf(mirror) : -1
}

function pathOf(mirror: Mirror): number[] {
  const segments: number[] = []
  let current: Mirror = mirror
  while (current.parent) {
    segments.unshift(indexOf(current))
    if (isOwner(current.parent.node, current.parent.parent)) break
    current = current.parent
  }
  return segments
}

/** Node id for components/root, `owner#index.path` for elements and text. */
function targetOf(mirror: Mirror): string {
  if (isOwner(mirror.node, mirror.parent)) return mirror.node.id ?? ''
  const owner = ownerOf(mirror)
  return `${owner?.node.id ?? ''}#${pathOf(mirror).join('.')}`
}

function diffNode(mirror: Mirror, next: RenderNode, patches: RenderPatch[]): void {
  const previous = mirror.node
  if (previous.type !== next.type) {
    patches.push({ type: 'replace', target: targetOf(mirror), node: next })
    mirror.node = next
    mirror.children = []
    return
  }
  if (previous.type === 'text' && next.type === 'text') {
    if (previous.text !== next.text) {
      patches.push({ type: 'text', target: targetOf(mirror), text: next.text })
    }
    mirror.node = next
    return
  }
  if (previous.type !== 'element' || next.type !== 'element') return
  if (previous.tag !== next.tag || previous.key !== next.key) {
    patches.push({ type: 'replace', target: targetOf(mirror), node: next })
    mirror.node = next
    mirror.children = []
    return
  }
  const props = diffProps(previous.props, next.props)
  if (props) patches.push({ type: 'props', target: targetOf(mirror), ...props })
  diffChildren(mirror, next, patches)
  mirror.node = next
}

function childTokens(nodes: RenderNode[]): string[] {
  let unkeyed = 0
  return nodes.map((node) => {
    const key = node.type === 'element' ? node.key : undefined
    if (key !== undefined) return `k:${key}`
    const token = `u:${unkeyed}`
    unkeyed += 1
    return token
  })
}

/**
 * A node keeps its identity only when type, tag and component path agree.
 * Element ids no longer take part: identity is positional/keyed, like the
 * WeChat view tree.
 */
function compatible(previous: RenderNode, next: RenderNode): boolean {
  if (previous.type !== next.type) return false
  if (previous.type === 'text') return true
  if (next.type !== 'element') return false
  return previous.tag === next.tag
    && previous.componentPath === next.componentPath
    && previous.key === next.key
}

function diffChildren(parent: Mirror, next: RenderElement, patches: RenderPatch[]): void {
  const nextChildren = next.children ?? []
  const parentTarget = targetOf(parent)
  const previous = parent.children
  const previousTokens = childTokens(previous.map((entry) => entry.node))
  const nextTokens = childTokens(nextChildren)
  const nextTokenSet = new Set(nextTokens)
  const previousTokenSet = new Set(previousTokens)

  // Removals run back-to-front, so the indexes of the remaining children stay
  // valid in the mirror (and in the render tree).
  for (let index = previous.length - 1; index >= 0; index -= 1) {
    if (nextTokenSet.has(previousTokens[index]!)) continue
    patches.push({ type: 'remove', parent: parentTarget, index, count: 1 })
    previous.splice(index, 1)
    previousTokens.splice(index, 1)
  }

  // Inserts run left-to-right: the mirror already matches the next prefix.
  for (let index = 0; index < nextChildren.length; index += 1) {
    const token = nextTokens[index]!
    if (previousTokenSet.has(token)) continue
    const child = nextChildren[index]!
    patches.push({ type: 'insert', parent: parentTarget, index, node: child })
    previous.splice(index, 0, buildMirror(child, parent))
    previousTokens.splice(index, 0, token)
    previousTokenSet.add(token)
  }

  // Reorder the matched children into the next order.
  const order = previousTokens.slice()
  const moves: Array<{ from: number; to: number }> = []
  for (let index = 0; index < nextTokens.length; index += 1) {
    const token = nextTokens[index]!
    if (order[index] === token) continue
    const current = order.indexOf(token)
    if (current < 0) continue
    order.splice(current, 1)
    order.splice(index, 0, token)
    const [moved] = previous.splice(current, 1)
    if (moved) previous.splice(index, 0, moved)
    previousTokens.splice(current, 1)
    previousTokens.splice(index, 0, token)
    moves.push({ from: current, to: index })
  }
  if (moves.length > 0) patches.push({ type: 'reorder', parent: parentTarget, moves })

  for (let index = 0; index < nextChildren.length; index += 1) {
    const mirror = previous[index]
    const child = nextChildren[index]!
    if (!mirror) continue
    if (!compatible(mirror.node, child)) {
      patches.push({ type: 'replace', target: targetOf(mirror), node: child })
      mirror.node = child
      mirror.children = []
      continue
    }
    diffNode(mirror, child, patches)
  }
}

export function diffRenderTree(previous: RenderNode, next: RenderNode): RenderPatch[] {
  const patches: RenderPatch[] = []
  if (previous.type !== next.type) {
    return [{ type: 'replace', target: previous.id ?? '', node: next }]
  }
  diffNode(buildMirror(previous, null), next, patches)
  return patches
}
