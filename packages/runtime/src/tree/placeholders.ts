import type { RenderNode } from './protocol'

/**
 * Replace a custom-component node that has no render-side definition with the
 * owner's `componentPlaceholder` tag.
 *
 * Async components and lazy subpackage chunks can reach the render tree before
 * their `define` message does. Instead of mounting an empty component, keep the
 * element visible with the declared built-in placeholder. The nodes themselves
 * stay render-local; the service logic tree is untouched.
 */
export function applyComponentPlaceholders(
  root: RenderNode,
  placeholders: Record<string, string> | undefined,
  hasDefinition: (path: string) => boolean,
): RenderNode {
  if (!placeholders || Object.keys(placeholders).length === 0) return root
  const visit = (node: RenderNode): RenderNode => {
    if (node.type !== 'element') return node
    let next = node
    if (node.component === true && node.componentPath && !hasDefinition(node.componentPath)) {
      const tag = lookupPlaceholder(placeholders, node.componentPath)
      if (tag) {
        const { component: _component, componentPath: _componentPath, ...rest } = node
        next = { ...rest, tag }
      }
    }
    if (next.children && next.children.length > 0) {
      const children = next.children.map(visit)
      if (children.some((child, index) => child !== next.children![index])) {
        next = { ...next, children }
      }
    }
    return next
  }
  return visit(root)
}

function lookupPlaceholder(
  placeholders: Record<string, string>,
  componentPath: string,
): string | undefined {
  return placeholders[componentPath]
    ?? placeholders[componentPath.replace(/^\//, '')]
    ?? placeholders[`/${componentPath}`]
}
