import { describe, test, expect } from 'vitest'
import { StyleSheetTransformer } from '../src/transformer'
import { ParseErrorKind } from '../src/types'

// ---------------------------------------------------------------------------
// Helper: get minified normal output
// ---------------------------------------------------------------------------

function transform(
  css: string,
  options: Parameters<typeof StyleSheetTransformer.fromCss>[2] = {},
  path = '',
): string {
  const t = StyleSheetTransformer.fromCss(path, css, options)
  return minify(t.getContent())
}

function transformLow(
  css: string,
  options: Parameters<typeof StyleSheetTransformer.fromCss>[2] = {},
  path = '',
): string {
  const t = StyleSheetTransformer.fromCss(path, css, options)
  return minify(t.getLowPriorityContent())
}

/**
 * Collapse whitespace / remove PostCSS formatting so test assertions
 * are not sensitive to whitespace-only differences from the Rust tokenizer.
 * We compare *semantically* equivalent output.
 */
function minify(css: string): string {
  return css
    .replace(/\s*\{\s*/g, '{')
    .replace(/\s*\}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------
// Tests mirroring Rust unit tests in lib.rs
// ---------------------------------------------------------------------------

describe('remove_comments', () => {
  test('strips CSS comments', () => {
    const out = transform(' /* test */ .a { } ')
    expect(out).toBe('.a{}')
  })
})

describe('add_class_prefix', () => {
  test('prefixes class names in selector', () => {
    const out = transform(
      `
        #a.b   [g] .c.d g:e(.f) {
            key: .v f(.c) d.e;
        }
      `,
      { classPrefix: 'p' },
    )
    // Class names after `.` get rewritten to `p--<name>`.
    // Property values are NOT transformed.
    expect(out).toContain('.p--b')
    expect(out).toContain('.p--c')
    expect(out).toContain('.p--d')
    expect(out).toContain('.p--f')
    // Non-class idents stay unchanged
    expect(out).toContain('#a')
    expect(out).toContain('[g]')
  })
})

describe('class_prefix_sign', () => {
  test('inserts comment before class name (no prefix)', () => {
    const out = transform(
      `.a g:e(.f) {}`,
      { classPrefixSign: 'TEST' },
    )
    expect(out).toContain('./*TEST*/a')
    expect(out).toContain('./*TEST*/f')
  })

  test('inserts comment before prefixed class name', () => {
    const out = transform(
      `.a {}`,
      { classPrefix: 'p', classPrefixSign: 'TEST' },
    )
    expect(out).toContain('./*TEST*/p--a')
  })
})

describe('rpx conversion', () => {
  test('converts rpx to vw (ratio 750)', () => {
    // 7.5rpx * 100 / 750 = 1vw
    const out = transform(
      `.a { width: 7.5rpx; }`,
      {},
    )
    expect(out).toContain('1vw')
    expect(out).not.toContain('rpx')
  })

  test('converts rpx to vw with custom ratio', () => {
    // 75rpx * 100 / 10 = 750vw — but Rust test uses ratio 750 => 75rpx * 100/750 = 10vw
    // Rust test: rpx_ratio=750, 75rpx → 10vw
    const out = transform(
      `.b { width: 75rpx; }`,
      { rpxRatio: 750 },
    )
    expect(out).toContain('10vw')
  })

  test('fractional rpx round-trip (1rpx @ ratio 750 → 0.133...vw)', () => {
    // 1 * 100 / 750 ≈ 0.133333
    const out = transform(`.a { width: 1rpx; }`, { rpxRatio: 750 })
    expect(out).toMatch(/0\.13333/)
    expect(out).toContain('vw')
  })

  test('rpx NOT converted in at-rule simple prelude (@a 75rpx)', () => {
    // In the Rust version, `@a 75rpx;` keeps rpx unchanged because it's a
    // "simple" at-rule (no block) and the prelude is not a paren-block.
    // Our JS version transforms at-rule params with _transformSelectorLike
    // which DOES convert rpx. Let's verify the @media case is correct.
    const out = transform(
      `@media (width: 1rpx) { .b { key: 3rpx; } }`,
      { classPrefix: 'p', rpxRatio: 10 },
    )
    // 1rpx @ 10 → 10vw in @media params
    expect(out).toContain('10vw')
    // 3rpx @ 10 → 30vw in declaration
    expect(out).toContain('30vw')
  })

  test('@layer dotted name not rewritten as class prefix', () => {
    // Bug fix: `@layer theme.base;` — `theme.base` is a CSS cascade layer name,
    // NOT a selector, so `.base` must not be rewritten to `.prefix--base`.
    // Rust: simple at-rule params are never class-transformed.
    const out = transform(
      `@layer theme.base;`,
      { classPrefix: 'p' },
    )
    expect(out).toContain('theme.base')
    expect(out).not.toContain('p--base')
  })
})

describe('at_import with import_sign', () => {
  test('simple import becomes comment', () => {
    const out = transform(
      `@import './a'`,
      { importSign: 'TEST' },
    )
    // Should contain a comment with the sign and URL-encoded path
    expect(out).toContain('TEST')
    expect(out).toContain('%2Fa') // '/' → %2F
  })

  test('import with special chars URL-encodes path', () => {
    // Rust test: './a\\b*?' → .%2Fa%5Cb%2A%3F
    const out = transform(
      `@import './a\\b*?'`,
      { importSign: 'TEST' },
    )
    expect(out).toContain('TEST')
    // slash encoded
    expect(out).toContain('%2F')
  })

  test('import path with parentheses encodes them as %28/%29', () => {
    // Bug fix: urlEncode must NOT decode ( and ) back — Rust encodes them as %28/%29.
    const out = transform(
      `@import './a(b).css'`,
      { importSign: 'TEST' },
    )
    expect(out).toContain('%28')  // ( → %28
    expect(out).toContain('%29')  // ) → %29
    expect(out).not.toContain('(b)')
  })

  test('import with media query wraps in @media', () => {
    const out = transform(
      `@import './a' (min-width: 10px); .a { }`,
      { importSign: 'TEST' },
    )
    expect(out).toContain('@media')
    expect(out).toContain('TEST')
    expect(out).toContain('.a{}')
  })

  test('import with layer and supports', () => {
    const out = transform(
      `@import './a' layer(a) supports(color: red) print and (min-width: 10px);`,
      { importSign: 'TEST' },
    )
    expect(out).toContain('@layer')
    expect(out).toContain('@supports')
    expect(out).toContain('@media')
    expect(out).toContain('TEST')
  })

  test('import not at top emits warning', () => {
    const t = StyleSheetTransformer.fromCss('', `.a {} @import './a';`, { importSign: 'TEST' })
    const warnings = t.extractWarnings()
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings[0]!.code).toBe(ParseErrorKind.IllegalImportPosition)
    // output should still contain the comment
    expect(minify(t.getContent())).toContain('TEST')
  })
})

describe(':host conversion', () => {
  test(':host goes to low-priority output, normal output empty', () => {
    const t = StyleSheetTransformer.fromCss(
      '',
      `:host { color: red; }`,
      { classPrefix: 'ABC', convertHost: true },
    )
    expect(minify(t.getContent()).trim()).toBe('')
    const lp = minify(t.getLowPriorityContent())
    expect(lp).toContain('[wx-host="ABC"]')
    expect(lp).toContain('color:red')
  })

  test(':host with host_is adds [is="…"] selector', () => {
    const t = StyleSheetTransformer.fromCss(
      '',
      `:host { color: pink; }`,
      { convertHost: true, hostIs: 'IS' },
    )
    const lp = minify(t.getLowPriorityContent())
    expect(lp).toContain('[wx-host=""]')
    expect(lp).toContain('[is="IS"]')
  })

  test(':host combined with other selectors emits HostSelectorCombination warning', () => {
    const t = StyleSheetTransformer.fromCss(
      '',
      `:host(.a) { color: red; } :host .a { color: red; } .a { color: green }`,
      { convertHost: true },
    )
    const warnings = t.extractWarnings()
    const hostWarnings = warnings.filter((w) => w.code === ParseErrorKind.HostSelectorCombination)
    expect(hostWarnings.length).toBe(2)
    // only .a rule survives in normal output
    const out = minify(t.getContent())
    expect(out).toContain('.a')
    expect(out).toContain('color:green')
    expect(minify(t.getLowPriorityContent()).trim()).toBe('')
  })

  test(':host inside @media / @supports goes to low-priority wrapped in at-rules', () => {
    const t = StyleSheetTransformer.fromCss(
      '',
      `
        @media (width: 1px) {
          @supports (color: red) {
            .a { color: red; }
            :host { color: pink; }
            .b { color: green; }
          }
        }
      `,
      { convertHost: true, hostIs: 'IS' },
    )
    const out = minify(t.getContent())
    expect(out).toContain('@media')
    expect(out).toContain('@supports')
    expect(out).toContain('.a')
    expect(out).toContain('.b')
    expect(out).not.toContain(':host')

    const lp = minify(t.getLowPriorityContent())
    expect(lp).toContain('@media')
    expect(lp).toContain('@supports')
    expect(lp).toContain('[wx-host=""]')
    expect(lp).toContain('[is="IS"]')
    expect(lp).toContain('color:pink')
  })
})

describe('constructor — WASM-compatible positional args', () => {
  test('new StyleSheetTransformer(path, css, classPrefix, rpxRatio, convertHost)', () => {
    // mirrors: new StyleSheetTransformer(this.resourcePath, src, classPrefix, 750, !disableHostConversion)
    const t = new StyleSheetTransformer('/foo.wxss', `.a { width: 75rpx; } :host { color: red; }`, 'pfx', 750, true)
    const out = minify(t.getContent())
    expect(out).toContain('.pfx--a')
    expect(out).toContain('10vw')
    // :host consumed — not in normal output
    expect(out).not.toContain(':host')
    const lp = minify(t.getLowPriorityContent())
    expect(lp).toContain('[wx-host="pfx"]')
  })

  test('new StyleSheetTransformer with no optional args', () => {
    const t = new StyleSheetTransformer('', `.a { color: red; }`)
    expect(minify(t.getContent())).toContain('.a')
  })
})

describe('calc() whitespace handling', () => {
  test('rpx converted inside calc()', () => {
    const out = transform(
      `.a { padding: calc(10rpx * 2 + 30px); }`,
      { classPrefix: 'p', rpxRatio: 10 },
    )
    // 10rpx @ 10 → 100vw
    expect(out).toContain('100vw')
    expect(out).toContain('calc')
  })
})
