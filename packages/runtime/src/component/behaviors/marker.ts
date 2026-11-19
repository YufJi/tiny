import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * Marker-only `wx://` behavior.
 *
 * Several 3.17.5 built-in behaviors are declared by built-in components or
 * libraries but carry no user-visible properties/methods. Registering them as
 * markers keeps `hasBehavior`/declaration checks compatible without inventing
 * semantics Tiny does not implement.
 */
export function createMarkerBehavior(name: string) {
  return (compatibility: RuntimeCompatibilityConfig): BuiltinBehaviorSpec => {
    const id = builtinBehaviorId(compatibility, name)
    return {
      id,
      markers: {},
      options: { is: id },
    }
  }
}
