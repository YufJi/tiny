# @tiny/host-browser

Browser host adapters for Tiny. This package is intentionally **outside**
`packages/*`: it owns environment capabilities and must never be imported by the
core runtime.

## Modules

- `canvas-bridge`: service-side DOM canvas capture and render-side paint/measure
- `runtime-port`: iframe `postMessage` handshake and `MessagePort` transfer
- `standalone-host`: iframe creation, port transfer, bootstrap orchestration
- `devtool-client`: DOM overlay and debugger panel bridge

## Canvas injection

The core service/render threads accept canvas adapters:

```ts
bootServiceThread({ ..., canvas: { createLegacyCanvasContext, createCanvasNode } })
bootRenderThread({ ..., canvas: { measure, paint } })
```

`tests/host` and `apps/devtool` wire these adapters from this package.
