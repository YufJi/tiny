import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import type {
  ComponentDefinitionPayload,
  ComponentFlow,
  ComponentFlowDelta,
  ComponentInstanceRef,
  ComponentOwnerDelta,
  RenderComponentIdentity,
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
 * Flatten the service-owned component identities in the same pre-order the
 * render pageframe creates its component tree. This is the Tiny equivalent of
 * the `FLOW_CREATE_NODE` identity stream.
 */
export function collectComponentIdentities(root: RenderNode): RenderComponentIdentity[] {
  const identities: RenderComponentIdentity[] = []
  const visit = (node: RenderNode): void => {
    if (node.type !== 'element') return
    if (node.component === true && node.componentPath && node.id) {
      identities.push({
        id: node.id,
        path: node.componentPath,
        ...wxsPropsOf(node.props),
      })
    }
    for (const child of node.children ?? []) visit(child)
  }
  visit(root)
  return identities
}

/** `change:prop` bindings live on the instance, not on the component path. */
function wxsPropsOf(props: Record<string, unknown> | undefined): { wxsProps?: string } {
  const raw = props?.[TINY_ENGINE_NAMING.wxsPropsAttribute]
  return typeof raw === 'string' && raw.length > 0 ? { wxsProps: raw } : {}
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

/**
 * Component instances grouped by the owner that binds them.
 *
 * The page root owns the page-template components; every component host owns
 * the instances its shadow template created (the snapshot carries that list as
 * `componentInstances`, in document order). `bindFor` on the render side walks
 * one owner's subtree and consumes exactly this list, so an update only needs
 * the owners whose list changed.
 */
export type ComponentOwnerMap = Map<string, ComponentInstanceRef[]>

export function collectComponentOwners(root: RenderNode): ComponentOwnerMap {
  const owners: ComponentOwnerMap = new Map()
  if (root.type === 'element' && root.id) {
    owners.set(root.id, collectComponentIdentities(root))
  }
  const visit = (node: RenderNode): void => {
    if (node.type !== 'element') return
    if (node.component === true && node.id && node.componentInstances?.length) {
      owners.set(node.id, node.componentInstances.map((instance) => ({
        id: instance.id,
        path: instance.path,
        ...(instance.wxsProps ? { wxsProps: instance.wxsProps } : {}),
      })))
    }
    for (const child of node.children ?? []) visit(child)
  }
  visit(root)
  return owners
}

function sameIdentityList(
  previous: ComponentInstanceRef[],
  next: ComponentInstanceRef[],
): boolean {
  if (previous.length !== next.length) return false
  for (let index = 0; index < previous.length; index += 1) {
    const a = previous[index]!
    const b = next[index]!
    // `wxsProps` is static per instance: it rides on `add`, never changes.
    if (a.id !== b.id || a.path !== b.path) return false
  }
  return true
}

function diffOwnerInstances(
  previous: ComponentInstanceRef[],
  next: ComponentInstanceRef[],
): Omit<ComponentOwnerDelta, 'id'> | undefined {
  if (sameIdentityList(previous, next)) return undefined
  const previousIds = new Set(previous.map((instance) => instance.id))
  const nextIds = new Set(next.map((instance) => instance.id))
  const remove = previous
    .filter((instance) => !nextIds.has(instance.id))
    .map((instance) => instance.id)
  const add = next.flatMap((instance, index) => (
    previousIds.has(instance.id)
      ? []
      : [{
          id: instance.id,
          path: instance.path,
          ...(instance.wxsProps ? { wxsProps: instance.wxsProps } : {}),
          index,
        }]
  ))
  const survivingPrevious = previous
    .filter((instance) => nextIds.has(instance.id))
    .map((instance) => instance.id)
  const survivingNext = next
    .filter((instance) => previousIds.has(instance.id))
    .map((instance) => instance.id)
  const reordered = survivingPrevious.length === survivingNext.length
    && survivingPrevious.some((id, index) => id !== survivingNext[index])
  return {
    ...(remove.length > 0 ? { remove } : {}),
    ...(add.length > 0 ? { add } : {}),
    ...(reordered ? { order: next.map((instance) => instance.id) } : {}),
  }
}

/**
 * Per-owner component-instance delta between two service snapshots.
 *
 * Returns `undefined` when no owner changed, which is the steady state of a
 * data-only `setData`. Removals are explicit in both directions: the parent's
 * list drops the instance, and the instance's own owner list (if it had one)
 * releases its descendants.
 */
export function diffComponentOwners(
  previous: RenderNode | undefined,
  next: RenderNode,
): ComponentFlowDelta | undefined {
  const nextOwners = collectComponentOwners(next)
  const previousOwners = previous ? collectComponentOwners(previous) : new Map()
  const owners: ComponentOwnerDelta[] = []
  // The union matters: an owner whose list became empty disappears from the
  // next map, and its previous instances must still be removed explicitly.
  const ownerIds = new Set([...nextOwners.keys(), ...previousOwners.keys()])
  for (const id of ownerIds) {
    const delta = diffOwnerInstances(
      previousOwners.get(id) ?? [],
      nextOwners.get(id) ?? [],
    )
    if (delta) owners.push({ id, ...delta })
  }
  return owners.length > 0 ? { owners } : undefined
}
