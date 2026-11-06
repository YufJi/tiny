import {
  BUILTIN_COMPONENT_ATTRIBUTES,
  BUILTIN_COMPONENT_COMMON_ATTRIBUTES,
  BUILTIN_COMPONENT_TAGS,
} from '@tiny/manifest'
import type {
  CanIUseCapabilities,
  CanIUseCapabilityNode,
} from './can-i-use'

/**
 * Capability facts behind `wx.canIUse`.
 *
 * The tables describe what the implementation actually supports, not a base
 * library version:
 *
 * - API names come from the installed `wx.*` table (the kernel records them);
 * - API sub-paths are declared below only where **the engine itself** guarantees
 *   them: callbacks it drives, parameter fields it reads, and return/`success`
 *   shapes it composes;
 * - class/namespace members are the objects this runtime returns;
 * - component attributes are generated from the real built-in definitions in
 *   `@tiny/manifest` (`builtin-capabilities.ts`), never hand-copied. They mean
 *   "the built-in component defines this WXML attribute".
 *
 * Host-owned behavior is deliberately NOT declared. A host may accept an API
 * call and answer with a stub (`{ errMsg }` only), so result fields such as
 * `request.success.data`, `getNetworkType.success.networkType` or
 * `showModal.success.confirm`, and parameter sets of host-backed APIs, are not
 * promised by this table. When in doubt, leave a capability out: a missing
 * entry answers `false`, which makes callers fall back instead of relying on
 * something the engine cannot guarantee.
 */

/** APIs whose `success` / `fail` / `complete` callbacks the API layer drives. */
const CALLBACK_APIS = [
  'getSystemInfo',
  'hideKeyboard',
  'getStorage',
  'setStorage',
  'removeStorage',
  'clearStorage',
  'getStorageInfo',
  'navigateTo',
  'navigateBack',
  'redirectTo',
  'reLaunch',
  'switchTab',
  'startPullDownRefresh',
  'stopPullDownRefresh',
  'setNavigationBarTitle',
  'setNavigationBarColor',
  'showNavigationBarLoading',
  'hideNavigationBarLoading',
  'pageScrollTo',
  'showToast',
  'hideToast',
  'showModal',
  'showLoading',
  'hideLoading',
  'showActionSheet',
  'setTabBarStyle',
  'setTabBarItem',
  'setTabBarBadge',
  'removeTabBarBadge',
  'showTabBarRedDot',
  'hideTabBarRedDot',
  'showTabBar',
  'hideTabBar',
  'getNetworkType',
  'getBatteryInfo',
  'request',
  'setClipboardData',
  'getClipboardData',
  'vibrateShort',
  'vibrateLong',
  'getSetting',
  'openSetting',
  'authorize',
  'checkSession',
  'login',
  'getUserProfile',
  'getUserInfo',
  'showShareMenu',
  'hideShareMenu',
  'updateShareMenu',
] as const

/**
 * `object` (parameter) fields the API layer itself reads. Host-backed parameter
 * sets are host-owned and intentionally absent.
 */
const API_PARAMS: Readonly<Record<string, CanIUseCapabilityNode>> = {
  navigateTo: { url: true, events: true },
  navigateBack: { delta: true },
  redirectTo: { url: true },
  reLaunch: { url: true },
  switchTab: { url: true, index: true },
  getStorage: { key: true },
  setStorage: { key: true, data: true },
  removeStorage: { key: true },
}

/** Return shapes this package composes itself (independent of the host). */
const API_RETURNS: Readonly<Record<string, CanIUseCapabilityNode>> = {
  getLaunchOptionsSync: { path: true, query: true, scene: true },
}

/** Objects this runtime returns from its APIs (`createXxx` factories). */
const CLASS_CAPABILITIES: Readonly<Record<string, CanIUseCapabilityNode>> = {
  // The JS engine provides console; these are the modes app code relies on.
  console: { log: true, debug: true, info: true, warn: true, error: true },
  // `wx.navigateTo({ events })` / `this.getOpenerEventChannel()`.
  EventChannel: { emit: true, on: true, once: true, off: true },
  SelectorQuery: { in: true, select: true, selectAll: true, exec: true },
  IntersectionObserver: {
    relativeTo: true,
    relativeToViewport: true,
    observe: true,
    unobserve: true,
    disconnect: true,
  },
  Animation: {
    step: true,
    export: true,
    scale: true,
    scaleX: true,
    scaleY: true,
    scaleZ: true,
    rotate: true,
    rotateX: true,
    rotateY: true,
    rotateZ: true,
    skew: true,
    skewX: true,
    skewY: true,
    translate: true,
    translateX: true,
    translateY: true,
    translateZ: true,
    matrix: true,
    opacity: true,
    width: true,
    height: true,
    top: true,
    left: true,
    bottom: true,
    right: true,
    backgroundColor: true,
  },
  // FileSystemManager is a fail-only stub, so neither the class nor its methods
  // are claimed even though `getFileSystemManager()` returns an object.
}

function buildApiCapabilities(): Readonly<Record<string, CanIUseCapabilityNode>> {
  const facts: Record<string, CanIUseCapabilityNode> = {}
  const merge = (name: string, node: CanIUseCapabilityNode): void => {
    const current = facts[name]
    if (current === true) return
    facts[name] = current === undefined
      ? node
      : { ...(current as Record<string, CanIUseCapabilityNode>), ...(node as Record<string, CanIUseCapabilityNode>) }
  }
  for (const name of CALLBACK_APIS) merge(name, { success: true })
  for (const [name, node] of Object.entries(API_PARAMS)) merge(name, { object: node })
  for (const [name, node] of Object.entries(API_RETURNS)) merge(name, { return: node })
  return facts
}

function buildComponentCapabilities(): Readonly<Record<string, CanIUseCapabilityNode>> {
  const common: Record<string, CanIUseCapabilityNode> = {}
  for (const attribute of BUILTIN_COMPONENT_COMMON_ATTRIBUTES) common[attribute] = true
  const facts: Record<string, CanIUseCapabilityNode> = {}
  for (const tag of BUILTIN_COMPONENT_TAGS) {
    const attributes: Record<string, CanIUseCapabilityNode> = { ...common }
    for (const attribute of BUILTIN_COMPONENT_ATTRIBUTES[tag] ?? []) attributes[attribute] = true
    facts[tag] = attributes
  }
  return facts
}

/** The capability table handed to the `canIUse` resolver. */
export const CAN_I_USE_CAPABILITIES: CanIUseCapabilities = {
  api: buildApiCapabilities(),
  class: CLASS_CAPABILITIES,
  component: buildComponentCapabilities(),
}
