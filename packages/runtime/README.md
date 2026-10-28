# @tiny/runtime

WeChat-style split-tree mini-program runtime: a service-side glass-easel logic
tree, a host-owned render tree, the tree protocol between them, host
orchestration, and the devtool client.

## Entry points

| API | Purpose |
| --- | --- |
| `createTinyRuntime` | Host-side protocol bridge over one render transport or a per-page `renderConnector`; `maxPageStack` defaults to 10 |
| `bootServiceThread` | Service-thread entry: App/Page/Component registry, glass-easel logic tree, and API host |
| `bootTreeThread` | Render-thread entry: consumes tree flow/patch/event and drives a host `TreeRenderer` |

The browser host supplies the three HTML documents (`host`, service, render) and
lives in `@tiny/host-browser`:

| API | Purpose |
| --- | --- |
| `createStandaloneDualThreadHost` | Creates a service iframe and one render iframe per page from a manifest |
| `DevtoolRuntimeClient` | Debugger adapter: iframe lifecycle, controls, page/lifecycle projection, element tree |

Both `tests/host` and `apps/devtool` use the browser host's fixed per-page render
topology through `createStandaloneDualThreadHost` / `DevtoolRuntimeClient`.

## Usage

```ts
import { createTinyRuntime } from '@tiny/runtime'

const host = createTinyRuntime({
  serviceTransport,
  // One render thread per page, created by the host. The browser host passes
  // iframe frames; in-memory tests pass a connector that boots a headless tree.
  renderConnector: { connect, activate, disconnect, setAppVisible },
  manifest,
  initialPath: 'pages/todos/todos',
})

await host.bootstrap()
```

A browser host does not import iframe helpers from this package. Use
`createStandaloneDualThreadHost` from `@tiny/host-browser` instead.

## Modules

- `service/thread.ts` — app/page lifecycle, page stack, tabBar/`switchTab`, `wx` API host
- `service/` — page/component instances, registry, selector query, route parsing
- `tree/logic/` — service-side logic tree (adapter, backend, query, glass-easel bridge)
- `tree/render/` — render thread entry and native render-tree adapter
- `tree/protocol.ts` / `tree/diff.ts` — cross-thread tree contract and patches
- `component/` — component definitions, schemas, tree, behaviors, observers
- `host/` — host orchestration, page-scoped message routing, per-page render connectors
- `assets.ts` / `data.ts` / `events.ts` / `diagnostics.ts` — shared primitives
- `bridge` comes from `@tiny/bridge`; manifest types from `@tiny/manifest`

## Public API

The package exposes one entry, `src/index.ts`. The layer barrels under `host/`,
`service/`, `tree/`, `tree/logic/`, `tree/render/` and `component/` are for the
runtime implementation; only the symbols below are part of the external
contract.

| Consumer | Entry | Main types |
| --- | --- | --- |
| Host shell | `createTinyRuntime` | `TinyRuntimeHost`, `RuntimeHostOptions`, `RenderThreadConnector`, `HostApiHandler(s)` |
| Service iframe | `bootServiceThread` | `ServiceThreadOptions`, `ServiceCanvasAdapter`, `CanvasNode*` |
| Render iframe (web) | `bootTreeThread` | `TreeThreadOptions`, `TreeRenderer`, `TreeEventPayload` |
| Render host (native) | `createNativeTreeRenderer` | `NativeTreeHost`, `NativeNodeSpec`, `NativeTreeRenderer` |
| Both threads | `tree/protocol` | `RenderNode`, `RenderPatch`, `ComponentFlow`, `TREE_PROTOCOL`, `RUNTIME_CONTROL` |
| Host components | `BuiltinComponents` | `BuiltinComponentFactoryContext`, `BuiltinStyleSheet` |
| Utilities | `resolveAssetPath`, `TINY_ENGINE_NAMING`, `DIAGNOSTIC_CODES` | `RuntimeDiagnostic`, `InspectNode`, manifest/runtime types |

Internal modules (the logic-tree adapter/backend, glass-easel bridge, service
page registry/instances, component definitions) are intentionally not
re-exported. Hosts run the runtime through the thread entries above.

## Testing

```bash
pnpm --filter @tiny/runtime test
pnpm --filter @tiny/runtime typecheck
```

The full end-to-end gate is `pnpm accept:glass-easel`.

## Core vs browser entry

`@tiny/runtime` is the host-independent engine entry. It exports the service
runtime, the render tree thread and its host-neutral `TreeRenderer` contract,
the tree protocol, host orchestration, and manifest/runtime types. It must not
reference browser globals.

`@tiny/host-browser` (workspace: `hosts/browser`) is the browser host adapter:

| Module | Host capability |
| --- | --- |
| `canvas-bridge` | Canvas 2D/WebGL OffscreenCanvas handoff, legacy CanvasContext |
| `runtime-port` | `window.postMessage` / iframe port handshake |
| `standalone-host` | iframe creation, per-page render stacks, page visibility |
| `page-lifecycle` | Render-frame scroll → page `onPageScroll` / `onReachBottom` bridge |
| `devtool-client` | Debugger controls, page frames, tabBar state, lifecycle timeline, element tree |

Canvas is injected at the thread boundary:

- `ServiceThreadOptions.canvas` (`createLegacyCanvasContext`, `acquireCanvasNode`, `releaseCanvasNode`)
- `TreeRenderer.measure` / `TreeRenderer.measureCanvas` for render-side geometry and canvas hosts

This keeps the service and render thread entries free of `window`, `document`, `Image`,
and `HTMLCanvasElement`; browser code lives in `@tiny/host-browser`, not in core. `pnpm check:runtime-purity` walks the core entry's import
graph and fails if a browser global, a `browser` import, or an `@tiny/host-*`
import leaks in.

## Built-in components

The core runtime does not own UI. The service logic tree only emits semantic
built-in tags; the host render tree turns them into real components:

```ts
import { bootGlassRenderEntry } from '@tiny/host-web-components'

bootGlassRenderEntry({ transport, container: document.getElementById('app') })
```

`@tiny/host-web-components` (`hosts/web-components`) provides the web/DOM
implementation (`tiny-*` host nodes, behaviors, templates, and CSS) used by
`createGlassRenderTree`. Built-in CSS stays host-owned. A native host implements
the same `TreeRenderer` contract with native views and can ignore the web
package entirely.

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
app-root absolute. Browser hosts need real URLs, so the web render tree accepts
a host resolver:

```ts
import { bootTreeThread } from '@tiny/runtime'
import { createGlassRenderTree } from '@tiny/host-web-components'

bootTreeThread({
  transport,
  renderer: createGlassRenderTree({
    container: document.getElementById('app')!,
    resolveAssetUrl: (assetPath, sourcePath) =>
      `/generated/${assetPath.split('/').map(encodeURIComponent).join('/')}`,
  }),
})
```

The web render tree resolves `<image src>` against the owning page/component
path (including values produced by `setData`); the compiler rewrites local WXSS
`url(...)` references. `ServiceThreadOptions.resolveAssetUrl` covers
service-side canvas/selector asset paths. External URLs, data URIs, fragments,
and paths escaping the app root are left untouched.
