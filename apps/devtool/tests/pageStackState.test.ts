import { describe, expect, test } from 'vitest'
import { mergeSavedPageStack } from '../src/pageStackState'

describe('mergeSavedPageStack', () => {
  test('keeps data and exit state while the same live page reports state', () => {
    expect(mergeSavedPageStack(
      [{ pageId: 'page-1', path: 'pages/a/a', query: {} }],
      [{
        pageId: 'page-1',
        path: 'pages/a/a',
        query: {},
        data: { draft: 'kept' },
        savedExitState: { scrollTop: 12 },
      }],
    )).toEqual([{
      pageId: 'page-1',
      path: 'pages/a/a',
      query: {},
      data: { draft: 'kept' },
      savedExitState: { scrollTop: 12 },
    }])
  })

  test('does not copy state into a replacement page with the same route', () => {
    expect(mergeSavedPageStack(
      [{ pageId: 'page-2', path: 'pages/a/a', query: { id: '1' } }],
      [{
        pageId: 'page-1',
        path: 'pages/a/a',
        query: { id: '1' },
        data: { stale: true },
      }],
    )).toEqual([{ pageId: 'page-2', path: 'pages/a/a', query: { id: '1' } }])
  })

  test('preserves each entry by identity in a multi-page stack', () => {
    const first = {
      pageId: 'page-1',
      path: 'pages/a/a',
      query: {},
      data: { draft: 'a' },
    }
    const second = {
      pageId: 'page-2',
      path: 'pages/b/b',
      query: { from: 'a' },
      data: { draft: 'b' },
    }
    expect(mergeSavedPageStack([
      { pageId: 'page-1', path: 'pages/a/a', query: {} },
      { pageId: 'page-2', path: 'pages/b/b', query: { from: 'a' } },
    ], [first, second])).toEqual([first, second])
  })

  test('migrates legacy entries without page ids by stack slot', () => {
    expect(mergeSavedPageStack(
      [{ path: 'pages/a/a', query: { tab: 'one' } }],
      [{ path: 'pages/a/a', query: { tab: 'one' }, data: { legacy: true } }],
    )).toEqual([{
      path: 'pages/a/a',
      query: { tab: 'one' },
      data: { legacy: true },
    }])
  })
})
