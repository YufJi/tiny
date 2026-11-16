import type { BuiltinHostEventSource } from '@tiny/runtime'
import { BROWSER_RUNTIME_NAMES } from '../naming'

type HostEventListener = (payload: unknown) => void

export type RenderHostEventBus = {
  source: BuiltinHostEventSource
  emit: (name: string, payload?: unknown) => void
}

/**
 * Render-thread event fan-out for host capabilities that are not DOM events.
 * The host decides which page receives an event; this bus only scopes delivery
 * to the page document that owns the render tree.
 */
export function createRenderHostEventBus(): RenderHostEventBus {
  const listeners = new Map<string, Set<HostEventListener>>()
  return {
    source: {
      subscribe(name, listener) {
        let scoped = listeners.get(name)
        if (!scoped) {
          scoped = new Set()
          listeners.set(name, scoped)
        }
        scoped.add(listener)
        return () => {
          scoped.delete(listener)
          if (scoped.size === 0) listeners.delete(name)
        }
      },
    },
    emit(name, payload) {
      for (const listener of listeners.get(name) ?? []) {
        try {
          listener(payload)
        } catch {
          // A built-in listener must not break delivery to other components.
        }
      }
    },
  }
}

export function listenForRenderHostEvents(
  emit: RenderHostEventBus['emit'],
): () => void {
  if (typeof window === 'undefined') return () => {}
  const listener = (event: MessageEvent) => {
    const data = event.data as {
      type?: string
      name?: string
      payload?: unknown
    } | undefined
    if (data?.type !== BROWSER_RUNTIME_NAMES.hostEvent || typeof data.name !== 'string') return
    if (window.parent !== window && event.source !== window.parent) return
    emit(data.name, data.payload)
  }
  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
}
