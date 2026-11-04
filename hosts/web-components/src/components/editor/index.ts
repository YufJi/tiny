import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type EditorRuntime = {
  _inputListener?: () => void
  _focusListener?: () => void
  _blurListener?: () => void
  _selectionListener?: () => void
  _tapListener?: () => void
  _lastFormats?: Record<string, unknown>
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

type DeltaOp = {
  insert: string | { image: string }
  attributes?: Record<string, unknown>
}

const INLINE_TAGS = new Set(['span', 'strong', 'b', 'ins', 'em', 'i', 'u', 'a', 'del', 's', 'sub', 'sup'])

function inlineAttributes(element: Element): Record<string, unknown> | undefined {
  const tag = element.tagName.toLowerCase()
  const attributes: Record<string, unknown> = {}
  if (tag === 'strong' || tag === 'b') attributes.bold = true
  if (tag === 'em' || tag === 'i') attributes.italic = true
  if (tag === 'u' || tag === 'ins') attributes.underline = true
  if (tag === 'del' || tag === 's') attributes.strike = true
  if (tag === 'sub') attributes.script = 'sub'
  if (tag === 'sup') attributes.script = 'super'
  if (tag === 'a') {
    const href = element.getAttribute('href')
    if (href) attributes.link = href
  }
  const color = element.getAttribute('color')
  if (color) attributes.color = color
  return Object.keys(attributes).length > 0 ? attributes : undefined
}

function pushText(ops: DeltaOp[], text: string, attributes?: Record<string, unknown>): void {
  if (!text) return
  ops.push(attributes ? { insert: text, attributes } : { insert: text })
}

function walkDelta(node: Node, ops: DeltaOp[], attributes?: Record<string, unknown>): void {
  if (node.nodeType === 3) {
    pushText(ops, node.textContent ?? '', attributes)
    return
  }
  if (node.nodeType !== 1) return
  const element = node as Element
  const tag = element.tagName.toLowerCase()
  if (tag === 'br') {
    ops.push({ insert: '\n' })
    return
  }
  if (tag === 'img') {
    const src = element.getAttribute('src')
    if (src) ops.push({ insert: { image: src } })
    return
  }
  const block = !INLINE_TAGS.has(tag)
  const nextAttributes = { ...(attributes ?? {}), ...(inlineAttributes(element) ?? {}) }
  for (const child of Array.from(element.childNodes)) {
    walkDelta(child, ops, Object.keys(nextAttributes).length > 0 ? nextAttributes : undefined)
  }
  if (block && ops.length > 0) {
    const last = ops[ops.length - 1]
    if (!(typeof last.insert === 'string' && last.insert.endsWith('\n'))) ops.push({ insert: '\n' })
  }
}

function buildDelta(editor: HTMLElement): { ops: DeltaOp[] } {
  const ops: DeltaOp[] = []
  for (const child of Array.from(editor.childNodes)) walkDelta(child, ops)
  return { ops }
}

function activeFormats(node: Node | null): Record<string, unknown> {
  const formats: Record<string, unknown> = {}
  let current: Node | null = node?.nodeType === 3 ? node.parentNode : node
  while (current && current.nodeType === 1) {
    const element = current as HTMLElement
    const tag = element.tagName.toLowerCase()
    if (tag === 'strong' || tag === 'b') formats.bold = true
    if (tag === 'em' || tag === 'i') formats.italic = true
    if (tag === 'u') formats.underline = true
    if (tag === 's' || tag === 'del') formats.strike = true
    if (tag === 'code') formats.code = true
    if (tag === 'a') {
      const href = element.getAttribute('href')
      if (href) formats.link = href
    }
    const align = element.getAttribute('align') ?? element.style?.textAlign
    if (align) formats.align = align
    const listParent = element.closest('ol, ul')
    if (listParent) formats.list = listParent.tagName.toLowerCase() === 'ol' ? 'ordered' : 'bullet'
    if (/^h[1-6]$/.test(tag)) formats.header = Number(tag.slice(1))
    current = element.parentElement
  }
  return formats
}

/**
 * Mirrors the first version of `wx-editor`: a contenteditable rich-text host
 * with the documented attributes and `ready`/`focus`/`blur`/`input` events.
 * The full EditorContext command set is intentionally not wired yet.
 */
export function defineEditor(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('editor'),
    template: ctx.template('editor'),
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.quillCore,
      ctx.behaviors.htmlParse,
    ],
    properties: {
      readOnly: { type: Boolean, value: false, observer: 'readOnlyChanged' },
      placeholder: { type: String, value: '', observer: 'placeholderChanged' },
      showImgSize: { type: Boolean, value: false },
      showImgToolbar: { type: Boolean, value: false },
      showImgResize: { type: Boolean, value: false },
      enableFormats: { type: Array, value: [] },
      enterkeyhint: { type: String, value: 'enter' },
      confirmHold: { type: Boolean, value: true },
    },
    options: ctx.hostOptions('editor'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as EditorRuntime
        const editor = (this as unknown as {
          editorElement: () => HTMLElement | null
        }).editorElement()
        if (!editor) return
        editor.setAttribute('role', 'textbox')
        editor.setAttribute('aria-multiline', 'true')
        editor.setAttribute('enterkeyhint', String(this.data.enterkeyhint ?? 'enter'))
        ;(this as unknown as { readOnlyChanged: (value: boolean) => void })
          .readOnlyChanged(Boolean(this.data.readOnly))
        ;(this as unknown as { placeholderChanged: (value: string) => void })
          .placeholderChanged(String(this.data.placeholder ?? ''))
        runtime._inputListener = () => {
          ;(this as unknown as { notifyChange: (name: string) => void })
            .notifyChange('input')
        }
        runtime._focusListener = () => {
          ;(this as unknown as { notifyChange: (name: string) => void })
            .notifyChange('focus')
        }
        runtime._blurListener = () => {
          ;(this as unknown as { notifyChange: (name: string) => void })
            .notifyChange('blur')
        }
        runtime._selectionListener = () => {
          ;(this as unknown as { updateStatus: () => void }).updateStatus()
        }
        runtime._tapListener = () => {
          this.triggerEvent('tap', {})
        }
        editor.addEventListener('input', runtime._inputListener)
        editor.addEventListener('focus', runtime._focusListener)
        editor.addEventListener('blur', runtime._blurListener)
        editor.addEventListener('click', runtime._tapListener)
        if (typeof document !== 'undefined') {
          document.addEventListener('selectionchange', runtime._selectionListener)
        }
        this.triggerEvent('ready', {})
      },
      detached() {
        const runtime = this as unknown as EditorRuntime
        const editor = (this as unknown as {
          editorElement: () => HTMLElement | null
        }).editorElement()
        if (!editor) return
        if (runtime._inputListener) editor.removeEventListener('input', runtime._inputListener)
        if (runtime._focusListener) editor.removeEventListener('focus', runtime._focusListener)
        if (runtime._blurListener) editor.removeEventListener('blur', runtime._blurListener)
        if (runtime._tapListener) editor.removeEventListener('click', runtime._tapListener)
        if (runtime._selectionListener && typeof document !== 'undefined') {
          document.removeEventListener('selectionchange', runtime._selectionListener)
        }
        runtime._selectionListener = undefined
        runtime._tapListener = undefined
      },
    },
    methods: {
      editorElement(): HTMLElement | null {
        const runtime = this as unknown as EditorRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('editor')?.getBackendElement?.() ?? null
      },
      readOnlyChanged(value: boolean) {
        const editor = (this as unknown as { editorElement: () => HTMLElement | null })
          .editorElement()
        if (!editor) return
        editor.contentEditable = value ? 'false' : 'true'
        editor.setAttribute('aria-readonly', value ? 'true' : 'false')
      },
      placeholderChanged(value: string) {
        const editor = (this as unknown as { editorElement: () => HTMLElement | null })
          .editorElement()
        if (!editor) return
        editor.setAttribute('data-placeholder', value)
        ;(this as unknown as { toggleBlank: () => void }).toggleBlank()
      },
      toggleBlank() {
        const editor = (this as unknown as { editorElement: () => HTMLElement | null })
          .editorElement()
        if (!editor) return
        const empty = (editor.textContent ?? '').trim() === ''
          && !editor.querySelector('img')
        editor.classList.toggle('ql-blank', empty)
      },
      detail() {
        const editor = (this as unknown as { editorElement: () => HTMLElement | null })
          .editorElement()
        if (!editor) return { html: '', text: '', delta: { ops: [] } }
        ;(this as unknown as { toggleBlank: () => void }).toggleBlank()
        return {
          html: editor.innerHTML,
          text: editor.textContent ?? '',
          delta: buildDelta(editor),
        }
      },
      notifyChange(name: string) {
        if (name === 'input') {
          ;(this as unknown as { updateStatus: () => void }).updateStatus()
        }
        this.triggerEvent(name, (this as unknown as { detail: () => unknown }).detail())
      },
      updateStatus() {
        const editor = (this as unknown as { editorElement: () => HTMLElement | null })
          .editorElement()
        if (!editor || typeof document === 'undefined') return
        const selection = document.getSelection()
        if (!selection?.anchorNode || !editor.contains(selection.anchorNode)) return
        const runtime = this as unknown as EditorRuntime
        const formats = activeFormats(selection.anchorNode)
        if (JSON.stringify(formats) === JSON.stringify(runtime._lastFormats ?? {})) return
        runtime._lastFormats = formats
        this.triggerEvent('statuschange', formats)
      },
    },
  }).general()
}
