import {
  DIAGNOSTIC_CODES,
  WECHAT_RUNTIME_COMPATIBILITY,
  type RuntimeCompatibilityConfig,
} from '@tiny/manifest'
import { cloneDataValue } from '../shared/data'
import {
  behaviorTraitImplementations,
  isBuiltinBehavior,
  resolveBuiltinBehavior,
} from './behaviors'
import type { MiniProgramComponentOptions } from './options'
import type { MiniProgramPropertyDefinition } from './schema'
import { applyDefinitionFilters } from './definition/filters'
import { isPlainObject } from './definition/object'
import { normalizeObservers } from './definition/observers'
import { normalizeProperties } from './definition/properties'
import { parsePureDataPattern, isPureDataField } from './definition/pure-data'
import { normalizeRelations } from './definition/relations'
import {
  RESERVED_COMPONENT_PROPERTY_NAMES,
  type ComponentLifecycleName,
  type DefinitionDiagnostic,
  type NormalizedComponentDefinition,
  type NormalizedComponentOptions,
  type NormalizedObserver,
  type NormalizedRelation,
  type NormalizedTraitImplementation,
  type StyleIsolation,
} from './definition/types'

const COMPONENT_LIFECYCLE_NAMES: ComponentLifecycleName[] = [
  'created',
  'attached',
  'ready',
  'moved',
  'detached',
]

const RESERVED_OPTION_KEYS = new Set([
  'properties',
  'data',
  'methods',
  'behaviors',
  'lifetimes',
  'pageLifetimes',
  'observers',
  'relations',
  'externalClasses',
  'listeners',
  'options',
  'export',
  'definitionFilter',
  'is',
])

const STYLE_ISOLATION_VALUES = new Set<StyleIsolation>(['isolated', 'apply-shared', 'shared'])

