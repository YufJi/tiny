import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

/**
 * Mirrors `wx-cover-view`. WeChat renders it in the native cover layer above
 * video/map; the browser host uses an equivalent block box in normal DOM order
 * and leaves stacking to the page.
 */
export function defineCoverView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('cover-view'),
    template: ctx.template('cover-view'),
    behaviors: [ctx.behaviors.base],
    properties: {
      scrollTop: { type: String, value: '' },
      scrollLeft: { type: String, value: '' },
    },
    options: ctx.hostOptions('cover-view'),
  }).general()
}
