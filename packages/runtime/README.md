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
lives in `@tiny/host-web`:

| API | Purpose |
| --- | --- |
| `WasmBrowserHost` | Rust HostCore adapter: service iframe and one render iframe per page |

Both `tests/host` and `apps/devtool` use the browser host's fixed per-page render
topology through `WasmBrowserHost`. The devtool's debugger client
(`DevtoolRuntimeClient`) is app-level and lives in `apps/devtool/src/runtimeClient.ts`.

## Usage

A browser host does not import iframe helpers from this package. Use
`WasmBrowserHost` from `@tiny/host-web` instead.

## Modules

- `service/boot.ts` — service entry: compatibility registry, bridge connection, globals and control wiring
- `service/page/` — page stack, navigation, lifecycle, routes, routers and state snapshots
- `service/app/` — App lifecycle helpers, tabBar, preload and lazy subpackages
- `service/api/` — registration globals and host-facing API types
- `service/logic-tree/` — service-side logic tree (adapter, backend, query, glass-easel bridge)
- `service/logic-tree/glass/` — glass adapter plus definitions, styles, lifecycle and framework properties
- `service/render-bridge/` — service-side projection, scheduling, WXS, inbound events and render RPCs
- `render/` — render thread entry, built-in host contract and native render-tree adapter
- `tree-protocol/` — cross-thread tree contract, flow, diff, locator and animation transforms
- `component/` — component domain: definitions, generics, behaviors, observers, properties, relations and traits
- `shared/` — shared primitives: data, assets, events, diagnostics, template types and path resolution
- `bridge` comes from `@tiny/bridge`; manifest types from `@tiny/manifest`

Layer boundaries are documented in [`CONTEXT.md`](./CONTEXT.md) and enforced by
`pnpm check:runtime-layers`.

## Glass-easel entry

Host code that needs glass-easel primitives must import them through the runtime
subpath:

```ts
import * as glassEasel from '@tiny/runtime/glass-easel'
```

The subpath re-exports the same module instance the runtime uses. `hosts/web` and
`hosts/web-components` declare glass-easel as a peer dependency and their Vite
builds enable `dedupe: ['glass-easel']`, so one host thread does not bundle two
copies. The service and render threads still have independent glass-easel module
instances because they run in separate JS realms; never pass glass-easel objects
between them.

## Public API

The package exposes the root entry (`src/index.ts`) plus the subpath above.
Internal modules import their owner directly; only the root barrel and
`glass-easel` subpath are public.

| Consumer | Entry | Main types |
| --- | --- | --- |
| Service iframe | `bootServiceThread` | `ServiceThreadOptions`, `ServiceThreadRuntime` |
| Render iframe (web) | `bootTreeThread` | `TreeThreadOptions`, `TreeRenderer`, `TreeEventPayload` |
| Both threads | `tree-protocol/protocol` | `RenderNode`, `RenderPatch`, `ComponentFlow`, `TREE_PROTOCOL`, `RUNTIME_CONTROL` |
| Host components | `BuiltinComponents` | `BuiltinComponentFactoryContext`, `BuiltinStyleSheet` |
| Utilities | `resolveAssetReference`, `TINY_ENGINE_NAMING`, `DIAGNOSTIC_CODES` | `RuntimeDiagnostic`, `InspectNode`, manifest/runtime types |

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

`@tiny/host-web` (workspace: `hosts/web`) is the generic web host adapter:

| Module | Host capability |
| --- | --- |
| `canvas-bridge` | Canvas 2D/WebGL OffscreenCanvas handoff, legacy CanvasContext |
| `runtime-port` | `window.postMessage` / iframe port handshake |
| `wasm-host` | iframe creation, per-page render stacks, page visibility |
| `render/` | DOM render tree, built-in style install, WebView render entry |
| `page-lifecycle` | Render-frame scroll → page `onPageScroll` / `onReachBottom` bridge |

Canvas goes into the API context (the host entry passes it to
`createApiHost`); the runtime only gets `ServiceThreadOptions.onPageRelease` to
release the page's canvas nodes:

- api context `canvas` (`createLegacyCanvasContext`, `acquireCanvasNode`, `releaseCanvasNode`)
- `TreeRenderer.measure` / `TreeRenderer.measureCanvas` for render-side geometry and canvas hosts

This keeps the service and render thread entries free of `window`, `document`, `Image`,
and `HTMLCanvasElement`; browser code lives in `@tiny/host-web`, not in core. `pnpm check:runtime-purity` walks the core entry's import
graph and fails if a browser global, a `browser` import, or an `@tiny/host-*`
import leaks in.

