import type { ApiContext, ApiHost } from './context'
import { callHost, runApi } from './run-api'

/**
 * `wx.getRecorderManager()`.
 *
 * The host owns the microphone and the encoder; the manager keeps WeChat's
 * method and event surface and dispatches `recorderStateChange` events by
 * recorder id. `onFrameRecorded` and the interruption events are registered but
 * never fire on a browser host, which is why the API counts as partial.
 */

const RECORDER_EVENTS = [
  'start', 'pause', 'resume', 'stop', 'frameRecorded', 'error',
  'interruptionBegin', 'interruptionEnd',
] as const

type RecorderEvent = Record<string, unknown>
type Listener = (event: RecorderEvent) => void

export function createRecorderApi(context: ApiContext): ApiHost {
  return {
    getRecorderManager: () => createRecorderManager(context),
  }
}

function createRecorderManager(context: ApiContext): Record<string, unknown> {
  const recorderId = `wx-recorder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const listeners = new Map<string, Set<Listener>>()

  const unsubscribe = context.events?.on('recorderStateChange', (payload) => {
    const event = payload as (RecorderEvent & { recorderId?: unknown; type?: unknown }) | undefined
    if (event?.recorderId !== recorderId || typeof event.type !== 'string') return
    for (const listener of listeners.get(event.type) ?? []) listener(event)
  })

  const send = (method: string, payload: Record<string, unknown> = {}): Promise<unknown> => (
    callHost(context, `recorder.${method}`, { recorderId, ...payload })
  )

  const manager: Record<string, unknown> = {
    start: (options: unknown = {}) => runApi(options, 'start', () => send('start', {
      ...(options as Record<string, unknown>),
    })),
    pause: (options: unknown = {}) => runApi(options, 'pause', () => send('pause')),
    resume: (options: unknown = {}) => runApi(options, 'resume', () => send('resume')),
    stop: (options: unknown = {}) => runApi(options, 'stop', () => send('stop')),
    destroy: () => {
      unsubscribe?.()
      listeners.clear()
    },
  }

  for (const type of RECORDER_EVENTS) {
    const capitalized = type.charAt(0).toUpperCase() + type.slice(1)
    manager[`on${capitalized}`] = (listener: unknown) => {
      if (typeof listener !== 'function') return
      const set = listeners.get(type) ?? new Set<Listener>()
      set.add(listener as Listener)
      listeners.set(type, set)
    }
    manager[`off${capitalized}`] = (listener?: unknown) => {
      if (typeof listener === 'function') listeners.get(type)?.delete(listener as Listener)
      else listeners.delete(type)
    }
  }

  return manager
}
