import { describe, expect, test } from 'vitest'
import { createEventChannelPair } from '../src/event-channel'

describe('EventChannel', () => {
  test('wires the opener and the page in opposite directions', () => {
    const { opener, page } = createEventChannelPair()
    const openerHeard: unknown[] = []
    const pageHeard: unknown[] = []
    opener.on('fromPage', (payload) => openerHeard.push(payload))
    page.on('fromOpener', (payload) => pageHeard.push(payload))

    opener.emit('fromOpener', { n: 1 })
    page.emit('fromPage', { n: 2 })

    expect(pageHeard).toEqual([{ n: 1 }])
    expect(openerHeard).toEqual([{ n: 2 }])
  })

  test('navigateTo-style events listen to what the opened page emits', () => {
    const received: unknown[] = []
    const { page } = createEventChannelPair({
      readyForData: (payload) => received.push(payload),
    })

    page.emit('readyForData', { id: 7 })

    expect(received).toEqual([{ id: 7 }])
  })

  test('buffers emissions until a listener exists', () => {
    const { opener, page } = createEventChannelPair()
    opener.emit('later', { step: 1 })
    opener.emit('later', { step: 2 })
    const seen: unknown[] = []
    page.on('later', (payload) => seen.push(payload))
    expect(seen).toEqual([{ step: 1 }, { step: 2 }])
    // The cache is drained once; a second listener does not replay it.
    const second: unknown[] = []
    page.on('later', (payload) => second.push(payload))
    expect(second).toEqual([])
  })

  test('once fires a single time, including for buffered emissions', () => {
    const { opener, page } = createEventChannelPair()
    opener.emit('once', 'a')
    opener.emit('once', 'b')
    const seen: unknown[] = []
    page.once('once', (payload) => seen.push(payload))
    page.emit('noop')
    expect(seen).toEqual(['a'])
  })

  test('off removes one listener or every listener for the event', () => {
    const { opener, page } = createEventChannelPair()
    const seen: string[] = []
    const first = () => seen.push('first')
    const second = () => seen.push('second')
    page.on('event', first)
    page.on('event', second)
    opener.emit('event')
    page.off('event', first)
    opener.emit('event')
    page.off('event')
    opener.emit('event')
    expect(seen).toEqual(['first', 'second', 'second'])
  })

  test('emit passes every argument through', () => {
    const { opener, page } = createEventChannelPair()
    const seen: unknown[][] = []
    page.on('many', (...args) => seen.push(args))
    opener.emit('many', 1, 'two', { three: true })
    expect(seen).toEqual([[1, 'two', { three: true }]])
  })
})
