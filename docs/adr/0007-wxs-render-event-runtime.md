# ADR-0007: Shared WXS runtime and render event execution

## Status

Proposed. Not implemented.

This ADR keeps ADR-0006's split-tree decision and does **not** move WXML
expression evaluation to render. It proposes one kernel-level WXS runtime that
both service and render inject, with separate instances for expression WXS and
event WXS.

## Context

WeChat documents WXS event handling as the way to keep touch-driven animation
off the service thread:

- a `touchmove` normally goes view → service, the service calls `setData`, and
  the update goes back to view;
- a WXS event function runs in the WebView, uses a `ComponentDescriptor`, and
  changes style/class locally;
- the documented goal is fewer cross-thread messages and no `setData` blocking.

Official reference:
<https://developers.weixin.qq.com/miniprogram/dev/framework/view/interactive-animation.html>

The document defines:

- handler signature `function (event, ownerInstance)`;
- `event.instance` and `ownerInstance` are `ComponentDescriptor` objects;
- only built-in component events are supported, not custom component events;
- `ComponentDescriptor` methods: `selectComponent`, `selectAllComponents`,
  `setStyle`, `addClass` / `removeClass` / `hasClass`, `getDataset`,
  `callMethod`, `requestAnimationFrame`, `getState`, `triggerEvent`,
  `getComputedStyle`, `setTimeout` / `clearTimeout`, `getBoundingClientRect`;
- returning `false` stops propagation and prevents the default action;
- `change:prop="{{wxs.observer}}"` invokes a WXS prop observer with
  `(newValue, oldValue, ownerInstance, instance)`;
- WXS runs in the view layer, separately from App Service code.

Tiny currently runs all WXS in the service logic tree:

- the compiler emits one `templates.js`;
- `Q.S` evaluates WXS modules while the service evaluates WXML;
- `Q.C` wraps WXS event listeners and calls them in the service;
- `wxs-host.ts` builds descriptors from the logic tree;
- `RenderElement.events` contains only `{ name, capture }`.

That is correct for expression WXS (and keeps Vant working), but it makes WXS
events pay the exact round-trip the feature exists to avoid.

### One runtime, two injected instances

The WXS runtime itself is a kernel capability, not two implementations:

- `@tiny/runtime` (or a dedicated `@tiny/wxs-runtime` package) owns the
  language/runtime core: module loader, globals, `constructor` semantics,
  source-map handling and the host seam;
- service and render each call `createWxsRuntime({ host })`;
- the host supplies environment-specific behavior:
  - service host: expression evaluation, logic-tree descriptors, `callMethod`;
  - render host: DOM descriptors, local style/class, RAF/timers, event
    dispatch.

The **code** is shared; the **instances** are not. WXS event handlers run in the
view layer, so their module globals are isolated from expression WXS. A module
used by both kinds of binding is compiled into both instances and intentionally
has two isolated module states.

This is not a state-splitting bug. Synchronizing the two would break the
isolation the feature relies on.

## Decision

### 1. Kernel runtime

The WXS runtime is a host-independent kernel module. Proposed location:

```text
packages/runtime/src/wxs/     # or a dedicated @tiny/wxs-runtime package
  createWxsRuntime(...)
  module-loader.ts
  values.ts
  types.ts
```

It does not import DOM, iframe, service code, or `@tiny/host-*`.

#### Runtime API

```ts
type WxsModuleFactory = (
  require: (id: string) => Record<string, unknown>,
  module: { exports: Record<string, unknown> },
  exports: Record<string, unknown>,
  runtime: WxsRuntimeValues,
) => void

type WxsRuntimeValues = {
  require: (id: string) => Record<string, unknown>
  globals: Record<string, unknown>
  ctor: (value: unknown) => string
  getRegExp: (pattern: string, flags?: string) => RegExp
  getDate: (...args: unknown[]) => Date
}

type WxsRuntimeHost = {
  compile(code: string, moduleId: string): WxsModuleFactory
  globals: Record<string, unknown>
  createDescriptor?(owner: unknown): WxsComponentDescriptor
  onError?(error: unknown, context: WxsErrorContext): void
}

type WxsRuntime = {
  load(table: WxsModuleTable): void
  require(moduleId: string): Record<string, unknown>
  lookup(moduleId: string, exportPath: string[]): unknown
  invoke(
    moduleId: string,
    exportPath: string[],
    event: unknown,
    ownerNode: unknown,
  ): unknown
  dispose(): void
}
```

