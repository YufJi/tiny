import type * as glassEasel from '@tiny/runtime/glass-easel'
import type { RenderHostAction } from '@tiny/runtime'
import type { BuiltinComponentTag } from './tags'

/** Host-owned events exposed to built-in components without naming a platform. */
export type BuiltinHostEventSource = {
  subscribe: (name: string, listener: (payload: unknown) => void) => () => void
  /** Latest value for host state events such as page visibility. */
  last?: (name: string) => unknown
}

/** Context the web host passes to the built-in component factory. */
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
   * stay in the host package; the contract only owns the generic channel.
   */
  hostRequest?: (method: string, payload: unknown) => Promise<unknown>
  /**
   * Platform events that do not come from mini-program DOM nodes, such as a
   * status-bar tap. Hosts omit this seam when the capability is unavailable.
   */
  hostEvents?: BuiltinHostEventSource
  /**
   * Host-owned text input variant. `native` selects the WebView same-layer
   * template and native adapter; the default `dom` uses browser controls.
   */
  textInputHost?: 'dom' | 'native'
}

export type BuiltinComponentDefinitions<T extends string = BuiltinComponentTag> = Record<
  T,
  glassEasel.GeneralComponentDefinition
>

export type BuiltinComponentFactory<T extends string = BuiltinComponentTag> = (
  space: glassEasel.ComponentSpace,
  context: BuiltinComponentFactoryContext,
) => BuiltinComponentDefinitions<T>
