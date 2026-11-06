import type { Manifest } from '@tiny/manifest'
import type { WxsModuleTable } from '@tiny/wxs-runtime'
import type { AssetUrlResolver } from './assets'
import type { RenderHostAction } from './tree/protocol'

export type RuntimeManifest = Manifest

export type TemplateGroupList = Record<string, unknown>

export type TemplateRegistry = {
  groupList: TemplateGroupList
  content: (path: string, name?: string) => unknown
  wxsModules?: WxsModuleTable
}

export type MiniProgramPropertyType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'any'

export type MiniProgramPropertyDefinition = {
  type?: MiniProgramPropertyType
  optionalTypes?: MiniProgramPropertyType[]
  value?: unknown
}

export type MiniProgramComponentSchema = {
  componentId: string
  path: string
  data: Record<string, unknown>
  properties: Record<string, MiniProgramPropertyDefinition>
  using: Record<string, string>
  /** Abstract-node declarations from `componentGenerics` (JSON). */
  generics?: Record<string, { default?: string } | true>
  /** Regex source applied to data field names in the render thread. */
  pureDataPattern?: string
  externalClasses?: string[]
  formField?: boolean
  formFieldGroup?: boolean
  labelTarget?: boolean
  observers?: Array<{ key: string; paths: string[] }>
  relations?: Array<{
    key: string
    type: 'parent' | 'child' | 'ancestor' | 'descendant'
    target: string
  }>
  options?: {
    multipleSlots?: boolean
    virtualHost?: boolean
    styleIsolation?: 'isolated' | 'apply-shared' | 'shared'
    /** Whether styleIsolation was set explicitly by component JS/JSON. */
    explicitStyleIsolation?: boolean
    addGlobalClass?: boolean
  }
}

/** Host-neutral element-tree projection used by the debugger. */
export type InspectNode = {
  id: string
  type: 'component' | 'element' | 'text'
  tag: string
  text?: string
  attributes?: Record<string, string>
  className?: string
  style?: string
  children: InspectNode[]
}

/** One DOM node resolved by a component/page selector query. */
export type QueryNodeSnapshot = {
  /** Logic-layer node identity, present for service-side query results. */
  viewId?: string
  /** Component-scoped locator of an element (render-side addressing). */
  locator?: string
  id: string
  dataset: Record<string, unknown>
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  scrollLeft: number
  scrollTop: number
}

export type StyleLoader = (path: string) => string

/** Context the runtime passes to a host-provided built-in component factory. */
export type BuiltinComponentFactoryContext = {
  /** Register or reuse a render style scope shared with stylesheet registration. */
  registerStyleScope?: (name: string) => number
  onDiagnostic?: (diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void
  /** Resolve a mini-program asset path for the component instance that owns it. */
  resolveAssetUrl?: (src: string, component: unknown) => string
  /**
   * Props of the render snapshot node that owns a component instance.
   *
   * `<form>`/`<label>` read values the way WeChat does: from the node props,
   * not only from the instance data (a page-level component gets its props as
   * attributes and they are not projected into data unless declared).
   */
  lookupNodeProps?: (component: unknown) => Record<string, unknown> | undefined
  /**
   * Ask the host to run a navigation the page does not bind itself
   * (`<navigator>`); the render tree forwards it as `tree.hostAction`.
   */
  hostAction?: (action: RenderHostAction) => void
  /**
   * Ask the host for a request/response capability. Component-specific payloads
   * stay in the host package; the runtime only owns the generic channel.
   */
  hostRequest?: (method: string, payload: unknown) => Promise<unknown>
}

export type BuiltinComponentFactory = (
  space: import('glass-easel').ComponentSpace,
  context: BuiltinComponentFactoryContext,
) => BuiltinComponentDefinitions

export type BuiltinComponentDefinitions = Record<string, import('glass-easel').GeneralComponentDefinition>

/**
 * Host-provided implementations of the mini-program built-in tags.
 *
 * The runtime core does not own UI: a host supplies the tags its backend can
 * render. `@tiny/host-web-components` is the DOM/browser implementation used by
 * `tests/host` and `apps/devtool`; a native host can provide its own factory or
 * omit this option entirely.
 */
export type BuiltinStyleSheet = {
  path: string
  content: string
  /** Internal style scope. Omit for globally applicable host/base styles. */
  scope?: string
}

export type BuiltinComponents = {
  create: BuiltinComponentFactory
  /** Stylesheets registered before app/page/component styles. */
  styles?: BuiltinStyleSheet[]
}
