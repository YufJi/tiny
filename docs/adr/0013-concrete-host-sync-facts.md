# ADR-0013: Concrete hosts own synchronous system/storage facts

## Status

Accepted. Refines [ADR-0011](./0011-host-authoritative-state.md) and
[ADR-0012](./0012-host-owned-connections.md).

## Context

ADR-0011 removed the runtime snapshots and made the host authoritative, but
`WasmBrowserHost` (the generic `@tiny/host-web` adapter) still produced the
facts itself:

- `WasmHostOptions.systemInfo` plus the live container size fed both the
  synchronous `system.info` reply and the asynchronous one;
- `WasmHostOptions.storage` was mutated directly by the synchronous
  `storage.*` handlers;
- the concrete host (tests/host, devtool) passed the same facts again through
  its own `apiHandlers`, so two places could disagree.

That made the platform adapter a second source of truth and hid which layer
actually owns device facts and storage.

## Decision

- `WasmBrowserHost` owns no system or storage state. `WasmHostOptions` no
  longer accepts `systemInfo` or `storage`.
- The concrete host supplies:
  - `apiHandlers['system.info']` for the asynchronous round-trip;
  - `syncApiHandlers` (`system.info`, `storage.*`) for the synchronous channel.
- `WasmBrowserHost` only installs the same-origin `__tinySyncHost` channel:
  it forwards `(domain, method, payload)` to the host's handler, clones the
  payload/result at the realm boundary, and rejects handlers that return a
  promise. Unknown methods throw instead of being synthesized.
- `tests/host` and `apps/devtool` now build their facts and storage in the app
  layer and register both handler maps. `TestBrowserHost` still exposes its
  storage object for acceptance assertions, but that object is the one the app's
  handlers use, not a copy inside the adapter.

## Consequences

- The platform adapter is pure glue: it creates iframes/connections, transfers
  ports, installs the sync channel and routes messages. It never invents device
  facts or storage.
- A browser host that wants `*Sync` APIs must provide the synchronous handler
  map; missing handlers fail explicitly, which is the same contract ADR-0011
  established for hosts without a sync channel.
- Live facts stay live: devtool derives `windowWidth`/`windowHeight` from its
  surface at call time, and tests/host reads the current window size.
