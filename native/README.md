# Native HostCore

Rust workspace for the platform-neutral Tiny host core. The architecture decision
is recorded in [`docs/adr/0009-rust-host-core.md`](../docs/adr/0009-rust-host-core.md).

The first target is the shared Bridge protocol used by the iOS host and the web
devtool. Android is deferred; its adapter will use the same FFI contract.

```bash
cargo test --manifest-path native/host-core/Cargo.toml
```

Crate layout:

```text
native/host-core/       # rlib, no WebKit/UIKit/JSCore/Android/browser deps
native/host-core-ffi/   # UniFFI for Swift (and future Kotlin) — later
native/host-core-wasm/  # wasm-bindgen for the web devtool — later
```
