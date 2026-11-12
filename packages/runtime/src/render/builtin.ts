import type { RenderHostAction } from '../tree-protocol/protocol'

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

export type BuiltinComponentDefinitions = Record<
  string,
  import('glass-easel').GeneralComponentDefinition
>

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
