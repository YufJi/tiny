import { describe, expect, test } from 'vitest'
import { createPageIntrospectionHandlers } from '../src/page-introspection'

function frame(document: Record<string, unknown> | null) {
  return { contentDocument: document as never }
}

describe('page introspection', () => {
  test('reads the selection of the focused input', () => {
    const handlers = createPageIntrospectionHandlers({
      frames: () => [
        frame({ activeElement: { tagName: 'DIV' } }),
        frame({ activeElement: { tagName: 'INPUT', selectionStart: 3, selectionEnd: 7 } }),
      ],
    })
    expect(handlers['page.selectedTextRange']({})).toEqual({
      start: 3,
      end: 7,
      errMsg: 'getSelectedTextRange:ok',
    })
  })

  test('falls back to zero without a focused input', () => {
    const handlers = createPageIntrospectionHandlers({ frames: () => [frame({ activeElement: null })] })
    expect(handlers['page.selectedTextRange']({})).toMatchObject({ start: 0, end: 0 })
  })

  test('reports picture-in-picture from any readable frame', () => {
    const handlers = createPageIntrospectionHandlers({
      frames: () => [frame({}), frame({ pictureInPictureElement: {} })],
    })
    expect(handlers['page.pipActive']({})).toEqual({
      isActive: true,
      errMsg: 'checkIsPictureInPictureActive:ok',
    })
  })

  test('a cross-origin frame is skipped instead of throwing', () => {
    const handlers = createPageIntrospectionHandlers({
      frames: () => [{
        get contentDocument(): never {
          throw new Error('cross-origin')
        },
      }],
    })
    expect(handlers['page.selectedTextRange']({})).toMatchObject({ start: 0, end: 0 })
    expect(handlers['page.pipActive']({})).toMatchObject({ isActive: false })
  })
})