`compile` is supplied by the host:

- service: normal `Function` with a service sandbox;
- render: `Function` with a render sandbox;
- later: QuickJS/WASM behind the same interface.

#### Module format and loader

The compiler emits module factories, not raw user source. Each module is:

```ts
type WxsModuleRecord = {
  id: string
  deps: string[]
  code: string
}
```

`code` is the body of a factory:

```js
function (require, module, exports, __wxs) {
  // transformed user code
}
```

The loader is lazy:

```ts
require(id) {
  const record = records[id]
  if (!record) throw new Error('no such WXS module: ' + id)
  if (record.loaded) return record.exports

  record.loaded = true
  const factory = host.compile(record.code, id)
  factory(
    (dep) => require(dep),
    record.module,
    record.module.exports,
    runtimeValues,
  )
  return record.module.exports
}
```

This gives:

- module isolation for free (each factory has its own closure);
- cached exports and partial exports for circular dependencies;
- no compile cost on the event path;
- one loader shared by service and render.

#### Service and render instances

```ts
// service
const wxs = createWxsRuntime({ host: serviceWxsHost })
// render
const wxs = createWxsRuntime({ host: renderWxsHost })
```

The service instance and render instance share code, not state. Each instance has
its own module records, module cache and host.

Service and render hosts differ:

| Host | Service instance | Render instance |
| --- | --- | --- |
| `compile` | service sandbox | render sandbox |
| `globals` | WXS allowlist | WXS allowlist |
| descriptor | logic-tree descriptor (only for fallback) | DOM/component descriptor |
| event dispatch | none for local WXS | local event path |
| timers/RAF | host scheduler | render scheduler |

#### Sloppy mode

WXS is sloppy script. A module body using:

```js
var a = b = 1
```

must not silently write into the host global object. The first implementation
can treat WXS as trusted app code, but the kernel runtime must keep the seam
open for:

- a `with` + Proxy sandbox;
- a dedicated realm;
- QuickJS/WASM.

Prefixing identifiers does not solve dynamic global writes; this is a runtime
sandbox concern, not a compiler concern.

### 2. Compiler output

The compiler no longer owns the runtime implementation. It emits a transformed
module table plus event metadata:

```text
templates.js        # service WXML evaluation; Q.S becomes a runtime adapter
wxs-modules.js      # transformed WXS module factories, consumable by both
```

```ts
type WxsModuleTable = {
  modules: Array<{
    id: string
    deps: string[]
    code: string
  }>
}
```

External and inline WXS modules share the same module ID scheme. Module IDs are
stable and relative to the app root; they are not absolute filesystem paths.
Inline modules use `${templatePath}#${moduleName}`; external modules use their
normalized source path.

#### Transform pipeline

The compiler parses WXS once and emits a factory body:

```text
parse (acorn, script/sloppy)
  -> scope analysis (eslint-scope or equivalent)
  -> rewrite require calls to module IDs
  -> rewrite free globals to __wxs.globals
  -> rewrite .constructor reads to __wxs.ctor
  -> wrap in module factory
  -> emit code + source map
```

Suggested dependencies: `acorn`, `eslint-scope`, `magic-string`. The transform
must be AST-based; regex replacement is only acceptable as a temporary
compatibility fallback, not as the contract.

#### No blanket identifier prefix

Because every module becomes a function factory, top-level names are already
module-local:

```js
function (require, module, exports, __wxs) {
  var count = 0
  function bump() { count++ }
  module.exports = { bump }
}
```

