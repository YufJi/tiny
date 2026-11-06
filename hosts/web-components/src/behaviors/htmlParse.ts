import type * as glassEasel from '@tiny/runtime/glass-easel'

import { createRichTextFragment, decodeRichTextSpace } from '../components/rich-text/content'
import { BUILTIN_BEHAVIOR_IDS } from './ids'

type FilterTarget = DocumentFragment

type HtmlFilter = {
  parse: (
    nodes: unknown,
    target: FilterTarget,
    transformClass?: (value: string) => string,
    decodeSpace?: (value: string) => string,
  ) => FilterTarget
}

type HtmlParser = {
  parse: (html: string, wrap?: boolean) => string
}

/**
 * Web port of `wx-html-parse` (WeChat 2.33.0).
 *
 * The reference wiring exposes the exparser HTML parser/filter and a space
 * decoder to components such as rich-text and editor. The browser host keeps
 * that API and implements it with the shared rich-text sanitizer, including
 * class-prefix transformation.
 */
export function createHtmlParseBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.htmlParse,
    behaviors: [BUILTIN_BEHAVIOR_IDS.classPrefix],
    methods: {
      _createSpaceDecode(value: unknown): (text: string) => string {
        const space = String(value ?? '')
        return (text: string) => decodeRichTextSpace(text, space)
      },
      getHtmlLLParser(): HtmlParser {
        // The shared sanitizer runs in the filter below; the parser keeps the
        // reference's string-in/string-out shape.
        return { parse: (html: string) => html }
      },
      getFilter(): HtmlFilter {
        return {
          parse: (nodes, target, transformClass, decodeSpace) => {
            const document = target.ownerDocument
              ?? (typeof window !== 'undefined' ? window.document : undefined)
            if (!document) return target
            const fragment = createRichTextFragment(nodes, '', document, {
              ...(transformClass ? { transformClass } : {}),
              ...(decodeSpace ? { decodeSpace } : {}),
            })
            if (fragment) target.appendChild(fragment)
            return target
          },
        }
      },
      filterHtml(html: string, space = 'nbsp'): string {
        if (typeof document === 'undefined') return html
        const target = document.createDocumentFragment()
        const filter = (this as unknown as { getFilter: () => HtmlFilter }).getFilter()
        filter.parse(
          html,
          target,
          (value) => (this as unknown as {
            convertClassWithPrefix: (value: string) => string
          }).convertClassWithPrefix(value),
          (text) => decodeRichTextSpace(text, space),
        )
        const wrapper = document.createElement('div')
        wrapper.appendChild(target)
        return wrapper.innerHTML
      },
    },
  })
}
