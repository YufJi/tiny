import type { MiniProgramPropertyDefinition } from '../schema'
import type { MiniProgramTraitBehavior } from '../traits'

export type ComponentLifecycleName = 'created' | 'attached' | 'ready' | 'moved' | 'detached'
export type RelationType = 'parent' | 'child' | 'ancestor' | 'descendant'
export type RelationCallback = string | ((target: unknown) => void)
export type ObserverKind = 'observer' | 'property'

export type NormalizedObserver = {
  key: string
  paths: string[]
  kind: ObserverKind
  propertyName?: string
  handler: string | ((...args: unknown[]) => unknown)
}

export type NormalizedRelation = {
  key: string
  type: RelationType
  targetPath: string
  trait?: MiniProgramTraitBehavior
  linked?: RelationCallback
  unlinked?: RelationCallback
  linkChanged?: RelationCallback
  linkFailed?: RelationCallback
}

export type NormalizedTraitImplementation = {
  trait: MiniProgramTraitBehavior
  impl: Record<string, unknown>
}

export type StyleIsolation = 'isolated' | 'apply-shared' | 'shared'

export type NormalizedComponentOptions = {
  multipleSlots: boolean
  virtualHost: boolean
  styleIsolation: StyleIsolation
  addGlobalClass: boolean
  explicitStyleIsolation: boolean
  /** Fields whose names match this pattern stay service-side (not rendered). */
  pureDataPattern?: RegExp
}

export type DefinitionDiagnostic = {
  code: string
  message: string
  details?: unknown
}

/**
 * Property names that belong to the glass element itself, not to the user
 * component API. They must never be declared on the render-side definition
 * either: glass creates fields for every declared property before its data
 * group exists, so a `dataset`/`id` property would crash component creation.
 */
export const RESERVED_COMPONENT_PROPERTY_NAMES = new Set([
  'is',
  'dataset',
  'classList',
  'parentNode',
  'parentIndex',
  'childNodes',
  'ownerShadowRoot',
  'shadowRoot',
  'tagName',
  'id',
  'slot',
  'style',
])

export type NormalizedComponentDefinition = {
  properties: Record<string, MiniProgramPropertyDefinition>
  data: Record<string, unknown>
  methods: Map<string, Function>
  lifetimeHandlers: Record<ComponentLifecycleName, Function[]>
  pageLifetimeHandlers: { show: Function[]; hide: Function[]; resize: Function[] }
  observers: NormalizedObserver[]
  relations: NormalizedRelation[]
  externalClasses: string[]
  listeners: Record<string, Function | string>
  options: NormalizedComponentOptions
  behaviors: Set<object | string>
  traits: NormalizedTraitImplementation[]
  componentExport: boolean
  formField: boolean
  formFieldButton: boolean
  formFieldGroup: boolean
  labelTarget: boolean
  export?: Function
  diagnostics: DefinitionDiagnostic[]
}
