import * as glassEasel from 'glass-easel'
import type { RenderElement, RenderNode, RenderPatch, RenderText } from '@tiny/runtime'
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
  /** Forward DOM events from render nodes back to the logic layer. */
  onEvent?: (event: { id: string; name: string; native: Record<string, unknown> }) => void
}

export type GlassRenderTree = {
  root: AnyComponent
  rootElement: HTMLElement | null
  applyStyles?: (styles: string[]) => void
  setEventSink?: (sink: (event: { id: string; name: string; native: Record<string, unknown> }) => void) => void
  setDiagnosticSink?: (sink: (diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void) => void
  mount: (node: RenderNode) => void
  applyPatches: (patches: RenderPatch[]) => void
  getNode: (id: string) => AnyComponent | glassEasel.TextNode | undefined
  destroy: () => void
}

const builtinTags = new Set<string>(BUILTIN_COMPONENT_TAGS)

const propertyName = (name: string): string => (
  name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())
)

let pageScopes: string[] = []

function applyClassProps(
  element: HTMLElement | null,
  props: Record<string, unknown> | undefined,
  scopes: string[] | undefined,
  scopeChain?: string[],
  externalClasses?: Record<string, string[]>,
): void {
  if (!element?.setAttribute) return
  const raw = String(props?.class ?? '').split(/\s+/).filter(Boolean)
  const classes: string[] = []
  const scoped: string[] = []
  for (const name of raw) {
    if (name.startsWith('^')) {
      const carets = /^\^+/.exec(name)?.[0].length ?? 1
      const className = name.slice(carets)
      const scope = scopeChain?.[carets] ?? scopeChain?.[scopeChain.length - 1]
      classes.push(className)
      if (scope) scoped.push(`${scope}--${className}`)
      continue
    }
    const escaped = name.startsWith('~')
    const className = escaped ? name.slice(1) : name
    classes.push(className)
    for (const scope of escaped ? pageScopes : (scopes ?? [])) {
      scoped.push(`${scope}--${className}`)
    }
    for (const target of externalClasses?.[name] ?? []) {
      classes.push(target)
      for (const scope of pageScopes) scoped.push(`${scope}--${target}`)
    }
  }
  if (classes.length > 0 || scoped.length > 0) {
    element.setAttribute('class', [...classes, ...scoped].join(' '))
  }
}

function glassProps(props: Record<string, unknown> | undefined): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(props ?? {})) {
    if (name === 'class' || name === 'style' || name === 'id') continue
    result[propertyName(name)] = value
  }
  return result
}

