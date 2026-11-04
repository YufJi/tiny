import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import type { MiniProgramComponentOptions } from '../../service'
import { createComponentExportBehavior } from './component-export'
import { createFormFieldBehavior } from './form-field'
import { createFormFieldButtonBehavior } from './form-field-button'
import { createFormFieldGroupBehavior } from './form-field-group'
import { createFunctionalPageBehavior } from './functional-page-behavior'
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
  return options ?? {}
}

/**
 * The `wx://` built-in behaviors implemented by Tiny.
 *
 * `wx://request-filter` and `wx://request-sender` are intentionally excluded:
 * they only filter URLs for WeChat's native media pipeline, which Tiny does not
 * model. Declaring them falls back to `UNSUPPORTED_BEHAVIOR`.
 */
const BUILTIN_BEHAVIOR_FACTORIES: readonly BuiltinBehaviorFactory[] = [
  createComponentExportBehavior,
  createFormFieldBehavior,
  createFormFieldButtonBehavior,
  createFormFieldGroupBehavior,
  createFunctionalPageBehavior,
  createBuiltinLabelTargetBehavior,
  createStyleFilterBehavior,
]

/** Built-in behavior short names, in reference order. */
export const BUILTIN_BEHAVIOR_NAMES = [
  'component-export',
  'form-field',
  'form-field-button',
  'form-field-group',
  'functional-page-behavior',
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
