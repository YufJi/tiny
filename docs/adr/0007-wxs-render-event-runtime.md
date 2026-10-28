# ADR-0007: WXS render event runtime

## Status

Proposed. Not implemented.

This ADR keeps ADR-0006's split-tree decision and does **not** move WXML
expression evaluation to render. It adds a second WXS runtime for events and
property observers that must run in the view layer.

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

### Why two WXS copies are intentional

WXS event handlers run in the view layer. The design treats their module
globals as isolated from expression WXS, consistent with that view/service
separation. It therefore has:

- a **service expression runtime** for `{{wxs.fn(...)}}`, `class`, `style`,
  `wx:if`, `wx:for`;
- a **render event runtime** for `bind*` / `catch*` handlers and `change:prop`.

They are independent module instances. Their module-level variables are **not**
synchronized. A module used by both kinds of binding is compiled into both
runtimes and intentionally has two isolated module states.

This is not a state-splitting bug. Synchronizing the two would break the
isolation the feature relies on.

## Decision

### 1. Compiler output

The compiler keeps the existing service `templates.js` and adds a render-side
WXS artifact:

```text
templates.js          # service WXML evaluation, expression WXS
wxs-render.js         # render event WXS modules
```

`wxs-render.js` contains a module table:

```ts
type WxsModuleTable = {
  modules: Array<{
    id: string
    code: string
    deps: string[]
  }>
}
```

External and inline WXS modules share the same module ID scheme. Module IDs are
stable and relative to the app root; they are not absolute filesystem paths.

The compiler classifies each WXS usage:

| Usage | Runtime |
| --- | --- |
| WXML expression only | service |
| WXS event / `change:prop` only | render |
| both | both, independently |

The classifier is compiler-side; it must not rely on runtime probing.

Prefixing is also compiler-side and AST-based:

- top-level `var` / function names get a stable module prefix;
- free identifiers resolve through a WXS global allowlist;
- `require` becomes a module-ID lookup;
- strings, comments and object property names are untouched;
- `constructor` reads keep the existing WXS compatibility helper;
- source maps remain attached to the original WXS file.

Name prefixing is not the sandbox; the render runtime's host wrapper is.

### 2. Event metadata

`RenderElement.events` grows from a name-only list to a binding list:

```ts
type RenderEventBinding =
  | { name: string; capture?: boolean; kind: 'service' }
  | {
      name: string
      capture?: boolean
      kind: 'wxs'
      moduleId: string
      exportName: string
    }
```

The service logic tree only attaches `kind: 'service'` listeners. The render tree
attaches `kind: 'wxs'` listeners and executes them locally.

`change:prop` is a separate metadata field, not an event:

```ts
type RenderPropObserver = {
  prop: string
  moduleId: string
  exportName: string
}
```

The compiler marks it on the owning element. The service still owns the actual
property value; the render tree runs the observer after receiving a prop update
and tracks the previous value locally.

### 3. Render runtime

Each render page gets one runtime:

```ts
const wxs = createWxsEventRuntime({
  modules: wxsRenderModules,
  pageId,
  document,
})
```

The runtime owns:

- module loading and `require` resolution;
- per-page event handlers;
- per-component `getState()` maps;
- WXS style/class overrides;
- timers and animation-frame callbacks;
- the descriptor factory.

It does **not** own WXML expression evaluation, component data, or app methods.

The existing `wxs-runtime.js` remains the shared language/module runtime. The
service template bundle and the render runtime both inline that source, but
supply different host hooks:

```text
service: Q.S + Q.C (existing)
render:  Q.S + event dispatcher / descriptor
```

### 4. ComponentDescriptor

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

### 5. Event dispatch

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

### 6. WXS style and class overrides

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

### 7. Thread protocol

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

### 8. Security and sandbox

The render runtime must not expose `window`, `document`, `wx`, timers, or the
page's global scope to WXS.

The compiler's identifier prefixing is name isolation, not a sandbox:

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

### 9. Lifecycle

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

- classifies expression-only, handler-only, mixed modules;
- emits render module table with stable IDs and dependency order;
- emits `kind: 'wxs'` event metadata and `change:prop` metadata;
- does not emit service listeners for render-local WXS handlers.

### Runtime

- `getState` persists across events on one component and not across instances;
- module-level variables do not leak between expression and event runtimes;
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

1. **Compiler artifacts** — emit `wxs-render.js` and event metadata behind a
   feature flag. No behavior change.
2. **Render runtime skeleton** — load modules, expose `getState`, `setStyle`,
   `selectComponent`, `getDataset`; no event wiring.
3. **Event fast path** — local WXS handlers for built-in events, return-false
   propagation, remove service dispatch for handler-only modules.
4. **Descriptor completion** — class methods, RAF, timers, computed style,
   bounding rect, `triggerEvent`.
5. **`change:prop`** — property observer path and initial invocation.
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
- Current WXS runtime: `packages/template-compiler/src/runtime/wxs-runtime.js`
- Current service descriptor: `packages/runtime/src/service/wxs-host.ts`
- Render tree: `hosts/web-components/src/render-tree.ts`
