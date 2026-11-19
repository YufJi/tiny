import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost, createGlobalEventHub } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const events = createGlobalEventHub()
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return Promise.resolve({ errMsg: 'innerAudioContext:ok' })
    },
    callSync: () => undefined,
  }
  const context = {
    connection,
    events,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    launchOptions: {},
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ApiContext
  return {
    host: createApiHost(context) as unknown as Record<string, (...args: unknown[]) => any>,
    calls,
    events,
  }
}

describe('inner audio context', () => {
  test('play creates the host element and forwards src/loop/volume', () => {
    const { host, calls } = createHost()
    const audio = host.createInnerAudioContext()
    audio.src = 'https://example.com/a.mp3'
    audio.loop = true
    audio.volume = 0.5
    audio.play()

    expect(calls[0]).toMatchObject({
      method: 'audio.create',
      params: { src: 'https://example.com/a.mp3', loop: true, volume: 0.5 },
    })
    expect(calls[1]).toMatchObject({ method: 'audio.play' })
    expect(audio.paused).toBe(false)
  })

  test('host state events drive properties and listeners', () => {
    const { host, calls, events } = createHost()
    const audio = host.createInnerAudioContext()
    audio.src = 'a.mp3'
    audio.play()
    const id = String(calls[0].params.audioId)
    expect(id).toMatch(/^wx-audio-/)

    const played: unknown[] = []
    const ticks: unknown[] = []
    audio.onPlay((event: unknown) => played.push(event))
    audio.onTimeUpdate((event: unknown) => ticks.push(event))

    events.emit('audioStateChange', { audioId: id, type: 'play' })
    events.emit('audioStateChange', { audioId: id, type: 'timeUpdate', currentTime: 3.5, duration: 30 })
    events.emit('audioStateChange', { audioId: 'other', type: 'play' })

    expect(played).toHaveLength(1)
    expect(ticks).toHaveLength(1)
    expect(audio.currentTime).toBe(3.5)
    expect(audio.duration).toBe(30)
  })

  test('stop, seek and destroy reach the host', () => {
    const { host, calls } = createHost()
    const audio = host.createInnerAudioContext()
    audio.src = 'a.mp3'
    audio.play()
    const audioId = String(calls[0].params.audioId)

    audio.seek(12)
    audio.stop()
    audio.destroy()
    expect(calls.map((call) => call.method)).toContain('audio.seek')
    expect(calls.find((call) => call.method === 'audio.seek')?.params).toMatchObject({ position: 12 })
    expect(calls.map((call) => call.method)).toContain('audio.stop')
    expect(calls.at(-1)).toMatchObject({ method: 'audio.destroy', params: { audioId } })
  })

  test('events stop after destroy', () => {
    const { host, calls, events } = createHost()
    const audio = host.createInnerAudioContext()
    audio.src = 'a.mp3'
    audio.play()
    const audioId = String(calls[0].params.audioId)
    const played: unknown[] = []
    audio.onPlay((event: unknown) => played.push(event))
    audio.destroy()
    events.emit('audioStateChange', { audioId, type: 'play' })
    expect(played).toEqual([])
  })
})
