import type { BridgeConnection } from '@tiny/bridge'
import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import { cloneJsonSafe } from '../data'
import { registerBehavior } from '../behaviors'
import { applyDefinitionFilters } from '../component-definition'
import type { StorageSnapshot, SystemInfoSnapshot } from '../types'
import type { MiniProgramPageRegistry } from './page-registry'
import type {
  MiniProgramApiHost,
  MiniProgramAppOptions,
  MiniProgramComponentOptions,
  MiniProgramPageOptions,
  ServiceApiContext,
} from './types'
import { createAnimationStub } from './animation'
import { createSelectorQuery } from './selector-query'

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

type ApiCallbacks = {
  success?: (value: unknown) => void
  fail?: (value: unknown) => void
  complete?: (value: unknown) => void
}

function readCallbacks(params: unknown): ApiCallbacks {
  return (params ?? {}) as ApiCallbacks
}

function runApi(
  params: unknown,
  apiName: string,
  task: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const callbacks = readCallbacks(params)
  return Promise.resolve()
    .then(task)
    .then((result) => {
      callbacks.success?.(result)
      callbacks.complete?.(result)
      return result
    })
    .catch((error) => {
      const result = {
        errMsg: `${apiName}:fail ${error instanceof Error ? error.message : String(error)}`,
      }
      callbacks.fail?.(result)
      callbacks.complete?.(result)
      return result
    })
}

function storageInfo(snapshot: StorageSnapshot): Record<string, unknown> {
  const keys = Object.keys(snapshot)
  return {
    keys,
    currentSize: JSON.stringify(snapshot).length,
    limitSize: 10240,
    errMsg: 'getStorageInfoSync:ok',
  }
}