function applyHostProps(component: AnyComponent, props: Record<string, unknown> | undefined): void {
  const element = component.getBackendElement() as unknown as {
    setAttribute?: (name: string, value: string) => void
  } | null
  if (!element?.setAttribute) return
  for (const [name, value] of Object.entries(props ?? {})) {
    if (value === undefined) continue
    element.setAttribute(name, String(value))
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
  const eventCleanups = new Map<string, Array<() => void>>()
  let eventSink: ((event: { id: string; name: string; native: Record<string, unknown> }) => void) | undefined
  let styleElement: HTMLStyleElement | undefined
  let diagnosticSink: ((diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void) | undefined
  const currentTree = new Map<string, RenderNode>()

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
  const root = glassEasel.Component.createWithContext('tiny-page', rootDefinition, backend)
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
    currentTree.set(node.id, node)
    return text
  }

  const domEventName = (name: string): string | null => {
    if (name === 'tap') return 'click'
    if (name === 'longpress') return null
    if (name === 'confirm') return 'keydown'
    return name
  }

  const nativeFields = (event: Event): Record<string, unknown> => {
    const source = event as unknown as Record<string, unknown>
    const native: Record<string, unknown> = {}
    for (const key of [
      'clientX', 'clientY', 'pageX', 'pageY', 'x', 'y', 'key', 'code', 'value',
      'checked', 'selectedIndex', 'scrollTop', 'scrollLeft', 'deltaX', 'deltaY',
    ]) {
      if (source[key] !== undefined) native[key] = source[key]
    }
    const target = event.target as HTMLInputElement | null
    if (target && typeof target.value === 'string') native.value = target.value
    if (target && typeof target.checked === 'boolean') native.checked = target.checked
    return native
  }

  const attachEvents = (node: RenderElement, component: AnyComponent): void => {
    const events = node.events ?? []
    if (events.length === 0) return
    const element = component.getBackendElement() as unknown as HTMLElement | null
    if (!element || typeof element.addEventListener !== 'function') return
    const cleanups: Array<() => void> = []
    for (const binding of events) {
      const domName = domEventName(binding.name)
      if (!domName) continue
      const listener = (event: Event) => {
        if (binding.name === 'confirm' && (event as KeyboardEvent).key !== 'Enter') return
        const payload = { id: node.id, name: binding.name, native: nativeFields(event) }
        if (eventSink) eventSink(payload)
        else options.onEvent?.(payload)
      }
      element.addEventListener(domName, listener, binding.capture === true)
      cleanups.push(() => element.removeEventListener(domName, listener, binding.capture === true))
    }
    if (cleanups.length > 0) eventCleanups.set(node.id, cleanups)
  }

  const createElement = (
    node: RenderElement,
    owner: AnyComponent,
    inheritedExternal?: Record<string, string[]>,
  ): AnyComponent => {
    const builtin = builtinTags.has(node.tag)
    const definition = builtin
      ? definitions[node.tag as BuiltinComponentTag]
      : containerDefinition(node.tag)
    if (!definition) throw new Error(`no render definition for tag: ${node.tag}`)
    const component = lightShadow(owner).createComponentByDef(
      builtin ? node.tag : `tiny-${node.tag}`,
      definition,
    )
    if (node.tag === 'canvas') {
      diagnosticSink?.({
        severity: 'warning',
        code: 'UNSUPPORTED_CANVAS',
        message: 'Canvas is not supported by this render-tree host',
      })
    }
    nodes.set(node.id, component)
    currentTree.set(node.id, node)
    attachEvents(node, component)
    if (node.tag === 'checkbox-group') {
      const element = component.getBackendElement() as unknown as HTMLElement | null
      if (element && typeof element.addEventListener === 'function') {
        const listener = () => {
          setTimeout(() => {
            const native = {
              checkedValues: Array.from(element.querySelectorAll('input[type="checkbox"]:checked'))
                .map((input) => (input as HTMLInputElement).value),
            }
            const payload = { id: node.id, name: 'change', native }
            if (eventSink) eventSink(payload)
            else options.onEvent?.(payload)
          }, 0)
        }
        element.addEventListener('click', listener)
        const cleanups = eventCleanups.get(node.id) ?? []
        cleanups.push(() => element.removeEventListener('click', listener))
        eventCleanups.set(node.id, cleanups)
      }
    }
    if (builtin) {
      const props = node.props ?? {}
      for (const name of ['placeholder-class', 'hover-class']) {
        const value = props[name]
        if (value !== undefined && typeof (component as unknown as { setExternalClass?: unknown }).setExternalClass === 'function') {
          const classes = String(value).split(/\s+/).filter(Boolean)
          const scoped = classes.flatMap((className) => [
            className,
            ...(node.scopes ?? []).map((scope) => `${scope}--${className}`),
          ])
          ;(component as unknown as { setExternalClass: (name: string, value: string) => void })
            .setExternalClass(name, [...new Set(scoped)].join(' '))
        }
      }
      component.setData(glassProps(props) as never)
    }
    const external = node.externalClasses ?? inheritedExternal
    applyHostProps(component, node.props)
    applyClassProps(component.getBackendElement() as unknown as HTMLElement | null, node.props, node.scopes, node.scopeChain, external)
    const childOwner = component
    for (const child of node.children ?? []) {
      appendChild(component, child.type === 'text'
        ? createText(child, childOwner)
        : createElement(child, childOwner, external))
    }
    return component
  }

  const rootId = { value: '' }

  const ownerFor = (parentId: string): { owner: AnyComponent; shadow: any } | null => {
    if (parentId === rootId.value) {
      return {
        owner: root,
        shadow: root.shadowRoot as unknown as { insertBefore: (child: unknown, ref: unknown) => void },
      }
    }
    const parent = nodes.get(parentId)
    if (!parent || glassEasel.TextNode.isTextNode(parent)) return null
    return { owner: parent, shadow: null }
  }

  const collectIds = (node: RenderNode): string[] => {
    if (node.type === 'text') return [node.id]
    return [node.id, ...(node.children ?? []).flatMap(collectIds)]
  }

  const dropNode = (node: RenderNode): void => {
    for (const id of collectIds(node)) {
      for (const cleanup of eventCleanups.get(id) ?? []) cleanup()
      eventCleanups.delete(id)
      nodes.delete(id)
      currentTree.delete(id)
    }
  }

  const destroyComponent = (node: unknown): void => {
    if (!node) return
    ;(node as { destroy?: () => void }).destroy?.()
  }

  const insertNode = (parentId: string, index: number, node: RenderNode): void => {
    const target = ownerFor(parentId)
    if (!target) return
    const child = node.type === 'text'
      ? createText(node, target.owner)
      : createElement(node, target.owner)
    if (target.shadow) {
      const ref = (root.shadowRoot as unknown as { childNodes: ArrayLike<unknown> }).childNodes[index] ?? null
      target.shadow.insertBefore(child, ref)
    } else {
      const parent = target.owner
      parent.insertBefore(child as never, parent.childNodes[index] ?? null)
    }
  }

  const removeNode = (parentId: string, index: number, count: number): void => {
    const parent = parentId === rootId.value
      ? root
      : nodes.get(parentId)
    if (!parent || glassEasel.TextNode.isTextNode(parent)) return
    for (let offset = 0; offset < count; offset += 1) {
      const child = parent.childNodes[index]
      if (!child) break
      parent.removeChild(child as never)
      for (const [id, value] of nodes) {
        if (value === child) {
          const snapshot = currentTree.get(id)
          if (snapshot) dropNode(snapshot)
          destroyComponent(child)
        }
      }
    }
  }

  const reorderNode = (parentId: string, moves: Array<{ from: number; to: number }>): void => {
    const parent = parentId === rootId.value
      ? root
      : nodes.get(parentId)
    if (!parent || glassEasel.TextNode.isTextNode(parent)) return
    for (const move of moves) {
      const child = parent.childNodes[move.from]
      if (!child) continue
      parent.removeChild(child as never)
      parent.insertBefore(child as never, parent.childNodes[move.to] ?? null)
    }
  }

  const replaceNode = (id: string, node: RenderNode): void => {
    const previous = nodes.get(id)
    const snapshot = currentTree.get(id)
    if (!previous || !snapshot) return
    if (snapshot.type === 'element' && node.type === 'element' && id === rootId.value) {
      nodes.set(id, root)
      currentTree.set(id, node)
      return
    }
    const parent = (previous as unknown as { parentNode?: AnyComponent }).parentNode
    if (!parent) return
    const owner = parent
    const child = node.type === 'text'
      ? createText(node, owner)
      : createElement(node, owner)
    parent.replaceChild(child as never, previous as never)
    dropNode(snapshot)
    nodes.set(id, node.type === 'text' ? child as never : child)
    currentTree.set(id, node)
    if (snapshot.type === 'element' && node.type !== 'element') destroyComponent(previous)
  }

  const updateProps = (node: RenderElement): void => {
    const component = nodes.get(node.id)
    if (!component) return
    if (glassEasel.TextNode.isTextNode(component)) return
    const props = { ...(node.props ?? {}) }
    delete props.class
    delete props.style
    delete props.id
    if (builtinTags.has(node.tag)) component.setData(glassProps(node.props) as never)
    else {
      const element = component.getBackendElement() as unknown as {
        setAttribute?: (name: string, value: string) => void
      } | null
      for (const [name, value] of Object.entries(props)) {
        element?.setAttribute?.(name, String(value ?? ''))
      }
    }
    applyHostProps(component, node.props)
    applyClassProps(component.getBackendElement() as unknown as HTMLElement | null, node.props, node.scopes, node.scopeChain)
  }

  const applyPatches = (patches: RenderPatch[]): void => {
    for (const patch of patches) {
      if (patch.type === 'text') {
        const node = nodes.get(patch.id)
        if (node && glassEasel.TextNode.isTextNode(node)) node.textContent = patch.text
      } else if (patch.type === 'props') {
        const node = nodes.get(patch.id)
        if (node && node instanceof glassEasel.Element) {
          const current = currentTree.get(patch.id)
          if (current?.type === 'element') {
            const next: RenderElement = {
              ...current,
              props: { ...(current.props ?? {}), ...patch.props },
            }
            for (const name of patch.removed ?? []) delete next.props?.[name]
            currentTree.set(patch.id, next)
            updateProps(next)
          }
        }
      } else if (patch.type === 'insert') {
        insertNode(patch.parentId, patch.index, patch.node)
      } else if (patch.type === 'remove') {
        removeNode(patch.parentId, patch.index, patch.count)
      } else if (patch.type === 'reorder') {
        reorderNode(patch.parentId, patch.moves)
      } else if (patch.type === 'replace') {
        replaceNode(patch.id, patch.node)
      }
    }
  }

  return {
    root,
    rootElement,
    setEventSink: (sink) => {
      eventSink = sink
    },
    setDiagnosticSink: (sink) => {
      diagnosticSink = sink
    },
    applyStyles: (styles) => {
      if (typeof document === 'undefined') return
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.setAttribute('data-tiny-tree-runtime-styles', '')
        document.head.appendChild(styleElement)
      }
      styleElement.textContent = styles.join('\n')
    },
    mount(node) {
      for (const cleanups of eventCleanups.values()) {
        for (const cleanup of cleanups) cleanup()
      }
      eventCleanups.clear()
      nodes.clear()
      currentTree.clear()
      styleElement?.remove()
      styleElement = undefined
      const shadow = root.shadowRoot as unknown as {
        appendChild: (child: unknown) => void
        childNodes: ArrayLike<unknown>
        removeChild: (child: unknown) => void
      }
      while (shadow.childNodes.length > 0) {
        shadow.removeChild(shadow.childNodes[0])
      }
      const children = node.type === 'element' ? node.children ?? [] : []
      for (const child of children) {
        shadow.appendChild(child.type === 'text'
          ? createText(child, root)
          : createElement(child, root))
      }
      if (node.type === 'element') {
        rootId.value = node.id
        nodes.set(node.id, root)
        currentTree.set(node.id, node)
        pageScopes = node.scopes ?? []
        applyHostProps(root, node.props)
        applyClassProps(rootElement, node.props, node.scopes, node.scopeChain)
      }
      if (options.attach !== false) glassEasel.Element.pretendAttached(root)
    },
    applyPatches,
    getNode(id) {
      return nodes.get(id)
    },
    destroy() {
      for (const cleanups of eventCleanups.values()) {
        for (const cleanup of cleanups) cleanup()
      }
      eventCleanups.clear()
      nodes.clear()
      currentTree.clear()
      ;(root as unknown as { destroy?: () => void }).destroy?.()
    },
  }
}
