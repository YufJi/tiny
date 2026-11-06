# @tiny/runtime

WeChat-style split-tree mini-program runtime: a service-side glass-easel logic
tree, a host-owned render tree, the tree protocol between them, and host
orchestration.

## Entry points

| API | Purpose |
| --- | --- |
| `bootServiceThread` | Service-thread entry: App/Page/Component registry, glass-easel logic tree, and API host |
| `bootTreeThread` | Render-thread entry: consumes tree flow/patch/event and drives a host `TreeRenderer` |

The browser host supplies the three HTML documents (`host`, service, render) and
lives in `@tiny/host-browser`:

| API | Purpose |
| --- | --- |
| `WasmBrowserHost` | Rust HostCore adapter: service iframe and one render iframe per page |

Both `tests/host` and `apps/devtool` use the browser host's fixed per-page render
topology through `WasmBrowserHost`. The devtool's debugger client
(`DevtoolRuntimeClient`) is app-level and lives in `apps/devtool/src/runtimeClient.ts`.

## Usage

A browser host does not import iframe helpers from this package. Use
`WasmBrowserHost` from `@tiny/host-browser` instead.

## Modules

- `service/thread.ts` — service entry: compatibility registry, bridge connection, globals and control wiring
- `service/page-stack.ts` / `service/page-instance.ts` — page stack, navigation, lifecycle and app visibility
- `service/render/` — **service render layer**: logic tree lifecycle, component schemas/definition payloads, `tree.flow` / `tree.patch`, WXS bindings, inbound tree events and render RPCs
- `service/tab-bar.ts` / `service/component-tree.ts` / `service/page-registry.ts` / `service/route.ts` — service runtime helpers
- `tree/logic/` — service-side logic tree (adapter, backend, query, glass-easel bridge)
- `tree/render/` — render thread entry and native render-tree adapter
- `tree/protocol.ts` / `tree/flow.ts` / `tree/diff.ts` — cross-thread tree contract, flow and patches
- `component/` — shared component domain: definitions, generics, behaviors, observers, options
- `protocol-controls.ts` — control domains shared by the service and render entries
- `assets.ts` / `data.ts` / `events.ts` / `diagnostics.ts` — shared primitives
- `bridge` comes from `@tiny/bridge`; manifest types from `@tiny/manifest`

Layer boundaries are documented in [`CONTEXT.md`](./CONTEXT.md) and enforced by
`pnpm check:runtime-layers`.

## Public API

The package exposes one entry, `src/index.ts`. The layer barrels under
`service/`, `tree/`, `tree/logic/`, `tree/render/` and `component/` are for the
runtime implementation; only the symbols below are part of the external
contract.

| Consumer | Entry | Main types |
| --- | --- | --- |
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
| `wasm-host` | iframe creation, per-page render stacks, page visibility |
| `page-lifecycle` | Render-frame scroll → page `onPageScroll` / `onReachBottom` bridge |

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
import { bootTreeThread } from '@tiny/runtime'
import { createGlassRenderEntry } from '@tiny/host-web-components'

const entry = createGlassRenderEntry({ container: document.getElementById('app') })
entry.prepare()
bootTreeThread({ transport, renderer: entry.createRenderer() })
```

`@tiny/host-web-components` (`hosts/web-components`) provides the web/DOM
implementation (`tiny-*` host nodes, behaviors, templates, and CSS) used by
`createGlassRenderTree`. Built-in CSS stays host-owned. A native host implements
the same `TreeRenderer` contract with native views and can ignore the web
package entirely.

## Mini-program APIs

The kernel owns the global namespace (`wx`, `App`, `Page`, `Component`,
`Behavior`), the unsupported-API fallback and the `ServiceApiContext` capability
contract — not the API table. `bootServiceThread` requires an `apiHost` factory,
so the set of `wx.*` names is the host's decision:

```ts
import { createWeixinApiHost } from '@tiny/api'

bootServiceThread({
  transport,
  manifest,
  initialPath,
  apiHost: (context) => ({
    ...createWeixinApiHost(context),
    getMenuButtonBoundingClientRect: () => hostChrome.menuButtonRect,
    getPerformance: () => hostChrome.performance,
  }),
  loadArtifacts,
})
```

`@tiny/api` is the standard WeChat-compatible table (one module per
domain); hosts compose their own device facts on top. The browser host's
`bootBrowserServiceEntry` already defaults to that composition plus
`apiExtensions`. The engine only exposes mini-program semantics, host snapshots
(system/storage), and bridge calls; it does not invent device or performance
results.

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
