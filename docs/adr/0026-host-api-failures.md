# ADR-0026: Unimplemented host API handlers fail instead of reporting `ok`

## Status

Accepted. Fixes P0-4 (iOS host-core fabricated success for every unknown
platform method).

## Context

The iOS `HostCoreRuntime.platformCall` switch implemented system info, storage
and keyboard hiding; every other method fell through to
`["errMsg": "<method>:ok"]`. The service `runApi` only invoked `fail` when the
host call rejected, so a resolved `{ errMsg: "...:fail ..." }` was treated as
success as well. On iOS, `request` never touched the network but looked
successful, `login` looked successful without a code, and `getClipboardData`
returned no data without an error.

## Decision

1. The iOS platform-call fallback returns
   `{ errMsg: "<method>:fail not implemented" }`; implemented methods keep
   their concrete results.
2. `runApi` classifies a **resolved** result whose `errMsg` contains `:fail`
   as a platform failure: it calls `fail` and `complete` (and returns the
   result), the same as the rejection path. Rejections keep building the
   `"<api>:fail <message>"` object.
3. Synchronous APIs are unchanged: the sync host path has no `ok` fallback and
   throws when a handler or a sync transport is missing.

## Consequences

- Unimplemented iOS APIs (`request`, `login`, clipboard, ...) now reach `fail`
  callbacks and promise rejections instead of silently succeeding.
- A host that reports failure through a resolved `errMsg` (the WeChat
  convention) works on every platform, not just iOS.
- The iOS simulator smoke (`pnpm ios:sim demo`) builds and runs the changed
  native host; the routing itself is covered by the `host-payload` unit test.