type Collector = {
  properties: Record<string, MiniProgramPropertyDefinition>
  propertyObservers: NormalizedObserver[]
  data: Record<string, unknown>
  methods: Map<string, Function>
  lifetimeHandlers: Record<ComponentLifecycleName, Function[]>
  pageLifetimeHandlers: { show: Function[]; hide: Function[]; resize: Function[] }
  observers: NormalizedObserver[]
  relations: Map<string, NormalizedRelation>
  externalClasses: string[]
  listeners: Record<string, Function | string>
  options: NormalizedComponentOptions
  behaviors: Set<object | string>
  traits: Map<string, NormalizedTraitImplementation>
  componentExport: boolean
  formField: boolean
  formFieldButton: boolean
  formFieldGroup: boolean
  labelTarget: boolean
  export?: Function
  diagnostics: DefinitionDiagnostic[]
  observerIndex: number
  propertyObserverIndex: number
}
export function normalizeComponentDefinition(
  options: MiniProgramComponentOptions,
  componentPath: string,
  compatibility: RuntimeCompatibilityConfig = WECHAT_RUNTIME_COMPATIBILITY,
  configuration?: Record<string, unknown>,
): NormalizedComponentDefinition {
  const collector = createCollector()
  const visited = new Set<object>()
  const visitedBuiltins = new Set<string>()
  const configuredPureDataPattern = parsePureDataPattern(configuration?.pureDataPattern)
  if (configuredPureDataPattern) collector.options.pureDataPattern = configuredPureDataPattern
  if (typeof options.definitionFilter === 'function') {
    collector.diagnostics.push({
      code: DIAGNOSTIC_CODES.UNSUPPORTED_COMPONENT_DEFINITION_FILTER,
      message: 'definitionFilter on Component is ignored; declare it in a Behavior.',
    })
  }

  const visit = (source: unknown): void => {
    if (typeof source === 'string') {
      collector.behaviors.add(source)
      const builtin = resolveBuiltinBehavior(source, compatibility)
      if (builtin) {
        if (visitedBuiltins.has(builtin.id)) return
        visitedBuiltins.add(builtin.id)
        collector.componentExport ||= builtin.markers.componentExport === true
        collector.formField ||= builtin.markers.formField === true
        collector.formFieldButton ||= builtin.markers.formFieldButton === true
        collector.formFieldGroup ||= builtin.markers.formFieldGroup === true
        collector.labelTarget ||= builtin.markers.labelTarget === true
        visit(builtin.options)
        return
      }
      if (isBuiltinBehavior(source)) {
        collector.diagnostics.push({
          code: DIAGNOSTIC_CODES.UNSUPPORTED_BEHAVIOR,
          message: `Built-in behavior "${source}" is not supported.`,
          details: { behavior: source },
        })
      }
      return
    }
    if (!source || typeof source !== 'object') return
    const behavior = source as MiniProgramComponentOptions
    if (visited.has(behavior)) return
    visited.add(behavior)

    const nested = behavior.behaviors
    if (Array.isArray(nested)) {
      for (const item of nested) {
        if (item && typeof item === 'object') collector.behaviors.add(item)
        visit(item)
      }
    }
    for (const traitImpl of behaviorTraitImplementations(behavior)) {
      collector.traits.set(traitImpl.trait.id, traitImpl)
    }
    // WeChat calls a behavior's definitionFilter when the *user* of that
    // behavior is declared. Visiting nested behaviors first reproduces that
    // bottom-up order: behavior3 filters behavior2, behavior2 filters
    // behavior1, and behavior1 filters the component.
    applyDefinitionFilters(
      behavior,
      (diagnostic) => collector.diagnostics.push(diagnostic),
      compatibility,
    )
    mergeSource(collector, behavior, componentPath)
  }

  visit(options)

  // Property defaults are the base layer; behavior/component data wins.
  const propertyDefaults: Record<string, unknown> = {}
  for (const [name, definition] of Object.entries(collector.properties)) {
    if (definition.value !== undefined) propertyDefaults[name] = definition.value
  }
  const data: Record<string, unknown> = {}
  mergeDataInto(data, propertyDefaults)
  mergeDataInto(data, collector.data)

  const relations = [...collector.relations.values()]
  const pureDataPattern = collector.options.pureDataPattern
  const observers = [...collector.propertyObservers, ...collector.observers].filter(
    (observer) => observer.kind !== 'property'
      || !isPureDataField(pureDataPattern, observer.propertyName ?? ''),
  )
  return {
    properties: collector.properties,
    data,
    methods: collector.methods,
    lifetimeHandlers: collector.lifetimeHandlers,
    pageLifetimeHandlers: collector.pageLifetimeHandlers,
    observers,
    relations,
    externalClasses: collector.externalClasses,
    listeners: collector.listeners,
    options: collector.options,
    behaviors: collector.behaviors,
    traits: [...collector.traits.values()],
    componentExport: collector.componentExport,
    formField: collector.formField,
    formFieldButton: collector.formFieldButton,
    formFieldGroup: collector.formFieldGroup,
    labelTarget: collector.labelTarget,
    export: collector.export,
    diagnostics: collector.diagnostics,
  }
}

function createCollector(): Collector {
  return {
    properties: {},
    propertyObservers: [],
    data: {},
    methods: new Map(),
    lifetimeHandlers: {
      created: [],
      attached: [],
      ready: [],
      moved: [],
      detached: [],
    },
    pageLifetimeHandlers: { show: [], hide: [], resize: [] },
    observers: [],
    relations: new Map(),
    externalClasses: [],
    listeners: {},
    options: {
      multipleSlots: false,
      virtualHost: false,
      styleIsolation: 'isolated',
      addGlobalClass: false,
      explicitStyleIsolation: false,
    },
    behaviors: new Set(),
    traits: new Map(),
    componentExport: false,
    formField: false,
    formFieldButton: false,
    formFieldGroup: false,
    labelTarget: false,
    diagnostics: [],
    observerIndex: 0,
    propertyObserverIndex: 0,
  }
}