## Built-in components

The core runtime does not own UI. The service logic tree only emits semantic
built-in tags; the host render tree turns them into real components:

```ts
import { bootTreeThread } from '@tiny/runtime'
import { connectHostBridge } from '@tiny/bridge'
import { createGlassRenderEntry } from '@tiny/host-web'

const entry = createGlassRenderEntry({ container: document.getElementById('app') })
entry.prepare()
globalThis.__TINY_HOST_BRIDGE__ = hostBridge
const connection = connectHostBridge({
  localRole: 'render',
  peerRole: 'host',
  capabilities: { role: 'render', mode: 'tree' },
})
bootTreeThread({ connection, renderer: entry.createRenderer() })
```

`@tiny/host-web-components` (`hosts/web-components`) provides the built-in
definitions (`tiny-*` host nodes, behaviors, templates, and CSS) consumed by
the web render tree in `@tiny/host-web`. Built-in CSS stays host-owned. A native host implements
the same `TreeRenderer` contract with native views and can ignore the web
package entirely.

## Mini-program APIs

The kernel owns the global namespace (`wx`, `App`, `Page`, `Component`,
`Behavior`) and the unsupported-API fallback — not the API table. The host entry
creates the connection, composes `ApiContext` and passes the assembled
table, so the set of `wx.*` names is the host's decision:

```ts
import { createApiHost } from '@tiny/api'
import { connectHostBridge } from '@tiny/bridge'

// Host glue installs the communication handle before connecting.
globalThis.__TINY_HOST_BRIDGE__ = hostBridge
const connection = connectHostBridge({ localRole: 'service', peerRole: 'host' })
const apiHost = createApiHost({
  connection,
  apiName: 'wx',
  apiNamespaces: ['wx'],
  canvas,
  resolveAssetUrl,
  events,
  getActivePage: () => runtime?.activePage,
  get pageId() { return runtime?.activePage?.pageId },
  get tabBar() { return runtime?.tabBar },
  setNextPageEventChannel: (channel) => runtime?.setNextPageEventChannel(channel),
})

runtime = bootServiceThread({
  connection,
  apiHost,
  manifest,
  initialPath,
  events,
  launchOptions,
  onPageRelease: (pageId) => canvas.releaseCanvasNode?.({ pageId }),
  loadArtifacts,
})
```

`@tiny/api` is the standard WeChat-compatible table (one module per
domain); hosts compose their own device facts on top. The browser host's
`bootServiceEntry` already defaults to that composition plus
`apiExtensions`. The engine only exposes mini-program semantics, the host's API
table and bridge calls; it does not invent device or performance results.

WeChat's `*Sync` APIs (`getSystemInfoSync`, `getStorageSync`, …) cannot use the
asynchronous bridge, so the host glue installs a global handle
(`__TINY_HOST_BRIDGE__`) whose `sendSync` answers frame-level `callSync`
requests. Browser
hosts inject one into the service frame; iOS exposes a JavaScriptCore block.
`callHostSync` delegates to `connection.callSync`. A host handle without a
synchronous path makes those APIs throw instead of serving a stale snapshot.

## Asset URLs

Local mini-program asset paths are relative to the page/component source file or
app-root absolute. Browser hosts need real URLs, so the web render tree accepts
a host resolver:

```ts
import { bootTreeThread, resolveAssetReference } from '@tiny/runtime'
import { connectHostBridge } from '@tiny/bridge'
import { createGlassRenderTree } from '@tiny/host-web'

globalThis.__TINY_HOST_BRIDGE__ = hostBridge
const connection = connectHostBridge({
  localRole: 'render',
  peerRole: 'host',
  capabilities: { role: 'render', mode: 'tree' },
})
bootTreeThread({
  connection,
  renderer: createGlassRenderTree({
    container: document.getElementById('app')!,
    resolveAssetUrl: (src, sourcePath) => {
      const reference = resolveAssetReference(sourcePath ?? '', src)
      return reference
        ? `/generated/${reference.path.split('/').map(encodeURIComponent).join('/')}${reference.suffix}`
        : undefined
    },
  }),
})
```

The web render tree resolves `<image src>` against the owning page/component
path (including values produced by `setData`); the compiler normalizes local
WXSS `url(...)` references to app-root paths and the service maps them through
`ServiceThreadOptions.resolveAssetUrl`. That hook also covers service-side
canvas/selector asset paths. External URLs, data URIs, fragments, and paths
escaping the app root are left untouched. Inline `style` `url(...)` values are
left to the WebView CSS engine, matching WeChat.
