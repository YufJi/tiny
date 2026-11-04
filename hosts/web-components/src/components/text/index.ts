import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { BUILTIN_HOST_TAG_PREFIX, builtinDefinitionName } from '../../tags'
import { transformTextContent } from './content'

type TextRuntime = {
  _textObserver?: MutationObserver
  _textRaw?: HTMLElement | null
  _textMain?: HTMLElement | null
}

type TextBackendNode = {
  getBackendElement?: () => HTMLElement | null
}

const TEXT_NODE = 3
const ELEMENT_NODE = 1
const SELECTABLE_REGION_CLASS = '__wa_selectable_region'

/**
 * Mirrors WeChat's `wx-text`: the slotted content lives in a hidden `#raw`
 * node, and `#main` is rebuilt with decoded text and `<br>` line breaks.
 * `user-select` (2.33.0) turns `#main` into the selectable region.
 */
export function defineText(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('text'),
    template: ctx.template('text'),
    behaviors: [ctx.behaviors.base],
    properties: {
      selectable: { type: Boolean, value: false },
      userSelect: { type: Boolean, value: false, observer: 'userSelectChanged' },
      decode: { type: Boolean, value: false, observer: '_update' },
      space: { type: String, value: '', observer: '_update' },
    },
    options: ctx.hostOptions('text'),
    lifetimes: {
      attached() {
        if (this.data.selectable) {
          // 2.33.0 deprecates `selectable` in favour of `user-select`.
          ctx.options.onDiagnostic?.({
            severity: 'warning',
            code: 'DEPRECATED_TEXT_SELECTABLE',
            message: '<text selectable> is deprecated; use user-select instead.',
            details: {},
          })
        }
        const runtime = this as unknown as TextRuntime
        const shadowRoot = (this as unknown as {
          getShadowRoot?: () => { getElementById?: (id: string) => unknown } | null
        }).getShadowRoot?.()
        const backendOf = (id: string): HTMLElement | null => {
          const node = shadowRoot?.getElementById?.(id) as TextBackendNode | null
          return node?.getBackendElement?.() ?? null
        }
        const raw = backendOf('raw')
        const main = backendOf('main')
        if (!raw || !main) return
        runtime._textRaw = raw
        runtime._textMain = main
        if (typeof MutationObserver !== 'undefined') {
          runtime._textObserver = new MutationObserver(() => {
            ;(this as unknown as { _update: () => void })._update()
          })
          runtime._textObserver.observe(raw, {
            childList: true,
            subtree: true,
            characterData: true,
          })
        }
        ;(this as unknown as { _update: () => void })._update()
        ;(this as unknown as { userSelectChanged: (next: boolean) => void })
          .userSelectChanged(Boolean(this.data.userSelect))
      },
      detached() {
        const runtime = this as unknown as TextRuntime
        runtime._textObserver?.disconnect()
        runtime._textObserver = undefined
        runtime._textRaw = null
        runtime._textMain = null
      },
    },
    methods: {
      _update() {
        const runtime = this as unknown as TextRuntime
        const raw = runtime._textRaw
        const main = runtime._textMain
        if (!raw || !main) return
        const doc = main.ownerDocument
        if (!doc || typeof main.replaceChildren !== 'function') return
        const fragment = doc.createDocumentFragment()
        for (const node of Array.from(raw.childNodes)) {
          if (node.nodeType === TEXT_NODE) {
            const lines = transformTextContent(node.textContent ?? '', this.data).split('\n')
            for (const [index, line] of lines.entries()) {
              if (index > 0) fragment.appendChild(doc.createElement('br'))
              fragment.appendChild(doc.createTextNode(line))
            }
          } else if (
            node.nodeType === ELEMENT_NODE &&
            (node as Element).tagName.toLowerCase() === `${BUILTIN_HOST_TAG_PREFIX}text`
          ) {
            fragment.appendChild(node.cloneNode(true))
          }
        }
        main.replaceChildren(fragment)
      },
      userSelectChanged(next: boolean) {
        const main = (this as unknown as TextRuntime)._textMain
        if (!main?.style || !main.classList) return
        if (next) {
          main.style.display = 'inline-block'
          main.style.willChange = 'transform'
          main.classList.add(SELECTABLE_REGION_CLASS)
        } else {
          main.style.display = 'inline'
          main.style.willChange = 'unset'
          main.classList.remove(SELECTABLE_REGION_CLASS)
        }
      },
    },
  }).general()
}
