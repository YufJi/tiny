# ADR-0020: Element identity stays render-local

## Status

Accepted. Implemented for the WebView + glass-easel baseline (WeChat 3.17.5);
the legacy `mount`/`applyPatches` test renderer keeps its private locator
helpers, but the service no longer produces or resolves element locators.

## Context

WeChat's view thread allocates element node ids locally and the service never
addresses an element across the boundary: `WX_EVENT` carries the node id and
handler, and `target` / `currentTarget` (id, dataset, geometry) are computed in
the view before the event crosses.

Tiny previously addressed elements with a component-scoped locator
(`owner#index.path`): every service snapshot rebuilt a per-page locator table,
`tree.event` / `tree.templateEvent` resolved targets through it, WXS bindings
were keyed by it, and `measureLocators` asked the render side for element
rects by locator. A positional locator changes when a keyed `wx:for` reorders,
and the table is stale between a render update and the next snapshot, so a
tap could resolve to another logical node (or to nothing).

## Decision

1. Only components and the page root keep shared ids. Element ids are
   render-local (allocated from the glass node, stable across moves) and never
   appear in a patch, event or query as a service-side address.
2. A template event carries a render-resolved `targetNode`
   (`nodeId`/`id`/`dataset`/offsets); the service builds `event.target` from it
   and does not look the element up. `targetId` remains a legacy fallback.
3. The service no longer builds a locator table (`renderLocators`,
   `locatorNodes`, the per-snapshot walk). `findByViewId` resolves shared ids
   only; `tree.event` is a compatibility path for hosts that still emit it.
4. Element queries and animations are addressed by a component scope plus a
   selector (`queryView`, animation `scopeId` + `selector`). `measureLocators`
   and its RPC are gone; element `boundingClientRect` uses the scoped query.
5. WXS handlers execute in the render pageframe from the compiled template.
   The service only tracks which event names have WXS bindings (the
   `tree.customEvent` forwarding gate); the `tree.wxsBinding` RPC and the
   render-side binding table are gone.
6. WXS `callMethod` / `triggerEvent` resolve the owning component from the
   bound element's DOM node id, with the component host winning over the page
   owner.

## Consequences

- `tree.patch` no longer pays a locator-table rebuild per update, and
  `tree.wxsBinding` no longer re-sends every binding on every batch.
- `event.target` identity survives a reorder even before the service sees the
  next snapshot. The browser gate has a dedicated keyed-reorder step
  (`Reorder` fixture: tap, rotate, tap the same element, assert target id and
  the new `currentTarget.dataset.index`).
- Legacy hosts that still send locator `viewId`s lose element-targeted
  `tree.event` dispatch; they must send the shared component id (or the
  render-resolved target) instead. This is the same contract WeChat uses.
- Equality of "element addressed by selector" now depends on the scoped DOM
  query matching the logic query order; a mismatch shows up as a missing rect,
  which is already the fallback path.
