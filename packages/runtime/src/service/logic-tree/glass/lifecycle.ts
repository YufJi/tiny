import * as glassEasel from 'glass-easel'
import type { LogicBackendElement } from '../backend'

export type ComponentSnapshot = {
  componentId: string
  path: string
  parentComponentId: string | null
  tag: string
  id: string
  class: string
  data: Record<string, unknown>
}

export class GlassPageTreeManager {
  readonly pageId: string
  readonly path: string
  readonly instances = new Map<string, glassEasel.GeneralComponent>()
  readonly componentUsage = new Map<string, number>()
  readonly relationNodes = new Map<string, glassEasel.GeneralComponent[]>()
  readonly linkedTargets = new Map<string, Set<glassEasel.GeneralComponent>>()
  component?: glassEasel.GeneralComponent
  tabBarComponent?: glassEasel.GeneralComponent
  tabBarRoot?: LogicBackendElement
  router?: unknown

  constructor(pageId: string, path: string) {
    this.pageId = pageId
    this.path = path
  }

  attachComponent(component: glassEasel.GeneralComponent): void {
    this.component = component
  }

  attachTabBar(component: glassEasel.GeneralComponent, root: LogicBackendElement): void {
    this.tabBarComponent = component
    this.tabBarRoot = root
  }

  clear(): void {
    this.component = undefined
    this.tabBarComponent = undefined
    this.tabBarRoot = undefined
    this.router = undefined
    this.instances.clear()
    this.componentUsage.clear()
    this.relationNodes.clear()
    this.linkedTargets.clear()
  }
}

/**
 * WeChat's operation flow fires one `ready` callback for each component
 * created by the update:
 *
 *   shadow descendants -> component -> light descendants
 *
 * This is observable when a slot child and a host-template child are both
 * present (`child(inner)`, host, `child(slot)`).
 */
export function componentReadyOrder(
  root: glassEasel.GeneralComponent,
): glassEasel.GeneralComponent[] {
  const order: glassEasel.GeneralComponent[] = []
  const visited = new Set<object>()
  const visitNodes = (nodes: ArrayLike<unknown>): void => {
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index]
      if (!node || glassEasel.TextNode.isTextNode(node)) continue
      if (glassEasel.Component.isComponent(node)) {
        visitComponent(node)
        continue
      }
      const element = node as { childNodes?: ArrayLike<unknown> }
      if (element.childNodes) visitNodes(element.childNodes)
    }
  }
  const visitComponent = (component: glassEasel.GeneralComponent): void => {
    const key = component as unknown as object
    if (visited.has(key)) return
    visited.add(key)
    const shadowRoot = component.shadowRoot as
      | { childNodes: ArrayLike<unknown> }
      | null
      | undefined
    if (shadowRoot) visitNodes(shadowRoot.childNodes)
    order.push(component)
    visitNodes(component.childNodes)
  }
  visitComponent(root)
  return order
}
