import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import type { MiniProgramApiHost, ServiceApiContext } from '@tiny/runtime'
import { createSelectorQuery } from './selector-query'

/** Selector and intersection queries over the render tree. */
export function createQueryApi(context: ServiceApiContext): MiniProgramApiHost {
  return {
    createSelectorQuery: () => {
      context.connection.sendDiagnostic('log', {
        code: DIAGNOSTIC_CODES.CANVAS_OFFSCREEN,
        message: 'Canvas drawing is delegated to the host canvas adapter.',
      }, context.pageId)
      return createSelectorQuery(context)
    },
    createIntersectionObserver: (componentOrOptions?: unknown, optionsArg?: unknown) => {
      // `wx.createIntersectionObserver([component], [options])`: an instance
      // scopes the query to that component, otherwise the active page owns it.
      const component = isObserverTarget(componentOrOptions) ? componentOrOptions : undefined
      const options = component
        ? readObserverOptions(optionsArg)
        : readObserverOptions(componentOrOptions) ?? readObserverOptions(optionsArg)
      const observer = createObserverOn(component, options)
        ?? createObserverOn(context.getActivePage?.(), options)
      if (observer) return observer
      context.connection.sendDiagnostic('warn', {
        code: DIAGNOSTIC_CODES.UNSUPPORTED_API,
        message: `${context.apiName}.createIntersectionObserver has no mounted page or component to observe.`,
      }, context.pageId)
      return createInertIntersectionObserver()
    },
  }
}

function readObserverOptions(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !isObserverTarget(value)
    ? value as Record<string, unknown>
    : undefined
}

/** Page instances, component instances and glass-easel elements all qualify. */
function isObserverTarget(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const candidate = value as {
    createIntersectionObserver?: unknown
    isComponent?: unknown
    componentId?: unknown
    pageId?: unknown
  }
  return typeof candidate.createIntersectionObserver === 'function'
    || typeof candidate.isComponent === 'function'
    || typeof candidate.componentId === 'string'
    || typeof candidate.pageId === 'string'
}

function createObserverOn(
  target: unknown,
  options: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  const factory = (target as { createIntersectionObserver?: unknown } | undefined)
    ?.createIntersectionObserver
  if (typeof factory !== 'function') return undefined
  const observer = factory.call(target, options) as Record<string, unknown> | null | undefined
  return observer ?? undefined
}

/**
 * Without a mounted page there is nothing to observe; keep the handle chainable
 * so a stray observer cannot crash the rest of the page setup.
 */
function createInertIntersectionObserver(): Record<string, unknown> {
  const handle: Record<string, unknown> = {}
  for (const name of ['relativeTo', 'relativeToViewport', 'observe', 'unobserve']) {
    handle[name] = () => handle
  }
  handle.disconnect = () => undefined
  return handle
}
