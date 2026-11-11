# ADR-0012: Host-owned connections and host-composed API context

## Status

Accepted. Refines the layering of [ADR-0011](./0011-host-authoritative-state.md)
and supersedes the injection model described in
[ADR-0009](./0009-rust-host-core.md)'s host adapter notes where they overlap.

## Context

After system/storage state moved to the host (ADR-0011), the service thread
still constructed its own `BridgeConnection` and built the `ServiceApiContext`
handed to `@tiny/api`. That left the dependency direction muddy:

- `@tiny/api` imported `ServiceApiContext`, `MiniProgramApiHost`,
  `ServiceCanvasAdapter`, `ServiceTabBar`-shaped types and asset path helpers
  from `@tiny/runtime`, so the API table depended on the kernel it is injected
  into.
- `ServiceThreadOptions` carried host capabilities (`canvas`,
  `resolveAssetUrl`, `syncHost`) that the runtime only forwarded into the API
  context; it also had an unused `capabilities` field.
- The render thread had the same shape: `bootTreeThread` created its own
  `BridgeConnection` from a transport created by the host entry.
- Wire-up lived in the kernel, so a host could not compose the API table before
  booting the runtime, and test hosts had to mimic kernel internals.

## Decision

- **Host entries own connections.** `hosts/web` (`bootServiceEntry`,
  `bootRenderEntry`), `hosts/ios` (`startTinyService`, render entry) and the
  test entries create the `BridgeConnection` on the transport they receive and
  pass it in:
  - `ServiceThreadOptions.connection`
  - `TreeThreadOptions.connection`
  The runtime no longer imports `BridgeConnection` for construction and no
  longer sets service/render capabilities itself; the entry does.
- **`@tiny/api` owns the API context.** `WeixinApiContext` includes the
  connection, host facts (`syncHost`, `canvas`, `resolveAssetUrl`,
  `themeListeners`) and runtime state accessors (`getActivePage`,
  `getCurrentPagePath`, `pageId`, `tabBar`, `setNextPageEventChannel`). The host
  entry composes it, using getters/late-bound closures where the runtime does
  not exist yet, then calls `createApiHost(context, extensions)`. The resolved
  table is passed to the kernel as `ServiceThreadOptions.apiHost`; the kernel
  installs it verbatim.
- **No `@tiny/api` → `@tiny/runtime` dependency.** Canvas/query/tabBar/sync
  types and host-facing contracts (`SystemInfo`, `StorageValues`,
  `HostApiHandlers`) move to `@tiny/api`; `AssetUrlResolver` and the pure
  asset-path helpers move to `@tiny/manifest` so both sides can use them
  without importing each other. The test-only `RuntimeHostOptions` /
  `RenderThreadConnector` move into the in-memory test host.
  `pnpm check:runtime-layers` now fails if the API package imports the runtime
  or declares it as a dependency.
- **Runtime options are kernel-only.** `ServiceThreadOptions` is reduced to
  `connection`, `manifest`, `initialPath`, `apiHost`, loaders, `maxPageStack`,
  `themeListeners` (host-shared so `runtime.themeChange` reaches
  `wx.onThemeChange`) and `onPageRelease`. Canvas never enters the runtime:
  `ServicePageStack.destroyPage` calls `onPageRelease(pageId)` and the host
  releases its canvas resources there.
- **Render follows the same rule.** `TreeThreadOptions` takes a
  host-created render connection; the web/iOS render entries and the test
  harness construct it with the `render` role and `mode: 'tree'`.

## Consequences

- The dependency graph is explicit: `hosts/* → @tiny/api + @tiny/runtime`;
  `@tiny/api → @tiny/bridge + @tiny/manifest`;
  `@tiny/runtime → @tiny/bridge + @tiny/manifest + glass-easel`. The host is
  the only composition point.
- The kernel no longer knows canvas, asset URLs, the synchronous channel or the
  API context. Adding a `wx.*` API touches `@tiny/api` and the host entry that
  supplies its host facts.
- Host entries must create connections and expose the runtime accessors the API
  context needs. Late binding keeps the previous initialization order: the API
  table exists before `bootServiceThread`, and its runtime accessors resolve
  after the bootstrap.
- Tests use the same shape: runtime test helpers create the service/render
  connections and compose the API context, so they exercise the host contract
  instead of kernel internals.
