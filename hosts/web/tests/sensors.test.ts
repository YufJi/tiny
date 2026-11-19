import { describe, expect, test } from 'vitest'
import { createSensorHandlers } from '../src/sensors'

type Listener = (event: unknown) => void

function createTarget() {
  const listeners = new Map<string, Set<Listener>>()
  return {
    addEventListener(type: string, listener: Listener) {
      const set = listeners.get(type) ?? new Set<Listener>()
      set.add(listener)
      listeners.set(type, set)
    },
    removeEventListener(type: string, listener: Listener) {
      listeners.get(type)?.delete(listener)
    },
    dispatch(type: string, event: unknown) {
      for (const listener of [...(listeners.get(type) ?? [])]) listener(event)
    },
    count(type: string) {
      return listeners.get(type)?.size ?? 0
    },
  }
}

function createHandlers() {
  const target = createTarget()
  const emitted: Array<{ name: string; payload?: unknown }> = []
  const handlers = createSensorHandlers({
    emit: (name, payload) => emitted.push({ name, payload }),
    target: target as unknown as Parameters<typeof createSensorHandlers>[0]['target'],
  })
  return { handlers, target, emitted }
}

describe('sensor handlers', () => {
  test('accelerometer converts m/s² to g and stops on request', () => {
    const { handlers, target, emitted } = createHandlers()
    expect(handlers['sensor.start']({ type: 'accelerometer', interval: 0 })).toMatchObject({
      errMsg: 'startAccelerometer:ok',
    })
    target.dispatch('devicemotion', {
      accelerationIncludingGravity: { x: 9.80665, y: 0, z: 0 },
      rotationRate: { alpha: 0, beta: 0, gamma: 0 },
    })
    expect(emitted[0]).toMatchObject({ name: 'accelerometerChange' })
    expect((emitted[0].payload as { x: number }).x).toBeCloseTo(1, 5)

    handlers['sensor.stop']({ type: 'accelerometer' })
    target.dispatch('devicemotion', {
      accelerationIncludingGravity: { x: 9.80665, y: 0, z: 0 },
    })
    expect(emitted).toHaveLength(1)
    expect(target.count('devicemotion')).toBe(0)
  })

  test('compass uses the webkit heading when present', () => {
    const { handlers, target, emitted } = createHandlers()
    handlers['sensor.start']({ type: 'compass', interval: 0 })
    target.dispatch('deviceorientation', { alpha: 90, webkitCompassHeading: 42 })
    expect(emitted[0]).toMatchObject({
      name: 'compassChange',
      payload: { direction: 42, accuracy: 'high' },
    })

    target.dispatch('deviceorientation', { alpha: 90 })
    expect(emitted[1]).toMatchObject({
      name: 'compassChange',
      payload: { direction: 270, accuracy: 'medium' },
    })
  })

  test('device motion reports radians', () => {
    const { handlers, target, emitted } = createHandlers()
    handlers['sensor.start']({ type: 'deviceMotion', interval: 0 })
    target.dispatch('deviceorientation', { alpha: 180, beta: 0, gamma: 0 })
    const payload = emitted[0].payload as { alpha: number }
    expect(emitted[0].name).toBe('deviceMotionChange')
    expect(payload.alpha).toBeCloseTo(Math.PI, 5)
  })

  test('shared devicemotion listener survives one sensor stopping', () => {
    const { handlers, target } = createHandlers()
    handlers['sensor.start']({ type: 'accelerometer', interval: 0 })
    handlers['sensor.start']({ type: 'gyroscope', interval: 0 })
    expect(target.count('devicemotion')).toBe(1)
    handlers['sensor.stop']({ type: 'accelerometer' })
    expect(target.count('devicemotion')).toBe(1)
    handlers['sensor.stop']({ type: 'gyroscope' })
    expect(target.count('devicemotion')).toBe(0)
  })

  test('unknown sensor types fail instead of silently succeeding', () => {
    const { handlers } = createHandlers()
    expect(handlers['sensor.start']({ type: 'nope' })).toMatchObject({
      errMsg: 'startSensor:fail unknown sensor',
    })
    expect(handlers['sensor.stop']({ type: 'nope' })).toMatchObject({
      errMsg: 'stopSensor:fail unknown sensor',
    })
  })
})

describe('location handlers', () => {
  function createLocation() {
    const target = createTarget()
    const emitted: Array<{ name: string; payload?: unknown }> = []
    let positionCallback: ((position: unknown) => void) | undefined
    let errorCallback: ((error: unknown) => void) | undefined
    const cleared: number[] = []
    const geolocation = {
      getCurrentPosition(
        success: (position: unknown) => void,
        failure: (error: unknown) => void,
      ) {
        current = { success, failure }
      },
      watchPosition(
        success: (position: unknown) => void,
        failure: (error: unknown) => void,
      ) {
        positionCallback = success
        errorCallback = failure
        return 7
      },
      clearWatch(id: number) {
        cleared.push(id)
      },
    }
    let current: { success: (position: unknown) => void; failure: (error: unknown) => void } | undefined
    const handlers = createSensorHandlers({
      emit: (name, payload) => emitted.push({ name, payload }),
      target: target as unknown as Parameters<typeof createSensorHandlers>[0]['target'],
      geolocation: geolocation as unknown as Geolocation,
    })
    return {
      handlers,
      emitted,
      geolocation,
      cleared,
      get current() { return current },
      positionCallback: () => positionCallback,
      errorCallback: () => errorCallback,
    }
  }

  test('getLocation maps coordinates and permission failures', async () => {
    const test = createLocation()
    const pending = test.handlers['location.get']({}) as Promise<Record<string, unknown>>
    test.current?.success({ coords: { latitude: 1, longitude: 2, accuracy: 3 } })
    await expect(pending).resolves.toMatchObject({
      latitude: 1,
      longitude: 2,
      accuracy: 3,
      errMsg: 'getLocation:ok',
    })

    const denied = test.handlers['location.get']({}) as Promise<Record<string, unknown>>
    test.current?.failure({ code: 1 })
    await expect(denied).resolves.toEqual({ errMsg: 'getLocation:fail auth deny' })
  })

  test('location updates emit global events and stop the watcher', () => {
    const test = createLocation()
    expect(test.handlers['location.start']({ type: 'gcj02' })).toMatchObject({
      errMsg: 'startLocationUpdate:ok',
    })
    test.positionCallback()?.({ coords: { latitude: 5, longitude: 6, accuracy: 1 } })
    expect(test.emitted[0]).toMatchObject({
      name: 'locationChange',
      payload: { latitude: 5, longitude: 6 },
    })

    test.errorCallback()?.({ code: 3 })
    expect(test.emitted[1]).toMatchObject({ name: 'locationChangeError' })

    expect(test.handlers['location.stop']({})).toMatchObject({ errMsg: 'stopLocationUpdate:ok' })
    expect(test.cleared).toEqual([7])
  })
})
