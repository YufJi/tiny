import { describe, expect, test } from 'vitest'
import type { DataPatch } from '../src/data'
import { MiniProgramPageInstance } from '../src/service/page-instance'

function createPage(options: Record<string, unknown> = { data: { a: 0 } }) {
  const patches: Array<{ pageId: string; patch: DataPatch }> = []
  const page = new MiniProgramPageInstance(
    'page-1',
    'pages/index/index',
    options as never,
    {},
    (pageId, patch) => patches.push({ pageId, patch }),
  )
  return { page, patches }
}

describe('setData', () => {
  test('applies the patch before the callback runs', () => {
    const { page, patches } = createPage()
    const seen: unknown[] = []
    page.setData({ a: 1 }, () => seen.push(page.data.a))
    expect(seen).toEqual([1])
    expect(page.data.a).toBe(1)
    expect(patches).toEqual([{ pageId: 'page-1', patch: { a: 1 } }])
  })

  test('a callback may schedule another patch', () => {
    const { page, patches } = createPage()
    const seen: unknown[] = []
    page.setData({ a: 1 }, () => {
      seen.push(page.data.a)
      page.setData({ a: 2, b: 'x' }, () => seen.push(page.data.a))
    })
    expect(seen).toEqual([1, 2])
    expect(page.data).toMatchObject({ a: 2, b: 'x' })
    expect(patches).toHaveLength(2)
    // The host receives each patch as its own message, in call order.
    expect(patches.map((entry) => entry.patch)).toEqual([{ a: 1 }, { a: 2, b: 'x' }])
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

  test('rejects writes after the page unloaded', () => {
    const { page } = createPage()
    page.triggerLifecycle('onUnload')
    expect(() => page.setData({ a: 2 })).toThrow(/unloaded/)
  })
})
