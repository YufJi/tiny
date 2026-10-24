import { describe, expect, test } from 'vitest'
import {
  isExternalAssetUrl,
  resolveAssetPath,
  rewriteCssAssetUrls,
  splitAssetSuffix,
} from '../src/assets'

describe('resolveAssetPath', () => {
  test('resolves page-relative paths', () => {
    expect(resolveAssetPath('pages/todos/todos', 'resources/logo.png'))
      .toBe('pages/todos/resources/logo.png')
  })

  test('resolves component-relative paths', () => {
    expect(resolveAssetPath('components/card/card', '../images/icon.png'))
      .toBe('components/images/icon.png')
  })

  test('resolves app-root paths', () => {
    expect(resolveAssetPath('pages/todos/todos', '/assets/logo.png'))
      .toBe('assets/logo.png')
  })

  test('allows parent traversal inside the app root', () => {
    expect(resolveAssetPath('pages/todos/todos', '../../shared/a.png'))
      .toBe('shared/a.png')
  })

  test('rejects paths that escape the app root', () => {
    expect(resolveAssetPath('pages/todos/todos', '../../../a.png')).toBeNull()
  })

  test('ignores external URLs and fragments', () => {
    expect(resolveAssetPath('pages/todos/todos', 'https://cdn.example/a.png')).toBeNull()
    expect(resolveAssetPath('pages/todos/todos', 'data:image/png;base64,abc')).toBeNull()
    expect(resolveAssetPath('pages/todos/todos', '//cdn.example/a.png')).toBeNull()
    expect(resolveAssetPath('pages/todos/todos', '#fragment')).toBeNull()
  })

  test('splits query and hash suffixes', () => {
    expect(splitAssetSuffix('a.png?v=1#preview')).toEqual({
      path: 'a.png',
      suffix: '?v=1#preview',
    })
    expect(splitAssetSuffix('a.png')).toEqual({ path: 'a.png', suffix: '' })
  })

  test('recognizes external URLs', () => {
    expect(isExternalAssetUrl('https://cdn.example/a.png')).toBe(true)
    expect(isExternalAssetUrl('data:image/png;base64,abc')).toBe(true)
    expect(isExternalAssetUrl('//cdn.example/a.png')).toBe(true)
    expect(isExternalAssetUrl('images/a.png')).toBe(false)
  })
})

describe('rewriteCssAssetUrls', () => {
  const resolve = (assetPath: string, context: { sourcePath: string }) => (
    `https://cdn.example/${assetPath}?source=${encodeURIComponent(context.sourcePath)}`
  )

  test('rewrites relative and app-root URLs', () => {
    const css = [
      '.a { background-image: url("../images/a.png"); }',
      '.b { background-image: url(/assets/b.png); }',
      '.c { background-image: url(./c.png); }',
    ].join('\n')
    const result = rewriteCssAssetUrls(css, 'pages/todos/todos.wxss', (assetPath) => (
      `https://cdn.example/${assetPath}`
    ))
    expect(result).toContain('url("https://cdn.example/pages/images/a.png")')
    expect(result).toContain('url("https://cdn.example/assets/b.png")')
    expect(result).toContain('url("https://cdn.example/pages/todos/c.png")')
  })

  test('leaves remote, data, fragment and variable URLs untouched', () => {
    const css = [
      '.a { background: url(https://cdn.example/a.png); }',
      '.b { mask: url("data:image/svg+xml,%3Csvg%3E"); }',
      '.c { background: url(#gradient); }',
      '.d { background: url(var(--bg)); }',
    ].join('\n')
    expect(rewriteCssAssetUrls(css, 'pages/todos/todos.wxss', resolve)).toBe(css)
  })

  test('preserves query and hash suffixes', () => {
    const css = '.a { background: url("./a.png?v=1#hero"); }'
    expect(rewriteCssAssetUrls(css, 'pages/todos/todos.wxss', (assetPath) => (
      `https://cdn.example/${assetPath}`
    ))).toContain('url("https://cdn.example/pages/todos/a.png?v=1#hero")')
  })

  test('leaves the original URL when the host cannot resolve it', () => {
    const css = '.a { background: url("./a.png"); }'
    expect(rewriteCssAssetUrls(css, 'pages/todos/todos.wxss', () => undefined)).toBe(css)
  })
})
