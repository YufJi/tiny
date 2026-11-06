import { describe, expect, test } from 'vitest'
import type { ServiceApiContext } from '@tiny/runtime'
import { createApiHost } from '../src'

/**
 * A realistic context: the API names are the real table (as the kernel fills
 * them after the factory returns), the snapshot is mutable so host facts can be
 * probed, and the API global keeps its default alias list.
 */
function createContext() {
  const snapshot: Record<string, unknown> = {
    pixelRatio: 2,
    windowWidth: 390,
    windowHeight: 844,
    SDKVersion: '3.0.0',
    platform: 'devtools',
  }
  const context = {
    connection: {
      sendDiagnostic: () => undefined,
      call: () => Promise.resolve(undefined),
    },
    apiName: 'wx',
    apiNamespaces: ['wx'],
    // The system-info family is answered from live host facts.
    syncHost: {
      call: (domain: string, method: string) => {
        if (domain !== 'api') throw new Error(`unsupported sync host domain: ${domain}`)
        return method === 'system.info' ? snapshot : undefined
      },
    },
    apiNames: new Set<string>(),
    pageId: 'page-1',
  } as unknown as ServiceApiContext
  const host = createApiHost(context) as Record<string, (...args: unknown[]) => unknown>
  for (const name of Object.keys(host)) context.apiNames.add(name)
  return { context, host, snapshot }
}

