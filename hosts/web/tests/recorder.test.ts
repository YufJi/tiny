import { describe, expect, test } from 'vitest'
import { createTempFileRegistry } from '../src/media-files'
import { createRecorderHandlers } from '../src/recorder'
import type { RecorderLike } from '../src/recorder'

function createRegistry() {
  let counter = 0
  return createTempFileRegistry(() => `blob:test/${++counter}`)
}

function createFakeRecorder() {
  let ondataavailable: ((event: { data?: Blob }) => void) | null = null
  let onstop: (() => void) | null = null
  const recorder: RecorderLike & { stopped: boolean } = {
    stopped: false,
    get ondataavailable() {
      return ondataavailable
    },
    set ondataavailable(value) {
      ondataavailable = value
    },
    get onstop() {
      return onstop
    },
    set onstop(value) {
      onstop = value
    },
    start() {
      return undefined
    },
    pause() {
      return undefined
    },
    resume() {
      return undefined
    },
    stop() {
      recorder.stopped = true
      ondataavailable?.({ data: new Blob(['audio-bytes'], { type: 'audio/webm' }) })
      onstop?.()
    },
  }
  return recorder
}

describe('recorder handlers', () => {
  test('records, stops and stores the clip as a temp file', async () => {
    const registry = createRegistry()
    const emitted: Array<{ name: string; payload?: Record<string, unknown> }> = []
    const recorder = createFakeRecorder()
    const handlers = createRecorderHandlers({
      emit: (name, payload) => emitted.push({ name, payload: payload as Record<string, unknown> }),
      registry,
      getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }),
      createRecorder: () => recorder,
    })

    await expect(handlers['recorder.start']({ recorderId: 'r1', duration: 0 })).resolves.toEqual({
      errMsg: 'start:ok',
    })
    expect(emitted[0]).toMatchObject({ payload: { recorderId: 'r1', type: 'start' } })

    handlers['recorder.stop']({ recorderId: 'r1' })
    expect(recorder.stopped).toBe(true)
    const stop = emitted.at(-1)?.payload
    expect(stop).toMatchObject({ recorderId: 'r1', type: 'stop', fileSize: 11 })
    expect(String(stop?.tempFilePath)).toBe('blob:test/1')
  })

  test('a denied microphone emits an error event and fails the call', async () => {
    const emitted: Array<{ name: string; payload?: Record<string, unknown> }> = []
    const handlers = createRecorderHandlers({
      emit: (name, payload) => emitted.push({ name, payload: payload as Record<string, unknown> }),
      registry: createRegistry(),
      getUserMedia: async () => {
        throw new Error('permission denied')
      },
      createRecorder: () => createFakeRecorder(),
    })
    await expect(handlers['recorder.start']({ recorderId: 'r2' })).resolves.toEqual({
      errMsg: 'start:fail permission denied',
    })
    expect(emitted[0]).toMatchObject({ payload: { type: 'error' } })
  })

  test('pause/resume/stop without a session fail honestly', () => {
    const handlers = createRecorderHandlers({
      emit: () => undefined,
      registry: createRegistry(),
    })
    expect(handlers['recorder.pause']({ recorderId: 'missing' })).toMatchObject({
      errMsg: 'pause:fail recorder is not running',
    })
    expect(handlers['recorder.stop']({ recorderId: 'missing' })).toMatchObject({
      errMsg: 'stop:fail recorder is not running',
    })
  })

  test('fails when the runtime cannot record', async () => {
    const handlers = createRecorderHandlers({
      emit: () => undefined,
      registry: createRegistry(),
      getUserMedia: undefined,
      createRecorder: undefined,
    })
    await expect(handlers['recorder.start']({ recorderId: 'r3' })).resolves.toEqual({
      errMsg: 'start:fail audio recording is not available in this runtime',
    })
  })
})
