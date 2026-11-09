import type { ApiContext, ApiHost } from './context'
import { createCanvasApi } from './canvas'
import { createDeviceApi } from './device'
import { createEncodingApi } from './encoding'
import { createFileSystemApi } from './filesystem'
import { createNavigationApi } from './navigation'
import { createNetworkApi } from './network'
import { createQueryApi } from './query'
import { createShareApi } from './share'
import { createStorageApi } from './storage'
import { createSystemApi } from './system'
import { createTabBarApi } from './tabbar'
import { createUiApi } from './ui'

export type { ApiCallbacks } from './run-api'
export { createEventChannelPair } from './event-channel'
export type { EventChannel, EventChannelHandler, EventChannelPair } from './event-channel'
export type {
  HostApiHandler,
  HostApiHandlers,
  HostApiParams,
  StorageValues,
  SyncApiHandlers,
  SystemInfo,
} from './host'
export type { AssetUrlResolver } from '@tiny/manifest'
export type {
  CanvasMeasurement,
  CanvasNodeHandle,
  CanvasNodeOptions,
  CanvasNodeRequest,
  LegacyCanvasRequest,
  QueryNodeSnapshot,
  ServiceCanvasAdapter,
  TabBarApi,
  ApiContext,
  ApiHost,
} from './context'

/**
 * Build the WeChat-compatible `wx` table for one service thread.
 *
 * The host entry owns this call: it creates the bridge connection, composes the
 * context from host facts and late-bound runtime accessors, and passes the
 * resulting table to `bootServiceThread`. The runtime installs whatever it
 * receives and reports unknown `wx.*` names through `UNSUPPORTED_API`.
 *
 * `extensions` keeps host-specific APIs in the same table so `canIUse` sees
 * them; each domain lives in its own module so growing the surface never
 * touches the runtime.
 */
export function createApiHost(
  context: ApiContext,
  extensions: ApiHost = {},
): ApiHost {
  const available = new Set<string>()
  // Inherit (not spread) so late-bound accessors the host defined as getters
  // (`pageId`, `tabBar`, ...) stay live after the runtime boots.
  const apiContext: ApiContext = Object.create(context)
  apiContext.hasApi = (name) => available.has(name)
  const table: ApiHost = {
    ...createSystemApi(apiContext),
    ...createStorageApi(apiContext),
    ...createNavigationApi(apiContext),
    ...createUiApi(apiContext),
    ...createTabBarApi(apiContext),
    ...createNetworkApi(apiContext),
    ...createDeviceApi(apiContext),
    ...createEncodingApi(apiContext),
    ...createShareApi(apiContext),
    ...createCanvasApi(apiContext),
    ...createQueryApi(apiContext),
    ...createFileSystemApi(),
    ...extensions,
  }
  for (const name of Object.keys(table)) available.add(name)
  return table
}
