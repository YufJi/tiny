import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

/**
 * Mirrors `wx-editor-portal`: a slot mounted into an editor custom block.
 * The first pass keeps the content in normal flow; a future EditorContext
 * `insertCustomBlock` implementation will move it into the block position.
 */
export function defineEditorPortal(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('editor-portal'),
    template: ctx.template('editor-portal'),
    behaviors: [ctx.behaviors.base],
    properties: {
      key: { type: String, value: '' },
    },
    options: ctx.hostOptions('editor-portal'),
  }).general()
}
