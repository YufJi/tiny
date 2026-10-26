# @tiny/host-browser

Browser host adapters for Tiny. This package is intentionally **outside**
`packages/*`: it owns environment capabilities and must never be imported by the
core runtime.

## Modules

- `canvas-bridge`: OffscreenCanvas handoff, legacy CanvasContext, service/render canvas adapters
- `runtime-port`: iframe `postMessage` handshake and `MessagePort` transfer
- `standalone-host`: iframe creation, port transfer, canvas relay, bootstrap orchestration
- `devtool-client`: DOM overlay and debugger panel bridge

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
