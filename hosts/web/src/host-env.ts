/**
 * Host facts that are not device sensors: ext config, the renderer user agent,
 * HEVC support and the app authorization snapshot.
 *
 * `getAppAuthorizeSetting` is synchronous in WeChat, so the browser host keeps a
 * cache that the Permissions API updates in the background; before the first
 * answer every permission reads `not determined`.
 */

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

type PermissionState = 'authorized' | 'denied' | 'not determined'
type PermissionStatusLike = { state: string; onchange?: (() => void) | null }
type PermissionsLike = { query(descriptor: { name: string }): Promise<PermissionStatusLike> }

export type EnvHandlerOptions = {
  userAgent?: string
  permissions?: PermissionsLike
  canPlayHevc?: () => boolean
}

type AuthorizePermissionKey = 'locationAuthorized' | 'cameraAuthorized' | 'microphoneAuthorized'

const AUTHORIZE_KEYS: Array<[AuthorizePermissionKey, string]> = [
  ['locationAuthorized', 'geolocation'],
  ['cameraAuthorized', 'camera'],
  ['microphoneAuthorized', 'microphone'],
]

type AuthorizeSetting = {
  albumAuthorized: PermissionState
  bluetoothAuthorized: PermissionState
  cameraAuthorized: PermissionState
  locationAuthorized: PermissionState
  locationReducedAccuracy: boolean
  microphoneAuthorized: PermissionState
  notificationAuthorized: PermissionState
  phoneCalendarAuthorized: PermissionState
}

function emptySetting(): AuthorizeSetting {
  return {
    albumAuthorized: 'not determined',
    bluetoothAuthorized: 'not determined',
    cameraAuthorized: 'not determined',
    locationAuthorized: 'not determined',
    locationReducedAccuracy: false,
    microphoneAuthorized: 'not determined',
    notificationAuthorized: 'not determined',
    phoneCalendarAuthorized: 'not determined',
  }
}

export function createEnvHandlers(
  options: EnvHandlerOptions = {},
): Record<string, (params: HandlerParams) => HandlerResult> {
  const setting = emptySetting()
  const permissions = options.permissions ?? readNavigator<PermissionsLike>('permissions')
  if (permissions && typeof permissions.query === 'function') {
    for (const [key, name] of AUTHORIZE_KEYS) {
      void permissions.query({ name }).then((status) => {
        setting[key] = mapPermissionState(status.state)
        status.onchange = () => {
          setting[key] = mapPermissionState(status.state)
        }
      }).catch(() => undefined)
    }
  }
  const canPlayHevc = options.canPlayHevc ?? defaultCanPlayHevc()

  return {
    // A normal mini program has no third-party ext config; `{}` is the honest
    // answer, not a missing feature.
    'account.extConfig': () => ({}),
    'env.userAgent': () => ({
      userAgent: options.userAgent ?? readNavigator<{ userAgent?: string }>('userAgent') ?? '',
    }),
    'media.hevcSupport': () => {
      const support = canPlayHevc()
      return { supportHevc: support, hevcHardware: support }
    },
    'permissions.setting': () => ({ ...setting }),
  }
}

function mapPermissionState(state: string): PermissionState {
  if (state === 'granted') return 'authorized'
  if (state === 'denied') return 'denied'
  return 'not determined'
}

function readNavigator<T>(property: string): T | undefined {
  if (typeof navigator === 'undefined') return undefined
  const value = property === 'userAgent'
    ? (navigator as unknown as { userAgent?: string }).userAgent
    : (navigator as unknown as Record<string, unknown>)[property]
  if (typeof value === 'string') return { userAgent: value } as unknown as T
  return value && typeof value === 'object' ? value as T : undefined
}

function defaultCanPlayHevc(): () => boolean {
  return () => {
    if (typeof MediaSource !== 'undefined' && typeof MediaSource.isTypeSupported === 'function') {
      return MediaSource.isTypeSupported('video/mp4; codecs="hvc1.1.6.L93.B0"')
    }
    if (typeof document !== 'undefined') {
      const video = document.createElement('video')
      return video.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"') !== ''
    }
    return false
  }
}
