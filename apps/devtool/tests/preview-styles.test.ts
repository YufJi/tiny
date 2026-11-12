import { describe, expect, test } from 'vitest'
import { resolvePreviewSafeArea } from '../src/previewStyles'

describe('preview safe area CSS', () => {
  test('resolves env() and constant() against the preview device', () => {
    expect(resolvePreviewSafeArea([
      'padding-top: env(safe-area-inset-top);',
      'padding-right: constant(safe-area-inset-right);',
      'padding-bottom: calc(10px + env(safe-area-inset-bottom));',
      'padding-left: env(safe-area-inset-left, 0px);',
    ].join('\n'))).toBe([
      'padding-top: 44px;',
      'padding-right: 0px;',
      'padding-bottom: calc(10px + 34px);',
      'padding-left: 0px;',
    ].join('\n'))
  })

  test('leaves unrelated environment expressions untouched', () => {
    expect(resolvePreviewSafeArea('height: env(viewport-segment-height);'))
      .toBe('height: env(viewport-segment-height);')
  })
})
