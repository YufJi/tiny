import * as glassEasel from 'glass-easel'
import type { RenderElement, RenderNode, RenderText } from '@tiny/runtime'
import { createBuiltinComponents } from './index'
import { BUILTIN_COMPONENT_TAGS, type BuiltinComponentTag } from './tags'

type AnyComponent = glassEasel.GeneralComponent

export type GlassRenderTreeOptions = {
  /** DOM container for the root host. Omit for a detached/empty backend tree. */
  container?: HTMLElement
  /** Defaults to the current window; tests can pass EmptyBackendContext. */
  backend?: glassEasel.GeneralBackendContext
  /** Trigger attached/ready after the tree is assembled. Defaults to true. */
  attach?: boolean
}

export type GlassRenderTree = {
  root: AnyComponent
  rootElement: HTMLElement | null
  mount: (node: RenderNode) => void
  getNode: (id: string) => AnyComponent | glassEasel.TextNode | undefined
  destroy: () => void
}

const builtinTags = new Set<string>(BUILTIN_COMPONENT_TAGS)

function applyHostProps(component: AnyComponent, props: Record<string, unknown> | undefined): void {
  const element = component.getBackendElement() as unknown as {
    setAttribute?: (name: string, value: string) => void
  } | null
  if (!element?.setAttribute) return
  for (const [name, value] of Object.entries(props ?? {})) {
    if (name === 'class' || name === 'style' || name === 'id') {
      element.setAttribute(name, String(value ?? ''))
    }
  }
}

/**
 * R1 render-tree foundation: one glass-easel root owns a real built-in
 * component tree. It is intentionally independent of the service tree; the
 * component-flow layer will drive it later.
 */
export function createGlassRenderTree(options: GlassRenderTreeOptions = {}): GlassRenderTree {
  const backend = options.backend ?? new glassEasel.CurrentWindowBackendContext()
  const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
  space.updateComponentOptions({
    hostNodeTagName: 'tiny-*',
    reflectToAttributes: true,
  })
  const definitions = createBuiltinComponents(space)
  for (const [tag, definition] of Object.entries(definitions)) {
    space.registerComponent(tag, definition)
  }
  const containers = new Map<string, glassEasel.GeneralComponentDefinition>()
  const nodes = new Map<string, AnyComponent | glassEasel.TextNode>()

  const containerDefinition = (tag: string): glassEasel.GeneralComponentDefinition => {
    const existing = containers.get(tag)
    if (existing) return existing
    const definition = space.defineComponent({
      is: `tiny-render-container:${tag}`,
      options: {
        hostNodeTagName: `tiny-${tag}`,
        reflectToAttributes: true,
      },
    }).general()
    containers.set(tag, definition)
    space.registerComponent(tag, definition)
    return definition
  }

  const rootDefinition = space.defineComponent({
    is: 'tiny-render-root',
    options: {
      hostNodeTagName: 'tiny-page',
      reflectToAttributes: true,
    },
  }).general()
  const root = glassEasel.Component.createWithContext('page', rootDefinition, backend)
  const rootElement = root.getBackendElement() as unknown as HTMLElement | null
  if (rootElement && options.container) options.container.replaceChildren(rootElement)

  const appendChild = (parent: AnyComponent, child: AnyComponent | glassEasel.TextNode): void => {
    parent.appendChild(child as never)
  }

  type ShadowLike = {
    createTextNode: (text: string) => glassEasel.TextNode
    createComponentByDef: (
      tagName: string,
      definition: glassEasel.GeneralComponentDefinition,
    ) => AnyComponent
  }

  const lightShadow = (owner: AnyComponent): ShadowLike => {
    const ownerShadow = (owner as unknown as { ownerShadowRoot?: ShadowLike }).ownerShadowRoot
    return ownerShadow ?? (root.shadowRoot as unknown as ShadowLike)
  }

  const createText = (node: RenderText, owner: AnyComponent): glassEasel.TextNode => {
    const text = lightShadow(owner).createTextNode(node.text)
    nodes.set(node.id, text)
    return text
  }

  const createElement = (node: RenderElement, owner: AnyComponent): AnyComponent => {
    const builtin = builtinTags.has(node.tag)
    const definition = builtin
      ? definitions[node.tag as BuiltinComponentTag]
      : containerDefinition(node.tag)
    if (!definition) throw new Error(`no render definition for tag: ${node.tag}`)
    const component = lightShadow(owner).createComponentByDef(node.tag, definition)
    nodes.set(node.id, component)
    if (builtin) {
      const props = { ...(node.props ?? {}) }
      delete props.class
      delete props.style
      delete props.id
      component.setData(props as never)
    }
    applyHostProps(component, node.props)
    const childOwner = component
    for (const child of node.children ?? []) {
      appendChild(component, child.type === 'text'
        ? createText(child, childOwner)
        : createElement(child, childOwner))
    }
    return component
  }

  return {
    root,
    rootElement,
    mount(node) {
      const children = node.type === 'element' ? node.children ?? [] : []
      const shadow = root.shadowRoot as unknown as {
        appendChild: (child: unknown) => void
      }
      for (const child of children) {
        shadow.appendChild(child.type === 'text'
          ? createText(child, root)
          : createElement(child, root))
      }
      if (options.attach !== false) glassEasel.Element.pretendAttached(root)
    },
    getNode(id) {
      return nodes.get(id)
    },
    destroy() {
      nodes.clear()
      ;(root as unknown as { destroy?: () => void }).destroy?.()
    },
  }
}
