# ADR-0019: Thread-first runtime layout and transitive layer checks

## Status

Accepted.

This ADR supersedes only the directory-layout clause of ADR-0006
(`component/`, `service/`, `tree/` with a single `index.ts` per layer). The
split-tree decision itself is unchanged.

## Context

The runtime had three orthogonal axes encoded into two directory levels:

- execution thread: `service` vs `render`;
- tree role: `protocol` vs `logic` vs `render`;
- domain: page/component/WXS/query.

As a result, `tree/` mixed the wire contract, pure transforms and both tree
implementations, while `service/render/` and `tree/render/` used the word
"render" for different things. The root `types.ts` then acted as a type hub:
`component/` and `service/` reached `tree/protocol` transitively through it,
even though the direct-import layer check reported success.

The service-render bridge and page stack also accumulated unrelated state and
commands. Navigation, page lifecycle bookkeeping, projection payloads, WXS
bindings and `setData` acknowledgement all lived in the same files.

## Decision

Organize the runtime by execution thread first, with shared contracts and pure
helpers below both threads:

```text
shared/             pure data, assets, events, diagnostics, template and path helpers
tree-protocol/      cross-thread tree contract and pure transforms
component/          component definition domain
service/page/       page registry, instance, stack, navigation and routing
service/app/        App-level helpers: tabBar, preload and subpackages
service/api/        registration globals and host-facing API types
service/logic-tree/ service-side glass-easel logic tree
service/render-bridge/ service-side projection, scheduling, WXS and render RPCs
service/boot.ts     assembly only
render/             render-thread entry and host render contract
```

Rules:

- Types live with the domain that owns them; there is no generic `types.ts`.
- Internal code imports the owning module directly, not an internal barrel.
- `service/page/` may see the render side only through
  `service/render-bridge/port.ts`.
- `service/render-bridge/bridge.ts` orchestrates; projection and scheduling live
  in `projection.ts` and `scheduler.ts`.
- `service/page/stack.ts` owns stack state and lifecycle;
  `service/page/navigation.ts` owns navigation commands.
- The glass-easel implementation stays behind
  `service/logic-tree/glass/adapter.ts`; host-neutral query, inspect and backend
  projection stay in `service/logic-tree/`.
- `check-runtime-layers` resolves transitive imports; hiding a forbidden edge
  behind a type hub is a failure.

## Consequences

- The package's public entry remains `@tiny/runtime` plus
  `@tiny/runtime/glass-easel`; internal file paths are free to move.
- Runtime tests import the new owners directly.
- ADR-0006's original `tree/logic` and `tree/render` paths are historical.
- The split-tree protocol remains in the runtime package; it is not moved to
  the transport-only `@tiny/bridge`.

## Non-goals

- Changing the two-tree architecture or the tree protocol semantics.
- Moving component definitions or glass-easel behavior into the render thread.
- Reintroducing a generic `types.ts` or an internal barrel for convenience.
