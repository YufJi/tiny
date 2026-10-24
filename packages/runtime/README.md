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
