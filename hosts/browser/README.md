# @tiny/host-browser

Browser host adapters for Tiny. This package is intentionally **outside**
`packages/*`: it owns environment capabilities and must never be imported by the
core runtime.

## Modules

- `canvas-bridge`: OffscreenCanvas handoff, legacy CanvasContext, service/render canvas adapters
- `runtime-port`: iframe `postMessage` handshake and `MessagePort` transfer
- `wasm-host`: Rust HostCore adapter, iframe creation, per-page render surfaces
- `canvas-relay`: OffscreenCanvas handoff relay

This package is the browser platform glue, on the same footing as `hosts/ios`:
it knows iframes, ports, canvas and host APIs, and nothing about a debugger
session. The devtool's own session client (`launch`/`terminate`, state
projection, panel history limits) lives with its only consumer in
`apps/devtool/src/runtimeClient.ts`.

## Observability

`WasmBrowserHost` reports and does not retain: runtime state arrives through
`onState`, diagnostics through `onDiagnostic`, and neither is stored on the
host. A caller that needs history owns the collection — `apps/devtool` keeps
500 diagnostics and a 300-event lifecycle timeline, while the acceptance harness
uses `TestBrowserHost` in `tests/host/src/test-host.ts` so Playwright can read
`window.__tinyRuntime.host.diagnostics` and the live storage object.

## Canvas injection

The core service/render threads accept canvas adapters:

```ts
bootServiceThread({ ..., canvas: createBrowserCanvasAdapter() })
bootRenderThread({ ..., canvas: { measure } })
```

The render entry must also install the OffscreenCanvas responder, and the host
page must relay the handoff between the service and render iframes:

```ts
installOffscreenCanvasResponder() // render thread
installCanvasHandoffRelay({ serviceIframe, getRenderIframe, isRenderSource })
```

Selector-query canvas nodes and legacy `createCanvasContext` both use the
OffscreenCanvas handoff, with no PNG fallback. They expose synchronous 2D/WebGL
APIs in the service thread.

`tests/host` and `apps/devtool` wire these adapters from this package.

## Built-in components

The web/DOM implementations of the built-in tags live in the sibling package
`@tiny/host-web-components` (`hosts/web-components`). Browser hosts inject them
into the render thread:

```ts
import { webBuiltinComponents } from '@tiny/host-web-components'

bootRenderThread({ ..., builtinComponents: webBuiltinComponents })
```

The core runtime does not import either host package.
