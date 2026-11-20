/**
 * `wx.connectSocket` over the WebSocket API.
 *
 * The host owns the socket; messages, close and error states come back as
 * `socketOpen` / `socketClose` / `socketError` / `socketMessage` global events,
 * which feed both the SocketTask and the older `wx.onSocket*` handlers.
 *
 * A browser WebSocket cannot set handshake headers, so `header` is ignored
 * (the API counts as partial); binary frames travel as base64 with `isBuffer`.
 */

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

type WebSocketLike = {
  send(data: string | ArrayBuffer): void
  close(code?: number, reason?: string): void
  addEventListener(type: string, listener: (event: unknown) => void): void
  removeEventListener?(type: string, listener: (event: unknown) => void): void
}

export type SocketHandlerOptions = {
  emit: (name: string, payload?: unknown) => void
  createWebSocket?: (url: string, protocols?: string[]) => WebSocketLike
}

export function createSocketHandlers(
  options: SocketHandlerOptions,
): Record<string, (params: HandlerParams) => Promise<HandlerResult> | HandlerResult> {
  const createWebSocket = options.createWebSocket ?? defaultCreateWebSocket()
  const sockets = new Map<string, { socket: WebSocketLike; detach: () => void }>()

  const ensureClosed = (socketId: string): void => {
    const entry = sockets.get(socketId)
    if (!entry) return
    entry.detach()
    sockets.delete(socketId)
  }

  return {
    'socket.connect': (params) => {
      const socketId = String(params.socketId ?? '')
      const url = String(params.url ?? '')
      if (!socketId || !url) return { errMsg: 'connectSocket:fail socketId and url are required' }
      if (!createWebSocket) {
        return { errMsg: 'connectSocket:fail WebSocket is not available in this runtime' }
      }
      try {
        const protocols = Array.isArray(params.protocols) ? params.protocols.map(String) : undefined
        const socket = createWebSocket(url, protocols)
        const listeners: Record<string, (event: unknown) => void> = {}
        const listen = (type: string, handler: (event: unknown) => void): void => {
          listeners[type] = handler
          socket.addEventListener(type, handler)
        }
        listen('open', () => options.emit('socketOpen', { socketId, header: {} }))
        listen('message', (event) => {
          const data = (event as { data?: unknown }).data
          if (typeof data === 'string') {
            options.emit('socketMessage', { socketId, data, isBuffer: false })
            return
          }
          const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(0)
          options.emit('socketMessage', {
            socketId,
            data: base64Of(bytes),
            isBuffer: true,
          })
        })
        listen('error', () => options.emit('socketError', {
          socketId,
          errMsg: 'socketError:fail connection error',
        }))
        listen('close', (event) => {
          const detail = event as { code?: number; reason?: string }
          options.emit('socketClose', {
            socketId,
            code: Number(detail.code ?? 1000),
            reason: String(detail.reason ?? ''),
          })
          ensureClosed(socketId)
        })

        sockets.set(socketId, {
          socket,
          detach: () => {
            for (const [type, handler] of Object.entries(listeners)) {
              socket.removeEventListener?.(type, handler)
            }
          },
        })

        // `timeout` is a connect timeout in milliseconds.
        const timeout = Number(params.timeout ?? 0)
        if (Number.isFinite(timeout) && timeout > 0) {
          setTimeout(() => {
            if (!sockets.has(socketId)) return
            options.emit('socketError', { socketId, errMsg: 'connectSocket:fail timeout' })
            socket.close()
            ensureClosed(socketId)
          }, Math.min(timeout, 60_000))
        }
        return { errMsg: 'connectSocket:ok' }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { errMsg: `connectSocket:fail ${message}` }
      }
    },
    'socket.send': (params) => {
      const socketId = String(params.socketId ?? '')
      const entry = sockets.get(socketId)
      if (!entry) return { errMsg: 'sendSocketMessage:fail socket is not connected' }
      try {
        const data = params.data
        if (params.isBuffer === true && typeof data === 'string') {
          entry.socket.send(bytesOf(data).buffer as ArrayBuffer)
        } else {
          entry.socket.send(String(data ?? ''))
        }
        return { errMsg: 'sendSocketMessage:ok' }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { errMsg: `sendSocketMessage:fail ${message}` }
      }
    },
    'socket.close': (params) => {
      const socketId = String(params.socketId ?? '')
      const entry = sockets.get(socketId)
      if (!entry) return { errMsg: 'closeSocket:ok' }
      try {
        entry.socket.close(Number(params.code ?? 1000), String(params.reason ?? ''))
      } catch {
        // Closing an already-closed socket is not an error for the app.
      }
      ensureClosed(socketId)
      return { errMsg: 'closeSocket:ok' }
    },
  }
}

function base64Of(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function bytesOf(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
  return bytes
}

function defaultCreateWebSocket(): ((url: string, protocols?: string[]) => WebSocketLike) | undefined {
  if (typeof WebSocket === 'undefined') return undefined
  return (url, protocols) => (
    protocols && protocols.length > 0
      ? new WebSocket(url, protocols)
      : new WebSocket(url)
  ) as unknown as WebSocketLike
}
