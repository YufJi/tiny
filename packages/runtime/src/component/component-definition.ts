import {
  DIAGNOSTIC_CODES,
  WECHAT_RUNTIME_COMPATIBILITY,
  type RuntimeCompatibilityConfig,
} from '@tiny/manifest'
import { cloneDataValue } from '../data'
import { componentExportBehavior, formFieldBehavior, isBuiltinBehavior } from './behaviors'
import type { MiniProgramComponentOptions } from '../service'
import type { MiniProgramPropertyDefinition, MiniProgramPropertyType } from '../types'

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
  linked?: RelationCallback
  unlinked?: RelationCallback
  linkChanged?: RelationCallback
  linkFailed?: RelationCallback
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

export type NormalizedComponentDefinition = {
  properties: Record<string, MiniProgramPropertyDefinition>
  data: Record<string, unknown>
  methods: Map<string, Function>
  lifetimeHandlers: Record<ComponentLifecycleName, Function[]>
  pageLifetimeHandlers: { show: Function[]; hide: Function[] }
  observers: NormalizedObserver[]
  relations: NormalizedRelation[]
  externalClasses: string[]
  options: NormalizedComponentOptions
  behaviors: Set<object | string>
  componentExport: boolean
  formField: boolean
  export?: Function
  diagnostics: DefinitionDiagnostic[]
}

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
  'options',
  'export',
  'definitionFilter',
  'is',
])

const STYLE_ISOLATION_VALUES = new Set<StyleIsolation>(['isolated', 'apply-shared', 'shared'])

const PROPERTY_TYPES: Record<string, MiniProgramPropertyType> = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Object: 'object',
  Array: 'array',
  Function: 'function',
}

