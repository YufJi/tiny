# ADR-0021: Component `ready` waits for `onLoad` and the first render

## Status

Accepted. Complements ADR-0017 (`setData` completions after render) and the
pageframe ownership split of ADR-0018.

## Context

WeChat runs a page's `onLoad`/`onShow` synchronously when the page is created,
then lays out the view; a component's `ready` fires after the view exists, so
`ready` may measure geometry, start animations, or resolve `getTabBar()`.

Tiny created the service logic tree (`render.mountPage` → glass mount) before
`showPage` ran `onLoad`, and glass's mount triggered every component `ready`
synchronously. A `ready` handler therefore observed:
- `onLoad` not run yet (page data/relations not initialized), and
- no rendered DOM (`boundingClientRect` was 0, `this.animate` missed targets,
  `getTabBar()` was null).

## Decision

1. The pageframe signals a completed mount render with a dedicated
   `tree.pageReady` message (the existing host-core `tree.ready` keeps its
   meaning: "page finished, re-send the flow so late definitions apply").
2. `GlassEaselRuntimeAdapter.mountPage` no longer runs `ready` for page
   components. `LogicTreeAdapter.mountPage` defers it when a render bridge is
   attached (standalone logic-tree tests keep the synchronous path).
3. `ServiceRenderBridge.flushPageReady(pageId)` runs the deferred `ready` pass
   through the normal completion queue, so it also waits for updates raised by
   `onLoad`/`onShow`; without those it completes at the end of the flush.
4. The ready pass itself keeps WeChat's ordering
   (`componentReadyOrder`: shadow descendants → host → light/slot descendants).
5. A `TreeRenderer` without `whenRendered` still acknowledges batches (and thus
   `pageReady`) immediately; a host that models the split must forward the
   message.

## Consequences

- `ready` observes `onLoad`'s data and a laid-out view. The P0 demo's `Timing`
  page asserts `onload-ready: 0` (ready has not run inside `onLoad`) and a
  non-zero measured width inside `ready`.
- The WeChat 3.17.5 16-checkpoint trace stays 1:1 (the ready pass keeps its
  internal order, it just happens later).
- Component `ready` for instances created by a later `setData` already went
  through `schedulePendingReady`; the same completion queue now also guarantees
  the render pass.
- Hosts that do not forward `tree.pageReady` never run first-mount `ready`;
  this is part of the `TreeRenderer` contract.
