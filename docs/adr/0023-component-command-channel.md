# ADR-0023: A component command channel for context APIs

## Status

Accepted for the first slice. `createMapContext` now uses the channel
(`getCenterLocation` / `moveToLocation` / `getScale`); video, camera and
live-player contexts extend the whitelist in later changes.

## Context

WeChat's context objects (`MapContext`, `VideoContext`, `CameraContext`, …) are
handles to a **render-side component instance**: `moveToLocation`, `play`,
`takePhoto` mutate the live element, and the service only holds the logic tree.

Tiny already has two service-to-render paths, so the transport is not the
problem:

- `createRenderRpc` (`packages/runtime/src/service/render-bridge/rpc.ts`) calls
  `connection.call(TREE_PROTOCOL.domain, …)` and
  `packages/runtime/src/render/thread.ts` answers through `connection.onControl`
  (`measure`, `select`, `intersection`, `canvas.measure`). Request/response
  semantics and page scoping already exist.
- The canvas handoff shows the cross-iframe variant: the service iframe posts to
  `window.parent`, the host page relays to the render frame
  (`hosts/web/src/canvas-bridge.ts`, `requestCanvasHandoff`).

What is missing is a *command* surface: a tree-protocol method, a render-side
dispatcher that can find a component instance by its shared id and invoke a
whitelisted method, and the `ApiContext` adapter that context objects call.

Element identity rules from ADR-0020 stay in force: only components and the page
root have shared ids, and no element handle crosses the boundary.

## Decision

1. **One control domain.** `packages/runtime/src/tree-protocol/protocol.ts`
   gains `COMPONENT_CONTROL = { domain: 'component', invoke: 'invoke' }`.
2. **Request shape.**
   `{ componentId?: string, selector?: string, method: string, args?: unknown }`
   plus the usual `{ pageId }` frame option. `componentId` (the shared component
   id used by scoped queries) is preferred; `selector` is a fallback that
   resolves the first match inside that page and is documented as such.
3. **Result shape.** Always a status object, never a thrown error:
   - `{ status: 'ok', value?: unknown }`
   - `{ status: 'not-found' }` — no component with that id/selector in the page
   - `{ status: 'unsupported-method', method }` — not in the tag's whitelist
   - `{ status: 'invalid-args', detail }`
   - `{ status: 'error', message }` — the component rejected the command
4. **Render-side dispatch.** The renderer gains
   `invokeComponent?(request): Promise<ComponentCommandResult> | ComponentCommandResult`,
   registered in `render/thread.ts` with `connection.onControl`. The glass render
   tree resolves the instance and applies a **per-tag method whitelist**; the
   initial map is `map: getCenterLocation | moveToLocation | getScale`. Unknown
   tags or methods return `unsupported-method` rather than reaching into the DOM.
5. **Serializable only.** `args` and `value` must survive structured clone /
   JSON (no functions, no nodes, no handles). Commands are async; context objects
   themselves are created synchronously, matching WeChat.
6. **Service API surface.** `ApiContext` gains an optional
   `componentCommands?: { invoke(request): Promise<ComponentCommandResult> }`,
   injected by the host entry the same way `createOffscreenCanvas` is. Context
   APIs in `packages/api` are thin wrappers that translate WeChat's
   `{ success, fail, complete }` options into status handling; no context object
   keeps a reference to render state.

## Alternatives considered

- **Host handlers only.** The host has no component instances (they live in the
  render frame), so it would have to mirror state and stay in sync — rejected.
- **Exposing element handles across the bridge.** Violates the split-tree
  contract (ADR-0006) and ADR-0020, and cannot be serialized.
- **Emulating contexts in the service.** Impossible for playback/camera; for the
  map it would mean duplicating the projection and marker layer — rejected.

## Consequences

- `createMapContext` can be implemented without touching element addressing:
  the service names a component, the render frame executes a whitelisted method.
- The protocol grows by one domain; the whitelist becomes the security boundary
  and must be extended deliberately per tag (video/camera later).
- Commands are user-initiated and low frequency; no per-frame cost. Nothing is
  cached in the service, so a destroyed component reports `not-found` on the
  next command instead of acting on a stale node.
- Hosts that do not implement `invokeComponent` keep failing honestly: the
  adapter is absent, so the context API reports `fail`.

## Test plan

- **runtime unit**: `render/thread.ts` forwards `component.invoke` to the
  renderer stub and passes every status through unchanged; an unknown page id
  never reaches the renderer.
- **host-web unit**: the map component answers the three whitelisted methods,
  rejects a fourth, and returns `not-found` for an unknown id.
- **api unit**: `createMapContext` maps `{ success, fail, complete }` to the
  status object (ok → success, everything else → fail with `errMsg`).
- **acceptance**: the browser gate drives `moveToLocation` then
  `getCenterLocation` on a map page and asserts the reported centre; a negative
  step calls a method on a missing id and expects the fail callback.
- **iOS**: unchanged — the adapter is absent, so the APIs report `fail` until a
  native component host exists.

## Rollout

1. Protocol + renderer hook + `map` whitelist (`getCenterLocation`,
   `moveToLocation`, `getScale`).
2. `createMapContext` in `@tiny/api` and the host-web adapter.
3. Extend the whitelist to `video` and `camera` in separate changes, each with
   its own tests; `live-player`/`live-pusher` stay out of scope until a real
   streaming host exists.
