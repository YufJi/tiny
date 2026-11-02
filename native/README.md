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
iframes, MessageChannel and OffscreenCanvas handoff. It is exported but not yet
the default devtool host; the JS host remains the fallback during migration.

```bash
cargo test --manifest-path native/Cargo.toml --workspace
cargo build --manifest-path native/host-core-wasm/Cargo.toml --target wasm32-unknown-unknown
pnpm host-core:wasm:bindings   # generates wasm-bindgen JS bindings (requires wasm-pack)
```

Crate layout:

```text
native/host-core/       # rlib, no WebKit/UIKit/JSCore/Android/browser deps
native/host-core-wasm/  # wasm-bindgen event/action bridge for the web devtool
native/host-core-ffi/   # UniFFI for Swift (and future Kotlin) — later
```

### Web devtool WASM mode

Generate the bindings once:

```bash
pnpm host-core:wasm:bindings
```

Then either open the devtool with `?host=wasm` (the dev server injects
`__TINY_WASM_HOST_CORE_FACTORY_PROMISE__`), or run the debugger flow against the
Rust host:

```bash
TINY_DEVTOOL_WASM=1 pnpm accept:glass-easel
```

The production devtool build still defaults to the JS host; the wasm loader is a
development-only Vite plugin.
