import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import type { MiniProgramComponentOptions } from '../options'
import type { MiniProgramTraitBehavior } from '../traits'
import { createComponentExportBehavior } from './component-export'
import { createFormFieldBehavior } from './form-field'
import { createFormFieldButtonBehavior } from './form-field-button'
import { createFormFieldGroupBehavior } from './form-field-group'
import { createBuiltinLabelTargetBehavior } from './label-target'
import { createStyleFilterBehavior } from './style-filter'
import { createMarkerBehavior } from './marker'
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
 * The `wx://` built-in behaviors of WeChat 3.17.5, plus Tiny's `style-filter`
 * extension.
 *
 * `wx://request-filter`, `wx://request-sender` and
 * `wx://functional-page-behavior` are intentionally excluded:
 * - request-filter/request-sender only filter URLs for WeChat's native media
 *   pipeline, which Tiny does not model;
 * - functional-page-behavior belongs to the plugin/functional-page navigator,
 *   which Tiny does not support.
 * Declaring any of them falls back to `UNSUPPORTED_BEHAVIOR`.
 *
 * `proxy-swiper`, `proxy-swiper-item`, `proxy-scroll-view` and `translate` are
 * markers: WeChat's built-in components declare them, and third-party code may
 * check `hasBehavior`, but Tiny has no separate semantics to attach.
 */
const BUILTIN_BEHAVIOR_FACTORIES: readonly BuiltinBehaviorFactory[] = [
  createFormFieldBehavior,
  createFormFieldGroupBehavior,
  createFormFieldButtonBehavior,
  createBuiltinLabelTargetBehavior,
  createMarkerBehavior('proxy-swiper'),
  createMarkerBehavior('proxy-swiper-item'),
  createMarkerBehavior('proxy-scroll-view'),
  createComponentExportBehavior,
  createMarkerBehavior('translate'),
  // Tiny extension, not part of WeChat 3.17.5.
  createStyleFilterBehavior,
]

/** Built-in behavior short names, in WeChat 3.17.5 reference order. */
export const BUILTIN_BEHAVIOR_NAMES = [
  'form-field',
  'form-field-group',
  'form-field-button',
  'label-target',
  'proxy-swiper',
  'proxy-swiper-item',
  'proxy-scroll-view',
  'component-export',
  'translate',
  // Tiny extension.
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
