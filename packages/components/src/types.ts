import type * as glassEasel from 'glass-easel'
import type { BuiltinComponentTag } from './tags'
import type { BuiltinBehaviors } from './behaviors'

export type BuiltinComponentFactoryOptions = {
  /** Behavior id prefix, e.g. `wx-` or `tiny-`. Defaults to `wx-`. */
  prefix?: string
  onDiagnostic?: (diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void
  /** Resolve a mini-program asset path for the component instance that owns it. */
  resolveAssetUrl?: (src: string, component: unknown) => string
}

export type BuiltinContext = {
  space: glassEasel.ComponentSpace
  options: BuiltinComponentFactoryOptions
  template: (tag: BuiltinComponentTag) => glassEasel.template.ComponentTemplate
  behaviors: BuiltinBehaviors
  /** Resolve a built-in definition created earlier in this factory pass. */
  getBuiltin: (tag: BuiltinComponentTag) => glassEasel.GeneralComponentDefinition | undefined
  /**
   * Build the options for a built-in component definition.
   *
   * Every built-in is a real host node (`virtualHost: false`) named
   * `tiny-<tag>` (`tiny-view`, `tiny-text`, …), and reflects its public
   * properties to the host as attributes so host CSS such as
   * `tiny-button[type=primary]` and `tiny-view[hidden]` keeps working.
   * The `tiny-` namespace is deliberate: built-ins must not impersonate
   * WeChat's internal `wx-*` elements.
   */
  hostOptions: (extra?: glassEasel.ComponentOptions) => glassEasel.ComponentOptions
}

export type BuiltinDefinition = glassEasel.GeneralComponentDefinition
