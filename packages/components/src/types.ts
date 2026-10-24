import type * as glassEasel from 'glass-easel'
import type { BuiltinComponentTag } from './tags'
import type { BuiltinBehaviors } from './behaviors'

export type BuiltinComponentFactoryOptions = {
  onDiagnostic?: (diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void
}

export type BuiltinContext = {
  space: glassEasel.ComponentSpace
  options: BuiltinComponentFactoryOptions
  template: (tag: BuiltinComponentTag) => glassEasel.template.ComponentTemplate
  behaviors: BuiltinBehaviors
}

export type BuiltinDefinition = glassEasel.GeneralComponentDefinition
