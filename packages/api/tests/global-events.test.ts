import { describe, expect, test } from 'vitest'
import { createGlobalEventApi, createGlobalEventHub } from '../src/global-events'
import type { ApiContext } from '../src/context'

function contextWith(events: ReturnType<typeof createGlobalEventHub>): ApiContext {
  return { events } as unknown as ApiContext
}

describe('global event hub', () => {
  test('delivers to every listener and supports off(callback) / off(all)', () => {
    const hub = createGlobalEventHub()
    const first: unknown[] = []
    const second: unknown[] = []
    const removeFirst = hub.on('themeChange', (payload) => first.push(payload))
    hub.on('themeChange', (payload) => second.push(payload))

    hub.emit('themeChange', { theme: 'dark' })
    expect(first).toEqual([{ theme: 'dark' }])
    expect(second).toEqual([{ theme: 'dark' }])

    removeFirst()
    hub.emit('themeChange', { theme: 'light' })
    expect(first).toHaveLength(1)
    expect(second).toHaveLength(2)

    hub.off('themeChange')
    hub.emit('themeChange', { theme: 'dark' })
    expect(second).toHaveLength(2)
  })

  test('isolates listener failures and keeps delivering', () => {
    const failures: string[] = []
    const hub = createGlobalEventHub({
      onListenerError: (event) => failures.push(event),
    })
    const seen: unknown[] = []
    hub.on('error', () => { throw new Error('listener exploded') })
    hub.on('error', (payload) => seen.push(payload))

    expect(() => hub.emit('error', { message: 'boom' })).not.toThrow()
    expect(seen).toEqual([{ message: 'boom' }])
    expect(failures).toEqual(['error'])
  })
})

describe('global event API table', () => {
  test('maps on/off pairs to one event and clears all without a callback', () => {
    const hub = createGlobalEventHub()
    const api = createGlobalEventApi(contextWith(hub))
    const first: unknown[] = []
    const second: unknown[] = []
    const firstListener = (payload: unknown) => first.push(payload)
    const secondListener = (payload: unknown) => second.push(payload)

    api.onThemeChange?.(firstListener)
    api.onThemeChange?.(secondListener)
    hub.emit('themeChange', { theme: 'dark' })
    expect(first).toEqual([{ theme: 'dark' }])
    expect(second).toEqual([{ theme: 'dark' }])

    api.offThemeChange?.(firstListener)
    hub.emit('themeChange', { theme: 'light' })
    expect(first).toHaveLength(1)
    expect(second).toHaveLength(2)

    api.offThemeChange?.()
    hub.emit('themeChange', { theme: 'dark' })
    expect(second).toHaveLength(2)
  })

  test('registers safely when the host provides no hub', () => {
    const api = createGlobalEventApi({} as ApiContext)
    expect(() => {
      api.onNetworkStatusChange?.(() => undefined)
      api.offNetworkStatusChange?.()
    }).not.toThrow()
  })
})
