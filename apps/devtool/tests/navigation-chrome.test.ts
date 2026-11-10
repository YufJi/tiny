import { describe, expect, test } from 'vitest'
import { createDevtoolApiHost } from '../src/host-api'

const systemInfo = {
  SDKVersion: '3.0.0',
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
})
