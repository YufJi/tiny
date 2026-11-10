import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createGestureRecognizer, createMouseAdapter, projectTouch } from '../src/render/event-compositor'
import type { InputEvent, InputPoint } from '../src/render/event-compositor'

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

describe('mouse touch projection', () => {
  test('carries canvas-relative coordinates for the pressed element', () => {
    const projection = projectTouch(
      input('start', [point(30, 42, -1, 'mouse')]),
      { left: 10, top: 20 },
    )
    expect(projection.name).toBe('touchstart')
    expect(projection.touches).toHaveLength(1)
    expect(projection.touches[0]).toMatchObject({ clientX: 30, clientY: 42, x: 20, y: 22 })
  })

  test('keeps the origin for the whole gesture and lifts all touches on end', () => {
    const origin = { left: 10, top: 20 }
    const move = projectTouch(input('move', [point(50, 60, -1, 'mouse')]), origin)
    expect(move.name).toBe('touchmove')
    expect(move.touches[0]).toMatchObject({ x: 40, y: 40 })

    const end = projectTouch(input('end', [], [point(50, 60, -1, 'mouse')]), origin)
    expect(end.name).toBe('touchend')
    expect(end.touches).toEqual([])
    expect(end.changedTouches[0]).toMatchObject({ x: 40, y: 40 })
  })
})

describe('mouse adapter replay filter', () => {
  type Listener = (event: MouseEvent) => void

  const harness = () => {
    const listeners = new Map<string, Listener>()
    const root = {
      ownerDocument: {
        addEventListener: (type: string, listener: Listener) => listeners.set(`document:${type}`, listener),
        removeEventListener: (type: string) => listeners.delete(`document:${type}`),
      },
      addEventListener: (type: string, listener: Listener) => listeners.set(`root:${type}`, listener),
      removeEventListener: (type: string) => listeners.delete(`root:${type}`),
    }
    const { gestures, feed } = collect()
    const detach = createMouseAdapter(root as unknown as HTMLElement, () => false)(feed)
    const dispatch = (scope: 'root' | 'document', type: string, event: Record<string, unknown>) => {
      listeners.get(`${scope}:${type}`)?.({
        type,
        button: 0,
        clientX: 10,
        clientY: 12,
        ...event,
      } as unknown as MouseEvent)
    }
    return { detach, dispatch, gestures }
  }

  test('projects a real mouse press and release into one tap', () => {
    const { detach, dispatch, gestures } = harness()
    dispatch('root', 'mousedown', { sourceCapabilities: { firesTouchEvents: false } })
    dispatch('document', 'mouseup', { sourceCapabilities: { firesTouchEvents: false } })
    expect(gestures).toEqual([{ name: 'tap', x: 10, y: 12 }])
    detach()
  })

  test('drops the mouse replay of a touch, as reported by sourceCapabilities', () => {
    const { detach, dispatch, gestures } = harness()
    dispatch('root', 'mousedown', { sourceCapabilities: { firesTouchEvents: true } })
    dispatch('document', 'mouseup', { sourceCapabilities: { firesTouchEvents: true } })
    expect(gestures).toEqual([])
    detach()
  })

  test('still accepts real mouse input after a dropped replay', () => {
    const { detach, dispatch, gestures } = harness()
    dispatch('root', 'mousedown', { sourceCapabilities: { firesTouchEvents: true } })
    dispatch('document', 'mouseup', { sourceCapabilities: { firesTouchEvents: true } })
    dispatch('root', 'mousedown', { sourceCapabilities: { firesTouchEvents: false } })
    dispatch('document', 'mouseup', { sourceCapabilities: { firesTouchEvents: false } })
    expect(gestures).toEqual([{ name: 'tap', x: 10, y: 12 }])
    detach()
  })
})
