import type { ApiContext, ApiHost } from './context'
import { callHost, runApi } from './run-api'

/**
 * Background audio: the singleton manager plus the legacy `*BackgroundAudio`
 * functions, which drive the same player.
 *
 * Playback is host-owned. A browser keeps playing while the tab is visible and
 * on desktop when hidden, but mobile browsers can suspend a hidden tab, so the
 * API counts as partial.
 */

const EVENTS = [
  'play', 'pause', 'stop', 'ended', 'timeUpdate', 'error', 'waiting', 'seeking', 'seeked',
] as const

type AudioEvent = Record<string, unknown>
type Listener = (event: AudioEvent) => void

export function createBackgroundAudioApi(context: ApiContext): ApiHost {
  const manager = createManager(context)
  const call = (method: string, payload: Record<string, unknown> = {}) => (
    callHost(context, `backgroundAudio.${method}`, payload)
  )

  return {
    getBackgroundAudioManager: () => manager,
    playBackgroundAudio: (params: unknown = {}) => runApi(params, 'playBackgroundAudio', () => {
      manager.applyLegacy(params)
      return call('play', manager.playPayload())
    }),
    pauseBackgroundAudio: (params: unknown = {}) => runApi(params, 'pauseBackgroundAudio', () => (
      call('pause')
    )),
    stopBackgroundAudio: (params: unknown = {}) => runApi(params, 'stopBackgroundAudio', () => (
      call('stop')
    )),
    seekBackgroundAudio: (params: unknown = {}) => runApi(params, 'seekBackgroundAudio', () => (
      call('seek', { position: Number((params as { position?: unknown }).position ?? 0) })
    )),
    getBackgroundAudioPlayerState: (params: unknown = {}) => runApi(
      params,
      'getBackgroundAudioPlayerState',
      async () => {
        const result = await call('state') as Record<string, unknown>
        return {
          status: result.status,
          currentPosition: result.currentPosition,
          duration: result.duration,
          errMsg: 'getBackgroundAudioPlayerState:ok',
        }
      },
    ),
    // Legacy global listeners: they observe the singleton manager.
    onBackgroundAudioPlay: (listener: unknown) => manager.subscribe('play', listener),
    onBackgroundAudioPause: (listener: unknown) => manager.subscribe('pause', listener),
    onBackgroundAudioStop: (listener: unknown) => manager.subscribe('stop', listener),
  } as ApiHost
}

type ManagerHandle = Record<string, unknown> & {
  applyLegacy(params: unknown): void
  playPayload(): Record<string, unknown>
  subscribe(type: string, listener: unknown): void
}

function createManager(context: ApiContext): ManagerHandle {
  const listeners = new Map<string, Set<Listener>>()
  const state = {
    src: '',
    title: '',
    epname: '',
    singer: '',
    coverImgUrl: '',
    startTime: 0,
    duration: 0,
    currentTime: 0,
    paused: true,
    buffered: 0,
    playbackRate: 1,
  }

  const dispatch = (type: string, event: AudioEvent): void => {
    if (type === 'play') state.paused = false
    if (type === 'pause' || type === 'stop' || type === 'ended') state.paused = true
    if (typeof event.currentTime === 'number') state.currentTime = event.currentTime
    if (typeof event.duration === 'number' && event.duration > 0) state.duration = event.duration
    for (const listener of listeners.get(type) ?? []) listener(event)
  }

  const send = (method: string, payload: Record<string, unknown> = {}): void => {
    void callHost(context, `backgroundAudio.${method}`, payload)
  }

  context.events?.on('backgroundAudioPlay', () => dispatch('play', { type: 'play' }))
  context.events?.on('backgroundAudioPause', () => dispatch('pause', { type: 'pause' }))
  context.events?.on('backgroundAudioStop', () => dispatch('stop', { type: 'stop' }))
  context.events?.on('backgroundAudioStateChange', (payload) => {
    const event = payload as AudioEvent & { type?: unknown }
    if (typeof event?.type === 'string') dispatch(event.type, event)
  })

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

  const playPayload = (): Record<string, unknown> => ({
    src: state.src,
    title: state.title,
    epname: state.epname,
    singer: state.singer,
    coverImgUrl: state.coverImgUrl,
    startTime: state.startTime,
  })

  const manager: ManagerHandle = {
    get src() {
      return state.src
    },
    set src(value: unknown) {
      state.src = String(value ?? '')
    },
    get title() {
      return state.title
    },
    set title(value: unknown) {
      state.title = String(value ?? '')
    },
    get epname() {
      return state.epname
    },
    set epname(value: unknown) {
      state.epname = String(value ?? '')
    },
    get singer() {
      return state.singer
    },
    set singer(value: unknown) {
      state.singer = String(value ?? '')
    },
    get coverImgUrl() {
      return state.coverImgUrl
    },
    set coverImgUrl(value: unknown) {
      state.coverImgUrl = String(value ?? '')
    },
    get startTime() {
      return state.startTime
    },
    set startTime(value: unknown) {
      state.startTime = Number(value ?? 0)
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
    get playbackRate() {
      return state.playbackRate
    },
    set playbackRate(value: unknown) {
      state.playbackRate = Number(value ?? 1)
    },
    play: () => {
      state.paused = false
      send('play', playPayload())
    },
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
    onError: register('error'),
    offError: unregister('error'),
    onWaiting: register('waiting'),
    offWaiting: unregister('waiting'),
    onTimeUpdate: register('timeUpdate'),
    offTimeUpdate: unregister('timeUpdate'),
    onSeeking: register('seeking'),
    offSeeking: unregister('seeking'),
    onSeeked: register('seeked'),
    offSeeked: unregister('seeked'),
    applyLegacy: (params: unknown) => {
      const options = (params ?? {}) as Record<string, unknown>
      for (const key of ['src', 'title', 'epname', 'singer', 'coverImgUrl']) {
        if (typeof options[key] === 'string') (state as Record<string, unknown>)[key] = options[key]
      }
      if (options.startTime !== undefined) state.startTime = Number(options.startTime)
    },
    playPayload,
    subscribe: (type, listener) => register(type)(listener),
  }

  for (const type of EVENTS) {
    if (manager[`on${capitalize(type)}`] === undefined) {
      manager[`on${capitalize(type)}`] = register(type)
      manager[`off${capitalize(type)}`] = unregister(type)
    }
  }

  return manager
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
