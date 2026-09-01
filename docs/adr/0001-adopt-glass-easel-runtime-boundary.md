# 0001 - Adopt glass-easel as the runtime core

## Status

Accepted

## Context

Tiny is migrating its mini-program engine to glass-easel. The old `base` package contains the only complete end-to-end engine, but its vdom, Web Components, app lifecycle, routing, and API layers are coupled. Glass-easel provides component registration, templates, data binding, events, lifetimes, and a pluggable render backend, but it does not provide an application lifecycle, page stack, routing, platform APIs, or a JS bridge.

## Decision

- `packages/runtime` owns the new Tiny host runtime: application lifecycle, page stack, routing dispatch, global registration, backend assembly, and platform API dispatch.
- The glass-easel adapter is internal to `packages/runtime`; other packages must not depend on it directly.
- Expose both interfaces from `packages/runtime`:
  - a high-level `createTinyRuntime` entry for application booting;
  - low-level environment, code-space, registration, and routing APIs for devtool, native hosts, and tests.
- Define a `TinyRenderBackend` seam. The first implementation can use a browser Domlike backend, but runtime code must not depend on browser-only behavior.
- Put glass-easel component definitions for built-in tags in `packages/builtin-components`.
- `packages/bridge` is a transport-only layer for serialization, batching, timeouts, and errors. It must not contain `wx` API semantics or rendering command semantics.
- The old `packages/base` remains as a frozen reference only. New runtime code must not import it.

## Alternatives

- Using `glass-easel-miniprogram-adapter` directly would have reduced initial work, but it would place Tiny host behavior behind an adapter subset and make future native-host control harder.
- Keeping the new runtime in `base` would preserve old imports, but would continue coupling the migration to the legacy vdom and Web Components architecture.
- Using browser APIs directly in the runtime would be quicker, but would prevent the same host from targeting a native render backend.

## Consequences

The migration starts with a clean runtime boundary and a pluggable render backend. It requires new built-in component definitions and a later devtool protocol decision before the runtime can be exercised end-to-end in the debugger.