function mergeSource(
  collector: Collector,
  source: MiniProgramComponentOptions,
  componentPath: string,
): void {
  const normalized = normalizeProperties(source.properties)
  for (const [name, definition] of Object.entries(normalized.properties)) {
    collector.properties[name] = definition
    collector.propertyObservers = collector.propertyObservers.filter(
      (observer) => observer.propertyName !== name,
    )
  }
  for (const propertyObserver of normalized.propertyObservers) {
    collector.propertyObservers.push({
      ...propertyObserver,
      key: `prop-${propertyObserver.propertyName}-${collector.propertyObserverIndex++}`,
    })
  }

  const data = source.data
  if (isPlainObject(data)) {
    mergeDataInto(collector.data, data)
  }

  const methods = source.methods
  if (isPlainObject(methods)) {
    for (const [name, method] of Object.entries(methods)) {
      if (typeof method === 'function') collector.methods.set(name, method)
    }
  }

  const listeners = source.listeners
  if (isPlainObject(listeners)) {
    for (const [name, listener] of Object.entries(listeners)) {
      if (typeof listener === 'function' || typeof listener === 'string') {
        collector.listeners[name] = listener as Function | string
      }
    }
  }

  for (const [name, value] of Object.entries(source)) {
    if (RESERVED_OPTION_KEYS.has(name)) continue
    if (COMPONENT_LIFECYCLE_NAMES.includes(name as ComponentLifecycleName)) continue
    if (name === 'pageLifetimes') continue
    if (typeof value === 'function') collector.methods.set(name, value)
  }

  const lifetimes = source.lifetimes
  if (isPlainObject(lifetimes)) {
    for (const name of COMPONENT_LIFECYCLE_NAMES) {
      const handler = lifetimes[name]
      if (typeof handler === 'function') collector.lifetimeHandlers[name].push(handler)
    }
  }
  for (const name of COMPONENT_LIFECYCLE_NAMES) {
    const handler = source[name]
    if (typeof handler === 'function') collector.lifetimeHandlers[name].push(handler)
  }

  const pageLifetimes = source.pageLifetimes
  if (isPlainObject(pageLifetimes)) {
    const show = pageLifetimes.show
    if (typeof show === 'function') collector.pageLifetimeHandlers.show.push(show)
    const hide = pageLifetimes.hide
    if (typeof hide === 'function') collector.pageLifetimeHandlers.hide.push(hide)
    const resize = pageLifetimes.resize
    if (typeof resize === 'function') collector.pageLifetimeHandlers.resize.push(resize)
  }

  const observers = normalizeObservers(source.observers)
  for (const observer of observers) {
    collector.observers.push({ ...observer, key: `obs-${collector.observerIndex++}` })
  }

  const relations = normalizeRelations(source.relations, componentPath)
  for (const relation of relations.relations) {
    collector.relations.set(relation.key, relation)
  }
  collector.diagnostics.push(...relations.diagnostics)

  if (Array.isArray(source.externalClasses)) {
    for (const name of source.externalClasses) {
      if (typeof name !== 'string' || name.length === 0) continue
      if (!collector.externalClasses.includes(name)) collector.externalClasses.push(name)
    }
  }

  const rawOptions = source.options
  if (isPlainObject(rawOptions)) {
    if (typeof rawOptions.multipleSlots === 'boolean') {
      collector.options.multipleSlots = rawOptions.multipleSlots
    }
    if (typeof rawOptions.virtualHost === 'boolean') {
      collector.options.virtualHost = rawOptions.virtualHost
    }
    if (typeof rawOptions.addGlobalClass === 'boolean') {
      collector.options.addGlobalClass = rawOptions.addGlobalClass
    }
    if (typeof rawOptions.styleIsolation === 'string') {
      if (STYLE_ISOLATION_VALUES.has(rawOptions.styleIsolation as StyleIsolation)) {
        collector.options.styleIsolation = rawOptions.styleIsolation as StyleIsolation
        collector.options.explicitStyleIsolation = true
      } else {
        collector.diagnostics.push({
          code: DIAGNOSTIC_CODES.INVALID_STYLE_ISOLATION,
          message: `Invalid styleIsolation "${rawOptions.styleIsolation}"; expected isolated, apply-shared or shared.`,
        })
      }
    }
    if (rawOptions.pureDataPattern !== undefined) {
      const pattern = parsePureDataPattern(rawOptions.pureDataPattern)
      if (pattern) {
        collector.options.pureDataPattern = pattern
      } else if (rawOptions.pureDataPattern !== null) {
        collector.diagnostics.push({
          code: DIAGNOSTIC_CODES.INVALID_PURE_DATA_PATTERN,
          message: 'pureDataPattern must be a RegExp or a valid regular-expression string.',
        })
      }
    }
  }

  if (typeof source.export === 'function') {
    collector.export = source.export
  }
}

function mergeDataInto(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue
    if (isPlainObject(value) && isPlainObject(target[key])) {
      const merged = cloneDataValue(target[key]) as Record<string, unknown>
      mergeDataInto(merged, value)
      target[key] = merged
    } else {
      target[key] = cloneDataValue(value)
    }
  }
}
