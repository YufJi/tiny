/**
 * Location and motion sensors.
 *
 * Browser events arrive on `window`; the host forwards them as global events
 * (`accelerometerChange`, `locationChange`, ...) that the service's event hub
 * turns into `wx.onXXX` callbacks. Sensors only listen while the mini program
 * asked for them, so an idle page costs nothing.
 *
 * Units follow WeChat: accelerometer in g, gyroscope in deg/s, device motion in
 * radians, compass in degrees.
 */

export type GlobalEventEmitter = (name: string, payload?: unknown) => void

type EventTargetLike = {
  addEventListener(type: string, listener: (event: never) => void, options?: unknown): void
  removeEventListener(type: string, listener: (event: never) => void, options?: unknown): void
}

export type SensorHandlerOptions = {
  emit: GlobalEventEmitter
  target?: EventTargetLike
  geolocation?: Geolocation
  now?: () => number
}

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

type SensorType = 'accelerometer' | 'compass' | 'gyroscope' | 'deviceMotion'

const GRAVITY = 9.80665

const SENSOR_EVENTS: Record<SensorType, string> = {
  accelerometer: 'accelerometerChange',
  compass: 'compassChange',
  gyroscope: 'gyroscopeChange',
  deviceMotion: 'deviceMotionChange',
}

const SENSOR_APIS: Record<SensorType, string> = {
  accelerometer: 'Accelerometer',
  compass: 'Compass',
  gyroscope: 'Gyroscope',
  deviceMotion: 'DeviceMotionListening',
}

const INTERVAL_MS: Record<string, number> = { normal: 200, game: 20, ui: 60 }

function intervalOf(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value)
  if (typeof value === 'string') return INTERVAL_MS[value] ?? 200
  return 200
}

