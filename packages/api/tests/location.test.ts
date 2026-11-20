import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost, createGlobalEventHub } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const events = createGlobalEventHub()
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      if (method === 'location.fuzzy') {
        return Promise.resolve({ latitude: 31.23, longitude: 121.47, errMsg: 'getFuzzyLocation:ok' })
      }
      if (method === 'location.get') {
        return Promise.resolve({
          latitude: 31.23,
          longitude: 121.47,
          accuracy: 10,
          errMsg: 'getLocation:ok',
        })
      }
      if (method === 'sensor.start' || method === 'sensor.stop'
        || method === 'location.start' || method === 'location.stop') {
        return Promise.resolve({ errMsg: `${method}:ok` })
      }
      return Promise.resolve({})
    },
    callSync: () => undefined,
  }
  const context = {
    connection,
    events,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    launchOptions: {},
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ApiContext
  return {
    host: createApiHost(context) as unknown as Record<string, (...args: unknown[]) => any>,
    calls,
    events,
  }
}

describe('location', () => {
  test('getLocation forwards the host coordinates', async () => {
    const { host, calls } = createHost()
    await expect(host.getLocation({ type: 'gcj02' })).resolves.toMatchObject({
      latitude: 31.23,
      longitude: 121.47,
    })
    expect(calls[0]).toMatchObject({ method: 'location.get', params: { type: 'gcj02' } })
  })

  test('location updates start and stop the host watcher', async () => {
    const { host, calls } = createHost()
    const updates: unknown[] = []
    const errors: unknown[] = []
    host.onLocationChange((value: unknown) => updates.push(value))
    host.onLocationChangeError((value: unknown) => errors.push(value))

    await host.startLocationUpdate({})
    await host.stopLocationUpdate({})
    expect(calls.map((call) => call.method)).toEqual(['location.start', 'location.stop'])

    const { events } = createHost()
    void events
  })

  test('location events reach registered listeners through the hub', async () => {
    const { host, events } = createHost()
    const updates: unknown[] = []
    host.onLocationChange((value: unknown) => updates.push(value))
    events.emit('locationChange', { latitude: 1, longitude: 2 })
    expect(updates).toEqual([{ latitude: 1, longitude: 2 }])

    host.offLocationChange()
    events.emit('locationChange', { latitude: 3, longitude: 4 })
    expect(updates).toHaveLength(1)
  })
})

describe('sensors', () => {
  test('start and stop carry the sensor type and interval', async () => {
    const { host, calls } = createHost()
    await host.startAccelerometer({ interval: 'game' })
    await host.stopAccelerometer({})
    await host.startDeviceMotionListening({ interval: 'ui' })
    expect(calls).toEqual([
      { method: 'sensor.start', params: { type: 'accelerometer', interval: 'game' } },
      { method: 'sensor.stop', params: { type: 'accelerometer' } },
      { method: 'sensor.start', params: { type: 'deviceMotion', interval: 'ui' } },
    ])
  })

  test('sensor readings arrive through the global event hub', () => {
    const { host, events } = createHost()
    const readings: Array<{ x: number }> = []
    host.onAccelerometerChange((value: { x: number }) => readings.push(value))
    events.emit('accelerometerChange', { x: 0, y: 0, z: 1 })
    events.emit('compassChange', { direction: 90 })
    expect(readings).toEqual([{ x: 0, y: 0, z: 1 }])
  })

  test('getFuzzyLocation reports the coarse coordinates', async () => {
    const { host, calls } = createHost()
    await expect(host.getFuzzyLocation({})).resolves.toMatchObject({
      latitude: 31.23,
      longitude: 121.47,
    })
    expect(calls[0].method).toBe('location.fuzzy')
  })
})
