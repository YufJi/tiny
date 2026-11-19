import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'
import { animationToStyle } from '../src/animation'

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
  test('createAnimation records actions and exports WeChat action objects', () => {
    const { context } = createContext()
    const animation = createApiHost(context).createAnimation() as Record<string, (...args: unknown[]) => unknown>
    expect(animation.scale!(2, 2).rotate!(45).step!()).toBe(animation)
    const exported = animation.export!() as {
      actions: Array<{
        animates: Array<{ type: string; args: unknown[] }>
        option: { transformOrigin: string; transition: Record<string, unknown> }
      }>
    }
    expect(exported.actions).toHaveLength(1)
    expect(exported.actions[0]!.animates).toEqual([
      { type: 'scale', args: [2, 2] },
      { type: 'rotate', args: [45] },
    ])
    const styled = animationToStyle(exported.actions[0]!)
    expect(styled.transform).toBe('scale(2,2) rotate(45deg)')
    expect(styled.transition).toBe('400ms linear 0ms')
    // `export()` clears committed actions like WeChat.
    expect((animation.export!() as { actions: unknown[] }).actions).toEqual([])
  })

  test('animationToStyle handles style actions and px/deg units', () => {
    const styled = animationToStyle({
      animates: [
        { type: 'translate', args: [10, '2em'] },
        { type: 'style', args: ['opacity', 0.5] },
      ],
      option: { transformOrigin: '0 0', transition: { duration: 200, timingFunction: 'ease', delay: 50 } },
    })
    expect(styled.transform).toBe('translate(10px,2em)')
    expect(styled.style).toEqual({ opacity: 0.5 })
    expect(styled.transitionProperty).toBe('transform,opacity')
    expect(styled.transition).toBe('200ms ease 50ms')
    expect(styled.transformOrigin).toBe('0 0')
  })

  test('createCanvasContext tolerates any drawing call', () => {
    const { context } = createContext()
    const canvas = createApiHost(context).createCanvasContext() as Record<string, (...args: unknown[]) => unknown>
    expect(() => canvas.setFillStyle!('red')).not.toThrow()
    expect(() => canvas.fillRect!(0, 0, 10, 10)).not.toThrow()
    expect(() => canvas.draw!()).not.toThrow()
  })
})
