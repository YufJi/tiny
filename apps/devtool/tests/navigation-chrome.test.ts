import { describe, expect, test } from 'vitest'
import { createDevtoolApiHost } from '../src/host-api'

const systemInfo = {
  SDKVersion: '3.17.5',
  brand: 'devtools',
  model: 'iPhone 13',
  system: 'iOS 16.0',
  platform: 'devtools',
  pixelRatio: 2,
  screenWidth: 390,
  screenHeight: 844,
  windowWidth: 390,
  windowHeight: 844,
  statusBarHeight: 20,
  language: 'zh_CN',
  version: '8.0.0',
  theme: 'light' as const,
}

describe('devtool navigation chrome', () => {
  test('exposes the host capsule through the synchronous API channel', () => {
    const menuButton = {
      width: 87,
      height: 32,
      top: 48,
      right: 365,
      bottom: 80,
      left: 278,
    }
    const { syncApiHandlers } = createDevtoolApiHost({
      getSystemInfo: () => systemInfo,
      getMenuButtonBoundingClientRect: () => menuButton,
    })
    expect(syncApiHandlers['system.menuButton']!({})).toEqual(menuButton)
  })

  test('forwards title, color and loading mutations to the host chrome', () => {
    const events: Array<[string, Record<string, unknown>]> = []
    let shareMenuVisible = true
    const { apiHandlers: handlers } = createDevtoolApiHost({
      getSystemInfo: () => systemInfo,
      onNavigation: (action, params) => events.push([action, params]),
      onShareMenu: (visible) => { shareMenuVisible = visible },
    })
    handlers['navigation.title']!({ title: 'Details' })
    handlers['navigation.color']!({ frontColor: '#ffffff', backgroundColor: '#111111' })
    handlers['navigation.loading']!({ visible: true })
    handlers['navigation.loading']!({ visible: false })
    handlers['share.menu']!({ action: 'hideShareMenu' })
    expect(shareMenuVisible).toBe(false)
    handlers['share.menu']!({ action: 'showShareMenu' })
    expect(shareMenuVisible).toBe(true)

    expect(events).toEqual([
      ['title', { title: 'Details' }],
      ['color', { frontColor: '#ffffff', backgroundColor: '#111111' }],
      ['loading', { visible: true }],
      ['loading', { visible: false }],
    ])
  })

  test('page chrome APIs reach the host chrome', () => {
    const events: Array<[string, Record<string, unknown>]> = []
    const { apiHandlers: handlers } = createDevtoolApiHost({
      getSystemInfo: () => systemInfo,
      onNavigation: (action, params) => events.push([action, params]),
    })
    handlers['navigation.topBarText']!({ text: 'Top' })
    handlers['page.backgroundColor']!({ backgroundColor: '#f0f0f0' })
    handlers['page.backgroundTextStyle']!({ textStyle: 'light' })
    handlers['page.alertBeforeUnload']!({ message: 'Leave?' })
    handlers['page.disableAlertBeforeUnload']!({})

    expect(events).toEqual([
      ['topBarText', { text: 'Top' }],
      ['background', { backgroundColor: '#f0f0f0', backgroundColorTop: undefined, backgroundColorBottom: undefined }],
      ['backgroundTextStyle', { textStyle: 'light' }],
      ['alertBeforeUnload', { message: 'Leave?' }],
      ['disableAlertBeforeUnload', {}],
    ])
  })

  test('window size reaches the chrome', () => {
    const events: Array<[string, Record<string, unknown>]> = []
    const { apiHandlers: handlers } = createDevtoolApiHost({
      getSystemInfo: () => systemInfo,
      onNavigation: (action, params) => events.push([action, params]),
    })
    const result = handlers['page.setWindowSize']!({ width: 320, height: 640 })
    expect(result).toEqual({ errMsg: 'setWindowSize:ok' })
    expect(events).toEqual([['windowSize', { width: 320, height: 640 }]])
  })

  test('hideHomeButton reaches the chrome', () => {
    const events: Array<[string, Record<string, unknown>]> = []
    const { apiHandlers: handlers } = createDevtoolApiHost({
      getSystemInfo: () => systemInfo,
      onNavigation: (action, params) => events.push([action, params]),
    })
    handlers['page.hideHomeButton']!({})
    expect(events).toEqual([['hideHomeButton', {}]])
  })
})
