import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createGestureRecognizer } from '../src/event-compositor'
import type { InputEvent, InputPoint } from '../src/event-compositor'

const point = (x: number, y: number, id = 1, source: 'touch' | 'mouse' = 'touch'): InputPoint => ({
  id,
  x,
  y,
  source,
})

const input = (
  phase: InputEvent['phase'],
  points: InputPoint[],
  changedPoints = points,
): InputEvent => ({
  phase,
  points,
  changedPoints,
  originalEvent: {} as Event,
})

const collect = () => {
  const gestures: Array<{ name: string; x: number; y: number }> = []
  const feed = createGestureRecognizer({
    onGesture: (gesture) => {
      gestures.push({ name: gesture.name, x: gesture.detail.x, y: gesture.detail.y })
    },
  })
  return { gestures, feed }
}

describe('gesture recognizer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('emits one tap for a press and release at the same point', () => {
    const { gestures, feed } = collect()
    feed(input('start', [point(10, 12)]))
    feed(input('end', [], [point(10, 12)]))
    expect(gestures).toEqual([{ name: 'tap', x: 10, y: 12 }])
  })

  test('cancels the tap once the finger moves past the threshold', () => {
    const { gestures, feed } = collect()
    feed(input('start', [point(10, 10)]))
    feed(input('move', [point(30, 10)]))
    feed(input('end', [], [point(30, 10)]))
    expect(gestures).toEqual([{ name: 'canceltap', x: 30, y: 10 }])
  })

  test('longpress fires while held and suppresses the later tap', () => {
    const { gestures, feed } = collect()
    feed(input('start', [point(4, 6)]))
    vi.advanceTimersByTime(350)
    expect(gestures).toEqual([{ name: 'longpress', x: 4, y: 6 }])
    feed(input('end', [], [point(4, 6)]))
    expect(gestures).toHaveLength(1)
  })

  test('moving after longpress keeps the single longpress', () => {
    const { gestures, feed } = collect()
    feed(input('start', [point(4, 6)]))
    vi.advanceTimersByTime(350)
    feed(input('move', [point(40, 6)]))
    feed(input('end', [], [point(40, 6)]))
    expect(gestures.map((gesture) => gesture.name)).toEqual(['longpress'])
  })

  test('a second finger drops the tap candidate', () => {
    const { gestures, feed } = collect()
    feed(input('start', [point(10, 10)]))
    feed(input('start', [point(10, 10), point(60, 60, 2)]))
    feed(input('end', [], [point(10, 10)]))
    expect(gestures.map((gesture) => gesture.name)).toEqual(['canceltap'])
  })

  test('mouse input produces the same tap as touch', () => {
    const { gestures, feed } = collect()
    feed(input('start', [point(8, 8, -1, 'mouse')]))
    feed(input('end', [], [point(8, 8, -1, 'mouse')]))
    expect(gestures).toEqual([{ name: 'tap', x: 8, y: 8 }])
  })

  test('touchcancel drops the candidate without a tap', () => {
    const { gestures, feed } = collect()
    feed(input('start', [point(10, 10)]))
    feed(input('cancel', [], [point(10, 10)]))
    feed(input('end', [], [point(10, 10)]))
    expect(gestures.map((gesture) => gesture.name)).toEqual(['canceltap'])
  })
})
