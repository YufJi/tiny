# ADR-0018: Render pageframe owns WXML evaluation and diff

## Status

Accepted. Phase A is implemented and enabled by default in the browser test
host. The devtool keeps the snapshot fallback until the component
creation/destruction flow is authoritative in both directions.

## Context

WeChat 3.17.5 keeps component/page logic in the service context, but the
pageframe (`WAWebview` / `WARenderContext`) is the WXML execution owner:

- `wcc -d -ds` emits `$gwx`, `__WXML_GLOBAL__.modules`,
  `f_['wxs/...'] = nv_require(...)`, and template evaluation in the pageframe.
- The service bundle registers WXML functions in `__wxAppCode__`, but the
  running service context observed for the parity fixture has no pageframe
  `entrys` and no evaluated WXS modules; those belong to the pageframe.
- The same pageframe module table is shared by page and component templates,
  so WXS events, `change:prop`, and expressions see one module instance.

Tiny currently evaluates page and component WXML in the service logic tree,
then sends a `RenderNode` snapshot/patch to the render tree. The render tree
evaluates component templates a second time. That makes WXS state, expression
side effects, `setData` diff timing, and component creation order inherently
split across two realms.

## Decision

Move WXML ownership to the render pageframe:

1. The render pageframe mounts the page template from the compiled template
   registry and owns page/component expression evaluation and local diff.
2. The service continues to own Page/Component logic, data, observers,
   relations, methods, and selection semantics. It does not evaluate WXML for
   the view; component instances are reported back through a component flow so
   the service can maintain its logic tree.
3. `setData` crosses as data, not as a service-computed virtual-tree patch.
   Render-local commit is the acknowledgement for the `setData` callback.
4. WXS state/lifecycle belongs to the render pageframe. Service-only input
   behavior is handled separately only where WeChat's source shows it does not
   use the normal pageframe event path.

The migration is staged to keep the gate green:

- **Phase A (implemented)**: render-owned page template. The flow carries the
  page root identity and method names, the render pageframe mounts the compiled
  template, and page WXS/events stay in one realm. Repeated flows for the same
  page are idempotent. Structural page updates also refresh the service-owned
  view/component identity hints without replaying DOM patches.
- **Phase B**: component creation/destruction flow from render to service.
- **Phase C (partial)**: page `setData` crosses as its original data patches,
  not a full page snapshot. Render-local diff is the acknowledgement. Page WXML
  props are applied before the remaining per-instance component-data patch, so
  a parent prop update is not evaluated twice. Component data still uses the
  existing per-instance map.
- **Phase D**: remove service WXML and the cross-tree WXS state replay.

## Acceptance

The parity fixture is `tests/apps/wechat-parity`. The same fixture is opened by
the WeChat developer tool CLI and by the Tiny test host. Each step records a
canonical trace of:

- normalized page and component text
- component paths/instance identity and lifecycle order
- WXS module state and expression/event/observer transitions
- event target/currentTarget/dataset
- page stack and `setData` completion order
- console/page errors

`scripts/wechat-parity-trace.mjs` records the Tiny side and
`scripts/wechat-parity-oracle.mjs` records the WeChat side through the
`wechatide` element/runtime tools. `scripts/wechat-parity-compare.mjs` normalizes
the random fixture keys, compares both traces and writes raw/canonical reports
under `tests/host/generated/parity/`.

Phase A acceptance currently covers five checkpoints: first A render, page WXS
event, B navigation, back to the retained A page, and `reLaunch`. It verifies
page/component text, page WXS event state, component WXS module counters, page
reuse and re-entry. A step only passes when the canonical traces are identical.
The P0 browser gate additionally covers slot-child component binding under
`wx:if`, relation link/unlink, component-data updates, and the full
service/render lifecycle.

## Consequences

The current `tree.wxsHandler` replay is a compatibility bridge, not the target
architecture. New runtime work should move responsibilities toward the
render-owned pageframe rather than extending service-side WXML emulation.
