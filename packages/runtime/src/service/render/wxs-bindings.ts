import type { WxsBindingMessage } from '../../tree/protocol'

/**
 * Per-page WXS binding decisions produced by the logic tree.
 *
 * Bindings are registered with the logic view id and flushed after every tree
 * update with the node's current render identity (components keep their shared
 * id, elements become locators). Keeping this state in one small store makes
 * the lifecycle explicit: register, flush, drop with the page.
 */
export class WxsBindingStore {
  private readonly byPage = new Map<string, Map<string, WxsBindingMessage>>()

  register(pageId: string, key: string, binding: WxsBindingMessage): void {
    let bindings = this.byPage.get(pageId)
    if (!bindings) {
      bindings = new Map()
      this.byPage.set(pageId, bindings)
    }
    bindings.set(key, binding)
  }

  /** Whether the page has at least one WXS binding for this event name. */
  hasEvent(pageId: string, event: string): boolean {
    const bindings = this.byPage.get(pageId)
    if (!bindings) return false
    for (const binding of bindings.values()) {
      if (binding.event === event) return true
    }
    return false
  }

  /**
   * Resolve every binding to the node's current render identity and emit it.
   * Bindings whose logic node no longer exists are skipped.
   */
  flush(
    pageId: string,
    resolveViewId: (logicViewId: string) => string | undefined,
    emit: (binding: WxsBindingMessage) => void,
  ): void {
    const bindings = this.byPage.get(pageId)
    if (!bindings) return
    for (const binding of bindings.values()) {
      const viewId = resolveViewId(binding.viewId)
      if (!viewId) continue
      emit({ ...binding, viewId })
    }
  }

  clear(pageId: string): void {
    this.byPage.delete(pageId)
  }
}
