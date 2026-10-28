# ADR-0006: WeChat-style split trees for service logic and render

## Status

Accepted and implemented. Merged into `next` as #27 (`1ac6d3a`), originally on
`feat/wechat-split-tree` based on `next` (`feb5f61`). The earlier
`feat/service-logic-tree` branch is a reference only.

### Implementation status

- The standalone test host and the debugger boot the split tree by default.
  The `logicLayer` option, the `logic=` URL parameter and the `logic=render`
  escape hatch are gone: the service thread always owns the logic tree.
- The production render entry (`packages/runtime/src/render.ts`) has been
  deleted. The compiler no longer emits `render.js`; hosts load `templates.js`
  directly.
- Initial page mount is driven by component-flow messages
  (`define` / `create-node` / `props` / `children` / `ready`). Subsequent
  template updates use virtual-node patches only. The legacy WeChat update
  messages (`FLOW_UPDATE`, `FLOW_SET_DATA`, `FLOW_DATA_OBSERVER`,
  `FLOW_APPLY_PROPERTY`, `FLOW_GROUP`, …) are intentionally not implemented:
  the snapshot diff already carries text, props, insert/remove/reorder and
  extra-data changes.
- The runtime exposes a host-neutral native tree adapter
  (`createNativeTreeRenderer`) behind the same `TreeRenderer` contract as the
  web glass tree, with its own smoke tests.
- Runtime tests boot a service logic tree plus a headless tree thread; the old
  render-adapter test fixture is gone.
- Stylesheets carry an explicit cascade role (builtin/app/page/component/
  page-scope/shared); consumers filter by role and never infer it from output
  filenames. Built-in CSS stays host-owned.
- Hosts normalize built-in event detail; the service dispatches it without
  per-tag knowledge. The generic render tree no longer synthesizes
  checkbox-group or canvas events.
- Render-tree tags, attributes and id formats come from `TINY_ENGINE_NAMING`;
  the runtime purity check covers modern host globals.
- Component-as-page relations are resolved over the page's render shadow tree:
  glass-easel relation linking follows parent pointers, which stop at a shadow
  root, so the adapter matches page relations by target path and invokes both
  sides' `linked` / `unlinked`.
- `@tiny/runtime` exposes one curated entry (host shell, both thread entries,
  tree protocol/renderers, host adapters, diagnostics and utilities). Internal
  logic-tree/backend/glass/service modules are not re-exported.
- Runtime layers are grouped under `component/`, `service/`, `tree/` (with
  `tree/logic` and `tree/render`) and `host/`, each with a single `index.ts`.
- Intersection observers are bridged: the service forwards observe requests to
  the render tree, web hosts resolve them with DOM `IntersectionObserver`, and
  entries return through `query.intersection` to the logic tree. Page and
  component `this.createIntersectionObserver` / `this.createSelectorQuery` are
  wired, and `wx.createIntersectionObserver(component?, options?)` resolves to
  the same page/component-scoped observer.
- `this.animate` / `this.clearAnimate` (alias `clearAnimation`) resolve the
  selector in the logic tree and send normalized keyframes over
  `tree.animate`; web hosts play them with the Web Animations API. Scroll-driven
  timing (`scrollSource`) runs as a timed animation and reports
  `ANIMATION_SCROLL_DRIVEN_APPROXIMATED`.
- WXS modules run as sloppy script: the template bundle is an ES module (always
  strict), so the compiler emits module bodies as strings and evaluates them
  through `Q.S` (`Function`-compiled) instead of inlining arrow functions. This
  also fixes inline `<wxs>` shadowing the `D` module registry with the procgen
  data argument.
- Events carry measured `offsetLeft` / `offsetTop` / `offsetWidth` /
  `offsetHeight` on the dispatched node so handlers can read
  `event.currentTarget.offsetLeft` synchronously.
- Built-in behaviour the page never binds (currently `<navigator>`) travels as
  `tree.hostAction` from the render tree to the host, which runs it through the
  same navigation handlers as `wx.navigateTo` and friends. This keeps routing,
  the page stack and render-page lifecycle in one place instead of
  synthesising a page event.
- The host attaches render threads through one seam only: `renderConnector`
  (`connect` / `activate` / `disconnect` / `setAppVisible`). The original
  single-connection `renderTransport` mode was removed once every host used
  per-page frames; in-memory tests implement the same connector with headless
  tree threads, so unit tests exercise the production topology instead of a
  parallel one.
