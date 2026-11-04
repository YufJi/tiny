import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type RootPortalRuntime = {
  _moved?: boolean
  _originalParent?: Node | null
  _originalNextSibling?: Node | null
  getBackendElement?: () => HTMLElement | null
}

function pageRootOf(host: HTMLElement): HTMLElement | null {
  const root = host.closest?.('tiny-page')
  if (root instanceof HTMLElement) return root
  // Some hosts mount the page root under a different tag; walk to the
  // top-most element that is still inside the document body.
  let current: HTMLElement | null = host
  while (current?.parentElement && current.parentElement !== document.body) {
    current = current.parentElement
  }
  return current
}

/**
 * Mirrors `wx-root-portal`: content escapes ancestor stacking/transform
 * contexts and is mounted at the page root. The host node itself is moved so
 * the slotted content stays in the same glass-easel tree.
 */
export function defineRootPortal(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('root-portal'),
    template: ctx.template('root-portal'),
    behaviors: [ctx.behaviors.base],
    properties: {
      enable: { type: Boolean, value: true, observer: 'enableChanged' },
    },
    options: ctx.hostOptions('root-portal'),
    lifetimes: {
      created() {
        const runtime = this as unknown as RootPortalRuntime
        runtime._moved = false
      },
      attached() {
        ;(this as unknown as { attachNow: () => void }).attachNow()
      },
      detached() {
        ;(this as unknown as { restoreNow: () => void }).restoreNow()
      },
    },
    methods: {
      attachNow() {
        const runtime = this as unknown as RootPortalRuntime
        if (runtime._moved) return
        const host = runtime.getBackendElement?.()
        if (!host) return
        const pageRoot = pageRootOf(host)
        if (!pageRoot || host.parentNode === pageRoot) return
        runtime._originalParent = host.parentNode
        runtime._originalNextSibling = host.nextSibling
        pageRoot.appendChild(host)
        runtime._moved = true
      },
      restoreNow() {
        const runtime = this as unknown as RootPortalRuntime
        if (!runtime._moved) return
        const host = runtime.getBackendElement?.()
        const parent = runtime._originalParent
        runtime._moved = false
        if (!host || !parent) return
        const next = runtime._originalNextSibling
        if (next && next.parentNode === parent) parent.insertBefore(host, next)
        else parent.appendChild(host)
        runtime._originalParent = null
        runtime._originalNextSibling = null
      },
      enableChanged(next: boolean) {
        const runtime = this as unknown as {
          attachNow: () => void
          restoreNow: () => void
        }
        if (next) runtime.attachNow()
        else runtime.restoreNow()
      },
    },
  }).general()
}
