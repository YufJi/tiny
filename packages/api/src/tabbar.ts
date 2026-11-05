import type { MiniProgramApiHost, ServiceApiContext, TabBarApi } from '@tiny/runtime'
import { runApi } from './run-api'

/**
 * TabBar mutation APIs.
 *
 * The kernel owns the tabBar model and projects it to the host through
 * `RUNTIME_STATE`; this layer only maps `wx.*` onto that capability.
 */
export function createTabBarApi(context: ServiceApiContext): MiniProgramApiHost {
  const requireTabBar = (): TabBarApi => {
    if (!context.tabBar) throw new Error('tabBar is not configured')
    return context.tabBar
  }
  const readParams = (params: unknown) => (params ?? {}) as Record<string, unknown>
  return {
    setTabBarStyle: (params: unknown = {}) => runApi(params, 'setTabBarStyle', () => {
      requireTabBar().setStyle(readParams(params))
      return { errMsg: 'setTabBarStyle:ok' }
    }),
    setTabBarItem: (params: unknown = {}) => runApi(params, 'setTabBarItem', () => {
      requireTabBar().setItem(readParams(params))
      return { errMsg: 'setTabBarItem:ok' }
    }),
    setTabBarBadge: (params: unknown = {}) => runApi(params, 'setTabBarBadge', () => {
      requireTabBar().setBadge(readParams(params))
      return { errMsg: 'setTabBarBadge:ok' }
    }),
    removeTabBarBadge: (params: unknown = {}) => runApi(params, 'removeTabBarBadge', () => {
      requireTabBar().removeBadge(readParams(params))
      return { errMsg: 'removeTabBarBadge:ok' }
    }),
    showTabBarRedDot: (params: unknown = {}) => runApi(params, 'showTabBarRedDot', () => {
      requireTabBar().showRedDot(readParams(params))
      return { errMsg: 'showTabBarRedDot:ok' }
    }),
    hideTabBarRedDot: (params: unknown = {}) => runApi(params, 'hideTabBarRedDot', () => {
      requireTabBar().hideRedDot(readParams(params))
      return { errMsg: 'hideTabBarRedDot:ok' }
    }),
    showTabBar: (params: unknown = {}) => runApi(params, 'showTabBar', () => {
      requireTabBar().setVisible(true)
      return { errMsg: 'showTabBar:ok' }
    }),
    hideTabBar: (params: unknown = {}) => runApi(params, 'hideTabBar', () => {
      requireTabBar().setVisible(false)
      return { errMsg: 'hideTabBar:ok' }
    }),
  }
}