export function createSensorHandlers(
  options: SensorHandlerOptions,
): Record<string, (params: HandlerParams) => Promise<HandlerResult> | HandlerResult> {
  const target = options.target ?? (globalThis as unknown as EventTargetLike)
  const geolocation = options.geolocation
    ?? (typeof navigator === 'undefined' ? undefined : navigator.geolocation)
  const now = options.now ?? (() => Date.now())

  const active = new Set<SensorType>()
  const intervals = new Map<SensorType, number>()
  const lastEmit = new Map<SensorType, number>()
  let motionListener: ((event: unknown) => void) | undefined
  let orientationListener: ((event: unknown) => void) | undefined
  let watchId: number | undefined

  const shouldEmit = (type: SensorType): boolean => {
    const at = now()
    const last = lastEmit.get(type) ?? 0
    if (at - last < (intervals.get(type) ?? 200)) return false
    lastEmit.set(type, at)
    return true
  }

  const onMotion = (event: unknown): void => {
    const motion = event as {
      accelerationIncludingGravity?: { x?: number | null; y?: number | null; z?: number | null }
      rotationRate?: { alpha?: number | null; beta?: number | null; gamma?: number | null }
    }
    if (active.has('accelerometer') && shouldEmit('accelerometer')) {
      const value = motion.accelerationIncludingGravity
      options.emit(SENSOR_EVENTS.accelerometer, {
        x: (value?.x ?? 0) / GRAVITY,
        y: (value?.y ?? 0) / GRAVITY,
        z: (value?.z ?? 0) / GRAVITY,
      })
    }
    if (active.has('gyroscope') && shouldEmit('gyroscope')) {
      const value = motion.rotationRate
      options.emit(SENSOR_EVENTS.gyroscope, {
        x: value?.beta ?? 0,
        y: value?.gamma ?? 0,
        z: value?.alpha ?? 0,
      })
    }
  }

  const onOrientation = (event: unknown): void => {
    const orientation = event as {
      alpha?: number | null
      beta?: number | null
      gamma?: number | null
      webkitCompassHeading?: number
    }
    const alpha = orientation.alpha ?? 0
    if (active.has('deviceMotion') && shouldEmit('deviceMotion')) {
      options.emit(SENSOR_EVENTS.deviceMotion, {
        alpha: (alpha * Math.PI) / 180,
        beta: ((orientation.beta ?? 0) * Math.PI) / 180,
        gamma: ((orientation.gamma ?? 0) * Math.PI) / 180,
      })
    }
    if (active.has('compass') && shouldEmit('compass')) {
      const heading = typeof orientation.webkitCompassHeading === 'number'
        ? orientation.webkitCompassHeading
        : (360 - alpha) % 360
      options.emit(SENSOR_EVENTS.compass, {
        direction: Number(heading.toFixed(1)),
        accuracy: typeof orientation.webkitCompassHeading === 'number' ? 'high' : 'medium',
      })
    }
  }

  const ensureMotion = (): void => {
    if (!motionListener) {
      motionListener = onMotion
      target.addEventListener('devicemotion', motionListener as (event: never) => void)
    }
  }

  const ensureOrientation = (): void => {
    if (!orientationListener) {
      orientationListener = onOrientation
      target.addEventListener('deviceorientation', orientationListener as (event: never) => void)
    }
  }

  const start = (params: HandlerParams): HandlerResult => {
    const type = params.type as SensorType
    if (!SENSOR_EVENTS[type]) return { errMsg: 'startSensor:fail unknown sensor' }
    active.add(type)
    intervals.set(type, intervalOf(params.interval))
    if (type === 'accelerometer' || type === 'gyroscope') ensureMotion()
    if (type === 'compass' || type === 'deviceMotion') ensureOrientation()
    return { errMsg: `start${SENSOR_APIS[type]}:ok` }
  }

  const stop = (params: HandlerParams): HandlerResult => {
    const type = params.type as SensorType
    if (!SENSOR_EVENTS[type]) return { errMsg: 'stopSensor:fail unknown sensor' }
    active.delete(type)
    const needsMotion = active.has('accelerometer') || active.has('gyroscope')
    if (!needsMotion && motionListener) {
      target.removeEventListener('devicemotion', motionListener as (event: never) => void)
      motionListener = undefined
    }
    const needsOrientation = active.has('compass') || active.has('deviceMotion')
    if (!needsOrientation && orientationListener) {
      target.removeEventListener('deviceorientation', orientationListener as (event: never) => void)
      orientationListener = undefined
    }
    return { errMsg: `stop${SENSOR_APIS[type]}:ok` }
  }

  const positionPayload = (position: GeolocationPosition): Record<string, unknown> => {
    const coords = position.coords
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      speed: coords.speed ?? 0,
      accuracy: coords.accuracy ?? 0,
      altitude: coords.altitude ?? 0,
      verticalAccuracy: coords.altitudeAccuracy ?? 0,
      horizontalAccuracy: coords.accuracy ?? 0,
    }
  }

  const locationError = (error: GeolocationPositionError): string => {
    if (error.code === 1) return 'auth deny'
    if (error.code === 3) return 'timeout'
    return 'position unavailable'
  }

  return {
    'sensor.start': start,
    'sensor.stop': stop,
    'location.get': (params) => new Promise<HandlerResult>((resolve) => {
      if (!geolocation) {
        resolve({ errMsg: 'getLocation:fail geolocation is not available in this runtime' })
        return
      }
      geolocation.getCurrentPosition(
        (position) => resolve({ ...positionPayload(position), errMsg: 'getLocation:ok' }),
        (error) => resolve({ errMsg: `getLocation:fail ${locationError(error)}` }),
        {
          enableHighAccuracy: params.altitude === true || params.isHighAccuracy === true,
          timeout: Number(params.timeout ?? 10000),
        },
      )
    }),
    'location.start': (params) => {
      if (!geolocation) {
        return { errMsg: 'startLocationUpdate:fail geolocation is not available in this runtime' }
      }
      if (watchId !== undefined) return { errMsg: 'startLocationUpdate:ok' }
      watchId = geolocation.watchPosition(
        (position) => options.emit('locationChange', positionPayload(position)),
        (error) => options.emit('locationChangeError', {
          errMsg: `locationChange:fail ${locationError(error)}`,
        }),
        { enableHighAccuracy: params.type === 'gcj02' ? true : false, timeout: 10000 },
      )
      return { errMsg: 'startLocationUpdate:ok' }
    },
    'location.fuzzy': (params) => new Promise<HandlerResult>((resolve) => {
      if (!geolocation) {
        resolve({ errMsg: 'getFuzzyLocation:fail geolocation is not available in this runtime' })
        return
      }
      geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: Math.round(position.coords.latitude * 100) / 100,
          longitude: Math.round(position.coords.longitude * 100) / 100,
          errMsg: 'getFuzzyLocation:ok',
        }),
        (error) => resolve({ errMsg: `getFuzzyLocation:fail ${locationError(error)}` }),
        { enableHighAccuracy: false, timeout: Number(params.timeout ?? 10000) },
      )
    }),
    'location.stop': () => {
      if (watchId !== undefined && geolocation) {
        geolocation.clearWatch(watchId)
        watchId = undefined
      }
      return { errMsg: 'stopLocationUpdate:ok' }
    },
  }
}
