import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createContext() {
  const diagnostics: unknown[][] = []
  const context = {
    connection: {
      sendDiagnostic: (...args: unknown[]) => diagnostics.push(args),
      call: () => Promise.resolve(undefined),
    },
    pageId: 'page-1',
  } as unknown as ApiContext
  return { context, diagnostics }
}

describe('P0 API stubs', () => {
  test('createAnimation is chainable and exports CSS transitions', () => {
    const { context } = createContext()
    const animation = createApiHost(context).createAnimation() as Record<string, (...args: unknown[]) => unknown>
    expect(animation.scale!(2, 2).rotate!(45).step!()).toBe(animation)
    expect(animation.export!()).toContain('transform: scale(2, 2) rotate(45deg)')
    expect(animation.export!()).toContain('transition: all 400ms linear 0ms')
  })

  test('createCanvasContext tolerates any drawing call', () => {
    const { context } = createContext()
    const canvas = createApiHost(context).createCanvasContext() as Record<string, (...args: unknown[]) => unknown>
    expect(() => canvas.setFillStyle!('red')).not.toThrow()
    expect(() => canvas.fillRect!(0, 0, 10, 10)).not.toThrow()
    expect(() => canvas.draw!()).not.toThrow()
  })
})
