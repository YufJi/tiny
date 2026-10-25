# @tiny/runtime

Dual-thread mini-program runtime: host orchestration, service/render threads,
glass-easel adapter, and the devtool client.

## Entry points

| API | Purpose |
| --- | --- |
| `createTinyRuntime` | Host-side protocol bridge over one render transport or a per-page `renderConnector` |
| `bootServiceThread` | Service-thread entry: App/Page/Component registry + API host |
| `bootRenderThread` | Render-thread entry: glass-easel backend + component tree |

The browser host supplies the three HTML documents (`host`, service, render) and
lives in `@tiny/host-browser`:

| API | Purpose |
| --- | --- |
| `createStandaloneDualThreadHost` | Creates service/render iframes from a manifest; `renderMode: 'per-page'` creates one render iframe per page |
| `DevtoolRuntimeClient` | Debugger adapter: iframe lifecycle, controls, page/lifecycle projection, element tree |

`tests/host` is the reference single-render host; `apps/devtool` uses
`DevtoolRuntimeClient` with the per-page render mode.

## Usage

```ts
import { createTinyRuntime } from '@tiny/runtime'

const host = createTinyRuntime({
  serviceTransport,
  // Single frame:
  renderTransport,
  // Or one frame per page, with each transport created by the host:
  // renderConnector: { connect, activate, disconnect, setAppVisible },
  manifest,
  initialPath: 'pages/todos/todos',
})

await host.bootstrap()
```

A browser host does not import iframe helpers from this package. Use
`createStandaloneDualThreadHost` from `@tiny/host-browser` instead.

## Modules

- `service.ts` — app/page/component lifecycle, page stack, tabBar/`switchTab`, `wx` API host
- `render.ts` — bridge + glass-easel adapter bootstrap
- `glass-easel-adapter.ts` — component registration, events, inspect tree
- `assets.ts` — app-root asset path resolution and WXSS `url(...)` rewriting
- `host.ts` — host orchestration, page-scoped message routing, per-page render connectors
- `bridge` comes from `@tiny/bridge`; manifest types from `@tiny/manifest`

## Testing

```bash
pnpm --filter @tiny/runtime test
pnpm --filter @tiny/runtime typecheck
```

The full end-to-end gate is `pnpm accept:glass-easel`.

## Core vs browser entry

`@tiny/runtime` is the host-independent engine entry. It exports the service
runtime, render runtime, glass-easel adapter, host protocol/orchestration, and
manifest/runtime types. It must not reference browser globals.

`@tiny/host-browser` (workspace: `hosts/browser`) is the browser host adapter:

| Module | Host capability |
| --- | --- |
| `canvas-bridge` | DOM canvas, PNG frame capture/paint |
| `runtime-port` | `window.postMessage` / iframe port handshake |
| `standalone-host` | iframe creation, single/per-page render stacks, page visibility |
| `page-lifecycle` | Render-frame scroll → page `onPageScroll` / `onReachBottom` bridge |
| `devtool-client` | Debugger controls, page frames, tabBar state, lifecycle timeline, element tree |

Canvas is injected at the thread boundary:

- `ServiceThreadOptions.canvas` (`createLegacyCanvasContext`, `createCanvasNode`)
- `RenderThreadOptions.canvas` (`measure`, `paint`)

This keeps `service.ts` and `render.ts` free of `window`, `document`, `Image`,
and `HTMLCanvasElement`; browser code lives in `@tiny/host-browser`, not in core. `pnpm check:runtime-purity` walks the core entry's import
graph and fails if a browser global, a `browser` import, or an `@tiny/host-*`
import leaks in.

## Built-in components

The core runtime does not own UI. A host supplies the built-in tag
implementations through `RenderThreadOptions.builtinComponents`:

```ts
import { webBuiltinComponents } from '@tiny/host-web-components'

bootRenderThread({ ..., builtinComponents: webBuiltinComponents })
```

`@tiny/host-web-components` (`hosts/web-components`) provides the web/DOM
implementation (`tiny-*` host nodes, behaviors, and base CSS). A native host can
provide its own factory or omit the option; the runtime then registers no
built-in definitions and unknown tags fall back to native backend elements.

## Host-specific APIs

Platform facts and host capabilities belong to the host, not the engine core.
`bootServiceThread` accepts `apiExtensions` for APIs such as menu-button geometry
or performance observers:

```ts
bootServiceThread({
  transport,
  manifest,
  initialPath,
  apiExtensions: {
    getMenuButtonBoundingClientRect: () => hostChrome.menuButtonRect,
    getPerformance: () => hostChrome.performance,
  },
  loadArtifacts,
})
```

The reference implementation lives in `tests/host/src/service-thread.ts`; the
debugger host passes the same extensions in `apps/devtool/src/next/runtimeService.js`.
The engine only exposes mini-program semantics, host snapshots (system/storage),
and bridge calls; it does not invent device or performance results.

## Asset URLs

Local mini-program asset paths are relative to the page/component source file or
app-root absolute. Browser hosts need real URLs, so `bootRenderThread` accepts a
host resolver:

```ts
bootRenderThread({
  transport,
  manifest,
  artifacts: { templates },
  backend,
  initialPath,
  resolveAssetUrl: (assetPath, { sourcePath }) =>
    `/generated/${assetPath.split('/').map(encodeURIComponent).join('/')}`,
})
```

The adapter resolves `<image src>` against the owning page/component path
(including values produced by `setData`) and rewrites local WXSS `url(...)`
values before style registration. External URLs, data URIs, fragments, and
paths escaping the app root are left untouched.
