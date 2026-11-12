export type MiniProgramPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'function'
  | 'any'

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
  /** `componentPlaceholder`: child using key -> placeholder using key. */
  placeholders?: Record<string, string>
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