- WXS event handlers receive a component descriptor as their second argument
  (`function (event, ins) {}`), also exposed as `event.instance`. The compiler's
  `Q.C` listener wrapper only adds it for listeners whose value comes from a WXS
  module, and otherwise mirrors glass-easel's default wrapper exactly (binding
  `this` to the host's method caller). The descriptor itself is built in the
  service (`service/wxs-host.ts`): `selectComponent` / `selectAllComponents` /
  `getDataset` / `getData` / `setStyle` / `callMethod`. `setStyle` merges into
  the element's inline style and asks for a page re-diff, so the render thread
  receives an ordinary `tree.patch`.
- The logic backend records element-to-node associations (`associateValue`)
  and gives shadow roots a host pointer, so a glass element can be resolved back
  to its logic node. Component-scoped selector queries, intersection observers,
  `this.animate` and the WXS descriptor all depend on that reverse lookup.
- Touch events carry `touches` / `changedTouches` on the event object itself,
  with touch members materialised into plain objects (their coordinates are
  prototype getters, so spreading a `Touch` loses `pageX` / `clientX`).
- The host keeps no implicit "active page". Page-scoped host calls
  (`inspectTree`, `pullDownRefresh`, `share`, `saveExitState`, `setTheme`) take
  a page id, and routing never falls back to a guessed page. Frame visibility
  stays host-owned: the browser connector tracks the visible page because that
  is an iframe concern.
- Tree messages for a page whose render thread does not exist yet are parked
  per page and flushed when it opens. This is protocol, not legacy: the service
  mounts a page and emits its first flow *inside* its bootstrap control, so the
  message is produced before the host can answer by opening the render thread.
  The parking lot is bounded (16 pages) and dropped on page close; a page-scoped
  message without a page id, or one that overflows the bound, reports
  `RENDER_SESSION_MISSING`.

### Known gaps against the reference protocol

- `tree.event` carries `id` / `name` / `detail` / native fields, touches and
  `target` / `currentTarget` geometry (`offsetLeft` / `offsetTop` /
  `offsetWidth` / `offsetHeight`). Dispatch still targets the binding node, so
  nested `target` semantics remain approximate: both objects resolve to the
  node that owns the handler.
- `createNativeTreeRenderer` is a contract plus headless smoke tests; no native
  host implementation ships in this repository. Native hosts must implement
  `observeIntersection` to support intersection observers.
- The acceptance gate previews Vant/WeUI and asserts their initial render; deep
  Vant calendar/sticky interactions are not asserted end-to-end.

## Context

Tiny used to run glass-easel in the render thread: render evaluated WXML/WXS,
owned properties, dataset and the DOM, while the service thread kept page and
component JavaScript state. That split caused the compatibility gaps:

- dataset values lose their types when read back from DOM nodes;
- function-valued properties cannot cross the bridge;
- a native renderer would have to reimplement mini-program semantics.

A first migration attempt (`feat/service-logic-tree`) moved the logic tree to
service, but the render side grew a series of per-tag built-in adapters,
primitive-node expansion and a detached glass island. Those approaches were
frozen: they create built-ins without a real component tree, so parent/slot/
relation dependent built-ins (for example `checkbox-group`) cannot work
correctly.

WeChat 2.7.0 confirms the target split. Its appservice bundle runs exparser in
`isDataThread()` mode, its webview bundle runs the full exparser renderer, and
the two communicate through component-flow events plus virtual-tree patches.

## Decision

Run two trees with a host-neutral protocol between them.

### 1. Service logic tree

- glass-easel `ComponentSpace` in the service thread.
- Custom components are real component instances and own:
  - data, properties, observers and relations;
  - lifetimes, events and page lifecycle;
  - typed dataset and node identity.
- Built-in tags are **semantic virtual nodes without internals**. The service
  does not load web/native built-in implementations.
- The service evaluates templates once and maintains the virtual-node tree used
  for patches and query matching.
- Template/evaluation output is a virtual tree, not DOM strings.

### 2. Render tree

- One render root per page.
- A host renderer owns a real component tree:
  - built-in tags become real host components (web: `@tiny/host-web-components`;
    native: native views);
  - custom components become render mirrors or host containers;
  - parent/child, slots, shadow roots, external classes, style scopes and
    layout belong to this tree.
