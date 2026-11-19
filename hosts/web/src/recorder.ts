/**
 * `wx.getRecorderManager()` over `MediaRecorder`.
 *
 * Recording needs a microphone permission; a denied or unavailable microphone
 * becomes an `error` event, not a silent no-op. The finished clip goes into the
 * host temp-file registry, so preview/upload can use the returned path.
 *
 * WeChat encodes mp3/aac server-side; the browser produces whatever
 * `MediaRecorder` supports (usually webm/opus), so the manager counts as partial.
 */
import type { TempFileRegistry } from './media-files'

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

type StreamLike = { getTracks?: () => Array<{ stop(): void }> }
type RecorderLike = {
  ondataavailable: ((event: { data?: Blob }) => void) | null
  onstop: (() => void) | null
  start(timeslice?: number): void
  stop(): void
  pause(): void
  resume(): void
}

export type RecorderHandlerOptions = {
  emit: (name: string, payload?: unknown) => void
  registry: TempFileRegistry
  getUserMedia?: (constraints: { audio: boolean }) => Promise<StreamLike>
  createRecorder?: (stream: StreamLike) => RecorderLike
}

export function createRecorderHandlers(
  options: RecorderHandlerOptions,
): Record<string, (params: HandlerParams) => Promise<HandlerResult> | HandlerResult> {
  const getUserMedia = options.getUserMedia ?? defaultGetUserMedia()
  const createRecorder = options.createRecorder ?? defaultCreateRecorder()
  const sessions = new Map<string, {
    recorder: RecorderLike
    stream: StreamLike
    stop: () => void
  }>()

  const stopSession = (recorderId: string): void => {
    const session = sessions.get(recorderId)
    if (!session) return
    session.recorder.stop()
  }

  return {
    'recorder.start': async (params) => {
      const recorderId = String(params.recorderId ?? '')
      if (!recorderId) return { errMsg: 'start:fail recorderId is required' }
      if (!getUserMedia || !createRecorder) {
        return { errMsg: 'start:fail audio recording is not available in this runtime' }
      }
      try {
        const stream = await getUserMedia({ audio: true })
        const recorder = createRecorder(stream)
        const chunks: Blob[] = []
        const startedAt = Date.now()
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) chunks.push(event.data)
        }
        recorder.onstop = () => {
          for (const track of stream.getTracks?.() ?? []) track.stop()
          const blob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' })
          const entry = options.registry.add(blob, `record-${recorderId}.webm`)
          options.emit('recorderStateChange', {
            recorderId,
            type: 'stop',
            tempFilePath: entry.url,
            duration: Date.now() - startedAt,
            fileSize: entry.size,
          })
          sessions.delete(recorderId)
        }
        recorder.start()
        sessions.set(recorderId, {
          recorder,
          stream,
          stop: () => recorder.stop(),
        })
        // `duration` is the maximum recording length, in milliseconds.
        const duration = Number(params.duration ?? 0)
        if (Number.isFinite(duration) && duration > 0) {
          setTimeout(() => stopSession(recorderId), Math.min(duration, 600_000))
        }
        options.emit('recorderStateChange', { recorderId, type: 'start' })
        return { errMsg: 'start:ok' }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        options.emit('recorderStateChange', { recorderId, type: 'error', errMsg: `start:fail ${message}` })
        return { errMsg: `start:fail ${message}` }
      }
    },
    'recorder.pause': (params) => {
      const recorderId = String(params.recorderId ?? '')
      const session = sessions.get(recorderId)
      if (!session) return { errMsg: 'pause:fail recorder is not running' }
      session.recorder.pause()
      options.emit('recorderStateChange', { recorderId, type: 'pause' })
      return { errMsg: 'pause:ok' }
    },
    'recorder.resume': (params) => {
      const recorderId = String(params.recorderId ?? '')
      const session = sessions.get(recorderId)
      if (!session) return { errMsg: 'resume:fail recorder is not running' }
      session.recorder.resume()
      options.emit('recorderStateChange', { recorderId, type: 'resume' })
      return { errMsg: 'resume:ok' }
    },
    'recorder.stop': (params) => {
      const recorderId = String(params.recorderId ?? '')
      if (!sessions.has(recorderId)) return { errMsg: 'stop:fail recorder is not running' }
      stopSession(recorderId)
      return { errMsg: 'stop:ok' }
    },
  }
}

function defaultGetUserMedia(): ((constraints: { audio: boolean }) => Promise<StreamLike>) | undefined {
  const media = typeof navigator === 'undefined'
    ? undefined
    : (navigator as unknown as { mediaDevices?: { getUserMedia?: (c: unknown) => Promise<MediaStream> } }).mediaDevices
  const getUserMedia = media?.getUserMedia
  if (!getUserMedia) return undefined
  return (constraints) => getUserMedia.call(media, constraints) as unknown as Promise<StreamLike>
}

function defaultCreateRecorder(): ((stream: StreamLike) => RecorderLike) | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return (stream) => new MediaRecorder(stream as unknown as MediaStream) as unknown as RecorderLike
}
