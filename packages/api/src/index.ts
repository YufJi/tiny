import type { MiniProgramApiHost, ServiceApiContext } from '@tiny/runtime'
import { createCanvasApi } from './canvas'
import { createDeviceApi } from './device'
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

/**
 * The WeChat-compatible API table for a `@tiny/runtime` service thread.
 *
 * The kernel knows nothing about `wx.*`: it installs whatever this factory
 * returns and reports the rest through `UNSUPPORTED_API`. Hosts compose this
 * set with their own device facts:
 *
 * ```ts
 * apiHost: (context) => ({ ...createApiHost(context), ...hostFacts })
 * ```
 *
 * Each domain lives in its own module so growing the surface never touches the
 * runtime; adding one API means adding a property to the matching module.
 */
export function createApiHost(context: ServiceApiContext): MiniProgramApiHost {
  return {
    ...createSystemApi(context),
    ...createStorageApi(context),
    ...createNavigationApi(context),
    ...createUiApi(context),
    ...createTabBarApi(context),
    ...createNetworkApi(context),
    ...createDeviceApi(context),
    ...createShareApi(context),
    ...createCanvasApi(context),
    ...createQueryApi(context),
    ...createFileSystemApi(),
  }
}
