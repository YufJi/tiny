# ADR-0009: Rust HostCore shared by native hosts and the web devtool

## Status

Accepted and implemented for the web devtool and iOS. Android remains deferred.

- The web devtool is wasm-only and uses `WasmBrowserHost` over
  `@tiny/host-core-wasm`.
- The iOS adapter is native-only: UniFFI `RustHostCore`, JSCore service and one
  render WKWebView per page. `host.html`, iframe hosting and the JS host
  fallback are removed.
- `createTinyRuntime` and its test harness are deleted from the repository.
- Remaining release work is native API parity and real-device packaging; the
  HostCore contract does not need to change for either.

## Context

At the time of this decision, host orchestration was duplicated by environment:

- The iOS host ran `createTinyRuntime` from `hosts/ios/src/web/host.ts` inside a
  `host.html` WKWebView, with one render iframe per page.
- The web devtool ran `createTinyRuntime` from
  `hosts/browser/src/standalone-host.ts`, with one service iframe and one render
  iframe per page; `DevtoolRuntimeClient` exposed it to React.
- The runtime itself (`packages/runtime`) is host-agnostic, but the host side of
  the Bridge (`packages/bridge/src/protocol/connection.ts`), page stack,
  navigation, pending render queues, Host API registry and UI state projection
  are reimplemented by every host.

Two changes make the current split untenable:

1. The iOS render layer is moving from one WKWebView with iframes to multiple
   WKWebViews, one per page, with no iframe. That removes the host document that
   used to own `createTinyRuntime`.
2. The web devtool is a mature host with the strongest automated conformance
   coverage (Playwright acceptance). If its host semantics diverge from iOS, the
   divergence is discovered late and only on device.

A Swift-only host core would maximize iOS control but force a second Kotlin/TS
implementation and another protocol-drift surface. The web devtool is also a
useful first conformance harness because it exercises the same Bridge, page
stack, tab cache, tree routing and Canvas handoff without a simulator.

## Decision

Introduce one Rust **HostCore** that owns platform-neutral host semantics and is
driven by platform adapters as an event/action state machine.

### 1. HostCore scope

HostCore owns:

- the host side of the versioned Tiny Bridge protocol: handshake, call, control,
  event, reply, pending calls, timeouts and protocol diagnostics;
- `RuntimeHost`: service bootstrap, page stack, navigation, tab-page cache,
  pending render messages and page lifecycle routing;
- routing for `tree.*`, `query.*`, `canvas.*`, `page.*` and diagnostics;
- Host API dispatch: navigation is implemented in the core; platform-backed APIs
  become `PlatformCall` actions;
- `UIState` projection from runtime state/diagnostics;
- page-surface commands and render/service frame commands.

HostCore does **not** own:

- DOM, iframe, WKWebView, Android WebView or native views;
- JavaScriptCore, QuickJS, V8 or any JS execution;
- storage, networking, clipboard, native UI or text measurement;
- the devtool's app registry, 3-app LRU pool, React/Redux state or panels;
- Canvas drawing. The shared Canvas command protocol and the iOS remote-canvas
  adapter stay in JavaScript/platform code.

### 2. Event/action model

HostCore is a single-threaded state machine:

```text
platform adapter -> HostEvent -> HostCore -> Vec<HostAction> -> platform adapter
```

It does not call platform code through callbacks. This keeps FFI/JNI/WASM
boundaries simple, avoids reentrancy, and makes host behavior deterministic and
testable with a fake platform.

Representative actions:

```text
SendServiceFrame
SendRenderFrame
CreatePage / ActivatePage / DestroyPage
SetAppVisible
PlatformCall { request_id, method, params }
SetTimer / CancelTimer
UpdateUIState
Diagnostic
```

Representative events:

```text
ServiceFrame / RenderFrame
PageReady / PageFailed
PlatformResult
TimerFired
HostCommand
```

The platform adapter executes actions in its own event loop. It may be the main
thread (SwiftUI), the Android main looper, or the browser main thread.

### 3. Platform adapters

| Platform | Service runtime | Page surface | Platform APIs |
| --- | --- | --- | --- |
| iOS | JavaScriptCore | one WKWebView per page | URLSession, UserDefaults, UIKit/SwiftUI, CoreText |
| Web devtool | service iframe | one render iframe per page + MessageChannel | fetch, browser storage, DOM overlay |
| Android (deferred) | QuickJS/V8 | Android WebView per page | OkHttp, SharedPreferences/DataStore, Compose/View, Paint |

Adapters implement the same HostCore action/event contract. The iOS adapter is
Swift; the web adapter is TypeScript + WASM; the future Android adapter is
Kotlin.

### 4. Web devtool integration

The web devtool keeps its iframe/MessageChannel/OffscreenCanvas architecture:

- the service iframe and render iframes remain browser-owned;
- the browser adapter creates/destroys iframes, transfers `MessagePort`s, and
  feeds frames into HostCore;
- Canvas handoff stays in the browser adapter;
- one HostCore instance exists per live app; the existing React app registry and
  3-app LRU pool remain outside HostCore;
