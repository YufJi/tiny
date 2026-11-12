import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { cloneJsonSafe } from '../../shared/data'

/**
 * Service-side render update queue.
 *
 * Owns the per-page pending patch data and the `setData` completion batches.
 * The bridge supplies the actual render flush and error policy.
 */
export class RenderUpdateScheduler {
  private readonly pendingPages = new Set<string>()
  private readonly pendingPageDataPatches = new Map<
    string,
    Array<Record<string, unknown>>
  >()
  private readonly pendingCompletions = new Map<string, Array<() => void>>()
  private readonly ackedBatches = new Map<
    string,
    { pageId: string; callbacks: Array<() => void> }
  >()
  private updateScheduled = false
  private completionCounter = 0

  recordPageData(pageId: string, patch: Record<string, unknown>): void {
    const cloned = cloneJsonSafe(patch)
    const pending = this.pendingPageDataPatches.get(pageId)
    if (pending) pending.push(cloned)
    else this.pendingPageDataPatches.set(pageId, [cloned])
  }

  dropLastPageData(pageId: string): void {
    const pending = this.pendingPageDataPatches.get(pageId)
    pending?.pop()
    if (pending?.length === 0) this.pendingPageDataPatches.delete(pageId)
  }

  pageDataPatches(pageId: string): Array<Record<string, unknown>> | undefined {
    return this.pendingPageDataPatches.get(pageId)
  }

  clearPageData(pageId: string): void {
    this.pendingPageDataPatches.delete(pageId)
  }

  queueCompletion(pageId: string, callback: () => void): void {
    const queue = this.pendingCompletions.get(pageId)
    if (queue) queue.push(callback)
    else this.pendingCompletions.set(pageId, [callback])
  }

  schedule(pageId: string, flushPage: (pageId: string) => void): void {
    this.pendingPages.add(pageId)
    if (this.updateScheduled) return
    this.updateScheduled = true
    queueMicrotask(() => {
      this.updateScheduled = false
      const pages = [...this.pendingPages]
      this.pendingPages.clear()
      for (const id of pages) flushPage(id)
    })
  }

  /**
   * Move the page's unsent completions into an acknowledged batch.
   *
   * Batch tokens are opaque and page-scoped by construction: a token is only
   * consumed by the ack for the message that carried it.
   */
  takeCompletionBatch(pageId: string): string[] | undefined {
    const callbacks = this.pendingCompletions.get(pageId)
    if (!callbacks || callbacks.length === 0) return undefined
    this.pendingCompletions.delete(pageId)
    this.completionCounter += 1
    const token = `${pageId}${TINY_ENGINE_NAMING.componentIdSeparator}ack-${this.completionCounter}`
    this.ackedBatches.set(token, { pageId, callbacks })
    return [token]
  }

  /** The render thread reflected one or more batches. */
  acknowledgeRenders(
    tokens: string[],
    runCompletion: (pageId: string, callback: () => void) => void,
  ): void {
    for (const token of tokens) {
      const batch = this.ackedBatches.get(token)
      if (!batch) continue
      this.ackedBatches.delete(token)
      for (const callback of batch.callbacks) {
        runCompletion(batch.pageId, callback)
      }
    }
  }

  /** Run completions that have no render batch to wait for. */
  flushCompletions(
    pageId: string,
    runCompletion: (pageId: string, callback: () => void) => void,
  ): void {
    const callbacks = this.pendingCompletions.get(pageId)
    if (!callbacks || callbacks.length === 0) return
    this.pendingCompletions.delete(pageId)
    for (const callback of callbacks) runCompletion(pageId, callback)
  }

  dropPage(pageId: string): void {
    this.pendingPages.delete(pageId)
    this.pendingPageDataPatches.delete(pageId)
    // The view is going away, so a completion it was waiting for can never be
    // "after render" any more. Drop it instead of running it against a
    // destroyed page.
    this.pendingCompletions.delete(pageId)
    for (const [token, batch] of this.ackedBatches) {
      if (batch.pageId === pageId) this.ackedBatches.delete(token)
    }
  }
}
