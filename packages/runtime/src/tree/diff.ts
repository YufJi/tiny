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

function childKey(node: RenderNode, index: number): string {
  return node.type === 'element' && node.key ? `key:${node.key}` : `id:${node.id}:${index}`
}

function diffChildren(
  previous: RenderElement,
  next: RenderElement,
  patches: RenderPatch[],
): void {
  const previousChildren = previous.children ?? []
  const nextChildren = next.children ?? []
  const previousKeys = new Map(
    previousChildren.map((child, index) => [childKey(child, index), index]),
  )
  const nextKeys = new Set(nextChildren.map((child, index) => childKey(child, index)))

  // Removals are emitted back-to-front so earlier indexes stay valid.
  for (let index = previousChildren.length - 1; index >= 0; index -= 1) {
    const key = childKey(previousChildren[index]!, index)
    if (nextKeys.has(key)) continue
    patches.push({ type: 'remove', parentId: next.id, index, count: 1 })
  }

  const kept = previousChildren.filter((child, index) => nextKeys.has(childKey(child, index)))
  for (const [index, child] of nextChildren.entries()) {
    const previousIndex = previousKeys.get(childKey(child, index))
    const previousChild = previousIndex === undefined ? undefined : previousChildren[previousIndex]
    if (previousChild) {
      diffNode(previousChild, child, patches)
      continue
    }
    patches.push({ type: 'insert', parentId: next.id, index, node: child })
  }

  if (kept.length === nextChildren.length) {
    const moves: Array<{ from: number; to: number }> = []
    const order = [...kept]
    for (const [target, child] of nextChildren.entries()) {
      const current = order.findIndex((candidate) => candidate.id === child.id)
      if (current === target) continue
      const [moved] = order.splice(current, 1)
      order.splice(target, 0, moved!)
      moves.push({ from: current, to: target })
    }
    if (moves.length > 0) patches.push({ type: 'reorder', parentId: next.id, moves })
  }
}

function diffNode(previous: RenderNode, next: RenderNode, patches: RenderPatch[]): void {
  if (previous.type !== next.type) {
    patches.push({ type: 'replace', id: previous.id, node: next })
    return
  }
  if (previous.type === 'text' && next.type === 'text') {
    if (previous.text !== next.text) {
      patches.push({ type: 'text', id: next.id, text: next.text })
    }
    return
  }
  if (previous.type !== 'element' || next.type !== 'element') return
  if (previous.tag !== next.tag || previous.key !== next.key) {
    patches.push({ type: 'replace', id: previous.id, node: next })
    return
  }
  const props = diffProps(previous.props, next.props)
  if (props) patches.push({ type: 'props', id: next.id, ...props })
  diffChildren(previous, next, patches)
}

export function diffRenderTree(previous: RenderNode, next: RenderNode): RenderPatch[] {
  const patches: RenderPatch[] = []
  diffNode(previous, next, patches)
  return patches
}
