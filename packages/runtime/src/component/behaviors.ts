import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import type { MiniProgramComponentOptions } from '../service/thread'

const behaviorRegistry = new WeakSet<object>()

export function registerBehavior(options?: MiniProgramComponentOptions): MiniProgramComponentOptions {
  const behavior = options ?? {}
  behaviorRegistry.add(behavior)
  return behavior
}

export function isRegisteredBehavior(value: unknown): boolean {
  return typeof value === 'object' && value !== null && behaviorRegistry.has(value)
}

/** Mini-program compatibility behavior id for component export. */
export function componentExportBehavior(compatibility: RuntimeCompatibilityConfig): string {
  return `${compatibility.behaviorScheme}component-export`
}

/** Mini-program compatibility behavior id for custom form fields. */
export function formFieldBehavior(compatibility: RuntimeCompatibilityConfig): string {
  return `${compatibility.behaviorScheme}form-field`
}

const BUILTIN_BEHAVIOR_SCHEME = /^[A-Za-z][\w-]*:\/\//

/**
 * Built-in behaviors are URI-like strings using the configured compatibility
 * scheme. Any URI-shaped id is engine-owned, so an unsupported scheme still
 * produces a diagnostic instead of being ignored.
 */
export function isBuiltinBehavior(value: unknown): value is string {
  return typeof value === 'string' && BUILTIN_BEHAVIOR_SCHEME.test(value)
}
