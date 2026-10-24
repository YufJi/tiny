import type { ResolvedNamingConfig } from '@tiny/manifest'
import type { MiniProgramComponentOptions } from './service'

const behaviorRegistry = new WeakSet<object>()

export function registerBehavior(options?: MiniProgramComponentOptions): MiniProgramComponentOptions {
  const behavior = options ?? {}
  behaviorRegistry.add(behavior)
  return behavior
}

export function isRegisteredBehavior(value: unknown): boolean {
  return typeof value === 'object' && value !== null && behaviorRegistry.has(value)
}

/** Built-in behavior id for component export, e.g. `wx://component-export`. */
export function componentExportBehavior(naming: ResolvedNamingConfig): string {
  return `${naming.behaviorScheme}component-export`
}

const BUILTIN_BEHAVIOR_SCHEME = /^[A-Za-z][\w-]*:\/\//

/**
 * Built-in behaviors are URI-like strings (`wx://…` by default, `tiny://…`
 * when that namespace is configured). Any URI-shaped id is engine-owned, so a
 * legacy scheme still produces a diagnostic instead of being ignored.
 */
export function isBuiltinBehavior(value: unknown): value is string {
  return typeof value === 'string' && BUILTIN_BEHAVIOR_SCHEME.test(value)
}
