# @tiny/runtime

Dual-thread mini-program runtime: host orchestration, service/render threads,
glass-easel adapter, and the devtool client.

## Entry points

| API | Purpose |
| --- | --- |
| `createTinyRuntime` | Host-side protocol bridge over service/render transports |
| `createStandaloneDualThreadHost` | Creates service/render iframes from a manifest and returns a host |
| `bootServiceThread` | Service-thread entry: App/Page/Component registry + API host |
| `bootRenderThread` | Render-thread entry: glass-easel backend + component tree |
| `DevtoolRuntimeClient` | Debugger adapter: iframe lifecycle, controls, state projection, element tree |

The browser host supplies the three HTML documents (`host`, service, render).
`tests/host` is the reference host; `apps/devtool` uses `DevtoolRuntimeClient`.

## Usage

```ts
import { createStandaloneDualThreadHost } from '@tiny/runtime'

const runtime = await createStandaloneDualThreadHost({
  manifest,
  serviceUrl: '/service.html',
  renderUrl: '/render.html',
  initialPath: 'pages/todos/todos',
  container: document.getElementById('app')!,
})

await runtime.host.bootstrap()
```

## Modules

- `service.ts` — app/page/component lifecycle, page stack, `wx` API host
- `render.ts` — bridge + glass-easel adapter bootstrap
- `glass-easel-adapter.ts` — component registration, events, inspect tree
- `standalone-host.ts` — iframe creation + protocol handshake
- `devtool-client.ts` — debugger controls/state projection
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
| `standalone-host` | iframe creation and page container |
| `devtool-client` | DOM overlay and debugger UI |

Canvas is injected at the thread boundary:

- `ServiceThreadOptions.canvas` (`createLegacyCanvasContext`, `createCanvasNode`)
- `RenderThreadOptions.canvas` (`measure`, `paint`)

This keeps `service.ts` and `render.ts` free of `window`, `document`, `Image`,
and `HTMLCanvasElement`; browser code lives in `@tiny/host-browser`, not in core. `pnpm check:runtime-purity` walks the core entry's import
graph and fails if a browser global or `browser` import leaks in.

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
