import { cloneDataValue } from '../../shared/data'
import type {
  MiniProgramPropertyDefinition,
  MiniProgramPropertyType,
} from '../schema'
import type { NormalizedObserver } from './types'
import { isPlainObject } from './object'

const PROPERTY_TYPES: Record<string, MiniProgramPropertyType> = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Object: 'object',
  Array: 'array',
  Function: 'function',
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
