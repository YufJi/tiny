import { describe, expect, test } from 'vitest'
import type { DataPatch } from '../src/shared/data'
import { MiniProgramPageInstance } from '../src/service/page/instance'

type PendingCompletion = { pageId: string; run: () => void }

function createPage(
  options: Record<string, unknown> = { data: { a: 0 } },
  hooks: { afterRender?: (pageId: string, callback: () => void) => void } = {},
) {
  const patches: Array<{ pageId: string; patch: DataPatch }> = []
  const diagnostics: Array<{ code: string; message: string; details?: unknown }> = []
  const page = new MiniProgramPageInstance({
    pageId: 'page-1',
    path: 'pages/index/index',
    options: options as never,
    onDataPatch: (pageId, patch) => patches.push({ pageId, patch }),
    onDiagnostic: (code, message, details) => diagnostics.push({ code, message, details }),
    ...(hooks.afterRender ? { afterRender: hooks.afterRender } : {}),
  })
  return { page, patches, diagnostics }
}

describe('setData', () => {
  test('applies the patch synchronously but runs the callback after the render acknowledgement', () => {
    const pending: PendingCompletion[] = []
    const { page, patches } = createPage(undefined, {
      afterRender: (pageId, callback) => pending.push({ pageId, run: callback }),
    })
    const seen: unknown[] = []
    page.setData({ a: 1 }, () => seen.push(page.data.a))

    expect(page.data.a).toBe(1)
    expect(patches).toEqual([{ pageId: 'page-1', patch: { a: 1 } }])
    // The completion is not a data hook: it waits for the render thread.
    expect(seen).toEqual([])
    expect(pending).toHaveLength(1)
    expect(pending[0]?.pageId).toBe('page-1')

    pending[0]!.run()
    expect(seen).toEqual([1])
  })

  test('keeps callback order for consecutive and nested patches', () => {
    const pending: PendingCompletion[] = []
    const { page, patches } = createPage(undefined, {
      afterRender: (pageId, callback) => pending.push({ pageId, run: callback }),
    })
    const seen: string[] = []
    page.setData({ a: 1 }, () => {
      seen.push('first')
      page.setData({ a: 2, b: 'x' }, () => seen.push('nested'))
    })
    page.setData({ b: 'y' }, () => seen.push('second'))

    expect(pending).toHaveLength(2)
    // Both calls belong to the same render batch, so the render thread
    // acknowledges them together and the callbacks run in call order.
    pending[0]!.run()
    pending[1]!.run()
    expect(seen).toEqual(['first', 'second'])
    expect(page.data).toMatchObject({ a: 2, b: 'x' })
    expect(patches.map((entry) => entry.patch)).toEqual([
      { a: 1 },
      { b: 'y' },
      { a: 2, b: 'x' },
    ])
    // The nested patch is a new batch and completes on its own acknowledgement.
    pending[2]!.run()
    expect(seen).toEqual(['first', 'second', 'nested'])
  })

  test('clones the patch so later mutations do not leak into data', () => {
    const { page, patches } = createPage()
    const payload = { nested: { y: 1, dropped: undefined } }
    page.setData(payload)
    payload.nested.y = 99
    expect(page.data.nested).toEqual({ y: 1 })
    expect(patches[0]?.patch).toEqual({ nested: { y: 1 } })
  })

  test('path patches keep the rest of the object intact', () => {
    const { page } = createPage({ data: { list: [{ done: false }, { done: false }], title: 't' } })
    page.setData({ 'list[1].done': true })
    expect(page.data.list).toEqual([{ done: false }, { done: true }])
    expect(page.data.title).toBe('t')
  })

  test('without a render thread the callback still runs asynchronously', async () => {
    const { page } = createPage()
    const seen: unknown[] = []
    page.setData({ a: 1 }, () => seen.push(page.data.a))
    expect(seen).toEqual([])
    await Promise.resolve()
    expect(seen).toEqual([1])
  })

  test('reports a callback error instead of throwing out of setData', async () => {
    const { page, diagnostics } = createPage()
    expect(() => page.setData({ a: 1 }, () => {
      throw new Error('boom')
    })).not.toThrow()
    await Promise.resolve()
    expect(diagnostics).toMatchObject([{ code: 'SET_DATA_CALLBACK_ERROR', message: 'boom' }])
  })

  test('rejects writes after the page unloaded', () => {
    const { page } = createPage()
    page.triggerLifecycle('onUnload')
    expect(() => page.setData({ a: 2 })).toThrow(/unloaded/)
  })
})