`count` and `bump` cannot collide with another WXS module. Renaming every
top-level identifier would make source maps and debugging worse without adding
isolation.

The compiler should rename only:

- free identifiers that resolve to a WXS global (`Math` -> `__wxs.globals.Math`);
- `require` calls (`require('./x')` -> `__wxs.require('x')`);
- `.constructor` reads (`list.constructor` -> `__wxs.ctor(list)`);
- wrapper-parameter collisions, if the parser allows a top-level `module`,
  `exports`, `require` or `__wxs` declaration.

If a future runtime evaluates modules in one shared scope instead of a factory,
full prefixing becomes necessary; the factory design avoids that cost.

#### Factory example

Input:

```js
var count = 0
var utils = require('./utils.wxs')

function bump() {
  count++
  return utils.format(count)
}

module.exports = { bump }
```

Output:

```js
function (require, module, exports, __wxs) {
  var count = 0
  var utils = __wxs.require('utils')

  function bump() {
    count++
    return utils.format(count)
  }

  module.exports = { bump }
}
```

Free globals:

```js
Math.max(a, b)       -> __wxs.globals.Math.max(a, b)
```

`constructor`:

```js
list.constructor     -> __wxs.ctor(list)
```

`require` paths are resolved by the compiler; the runtime does not do relative
path resolution.

#### Source maps

`magic-string` (or equivalent) should produce a map per module. Emit:

- `sourcesContent` for the original WXS;
- `//# sourceURL=wxs://<moduleId>` when compiling;
- source positions for diagnostics.

WXS errors are reported with the original file, line and column. A stack trace
inside a WXS handler should map back to the WXS source, not to the generated
factory body.

#### Classification

The compiler classifies each WXS usage:

| Usage | Runtime |
| --- | --- |
| WXML expression only | service instance |
| WXS event / `change:prop` only | render instance |
| both | both instances, independently |

The classifier is compiler-side; it must not rely on runtime probing. The
compiler may emit per-side subsets of the module table, but module code and IDs
stay identical.

#### Event binding recognition

The compiler already knows which listeners are WXS listeners: it is the same
lvalue path currently passed to `Q.C`. It uses that information to emit:

- a service event binding for page/component JS handlers;
- a WXS event binding for render-local handlers;
- no service listener for the WXS binding.

Static cases:

```html
<view bindtap="{{utils.tap}}" />
<view catchtouchmove="{{utils.move}}" />
<view change:prop="{{utils.observe}}" />
```

Dynamic cases:

```html
<view bindtap="{{utils.getHandler()}}" />
<view bindtap="{{condition ? utils.a : utils.b}}" />
```

Dynamic cases stay on the service path and produce a diagnostic. The compiler
must not guess a module/export that it cannot resolve statically.

`catch`, `capture-bind`, `capture-catch` and `mut-bind` metadata come from the
same event-binding analysis, not from runtime event-name heuristics.

The render host can therefore execute a static binding directly:

```ts
wxs.invoke(moduleId, exportPath, event, ownerInstance)
```

and only fall back to `tree.event` when a service listener remains on the event
path.

#### Migration of `Q.S`

During migration, `Q.S` remains a compatibility adapter:

```ts
Q.S = (moduleId, _code) => () => serviceRuntime.require(moduleId)
```

The service template receives an injected runtime before evaluation. Once the
generated templates use module IDs directly, `Q.S` and the inlined runtime source
can be removed from `templates.js`.

### 3. Event metadata

`RenderElement.events` grows from a name-only list to a binding list:

```ts
type RenderEventBinding =
  | {
      name: string
      capture?: boolean
      mutated?: boolean
      kind: 'service'
    }
  | {
      name: string
      capture?: boolean
      mutated?: boolean
      catch?: boolean
      kind: 'wxs'
      moduleId: string
      exportPath: string[]
    }
```

The service logic tree only attaches `kind: 'service'` listeners. The render tree
attaches `kind: 'wxs'` listeners and executes them locally.