- Render never executes app methods, observers or relations.
- Render nodes have stable ids shared with the service logic nodes.

### 3. Cross-thread protocol

**Component flow** keeps the two component trees aligned:

- component definitions;
- create node with a stable node id;
- apply properties;
- update data;
- manipulate children;
- flush/group/depth boundaries;
- layout-ready and setData callbacks.

**Virtual-tree patches** carry template output:

- text;
- replace vnode;
- property diff;
- reorder children;
- insert;
- remove;
- extra data.

Patches are batched per page. Events travel back with node id, type, detail and
target geometry. Selector query and intersection results are resolved against
the render tree and mapped back to the service node id.

### 4. Multi-host

The protocol contains no DOM types. The web host implements the render tree
with glass-easel and `hosts/web-components`; a native host implements the same
render-tree contract with native views. Built-in implementations are always
host-owned.

## Protocol mapping

| Reference implementation | Tiny target |
| --- | --- |
| `WxVirtualNode` / `WxVirtualText` | `RenderElement` / `RenderText` with a stable `RenderNodeId` |
| `PATCH_TYPE` text/vnode/props/reorder/insert/remove/extra | `RenderPatch` text/replace/props/reorder/insert/remove/extra |
| `COMPONENT_DEF` and `FLOW_*` | component-flow `define` / `create-node` / `props` / `children` / `ready`; update flows are replaced by `tree.patch` |
| `WX_EVENT` | `tree.event` (node id, name, detail, native fields) |
| service has no `wx-*` built-ins | service emits semantic built-in tags |
| webview exparser built-ins | host render tree creates real built-ins |
| `vdSync` / `vdSyncBatch` | batched `tree.patch` per page |

## Migration phases

### R0 — contract lock

- Define node ids, component-flow message types and the patch set.
- Add protocol tests for a page with a built-in ancestor and child
  (for example checkbox-group/checkbox).
- Freeze per-tag renderer adapters and primitive-node expansion; no new built-in
  special cases outside the render tree.

### R1 — render tree foundation

- Create one render root per page.
- Implement `createElement(tag)` for built-in components and render containers.
- Attach parent/child/slot/shadow before firing ready/layout.
- Delete the detached glass island and the per-tag DOM adapters.
- Acceptance: checkbox-group/checkbox, slider and switch interactions work in
  the projected view without renderer-specific event synthesis.

### R2 — flow and patch application

- Apply component-flow messages and virtual-tree patches to the render tree.
- Keep service/view snapshots in parity for every fixture.
- Acceptance: P0 demo and mini fixture interactions run through the new tree.

### R3 — events and queries

- Route `view.event` to the service logic node and dispatch with typed dataset.
- Resolve selector query/intersection through render node ids.
- Acceptance: Vant calendar and sticky flows keep typed dates and function
  properties.

### R4 — custom render mirrors

- Choose the minimal render definition for custom components (host container or
  stripped component mirror).
- Support slots, external classes and style isolation without app methods.
- Acceptance: Vant/WeUI fixtures render without the legacy expression path.

### R5 — retire the old path

- Remove the `logicLayer` switch; the service thread always owns the logic tree.
- Delete the render-side expression/property path.
- Update backend/devtool projections and acceptance docs.
- Acceptance: full `pnpm accept:glass-easel`; Vant/WeUI; native render-tree
  smoke test (node tree, no DOM).
- Done: default hosts switched, old render entry deleted, compiler output
  reduced to `service.js` + `templates.js`, adapter render-only APIs removed.

## Risks

- **Two trees can diverge.** Mitigate with snapshot parity tests against the
  shared tree protocol and the acceptance fixtures.
- **Component definitions in render** must not execute app methods or duplicate
  state authority.
- **Slots and built-in relations** require real parent/child composition; this
  is the main reason for rejecting the adapter/island approach.
- **Native renderers** must not inherit web-specific concepts; the protocol
  stays semantic.
- **Type fidelity** still requires `dataDeepCopy: none` and function-preserving
  property passing in the service tree.

## Non-goals

- Evaluating app templates a second time in render.
- Shipping built-in component internals into the service tree.
- Extending per-tag DOM adapters or primitive `$div`/`$input` expansion.
