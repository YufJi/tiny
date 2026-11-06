import type { ApiHost, ApiContext } from './context'
import { callHost, runApi } from './run-api'

/**
 * Network and battery APIs. The host owns `fetch`, `navigator` and the
 * battery/navigator primitives; the service side keeps only the mini-program
 * call shape (including `request` returning an abort handle).
 */
export function createNetworkApi(context: ApiContext): ApiHost {
  return {
    getNetworkType: (params: unknown = {}) => runApi(params, 'getNetworkType', () => callHost(
      context,
      'network.type',
    )),
    getBatteryInfo: (params: unknown = {}) => runApi(params, 'getBatteryInfo', () => callHost(
      context,
      'battery.get',
    )),
    request: (params: unknown = {}) => {
      void runApi(params, 'request', () => callHost(
        context,
        'network.request',
        params as Record<string, unknown>,
      ))
      // The host request can not be cancelled yet; keep the handle shape.
      return { abort: () => undefined }
    },
  }
}