describe('canIUse schema families', () => {
  test('answers bare API names from the installed table', () => {
    const { host } = createContext()
    expect(host.canIUse!('nextTick')).toBe(true)
    expect(host.canIUse!('getStorageSync')).toBe(true)
    expect(host.canIUse!('canIUse')).toBe(true)
    expect(host.canIUse!('notAnApi')).toBe(false)
    // Host-added entries are just table names.
    expect(host.canIUse!('hostOnlyApi')).toBe(false)
  })

  test('answers API method/param probes the engine itself guarantees', () => {
    const { host } = createContext()
    expect(host.canIUse!('getStorage')).toBe(true)
    // Parameter fields the API layer reads.
    expect(host.canIUse!('getStorage.object.key')).toBe(true)
    expect(host.canIUse!('setStorage.object.data')).toBe(true)
    expect(host.canIUse!('setStorage.object.value')).toBe(false)
    expect(host.canIUse!('navigateTo.object.url')).toBe(true)
    expect(host.canIUse!('navigateTo.object.events')).toBe(true)
    expect(host.canIUse!('navigateBack.object.delta')).toBe(true)
    // Host-owned shapes are intentionally not promised: storage and platform
    // APIs may answer with a stub, so only engine-composed shapes are declared.
    expect(host.canIUse!('getStorage.success.data')).toBe(false)
    expect(host.canIUse!('getStorageInfo.success.keys')).toBe(false)
    expect(host.canIUse!('request.object.method.GET')).toBe(false)
    expect(host.canIUse!('request.success.data')).toBe(false)
    expect(host.canIUse!('getNetworkType.success.networkType')).toBe(false)
    expect(host.canIUse!('showModal.success.confirm')).toBe(false)
    expect(host.canIUse!('showToast.object.image')).toBe(false)
    expect(host.canIUse!('onCompassChange.callback.direction')).toBe(false)
  })

  test('answers sync return shapes the API layer composes itself', () => {
    const { host } = createContext()
    expect(host.canIUse!('getLaunchOptionsSync.return.path')).toBe(true)
    expect(host.canIUse!('getLaunchOptionsSync.return.scene')).toBe(true)
    // Storage info comes from the host now, so its fields are host-owned.
    expect(host.canIUse!('getStorageInfoSync.return.keys')).toBe(false)
  })

  test('answers system-info return fields from the live host snapshot', () => {
    const { host, snapshot } = createContext()
    expect(host.canIUse!('getSystemInfoSync.return')).toBe(true)
    expect(host.canIUse!('getSystemInfoSync.return.windowWidth')).toBe(true)
    expect(host.canIUse!('getSystemInfoSync.return.safeArea')).toBe(false)
    expect(host.canIUse!('getSystemInfoSync.success.windowWidth')).toBe(false)
    // A host that reports safeArea makes the field available, including nested
    // properties, without touching the API layer.
    snapshot.safeArea = { top: 20, left: 0, right: 390, bottom: 844 }
    expect(host.canIUse!('getSystemInfoSync.return.safeArea')).toBe(true)
    expect(host.canIUse!('getSystemInfoSync.return.safeArea.top')).toBe(true)
    expect(host.canIUse!('getSystemInfoSync.return.safeArea.missing')).toBe(false)
    // `getSystemInfo` answers through `success`, not `return`.
    expect(host.canIUse!('getSystemInfo.success.windowWidth')).toBe(true)
    expect(host.canIUse!('getSystemInfo.return.windowWidth')).toBe(false)
  })

  test('answers component tags and attributes from the built-in inventory', () => {
    const { host } = createContext()
    expect(host.canIUse!('text')).toBe(true)
    expect(host.canIUse!('text.selectable')).toBe(true)
    expect(host.canIUse!('view.aria-label')).toBe(true)
    expect(host.canIUse!('text.missing-attribute')).toBe(false)
    // Option lists are not tracked yet: attribute existence is true, values are
    // answered conservatively.
    expect(host.canIUse!('button.open-type')).toBe(true)
    expect(host.canIUse!('button.open-type.contact')).toBe(false)
    // Tags the renderer does not provide.
    expect(host.canIUse!('live-player')).toBe(false)
    expect(host.canIUse!('live-player.src')).toBe(false)
  })

  test('answers class/object members', () => {
    const { host } = createContext()
    expect(host.canIUse!('console.log')).toBe(true)
    expect(host.canIUse!('console.table')).toBe(false)
    expect(host.canIUse!('SelectorQuery.exec')).toBe(true)
    expect(host.canIUse!('SelectorQuery.missing')).toBe(false)
    expect(host.canIUse!('EventChannel.on')).toBe(true)
    expect(host.canIUse!('IntersectionObserver.observe')).toBe(true)
    expect(host.canIUse!('Animation.export')).toBe(true)
    expect(host.canIUse!('CameraContext.onCameraFrame')).toBe(false)
    // The file-system manager is a fail-only stub; neither the class nor a
    // member is claimed.
    expect(host.canIUse!('FileSystemManager')).toBe(false)
    expect(host.canIUse!('FileSystemManager.readFile')).toBe(false)
  })

  test('resolves component, class and API families in WeChat order', () => {
    const { host } = createContext()
    // `canvas` is a built-in tag; `createAnimation` is an API and `Animation` a
    // class. None of the buckets may shadow each other.
    expect(host.canIUse!('canvas')).toBe(true)
    expect(host.canIUse!('Animation')).toBe(true)
    expect(host.canIUse!('createAnimation')).toBe(true)
  })

  test('accepts an installed API global as an optional prefix', () => {
    const { host, context } = createContext()
    expect(host.canIUse!('wx.request')).toBe(true)
    expect(host.canIUse!('wx.notAnApi')).toBe(false)
    context.apiNamespaces = ['my', 'wx']
    expect(host.canIUse!('my.nextTick')).toBe(true)
    expect(host.canIUse!('other.nextTick')).toBe(false)
  })

  test('reports sync APIs unavailable when the host has no sync channel', () => {
    const { host, context } = createContext()
    expect(host.canIUse!('getStorageSync')).toBe(true)
    expect(host.canIUse!('getSystemInfoSync')).toBe(true)
    context.syncHost = undefined
    expect(host.canIUse!('getStorageSync')).toBe(false)
    expect(host.canIUse!('getSystemInfoSync')).toBe(false)
    expect(host.canIUse!('getSystemInfoSync.return.windowWidth')).toBe(false)
    // Asynchronous variants keep working without a sync channel.
    expect(host.canIUse!('getStorage')).toBe(true)
    expect(host.canIUse!('getSystemInfo')).toBe(true)
  })

  test('rejects malformed schemas without throwing for known-empty forms', () => {
    const { host } = createContext()
    expect(host.canIUse!()).toBe(false)
    expect(host.canIUse!(undefined)).toBe(false)
    expect(host.canIUse!('')).toBe(false)
    expect(host.canIUse!('.request')).toBe(false)
    expect(host.canIUse!('request.')).toBe(false)
    expect(host.canIUse!('request..method')).toBe(false)
    expect(host.canIUse!('nextTick.anything')).toBe(false)
    expect(() => host.canIUse!(42)).toThrow('canIUse: schema should be a string')
    expect(() => host.canIUse!(null)).toThrow('canIUse: schema should be a string')
  })
})
