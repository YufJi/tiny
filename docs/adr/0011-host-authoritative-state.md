# ADR-0011: Host-authoritative system/storage state and a synchronous host channel

## Status

Accepted. Supersedes the "Synchronous API strategy" section of
[ADR-0004](./0004-tiny-bridge-protocol.md). The rest of ADR-0004 still applies.

## Context

ADR-0004 made `runtime.bootstrap` carry `systemInfo` and `storage` snapshots and
let the service read them locally. That kept WeChat's `*Sync` APIs synchronous
over an asynchronous bridge, but it put a second copy of host state inside the
kernel:

- the copy was applied once at boot, so window/panel resizes, other-context
  storage writes and host changes were only visible after another snapshot push;
- the asynchronous variants (`getSystemInfo`, `getStorage`, `getStorageInfo`)
  answered immediately from the copy — they pretended to be asynchronous while
  never calling the host;
- the host was the documented authority, yet the API table could still expose
  APIs whose host handler does not exist, and the snapshot hid that.

WeChat's `*Sync` APIs are genuinely synchronous. The bridge is a MessagePort
(always asynchronous), so a truthful implementation needs a separate direct
channel, not a cache.

## Decision

- The runtime keeps **no** system-info or storage snapshot. `runtime.bootstrap`
  carries `manifest`, `initialPath` and `maxPageStack` only.
- `*Sync` APIs (`getSystemInfoSync`, `getStorageSync`, `setStorageSync`,
  `removeStorageSync`, `clearStorageSync`, `getStorageInfoSync`) call a
  host-provided `SyncHostChannel` (`ServiceApiContext.syncHost`, supplied through
  `ServiceThreadOptions.syncHost`). Method names are the same `api` protocol
  methods (`system.info`, `storage.get`, …).
- The browser host injects a synchronous function into the service frame after
  it reports ready (`__tinySyncHost`); same-origin iframes can call across
  realms directly. The iOS host exposes a JavaScriptCore block
  (`__tinySyncHostCall`), which is also synchronous. A host without a channel
  makes `*Sync` APIs throw instead of serving stale state.
- Asynchronous APIs perform real `api.call` round-trips: `getSystemInfo` asks
  `system.info`, `getStorage`/`getStorageInfo` ask `storage.*`. The Rust
  HostCore no longer answers `system.info` from `HostConfig`; it forwards it to
  the platform like any other host API.
- The host owns the facts:
  - browser: `WasmHostOptions.systemInfo` plus the live surface size, and the
    shared `WasmHostOptions.storage` object;
  - iOS: `HostSystemInfo.current()` and the `UserDefaults`-backed storage in
    `HostCoreRuntime`.
- `wx.canIUse` no longer reads a runtime snapshot: system-info field probes go
  through the sync channel, and host-owned result shapes are not claimed.

## Consequences

- One authority: a host write (or a devtool panel resize) is visible to the next
  API call without a snapshot push.
- Synchronous APIs require host support. Cross-origin service frames and hosts
  that cannot expose a synchronous channel must either add one or accept that
  `*Sync` APIs throw; the failure is explicit instead of silently stale.
- `runtime.bootstrap` no longer installs `systemInfo`/`storage`; hosts read
  those from their own state. `HostConfig`, the wasm/FFI config structs and the
  smoke harness were updated accordingly.
- Tests inject a sync channel. The in-memory runtime test host exposes
  `syncHost` backed by the same handler table as the asynchronous path, so unit
  tests exercise the real browser contract.
