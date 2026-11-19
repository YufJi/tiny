/**
 * Declarative catalog of the `wx.*` table.
 *
 * One entry per name the core table installs. The runtime table is still built
 * by the per-domain modules; this file is the **contract** those modules must
 * satisfy, and the input of `pnpm api:coverage`:
 *
 * - a test asserts the catalog and `createApiHost()` expose exactly the same
 *   names, so adding an API without declaring it fails CI;
 * - `host` names the `api` domain handler the entry calls, or is absent when the
 *   API runs entirely in the service realm;
 * - `status` grades the best available end-to-end behavior, not the call shape:
 *   `real` works, `partial` answers with canned/minimal data, `stub` is a
 *   registered shape that does nothing (or always fails).
 *
 * The WeChat 3.17.5 name list, its document category and the in/out-of-scope
 * decision live in `data/wechat-3.17.5.tsv`. Keeping them apart lets this file
 * describe what Tiny *has* while the data file describes what WeChat *expects*.
 */

export type ApiStatus = 'real' | 'partial' | 'stub'

export type ApiDescriptor = {
  /** Best available behavior on the browser/acceptance host. */
  status: ApiStatus
  /** Host `api` domain handler key; absent for service-realm-only APIs. */
  host?: string
  /**
   * Values come from a host-owned mock rather than a real platform. The call
   * shape, `errMsg` and fields still match WeChat, so flows are not blocked;
   * see the mock boundary in `docs/api-roadmap.md` §0.
   */
  mock?: true
}

