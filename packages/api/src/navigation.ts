import type { MiniProgramApiHost, ServiceApiContext } from '@tiny/runtime'
import { callHost, runApi } from './run-api'

/**
 * Routing and navigation-bar APIs.
 *
 * `navigateTo` / `navigateBack` return the host result directly; the rest go
 * through `runApi` so app callbacks keep the WeChat convention.
 */
export function createNavigationApi(context: ServiceApiContext): MiniProgramApiHost {
  return {
    navigateTo: (params: unknown = {}) => callHost(
      context,
      'navigate.to',
      params as Record<string, unknown>,
    ),
    navigateBack: (params: unknown = {}) => callHost(
      context,
      'navigate.back',
      params as Record<string, unknown>,
    ),
    redirectTo: (params: unknown = {}) => runApi(params, 'redirectTo', () => callHost(
      context,
      'navigate.redirectTo',
      params as Record<string, unknown>,
    )),
    reLaunch: (params: unknown = {}) => runApi(params, 'reLaunch', () => callHost(
      context,
      'navigate.reLaunch',
      params as Record<string, unknown>,
    )),
    switchTab: (params: unknown = {}) => runApi(params, 'switchTab', () => callHost(
      context,
      'navigate.switchTab',
      params as Record<string, unknown>,
    )),
    startPullDownRefresh: (params: unknown = {}) => runApi(
      params,
      'startPullDownRefresh',
      () => callHost(context, 'page.pullDownRefresh', params as Record<string, unknown>),
    ),
    stopPullDownRefresh: (params: unknown = {}) => runApi(
      params,
      'stopPullDownRefresh',
      () => callHost(context, 'page.stopPullDownRefresh', params as Record<string, unknown>),
    ),
    setNavigationBarTitle: (params: unknown = {}) => runApi(
      params,
      'setNavigationBarTitle',
      () => callHost(context, 'navigation.title', params as Record<string, unknown>),
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