- `DevtoolRuntimeClient` becomes a wrapper over HostCore commands and the
  diagnostic/lifecycle event stream instead of calling host objects directly.

This makes the web devtool the first real conformance platform without forcing
the web host to adopt WKWebView-style page surfaces.

### 5. iOS final shape

- No `host.html`, no iframe, no hidden host WKWebView.
- One WKWebView per page, loaded from `render.html?app=...&pageId=...`.
- Page render transport is native: page -> `WKScriptMessageHandler` -> HostCore
  -> `callAsyncJavaScript`/`evaluateJavaScript` -> page.
- `ServiceEngine` keeps running the generic service engine in JavaScriptCore.
- Swift is an adapter: it creates page WKWebViews, executes HostCore actions,
  hosts native APIs and renders SwiftUI chrome.

### 6. FFI and WASM

The core is a normal Rust library, with thin bindings:

```text
native/host-core/        # rlib, no platform dependencies
native/host-core-ffi/    # UniFFI for Swift (and future Kotlin)
native/host-core-wasm/   # wasm-bindgen for the web devtool
```

- Native bindings use UniFFI; the future Android adapter uses the same FFI crate
  through Kotlin/JNI.
- Web bindings use wasm-bindgen; HostCore state is driven on the browser main
  thread initially, with a Web Worker as a possible later optimization.
- Protocol payloads remain JSON on the wire, so both bindings and the platform
  adapters agree on the data model.

### 7. Protocol and conformance

HostCore must match the existing JavaScript `@tiny/bridge` host semantics, not a
new protocol. The JS implementation remains the reference during migration.

Required conformance assets:

- golden fixtures for hello/ready, call/reply, event batches, timeout and
  malformed envelopes;
- a fake platform that records action sequences;
- scenario tests for bootstrap, navigate/back, switchTab/tab cache, pending
  render queues, tree routing and diagnostics;
- the existing browser devtool acceptance suite as an end-to-end gate;
- the existing iOS simulator fixture/canvas smoke as the native gate.

## Migration phases

### R0 — decision and contracts

- Record this ADR.
- Define HostCore event/action types and the platform adapter contract.
- Lock the rule that core crates contain no platform imports.

### R1 — Rust Bridge + fake platform

- Port the host-side Bridge protocol.
- Golden fixtures from the JS implementation.
- Pass protocol tests without any WebView or JS engine.

### R2 — Rust RuntimeHost + scenario tests

- Port service bootstrap, page stack, navigation, pending queues, routing and
  UI state.
- Exercise the full host state machine with a fake page/service platform.

### R3 — Web devtool WASM adapter (delivered)

- Added `host-core-wasm` and committed/generated bindings.
- Implemented the browser adapter for service/render iframes, MessageChannel,
  Canvas handoff and browser Host APIs.
- Switched the devtool to `WasmBrowserHost`; the standalone JS host is removed.
- Gate: existing browser acceptance is green.

### R4 — iOS Swift adapter (delivered, device packaging pending)

- Added UniFFI bindings and the Swift adapter.
- Added native per-page render transport; the entry is inlined into `render.ts`.
- Removed `host.html`/`host.ts`/`pages.ts`/iframe page connector and the JS host
  fallback from the iOS app.
- Gate: all seven fixtures and Canvas screenshots pass in the simulator.
  Real-device install and multi-arch packaging remain release tasks.

### R5 — Android adapter (deferred)

- Implement the Kotlin adapter against the same FFI/action contract.
- Service engine: QuickJS/V8; render: Android WebView per page.
- No HostCore changes required.

## Consequences

### Positive

- One Bridge/page-stack/routing implementation across iOS, web devtool and
  eventually Android.
- The web devtool becomes a fast conformance harness for native changes.
- Platform adapters stay small and replaceable: WebView/JS engine/storage/UI are
  not coupled to host semantics.
- The iOS no-iframe/multi-WKWebView target is a natural adapter change, not a
  second host runtime.

### Costs

- Rust toolchain and cross-compilation (iOS XCFramework, Android NDK, WASM) join
  the build.
- UniFFI/wasm-bindgen add generated code and binary artifacts; CI must build
  them.
- HostCore is a real port of the former JS host semantics, not a thin shim; protocol
  parity must be proven with fixtures and scenario tests.
- The web devtool migration adds WASM startup and a second host path during
  migration.

### Risks

- **Protocol drift**: mitigate with golden fixtures and the JS implementation as
  reference until parity.
- **WASM/iframe boundary**: the browser adapter must own MessagePort transfer and
  Canvas handoff; HostCore must never see DOM/port objects.
- **iOS page WebView memory/process termination**: adapter concern; HostCore only
  routes by page id and must tolerate page loss/recreation.
- **One-step migration**: the final shape is a big-bang switch, so retain the JS
  host behind a development flag until the Rust gates are green.

## Non-goals

- Android implementation in this phase.
- Replacing React/Redux devtool UI or its app/LRU management.
- Moving WebGL, native UI rendering or text measurement into HostCore.
- A new Bridge protocol version. HostCore speaks the existing versioned Tiny
  Bridge protocol.
