/**
 * Small device capabilities the browser can actually honour: the screen wake
 * lock, web fonts, network-quality changes and the software-keyboard height.
 *
 * Each handler degrades to an honest `:fail` when the platform API is missing
 * (desktop Safari has no Wake Lock, node has no `document.fonts`, ...).
 */

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

type WakeLockSentinel = { release(): Promise<void> }
type WakeLockLike = { request(type: 'screen'): Promise<WakeLockSentinel> }
type FontFaceLike = { load(): Promise<unknown> }
type FontRegistryLike = { add(face: unknown): void }
type ConnectionLike = {
  addEventListener(type: 'change', listener: () => void): void
  removeEventListener?(type: 'change', listener: () => void): void
  effectiveType?: string
  downlink?: number
  rtt?: number
}
type VisualViewportLike = {
  height: number
  addEventListener(type: 'resize', listener: () => void): void
  removeEventListener?(type: 'resize', listener: () => void): void
}

export type DeviceHandlerOptions = {
  emit: (name: string, payload?: unknown) => void
  wakeLock?: WakeLockLike
  createFontFace?: (family: string, source: string) => FontFaceLike
  fonts?: FontRegistryLike
  connection?: ConnectionLike
  viewport?: VisualViewportLike
  viewportHeight?: () => number
  now?: () => number
}

export function createDeviceHandlers(
  options: DeviceHandlerOptions,
): Record<string, (params: HandlerParams) => Promise<HandlerResult> | HandlerResult> {
  const wakeLock = options.wakeLock ?? readNavigator<WakeLockLike>('wakeLock')
  const fonts = options.fonts ?? (typeof document === 'undefined' ? undefined : document.fonts)
  const createFontFace = options.createFontFace ?? defaultCreateFontFace()
  const connection = options.connection ?? readNavigator<ConnectionLike>('connection')
  const viewport = options.viewport
    ?? (typeof window === 'undefined' ? undefined : window.visualViewport)

  let sentinel: WakeLockSentinel | undefined
  let lastViewportHeight: number | undefined

  if (connection && typeof connection.addEventListener === 'function') {
    const onConnectionChange = (): void => {
      const effectiveType = connection.effectiveType ?? ''
      const weak = effectiveType === 'slow-2g' || effectiveType === '2g'
      options.emit('networkWeakChange', {
        weakNetwork: weak,
        weakRTT: Number(connection.rtt ?? 0),
      })
    }
    connection.addEventListener('change', onConnectionChange)
  }

  if (viewport && typeof viewport.addEventListener === 'function') {
    lastViewportHeight = options.viewportHeight?.() ?? viewport.height
    const onViewportResize = (): void => {
      const height = Math.max(0, Math.round(viewport.height))
      if (height === lastViewportHeight) return
      lastViewportHeight = height
      options.emit('keyboardHeightChange', {
        height: Math.max(0, (options.viewportHeight?.() ?? height) - height),
        duration: 0,
      })
    }
    viewport.addEventListener('resize', onViewportResize)
  }

  return {
    'device.keepScreenOn': async (params) => {
      const keep = params.keepScreenOn !== false
      if (!keep) {
        if (!sentinel) return { errMsg: 'setKeepScreenOn:ok' }
        const current = sentinel
        sentinel = undefined
        try {
          await current.release()
          return { errMsg: 'setKeepScreenOn:ok' }
        } catch {
          return { errMsg: 'setKeepScreenOn:fail release failed' }
        }
      }
      if (!wakeLock) return { errMsg: 'setKeepScreenOn:fail wake lock is not available in this runtime' }
      try {
        sentinel = await wakeLock.request('screen')
        return { errMsg: 'setKeepScreenOn:ok' }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { errMsg: `setKeepScreenOn:fail ${message}` }
      }
    },
    'font.load': async (params) => {
      const family = String(params.family ?? '')
      const source = String(params.source ?? '')
      if (!family || !source) return { errMsg: 'loadFontFace:fail family and source are required' }
      if (!createFontFace || !fonts) {
        return { errMsg: 'loadFontFace:fail font loading is not available in this runtime' }
      }
      try {
        const face = createFontFace(family, source)
        await face.load()
        fonts.add(face)
        return { errMsg: 'loadFontFace:ok' }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { errMsg: `loadFontFace:fail ${message}` }
      }
    },
  }
}

function readNavigator<T>(property: string): T | undefined {
  if (typeof navigator === 'undefined') return undefined
  const value = (navigator as unknown as Record<string, unknown>)[property]
  return value && typeof value === 'object' ? value as T : undefined
}

function defaultCreateFontFace(): ((family: string, source: string) => FontFaceLike) | undefined {
  if (typeof FontFace === 'undefined') return undefined
  return (family, source) => new FontFace(family, `url(${JSON.stringify(source)})`)
}
