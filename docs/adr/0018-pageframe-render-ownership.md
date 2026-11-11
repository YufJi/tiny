# ADR-0018: Render pageframe owns WXML evaluation and diff

## Status

Accepted. Phases A, B and C are implemented. The browser test host, debugger and iOS
render WKWebView all mount through the pageframe, and the runtime's cross-thread
integration harness also defaults to pageframe. `TreeRenderer` requires
`mountPage`; the legacy `tree.snapshot` event, service-side pageframe switch and
native snapshot renderer are gone. `RenderNode` survives only as the
service-owned identity/index snapshot, not as a rendering path. The independent
custom tabBar mounts from component templates through `tabFrame`, not `tabRoot`
/ `tabPatches`. A few `@tiny/host-web` low-level DOM tests still build
`RenderNode` fixtures directly; they are test fixtures, not a supported
`TreeRenderer` host path.

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

Before this decision Tiny evaluated page and component WXML in the service
logic tree, then sent a `RenderNode` snapshot/patch to the render tree. The
render tree evaluated component templates a second time. That made WXS state,
expression side effects, `setData` diff timing, and component creation order
inherently split across two realms.

## Decision

Move WXML ownership to the render pageframe:

1. The render pageframe mounts the page template from the compiled template
   registry and owns page/component expression evaluation and local diff.
2. The service continues to own Page/Component logic, data, observers,
   relations, methods, and selection semantics. It creates the logic tree and
   emits the component identity/create flow; the pageframe consumes that flow
   when it creates the matching render components. WeChat's `Gi` creates the
   root in the service and pushes `FLOW_INITIAL_CREATION` / `FLOW_CREATE_NODE`,
   so component creation is service-to-render, not render-to-service.
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
- **Phase B (implemented)**: service-owned component creation/identity flow.
  The service emits page-root identities plus owner-scoped
  `component-instances` patches whenever a component's shadow tree changes.
  The pageframe consumes those identities for positional binding instead of
  inferring identity from DOM/template attachment. WeChat does not emit a
  separate destroy op for an individual component removed from a template:
  the render tree removes it during template diff, then the service relation
  callbacks unlink it. Tiny follows that split. The wire form is a semantic
  identity/hints stream rather than a byte-for-byte replay of WeChat's numeric
  `FLOW_ALLOC_NODE_ID` / `FLOW_CREATE_NODE` opcodes.
  Component `ready` follows WeChat's creation walk: shadow descendants, the
  host, then light/slot descendants. Dynamically created components receive
  their own `ready` after the update is acknowledged.
- **Phase C (implemented)**: page `setData` crosses as its original data patches,
  not a full page snapshot. Render-local diff is the acknowledgement. Page WXML
  props are applied before the remaining per-instance component-data patch, so
  a parent prop update is not evaluated twice. Component data is sent as
  per-instance field patches, not a full component-data map. Structural updates
  carry `renderHints` and
  `componentFlow` for identity/index alignment; they never carry page
  virtual-node patches. WXS `bindinput` on `input`/`textarea` is render-local,
  matching WeChat's pageframe dispatch; only plain JS `bindinput` uses the
  service event path.
- **Phase D (closed by WeChat 3.17.5 source)**: the cross-tree
  `tree.wxsHandler` replay has been removed; WXS handlers, including
  `input`/`textarea` `bindinput`, execute only in the pageframe. Service
  WXML evaluation remains intentionally: WeChat's service `CodeSpace` owns
  `compiledTemplateMap`, `batchAddCompiledTemplate` and `getCompiledTemplate`,
  and registers `template(d)` on service component definitions. That template
  instantiation supplies the logical component tree, observers, relations,
  selectors and the identity/index projection. Removing it would require a new
  component-creation protocol, not just deleting service templates.

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

Acceptance currently covers sixteen checkpoints: first A render, a page
`setData` updating two component properties, page WXS event, B navigation, back
to the retained A page, `reLaunch`, create/destroy cycles for a page-level host
with both a host-template child and a slot child under `wx:if`, then keyed
`wx:for` reverse/rotate cycles. The flow trace compares component text, WXS
module state, lifecycle order including `moved`, relation link/unlink callbacks,
relation `linkFailed`, page reuse and re-entry. A step only passes when the canonical WeChat/Tiny
traces are identical. The P0 browser gate additionally covers slot-child
component binding under `wx:if`, relation link/unlink/linkFailed, component-data updates,
and the full service/render lifecycle.

## Consequences

The service-side WXS expression runtime is a logic-tree projection input; it is
no longer used to replay render event handlers. Pageframe remains the final
WXML/DOM owner. New runtime work should preserve this split rather than trying
to remove service template instantiation outright.
