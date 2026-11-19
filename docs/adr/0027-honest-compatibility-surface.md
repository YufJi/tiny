# ADR-0027: An honest compatibility surface (unknown APIs, SDK version, stubs)

## Status

Accepted. Completes R5 (the iOS half was P0-4).

## Context

Tiny's compatibility layer was too eager:

- an unknown `wx.*` name returned `() => undefined`, so
  `typeof wx.chooseMedia === 'function'` was always true and feature-gated
  libraries entered code paths that could never settle;
- canIUse answered true for every installed name, including stub APIs
  (`authorize`, `checkSession`, fail-only file system, ...);
- every host reported `SDKVersion: "3.0.0"` while the documented target and all
  fixtures use WeChat 3.17.5, so version gates in libraries took the wrong
  branch.

## Decision

1. The `wx` proxy exposes only implemented table entries:
   - unknown names read as `undefined` (no callable fallback);
   - `has` and `getOwnPropertyDescriptor` agree with `get`, so `in` and
     `Object.keys` are honest too;
   - the first unknown access still reports `UNSUPPORTED_API` for the
     debugger; introspection probes (`then`, `toJSON`, `constructor`,
     `__esModule`, registered opaque globals) stay silent.
2. `STUB_APIS` in `packages/api` marks installed-but-not-semantic APIs:
   `authorize`, `checkSession`, `login`, `getUserProfile`, `getUserInfo`,
   `getFileSystemManager`, `createCanvasContext`, `worklet` (shared-value
   namespace), `reportAnalytics` (no analytics backend) and the media managers
   (`getRecorderManager`, `getBackgroundAudioManager`,
   `createInnerAudioContext`; no audio backend) plus explicit platform stubs
   (screen brightness, BLE peripheral, mDNS listeners, worker, legacy canvas
   context). `canIUse` answers false for them (and their sub-paths) even though
   the call shape exists.
   `applyAnimatedStyle` is a no-op component/page method for the same worklet
   compatibility reason. The official WeChat demo creates the media managers at
   module scope, so a missing factory would abort its whole package bundle.
3. Every host reports `SDKVersion: "3.17.5"` (test host, devtool, iOS system
   info), matching the fixture manifest and the parity target. Capability
   questions are answered by `canIUse`, not by the version number.

## Consequences

- A missing API now throws at the call site (WeChat behaviour) instead of
  hanging a promise; apps that feature-detect with `typeof`/`in` take their
  fallback path.
- `wx.canIUse('authorize')` is false even though `wx.authorize` is callable;
  this is intentional and the call still reports its stub diagnostic.
- Libraries that branch on `SDKVersion >= 3.x` now see the real target version;
  `canIUse` remains the source of truth for individual capabilities.
- The compiler/runtime no longer synthesize handlers for unknown APIs, so the
  debugger's `UNSUPPORTED_API` report is the only trace of a missed API.
