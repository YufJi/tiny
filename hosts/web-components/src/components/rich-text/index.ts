import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type RichTextRuntime = {
  _ready?: boolean
  _cachedNodes?: unknown
  _hasCached?: boolean
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
  getHtmlLLParser?: () => { parse: (html: string) => string }
  getFilter?: () => {
    parse: (
      nodes: unknown,
      target: DocumentFragment,
      transformClass: (value: string) => string,
      decodeSpace: (text: string) => string,
    ) => DocumentFragment
  }
  _createSpaceDecode?: (value: unknown) => (text: string) => string
  convertClassWithPrefix?: (value: string) => string
}

/**
 * Mirrors `wx-rich-text` in WeChat WebView 2.33.0.
 *
 * Behaviors: `wx-base` + `wx-class-prefix` + `wx-html-parse`. Parsing and
 * sanitizing are provided by the html-parse behavior; this component only
 * caches the observer value until attach and owns the `user-select` DOM state.
 */
export function defineRichText(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('rich-text'),
    template: ctx.template('rich-text'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.classPrefix, ctx.behaviors.htmlParse],
    properties: {
      space: { type: String, value: '' },
      nodes: { value: [], observer: '_nodesObserver' },
      userSelect: {
        type: Boolean,
        value: false,
        observer: 'userSelectChanged',
      },
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
          ;(this as unknown as { _nodesObserver: (value: unknown) => void })
            ._nodesObserver(nodes)
        }
        ;(this as unknown as { userSelectChanged: (value: unknown) => void })
          .userSelectChanged(this.data.userSelect)
      },
      detached() {
        ;(this as unknown as RichTextRuntime)._ready = false
      },
    },
    methods: {
      contentElement(): HTMLElement | null {
        const runtime = this as unknown as RichTextRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('rich-text')
          ?.getBackendElement?.() ?? null
      },
      _nodesObserver(nodes: unknown) {
        const runtime = this as unknown as RichTextRuntime
        if (!runtime._ready) {
          runtime._cachedNodes = nodes
          runtime._hasCached = true
          return
        }
        const container = (this as unknown as {
          contentElement: () => HTMLElement | null
        }).contentElement()
        if (!container) return
        let value = nodes
        if (typeof value === 'string') {
          try {
            value = runtime.getHtmlLLParser?.().parse(value) ?? value
          } catch (error) {
            ctx.options.onDiagnostic?.({
              severity: 'error',
              code: 'RICH_TEXT_PARSE_ERROR',
              message: 'Failed to parse <rich-text nodes>.',
              details: { error: error instanceof Error ? error.message : String(error) },
            })
            return
          }
        }
        if (typeof value !== 'string' && !Array.isArray(value)) {
          ctx.options.onDiagnostic?.({
            severity: 'warning',
            code: 'RICH_TEXT_INVALID_NODES',
            message: '<rich-text nodes> expects a string or an array.',
            details: { type: typeof value },
          })
          return
        }
        const filter = runtime.getFilter?.()
        if (!filter) return
        try {
          const target = document.createDocumentFragment()
          filter.parse(
            value,
            target,
            (className) => runtime.convertClassWithPrefix?.(className) ?? className,
            runtime._createSpaceDecode?.(this.data.space)
              ?? ((text: string) => text),
          )
          container.replaceChildren(target)
        } catch (error) {
          ctx.options.onDiagnostic?.({
            severity: 'error',
            code: 'RICH_TEXT_PARSE_ERROR',
            message: 'Failed to parse <rich-text nodes>.',
            details: { error: error instanceof Error ? error.message : String(error) },
          })
        }
      },
      userSelectChanged(value: unknown) {
        const container = (this as unknown as {
          contentElement: () => HTMLElement | null
        }).contentElement()
        if (!container) return
        if (value) {
          container.style.display = 'block'
          container.style.willChange = 'transform'
          container.classList.add('__wa_selectable_region')
        } else {
          container.style.willChange = 'unset'
          container.classList.remove('__wa_selectable_region')
        }
      },
    },
  }).general()
}
