import { registerBehavior } from '../../component/behaviors'
import { registerTraitBehavior } from '../../component/traits'
import { applyDefinitionFilters } from '../../component/definition/filters'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import type { MiniProgramPageRegistry } from '../page/registry'
import type { MiniProgramApiHost } from './types'
import type { MiniProgramAppOptions } from '../app/types'
import type {
  MiniProgramComponentOptions,
  MiniProgramPageOptions,
} from '../page/types'

/**
 * Install the mini-program global namespace.
 *
 * This is the kernel's stable half of the API contract: the registration
 * globals (`App`/`Page`/`Component`/`Behavior`), `getApp`/`getCurrentPages`,
 * and an API object that always resolves. The API set itself is supplied by a
 * host through `ServiceThreadOptions.apiHost`; a name the factory did not
 * provide resolves to the unsupported-API fallback instead of `undefined`, so
 * third-party bundles cannot crash on a missing global.
 *
 * Returns the installed API table. `this.router` calls it so router methods and
 * direct `wx.*` calls share callbacks, diagnostics and the fallback.
 */
export function installMiniProgramGlobals(
  registry: MiniProgramPageRegistry,
  apiHost: MiniProgramApiHost = {},
  onUnsupportedApi?: (name: string) => void,
  getCurrentPages?: () => unknown[],
): MiniProgramApiHost {
  const globalObject = globalThis as unknown as Record<string, unknown>
  const globals = registry.compatibility.globals
  const consumeEntryHint = (): string | undefined => {
    const name = TINY_ENGINE_NAMING.entryPathHint
    const value = globalObject[name]
    delete globalObject[name]
    return typeof value === 'string' && value.length > 0 ? value : undefined
  }
  globalObject[globals.app] = (options: MiniProgramAppOptions) => registry.registerApp(options)
  globalObject[globals.page] = (options: MiniProgramPageOptions) => registry.registerPage(
    options,
    consumeEntryHint(),
  )
  globalObject[globals.component] = (options: MiniProgramComponentOptions) => (
    registry.registerComponent(
      options,
      consumeEntryHint(),
    )
  )
  const behavior = (options?: MiniProgramComponentOptions) => {
    const behavior = registerBehavior(options)
    // Match WeChat's declaration-time filtering: a behavior's own filter chain
    // runs when the behavior is declared, before any component uses it.
    applyDefinitionFilters(behavior, undefined, registry.compatibility)
    return behavior
  }
  behavior.trait = registerTraitBehavior
  globalObject[globals.behavior] = behavior
  globalObject[globals.getApp] = () => registry.getApp()
  globalObject[globals.getCurrentPages] = () => getCurrentPages?.() ?? []
  // Third-party bundles probe these while booting; report them as absent
  // instead of synthesizing unsupported-API handlers for them.
  const opaqueProperties = new Set(registry.compatibility.opaqueGlobals)
  // Properties runtimes/bundlers probe for introspection. They are not APIs;
  // keep the probe silent instead of turning it into an UNSUPPORTED_API.
  const silentProperties = new Set([
    'then',
    'catch',
    'finally',
    'toJSON',
    'inspect',
    '__esModule',
  ])
  const reportedUnsupported = new Set<string>()
  const hasOwn = (target: object, property: PropertyKey): boolean => (
    Object.prototype.hasOwnProperty.call(target, property)
  )
  // The table is a normal object, so `wx.hasOwnProperty(...)` / `toString()`
  // keep working even though only API names are own properties.
  const hasInheritedObjectMethod = (property: PropertyKey): boolean => (
    typeof property === 'string' && property in Object.prototype
  )
  // WeChat exposes only APIs it implements: an unknown name reads as
  // `undefined`, so `typeof wx.foo === 'function'` and `'foo' in wx` are both
  // honest. Diagnostics still report the first access so the debugger can show
  // what the app asked for.
  const apiProxy = new Proxy(apiHost, {
    get(target, property) {
      if (typeof property !== 'string') return Reflect.get(target, property)
      if (silentProperties.has(property)) return undefined
      // Bundler globals (`webpackJsonp`, `cloud`, `env`, ...) are real
      // properties once a bundle assigns them; only unknown reads are opaque.
      if (hasOwn(target, property)) return Reflect.get(target, property)
      if (opaqueProperties.has(property)) return undefined
      if (hasInheritedObjectMethod(property)) return Reflect.get(target, property)
      if (!reportedUnsupported.has(property)) {
        reportedUnsupported.add(property)
        onUnsupportedApi?.(property)
      }
      return undefined
    },
    has(target, property) {
      return hasOwn(target, property) || hasInheritedObjectMethod(property)
    },
    getOwnPropertyDescriptor(target, property) {
      if (!hasOwn(target, property)) return undefined
      return Reflect.getOwnPropertyDescriptor(target, property)
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
  // The installed table is also the API surface `this.router` invokes, so a
  // router call goes through exactly the same callbacks and diagnostics as a
  // direct `wx.*` call.
  return apiProxy
}
