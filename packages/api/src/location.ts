import type { ApiHost, ApiContext } from './context'
import { callHost, runApi } from './run-api'

/**
 * `wx.getLocation` and the continuous location update.
 *
 * The browser owns the geolocation permission and the hardware; the host maps
 * `navigator.geolocation` onto WeChat's fields. Continuous updates arrive as
 * the `locationChange` / `locationChangeError` global events, so the app
 * registers with `wx.onLocationChange` like on WeChat.
 */
export function createLocationApi(context: ApiContext): ApiHost {
  return {
    getLocation: (params: unknown = {}) => runApi(params, 'getLocation', () => callHost(
      context,
      'location.get',
      params as Record<string, unknown>,
    )),
    getFuzzyLocation: (params: unknown = {}) => runApi(params, 'getFuzzyLocation', () => callHost(
      context,
      'location.fuzzy',
      params as Record<string, unknown>,
    )),
    startLocationUpdate: (params: unknown = {}) => runApi(params, 'startLocationUpdate', () => callHost(
      context,
      'location.start',
      params as Record<string, unknown>,
    )),
    stopLocationUpdate: (params: unknown = {}) => runApi(params, 'stopLocationUpdate', () => callHost(
      context,
      'location.stop',
    )),
  }
}
