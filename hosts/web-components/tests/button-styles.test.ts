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
  test('uses the current WeUI default box and typography', () => {
    const base = rule('tiny-button')
    expect(base).toContain('display: flex;')
    expect(base).toContain('padding: 8px 24px;')
    expect(base).toContain('font-size: 17px;')
    expect(base).toContain('font-weight: 700;')
    expect(base).toContain('line-height: 1.41176471;')
    expect(base).toContain('border-radius: 4px;')
    expect(base).toContain('border: 0.5px solid rgba(0, 0, 0, 0.2);')
    expect(rule('tiny-button:not([size=mini])')).toContain('width: 184px;')
    expect(rule('tiny-button:not([size=mini])')).toContain('margin-left: auto;')
    expect(rule('tiny-button:not([size=mini])')).toContain('margin-right: auto;')
    expect(BUILTIN_HOST_STYLES).not.toContain('line-height: 2.55555556;')
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-button::after')
  })

  test('matches the WebUI type, plain, disabled and mini tokens', () => {
    expect(rule('tiny-button[type=default]')).toContain('color: #06ae56;')
    expect(rule('tiny-button[type=default]')).toContain('background-color: #f2f2f2;')
    expect(rule('tiny-button:not([type])')).toContain('color: #06ae56;')
    expect(rule('tiny-button[type=primary]')).toContain('background-color: #07c160;')
    expect(rule('tiny-button[type=warn]')).toContain('color: #fa5151;')
    expect(rule('tiny-button[type=warn]')).toContain('background-color: #f2f2f2;')
    expect(rule('tiny-button[type=primary][plain]')).toContain('border-color: #179c16;')
    expect(rule('tiny-button[plain][disabled]')).toContain('background-color: transparent;')
    expect(rule('tiny-button[disabled]:not([plain])')).toContain('background-color: #fafafa;')
    expect(rule('tiny-button[disabled]:not([plain])')).toContain('color: rgba(0, 0, 0, 0.18);')
    expect(rule('tiny-button[size=mini]')).toContain('font-size: 16px;')
    expect(rule('tiny-button[size=mini]')).toContain('line-height: 2;')
    expect(rule('tiny-button[size=mini]')).toContain('padding: 0 0.75em;')
  })

  test('keeps the loading spinner on the current layering', () => {
    const loading = rule('tiny-button[loading]::before')
    expect(loading).toContain('display: block;')
    expect(loading).toContain('background: transparent url(')
    expect(loading).toContain('no-repeat center / 18px 18px;')
    expect(rule('tiny-button[loading][type=primary]')).toContain('background-color: #06ad56;')
    expect(rule('tiny-button.button-hover[type=primary]')).toContain('background-color: #06ad56;')
  })
})
