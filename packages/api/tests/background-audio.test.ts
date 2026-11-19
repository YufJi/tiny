import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost, createGlobalEventHub } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const events = createGlobalEventHub()
  const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    'backgroundAudio.play': () => ({ errMsg: 'playBackgroundAudio:ok' }),
    'backgroundAudio.pause': () => ({ errMsg: 'pauseBackgroundAudio:ok' }),
    'backgroundAudio.stop': () => ({ errMsg: 'stopBackgroundAudio:ok' }),
    'backgroundAudio.seek': () => ({ errMsg: 'seekBackgroundAudio:ok' }),
    'backgroundAudio.state': () => ({ status: 'playing', currentPosition: 12, duration: 100 }),
  }
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return Promise.resolve(handlers[method]?.(params))
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

describe('background audio', () => {
  test('the manager plays with its current metadata', () => {
    const { host, calls } = createHost()
    const manager = host.getBackgroundAudioManager()
    manager.title = 'Song'
    manager.src = 'https://example.com/a.mp3'
    manager.play()
    expect(calls[0]).toMatchObject({
      method: 'backgroundAudio.play',
      params: { src: 'https://example.com/a.mp3', title: 'Song' },
    })
    expect(manager.paused).toBe(false)
  })

  test('host events drive properties and listeners', () => {
    const { host, events } = createHost()
    const manager = host.getBackgroundAudioManager()
    const played: unknown[] = []
    const ticks: unknown[] = []
    manager.onPlay((event: unknown) => played.push(event))
    manager.onTimeUpdate((event: unknown) => ticks.push(event))

    events.emit('backgroundAudioPlay', { type: 'play' })
    events.emit('backgroundAudioStateChange', { type: 'timeUpdate', currentTime: 4, duration: 100 })
    expect(played).toHaveLength(1)
    expect(ticks).toHaveLength(1)
    expect(manager.currentTime).toBe(4)
    expect(manager.duration).toBe(100)
    expect(manager.paused).toBe(false)

    events.emit('backgroundAudioStop', { type: 'stop' })
    expect(manager.paused).toBe(true)
  })

  test('legacy play carries src/title and drives the same player', () => {
    const { host, calls } = createHost()
    void host.playBackgroundAudio({ src: 'https://example.com/b.mp3', title: 'B' })
    return Promise.resolve().then(() => {
      expect(calls[0]).toMatchObject({
        method: 'backgroundAudio.play',
        params: { src: 'https://example.com/b.mp3', title: 'B' },
      })
    })
  })

  test('getBackgroundAudioPlayerState maps the host result', async () => {
    const { host } = createHost()
    await expect(host.getBackgroundAudioPlayerState({})).resolves.toEqual({
      status: 'playing',
      currentPosition: 12,
      duration: 100,
      errMsg: 'getBackgroundAudioPlayerState:ok',
    })
  })

  test('legacy global listeners observe the manager', () => {
    const { host, events } = createHost()
    const seen: unknown[] = []
    host.onBackgroundAudioPlay((event: unknown) => seen.push(event))
    events.emit('backgroundAudioPlay', { type: 'play' })
    expect(seen).toHaveLength(1)
  })
})
