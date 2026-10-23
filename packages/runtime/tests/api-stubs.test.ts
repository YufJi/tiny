import { describe, expect, test } from 'vitest'
import { normalizeTransportDiagnostic } from '../src/diagnostics'
import { createServiceApiHost, type ServiceApiContext } from '../src/service'

function createContext() {
  const diagnostics: unknown[][] = []
  const context = {
    connection: {
      sendDiagnostic: (...args: unknown[]) => diagnostics.push(args),
      call: () => Promise.resolve(undefined),
    },
    getSystemInfoSnapshot: () => ({ pixelRatio: 1, windowWidth: 0, windowHeight: 0 }),
    getStorageSnapshot: () => ({}),
    setStorageSnapshot: () => {},
    pageId: 'page-1',
  } as unknown as ServiceApiContext
  return { context, diagnostics }
}

describe('P0 API stubs', () => {
  test('createAnimation is chainable and exports CSS transitions', () => {
    const { context } = createContext()
    const animation = createServiceApiHost(context).createAnimation() as Record<string, (...args: unknown[]) => unknown>
    expect(animation.scale!(2, 2).rotate!(45).step!()).toBe(animation)
    expect(animation.export!()).toContain('transform: scale(2, 2) rotate(45deg)')
    expect(animation.export!()).toContain('transition: all 400ms linear 0ms')
  })

  test('createCanvasContext tolerates any drawing call', () => {
    const { context } = createContext()
    const canvas = createServiceApiHost(context).createCanvasContext() as Record<string, (...args: unknown[]) => unknown>
    expect(() => canvas.setFillStyle!('red')).not.toThrow()
    expect(() => canvas.fillRect!(0, 0, 10, 10)).not.toThrow()
    expect(() => canvas.draw!()).not.toThrow()
  })
})

describe('transport diagnostics', () => {
  test('uses the transport level when no severity is provided', () => {
    expect(normalizeTransportDiagnostic({}, 'service', undefined, 'warn').severity).toBe('warning')
    expect(normalizeTransportDiagnostic({}, 'service', undefined, 'log').severity).toBe('info')
    expect(normalizeTransportDiagnostic({}, 'service', undefined, 'error').severity).toBe('error')
  })

  test('keeps an explicit severity', () => {
    expect(normalizeTransportDiagnostic({ severity: 'state' }, 'service', undefined, 'warn').severity).toBe('state')
  })
})
