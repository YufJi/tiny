import type {
  ComponentDefinitionPayload,
  ComponentFlow,
  RenderNode,
} from './protocol'

export type BuildComponentFlowOptions = {
  /**
   * Emit one `define` per known component before the node stream.
   *
   * Default `true`, matching the previous eager behaviour: the render thread
   * must be able to resolve a `component` node even when it never saw the
   * definition inline (placeholder replacement, lazy mount).
   */
  eagerDefinitions?: boolean
}

/**
 * Project a service render snapshot into component-flow messages.
 *
 * This is the service half of the WeChat-style registration contract: the
 * `define` messages carry the serialized component definitions, and every
 * `create-node` states whether it is a built-in element or a custom-component
 * boundary (WeChat's `FLOW_CREATE_NODE`). Pure function so the identity parity
 * tests can compare a snapshot with the message stream it produces.
 */
export function buildComponentFlow(
  root: RenderNode,
  definitions: ReadonlyMap<string, ComponentDefinitionPayload>,
  options: BuildComponentFlowOptions = {},
): ComponentFlow[] {
  const messages: ComponentFlow[] = []
  const emitted = new Set<string>()

  const emitDefine = (path: string | undefined): void => {
    if (!path || emitted.has(path)) return
    const definition = definitions.get(path)
    if (!definition) return
    emitted.add(path)
    messages.push({ type: 'define', path, definition })
  }

  if (options.eagerDefinitions !== false) {
    for (const path of definitions.keys()) emitDefine(path)
  } else {
    const visit = (node: RenderNode): void => {
      if (node.type !== 'element') return
      if (node.component === true) emitDefine(node.componentPath)
      for (const child of node.children ?? []) visit(child)
    }
    visit(root)
  }

  // The snapshot travels as a tree: element ids are render-local, so the flow
  // does not need a flat `create-node` stream to address them.
  messages.push({ type: 'tree', root })
  messages.push({ type: 'ready' })
  return messages
}
