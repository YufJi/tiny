import type { ApiHost } from './context'

/**
 * Platform capabilities Tiny has no backend for, kept as explicit stubs.
 *
 * `canIUse` reports these as false (see STUB_APIS), but the official WeChat
 * demo calls some of them while booting a page, so the call shape must exist:
 * a missing function would abort the page instead of taking its fallback path.
 */
export function createCompatStubs(): ApiHost {
  const noop = () => undefined
  const peripheralServer = {
    onConnectionStateChange: noop,
    offConnectionStateChange: noop,
    startAdvertising: noop,
    stopAdvertising: noop,
    close: noop,
  }
  // A no-op handle: worker methods are resolved lazily so the compatibility
  // stub does not enumerate a host-looking API surface.
  const worker = new Proxy({}, {
    get: (_target, property) => (property === 'then' ? undefined : noop),
  })
  return {
    getScreenBrightness: () => ({ errMsg: 'getScreenBrightness:fail not implemented' }),
    setScreenBrightness: noop,
    createBLEPeripheralServer: () => peripheralServer,
    onBLEPeripheralConnectionStateChanged: noop,
    offBLEPeripheralConnectionStateChanged: noop,
    onLocalServiceFound: noop,
    offLocalServiceFound: noop,
    onLocalServiceLost: noop,
    offLocalServiceLost: noop,
    onLocalServiceResolveFail: noop,
    offLocalServiceResolveFail: noop,
    onLocalServiceDiscoveryStop: noop,
    offLocalServiceDiscoveryStop: noop,
    startLocalServiceDiscovery: noop,
    stopLocalServiceDiscovery: noop,
    createWorker: () => worker,
  }
}
