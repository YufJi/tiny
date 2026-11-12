import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import type { MiniProgramComponentOptions } from '../options'
import type { MiniProgramTraitBehavior } from '../traits'
import { createComponentExportBehavior } from './component-export'
import { createFormFieldBehavior } from './form-field'
import { createFormFieldButtonBehavior } from './form-field-button'
import { createFormFieldGroupBehavior } from './form-field-group'
import { createBuiltinLabelTargetBehavior } from './label-target'
import { createStyleFilterBehavior } from './style-filter'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorFactory, BuiltinBehaviorSpec } from './types'

export type { BuiltinBehaviorMarkers, BuiltinBehaviorSpec } from './types'
export { builtinBehaviorId } from './types'

/**
 * Mini-program `Behavior()` registration.
 *
 * Kept here (next to the built-in behavior registry) so component definitions
 * and user code share one import path.
 */
export function registerBehavior(options?: MiniProgramComponentOptions): MiniProgramComponentOptions {
  const behavior = options ?? {}
  const traitImpls: Array<{
    trait: MiniProgramTraitBehavior
    impl: Record<string, unknown>
  }> = []
  Object.defineProperty(behavior, '__tinyTraitImpls', {
    value: traitImpls,
    enumerable: false,
    configurable: true,
  })
  Object.defineProperty(behavior, 'implement', {
    value(trait: MiniProgramTraitBehavior, impl: Record<string, unknown>) {
      traitImpls.push({ trait, impl })
      return behavior
    },
    enumerable: false,
    configurable: true,
  })
  return behavior
}

export function behaviorTraitImplementations(value: unknown): Array<{
  trait: MiniProgramTraitBehavior
  impl: Record<string, unknown>
}> {
  if (!value || typeof value !== 'object') return []
  const impls = (value as { __tinyTraitImpls?: unknown }).__tinyTraitImpls
  return Array.isArray(impls) ? impls as Array<{
    trait: MiniProgramTraitBehavior
    impl: Record<string, unknown>
  }> : []
}

/**
 * The `wx://` built-in behaviors implemented by Tiny.
 *
 * `wx://request-filter`, `wx://request-sender` and
 * `wx://functional-page-behavior` are intentionally excluded:
 * - request-filter/request-sender only filter URLs for WeChat's native media
 *   pipeline, which Tiny does not model;
 * - functional-page-behavior belongs to the plugin/functional-page navigator,
 *   which Tiny does not support.
 * Declaring any of them falls back to `UNSUPPORTED_BEHAVIOR`.
 */
const BUILTIN_BEHAVIOR_FACTORIES: readonly BuiltinBehaviorFactory[] = [
  createComponentExportBehavior,
  createFormFieldBehavior,
  createFormFieldButtonBehavior,
  createFormFieldGroupBehavior,
  createBuiltinLabelTargetBehavior,
  createStyleFilterBehavior,
]

/** Built-in behavior short names, in reference order. */
export const BUILTIN_BEHAVIOR_NAMES = [
  'component-export',
  'form-field',
  'form-field-button',
  'form-field-group',
  'label-target',
  'style-filter',
] as const

export type BuiltinBehaviorName = (typeof BUILTIN_BEHAVIOR_NAMES)[number]

export function resolveBuiltinBehavior(
  id: string,
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec | undefined {
  for (const factory of BUILTIN_BEHAVIOR_FACTORIES) {
    const spec = factory(compatibility)
    if (spec.id === id) return spec
  }
  return undefined
}

/** Mini-program compatibility behavior id for component export. */
export function componentExportBehavior(compatibility: RuntimeCompatibilityConfig): string {
  return builtinBehaviorId(compatibility, 'component-export')
}

/** Mini-program compatibility behavior id for custom form fields. */
export function formFieldBehavior(compatibility: RuntimeCompatibilityConfig): string {
  return builtinBehaviorId(compatibility, 'form-field')
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
