import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createHost(canvas: unknown) {
  const diagnostics: unknown[] = []
  const connection = {
    sendDiagnostic: (_level: string, payload: unknown) => diagnostics.push(payload),
    call: () => Promise.resolve({}),
    callSync: () => undefined,
  }
  const context = {
    connection,
    canvas,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    launchOptions: {},
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ApiContext
  return {
    host: createApiHost(context) as unknown as Record<string, (...args: unknown[]) => any>,
    diagnostics,
  }
}

describe('createOffscreenCanvas', () => {
  test('returns the host canvas synchronously', () => {
    const canvas = { width: 120, height: 80, getContext: () => ({}) }
    const { host } = createHost({
      createOffscreenCanvas: (request: { width: number; height: number }) => {
        canvas.width = request.width
        canvas.height = request.height
        return canvas
      },
    })
    expect(host.createOffscreenCanvas({ width: 120, height: 80, type: '2d' })).toBe(canvas)
  })

  test('reports a diagnostic and returns null when the host lacks the capability', () => {
    const { host, diagnostics } = createHost({})
    expect(host.createOffscreenCanvas({ width: 10, height: 10 })).toBeNull()
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]).toMatchObject({ message: expect.stringContaining('createOffscreenCanvas') })
  })
})
