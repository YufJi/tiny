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
}

export type BuiltinDefinition = glassEasel.GeneralComponentDefinition
