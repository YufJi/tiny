import type { ApiContext } from './context'

/**
 * `wx.createMapContext` (ADR-0023).
 *
 * The map lives in the render tree, so every method is a component command:
 * the service names the component and the render frame executes a whitelisted
 * method. The domain strings mirror `COMPONENT_CONTROL` in the runtime's
 * tree-protocol; `@tiny/api` must not import `@tiny/runtime`.
 */
export const COMPONENT_COMMAND = Object.freeze({ domain: 'component', invoke: 'invoke' } as const)

type CommandResult =
  | { status: 'ok'; value?: unknown }
  | { status: 'not-found' }
  | { status: 'unsupported-method'; method: string }
  | { status: 'invalid-args'; detail: string }
  | { status: 'error'; message: string }

type Callbacks = {
  success?: (result: Record<string, unknown>) => void
  fail?: (error: { errMsg: string }) => void
  complete?: (result: unknown) => void
}

export type MapContext = {
  getCenterLocation(options?: Callbacks): Promise<Record<string, unknown> | undefined>
  moveToLocation(
    options?: Callbacks & { latitude?: number; longitude?: number },
  ): Promise<Record<string, unknown> | undefined>
  getScale(options?: Callbacks): Promise<Record<string, unknown> | undefined>
}

function invoke(
  context: ApiContext,
  mapId: string,
  method: string,
  args: Record<string, unknown> | undefined,
): Promise<CommandResult> {
  return context.connection.call(
    COMPONENT_COMMAND.domain,
    COMPONENT_COMMAND.invoke,
    { selector: `#${mapId}`, method, ...(args ? { args } : {}) },
    context.pageId ? { pageId: context.pageId } : {},
  ) as Promise<CommandResult>
}

function reasonOf(result: CommandResult): string {
  switch (result.status) {
    case 'error': return result.message
    case 'invalid-args': return result.detail
    case 'unsupported-method': return `unsupported method ${result.method}`
    case 'not-found': return 'component not found'
    default: return 'unknown error'
  }
}

function run(
  context: ApiContext,
  mapId: string,
  method: string,
  args: Record<string, unknown> | undefined,
  options: Callbacks = {},
): Promise<Record<string, unknown> | undefined> {
  return invoke(context, mapId, method, args).then((result) => {
    if (result.status === 'ok') {
      const value = (result.value ?? {}) as Record<string, unknown>
      options.success?.(value)
      options.complete?.(value)
      return value
    }
    const error = { errMsg: `mapContext.${method}:fail ${reasonOf(result)}` }
    options.fail?.(error)
    options.complete?.(error)
    // Callback callers handle the failure themselves; promise-only callers get
    // a rejection, which is what WeChat's promise form does.
    if (typeof options.success !== 'function' && typeof options.fail !== 'function') {
      throw error
    }
    return undefined
  })
}

export function createMapContext(context: ApiContext, mapId: string): MapContext {
  return {
    getCenterLocation: (options = {}) => run(context, mapId, 'getCenterLocation', undefined, options),
    getScale: (options = {}) => run(context, mapId, 'getScale', undefined, options),
    moveToLocation: (options = {}) => {
      const { latitude, longitude, ...callbacks } = options
      return run(context, mapId, 'moveToLocation', { latitude, longitude }, callbacks)
    },
  }
}
