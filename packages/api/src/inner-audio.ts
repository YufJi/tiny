import type { ApiContext, ApiHost } from './context'
import { callHost } from './run-api'

/**
 * `wx.createInnerAudioContext()`.
 *
 * Playback is host-owned (an `HTMLAudioElement`); the handle keeps WeChat's
 * property/method/event shape and mirrors state from `audioStateChange` global
 * events. Browser autoplay policy can still reject `play()` before a user
 * gesture — that arrives as `onError`, not as silence.
 */

const AUDIO_EVENTS = [
  'play', 'pause', 'stop', 'ended', 'timeUpdate', 'canplay', 'error',
  'seeking', 'seeked', 'waiting',
] as const

type AudioEvent = { type?: string; currentTime?: number; duration?: number; errMsg?: string }
type Listener = (event: AudioEvent) => void

export function createInnerAudioApi(context: ApiContext): ApiHost {
  return {
    createInnerAudioContext: () => createInnerAudioContext(context),
  }
}

function createInnerAudioContext(context: ApiContext): Record<string, unknown> {
  const audioId = `wx-audio-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const listeners = new Map<string, Set<Listener>>()
  const state = {
    src: '',
    volume: 1,
    loop: false,
    autoplay: false,
    duration: 0,
    currentTime: 0,
    paused: true,
  }
  let created = false
  let destroyed = false

  const emitTo = (type: string, event: AudioEvent): void => {
    for (const listener of listeners.get(type) ?? []) listener(event)
  }

  const unsubscribe = context.events?.on('audioStateChange', (payload) => {
    if (destroyed) return
    const event = payload as (AudioEvent & { audioId?: unknown }) | undefined
    if (event?.audioId !== audioId || typeof event.type !== 'string') return
    if (event.type === 'play') state.paused = false
    if (event.type === 'pause' || event.type === 'stop' || event.type === 'ended') state.paused = true
    if (typeof event.duration === 'number' && event.duration > 0) state.duration = event.duration
    if (typeof event.currentTime === 'number') state.currentTime = event.currentTime
    emitTo(event.type, event)
  })

  const send = (method: string, payload: Record<string, unknown> = {}): void => {
    if (destroyed) return
    void callHost(context, `audio.${method}`, { audioId, ...payload })
  }

  const ensureCreated = (): void => {
    if (created || destroyed) return
    created = true
    send('create', { src: state.src, loop: state.loop, volume: state.volume })
  }

  const play = (): void => {
    if (destroyed) return
    ensureCreated()
    state.paused = false
    send('play', { src: state.src, loop: state.loop, volume: state.volume })
  }

  const register = (type: string) => (listener: unknown): void => {
    if (typeof listener !== 'function') return
    const set = listeners.get(type) ?? new Set<Listener>()
    set.add(listener as Listener)
    listeners.set(type, set)
  }
  const unregister = (type: string) => (listener?: unknown): void => {
    if (typeof listener === 'function') listeners.get(type)?.delete(listener as Listener)
    else listeners.delete(type)
  }

  const handle: Record<string, unknown> = {
    get src() {
      return state.src
    },
    set src(value: unknown) {
      state.src = String(value ?? '')
      if (created) send('setSrc', { src: state.src })
      if (state.autoplay && state.src) play()
    },
    get volume() {
      return state.volume
    },
    set volume(value: unknown) {
      state.volume = Math.min(1, Math.max(0, Number(value ?? 1)))
      // The element does not exist yet; `create` carries the initial volume.
      if (created) send('setVolume', { volume: state.volume })
    },
    get loop() {
      return state.loop
    },
    set loop(value: unknown) {
      state.loop = Boolean(value)
    },
    get autoplay() {
      return state.autoplay
    },
    set autoplay(value: unknown) {
      state.autoplay = Boolean(value)
    },
    get duration() {
      return state.duration
    },
    get currentTime() {
      return state.currentTime
    },
    get paused() {
      return state.paused
    },
    get buffered() {
      return 0
    },
    play,
    pause: () => {
      state.paused = true
      send('pause')
    },
    stop: () => {
      send('stop')
    },
    seek: (position: unknown) => {
      state.currentTime = Number(position ?? 0)
      send('seek', { position: state.currentTime })
    },
    destroy: () => {
      if (destroyed) return
      destroyed = true
      unsubscribe?.()
      listeners.clear()
      void callHost(context, 'audio.destroy', { audioId })
    },
  }

  for (const type of AUDIO_EVENTS) {
    const capitalized = type.charAt(0).toUpperCase() + type.slice(1)
    handle[`on${capitalized}`] = register(type)
    handle[`off${capitalized}`] = unregister(type)
  }

  return handle
}
