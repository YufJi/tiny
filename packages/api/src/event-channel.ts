/**
 * `EventChannel`: the page-to-page event bus behind `wx.navigateTo({ events })`
 * and `this.getOpenerEventChannel()`.
 *
 * One navigation creates two emitters wired crosswise:
 *
 * - the opener side (handed to `success({ eventChannel })`) emits to the opened
 *   page's listeners and listens to what the page emits;
 * - the page side (handed to the page instance) does the mirror image.
 *
 * Emission is buffered per event name until a listener exists, so the opener can
 * emit from its `success` callback before the new page reaches `onLoad`/`ready`.
 * This mirrors WeChat's implementation and is what makes the documented
 * "emit from success, on in onLoad" flow order-independent.
 */
export type EventChannelHandler = (...args: unknown[]) => void

export type EventChannel = {
  /** Fire an event on the other side of the channel. */
  emit(eventName: string, ...args: unknown[]): void
  /** Listen to an event coming from the other side. */
  on(eventName: string, fn: EventChannelHandler): void
  /** Listen once; the listener is removed after its first call. */
  once(eventName: string, fn: EventChannelHandler): void
  /** Remove one listener, or every listener for the event when `fn` is omitted. */
  off(eventName: string, fn?: EventChannelHandler): void
}

export type EventChannelPair = {
  /** Given to the opener through `success({ eventChannel })`. */
  opener: EventChannel
  /** Bound to the opened page (`this.getOpenerEventChannel()`). */
  page: EventChannel
}

type Listener = {
  fn: EventChannelHandler
  once: boolean
}

class EventChannelEmitter {
  private readonly listeners = new Map<string, Listener[]>()
  private readonly emitCache = new Map<string, unknown[][]>()

  emit(eventName: string, ...args: unknown[]): void {
    const listeners = this.listeners.get(eventName)
    if (!listeners || listeners.length === 0) {
      const cached = this.emitCache.get(eventName)
      if (cached) cached.push(args)
      else this.emitCache.set(eventName, [args])
      return
    }
    for (const listener of [...listeners]) listener.fn(...args)
    const remaining = listeners.filter((listener) => !listener.once)
    if (remaining.length > 0) this.listeners.set(eventName, remaining)
    else this.listeners.delete(eventName)
  }

  on(eventName: string, fn: EventChannelHandler): void {
    this.add(eventName, fn, false)
  }

  once(eventName: string, fn: EventChannelHandler): void {
    this.add(eventName, fn, true)
  }

  off(eventName: string, fn?: EventChannelHandler): void {
    const listeners = this.listeners.get(eventName)
    if (!listeners) return
    if (!fn) {
      this.listeners.delete(eventName)
      return
    }
    const remaining = listeners.filter((listener) => listener.fn !== fn)
    if (remaining.length > 0) this.listeners.set(eventName, remaining)
    else this.listeners.delete(eventName)
  }

  private add(eventName: string, fn: EventChannelHandler, once: boolean): void {
    if (typeof fn !== 'function') return
    const listeners = this.listeners.get(eventName)
    if (listeners) listeners.push({ fn, once })
    else this.listeners.set(eventName, [{ fn, once }])
    this.flush(eventName)
  }

  /** Deliver emissions that arrived before any listener existed. */
  private flush(eventName: string): void {
    const cached = this.emitCache.get(eventName)
    if (!cached) return
    this.emitCache.delete(eventName)
    for (const args of cached) this.emit(eventName, ...args)
  }
}

/**
 * Build both sides of one navigation's `EventChannel`.
 *
 * `events` are the handlers passed to `wx.navigateTo`; they listen on the opener
 * side, so they receive what the opened page emits.
 */
export function createEventChannelPair(
  events?: Record<string, EventChannelHandler>,
): EventChannelPair {
  const openerEmitter = new EventChannelEmitter()
  const pageEmitter = new EventChannelEmitter()
  const opener: EventChannel = {
    emit: (eventName, ...args) => pageEmitter.emit(eventName, ...args),
    on: (eventName, fn) => openerEmitter.on(eventName, fn),
    once: (eventName, fn) => openerEmitter.once(eventName, fn),
    off: (eventName, fn) => openerEmitter.off(eventName, fn),
  }
  const page: EventChannel = {
    emit: (eventName, ...args) => openerEmitter.emit(eventName, ...args),
    on: (eventName, fn) => pageEmitter.on(eventName, fn),
    once: (eventName, fn) => pageEmitter.once(eventName, fn),
    off: (eventName, fn) => pageEmitter.off(eventName, fn),
  }
  for (const [eventName, handler] of Object.entries(events ?? {})) {
    if (typeof handler === 'function') openerEmitter.on(eventName, handler)
  }
  return { opener, page }
}
