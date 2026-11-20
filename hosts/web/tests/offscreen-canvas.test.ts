import { describe, expect, test } from 'vitest'
import { createBrowserCanvasAdapter } from '../src/canvas-bridge'

describe('offscreen canvas adapter', () => {
  test('creates a usable standalone canvas handle', () => {
    const context = { fillStyle: '#000' }
    const adapter = createBrowserCanvasAdapter({
      createOffscreen: (width, height) => ({
        width,
        height,
        getContext: () => context,
      } as unknown as OffscreenCanvas),
    })
    const node = adapter.createOffscreenCanvas?.({ width: 120, height: 80 }) as {
      width: number
      height: number
      getContext(type: string): unknown
    }
    expect(node).toBeTruthy()
    expect(node.width).toBe(120)
    expect(node.height).toBe(80)
    expect(node.getContext('2d')).toBe(context)
  })

  test('returns null when the host cannot create one', () => {
    const adapter = createBrowserCanvasAdapter({ createOffscreen: () => null })
    expect(adapter.createOffscreenCanvas?.({ width: 10, height: 10 })).toBeNull()
  })
})
