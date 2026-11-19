/**
 * `wx.createInnerAudioContext` over a single `HTMLAudioElement`.
 *
 * The host owns playback and reports state changes as `audioStateChange` global
 * events; the service handle filters them by audio id. Autoplay policies mean a
 * `play()` may reject before a user gesture — that surfaces as `onError`, not as
 * a silent no-op.
 */

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

export type AudioElementLike = {
  src: string
  loop: boolean
  volume: number
  currentTime: number
  duration: number
  paused: boolean
  play(): Promise<void> | void
  pause(): void
  addEventListener(type: string, listener: () => void): void
  removeEventListener?(type: string, listener: () => void): void
}

export type AudioHandlerOptions = {
  emit: (name: string, payload?: unknown) => void
  createAudio?: (src: string) => AudioElementLike
}

const AUDIO_EVENTS = [
  'play', 'pause', 'ended', 'timeupdate', 'canplay', 'error',
  'seeking', 'seeked', 'waiting',
] as const

export function createAudioHandlers(
  options: AudioHandlerOptions,
): Record<string, (params: HandlerParams) => Promise<HandlerResult> | HandlerResult> {
  const createAudio = options.createAudio ?? defaultCreateAudio()
  const elements = new Map<string, { element: AudioElementLike; detach: () => void }>()

  type EnsureResult = { ok: true; element: AudioElementLike } | { ok: false; result: HandlerResult }

  const ensure = (params: HandlerParams): EnsureResult => {
    const audioId = String(params.audioId ?? '')
    if (!audioId) return { ok: false, result: { errMsg: 'innerAudioContext:fail audioId is required' } }
    const existing = elements.get(audioId)
    if (existing) return { ok: true, element: existing.element }
    if (!createAudio) {
      return {
        ok: false,
        result: { errMsg: 'innerAudioContext:fail audio playback is not available in this runtime' },
      }
    }
    const element = createAudio(String(params.src ?? ''))
    element.src = String(params.src ?? '')
    element.loop = params.loop === true
    if (typeof params.volume === 'number') element.volume = clampVolume(params.volume)
    const detach = (): void => {
      for (const type of AUDIO_EVENTS) {
        element.removeEventListener?.(type, listeners[type])
      }
    }
    const listeners: Record<string, () => void> = {}
    for (const type of AUDIO_EVENTS) {
      listeners[type] = () => {
        const payload: Record<string, unknown> = {
          audioId,
          type: type === 'timeupdate' ? 'timeUpdate' : type,
        }
        if (type === 'timeupdate' || type === 'ended') {
          payload.currentTime = element.currentTime
          payload.duration = Number.isFinite(element.duration) ? element.duration : 0
        }
        if (type === 'canplay') payload.duration = Number.isFinite(element.duration) ? element.duration : 0
        if (type === 'error') payload.errMsg = 'innerAudioContext:fail playback error'
        options.emit('audioStateChange', payload)
      }
      element.addEventListener(type, listeners[type])
    }
    elements.set(audioId, { element, detach })
    return { ok: true, element }
  }

  return {
    'audio.create': (params) => {
      const created = ensure(params)
      return created.ok ? { errMsg: 'innerAudioContext:ok' } : created.result
    },
    'audio.play': async (params) => {
      const created = ensure(params)
      if (!created.ok) return created.result
      try {
        await created.element.play()
        return { errMsg: 'innerAudioContext:ok' }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { errMsg: `innerAudioContext:fail ${message}` }
      }
    },
    'audio.pause': (params) => {
      const entry = elements.get(String(params.audioId ?? ''))
      entry?.element.pause()
      return { errMsg: 'innerAudioContext:ok' }
    },
    'audio.stop': (params) => {
      const entry = elements.get(String(params.audioId ?? ''))
      if (entry) {
        entry.element.pause()
        entry.element.currentTime = 0
        options.emit('audioStateChange', { audioId: String(params.audioId ?? ''), type: 'stop' })
      }
      return { errMsg: 'innerAudioContext:ok' }
    },
    'audio.seek': (params) => {
      const entry = elements.get(String(params.audioId ?? ''))
      if (entry) entry.element.currentTime = Number(params.position ?? 0)
      return { errMsg: 'innerAudioContext:ok' }
    },
    'audio.setVolume': (params) => {
      const entry = elements.get(String(params.audioId ?? ''))
      if (entry) entry.element.volume = clampVolume(Number(params.volume ?? 1))
      return { errMsg: 'innerAudioContext:ok' }
    },
    'audio.setSrc': (params) => {
      const entry = elements.get(String(params.audioId ?? ''))
      if (entry) entry.element.src = String(params.src ?? '')
      return { errMsg: 'innerAudioContext:ok' }
    },
    'audio.destroy': (params) => {
      const audioId = String(params.audioId ?? '')
      const entry = elements.get(audioId)
      if (entry) {
        entry.element.pause()
        entry.detach()
        elements.delete(audioId)
      }
      return { errMsg: 'innerAudioContext:ok' }
    },
  }
}

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(1, Math.max(0, value))
}

function defaultCreateAudio(): ((src: string) => AudioElementLike) | undefined {
  if (typeof Audio === 'undefined') return undefined
  return (src) => {
    const element = new Audio()
    element.preload = 'auto'
    if (src) element.src = src
    return element as unknown as AudioElementLike
  }
}
