import type { MiniProgramApiHost, ServiceApiContext } from '@tiny/runtime'
import {
  createEventChannelPair,
  type EventChannelHandler,
} from './event-channel'
import { callHost, readCallbacks, runApi } from './run-api'

type NavigationParams = Record<string, unknown>

/**
 * Routing and navigation-bar APIs.
 *
 * The five navigation APIs follow WeChat's async convention:
 *
 * - they call `success` / `fail` / `complete` when any of those is supplied,
 *   and then return `undefined`;
 * - without callbacks they return a promise that resolves with the success
 *   object and rejects on failure;
 * - `navigateTo` additionally creates the `EventChannel` pair. The opener side
 *   travels back in `success({ eventChannel })`; the page side is attached to
 *   the page that the navigation creates, so `this.getOpenerEventChannel()` is
 *   already usable from its `onLoad`.
 *
 * The success object (including `errMsg`) is produced by the page stack and
 * passes through untouched; the API layer only adds the opener `EventChannel`
 * it created and formats `fail` objects from the bridge error.
 *
 * Callbacks and `events` handlers are functions and therefore never cross the
 * bridge: they are stripped from the host payload and run in the service realm.
 */
export function createNavigationApi(context: ServiceApiContext): MiniProgramApiHost {
  return {
    navigateTo: (params: unknown = {}) => navigateTo(context, params),
    navigateBack: (params: unknown = {}) => navigate(
      context,
      params,
      'navigateBack',
      'navigate.back',
    ),
    redirectTo: (params: unknown = {}) => navigate(
      context,
      params,
      'redirectTo',
      'navigate.redirectTo',
    ),
    reLaunch: (params: unknown = {}) => navigate(
      context,
      params,
      'reLaunch',
      'navigate.reLaunch',
    ),
    switchTab: (params: unknown = {}) => navigate(
      context,
      params,
      'switchTab',
      'navigate.switchTab',
    ),
    startPullDownRefresh: (params: unknown = {}) => runApi(
      params,
      'startPullDownRefresh',
      () => callHost(context, 'page.pullDownRefresh', navigationPayload(params)),
    ),
    stopPullDownRefresh: (params: unknown = {}) => runApi(
      params,
      'stopPullDownRefresh',
      () => callHost(context, 'page.stopPullDownRefresh', navigationPayload(params)),
    ),
    setNavigationBarTitle: (params: unknown = {}) => runApi(
      params,
      'setNavigationBarTitle',
      () => callHost(context, 'navigation.title', navigationPayload(params)),
    ),
    // No host protocol yet: these keep the callback contract and are otherwise
    // no-ops until a host implements the navigation-bar surface.
    setNavigationBarColor: (params: unknown = {}) => runApi(
      params,
      'setNavigationBarColor',
      () => ({ errMsg: 'setNavigationBarColor:ok' }),
    ),
    showNavigationBarLoading: (params: unknown = {}) => runApi(
      params,
      'showNavigationBarLoading',
      () => ({ errMsg: 'showNavigationBarLoading:ok' }),
    ),
    hideNavigationBarLoading: (params: unknown = {}) => runApi(
      params,
      'hideNavigationBarLoading',
      () => ({ errMsg: 'hideNavigationBarLoading:ok' }),
    ),
    pageScrollTo: (params: unknown = {}) => runApi(
      params,
      'pageScrollTo',
      () => ({ errMsg: 'pageScrollTo:ok' }),
    ),
  }
}

function navigateTo(
  context: ServiceApiContext,
  params: unknown,
): Promise<Record<string, unknown>> | undefined {
  const input = toParams(params)
  const channel = createEventChannelPair(readEvents(input.events))
  // Bind the page side before the host call: the service page stack creates
  // the page (and runs `onLoad`) while that call is in flight.
  const release = context.setNextPageEventChannel?.(channel.page)
  return navigate(
    context,
    input,
    'navigateTo',
    'navigate.to',
    (result) => ({ ...result, eventChannel: channel.opener }),
    release,
  )
}

function navigate(
  context: ServiceApiContext,
  params: unknown,
  apiName: string,
  hostMethod: string,
  decorate?: (result: NavigationParams) => NavigationParams,
  cleanup?: () => void,
): Promise<Record<string, unknown>> | undefined {
  const callbacks = readCallbacks(params)
  const hasCallbacks = typeof callbacks.success === 'function'
    || typeof callbacks.fail === 'function'
    || typeof callbacks.complete === 'function'
  const promise = Promise.resolve()
    .then(() => callHost(context, hostMethod, navigationPayload(params)))
    .then((result) => {
      const base = asResult(result)
      const value = decorate ? decorate(base) : base
      callbacks.success?.(value)
      callbacks.complete?.(value)
      return value
    }, (error) => {
      const failed = { errMsg: `${apiName}:fail ${errorMessage(error)}` }
      callbacks.fail?.(failed)
      callbacks.complete?.(failed)
      throw error
    })
    .finally(() => cleanup?.())
  if (!hasCallbacks) return promise
  // WeChat returns `undefined` for the callback form; the promise is only kept
  // to deliver `fail`/`complete`, so its rejection must not surface as an
  // unhandled rejection the app never asked for.
  void promise.catch(() => undefined)
  return undefined
}

/** Copy params for the bridge: functions (callbacks, `events`) cannot cross it. */
function navigationPayload(params: unknown): NavigationParams {
  const input = toParams(params)
  const payload: NavigationParams = {}
  for (const [key, value] of Object.entries(input)) {
    if (key === 'events' || key === 'success' || key === 'fail' || key === 'complete') continue
    if (value === undefined || typeof value === 'function') continue
    payload[key] = value
  }
  return payload
}

function readEvents(value: unknown): Record<string, EventChannelHandler> | undefined {
  if (!value || typeof value !== 'object') return undefined
  return value as Record<string, EventChannelHandler>
}

function toParams(params: unknown): NavigationParams {
  return params && typeof params === 'object' ? { ...(params as NavigationParams) } : {}
}

function asResult(value: unknown): NavigationParams {
  return value && typeof value === 'object' ? { ...(value as NavigationParams) } : {}
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
