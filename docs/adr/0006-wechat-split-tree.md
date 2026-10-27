# ADR-0006: WeChat-style split trees for service logic and render

## Status

Accepted — implementation branch `feat/wechat-split-tree`, based on `next`
(`feb5f61`). The earlier `feat/service-logic-tree` branch is a reference only.

### Implementation status

- The standalone test host and the debugger boot the split tree by default.
  The `logicLayer` option, the `logic=` URL parameter and the `logic=render`
  escape hatch are gone: the service thread always owns the logic tree.
- The production render entry (`packages/runtime/src/render.ts`) has been
  deleted. The compiler no longer emits `render.js`; hosts load `templates.js`
  directly.
- Initial page mount is driven by component-flow messages
  (`define` / `create-node` / `props` / `children` / `ready`). Subsequent
  template updates use virtual-node patches.
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

## Context

Tiny currently runs glass-easel in the render thread. Render evaluates WXML/WXS,
owns properties, dataset and the DOM, while the service thread keeps page and
component JavaScript state. This causes the known compatibility gaps:

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
| `WxVirtualNode` / `WxVirtualText` | `ViewNode` + stable render node id |
| `PATCH_TYPE` text/vnode/props/reorder/insert/remove/extra | `view.patch` |
| `COMPONENT_DEF` and `FLOW_*` | component-flow messages |
| `WX_EVENT` | `view.event` |
| service has no `wx-*` built-ins | service emits semantic built-in tags |
| webview exparser built-ins | host render tree creates real built-ins |
| `vdSync` / `vdSyncBatch` | batched view patches |

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
