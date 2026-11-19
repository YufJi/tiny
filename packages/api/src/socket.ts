import type { ApiContext, ApiHost } from './context'
import { callHost, runApi } from './run-api'

/**
 * WebSocket APIs.
 *
 * The host owns the connection and reports frames as `socketOpen` /
 * `socketClose` / `socketError` / `socketMessage` global events, which feed both
 * the global `wx.onSocket*` handlers and the per-socket `SocketTask`. Binary
 * frames cross the JSON bridge as base64 with `isBuffer: true`.
 */

const SOCKET_EVENTS = ['open', 'close', 'error', 'message'] as const

type SocketEvent = Record<string, unknown>
type Listener = (event: SocketEvent) => void

export function createSocketApi(context: ApiContext): ApiHost {
  // The global `sendSocketMessage`/`closeSocket` act on the latest socket.
  let lastSocketId = ''
  const tasks = new Map<string, Map<string, Set<Listener>>>()

  const handleFor = (socketId: string, listeners: Map<string, Set<Listener>>): Record<string, unknown> => {
    const handle: Record<string, unknown> = {
      send: (params: unknown = {}) => runApi(params, 'sendSocketMessage', () => (
        callHost(context, 'socket.send', sendPayload(socketId, params))
      )),
      close: (params: unknown = {}) => runApi(params, 'closeSocket', () => {
        const options = (params ?? {}) as Record<string, unknown>
        tasks.delete(socketId)
        return callHost(context, 'socket.close', {
          socketId,
          code: options.code ?? 1000,
          reason: options.reason ?? '',
        })
      }),
    }
    for (const type of SOCKET_EVENTS) {
      const capitalized = type.charAt(0).toUpperCase() + type.slice(1)
      handle[`on${capitalized}`] = (listener: unknown) => {
        if (typeof listener !== 'function') return
        const set = listeners.get(type) ?? new Set<Listener>()
        set.add(listener as Listener)
        listeners.set(type, set)
      }
      handle[`off${capitalized}`] = (listener?: unknown) => {
        if (typeof listener === 'function') listeners.get(type)?.delete(listener as Listener)
        else listeners.delete(type)
      }
    }
    return handle
  }

  // One subscription per event type fans out to the socket that owns it.
  for (const type of SOCKET_EVENTS) {
    const name = `socket${type.charAt(0).toUpperCase()}${type.slice(1)}`
    context.events?.on(name, (payload) => {
      const event = payload as (SocketEvent & { socketId?: unknown }) | undefined
      if (typeof event?.socketId !== 'string') return
      for (const listener of tasks.get(event.socketId)?.get(type) ?? []) listener(event)
      if (type === 'close' || type === 'error') tasks.delete(event.socketId)
    })
  }

  return {
    connectSocket: (params: unknown = {}) => {
      const options = (params ?? {}) as Record<string, unknown>
      const socketId = `wx-socket-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
      lastSocketId = socketId
      const listeners = new Map<string, Set<Listener>>()
      tasks.set(socketId, listeners)
      const task = handleFor(socketId, listeners)
      void runApi(params, 'connectSocket', async () => {
        const result = await callHost(context, 'socket.connect', {
          socketId,
          url: String(options.url ?? ''),
          header: options.header ?? {},
          protocols: options.protocols ?? [],
          timeout: options.timeout ?? 0,
        })
        if (isFailure(result)) tasks.delete(socketId)
        return result
      })
      return task
    },
    sendSocketMessage: (params: unknown = {}) => runApi(params, 'sendSocketMessage', () => {
      if (!lastSocketId) throw new Error('no socket is connected')
      return callHost(context, 'socket.send', sendPayload(lastSocketId, params))
    }),
    closeSocket: (params: unknown = {}) => runApi(params, 'closeSocket', () => {
      const options = (params ?? {}) as Record<string, unknown>
      if (!lastSocketId) return { errMsg: 'closeSocket:ok' }
      const socketId = lastSocketId
      lastSocketId = ''
      tasks.delete(socketId)
      return callHost(context, 'socket.close', {
        socketId,
        code: options.code ?? 1000,
        reason: options.reason ?? '',
      })
    }),
  }
}

function sendPayload(socketId: string, params: unknown): Record<string, unknown> {
  const options = (params ?? {}) as { data?: unknown; isBuffer?: unknown }
  const data = options.data
  if (data instanceof ArrayBuffer) {
    return { socketId, data: base64Of(new Uint8Array(data)), isBuffer: true }
  }
  if (ArrayBuffer.isView(data)) {
    const view = data as ArrayBufferView
    return {
      socketId,
      data: base64Of(new Uint8Array(view.buffer, view.byteOffset, view.byteLength)),
      isBuffer: true,
    }
  }
  return { socketId, data: String(data ?? ''), isBuffer: options.isBuffer === true }
}

function isFailure(result: unknown): boolean {
  const errMsg = (result as { errMsg?: unknown } | undefined)?.errMsg
  return typeof errMsg === 'string' && errMsg.includes(':fail')
}

function base64Of(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}
