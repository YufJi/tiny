import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  nativeViewClipOf,
  nativeViewContentFrameOf,
  nativeViewFrameOf,
  nativeViewMaskOf,
  nativeViewScrollAncestors,
  nativeViewVisibleAt,
} from '../src/host-native-view'

type FakeElement = {
  getBoundingClientRect: () => { left: number; top: number; width: number; height: number }
  parentElement: FakeElement | null
  contains: (other: unknown) => boolean
  style: Record<string, string>
}

function element(
  rect: { left: number; top: number; width: number; height: number },
  style: Record<string, string> = {},
): FakeElement {
  const value: FakeElement = {
    getBoundingClientRect: () => rect,
    parentElement: null,
    contains: (other) => other === value,
    style: {
      overflowX: 'visible',
      overflowY: 'visible',
      borderTopWidth: '0px',
      borderRightWidth: '0px',
      borderBottomWidth: '0px',
      borderLeftWidth: '0px',
      paddingTop: '0px',
      paddingRight: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
      ...style,
    },
  }
  return value
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('host native view geometry', () => {
  test('intersects the viewport and scroll/overflow ancestors', () => {
    const input = element({ left: 20, top: 150, width: 200, height: 40 })
    const scroller = element(
      { left: 10, top: 100, width: 380, height: 300 },
      { overflowX: 'hidden', overflowY: 'auto' },
    )
    input.parentElement = scroller
    vi.stubGlobal('window', {
      innerWidth: 400,
      innerHeight: 800,
      getComputedStyle: (target: FakeElement) => target.style,
    })
    vi.stubGlobal('document', {
      elementFromPoint: () => input,
    })

    expect(nativeViewFrameOf(input as unknown as Element)).toEqual({
      left: 20,
      top: 150,
      width: 200,
      height: 40,
    })
    expect(nativeViewClipOf(input as unknown as Element)).toEqual({
      left: 10,
      top: 100,
      width: 380,
      height: 300,
    })
    expect(nativeViewScrollAncestors(input as unknown as Element)).toEqual([scroller])
    expect(nativeViewMaskOf(input as unknown as Element).length).toBeGreaterThan(0)
    expect(nativeViewVisibleAt(input as unknown as Element)).toBe(true)
  })

  test('reports hidden when an overlay owns the center point', () => {
    const input = element({ left: 20, top: 150, width: 200, height: 40 })
    const overlay = element({ left: 0, top: 0, width: 400, height: 800 })
    vi.stubGlobal('window', {
      innerWidth: 400,
      innerHeight: 800,
      getComputedStyle: (target: FakeElement) => target.style,
    })
    vi.stubGlobal('document', {
      elementFromPoint: () => overlay,
    })

    expect(nativeViewMaskOf(input as unknown as Element)).toEqual([])
    expect(nativeViewVisibleAt(input as unknown as Element)).toBe(false)
  })

  test('resolves the native view frame from padding and border content box', () => {
    const input = element(
      { left: 20, top: 150, width: 200, height: 40 },
      {
        paddingTop: '8px',
        paddingRight: '12px',
        paddingBottom: '8px',
        paddingLeft: '12px',
        borderTopWidth: '1px',
        borderRightWidth: '1px',
        borderBottomWidth: '1px',
        borderLeftWidth: '1px',
      },
    )
    vi.stubGlobal('window', {
      innerWidth: 400,
      innerHeight: 800,
      getComputedStyle: (target: FakeElement) => target.style,
    })

    expect(nativeViewContentFrameOf(input as unknown as Element)).toEqual({
      left: 33,
      top: 159,
      width: 174,
      height: 22,
    })
  })

  test('keeps the native view visible when only part of it is exposed', () => {
    const input = element({ left: 20, top: 150, width: 200, height: 40 })
    const overlay = element({ left: 0, top: 0, width: 400, height: 800 })
    vi.stubGlobal('window', {
      innerWidth: 400,
      innerHeight: 800,
      getComputedStyle: (target: FakeElement) => target.style,
    })
    vi.stubGlobal('document', {
      elementFromPoint: (x: number) => (x >= 50 ? overlay : input),
    })

    const mask = nativeViewMaskOf(input as unknown as Element)
    expect(mask.some((rect) => rect.left < 50)).toBe(true)
    expect(nativeViewVisibleAt(input as unknown as Element)).toBe(true)
  })

  test('reports hidden for display:none and visibility:hidden', () => {
    const input = element({ left: 20, top: 150, width: 200, height: 40 }, { display: 'none' })
    vi.stubGlobal('window', {
      innerWidth: 400,
      innerHeight: 800,
      getComputedStyle: (target: FakeElement) => target.style,
    })
    vi.stubGlobal('document', {
      elementFromPoint: () => input,
    })

    expect(nativeViewVisibleAt(input as unknown as Element)).toBe(false)
  })

  test('keeps a partially clipped view visible at the viewport edge', () => {
    const input = element({ left: 20, top: -60, width: 200, height: 100 })
    vi.stubGlobal('window', {
      innerWidth: 400,
      innerHeight: 800,
      getComputedStyle: (target: FakeElement) => target.style,
    })
    vi.stubGlobal('document', {
      elementFromPoint: () => input,
    })

    const mask = nativeViewMaskOf(input as unknown as Element)
    expect(mask.length).toBeGreaterThan(0)
    expect(mask.every((rect) => rect.top >= 0)).toBe(true)
    expect(nativeViewVisibleAt(input as unknown as Element)).toBe(true)
  })
})