type Collector = {
  properties: Record<string, MiniProgramPropertyDefinition>
  propertyObservers: NormalizedObserver[]
  data: Record<string, unknown>
  methods: Map<string, Function>
  lifetimeHandlers: Record<ComponentLifecycleName, Function[]>
  pageLifetimeHandlers: { show: Function[]; hide: Function[] }
  observers: NormalizedObserver[]
  relations: Map<string, NormalizedRelation>
  externalClasses: string[]
  options: NormalizedComponentOptions
  behaviors: Set<object | string>
  componentExport: boolean
  formField: boolean
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
  const exportBehavior = componentExportBehavior(compatibility)
  const formField = formFieldBehavior(compatibility)
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
      if (source === exportBehavior) {
        collector.componentExport = true
      } else if (source === formField || source === `${formField}-button`) {
        // `wx://form-field-button` is the built-in button variant of a form
        // field; Vant declares it on `van-button`.
        collector.formField = true
        // Custom form fields contribute `name`/`value` to the enclosing form.
        if (!collector.properties.name) {
          collector.properties.name = { type: 'string', value: '' }
        }
        if (!collector.properties.value) {
          collector.properties.value = { value: '' }
        }
      } else if (isBuiltinBehavior(source)) {
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
    // WeChat calls a behavior's definitionFilter when the *user* of that
    // behavior is declared. Visiting nested behaviors first reproduces that
    // bottom-up order: behavior3 filters behavior2, behavior2 filters
    // behavior1, and behavior1 filters the component.
    applyDefinitionFilters(behavior, (diagnostic) => collector.diagnostics.push(diagnostic))
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
    options: collector.options,
    behaviors: collector.behaviors,
    componentExport: collector.componentExport,
    formField: collector.formField,
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
    pageLifetimeHandlers: { show: [], hide: [] },
    observers: [],
    relations: new Map(),
    externalClasses: [],
    options: {
      multipleSlots: false,
      virtualHost: false,
      styleIsolation: 'isolated',
      addGlobalClass: false,
      explicitStyleIsolation: false,
    },
    behaviors: new Set(),
    componentExport: false,
    formField: false,
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

export function normalizeProperties(raw: unknown): {
  properties: Record<string, MiniProgramPropertyDefinition>
  propertyObservers: Array<Omit<NormalizedObserver, 'key'>>
} {
  const properties: Record<string, MiniProgramPropertyDefinition> = {}
  const propertyObservers: Array<Omit<NormalizedObserver, 'key'>> = []
  if (!isPlainObject(raw)) return { properties, propertyObservers }

  for (const [name, value] of Object.entries(raw)) {
    if (value === null || value === undefined) {
      properties[name] = { type: 'any' }
      continue
    }
    if (typeof value !== 'object') {
      properties[name] = { type: normalizePropertyType(value) }
      continue
    }
    const option = value as Record<string, unknown>
    const normalized: MiniProgramPropertyDefinition = {
      type: normalizePropertyType(option.type),
    }
    const defaultValue = cloneDataValue(option.value)
    if (defaultValue !== undefined) normalized.value = defaultValue
    if (Array.isArray(option.optionalTypes)) {
      normalized.optionalTypes = option.optionalTypes.map((type) => normalizePropertyType(type))
    }
    properties[name] = normalized
    const propertyObserver = option.observer
    if (typeof propertyObserver === 'function' || typeof propertyObserver === 'string') {
      propertyObservers.push({
        paths: [name],
        kind: 'property',
        propertyName: name,
        handler: propertyObserver as string | ((...args: unknown[]) => unknown),
      })
    }
  }
  return { properties, propertyObservers }
}

function normalizeObservers(raw: unknown): Array<Omit<NormalizedObserver, 'key'>> {
  const observers: Array<Omit<NormalizedObserver, 'key'>> = []
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!isPlainObject(item)) continue
      const fields = item.fields
      const handler = item.observer
      if (typeof fields !== 'string') continue
      if (typeof handler !== 'function' && typeof handler !== 'string') continue
      observers.push({
        paths: splitObserverPaths(fields),
        kind: 'observer',
        handler: handler as string | ((...args: unknown[]) => unknown),
      })
    }
    return observers
  }
  if (!isPlainObject(raw)) return observers
  for (const [fields, handler] of Object.entries(raw)) {
    if (typeof handler !== 'function' && typeof handler !== 'string') continue
    observers.push({
      paths: splitObserverPaths(fields),
      kind: 'observer',
      handler: handler as string | ((...args: unknown[]) => unknown),
    })
  }
  return observers
}

function splitObserverPaths(fields: string): string[] {
  return fields
    .split(',')
    .map((path) => path.trim())
    .filter((path) => path.length > 0)
}

function normalizeRelations(
  raw: unknown,
  componentPath: string,
): { relations: NormalizedRelation[]; diagnostics: DefinitionDiagnostic[] } {
  const relations: NormalizedRelation[] = []
  const diagnostics: DefinitionDiagnostic[] = []
  if (!isPlainObject(raw)) return { relations, diagnostics }

  for (const [key, value] of Object.entries(raw)) {
    if (!isPlainObject(value)) continue
    const type = value.type
    if (type !== 'parent' && type !== 'child' && type !== 'ancestor' && type !== 'descendant') {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.UNSUPPORTED_RELATION_TYPE,
        message: `Relation "${key}" has unsupported type "${String(type)}".`,
      })
      continue
    }
    const target = typeof value.target === 'string' ? value.target : key
    if (isBuiltinBehavior(target)) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.UNSUPPORTED_RELATION_TARGET,
        message: `Relation "${key}" targets built-in behavior "${target}", which is not supported.`,
      })
      continue
    }
    const relation: NormalizedRelation = {
      key,
      type,
      targetPath: resolveComponentReference(componentPath, target),
    }
    if (isRelationCallback(value.linked)) relation.linked = value.linked
    if (isRelationCallback(value.unlinked)) relation.unlinked = value.unlinked
    if (isRelationCallback(value.linkChanged)) relation.linkChanged = value.linkChanged
    if (isRelationCallback(value.linkFailed)) relation.linkFailed = value.linkFailed
    relations.push(relation)
  }
  return { relations, diagnostics }
}

