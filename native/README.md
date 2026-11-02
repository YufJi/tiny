# Native HostCore

Rust workspace for the platform-neutral Tiny host core. The architecture decision
is recorded in [`docs/adr/0009-rust-host-core.md`](../docs/adr/0009-rust-host-core.md).

The first target is the shared Bridge protocol used by the iOS host and the web
devtool. Android is deferred; its adapter will use the same FFI contract.

The protocol layer now includes the host-side `BridgeConnection` state machine
(handshake, call/control/reply, events and timeouts) plus a golden frame emitted
by the JavaScript `@tiny/bridge` implementation.

`HostCore` now performs service bootstrap, creates and binds a page render
connection, sends `page.ready`, and parks/replays page tree events until the
render surface is ready. Platform adapters receive these as actions. Navigation
commands drive page creation, activation and destroy actions through the service
page stack. Host API calls are dispatched as `PlatformCall` actions and completed
with `PlatformResult`; `system.info`, storage and navigation API requests are
replied back to the service.

`host-core-wasm` exposes the same event/action state machine to JavaScript with
`WasmHostCore`; `hosts/browser/src/wasm-host.ts` is the browser adapter that owns
iframes, MessageChannel and OffscreenCanvas handoff. It is the only host used by
the devtool and by `tests/host`.

`host-core-ffi` exposes the same machine through UniFFI. Swift bindings are
generated into `ios/HostCoreGenerated` and linked into `TinyHost.app`; the
simulator gate runs a native HostCore handshake smoke.

```bash
cargo test --manifest-path native/Cargo.toml --workspace
cargo build --manifest-path native/host-core-wasm/Cargo.toml --target wasm32-unknown-unknown
pnpm host-core:wasm:bindings   # generates wasm-bindgen JS bindings (requires wasm-pack)
```

Crate layout:

```text
native/host-core/       # rlib, no WebKit/UIKit/JSCore/Android/browser deps
native/host-core-wasm/  # wasm-bindgen event/action bridge for the web devtool
native/host-core-ffi/   # UniFFI for Swift (and future Kotlin)
```

### Web devtool WASM mode

Generate the bindings once:

```bash
pnpm host-core:wasm:bindings
```

The devtool always loads `@tiny/host-core-wasm`; the generated bindings and
wasm binary are committed under `native/host-core-wasm/pkg` and bundled by Vite.
Rebuild them with `pnpm host-core:wasm:bindings` after changing Rust. Run the
normal gate:

```bash
pnpm accept:glass-easel
```

There is no JavaScript host left in runtime or any host adapter; iOS, devtool
and tests/host are native/wasm only.
