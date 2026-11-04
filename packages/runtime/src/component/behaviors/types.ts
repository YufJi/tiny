import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import type { MiniProgramComponentOptions } from '../../service'

/**
 * Runtime-level effects that a built-in behavior contributes besides its
 * ordinary properties/methods/lifetimes. These become part of the normalized
 * component definition so the render side can attach the matching marker
 * behaviors.
 */
export type BuiltinBehaviorMarkers = {
  componentExport?: boolean
  formField?: boolean
  formFieldButton?: boolean
  formFieldGroup?: boolean
  functionalPage?: boolean
  labelTarget?: boolean
}

/**
 * One WeChat built-in behavior (`wx://...`).
 *
 * `id` is the compatibility-format id for the active runtime configuration;
 * `options` is a plain component definition fragment so the existing behavior
 * merge (properties/data/methods/lifetimes/observers/listeners/relations)
 * applies unchanged.
 */
export type BuiltinBehaviorSpec = {
  id: string
  markers: BuiltinBehaviorMarkers
  options: MiniProgramComponentOptions
}

export type BuiltinBehaviorFactory = (
  compatibility: RuntimeCompatibilityConfig,
) => BuiltinBehaviorSpec

export function builtinBehaviorId(
  compatibility: RuntimeCompatibilityConfig,
  name: string,
): string {
  return `${compatibility.behaviorScheme}${name}`
}
