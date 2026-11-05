/**
 * `<rich-text>` content normalization.
 *
 * WeChat accepts either an HTML string or a node array and only renders a
 * documented subset of HTML. The browser host parses into a detached fragment,
 * drops unsupported tags/attributes and neutralizes script-capable URLs.
 */

/** Tags documented for `<rich-text>`. */
export const RICH_TEXT_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'col', 'colgroup', 'dd', 'del',
  'div', 'dl', 'dt', 'em', 'fieldset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'i', 'img', 'ins', 'label', 'legend', 'li', 'ol', 'p', 'q', 'span',
  'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
  'tr', 'ul',
])

const RICH_TEXT_ATTRIBUTES = new Set([
  'class', 'style', 'src', 'alt', 'href', 'title', 'width', 'height', 'target',
  'rel', 'colspan', 'rowspan', 'align', 'valign', 'start', 'type',
])

const VOID_TAGS = new Set(['br', 'col', 'hr', 'img'])

/** Tags that must never contribute their text/children to the rendered tree. */
const DROPPED_TAGS = new Set([
  'base', 'button', 'embed', 'form', 'iframe', 'input', 'link', 'meta', 'object',
  'option', 'script', 'select', 'style', 'textarea',
])

export type RichTextOptions = {
  decodeSpace?: (text: string) => string
  transformClass?: (value: string) => string
}

export type RichTextNode = {
  type?: string
  name?: string
  text?: string
  attrs?: Record<string, unknown>
  children?: RichTextNode[]
}

export function decodeRichTextSpace(text: string, space: string): string {
  if (space === 'nbsp') return text.replace(/ /g, '\u00a0')
  if (space === 'ensp') return text.replace(/ /g, '\u2002')
  if (space === 'emsp') return text.replace(/ /g, '\u2003')
  return text
}

function decodeText(text: string, space: string, options: RichTextOptions): string {
  return options.decodeSpace?.(text) ?? decodeRichTextSpace(text, space)
}

function transformClassValue(value: string, options: RichTextOptions): string {
  if (!options.transformClass) return value
  return value.split(/\s+/).filter(Boolean).map(options.transformClass).join(' ')
}

export function isAllowedRichTextTag(tag: string): boolean {
  return RICH_TEXT_TAGS.has(tag.toLowerCase())
}

export function isDroppedRichTextTag(tag: string): boolean {
  return DROPPED_TAGS.has(tag.toLowerCase())
}

function isSafeUrl(value: string, tag: string, attribute: string): boolean {
  const url = value.trim().toLowerCase()
  if (url.startsWith('javascript:') || url.startsWith('vbscript:')) return false
  if (url.startsWith('data:')) {
    return tag === 'img' && attribute === 'src' && /^data:image\//i.test(url)
  }
  return true
}

function isAllowedAttribute(tag: string, name: string, value: string): boolean {
  const lower = name.toLowerCase()
  if (lower.startsWith('on')) return false
  if (lower.startsWith('data-')) return true
  if (!RICH_TEXT_ATTRIBUTES.has(lower)) return false
  if (lower === 'src' || lower === 'href') return isSafeUrl(value, tag, lower)
  return true
}

function cleanNode(
  node: Node,
  space: string,
  document: Document,
  options: RichTextOptions,
): Node | null {
  if (node.nodeType === 3) {
    return document.createTextNode(decodeText(node.textContent ?? '', space, options))
  }
  if (node.nodeType !== 1) return null
  const element = node as Element
  const tag = element.tagName.toLowerCase()
  if (!isAllowedRichTextTag(tag)) {
    if (isDroppedRichTextTag(tag)) return null
    // Keep the children of unsupported inline wrappers rather than dropping
    // the whole subtree; WeChat's filter behaves the same way for unknown tags.
    const fragment = document.createDocumentFragment()
    for (const child of Array.from(element.childNodes)) {
      const cleaned = cleanNode(child, space, document, options)
      if (cleaned) fragment.appendChild(cleaned)
    }
    return fragment
  }
  const next = document.createElement(tag)
  for (const attribute of Array.from(element.attributes)) {
    if (!isAllowedAttribute(tag, attribute.name, attribute.value)) continue
    const value = attribute.name.toLowerCase() === 'class'
      ? transformClassValue(attribute.value, options)
      : attribute.value
    next.setAttribute(attribute.name, value)
  }
  for (const child of Array.from(element.childNodes)) {
    const cleaned = cleanNode(child, space, document, options)
    if (cleaned) next.appendChild(cleaned)
  }
  return next
}

function appendRichTextNode(
  parent: Node,
  raw: unknown,
  space: string,
  document: Document,
  options: RichTextOptions,
): void {
  if (!raw || typeof raw !== 'object') return
  const node = raw as RichTextNode
  if (node.type === 'text' || (node.text !== undefined && !node.name)) {
    parent.appendChild(document.createTextNode(decodeText(String(node.text ?? ''), space, options)))
    return
  }
  const tag = String(node.name ?? '').toLowerCase()
  if (!tag) return
  if (!isAllowedRichTextTag(tag)) {
    if (isDroppedRichTextTag(tag)) return
    for (const child of node.children ?? []) appendRichTextNode(parent, child, space, document, options)
    return
  }
  const element = document.createElement(tag)
  for (const [name, value] of Object.entries(node.attrs ?? {})) {
    if (value === undefined || value === null) continue
    const text = String(value)
    if (!isAllowedAttribute(tag, name, text)) continue
    element.setAttribute(
      name,
      name.toLowerCase() === 'class' ? transformClassValue(text, options) : text,
    )
  }
  if (!VOID_TAGS.has(tag)) {
    for (const child of node.children ?? []) appendRichTextNode(element, child, space, document, options)
  }
  parent.appendChild(element)
}

/**
 * Build a detached fragment for `nodes`. Returns `null` when the value is
 * neither an HTML string nor a node array.
 */
export function createRichTextFragment(
  nodes: unknown,
  space: string,
  document: Document,
  options: RichTextOptions = {},
): DocumentFragment | null {
  if (typeof nodes === 'string') {
    const template = document.createElement('template')
    template.innerHTML = nodes
    const fragment = document.createDocumentFragment()
    for (const child of Array.from(template.content.childNodes)) {
      const cleaned = cleanNode(child, space, document, options)
      if (cleaned) fragment.appendChild(cleaned)
    }
    return fragment
  }
  if (Array.isArray(nodes)) {
    const fragment = document.createDocumentFragment()
    for (const node of nodes) appendRichTextNode(fragment, node, space, document, options)
    return fragment
  }
  return null
}
