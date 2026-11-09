# ADR-0016: Pure JS bridge with a host-injected communication handle

## Status

Accepted. Consolidates and supersedes the former ADR-0014 (sync calls on the
connection) and ADR-0015 (frame-level sync transport); refines the host-owned
state/connection decisions of ADR-0011, ADR-0012 and ADR-0013. Those sync-
channel ADRs were merged into this one and removed.

## Context

The previous attempts put synchronous support inside `@tiny/bridge` (first an
API-level `Transport.callSync`, then a frame-level `sendSync` plus a sync helper
file), and at another point put an API-level `hostSync` channel in
`ApiContext`. Both made the kernel bridge aware of host/platform mechanics:

- the bridge carried MessagePort and sync reply helpers;
- the transport interface changed with host capabilities;
- the API context grew a sync field that duplicated the connection.

The kernel should be only a JS bridge: protocol, frames, and a connection with
`call` / `control` / `sendEvent` / `callSync`. How bytes and synchronous answers
travel is host glue's business.

## Decision

- `@tiny/bridge` is platform-free. It owns the protocol (`call`, `reply`,
  `event`, `control`, `callSync`), frame validation, `BridgeConnection`, and
  the transport contract:
  - `send(frame)`
  - `onFrame(listener)`
  - `sendSync(frame): TransportFrame` (required)
  - `close()`
  It contains no MessagePort implementation and no sync reply helper.
- The host injects **one communication handle** as
  `globalThis.__TINY_HOST_BRIDGE__` before the thread connects. The handle
  implements the transport contract, including `sendSync`; a host that cannot
  answer synchronously throws `UNSUPPORTED_METHOD`.
- `connectHostBridge({ localRole, peerRole, capabilities, … })` reads that
  global handle and creates the `BridgeConnection`. Hosts never pass a
  transport to the bridge directly on the production path.
- `BridgeConnection.callSync` builds a single `callSync` request frame, calls
  `handle.sendSync(frame)` and validates the normal `reply` envelope
  (`replyTo`, `ok`/`error`). No pending call or timeout is involved. Inbound
  `callSync` on the asynchronous path is rejected.
- Host glue owns the handle implementation:
  - `@tiny/host-web` owns the browser MessagePort transport and the
    `answerSyncFrame` reply helper; its service/render entries build the
    handle (MessagePort + injected `__tinySyncHost` direct function), install
    it as `__TINY_HOST_BRIDGE__` and call `connectHostBridge`.
  - `hosts/ios` builds the handle from `__tinySend` / `__tinyReceiveFrame` and
    the JavaScriptCore sync block.
  - Tests inject an in-memory handle.
- `@tiny/api` no longer has an API context sync field. `callHostSync` delegates
  to `connection.callSync`; system/storage sync APIs use it, and `canIUse`
  probes system-info fields through it.
- Host facts and system/storage handlers remain host-owned per ADR-0011/0013;
  the API context only carries host facts and late-bound runtime accessors.

## Consequences

- The kernel bridge interface is stable and identical across browser, iOS and
  tests: `call` and `callSync` are bridge methods; `sendSync` is a capability
  of the injected handle, not a bridge/platform implementation.
- MessagePort, direct object bridges and native callbacks are interchangeable
  by changing only the host glue that installs the global handle.
- A transport that cannot sync fails explicitly; async APIs are unaffected.
- Sync results are framed and validated like any other reply, and host glue is
  responsible for JSON-normalising them across realms.