export const API_CATALOG = {
  // --- system.ts: host facts and service utilities -------------------------
  getSystemInfoSync: { status: 'real', host: 'system.info' },
  getSystemInfo: { status: 'real', host: 'system.info' },
  getSystemInfoAsync: { status: 'real', host: 'system.info' },
  getSystemSetting: { status: 'real', host: 'system.setting' },
  getAccountInfoSync: { status: 'real', host: 'account.info' },
  getEnterOptionsSync: { status: 'real' },
  canIUse: { status: 'real' },
  nextTick: { status: 'real' },
  getLaunchOptionsSync: { status: 'real' },
  hideKeyboard: { status: 'partial', host: 'keyboard.hide' },

  // --- basics.ts: service utilities, no platform backend -------------------
  getRandomValues: { status: 'real' },
  createBufferURL: { status: 'real' },
  revokeBufferURL: { status: 'real' },
  requestIdleCallback: { status: 'real' },
  cancelIdleCallback: { status: 'real' },
  getUpdateManager: { status: 'real', host: 'update.check' },

  // --- global-events.ts: service-owned event hub ---------------------------
  onAppShow: { status: 'partial' },
  offAppShow: { status: 'partial' },
  onAppHide: { status: 'real' },
  offAppHide: { status: 'real' },
  onError: { status: 'partial' },
  offError: { status: 'partial' },
  onThemeChange: { status: 'stub' },
  offThemeChange: { status: 'stub' },
  onKeyboardHeightChange: { status: 'partial' },
  offKeyboardHeightChange: { status: 'partial' },
  onWindowResize: { status: 'partial' },
  offWindowResize: { status: 'partial' },
  onNetworkStatusChange: { status: 'real' },
  offNetworkStatusChange: { status: 'real' },
  onMemoryWarning: { status: 'stub' },
  offMemoryWarning: { status: 'stub' },
  onUserCaptureScreen: { status: 'stub' },
  offUserCaptureScreen: { status: 'stub' },
  onPageNotFound: { status: 'real' },
  offPageNotFound: { status: 'real' },
  onUnhandledRejection: { status: 'real' },
  offUnhandledRejection: { status: 'real' },

  // --- storage.ts: every call goes through the host -----------------------
  getStorageSync: { status: 'real', host: 'storage.get' },
  setStorageSync: { status: 'real', host: 'storage.set' },
  getStorage: { status: 'real', host: 'storage.get' },
  setStorage: { status: 'real', host: 'storage.set' },
  removeStorage: { status: 'real', host: 'storage.remove' },
  removeStorageSync: { status: 'real', host: 'storage.remove' },
  clearStorage: { status: 'real', host: 'storage.clear' },
  clearStorageSync: { status: 'real', host: 'storage.clear' },
  getStorageInfo: { status: 'real', host: 'storage.info' },
  getStorageInfoSync: { status: 'real', host: 'storage.info' },

  // --- navigation.ts: routes go through host-core, chrome through the host -
  navigateTo: { status: 'real', host: 'navigate.to' },
  navigateBack: { status: 'real', host: 'navigate.back' },
  redirectTo: { status: 'real', host: 'navigate.redirectTo' },
  reLaunch: { status: 'real', host: 'navigate.reLaunch' },
  switchTab: { status: 'real', host: 'navigate.switchTab' },
  startPullDownRefresh: { status: 'partial', host: 'page.pullDownRefresh' },
  stopPullDownRefresh: { status: 'stub', host: 'page.stopPullDownRefresh' },
  setNavigationBarTitle: { status: 'partial', host: 'navigation.title' },
  setNavigationBarColor: { status: 'stub', host: 'navigation.color' },
  showNavigationBarLoading: { status: 'stub', host: 'navigation.loading' },
  hideNavigationBarLoading: { status: 'stub', host: 'navigation.loading' },
  pageScrollTo: { status: 'stub', host: 'page.scrollTo' },

  // --- ui.ts: host overlays ------------------------------------------------
  showToast: { status: 'real', host: 'toast.show' },
  hideToast: { status: 'real', host: 'ui.hideToast' },
  showModal: { status: 'real', host: 'ui.modal' },
  showLoading: { status: 'real', host: 'ui.loading' },
  hideLoading: { status: 'real', host: 'ui.hideLoading' },
  showActionSheet: { status: 'real', host: 'ui.actionSheet' },

  // --- tabbar.ts: runtime tabBar, no host round-trip ----------------------
  setTabBarStyle: { status: 'real' },
  setTabBarItem: { status: 'real' },
  setTabBarBadge: { status: 'real' },
  removeTabBarBadge: { status: 'real' },
  showTabBarRedDot: { status: 'real' },
  hideTabBarRedDot: { status: 'real' },
  showTabBar: { status: 'real' },
  hideTabBar: { status: 'real' },

  // --- network.ts ---------------------------------------------------------
  getNetworkType: { status: 'real', host: 'network.type' },
  getBatteryInfo: { status: 'partial', host: 'battery.get' },
  request: { status: 'partial', host: 'network.request' },

  // --- device.ts: clipboard, vibration, identity --------------------------
  setClipboardData: { status: 'real', host: 'clipboard.set' },
  getClipboardData: { status: 'real', host: 'clipboard.get' },
  vibrateShort: { status: 'partial', host: 'device.vibrate' },
  vibrateLong: { status: 'partial', host: 'device.vibrate' },
  // Identity is host-owned and mockable: the host answers with a code / profile
  // so prototype flows keep moving. Not stubs — `canIUse` must say true.
  getSetting: { status: 'real', host: 'settings.get', mock: true },
  openSetting: { status: 'real', host: 'settings.open', mock: true },
  authorize: { status: 'real', host: 'identity.authorize', mock: true },
  checkSession: { status: 'real', host: 'identity.checkSession', mock: true },
  login: { status: 'real', host: 'login', mock: true },
  getUserProfile: { status: 'real', host: 'profile.get', mock: true },
  getUserInfo: { status: 'real', host: 'profile.get', mock: true },

  // --- encoding.ts: pure service, no host ---------------------------------
  base64ToArrayBuffer: { status: 'real' },
  arrayBufferToBase64: { status: 'real' },

  // --- share.ts -----------------------------------------------------------
  showShareMenu: { status: 'stub', host: 'share.menu' },
  hideShareMenu: { status: 'stub', host: 'share.menu' },
  updateShareMenu: { status: 'stub', host: 'share.menu' },

  // --- canvas.ts ----------------------------------------------------------
  createAnimation: { status: 'real' },
  createCanvasContext: { status: 'real' },
  // Only the canvas-node form can be exported; `canvasId` fails honestly.
  canvasToTempFilePath: { status: 'partial', host: 'media.dataUrlToTempFile' },
  // Legacy alias kept for pre-1.9 bundles; not a WeChat 3.17.5 name.
  createContext: { status: 'stub' },

  // --- worklet.ts: Skyline-only namespace, out of the WebView target ------
  worklet: { status: 'stub' },

  // --- analytics.ts -------------------------------------------------------
  reportAnalytics: { status: 'stub' },

  // --- media-picker.ts: host-owned chooser, temp files and preview --------
  chooseImage: { status: 'real', host: 'media.chooseImage' },
  chooseMedia: { status: 'real', host: 'media.chooseMedia' },
  // A browser cannot capture a thumbnail, the rest of the shape is real.
  chooseVideo: { status: 'partial', host: 'media.chooseVideo' },
  previewImage: { status: 'partial', host: 'media.previewImage' },
  previewMedia: { status: 'partial', host: 'media.previewMedia' },
  getImageInfo: { status: 'real', host: 'media.getImageInfo' },
  getVideoInfo: { status: 'partial', host: 'media.getVideoInfo' },
  // No photo album in a browser: the host saves the file as a download.
  saveImageToPhotosAlbum: { status: 'partial', host: 'media.saveImageToPhotosAlbum' },
  saveVideoToPhotosAlbum: { status: 'partial', host: 'media.saveVideoToPhotosAlbum' },

  // --- media.ts: manager shapes exist, no audio backend -------------------
  getRecorderManager: { status: 'stub' },
  getBackgroundAudioManager: { status: 'stub' },
  createInnerAudioContext: { status: 'stub' },

  // --- compat-stubs.ts: platform surface with no backend ------------------
  getScreenBrightness: { status: 'stub' },
  setScreenBrightness: { status: 'stub' },
  createBLEPeripheralServer: { status: 'stub' },
  onBLEPeripheralConnectionStateChanged: { status: 'stub' },
  offBLEPeripheralConnectionStateChanged: { status: 'stub' },
  onLocalServiceFound: { status: 'stub' },
  offLocalServiceFound: { status: 'stub' },
  onLocalServiceLost: { status: 'stub' },
  offLocalServiceLost: { status: 'stub' },
  onLocalServiceResolveFail: { status: 'stub' },
  offLocalServiceResolveFail: { status: 'stub' },
  onLocalServiceDiscoveryStop: { status: 'stub' },
  offLocalServiceDiscoveryStop: { status: 'stub' },
  startLocalServiceDiscovery: { status: 'stub' },
  stopLocalServiceDiscovery: { status: 'stub' },
  createWorker: { status: 'stub' },

  // --- query.ts -----------------------------------------------------------
  // Selector/intersection queries run over the render tree, not the host `api` domain.
  createSelectorQuery: { status: 'real' },
  createIntersectionObserver: { status: 'real' },

  // --- filesystem.ts ------------------------------------------------------
  getFileSystemManager: { status: 'stub' },
} as const satisfies Record<string, ApiDescriptor>

export type ApiCatalog = typeof API_CATALOG
export type ApiName = keyof ApiCatalog

/** Names the runtime exposes but WeChat 3.17.5 does not. */
export const TINY_ONLY_APIS: ReadonlySet<string> = new Set(['createContext', 'worklet'])

/** Host-composed APIs (not part of `createApiHost`), counted by coverage. */
export const HOST_EXTENSION_APIS = [
  'getAppBaseInfo',
  'getDeviceInfo',
  'getMenuButtonBoundingClientRect',
  'getPerformance',
  'getWindowInfo',
] as const

/** Every name the core table installs, in declaration order. */
export const API_NAMES = Object.keys(API_CATALOG) as ApiName[]

/** Distinct host handler keys the catalog depends on. */
export function apiHostKeys(): string[] {
  return [...new Set(
    Object.values(API_CATALOG)
      .map((descriptor) => (descriptor as ApiDescriptor).host)
      .filter((host): host is string => typeof host === 'string'),
  )].sort()
}

/** Look up a descriptor without widening the key type at call sites. */
export function describeApi(name: string): ApiDescriptor | undefined {
  return (API_CATALOG as Record<string, ApiDescriptor>)[name]
}
