import type { BuiltinContext, BuiltinDefinition } from '../types'
import type { BuiltinComponentTag } from '../tags'
import { builtinDefinitionName } from '../tags'

export type OpenCapabilitySpec = {
  tag: BuiltinComponentTag
  properties?: Record<string, unknown>
  code: string
  message: string
  /** Optional host request used by a capability that can partially work. */
  requestMethod?: string
}

/**
 * Common implementation for platform/open-capability tags that the browser
 * host can render as a box but cannot actually fulfill. The tag, properties
 * and diagnostics stay structured; the visual is a neutral placeholder.
 */
export function defineOpenCapability(
  ctx: BuiltinContext,
  spec: OpenCapabilitySpec,
): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName(spec.tag),
    template: ctx.template(spec.tag),
    behaviors: [ctx.behaviors.base],
    properties: (spec.properties ?? {}) as never,
    options: ctx.hostOptions(spec.tag),
    lifetimes: {
      attached() {
        ctx.options.onDiagnostic?.({
          severity: 'warning',
          code: spec.code,
          message: spec.message,
          details: { tag: spec.tag },
        })
        if (spec.requestMethod && ctx.options.hostRequest) {
          void ctx.options.hostRequest(spec.requestMethod, { ...(this.data as Record<string, unknown>) })
            .catch(() => undefined)
        }
      },
    },
  }).general()
}
