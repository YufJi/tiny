import type { ApiContext, ApiHost } from './context'

/** One `wx.onXXX` listener. */
export type GlobalEventListener = (payload: unknown) => void

/**
 * Service-thread event bus behind the global `wx.onXXX` APIs.
 *
 * The host and the runtime both feed it: host-originated events arrive through
 * the `event.global` bridge event, while runtime-originated events (errors,
 * theme changes, resize) are emitted by the runtime. The bus owns fan-out,
 * `off` semantics and listener isolation; it knows nothing about pages.
 */
export type GlobalEventHub = {
  on(event: string, listener: GlobalEventListener): () => void
  off(event: string, listener?: GlobalEventListener): void
  emit(event: string, payload?: unknown): void
}

export type GlobalEventHubOptions = {
  /** Called when a listener throws; emit must keep delivering to the rest. */
  onListenerError?: (event: string, error: unknown) => void
}

export function createGlobalEventHub(options: GlobalEventHubOptions = {}): GlobalEventHub {
  const listeners = new Map<string, Set<GlobalEventListener>>()

  const remove = (event: string, listener: GlobalEventListener): void => {
    const set = listeners.get(event)
    if (!set) return
    set.delete(listener)
    if (set.size === 0) listeners.delete(event)
  }

  return {
    on(event, listener) {
      if (typeof listener !== 'function') return () => undefined
      let set = listeners.get(event)
      if (!set) {
        set = new Set()
        listeners.set(event, set)
      }
      set.add(listener)
      return () => remove(event, listener)
    },
    off(event, listener) {
      if (typeof listener === 'function') {
        remove(event, listener)
        return
      }
      listeners.delete(event)
    },
    emit(event, payload) {
      const set = listeners.get(event)
      if (!set || set.size === 0) return
      // Snapshot so a listener can add/remove listeners during dispatch.
      for (const listener of [...set]) {
        try {
          listener(payload)
        } catch (error) {
          try {
            options.onListenerError?.(event, error)
          } catch {
            // Diagnostics must not break the event path either.
          }
        }
      }
    },
  }
}

const GLOBAL_EVENT_NAMES = {
  onAppShow: 'appShow',
  offAppShow: 'appShow',
  onAppHide: 'appHide',
  offAppHide: 'appHide',
  onThemeChange: 'themeChange',
  offThemeChange: 'themeChange',
  onKeyboardHeightChange: 'keyboardHeightChange',
  offKeyboardHeightChange: 'keyboardHeightChange',
  onWindowResize: 'windowResize',
  offWindowResize: 'windowResize',
  onNetworkStatusChange: 'networkStatusChange',
  offNetworkStatusChange: 'networkStatusChange',
  onMemoryWarning: 'memoryWarning',
  offMemoryWarning: 'memoryWarning',
  onUserCaptureScreen: 'userCaptureScreen',
  offUserCaptureScreen: 'userCaptureScreen',
  onError: 'error',
  offError: 'error',
  onPageNotFound: 'pageNotFound',
  offPageNotFound: 'pageNotFound',
  onUnhandledRejection: 'unhandledRejection',
  offUnhandledRejection: 'unhandledRejection',
} as const

/**
 * Build the global `wx.onXXX` / `wx.offXXX` table.
 *
 * Registration is always available, even when the current host never emits
 * that event; unsupported platform events simply stay silent. `offXXX()` with
 * no callback removes every listener for that event.
 */
export function createGlobalEventApi(context: ApiContext): ApiHost {
  const hub = context.events
  const register = (event: string) => (callback: unknown): void => {
    if (typeof callback === 'function') {
      hub?.on(event, callback as GlobalEventListener)
    }
  }
  const unregister = (event: string) => (callback?: unknown): void => {
    if (typeof callback === 'function') {
      hub?.off(event, callback as GlobalEventListener)
    } else {
      hub?.off(event)
    }
  }

  const api: Record<string, (callback?: unknown) => void> = {}
  for (const [name, event] of Object.entries(GLOBAL_EVENT_NAMES)) {
    api[name] = name.startsWith('on') ? register(event) : unregister(event)
  }
  return api
}
