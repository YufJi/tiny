# @tiny/host-web

Generic web/WebView host adapter for Tiny. It is the platform glue shared by
browser iframes and WebView-based hosts (iOS WKWebView today, Android later);
it contains no host API implementations.

## Responsibilities

- browser iframe and MessageChannel transport (`runtime-port`, `service-entry`,
  `render-entry`)
- Rust HostCore wasm adapter (`WasmBrowserHost`)
- DOM render tree (`render/tree`, `render/entry`)
- OffscreenCanvas handoff for browser hosts
- page scroll / reach-bottom / pull-down lifecycle bridge

Host API handlers (`network.*`, `clipboard.*`, `toast.*`, `modal.*`, storage,
etc.) are **not** provided here. The application composes them and passes
`WasmHostOptions.apiHandlers`, plus synchronous `*Sync` implementations through
`WasmHostOptions.syncApiHandlers`; `tests/host` and `apps/devtool` own their own
implementations. `WasmBrowserHost` never synthesizes system or storage facts.

## Public entrypoints

```ts
import {
  WasmBrowserHost,
  bootServiceEntry,
  bootRenderEntry,
  createGlassRenderEntry,
  createGlassRenderTree,
} from '@tiny/host-web'
```

`bootRenderEntry` composes `createGlassRenderEntry` internally, so browser
pages pass DOM/template/asset options directly. A WebView host that provides its
own transport can still use `createGlassRenderEntry` itself (as
`hosts/ios/src/web/render.ts` does). The low-level canvas, port and naming
modules are internal.

## Modules

- `wasm-host`: `WasmBrowserHost` over `@tiny/host-core-wasm`; iframes, per-page
  render surfaces, HostCore actions, platform API dispatch
- `service-entry` / `render-entry`: browser thread boot over `MessageChannel`
- `render/tree`: DOM `TreeRenderer` over glass-easel
- `render/entry`: built-in style install + renderer factory for WebView hosts
- `canvas-bridge` / `canvas-relay`: OffscreenCanvas handoff and legacy canvas
- `page-lifecycle`: render document scroll/pull gestures → `page.*` events

`@tiny/host-web-components` provides the built-in component definitions and
styles consumed by the render tree. The core runtime does not import either
host package.

## glass-easel

Host code imports glass-easel through `@tiny/runtime/glass-easel`, never
`glass-easel` directly. The package declares `glass-easel` as a peer dependency
and its Vite/Vitest configs use `dedupe: ['glass-easel']`; service and render
threads still have independent module instances because they are separate JS
realms.
