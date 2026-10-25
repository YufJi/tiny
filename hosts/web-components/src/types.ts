import type * as glassEasel from 'glass-easel'
import type { BuiltinComponentFactoryContext } from '@tiny/runtime'
import type { BuiltinComponentTag } from './tags'
import type { BuiltinBehaviors } from './behaviors'

/**
 * Options are defined by the runtime's injection seam so the web host package
 * and `bootRenderThread({ builtinComponents })` cannot drift apart.
 */
export type BuiltinComponentFactoryOptions = BuiltinComponentFactoryContext

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
