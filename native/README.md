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
`WasmHostCore`; the browser adapter still owns iframes, MessageChannel and
OffscreenCanvas handoff.

```bash
cargo test --manifest-path native/Cargo.toml --workspace
```

Crate layout:

```text
native/host-core/       # rlib, no WebKit/UIKit/JSCore/Android/browser deps
native/host-core-wasm/  # wasm-bindgen event/action bridge for the web devtool
native/host-core-ffi/   # UniFFI for Swift (and future Kotlin) — later
```
