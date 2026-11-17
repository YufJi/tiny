import { describe, expect, test } from 'vitest'
import { BUILTIN_HOST_STYLES } from '../src'

function rule(selector: string): string {
  const start = BUILTIN_HOST_STYLES.indexOf(selector)
  if (start === -1) return ''
  const open = BUILTIN_HOST_STYLES.indexOf('{', start)
  const close = BUILTIN_HOST_STYLES.indexOf('}', open)
  return BUILTIN_HOST_STYLES.slice(start, close + 1)
}

describe('button 3.17.5 WebView styles', () => {
  test('uses the WebView block box, typography and hairline pseudo border', () => {
    const base = rule('tiny-button')
    expect(base).toContain('display: block;')
    expect(base).toContain('padding-left: 14px;')
    expect(base).toContain('padding-right: 14px;')
    expect(base).toContain('font-size: 18px;')
    expect(base).toContain('line-height: 2.55555556;')
    expect(base).toContain('border-radius: 5px;')
    expect(base).toContain('color: #000000;')
    expect(base).toContain('background-color: #f8f8f8;')
    expect(base).not.toContain('display: flex;')
    expect(base).not.toContain('border: 0.5px')
    expect(rule('tiny-button::after')).toContain('border: 1px solid rgba(0, 0, 0, 0.2);')
    expect(rule('tiny-button::after')).toContain('border-radius: 10px;')
    expect(rule('tiny-button::after')).toContain('transform: scale(0.5);')
    expect(rule('tiny-button[hidden]')).toContain('display: none !important;')
    expect(BUILTIN_HOST_STYLES).not.toContain('width: 184px;')
    expect(BUILTIN_HOST_STYLES).not.toContain('font-size: 17px;')
    expect(BUILTIN_HOST_STYLES).not.toContain('font-weight: 700;')
  })

  test('matches the WebView type and disabled tokens', () => {
    expect(rule('tiny-button[type=default]')).toContain('color: #000000;')
    expect(rule('tiny-button[type=default]')).toContain('background-color: #f8f8f8;')
    expect(rule('tiny-button[type=primary]')).toContain('background-color: #1aad19;')
    expect(rule('tiny-button[type=warn]')).toContain('background-color: #e64340;')
    expect(rule('tiny-button[disabled]:not([type])')).toContain('color: rgba(0, 0, 0, 0.3);')
    expect(rule('tiny-button[disabled]:not([type])')).toContain('background-color: #f7f7f7;')
    expect(rule('tiny-button[disabled][type=primary]')).toContain('background-color: #9ed99d;')
    expect(rule('tiny-button[disabled][type=warn]')).toContain('background-color: #ec8b89;')
  })

  test('keeps plain and disabled precedence identical to WeChat', () => {
    expect(rule('tiny-button[plain]')).toContain('background-color: transparent;')
    expect(rule('tiny-button[plain]')).toContain('border: 1px solid #353535;')
    expect(rule('tiny-button[type=primary][plain]')).toContain('color: #1aad19;')
    expect(rule('tiny-button[type=warn][plain]')).toContain('color: #e64340;')
    expect(rule('tiny-button[plain][disabled]')).toContain('color: rgba(0, 0, 0, 0.2);')
    expect(rule('tiny-button[plain][disabled]')).not.toContain('background-color: transparent;')
    expect(rule('tiny-button[plain]::after')).toContain('border-width: 0;')
  })

  test('matches mini, loading and hover state layering', () => {
    const mini = rule('tiny-button[size=mini]')
    expect(mini).toContain('display: inline-block;')
    expect(mini).toContain('font-size: 13px;')
    expect(mini).toContain('line-height: 2.3;')
    expect(mini).toContain('padding: 0 1.34em;')
    expect(mini).not.toContain('width: auto;')

    const loading = rule('tiny-button[loading]::before')
    expect(loading).toContain('display: inline-block;')
    expect(loading).toContain('vertical-align: middle;')
    expect(loading).toContain('background: transparent url(')
    expect(loading).toContain('background-size: 100%;')
    expect(rule('tiny-button[loading][type=primary]')).toContain('background-color: #179b16;')
    expect(rule('tiny-button[loading][type=default]')).toContain('background-color: #dedede;')
    expect(rule('tiny-button[loading][type=warn]')).toContain('background-color: #ce3c39;')
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-button[loading] {')

    expect(rule('tiny-button.button-hover')).toContain('background-color: #dedede;')
    expect(rule('tiny-button.button-hover[type=primary]')).toContain('background-color: #179b16;')
    expect(rule('tiny-button.button-hover[type=warn]')).toContain('background-color: #ce3c39;')
  })
})
