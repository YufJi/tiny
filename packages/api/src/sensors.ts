import type { ApiHost, ApiContext } from './context'
import { callHost, runApi } from './run-api'

/**
 * Accelerometer, compass, gyroscope and device-motion listeners.
 *
 * `start*` tells the host to subscribe to the browser sensor; the readings
 * arrive as `accelerometerChange` and friends, which the app receives through
 * `wx.onAccelerometerChange`. `stop*` detaches the host listener again.
 */
const SENSORS = [
  ['Accelerometer', 'accelerometer'],
  ['Compass', 'compass'],
  ['Gyroscope', 'gyroscope'],
  ['DeviceMotionListening', 'deviceMotion'],
] as const

export function createSensorApi(context: ApiContext): ApiHost {
  const api: ApiHost = {}
  for (const [name, type] of SENSORS) {
    api[`start${name}`] = (params: unknown = {}) => runApi(params, `start${name}`, () => callHost(
      context,
      'sensor.start',
      { type, interval: (params as { interval?: unknown }).interval },
    ))
    api[`stop${name}`] = (params: unknown = {}) => runApi(params, `stop${name}`, () => callHost(
      context,
      'sensor.stop',
      { type },
    ))
  }
  return api
}
