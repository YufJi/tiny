import { afterEach, describe, expect, test } from 'vitest'
import { BROWSER_RUNTIME_NAMES } from '../src/naming'
import {
  createRenderHostEventBus,
  listenForRenderHostEvents,
} from '../src/render/host-events'

const originalWindow = (globalThis as { window?: unknown }).window

afterEach(() => {
  if (originalWindow === undefined) {
    delete (globalThis as { window?: unknown }).window
  } else {
    ;(globalThis as { window?: unknown }).window = originalWindow
  }
})

describe('render host events', () => {
  test('fans out events to scoped subscribers and removes listeners', () => {
    const bus = createRenderHostEventBus()
    const first: unknown[] = []
    const second: unknown[] = []
    const removeFirst = bus.source.subscribe('statusBarTap', (payload) => first.push(payload))
    bus.source.subscribe('statusBarTap', (payload) => second.push(payload))

    bus.emit('statusBarTap', { source: 'simulator' })
    expect(first).toEqual([{ source: 'simulator' }])
    expect(second).toEqual([{ source: 'simulator' }])

    removeFirst()
    bus.emit('statusBarTap')
    expect(first).toHaveLength(1)
    expect(second).toHaveLength(2)
  })

  test('accepts host-event messages only from the parent document', () => {
    const listeners = new Map<string, (event: MessageEvent) => void>()
    const parent = {}
    const fakeWindow = {
      parent,
      addEventListener: (type: string, listener: (event: MessageEvent) => void) => {
        listeners.set(type, listener)
      },
      removeEventListener: (type: string) => {
        listeners.delete(type)
      },
    }
    ;(globalThis as { window?: unknown }).window = fakeWindow
    const events: Array<{ name: string; payload: unknown }> = []
    const dispose = listenForRenderHostEvents((name, payload) => {
      events.push({ name, payload })
    })
    const listener = listeners.get('message')!

    listener({
      data: { type: BROWSER_RUNTIME_NAMES.hostEvent, name: 'statusBarTap', payload: { a: 1 } },
      source: parent,
    } as MessageEvent)
    listener({
      data: { type: BROWSER_RUNTIME_NAMES.hostEvent, name: 'statusBarTap' },
      source: {},
    } as MessageEvent)
    expect(events).toEqual([{ name: 'statusBarTap', payload: { a: 1 } }])

    dispose()
    expect(listeners.has('message')).toBe(false)
  })
})
