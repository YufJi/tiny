import type { ViewNode, ViewPatch } from './protocol'
import { RENDER_TEXT_TAG } from '../tree/protocol'

function sameRecord(
  left: Record<string, string> | undefined,
  right: Record<string, string> | undefined,
): boolean {
  const leftKeys = Object.keys(left ?? {})
  const rightKeys = Object.keys(right ?? {})
  if (leftKeys.length !== rightKeys.length) return false
  for (const key of leftKeys) {
    if ((left ?? {})[key] !== (right ?? {})[key]) return false
  }
  return true
}

function sameEvents(left: ViewNode['events'], right: ViewNode['events']): boolean {
  return JSON.stringify(left ?? []) === JSON.stringify(right ?? [])
}

function diffNode(
  previous: ViewNode,
  next: ViewNode,
  parentId: string,
  index: number,
  patches: ViewPatch[],
): void {
  if (previous.tag !== next.tag) {
    patches.push({ type: 'remove', parentId, index })
    patches.push({ type: 'insert', parentId, index, node: next })
    return
  }
  if (next.tag === RENDER_TEXT_TAG) {
    if (previous.text !== next.text) {
      patches.push({ type: 'text', viewId: next.viewId, text: next.text ?? '' })
    }
    return
  }
  const sameScopes = JSON.stringify(previous.styleScopes ?? [])
    === JSON.stringify(next.styleScopes ?? [])
  if (previous.className !== next.className || !sameScopes) {
    patches.push({
      type: 'class',
      viewId: next.viewId,
      className: next.className ?? '',
      ...(next.styleScopes ? { styleScopes: next.styleScopes } : {}),
    })
  }
  if (previous.style !== next.style) {
    patches.push({ type: 'style', viewId: next.viewId, style: next.style ?? '' })
  }
  const previousAttributes = previous.attributes ?? {}
  const nextAttributes = next.attributes ?? {}
  for (const name of new Set([...Object.keys(previousAttributes), ...Object.keys(nextAttributes)])) {
    if (previousAttributes[name] !== nextAttributes[name]) {
      patches.push({
        type: 'attribute',
        viewId: next.viewId,
        name,
        value: nextAttributes[name] ?? null,
      })
    }
  }
  if (!sameRecord(previous.dataset, next.dataset)) {
    patches.push({ type: 'dataset', viewId: next.viewId, dataset: next.dataset ?? {} })
  }
  if (!sameEvents(previous.events, next.events)) {
    patches.push({ type: 'events', viewId: next.viewId, events: next.events ?? [] })
  }

  const previousChildren = previous.children ?? []
  const nextChildren = next.children ?? []
  const sameIds = previousChildren.length === nextChildren.length
    && previousChildren.every((child, childIndex) => child.viewId === nextChildren[childIndex]?.viewId)
  if (sameIds) {
    for (const [childIndex, child] of nextChildren.entries()) {
      diffNode(previousChildren[childIndex]!, child, next.viewId, childIndex, patches)
    }
    return
  }
  // Rebuild the child list when ids or order changed. This keeps the patch
  // protocol simple and is still bounded by the changed subtree.
  for (let childIndex = previousChildren.length - 1; childIndex >= 0; childIndex -= 1) {
    patches.push({ type: 'remove', parentId: next.viewId, index: childIndex })
  }
  for (const [childIndex, child] of nextChildren.entries()) {
    patches.push({ type: 'insert', parentId: next.viewId, index: childIndex, node: child })
  }
}

export function diffView(previous: ViewNode, next: ViewNode): ViewPatch[] {
  const patches: ViewPatch[] = []
  if (previous.tag !== next.tag) {
    return [{ type: 'remove', parentId: 'root', index: 0 }, { type: 'insert', parentId: 'root', index: 0, node: next }]
  }
  const previousChildren = previous.children ?? []
  const nextChildren = next.children ?? []
  const sameIds = previousChildren.length === nextChildren.length
    && previousChildren.every((child, index) => child.viewId === nextChildren[index]?.viewId)
  if (!sameIds) {
    for (let index = previousChildren.length - 1; index >= 0; index -= 1) {
      patches.push({ type: 'remove', parentId: next.viewId, index })
    }
    for (const [index, child] of nextChildren.entries()) {
      patches.push({ type: 'insert', parentId: next.viewId, index, node: child })
    }
    return patches
  }
  for (const [index, child] of nextChildren.entries()) {
    diffNode(previousChildren[index]!, child, next.viewId, index, patches)
  }
  return patches
}
