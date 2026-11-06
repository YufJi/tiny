import { BUILTIN_COMPONENT_TAGS } from '@tiny/manifest'
import type { ServiceApiContext } from '@tiny/runtime'

/**
 * `wx.canIUse` schema resolution.
 *
 * WeChat resolves a schema in three families, in this order:
 *
 * 1. `${component}` / `${component}.${attribute}.${option}` — built-in tags.
 * 2. `${class}.${member}` — objects returned by APIs (`SelectorQuery.exec`,
 *    `EventChannel.on`, `console.log`, …).
 * 3. `${api}[.${method}.${param}.${option}]` where `method` is one of
 *    `return` / `success` / `object` / `callback`.
 *
 * Availability comes from what this runtime actually implements, never from a
 * version number: the API names are the installed `wx.*` table, the component
 * inventory is generated from the real built-in definitions (`@tiny/manifest`),
 * and method/class sub-paths are declared in `capabilities.ts`.
 */

/** `true` = supported; an object lists the supported sub-paths. */
export type CanIUseCapabilityNode = true | { readonly [key: string]: CanIUseCapabilityNode }

/** Engine facts for the three schema families. */
export type CanIUseCapabilities = {
  readonly api: Readonly<Record<string, CanIUseCapabilityNode>>
  readonly class: Readonly<Record<string, CanIUseCapabilityNode>>
  readonly component: Readonly<Record<string, CanIUseCapabilityNode>>
}

/** Valid `${method}` segments in an API schema (WeChat's grammar). */
const API_METHODS = new Set(['return', 'success', 'object', 'callback'])

/**
 * APIs that only work through the host's synchronous channel. A host without
 * the channel cannot serve them at all, so they are unavailable in `canIUse`.
 */
const SYNC_APIS = new Set([
  'getSystemInfoSync',
  'getStorageSync',
  'setStorageSync',
  'removeStorageSync',
  'clearStorageSync',
  'getStorageInfoSync',
])

export function createCanIUse(
  context: ServiceApiContext,
  capabilities: CanIUseCapabilities,
): (schema?: unknown) => boolean {
  const componentTags = new Set<string>(BUILTIN_COMPONENT_TAGS)
  const componentFacts = capabilities.component
  return (schema?: unknown) => {
    // WeChat treats a missing argument as an empty schema and throws for any
    // other non-string value.
    if (schema === undefined) return false
    if (typeof schema !== 'string') throw new Error('canIUse: schema should be a string')
    if (schema.length === 0) return false

    let segments = schema.split('.')
    if (segments.some((segment) => segment.length === 0)) return false
    // Tiny extension: accept the installed API global as an optional prefix
    // (`wx.request`), so tables that are also installed under an alias (`my`)
    // keep working. WeChat's own schema is prefix-free.
    if (segments.length > 1 && context.apiNamespaces.includes(segments[0]!)) {
      segments = segments.slice(1)
    }

    const [head, ...rest] = segments as [string, ...string[]]

    if (componentTags.has(head)) {
      if (rest.length === 0) return true
      // Options are not tracked by the generated inventory, so an option probe
      // is answered conservatively.
      if (rest.length > 1) return false
      return matchesNode(componentFacts[head], [rest[0]!])
    }

    const classFacts = capabilities.class[head]
    if (classFacts !== undefined) {
      return matchesNode(classFacts, rest)
    }

    if (context.apiNames.has(head)) {
      if (SYNC_APIS.has(head) && !context.syncHost) return false
      if (rest.length > 0 && !API_METHODS.has(rest[0]!)) return false
      if (isSystemSnapshotApi(head)) {
        const resolved = snapshotFieldSupported(systemInfoSnapshot(context), head, rest)
        if (resolved !== undefined) return resolved
      }
      return matchesNode(capabilities.api[head] ?? true, rest)
    }

    return false
  }
}

/**
 * The system-info APIs return host-owned facts, so their `return`/`success`
 * fields are answered from the live data (through the host's synchronous
 * channel) instead of a hardcoded list: a field the host does not report is not
 * available. Without a synchronous channel the check answers false.
 */
function isSystemSnapshotApi(apiName: string): boolean {
  return apiName === 'getSystemInfoSync' || apiName === 'getSystemInfo'
}

function systemInfoSnapshot(context: ServiceApiContext): Record<string, unknown> | undefined {
  try {
    const snapshot = context.syncHost?.call('api', 'system.info', {})
    return snapshot && typeof snapshot === 'object'
      ? snapshot as Record<string, unknown>
      : undefined
  } catch {
    return undefined
  }
}

/**
 * Resolve `return.<field>.<sub>` / `success.<field>.<sub>` against the snapshot.
 * Returns `undefined` when the schema is not a snapshot-field probe.
 */
function snapshotFieldSupported(
  snapshot: Record<string, unknown> | undefined,
  apiName: string,
  rest: string[],
): boolean | undefined {
  // `getSystemInfoSync` has a return value; `getSystemInfo` reports through its
  // success callback.
  const expectedMethod = apiName === 'getSystemInfoSync' ? 'return' : 'success'
  if (rest[0] !== expectedMethod) return undefined
  const path = rest.slice(1)
  if (path.length === 0) return true
  if (!snapshot) return false
  let value: unknown = snapshot
  for (const segment of path) {
    if (!value || typeof value !== 'object' || !(segment in value)) return false
    value = (value as Record<string, unknown>)[segment]
  }
  return true
}

function matchesNode(
  node: CanIUseCapabilityNode | undefined,
  segments: readonly string[],
): boolean {
  if (node === undefined) return false
  if (node === true) return segments.length === 0
  if (segments.length === 0) return true
  const next = node[segments[0]!]
  return next !== undefined && matchesNode(next, segments.slice(1))
}
