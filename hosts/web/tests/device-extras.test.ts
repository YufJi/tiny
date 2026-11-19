import { describe, expect, test } from 'vitest'
import { createDeviceHandlers } from '../src/device-extras'

function createWakeLock() {
  const released: number[] = []
  let requests = 0
  const wakeLock = {
    async request() {
      requests += 1
      return {
        async release() {
          released.push(requests)
        },
      }
    },
  }
  return { wakeLock, released, requests: () => requests }
}

describe('keep screen on', () => {
  test('acquires once and releases on request', async () => {
    const { wakeLock, released, requests } = createWakeLock()
    const handlers = createDeviceHandlers({ emit: () => undefined, wakeLock })
    await expect(handlers['device.keepScreenOn']({ keepScreenOn: true })).resolves.toEqual({
      errMsg: 'setKeepScreenOn:ok',
    })
    expect(requests()).toBe(1)
    await expect(handlers['device.keepScreenOn']({ keepScreenOn: false })).resolves.toEqual({
      errMsg: 'setKeepScreenOn:ok',
    })
    expect(released).toEqual([1])
  })

  test('fails honestly without the Wake Lock API', async () => {
    const handlers = createDeviceHandlers({ emit: () => undefined, wakeLock: undefined })
    await expect(handlers['device.keepScreenOn']({ keepScreenOn: true })).resolves.toEqual({
      errMsg: 'setKeepScreenOn:fail wake lock is not available in this runtime',
    })
  })
})

describe('fonts', () => {
  test('loads and registers the face', async () => {
    const added: unknown[] = []
    const handlers = createDeviceHandlers({
      emit: () => undefined,
      createFontFace: (family, source) => ({
        family,
        source,
        async load() {
          return this
        },
      }),
      fonts: { add: (face) => added.push(face) },
    })
    await expect(handlers['font.load']({
      family: 'MyFont',
      source: 'url("https://example.com/f.woff2")',
    })).resolves.toEqual({ errMsg: 'loadFontFace:ok' })
    expect(added[0]).toMatchObject({ family: 'MyFont' })
  })

  test('fails without family/source or a font registry', async () => {
    const handlers = createDeviceHandlers({ emit: () => undefined })
    await expect(handlers['font.load']({ family: 'x' })).resolves.toMatchObject({
      errMsg: 'loadFontFace:fail family and source are required',
    })
    await expect(handlers['font.load']({ family: 'x', source: 'url(a)' })).resolves.toMatchObject({
      errMsg: expect.stringContaining('loadFontFace:fail'),
    })
  })
})

describe('network quality and keyboard', () => {
  test('connection changes emit networkWeakChange', () => {
    const emitted: Array<{ name: string; payload?: unknown }> = []
    let listener: (() => void) | undefined
    const connection = {
      effectiveType: '2g',
      rtt: 900,
      addEventListener(_type: 'change', next: () => void) {
        listener = next
      },
    }
    createDeviceHandlers({ emit: (name, payload) => emitted.push({ name, payload }), connection })
    listener?.()
    expect(emitted[0]).toEqual({
      name: 'networkWeakChange',
      payload: { weakNetwork: true, weakRTT: 900 },
    })
  })

  test('viewport shrink emits the keyboard height delta', () => {
    const emitted: Array<{ name: string; payload?: unknown }> = []
    let listener: (() => void) | undefined
    let height = 800
    const viewport = {
      get height() {
        return height
      },
      addEventListener(_type: 'resize', next: () => void) {
        listener = next
      },
    }
    createDeviceHandlers({
      emit: (name, payload) => emitted.push({ name, payload }),
      viewport,
      viewportHeight: () => 800,
    })
    height = 500
    listener?.()
    expect(emitted[0]).toEqual({
      name: 'keyboardHeightChange',
      payload: { height: 300, duration: 0 },
    })
  })

  test('battery changes emit batteryInfoChange', async () => {
    const emitted: Array<{ name: string; payload?: unknown }> = []
    const listeners: Array<() => void> = []
    const battery = {
      level: 0.42,
      charging: true,
      addEventListener(_type: string, listener: () => void) {
        listeners.push(listener)
      },
    }
    createDeviceHandlers({
      emit: (name, payload) => emitted.push({ name, payload }),
      getBattery: async () => battery,
    })
    await Promise.resolve()
    await Promise.resolve()
    battery.level = 0.31
    for (const listener of listeners) listener()
    expect(emitted).toContainEqual({
      name: 'batteryInfoChange',
      payload: { level: 31, isCharging: true },
    })
  })

  test('battery snapshot is available synchronously after a change', async () => {
    const listeners: Array<() => void> = []
    const battery = {
      level: 0.66,
      charging: false,
      addEventListener(_type: string, listener: () => void) {
        listeners.push(listener)
      },
    }
    const handlers = createDeviceHandlers({
      emit: () => undefined,
      getBattery: async () => battery,
    })
    await Promise.resolve()
    await Promise.resolve()
    expect(handlers['battery.infoSync']({})).toEqual({ level: 66, isCharging: false })
  })
})
