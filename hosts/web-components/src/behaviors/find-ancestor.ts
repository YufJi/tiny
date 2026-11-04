/**
 * Find the nearest ancestor component that declares a behavior (e.g. the
 * `tiny-group` of a checkbox/radio). Walks the light-DOM parent chain so slot
 * content wrapped in a `<label>` still finds its group.
 */
export function findAncestorWithBehavior(instance: unknown, behavior: string): unknown | null {
  let node = (instance as { parentNode?: unknown }).parentNode
  for (let depth = 0; node && depth < 100; depth += 1) {
    const component = node as { hasBehavior?: (name: string) => boolean; parentNode?: unknown }
    if (typeof component.hasBehavior === 'function' && component.hasBehavior(behavior)) {
      return component
    }
    node = component.parentNode
  }
  return null
}
