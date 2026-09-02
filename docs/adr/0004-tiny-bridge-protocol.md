# 0004 - Tiny bridge transport and command semantics

## Status

Accepted

## Context

ADR-0003 defines the devtool-facing message shape, but the runtime still needs exact transport ownership, channel topology, serialization rules, batch behavior, error handling, ordering, and handshake semantics. The bridge must remain reusable by the browser debugger and a later native host without containing API or rendering behavior.

## Decision

### Package responsibility

`packages/bridge` owns protocol types, envelope validation, transport adaptation, connection establishment, request correlation, batching, serialization checks, and timeout handling. It does not own mini-program APIs, page-stack behavior, glass-easel rendering, compiler logic, or devtool UI state.

### Channel topology

The browser host creates two independent `MessageChannel` pairs:

- host to service;
- host to render.

Service and render do not create a direct channel. Messages that must cross threads are relayed by the host. The host owns routing, page stack, lifecycle controls, and devtool-visible state.

### Envelope

The logical envelope is:

```ts
type ProtocolRole = 'host' | 'service' | 'render' | 'devtool'

type ProtocolDomain =
  | 'runtime'
  | 'page'
  | 'data'
  | 'event'
  | 'api'
  | 'diagnostic'

type ProtocolKind = 'call' | 'reply' | 'event' | 'control'

type ProtocolMessage = {
  protocolVersion: 1
  messageId: string
  kind: ProtocolKind
  domain: ProtocolDomain
  method: string
  source: ProtocolRole
  target: ProtocolRole
  payload: unknown
  pageId?: string
  replyTo?: string
  timestamp: number
}
```

A reply uses `replyTo` and a payload of either `{ ok: true, result }` or `{ ok: false, error }`. An error is `{ code, message, details? }`.

### First command families

- `runtime.hello` / `runtime.ready`: version and capability handshake.
- `runtime.bootstrap`: install app manifest references, runtime role, system snapshot, storage snapshot, and page entry.
- `runtime.foreground`, `runtime.background`, `runtime.terminate`: application lifecycle controls.
- `page.navigate`, `page.back`, `page.show`, `page.hide`, `page.unload`: page-stack and page lifecycle events.
- `data.setData`: service-to-render data updates.
- `event.dispatch`: render-to-service user, component, and custom events.
- `api.call` / `api.reply`: platform APIs including storage, navigation, system info, and toast.
- `diagnostic.log`, `diagnostic.warn`, `diagnostic.error`, `diagnostic.state`: structured runtime diagnostics.

API semantics remain owned by `packages/apis` and host implementations. Rendering semantics remain owned by `packages/runtime` and the render backend.

### Serialization

Payloads must be JSON-safe: plain objects, arrays, strings, numbers, booleans, and null. Functions, DOM nodes, class instances, cyclic structures, `undefined`, `Date`, `Map`, `Set`, and host objects are invalid at the bridge boundary.

### Synchronous API strategy

The host sends system and storage snapshots during `runtime.bootstrap`. Service-side synchronous APIs read that local snapshot. Synchronous writes update the local snapshot and enqueue an `api.call` to the host; the host remains authoritative. If the host rejects a write, it emits a diagnostic or error event but does not pretend that the original browser API was asynchronous.

### Batching

`data.setData` and `event.dispatch` messages are queued per source and page and may be transported as an ordered array of envelopes. Control, API calls, replies, and diagnostics are sent immediately. A batch preserves message order. Rendering may align a queued batch to an animation frame, while service-side queues flush before the next macrotask when possible.

### Ordering

Messages from one source for one page are FIFO. Messages from different pages are independent and do not block each other. Replies are matched by `replyTo`, not by global queue position.

### Errors, timeouts, and retry

Calls time out after 30 seconds by default. Invalid envelopes and unsupported methods fail immediately. Transport closure fails pending calls. The bridge does not automatically retry calls because API calls may have side effects.

### Handshake

The host sends `runtime.hello` with protocol version, role, and capabilities. Service and render reply with `runtime.ready`, their role, and supported capabilities. A protocol version mismatch terminates the connection and emits a diagnostic. No legacy `JSBridge` compatibility is required.

## Alternatives

- A direct service-to-render channel would reduce host relay traffic, but it would split page-stack and diagnostic authority away from the host.
- Allowing structured clone types would simplify in-browser development, but it would create a hidden incompatibility with native transports.
- Automatically retrying failed calls would hide side effects and make storage, navigation, and toast behavior harder to reason about.

## Consequences

Runtime, compiler, devtool, and future native hosts can share one inspectable protocol. The first browser implementation must add transport adapters and handshake support to `packages/bridge`; exact runtime handler implementations belong to later runtime implementation work.
