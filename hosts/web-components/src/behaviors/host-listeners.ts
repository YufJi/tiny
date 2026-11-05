import type { HostEvent, HostListenable, HoverRuntime } from './types'

/**
 * Attach glass-easel event listeners to the component host node.
 *
 * This mirrors WeChat's `listeners: { "this.tap": ... }`: the real host is the
 * element users style and tap, so built-in behaviors must observe events there.
 * Listeners are installed in `created` and removed in `detached`.
 */
export function bindHostListeners(
  instance: unknown,
  bindings: Record<string, (event: HostEvent) => void>,
): void {
  const target = instance as HostListenable & HoverRuntime
  if (typeof target.addListener !== 'function') return
  target._hostListeners ??= []
  for (const [name, handler] of Object.entries(bindings)) {
    const listener = (event: HostEvent) => handler(event)
    target.addListener(name, listener)
    target._hostListeners.push({ name, listener })
  }
}

/** Remove all host listeners previously installed by `bindHostListeners`. */
export function unbindHostListeners(instance: unknown): void {
  const target = instance as HostListenable & HoverRuntime
  const listeners = target._hostListeners
  if (!listeners || listeners.length === 0) return
  if (typeof target.removeListener === 'function') {
    for (const { name, listener } of listeners) target.removeListener(name, listener)
  }
  target._hostListeners = []
}
