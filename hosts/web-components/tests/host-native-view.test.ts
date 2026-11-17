import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  nativeViewContentFrameOf,
  nativeViewFrameOf,
  nativeViewMarkerClass,
  nativeViewStyleOf,
} from '../src/host-native-view'

type FakeElement = {
  getBoundingClientRect: () => { left: number; top: number; width: number; height: number }
  style: Record<string, string>
}

function element(
  rect: { left: number; top: number; width: number; height: number },
  style: Record<string, string> = {},
): FakeElement {
  return {
    getBoundingClientRect: () => rect,
    style: {
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
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('host native view', () => {
  test('builds a stable DOM marker for the same-layer owner', () => {
    expect(nativeViewMarkerClass('input-7')).toBe('tiny-native-view-input-7')
    expect(nativeViewMarkerClass('textarea:2')).toBe('tiny-native-view-textarea-2')
    expect(nativeViewMarkerClass('input 3')).toBe('tiny-native-view-input-3')
  })

  test('returns the element frame in viewport coordinates', () => {
    const input = element({ left: 20, top: 150, width: 200, height: 40 })
    vi.stubGlobal('window', { getComputedStyle: (target: FakeElement) => target.style })
    expect(nativeViewFrameOf(input as unknown as Element)).toEqual({
      left: 20,
      top: 150,
      width: 200,
      height: 40,
    })
  })

  test('does not report a frame without layout', () => {
    const empty = element({ left: 0, top: 0, width: 0, height: 0 })
    expect(nativeViewFrameOf(null)).toBeNull()
    expect(nativeViewFrameOf(empty as unknown as Element)).toBeNull()
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
      getComputedStyle: (target: FakeElement) => target.style,
    })

    expect(nativeViewContentFrameOf(input as unknown as Element)).toEqual({
      left: 33,
      top: 159,
      width: 174,
      height: 22,
    })
  })

  test('reports the text style consumed by the native control', () => {
    const input = element(
      { left: 20, top: 150, width: 200, height: 40 },
      {
        fontSize: '17px',
        lineHeight: '24px',
        color: 'rgb(1, 2, 3)',
        fontFamily: 'PingFang SC',
        fontWeight: '600',
        textAlign: 'center',
      },
    )
    vi.stubGlobal('window', {
      getComputedStyle: (target: FakeElement) => target.style,
    })

    expect(nativeViewStyleOf(input as unknown as Element)).toEqual({
      fontSize: 17,
      lineHeight: 24,
      color: 'rgb(1, 2, 3)',
      fontFamily: 'PingFang SC',
      fontWeight: '600',
      textAlign: 'center',
    })
  })

  test('falls back to a stable line height when CSS has no line box', () => {
    const input = element(
      { left: 0, top: 0, width: 100, height: 20 },
      { fontSize: '20px', lineHeight: 'normal' },
    )
    vi.stubGlobal('window', {
      getComputedStyle: (target: FakeElement) => target.style,
    })

    expect(nativeViewStyleOf(input as unknown as Element)).toEqual({
      fontSize: 20,
      lineHeight: 24,
    })
  })
})