function isRelationCallback(value: unknown): value is RelationCallback {
  return typeof value === 'function' || typeof value === 'string'
}

const filteredDefinitions = new WeakSet<object>()

/**
 * Run the definitionFilter chain contributed by the direct behaviors of
 * `source`, matching WeChat's declaration-time filtering. Nested behaviors are
 * visited first by normalizeComponentDefinition, so each filter observes a
 * fully prepared user definition.
 */
export function applyDefinitionFilters(
  source: Record<string, unknown>,
  onDiagnostic?: (diagnostic: DefinitionDiagnostic) => void,
): void {
  if (filteredDefinitions.has(source)) return
  filteredDefinitions.add(source)
  const behaviors = Array.isArray(source.behaviors) ? source.behaviors : []
  for (const behavior of behaviors) {
    if (!behavior || typeof behavior !== 'object') continue
    const filter = (behavior as MiniProgramComponentOptions).definitionFilter
    if (typeof filter !== 'function') continue
    const filterArr = collectDirectDefinitionFilters(behavior as MiniProgramComponentOptions)
    try {
      filter(source, filterArr)
    } catch (error) {
      onDiagnostic?.({
        code: DIAGNOSTIC_CODES.DEFINITION_FILTER_ERROR,
        message: error instanceof Error ? error.message : String(error),
        details: { behavior: describeBehavior(behavior) },
      })
    }
  }
}

function collectDirectDefinitionFilters(
  behavior: MiniProgramComponentOptions,
): Array<(defFields: unknown) => unknown> {
  if (!Array.isArray(behavior.behaviors)) return []
  const filters: Array<(defFields: unknown) => unknown> = []
  for (const item of behavior.behaviors) {
    if (!item || typeof item !== 'object') continue
    const filter = (item as MiniProgramComponentOptions).definitionFilter
    if (typeof filter === 'function') {
      // WeChat supplies the nested filter array when a filter invokes
      // `definitionFilterArr[i](defFields)`; wrap it so callers only pass the
      // definition object.
      filters.push((defFields: unknown) => filter(
        defFields,
        collectDirectDefinitionFilters(item as MiniProgramComponentOptions),
      ))
    }
  }
  return filters
}

function describeBehavior(behavior: object): string {
  const is = (behavior as MiniProgramComponentOptions).is
  return typeof is === 'string' ? is : '[object Behavior]'
}

export function parsePureDataPattern(value: unknown): RegExp | undefined {
  if (value instanceof RegExp) return value
  if (typeof value === 'string' && value.length > 0) {
    try {
      return new RegExp(value)
    } catch {
      return undefined
    }
  }
  return undefined
}

export function isPureDataField(pattern: RegExp | undefined, field: string): boolean {
  if (!pattern) return false
  pattern.lastIndex = 0
  return pattern.test(field)
}

export function resolveComponentReference(sourcePath: string, reference: string): string {
  if (reference.startsWith('/')) return normalizePath(reference.slice(1))
  const directory = sourcePath.split('\\').join('/').split('/').slice(0, -1)
  return normalizePath([...directory, ...reference.split('\\').join('/').split('/')].join('/'))
}

function normalizePath(path: string): string {
  const output: string[] = []
  for (const segment of path.split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..') output.pop()
    else output.push(segment)
  }
  return output.join('/')
}

export function normalizePropertyType(type: unknown): MiniProgramPropertyType {
  if (type === String) return 'string'
  if (type === Number) return 'number'
  if (type === Boolean) return 'boolean'
  if (type === Object) return 'object'
  if (type === Array) return 'array'
  if (type === Function) return 'function'
  if (typeof type === 'string' && type in PROPERTY_TYPES) {
    return PROPERTY_TYPES[type]!
  }
  return PROPERTY_TYPES[String(type)] ?? 'any'
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}
