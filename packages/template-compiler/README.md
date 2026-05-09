# glass-easel-template-compiler-js

The template compiler for the [glass-easel](https://github.com/wechat-miniprogram/glass-easel) project — a pure TypeScript/Node.js port of the original Rust/WebAssembly implementation.

It parses glass-easel WXML templates, generates JavaScript code-gen objects, and can stringify ASTs back to HTML. No native binaries or WASM required.

## Installation

```sh
pnpm add glass-easel-template-compiler-js
```

## Usage

### Basic code generation

```ts
import { TmplGroup } from 'glass-easel-template-compiler-js'

const group = TmplGroup.new()

group.addTmpl('pages/index/index', `
  <view class="container">
    <text>{{ message }}</text>
    <button bindtap="onClick">Click</button>
  </view>
`)

// Generate a single template's code-gen object (IIFE string)
const code = group.getTmplGenObject('pages/index/index')

// Generate all templates in one IIFE bundle
const bundle = group.getTmplGenObjectGroups()
```

### Template dependencies

```ts
group.addTmpl('components/a', `<include src="../components/b" />`)
group.addTmpl('components/b', `<view />`)

// Returns paths of directly referenced templates (include / import)
group.getDirectDependencies('components/a') // => ['components/b']
```

### WXS / inline scripts

```ts
// External WXS script
group.addScript('scripts/utils', 'exports.double = (x) => x * 2')
group.addTmpl('pages/index/index', `
  <wxs module="utils" src="/scripts/utils" />
  <text>{{ utils.double(n) }}</text>
`)
group.getScriptDependencies('pages/index/index') // => ['scripts/utils']

// Inline WXS script
group.addTmpl('pages/foo/foo', `
  <wxs module="calc"> exports.add = (a, b) => a + b </wxs>
  <text>{{ calc.add(1, 2) }}</text>
`)
group.inlineScriptModuleNames('pages/foo/foo')           // => ['calc']
group.inlineScriptContent('pages/foo/foo', 'calc')       // => ' exports.add = (a, b) => a + b '
group.setInlineScriptContent('pages/foo/foo', 'calc', 'exports.add = (a, b) => a + b')
```

### Template imports

```ts
group.addTmpl('shared/buttons', `
  <template name="primary-btn">
    <button class="primary">{{ label }}</button>
  </template>
`)
group.addTmpl('pages/index/index', `
  <import src="/shared/buttons" />
  <template is="primary-btn" data="{{ label: 'Submit' }}" />
`)
```

### Stringify (AST → HTML)

```ts
import { TmplGroup } from 'glass-easel-template-compiler-js'

const group = TmplGroup.new()
group.addTmpl('a', `<view class="foo"><text>{{msg}}</text></view>`)

// Returns a minimized HTML string of the parsed AST
const html = group.stringifyTmpl('a')
```

### Runtime helpers

```ts
// Retrieve the runtime function definitions string (inject once per page)
const runtime = group.getRuntimeString()

// List of runtime variable names (X, Y, Z, P, Q)
TmplGroup.getRuntimeVarList() // => ['X', 'Y', 'Z', 'P', 'Q']

// Export all external WXS scripts as an IIFE string
const scripts = group.exportAllScripts()
```

## API Reference

### `TmplGroup`

| Method | Description |
|---|---|
| `TmplGroup.new()` | Create a new group (production mode) |
| `TmplGroup.newDev()` | Create a new group (development mode, emits debug hints) |
| `addTmpl(path, content)` | Parse and register a template |
| `removeTmpl(path)` | Remove a registered template |
| `addScript(path, content)` | Register an external WXS script |
| `removeScript(path)` | Remove a registered script |
| `getTmplGenObject(path)` | Generate code-gen IIFE for a single template |
| `getTmplGenObjectGroups()` | Generate code-gen IIFE for all templates |
| `getWxGenObjectGroups()` | Generate WX-style code-gen bundle (calls `__wxCodeSpace__.addCompiledTemplate`) |
| `stringifyTmpl(path)` | Stringify a template AST back to HTML |
| `getDirectDependencies(path)` | Paths referenced via `<include>` or `<import>` |
| `getScriptDependencies(path)` | Paths of external WXS scripts referenced by a template |
| `inlineScriptModuleNames(path)` | Module names of inline `<wxs>` tags |
| `inlineScriptContent(path, moduleName)` | Content of an inline WXS module |
| `setInlineScriptContent(path, moduleName, content)` | Update content of an inline WXS module |
| `getRuntimeString()` | Runtime helper functions as a string |
| `TmplGroup.getRuntimeVarList()` | Names of runtime variables |
| `exportGlobals()` | Export runtime globals as a string |
| `exportAllScripts()` | Export all registered WXS scripts as a string |
| `importGroup(other)` | Merge another `TmplGroup` into this one |

## Build

```sh
pnpm install
pnpm build
```

## Test

```sh
pnpm test
```

## Relation to the Rust implementation

This package is a pure TypeScript port of [`glass-easel-template-compiler`](https://github.com/wechat-miniprogram/glass-easel/tree/master/glass-easel-template-compiler), which compiles to WebAssembly. Use this package when WASM is unavailable or inconvenient (e.g. Node.js tooling, unit tests, server-side rendering).

The generated JavaScript output is designed to be functionally identical to the Rust/WASM version.

## License

MIT
