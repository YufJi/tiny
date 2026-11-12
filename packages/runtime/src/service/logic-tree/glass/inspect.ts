import { toJsonSafe } from '../../../shared/events'
import type { InspectNode } from '../inspect'

type InspectElementLike = {
  is?: string
  attributes?: { name: string; value: unknown }[]
  class?: string
  style?: string
  childNodes?: unknown[]
  asGeneralComponent?: () => unknown
  shadowRoot?: { childNodes?: unknown[] }
}

const INSPECT_NODE_LIMIT = 2000
const INSPECT_DEPTH_LIMIT = 60
const INSPECT_TEXT_LIMIT = 200

export function inspectComponentTree(component: unknown): InspectNode | null {
  const shadow = (component as { shadowRoot?: { childNodes?: unknown[] } }).shadowRoot
  const nodes = shadow?.childNodes
    ?? (component as { childNodes?: unknown[] }).childNodes
    ?? []
  const budget = { count: 0 }
  const root: InspectNode = {
    id: '0',
    type: 'component',
    tag: (component as { is?: string }).is ?? 'unknown',
    children: nodes
      .map((node, index) => serializeInspectNode(node, `0.${index}`, 1, budget))
      .filter((node): node is InspectNode => node !== null),
  }
  const attributes = serializeAttributes(component as InspectElementLike)
  if (Object.keys(attributes).length > 0) root.attributes = attributes
  const className = readClassName(component as InspectElementLike)
  if (className) root.className = className
  const style = readStyle(component as InspectElementLike)
  if (style) root.style = style
  return root
}

function serializeInspectNode(
  node: unknown,
  id: string,
  depth: number,
  budget: { count: number },
): InspectNode | null {
  if (!node || budget.count >= INSPECT_NODE_LIMIT || depth > INSPECT_DEPTH_LIMIT) return null
  budget.count += 1
  const cast = node as {
    asTextNode?: () => { textContent?: string } | null
    asElement?: () => InspectElementLike | null
  }
  const textNode = cast.asTextNode?.()
  if (textNode) {
    const text = String(textNode.textContent ?? '').trim()
    if (text.length === 0) return null
    return {
      id,
      type: 'text',
      tag: '#text',
      text: text.length > INSPECT_TEXT_LIMIT ? `${text.slice(0, INSPECT_TEXT_LIMIT)}…` : text,
      children: [],
    }
  }
  const element = cast.asElement?.()
  if (!element) return null
  const component = element.asGeneralComponent?.()
  const isComponent = Boolean(component)
  const childNodes = isComponent
    ? (component as { shadowRoot?: { childNodes?: unknown[] } }).shadowRoot?.childNodes
      ?? element.childNodes
      ?? []
    : element.childNodes ?? []
  const attributes = serializeAttributes(element)
  const result: InspectNode = {
    id,
    type: isComponent ? 'component' : 'element',
    tag: String(element.is ?? 'unknown'),
    children: childNodes
      .map((child, index) => serializeInspectNode(child, `${id}.${index}`, depth + 1, budget))
      .filter((child): child is InspectNode => child !== null),
  }
  if (Object.keys(attributes).length > 0) result.attributes = attributes
  const className = readClassName(element)
  if (className) result.className = className
  const style = readStyle(element)
  if (style) result.style = style
  return result
}

function serializeAttributes(element: InspectElementLike): Record<string, string> {
  const attributes: Record<string, string> = {}
  for (const attribute of element.attributes ?? []) {
    if (attribute.name === 'class' || attribute.name === 'style') continue
    const value = toJsonSafe(attribute.value)
    if (value === undefined) continue
    attributes[attribute.name] = typeof value === 'string' ? value : JSON.stringify(value)
  }
  return attributes
}

function readClassName(element: InspectElementLike): string | undefined {
  const name = element.class
  return typeof name === 'string' && name.length > 0 ? name : undefined
}

function readStyle(element: InspectElementLike): string | undefined {
  const style = element.style
  return typeof style === 'string' && style.length > 0 ? style : undefined
}
