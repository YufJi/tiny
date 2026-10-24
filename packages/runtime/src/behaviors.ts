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

export const BUILTIN_COMPONENT_EXPORT_BEHAVIOR = 'wx://component-export'

export function isBuiltinBehavior(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('wx://')
}
