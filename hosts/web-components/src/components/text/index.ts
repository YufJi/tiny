import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { BUILTIN_HOST_TAG_PREFIX, builtinDefinitionName } from '../../tags'
import { transformTextContent } from './content'

type TextRuntime = {
  _textObserver?: MutationObserver
  _textRaw?: Element | null
  _textMain?: Element | null
}

type TextHost = {
  getBackendElement?: () => Element | null
}

const TEXT_NODE = 3
const ELEMENT_NODE = 1

/**
 * Mirrors WeChat's `wx-text`: the slotted content lives in a hidden `#raw`
 * node, and `#main` is rebuilt with decoded text and `<br>` line breaks.
 */
export function defineText(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('text'),
    template: ctx.template('text'),
    behaviors: [ctx.behaviors.base],
    properties: {
      selectable: { type: Boolean, value: false },
      decode: { type: Boolean, value: false },
      space: { type: String, value: '' },
    },
    observers: {
      decode() {
        ;(this as unknown as { updateTextContent: () => void }).updateTextContent()
      },
      space() {
        ;(this as unknown as { updateTextContent: () => void }).updateTextContent()
      },
    },
    options: ctx.hostOptions('text'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as TextRuntime
        const shadowRoot = (this as unknown as {
          getShadowRoot?: () => { getElementById?: (id: string) => unknown } | null
        }).getShadowRoot?.()
        const backendOf = (id: string): Element | null => {
          const node = shadowRoot?.getElementById?.(id) as { getBackendElement?: () => Element | null } | null
          return node?.getBackendElement?.() ?? null
        }
        const raw = backendOf('raw')
        const main = backendOf('main')
        if (!raw || !main) return
        runtime._textRaw = raw
        runtime._textMain = main
        if (typeof MutationObserver !== 'undefined') {
          runtime._textObserver = new MutationObserver(() => {
            ;(this as unknown as { updateTextContent: () => void }).updateTextContent()
          })
          runtime._textObserver.observe(raw, {
            childList: true,
            subtree: true,
            characterData: true,
          })
        }
        ;(this as unknown as { updateTextContent: () => void }).updateTextContent()
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
      updateTextContent() {
        const runtime = this as unknown as TextRuntime
        const raw = runtime._textRaw
        const main = runtime._textMain
        if (!raw || !main) return
        const doc = main.ownerDocument
        if (!doc) return
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
    },
  }).general()
}