export function createServiceApiHost(context: ServiceApiContext): MiniProgramApiHost {
  const themeListeners = context.themeListeners ?? new Set<(value: unknown) => void>()
  const keyboardListeners = new Set<(value: unknown) => void>()
  const unsupported = (name: string) => {
    context.connection.sendDiagnostic('warn', {
      code: DIAGNOSTIC_CODES.UNSUPPORTED_API,
      message: `${context.apiName}.${name} is not supported in the P0 runtime.`,
    }, context.pageId)
  }
  const requireTabBar = () => {
    if (!context.tabBar) throw new Error('tabBar is not configured')
    return context.tabBar
  }
  return {
    getSystemInfoSync: () => cloneJsonSafe(context.getSystemInfoSnapshot()),
    getSystemInfo: (params?: unknown) => {
      const info = cloneJsonSafe(context.getSystemInfoSnapshot())
      const callbacks = (params ?? {}) as {
        success?: (value: unknown) => void
        complete?: (value: unknown) => void
      }
      callbacks.success?.(info)
      callbacks.complete?.(info)
      return info
    },
    getStorageSync: (key: unknown) => cloneJsonSafe(context.getStorageSnapshot()[String(key)]),
    setStorageSync: (key: unknown, value: unknown) => {
      const normalizedKey = String(key)
      const normalizedValue = cloneJsonSafe(value)
      context.setStorageSnapshot(normalizedKey, normalizedValue)
      void context.connection
        .call('api', 'storage.set', { key: normalizedKey, value: normalizedValue }, { pageId: context.pageId })
        .catch((error) => {
          context.connection.sendDiagnostic('error', {
            code: DIAGNOSTIC_CODES.API_STORAGE_WRITE_FAILED,
            message: error instanceof Error ? error.message : String(error),
            key: normalizedKey,
          }, context.pageId)
        })
      return undefined
    },
    navigateTo: (params: unknown = {}) => context.connection.call(
      'api',
      'navigate.to',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    ),
    navigateBack: (params: unknown = {}) => context.connection.call(
      'api',
      'navigate.back',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    ),
    redirectTo: (params: unknown = {}) => runApi(params, 'redirectTo', () => context.connection.call(
      'api',
      'navigate.redirectTo',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    )),
    reLaunch: (params: unknown = {}) => runApi(params, 'reLaunch', () => context.connection.call(
      'api',
      'navigate.reLaunch',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    )),
    startPullDownRefresh: (params: unknown = {}) => runApi(params, 'startPullDownRefresh', () => context.connection.call(
      'api',
      'page.pullDownRefresh',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    )),
    stopPullDownRefresh: (params: unknown = {}) => runApi(params, 'stopPullDownRefresh', () => context.connection.call(
      'api',
      'page.stopPullDownRefresh',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    )),
    switchTab: (params: unknown = {}) => runApi(params, 'switchTab', () => context.connection.call(
      'api',
      'navigate.switchTab',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    )),
    showToast: (params: unknown = {}) => runApi(params, 'showToast', () => context.connection.call(
      'api',
      'toast.show',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    )),
    showModal: (params: unknown = {}) => {
      return runApi(params, 'showModal', () => context.connection.call(
        'api',
        'ui.modal',
        params as Record<string, unknown>,
        { pageId: context.pageId },
      ))
    },
    showLoading: (params: unknown = {}) => {
      return runApi(params, 'showLoading', () => context.connection.call(
        'api',
        'ui.loading',
        params as Record<string, unknown>,
        { pageId: context.pageId },
      ))
    },
    hideLoading: (params: unknown = {}) => {
      return runApi(params, 'hideLoading', () => context.connection.call(
        'api',
        'ui.hideLoading',
        {},
        { pageId: context.pageId },
      ))
    },
    showActionSheet: (params: unknown = {}) => {
      return runApi(params, 'showActionSheet', () => context.connection.call(
        'api',
        'ui.actionSheet',
        params as Record<string, unknown>,
        { pageId: context.pageId },
      ))
    },
    getNetworkType: (params: unknown = {}) => {
      return runApi(params, 'getNetworkType', () => context.connection.call(
        'api',
        'network.type',
        {},
        { pageId: context.pageId },
      ))
    },
    getBatteryInfo: (params: unknown = {}) => {
      return runApi(params, 'getBatteryInfo', () => context.connection.call(
        'api',
        'battery.get',
        {},
        { pageId: context.pageId },
      ))
    },
    request: (params: unknown = {}) => {
      runApi(params, 'request', () => context.connection.call(
        'api',
        'network.request',
        params as Record<string, unknown>,
        { pageId: context.pageId },
      ))
      return { abort: () => undefined }
    },
    getStorage: (params: unknown = {}) => {
      return runApi(params, 'getStorage', () => ({
        data: cloneJsonSafe(context.getStorageSnapshot()[String((params as { key?: unknown }).key)]),
        errMsg: 'getStorage:ok',
      }))
    },
    setStorage: (params: unknown = {}) => {
      const payload = (params ?? {}) as { key?: unknown; value?: unknown }
      return runApi(params, 'setStorage', async () => {
        const key = String(payload.key)
        const value = cloneJsonSafe(payload.value)
        context.setStorageSnapshot(key, value)
        await context.connection.call('api', 'storage.set', { key, value }, { pageId: context.pageId })
        return { errMsg: 'setStorage:ok' }
      })
    },
    removeStorage: (params: unknown = {}) => {
      const key = String((params as { key?: unknown }).key)
      return runApi(params, 'removeStorage', async () => {
        delete context.getStorageSnapshot()[key]
        await context.connection.call('api', 'storage.remove', { key }, { pageId: context.pageId })
        return { errMsg: 'removeStorage:ok' }
      })
    },
    clearStorage: (params: unknown = {}) => {
      return runApi(params, 'clearStorage', async () => {
        const snapshot = context.getStorageSnapshot()
        for (const key of Object.keys(snapshot)) delete snapshot[key]
        await context.connection.call('api', 'storage.clear', {}, { pageId: context.pageId })
        return { errMsg: 'clearStorage:ok' }
      })
    },
    getStorageInfo: (params: unknown = {}) => {
      return runApi(params, 'getStorageInfo', async () => {
        const info = storageInfo(context.getStorageSnapshot())
        await context.connection.call('api', 'storage.info', {}, { pageId: context.pageId })
        return info
      })
    },
    getStorageInfoSync: () => storageInfo(context.getStorageSnapshot()),
    removeStorageSync: (key: unknown) => {
      delete context.getStorageSnapshot()[String(key)]
      void context.connection.call('api', 'storage.remove', { key: String(key) }, { pageId: context.pageId }).catch(() => undefined)
    },
    clearStorageSync: () => {
      const snapshot = context.getStorageSnapshot()
      for (const key of Object.keys(snapshot)) delete snapshot[key]
      void context.connection.call('api', 'storage.clear', {}, { pageId: context.pageId }).catch(() => undefined)
    },
    hideToast: (params: unknown = {}) => runApi(params, 'hideToast', () => context.connection.call(
      'api',
      'ui.hideToast',
      {},
      { pageId: context.pageId },
    )),
    getUserProfile: (params: unknown = {}) => {
      context.connection.sendDiagnostic('warn', {
        code: DIAGNOSTIC_CODES.API_PROFILE_STUB,
        message: `${context.apiName}.getUserProfile returns a stub profile in the P0 runtime.`,
      }, context.pageId)
      return runApi(params, 'getUserProfile', () => context.connection.call('api', 'profile.get', {}, { pageId: context.pageId }))
    },
    getUserInfo: (params: unknown = {}) => {
      context.connection.sendDiagnostic('warn', {
        code: DIAGNOSTIC_CODES.API_PROFILE_STUB,
        message: `${context.apiName}.getUserInfo returns a stub profile in the P0 runtime.`,
      }, context.pageId)
      return runApi(params, 'getUserInfo', () => context.connection.call('api', 'profile.get', {}, { pageId: context.pageId }))
    },
    setNavigationBarTitle: (params: unknown = {}) => runApi(params, 'setNavigationBarTitle', () => context.connection.call(
      'api',
      'navigation.title',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    )),
    setNavigationBarColor: (params: unknown = {}) => runApi(params, 'setNavigationBarColor', () => ({ errMsg: 'setNavigationBarColor:ok' })),
    showNavigationBarLoading: (params: unknown = {}) => runApi(params, 'showNavigationBarLoading', () => ({ errMsg: 'showNavigationBarLoading:ok' })),
    hideNavigationBarLoading: (params: unknown = {}) => runApi(params, 'hideNavigationBarLoading', () => ({ errMsg: 'hideNavigationBarLoading:ok' })),
    pageScrollTo: (params: unknown = {}) => runApi(params, 'pageScrollTo', () => ({ errMsg: 'pageScrollTo:ok' })),
    setTabBarStyle: (params: unknown = {}) => runApi(params, 'setTabBarStyle', () => {
      requireTabBar().setStyle((params ?? {}) as Record<string, unknown>)
      return { errMsg: 'setTabBarStyle:ok' }
    }),
    setTabBarItem: (params: unknown = {}) => runApi(params, 'setTabBarItem', () => {
      requireTabBar().setItem((params ?? {}) as Record<string, unknown>)
      return { errMsg: 'setTabBarItem:ok' }
    }),
    setTabBarBadge: (params: unknown = {}) => runApi(params, 'setTabBarBadge', () => {
      requireTabBar().setBadge((params ?? {}) as Record<string, unknown>)
      return { errMsg: 'setTabBarBadge:ok' }
    }),
    removeTabBarBadge: (params: unknown = {}) => runApi(params, 'removeTabBarBadge', () => {
      requireTabBar().removeBadge((params ?? {}) as Record<string, unknown>)
      return { errMsg: 'removeTabBarBadge:ok' }
    }),
    showTabBarRedDot: (params: unknown = {}) => runApi(params, 'showTabBarRedDot', () => {
      requireTabBar().showRedDot((params ?? {}) as Record<string, unknown>)
      return { errMsg: 'showTabBarRedDot:ok' }
    }),
    hideTabBarRedDot: (params: unknown = {}) => runApi(params, 'hideTabBarRedDot', () => {
      requireTabBar().hideRedDot((params ?? {}) as Record<string, unknown>)
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
    onThemeChange: (callback: unknown) => {
      if (typeof callback === 'function') themeListeners.add(callback as (value: unknown) => void)
    },
    offThemeChange: (callback?: unknown) => {
      if (typeof callback === 'function') themeListeners.delete(callback as (value: unknown) => void)
      else themeListeners.clear()
    },
    onKeyboardHeightChange: (callback: unknown) => {
      if (typeof callback === 'function') keyboardListeners.add(callback as (value: unknown) => void)
    },
    offKeyboardHeightChange: (callback?: unknown) => {
      if (typeof callback === 'function') keyboardListeners.delete(callback as (value: unknown) => void)
      else keyboardListeners.clear()
    },
    hideKeyboard: (params: unknown = {}) => runApi(params, 'hideKeyboard', () => ({ errMsg: 'hideKeyboard:ok' })),
    getFileSystemManager: () => createFileSystemManagerStub(),
    setClipboardData: (params: unknown = {}) => {
      return runApi(params, 'setClipboardData', () => context.connection.call(
        'api',
        'clipboard.set',
        params as Record<string, unknown>,
        { pageId: context.pageId },
      ))
    },
    getClipboardData: (params: unknown = {}) => {
      return runApi(params, 'getClipboardData', () => context.connection.call(
        'api',
        'clipboard.get',
        {},
        { pageId: context.pageId },
      ))
    },
    vibrateShort: (params: unknown = {}) => {
      return runApi(params, 'vibrateShort', () => context.connection.call(
        'api',
        'device.vibrate',
        { duration: 15 },
        { pageId: context.pageId },
      ))
    },
    vibrateLong: (params: unknown = {}) => {
      return runApi(params, 'vibrateLong', () => context.connection.call(
        'api',
        'device.vibrate',
        { duration: 400 },
        { pageId: context.pageId },
      ))
    },
    getSetting: (params: unknown = {}) => {
      return runApi(params, 'getSetting', () => context.connection.call(
        'api',
        'settings.get',
        {},
        { pageId: context.pageId },
      ))
    },
    openSetting: (params: unknown = {}) => {
      return runApi(params, 'openSetting', () => context.connection.call(
        'api',
        'settings.open',
        {},
        { pageId: context.pageId },
      ))
    },
    authorize: (params: unknown = {}) => {
      return runApi(params, 'authorize', () => ({ errMsg: 'authorize:ok' }))
    },
    login: (params: unknown = {}) => {
      context.connection.sendDiagnostic('warn', {
        code: DIAGNOSTIC_CODES.API_LOGIN_STUB,
        message: `${context.apiName}.login returns a host-generated stub code; no session is created.`,
      }, context.pageId)
      return runApi(params, 'login', () => context.connection.call(
        'api',
        'login',
        {},
        { pageId: context.pageId },
      ))
    },
    checkSession: (params: unknown = {}) => {
      return runApi(params, 'checkSession', () => ({ errMsg: 'checkSession:ok' }))
    },
    showShareMenu: (params: unknown = {}) => {
      return runApi(params, 'showShareMenu', () => context.connection.call('api', 'share.menu', { action: 'showShareMenu' }, { pageId: context.pageId }))
    },
    hideShareMenu: (params: unknown = {}) => {
      return runApi(params, 'hideShareMenu', () => context.connection.call('api', 'share.menu', { action: 'hideShareMenu' }, { pageId: context.pageId }))
    },
    updateShareMenu: (params: unknown = {}) => {
      return runApi(params, 'updateShareMenu', () => context.connection.call('api', 'share.menu', { action: 'updateShareMenu' }, { pageId: context.pageId }))
    },
    canIUse: (name: unknown) => {
      const key = String(name ?? '')
      const separator = key.indexOf('.')
      if (separator <= 0) return false
      const namespace = key.slice(0, separator)
      return context.apiNamespaces.includes(namespace)
        ? context.apiNames.has(key.slice(separator + 1))
        : false
    },
    nextTick: (callback: unknown) => {
      if (typeof callback === 'function') Promise.resolve().then(() => callback())
    },
    getLaunchOptionsSync: () => ({
      path: context.getCurrentPagePath?.() ?? '',
      query: {},
      scene: 1001,
    }),
    createAnimation: (options: unknown = {}) => createAnimationStub(options),
    createCanvasContext: (canvasId: unknown = 'canvas') => {
      const legacy = context.canvas?.createLegacyCanvasContext(
        String(canvasId || 'canvas'),
        { pageId: context.pageId },
      )
      return legacy ?? createCanvasContextStub()
    },
    createSelectorQuery: () => {
      context.connection.sendDiagnostic('log', {
        code: DIAGNOSTIC_CODES.CANVAS_OFFSCREEN,
        message: 'Canvas is rendered in the service thread and presented by the render thread.',
      }, context.pageId)
      return createSelectorQuery(context)
    },
  }
}


function createCanvasContextStub(): Record<string, unknown> {
  return new Proxy({}, {
    get: () => () => undefined,
    set: () => true,
  })
}


function createFileSystemManagerStub(): Record<string, unknown> {
  const fail = (apiName: string, params: unknown) => {
    const callbacks = (params ?? {}) as { fail?: (value: unknown) => void; complete?: (value: unknown) => void }
    const result = { errMsg: `${apiName}:fail not supported by the Tiny runtime` }
    callbacks.fail?.(result)
    callbacks.complete?.(result)
  }
  return {
    access: (params: unknown) => fail('access', params),
    readFile: (params: unknown) => fail('readFile', params),
    writeFile: (params: unknown) => fail('writeFile', params),
    mkdir: (params: unknown) => fail('mkdir', params),
    readdir: (params: unknown) => fail('readdir', params),
    stat: (params: unknown) => fail('stat', params),
    unlink: (params: unknown) => fail('unlink', params),
    rmdir: (params: unknown) => fail('rmdir', params),
  }
}
