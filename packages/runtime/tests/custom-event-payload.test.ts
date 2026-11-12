import { describe, expect, test } from 'vitest'
import { cloneJsonSafe } from '../src/shared/data'

describe('custom event payload', () => {
  test('is JSON-safe before crossing the bridge', () => {
    const detail = {
      value: 1,
      run: () => undefined,
      nested: { ok: true },
      list: [1, () => undefined, 'x'],
    }
    const payload = {
      pageId: 'page-1',
      componentId: 'view-2',
      name: 'probe',
      detail: cloneJsonSafe(detail),
      options: cloneJsonSafe({ bubbles: true, composed: true }),
    }

    // The service clones `detail`/`options` with `cloneJsonSafe`; functions are
    // dropped (or become null inside arrays) so the bridge can serialize it.
    expect(() => JSON.stringify(payload)).not.toThrow()
    expect(payload.detail).toEqual({ value: 1, nested: { ok: true }, list: [1, null, 'x'] })
    expect(payload.options).toEqual({ bubbles: true, composed: true })
  })
})