`catch` is not inferred from the event name at runtime. It comes from
`catchtap` / `catchtouchmove` / `capture-catch*` during template compilation and
is part of the binding metadata. `return false` and `catch` both stop
propagation; the render host handles both before deciding whether to send the
event to service.

Example:

```html
<view bindtap="{{utils.tap}}" catchtouchmove="{{utils.move}}" />
```

```ts
events: [
  { name: 'tap', kind: 'wxs', moduleId: 'utils', exportPath: ['tap'] },
  {
    name: 'touchmove',
    kind: 'wxs',
    moduleId: 'utils',
    exportPath: ['move'],
    catch: true,
  },
]
```

`change:prop` is a separate metadata field, not an event:

```ts
type RenderPropObserver = {
  prop: string
  moduleId: string
  exportPath: string[]
}
```

The compiler marks it on the owning element. The service still owns the actual
property value; the render tree tracks the previous value locally and runs the
observer after receiving a prop update. The initial property set also invokes
the observer once, matching the official `change:prop` behavior.

Observer signature:

```ts
observer(newValue, oldValue, ownerInstance, instance)
```

The first implementation covers built-in component properties. Custom component
property observers remain service-side until the component tree offers a
render-side property mirror.

### 4. Render runtime host

Each render page gets its own kernel runtime instance with a render host:

```ts
const wxs = createWxsRuntime({ host: createRenderWxsHost({ pageId, document }) })
wxs.load(wxsRenderModules)
```

The kernel runtime owns module loading and `require` resolution. The render
host owns:

- per-page event handler registration and dispatch;
- per-component `getState()` maps;
- WXS style/class overrides;
- timers and animation-frame callbacks;
- the DOM `ComponentDescriptor` factory.

It does **not** own WXML expression evaluation, component data, or app methods.

During migration, the service template's `Q.S` adapter can delegate to a
service-injected kernel runtime. The render side does not use `Q.C`; the render
host invokes handlers directly from event metadata.

### 5. ComponentDescriptor

The render descriptor implements the methods in the official table.

| Method | Where it runs | Notes |
| --- | --- | --- |
| `selectComponent` / `selectAllComponents` | render | scoped to owner component/page |
| `setStyle` | render | supports rpx; merged above WXML style |
| `addClass` / `removeClass` / `hasClass` | render | merged above WXML class |
| `getDataset` | render | typed dataset from the render node |
| `getState` | render | per component instance; `WeakMap` keyed by owner host |
| `requestAnimationFrame` | render | runtime scheduler; cancelled on page destroy |
| `setTimeout` / `clearTimeout` | render | runtime scheduler; cleared on page destroy |
| `getComputedStyle` | render | `getComputedStyle` on the node |
| `getBoundingClientRect` | render | synchronous in WebView; Skyline callback form is out of scope |
| `triggerEvent` | render → service | RPC; service triggers the component event |
| `callMethod` | render → service | RPC; service invokes page/component method |
| `getData` | service (legacy extension) | not in the official table; keep behind a compatibility flag |

`ownerInstance` is the component/page that owns the binding. `event.instance` is
the component that contains the event target. For a page-level binding,
`ownerInstance` is the page descriptor.

`getState()` is intentionally **not** module state:

- same component, consecutive `touchstart` / `touchmove` / `touchend` share it;
- different component instances do not;
- it does not cross into service.

### 6. Event dispatch

Render owns the event path:

1. Build the same normalized event shape the render tree already sends to
   service: `target`, `currentTarget`, `dataset`, `touches`,
   `changedTouches`, `detail`.
2. Walk the host path from target to page root.
3. Invoke local WXS bindings in capture/bubble order.
4. If a handler returns `false`, stop propagation and do not send the event to
   service.
5. If a service listener remains on the path, send the event through
   `tree.event`; service dispatches only `kind: 'service'` bindings.
6. If all listeners are local, send no event message.

`tap` / `click` de-duplication remains in the render tree and must run before
both local and service dispatch.

