# @tiny/stylesheet-compiler

Stylesheet compiler for the Tiny runtime. It is a pure TypeScript/Node.js port of the [glass-easel](https://github.com/wechat-miniprogram/glass-easel) stylesheet compiler.

No native binaries or WASM required.

## Features

- Convert `rpx` units to `vw` (configurable ratio, default 750)
- Add class name prefixes for style isolation (e.g. `.foo` → `.prefix--foo`)
- Rewrite tag selectors to `host-tag:where(.marker)` so tag specificity is preserved
- Anchor selector-only rules (`*`, `#id`, bare pseudo-classes) with a generic `:where()` scope marker
- Optionally insert a marker comment before class names (for tooling)
- Process `@import` rules: replace with a URL-encoded comment marker
- Convert `:host` selectors to attribute selectors (`[wx-host="…"]`) for shadow-DOM emulation, with a separate low-priority output
- Strip all CSS comments
- Generate source maps via PostCSS

## Installation

```sh
pnpm add @tiny/stylesheet-compiler
```

## Usage

### Drop-in replacement for the WASM version

The constructor signature is identical to the original Rust WASM binding, so existing callers require no changes:

```js
const { StyleSheetTransformer } = require('@tiny/stylesheet-compiler')

const sst = new StyleSheetTransformer(
  '/path/to/file.wxss', // file path (used in source map)
  cssContent,           // CSS source string
  'my-prefix',         // classPrefix (optional)
  750,                  // rpxRatio   (optional, default 750)
  true,                 // convertHost (optional, default false)
)

// Normal (high-priority) output
const css = sst.getContent()
const sourceMap = sst.getSourceMap() // JSON string

// Low-priority output (converted :host rules)
const lpCss = sst.getLowPriorityContent()
const lpSourceMap = sst.getLowPrioritySourceMap()

// Warnings (e.g. illegal @import position, invalid :host combination)
const warnings = sst.extractWarnings()

// No-op in the JS version; provided for API compatibility with the WASM version
sst.free()
```

### Advanced options via `StyleSheetTransformer.fromCss`

Use the static factory for options not available in the positional constructor:

```ts
import { StyleSheetTransformer } from '@tiny/stylesheet-compiler'

const sst = StyleSheetTransformer.fromCss('/path/to/file.wxss', cssContent, {
  classPrefix: 'my-prefix',
  classPrefixSign: 'SIGN',   // inserts /*SIGN*/ before each transformed class name
  tagClassPrefix: 'my-prefix--tiny-tag-', // tag selector marker classes
  scopeMarkerClass: 'tiny-scope', // generic element scope marker
  scopeHostAttribute: 'wx-host', // include page root in page-scope anchors
  forceScopeAnchor: true,         // anchor class/tag compounds too (app-global CSS)
  rpxRatio: 750,
  importSign: 'IMPORT',      // replaces @import with /*IMPORT .url-encoded-path*/
  convertHost: true,
  hostIs: 'my-component',    // also emits [is="my-component"] alongside [wx-host="…"]
  hostAttribute: 'wx-host', // override the host marker attribute (default wx-host)
})
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `classPrefix` | `string` | — | Prefix added to class names: `.foo` → `.prefix--foo` |
| `classPrefixSign` | `string` | — | Comment inserted before each transformed class name: `.foo` → `./*SIGN*/foo` |
| `tagClassPrefix` | `string` | — | Prefix for tag marker classes: `button` → `.prefix--tiny-tag-button` |
| `componentTags` | `string[]` | — | Custom component tags rewritten to `tiny-<tag>` host selectors |
| `scopeMarkerClass` | `string` | — | Generic element marker class used to anchor selectors without a class/tag anchor |
| `scopeHostAttribute` | `string` | — | Host attribute included in scope anchors so the page root is matched; with no `classPrefix`, `scopeMarkerClass` supplies the placeholder value |
| `forceScopeAnchor` | `boolean` | `false` | Anchor every compound, including class/tag-anchored ones; used for app-global styles |
| `rpxRatio` | `number` | `750` | Ratio for `rpx` → `vw` conversion: `value * 100 / ratio` |
| `importSign` | `string` | — | When set, `@import './a'` is replaced with `/*SIGN .%2Fa*/` |
| `convertHost` | `boolean` | `false` | Convert `:host {}` to `[wx-host="prefix"] {}` in low-priority output |
| `hostIs` | `string` | — | When `convertHost` is true, also emit `[is="hostIs"]` in the selector |
| `hostAttribute` | `string` | `wx-host` | Host marker attribute used by `convertHost` |

## Warnings

`extractWarnings()` returns an array of `StyleSheetParseError` objects:

```ts
interface StyleSheetParseError {
  isError: boolean       // true if level >= Error (compilation blocked)
  level: ParseErrorLevel // Note | Warn | Error | Fatal
  code: number           // ParseErrorKind numeric code
  message: string
  path: string
  startLine: number      // 0-based
  startColumn: number    // 0-based, UTF-16 columns
  endLine: number
  endColumn: number
}
```

| Code | Kind | Level | Description |
|------|------|-------|-------------|
| `0x10001` | `UnexpectedCharacter` | Fatal | Unexpected token in `@import` |
| `0x10002` | `IllegalImportPosition` | Note | `@import` not at the top of the file |
| `0x10003` | `HostSelectorCombination` | Warn | `:host` combined with other selectors |

## Transformation examples

### Class prefix

```css
/* Input */
#a.b [g] .c.d { color: red; }

/* Output (classPrefix: "p") */
#a.p--b [g] .p--c.p--d { color: red; }
```

### rpx → vw

```css
/* Input */
.a { width: 75rpx; }

/* Output (rpxRatio: 750) */
.a { width: 10vw; }
```

### `:host` conversion

```css
/* Input */
:host { color: red; }
```

```css
/* Normal output: empty */

/* Low-priority output (classPrefix: "abc", hostIs: "my-comp") */
[wx-host="abc"],[is="my-comp"] { color: red; }
```

### `@import` sign

```css
/* Input */
@import './theme.wxss';

/* Output (importSign: "IMPORT") */
/*IMPORT .%2Ftheme.wxss*/
```

## Building

```sh
pnpm --filter @tiny/stylesheet-compiler build
pnpm --filter @tiny/stylesheet-compiler test
```

## Relation to the Rust/WASM version

The implementation follows the upstream [`glass-easel-stylesheet-compiler`](https://github.com/wechat-miniprogram/glass-easel/tree/master/glass-easel-stylesheet-compiler) behavior, but is maintained here as the Tiny workspace package `@tiny/stylesheet-compiler`.
