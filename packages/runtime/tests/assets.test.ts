import { describe, expect, test } from 'vitest'
import { mapCssAssetUrls, resolveAssetReference } from '../src/assets'

describe('resolveAssetReference', () => {
  test('resolves page-relative paths', () => {
    expect(resolveAssetReference('pages/todos/todos', 'resources/logo.png'))
      .toEqual({ path: 'pages/todos/resources/logo.png', suffix: '' })
  })

  test('resolves component-relative paths', () => {
    expect(resolveAssetReference('components/card/card', '../images/icon.png'))
      .toEqual({ path: 'components/images/icon.png', suffix: '' })
  })

  test('resolves app-root paths', () => {
    expect(resolveAssetReference('pages/todos/todos', '/assets/logo.png'))
      .toEqual({ path: 'assets/logo.png', suffix: '' })
  })

  test('allows parent traversal inside the app root', () => {
    expect(resolveAssetReference('pages/todos/todos', '../../shared/a.png'))
      .toEqual({ path: 'shared/a.png', suffix: '' })
  })

  test('rejects paths that escape the app root', () => {
    expect(resolveAssetReference('pages/todos/todos', '../../../a.png')).toBeNull()
  })

  test('ignores external URLs and fragments', () => {
    expect(resolveAssetReference('pages/todos/todos', 'https://cdn.example/a.png')).toBeNull()
    expect(resolveAssetReference('pages/todos/todos', 'data:image/png;base64,abc')).toBeNull()
    expect(resolveAssetReference('pages/todos/todos', '//cdn.example/a.png')).toBeNull()
    expect(resolveAssetReference('pages/todos/todos', '#fragment')).toBeNull()
  })

  test('keeps query and hash suffixes on resolved references', () => {
    expect(resolveAssetReference('pages/todos/todos', '../images/a.png?v=1#preview')).toEqual({
      path: 'pages/images/a.png',
      suffix: '?v=1#preview',
    })
  })
})

describe('mapCssAssetUrls', () => {
  const resolve = (assetPath: string, context: { sourcePath: string }) => (
    `https://cdn.example/${assetPath}?source=${encodeURIComponent(context.sourcePath)}`
  )

  test('maps compiler-normalized app-root URLs', () => {
    const css = [
      '.a { background-image: url("/pages/images/a.png"); }',
      '.b { background-image: url(/assets/b.png); }',
    ].join('\n')
    const result = mapCssAssetUrls(css, (assetPath) => (
      `https://cdn.example/${assetPath}`
    ))
    expect(result).toContain('url("https://cdn.example/pages/images/a.png")')
    expect(result).toContain('url("https://cdn.example/assets/b.png")')
  })

  test('leaves relative, remote, data, fragment and variable URLs untouched', () => {
    const css = [
      '.a { background: url("./a.png"); }',
      '.b { background: url(https://cdn.example/a.png); }',
      '.c { mask: url("data:image/svg+xml,%3Csvg%3E"); }',
      '.d { background: url(#gradient); }',
      '.e { background: url(var(--bg)); }',
    ].join('\n')
    expect(mapCssAssetUrls(css, resolve)).toBe(css)
  })

  test('preserves query and hash suffixes', () => {
    const css = '.a { background: url("/pages/todos/a.png?v=1#hero"); }'
    expect(mapCssAssetUrls(css, (assetPath) => (
      `https://cdn.example/${assetPath}`
    ))).toContain('url("https://cdn.example/pages/todos/a.png?v=1#hero")')
  })

  test('leaves the original URL when the host cannot resolve it', () => {
    const css = '.a { background: url("/pages/todos/a.png"); }'
    expect(mapCssAssetUrls(css, () => undefined)).toBe(css)
  })

  test('uses the host policy for protocol-relative network URLs', () => {
    const css = '@font-face { src: url(//cdn.example/icon.woff2) format("woff2"); }'
    expect(mapCssAssetUrls(css, resolve, (url) => `https:${url}`))
      .toContain('url("https://cdn.example/icon.woff2")')
    expect(mapCssAssetUrls(css, resolve)).toBe(css)
  })
})