Unsupported cases remain service-dispatched and emit a diagnostic:

- custom component events;
- native component events;
- `input` / `textarea` `bindinput` (as documented).

### 7. WXS style and class overrides

WXS `setStyle` / `addClass` must survive later WXML patches.

The render tree keeps an override layer per element:

```ts
type WxsOverrides = {
  style: Map<string, string>
  classes: Set<string>
}
```

When WXML props/classes change, the render tree merges:

```text
WXML style/class  <  WXS overrides
```

This mirrors the reference implementation's separate `wxsStyle` / `wxsClass`
state and prevents a `setData` patch from wiping an in-progress animation.

### 8. Thread protocol

New messages, only for effects that cannot stay local:

```ts
type WxsCallMethod = {
  pageId: string
  componentPath: string
  method: string
  args: unknown
}

type WxsTriggerEvent = {
  pageId: string
  componentPath: string
  name: string
  detail: unknown
  options?: { bubbles?: boolean; composed?: boolean; capturePhase?: boolean }
}
```

`callMethod` and `triggerEvent` are RPCs from the WXS handler's point of view.
On the web host they cross the postMessage boundary and are asynchronous, so
handlers must not depend on a return value. Ordering is preserved relative to
existing page events; they do not block the render frame.

`getData` is not on the local fast path. If the compatibility flag is enabled it
is an RPC; the preferred APIs are `getDataset()` and `getState()`.

### 9. Security and sandbox

The render runtime must not expose `window`, `document`, `wx`, timers, or the
page's global scope to WXS.

The compiler's free-global rewriting is name isolation, not a sandbox:

```js
({}).constructor.constructor('return this')()
```

can escape a plain function wrapper. The design therefore requires a dedicated
runtime wrapper with an explicit global allowlist. If stronger isolation is
needed, the same runtime interface can be backed by QuickJS/WASM later without
changing the compiler contract.

For the first implementation, WXS code is treated as trusted app code, but the
runtime still shadows host globals and exposes only the documented globals:

- `console`
- `Math`
- `JSON`
- `getRegExp`
- `getDate`
- documented timers via the descriptor, not bare globals

### 10. Lifecycle

- One runtime per render page.
- Module instances are cached per runtime.
- `getState()` maps are `WeakMap`s keyed by component host; detached hosts are
  collected.
- Timers and animation-frame callbacks are cancelled on page destroy.
- `wxs` overrides are dropped with the element.

## Non-goals

- Moving WXML expression evaluation to render.
- Removing service WXS for expressions.
- Synchronizing service/render WXS module state.
- Supporting WXS on custom component events.
- Supporting `bindinput` on `input` / `textarea`.
- Skyline `getBoundingClientRect` callback semantics.
- Full QuickJS isolation in the first iteration.

## Why not move WXML evaluation now

Moving WXML evaluation to render would solve both expression and event WXS
placement, but it reopens the problems ADR-0006 deliberately avoided:

- dataset type loss if render owns dataset and service reads it back;
- function-valued component properties crossing the bridge;
- a native renderer needing a JS template engine;
- component tree/control-flow ownership between service and render.

This ADR keeps service as the canonical data/component-tree owner and render as
a projection. WXS expressions stay service-side; only event-time WXS moves.

## Compatibility matrix

| Capability | Current | After this design |
| --- | --- | --- |
| WXS expression (`bem`, `style`) | service | service (unchanged) |
| WXS `bind*` / `catch*` | service | render local |
| WXS `change:prop` | service | render local |
| `getState` | absent | render, per component |
| `setStyle` / class | logic tree patch | render local + override layer |
| `selectComponent` | logic tree | render query |
| `callMethod` | direct service call | service RPC |
| custom component WXS event | service | unsupported / diagnostic |
| input/textarea WXS `bindinput` | service | unsupported / diagnostic |
| module-level WXS state | one shared service module | two isolated runtimes |

## Testing

### Compiler

