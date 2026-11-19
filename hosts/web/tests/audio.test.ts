import { describe, expect, test } from 'vitest'
import { createAudioHandlers } from '../src/audio'
import type { AudioElementLike } from '../src/audio'

function createElement() {
  const listeners = new Map<string, Set<() => void>>()
  const element = {
    src: '',
    loop: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    paused: true,
    async play() {
      element.paused = false
      emit('play')
    },
    pause() {
      element.paused = true
      emit('pause')
    },
    addEventListener(type: string, listener: () => void) {
      const set = listeners.get(type) ?? new Set<() => void>()
      set.add(listener)
      listeners.set(type, set)
    },
    removeEventListener(type: string, listener: () => void) {
      listeners.get(type)?.delete(listener)
    },
    count(type: string) {
      return listeners.get(type)?.size ?? 0
    },
  }
  const emit = (type: string): void => {
    for (const listener of [...(listeners.get(type) ?? [])]) listener()
  }
  return { element: element as AudioElementLike & typeof element, emit }
}

describe('audio handlers', () => {
  test('play starts the element and reports play/timeUpdate', async () => {
    const { element, emit } = createElement()
    element.duration = 30
    const emitted: Array<{ name: string; payload?: unknown }> = []
    const handlers = createAudioHandlers({
      emit: (name, payload) => emitted.push({ name, payload }),
      createAudio: () => element,
    })
    await expect(handlers['audio.play']({
      audioId: 'a1',
      src: 'x.mp3',
      loop: true,
      volume: 0.3,
    })).resolves.toEqual({ errMsg: 'innerAudioContext:ok' })
    expect(element.src).toBe('x.mp3')
    expect(element.loop).toBe(true)
    expect(element.volume).toBe(0.3)

    element.currentTime = 2
    emit('timeupdate')
    expect(emitted).toContainEqual({
      name: 'audioStateChange',
      payload: { audioId: 'a1', type: 'timeUpdate', currentTime: 2, duration: 30 },
    })
  })

  test('play rejection becomes an honest failure', async () => {
    const { element } = createElement()
    element.play = async () => {
      throw new Error('blocked by autoplay policy')
    }
    const handlers = createAudioHandlers({
      emit: () => undefined,
      createAudio: () => element,
    })
    await expect(handlers['audio.play']({ audioId: 'a2', src: 'x.mp3' })).resolves.toEqual({
      errMsg: 'innerAudioContext:fail blocked by autoplay policy',
    })
  })

  test('stop resets position and emits stop', () => {
    const { element } = createElement()
    const emitted: Array<{ name: string; payload?: unknown }> = []
    const handlers = createAudioHandlers({
      emit: (name, payload) => emitted.push({ name, payload }),
      createAudio: () => element,
    })
    handlers['audio.create']({ audioId: 'a3', src: 'x.mp3' })
    element.currentTime = 9
    handlers['audio.stop']({ audioId: 'a3' })
    expect(element.currentTime).toBe(0)
    expect(emitted.at(-1)).toMatchObject({ payload: { audioId: 'a3', type: 'stop' } })
  })

  test('destroy detaches listeners', () => {
    const { element } = createElement()
    const handlers = createAudioHandlers({
      emit: () => undefined,
      createAudio: () => element,
    })
    handlers['audio.create']({ audioId: 'a4', src: 'x.mp3' })
    expect(element.count('play')).toBe(1)
    handlers['audio.destroy']({ audioId: 'a4' })
    expect(element.count('play')).toBe(0)
  })

  test('fails when the runtime has no audio element', async () => {
    const handlers = createAudioHandlers({ emit: () => undefined, createAudio: undefined })
    await expect(handlers['audio.play']({ audioId: 'a5', src: 'x' })).resolves.toEqual({
      errMsg: 'innerAudioContext:fail audio playback is not available in this runtime',
    })
  })
})
