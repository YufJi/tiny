/**
 * Component-level projection of the page render tree for the Elements panel.
 *
 * `inspectTree` reads the live render DOM, so it also contains host chrome the
 * mini program never wrote: built-in shadow markup (`div`/`span` wrappers,
 * scroll-view content boxes, swiper dot frames) and the duplicated slot nodes
 * of built-ins such as `text`. The debugger only needs the glass component
 * levels: page → user components → built-in components.
 *
 * Every node the page flow created carries the render tree's node-id attribute;
 * nodes evaluated inside a component definition do not. Keeping the former and
 * flattening the latter leaves exactly the WXML component hierarchy, with text
 * content preserved as leaves.
 *
 * This is debugger presentation policy, so it lives with the panel app rather
 * than in `@tiny/host-web-components` (which stays the render/DOM glue).
 */
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import type { InspectNode } from '@tiny/runtime'

const RENDER_NODE_ATTRIBUTE = TINY_ENGINE_NAMING.nodeIdAttribute

/** Attributes owned by the engine, not by the app author. */
const ENGINE_ATTRIBUTES = new Set([
  RENDER_NODE_ATTRIBUTE,
  TINY_ENGINE_NAMING.hostAttribute,
  TINY_ENGINE_NAMING.styleScopeAttribute,
  'class',
  'style',
])

/** Engine-generated classes: the scope marker, tag markers and scoped copies. */
function visibleClassName(className: string | undefined): string {
  if (!className) return ''
  const kept: string[] = []
  for (const token of className.split(/\s+/)) {
    if (!token) continue
    if (token === TINY_ENGINE_NAMING.scopeMarkerClass) continue
    if (token.startsWith(TINY_ENGINE_NAMING.tagClassPrefix)) continue
    if (token.startsWith(TINY_ENGINE_NAMING.builtinStyleScopePrefix)) continue
    // Scoped class copies look like `tiny-<scope>--<class>`; the `tiny-` prefix
    // is reserved by the engine.
    if (token.startsWith(TINY_ENGINE_NAMING.styleScopePrefix) && token.includes('--')) continue
    if (!kept.includes(token)) kept.push(token)
  }
  return kept.join(' ')
}

function visibleAttributes(attributes: Record<string, string> | undefined): Record<string, string> | undefined {
  if (!attributes) return undefined
  const kept: Record<string, string> = {}
  for (const [name, value] of Object.entries(attributes)) {
    if (ENGINE_ATTRIBUTES.has(name)) continue
    kept[name] = value
  }
  return Object.keys(kept).length > 0 ? kept : undefined
}

/** Nodes created by the page flow (built-in/user components and page nodes). */
function isRenderNode(node: InspectNode): boolean {
  return Boolean(node.attributes?.[RENDER_NODE_ATTRIBUTE])
}

/**
 * A host wrapper rendered with `display: none` (built-in implementation detail,
 * e.g. the hidden slot copy inside `<text>`). Its text must not be hoisted or
 * the panel shows the same content twice.
 */
function isHiddenHostNode(node: InspectNode): boolean {
  if (node.attributes?.hidden !== undefined) return true
  const style = node.style ?? node.attributes?.style ?? ''
  return /display\s*:\s*none/i.test(style)
}

function projectChildren(children: InspectNode[], hiddenAncestor: boolean): InspectNode[] {
  const projected: InspectNode[] = []
  for (const child of children) {
    if (child.type === 'text') {
      if (!hiddenAncestor) projected.push(child)
      continue
    }
    if (isRenderNode(child)) {
      projected.push(projectComponent(child))
      continue
    }
    // Host wrapper: drop the node, keep the components it carries.
    projected.push(...projectChildren(child.children, hiddenAncestor || isHiddenHostNode(child)))
  }
  return projected
}

function projectComponent(node: InspectNode): InspectNode {
  const projected: InspectNode = {
    id: node.id,
    type: 'component',
    tag: node.tag,
    children: projectChildren(node.children, false),
  }
  const attributes = visibleAttributes(node.attributes)
  if (attributes) projected.attributes = attributes
  const className = visibleClassName(node.className)
  if (className) projected.className = className
  if (node.style) projected.style = node.style
  return projected
}

/**
 * Project the raw render tree onto the page's glass component hierarchy.
 *
 * The root is always kept so the panel still shows a tree when the host could
 * not mark the page node yet.
 */
export function projectComponentTree(tree: InspectNode | null): InspectNode | null {
  if (!tree || tree.type === 'text') return null
  return projectComponent(tree)
}
