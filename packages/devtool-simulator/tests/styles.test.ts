import { describe, expect, test } from 'vitest'
import { getPreviewDevice } from '../src/device'
import { resolvePreviewSafeArea } from '../src/styles'

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

  test('resolves safe area against the selected device profile', () => {
    expect(resolvePreviewSafeArea(
      'padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);',
      getPreviewDevice('iphone-14-pro-max'),
    )).toBe('padding: 59px 0 34px;')
  })
})