- parses WXS and rewrites `require`, free globals and `.constructor` with AST
  edits, not regexes;
- emits a factory body and source map that point back to the original WXS;
- classifies expression-only, handler-only, mixed modules;
- emits render module table with stable IDs and dependency order;
- emits `kind: 'wxs'` event metadata and `change:prop` metadata;
- records `catch` / `capture` / `mutated` from binding syntax;
- falls back to service for dynamic WXS bindings;
- does not emit service listeners for render-local WXS handlers.

### Runtime

- module loader is lazy, caches exports and handles circular dependencies;
- module-level variables do not leak between expression and event runtimes;
- compile errors and handler errors produce diagnostics without crashing the
  page;
- `getState` persists across events on one component and not across instances;
- `setStyle` / `addClass` survive WXML patches;
- `setStyle` / `addClass` survive WXML patches;
- returning `false` stops propagation and skips service dispatch;
- service handlers still run after local handlers when not stopped;
- custom component WXS events fall back with a diagnostic;
- `callMethod` reaches the page/component method;
- `change:prop` receives `(newValue, oldValue, ownerInstance, instance)` and
  runs once on initial set.

### Browser

- `tests/apps/wechat-demo` `wxs/movable` drag runs without an event message;
- `change:prop` animation page runs locally;
- Vant popup (expression WXS) is unchanged;
- Vant/demo page console stays clean.

## Open questions

- Is the service expression runtime module scope per app or per page? The
  render event runtime is per page; expression module state should be checked
  against WeChat before calling the split complete.
- Should the legacy `getData()` descriptor extension stay? The official
  `ComponentDescriptor` table does not list it.
- Is service fallback for custom component WXS events acceptable, or should
  those bindings be rejected at compile time?
- Does a same-realm wrapper provide enough isolation for trusted app code, or
  should the first implementation use QuickJS from the start?
- How should render-side `selectComponent` treat nested custom components?
  The service logic tree and the render DOM may have different query scopes.

## Rollout

1. **Kernel extraction** — move the WXS language/module runtime out of the
   template compiler into the kernel package; make the service `Q.S` adapter
   delegate to an injected runtime. No behavior change.
2. **Compiler transform** — emit `wxs-modules.js` and WXS event metadata behind
   a feature flag. No behavior change.
3. **Render host skeleton** — load modules, expose `getState`, `setStyle`,
   `selectComponent`, `getDataset`; no event wiring.
4. **Event fast path** — local WXS handlers for built-in events, return-false
   propagation, remove service dispatch for handler-only modules.
5. **Descriptor completion and `change:prop`** — class methods, RAF, timers,
   computed style, bounding rect, `triggerEvent`, property observers.
6. **Hardening** — sandbox allowlist, source maps, diagnostics, acceptance
   coverage; remove the old service event path for WXS.

## Risks

- Two isolated module states surprise developers who relied on the current
  shared service module; document that this matches WXS's global isolation.
- `callMethod` becomes asynchronous; handlers must not depend on its return
  value.
- Render-side selector queries and descriptors must preserve component
  boundaries; service and render selector semantics can drift.
- WXS style/class overrides can conflict with WXML patches unless the merge
  layer is tested.
- A same-realm wrapper is not a security boundary; QuickJS is the escape hatch
  if isolation becomes a requirement.

## References

- WeChat, WXS 响应事件:
  <https://developers.weixin.qq.com/miniprogram/dev/framework/view/interactive-animation.html>
- WeChat, WXS 语法参考:
  <https://developers.weixin.qq.com/miniprogram/dev/reference/wxs/>
- ADR-0006, WeChat-style split trees: `docs/adr/0006-wechat-split-tree.md`
- Current WXS runtime source: `packages/template-compiler/src/runtime/wxs-runtime.js`
- Intended kernel location: `packages/runtime/src/wxs/` (or
  `packages/wxs-runtime/`)
- Current service descriptor: `packages/runtime/src/service/wxs-host.ts`
- Render tree: `hosts/web-components/src/render-tree.ts`
