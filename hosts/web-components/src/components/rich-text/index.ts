import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'
import { createRichTextFragment } from './content'

type RichTextRuntime = {
  _ready?: boolean
  _cachedNodes?: unknown
  _hasCached?: boolean
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

/**
 * Mirrors `wx-rich-text`: a single `#rich-text` container receives the parsed
 * `nodes` content. The reference also applies class prefixes to content; Tiny
 * keeps author classes and relies on the host style boundary instead.
 */
export function defineRichText(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('rich-text'),
    template: ctx.template('rich-text'),
    behaviors: [ctx.behaviors.base],
    properties: {
      nodes: { value: [], observer: '_nodesObserver' },
      space: { type: String, value: '' },
      userSelect: { type: Boolean, value: false },
    },
    options: ctx.hostOptions('rich-text'),
    lifetimes: {
      created() {
        const runtime = this as unknown as RichTextRuntime
        runtime._ready = false
        runtime._hasCached = false
      },
      attached() {
        const runtime = this as unknown as RichTextRuntime
        runtime._ready = true
        if (runtime._hasCached) {
          const nodes = runtime._cachedNodes
          runtime._hasCached = false
          runtime._cachedNodes = undefined
          ;(this as unknown as { _render: (value: unknown) => void })._render(nodes)
        }
      },
      detached() {
        const runtime = this as unknown as RichTextRuntime
        runtime._ready = false
      },
    },
    methods: {
      _nodesObserver(next: unknown) {
        const runtime = this as unknown as RichTextRuntime
        if (!runtime._ready) {
          runtime._cachedNodes = next
          runtime._hasCached = true
          return
        }
        ;(this as unknown as { _render: (value: unknown) => void })._render(next)
      },
      _render(nodes: unknown) {
        const runtime = this as unknown as RichTextRuntime
        const container = runtime.getShadowRoot?.()?.getElementById?.('rich-text')
          ?.getBackendElement?.()
        if (!container) return
        try {
          const fragment = createRichTextFragment(
            nodes,
            String(this.data.space ?? ''),
            document,
          )
          if (!fragment) {
            ctx.options.onDiagnostic?.({
              severity: 'warning',
              code: 'RICH_TEXT_INVALID_NODES',
              message: '<rich-text nodes> expects a string or an array.',
              details: { type: typeof nodes },
            })
            return
          }
          container.replaceChildren(fragment)
        } catch (error) {
          ctx.options.onDiagnostic?.({
            severity: 'error',
            code: 'RICH_TEXT_PARSE_ERROR',
            message: 'Failed to parse <rich-text nodes>.',
            details: { error: error instanceof Error ? error.message : String(error) },
          })
        }
      },
    },
  }).general()
}
