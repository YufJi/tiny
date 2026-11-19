/**
 * Per-page WXS event bindings produced by the logic tree.
 *
 * The render pageframe executes WXS handlers from its own template runtime, so
 * the only remaining service-side consumer is the custom-event forwarding gate:
 * `tree.customEvent` is only sent for pages that actually bind that event.
 */
export class WxsBindingStore {
  private readonly eventsByPage = new Map<string, Set<string>>()

  register(pageId: string, event: string): void {
    let events = this.eventsByPage.get(pageId)
    if (!events) {
      events = new Set()
      this.eventsByPage.set(pageId, events)
    }
    events.add(event)
  }

  /** Whether the page has at least one WXS binding for this event name. */
  hasEvent(pageId: string, event: string): boolean {
    return this.eventsByPage.get(pageId)?.has(event) ?? false
  }

  clear(pageId: string): void {
    this.eventsByPage.delete(pageId)
  }
}
