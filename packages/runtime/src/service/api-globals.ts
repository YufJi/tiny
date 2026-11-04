import { registerBehavior } from '../component'
import { applyDefinitionFilters } from '../component'
import type { MiniProgramPageRegistry } from './page-registry'
import type {
  MiniProgramApiHost,
  MiniProgramAppOptions,
  MiniProgramComponentOptions,
  MiniProgramPageOptions,
} from './types'

/**
 * Install the mini-program global namespace.
 *
 * This is the kernel's stable half of the API contract: the registration
 * globals (`App`/`Page`/`Component`/`Behavior`), `getApp`/`getCurrentPages`,
 * and an API object that always resolves. The API set itself is supplied by a
 * host through `ServiceThreadOptions.apiHost`; a name the factory did not
 * provide resolves to the unsupported-API fallback instead of `undefined`, so
 * third-party bundles cannot crash on a missing global.
 */
export function installMiniProgramGlobals(
  registry: MiniProgramPageRegistry,
  apiHost: MiniProgramApiHost = {},
  onUnsupportedApi?: (name: string) => void,
  getCurrentPages?: () => unknown[],
): void {
  const globalObject = globalThis as unknown as Record<string, unknown>
  const globals = registry.compatibility.globals
  globalObject[globals.app] = (options: MiniProgramAppOptions) => registry.registerApp(options)
  globalObject[globals.page] = (options: MiniProgramPageOptions) => registry.registerPage(options)
  globalObject[globals.component] = (options: MiniProgramComponentOptions) => (
    registry.registerComponent(options)
  )
  globalObject[globals.behavior] = (options?: MiniProgramComponentOptions) => {
    const behavior = registerBehavior(options)
    // Match WeChat's declaration-time filtering: a behavior's own filter chain
    // runs when the behavior is declared, before any component uses it.
    applyDefinitionFilters(behavior)
    return behavior
  }
  globalObject[globals.getApp] = () => registry.getApp()
  globalObject[globals.getCurrentPages] = () => getCurrentPages?.() ?? []
  // Third-party bundles probe these while booting; report them as absent
  // instead of synthesizing unsupported-API handlers for them.
  const opaqueProperties = new Set(registry.compatibility.opaqueGlobals)
  const apiProxy = new Proxy(apiHost, {
    get(target, property) {
      if (typeof property !== 'string') return Reflect.get(target, property)
      if (property in target) return Reflect.get(target, property)
      if (opaqueProperties.has(property)) return undefined
      return (...args: unknown[]) => {
        onUnsupportedApi?.(property)
        return undefined
      }
    },
    set(target, property, value) {
      return Reflect.set(target, property, value)
    },
  })
  for (const name of [
    registry.compatibility.api.global,
    ...registry.compatibility.api.aliases,
  ]) {
    globalObject[name] = apiProxy
  }
  // Service threads run in their own event target in production hosts. Keep
  // the app-level rejection hook host-independent by installing it through the
  // global EventTarget when one exists (Node unit tests do not have one).
  const eventTarget = globalObject as unknown as {
    addEventListener?: (type: string, listener: (event: unknown) => void) => void
  }
  if (typeof eventTarget.addEventListener === 'function') {
    eventTarget.addEventListener('unhandledrejection', (event) => {
      const detail = event as { reason?: unknown; promise?: unknown }
      registry.reportUnhandledRejection(detail?.reason, detail?.promise)
    })
  }
}
