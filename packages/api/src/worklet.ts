import type { ApiHost } from './context'

/**
 * Worklet namespace stub.
 *
 * WeChat exposes `wx.worklet` to the service side (shared values, timing/easing
 * descriptors, runOnJS/runOnUI). Tiny has no UI-thread worklet runtime yet, so
 * the namespace exists with the call shapes third-party bundles destructure;
 * `canIUse('worklet')` stays false. `applyAnimatedStyle` is installed as a
 * no-op on components for the same reason.
 */
export function createWorkletApi(): ApiHost {
  const identity = (value: unknown): unknown => value
  const easing = (t: number): number => t
  const Easing: Record<string, unknown> = {
    ease: easing,
    linear: easing,
    step: easing,
    in: () => easing,
    out: () => easing,
    inOut: () => easing,
    bezier: () => easing,
  }
  const worklet = {
      shared: (value: unknown = 0) => ({ value }),
      derived: (fn?: () => unknown) => ({
        get value() { return fn?.() },
      }),
      timing: identity,
      spring: identity,
      decay: identity,
      Easing,
      runOnJS: (fn?: (...args: unknown[]) => unknown) => (...args: unknown[]) => fn?.(...args),
    runOnUI: (fn?: (...args: unknown[]) => unknown) => (...args: unknown[]) => fn?.(...args),
  }
  // `ApiHost` models callable entries; `worklet` is a namespace object like
  // WeChat's. The table is JSON-shaped and the runtime proxy forwards it.
  return { worklet } as unknown as ApiHost
}
