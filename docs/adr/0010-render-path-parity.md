# ADR-0010: Render-path parity with WeChat (definition over the bridge, two evaluations)

## Status

Accepted and implemented for the kernel and the web hosts. The service and the
render thread now share one registration contract: the definition crosses the
bridge, both threads evaluate user templates, behaviors resolve on both sides,
and `setData` crosses as a per-component data patch plus structural operations.

`hosts/ios` joins in: `ios/scripts/build.mjs` publishes `templates.js` next to
the app assets and `hosts/ios/src/web/render.ts` evaluates it. There is no
switch: the two opt-in options (`renderComponentTemplates` /
`evaluateComponentTemplates`) were removed once the remaining gaps were fixed,
so the WeChat path is the only path. `pnpm accept:glass-easel` and
`pnpm ios:sim` both pass.

## Context

Tiny's split tree currently evaluates WXML **once**, in the service:

- The service glass-easel builds the full tree, including each custom
  component's shadow tree, and `LogicBackendContext.snapshotRenderTree`
  **flattens** it into a flat `RenderNode` list (`tree/logic/backend.ts`).
- `<slot>` is expanded during that flattening; the component boundary survives
  only as an element `tag`.
- The render tree turns a custom component into a generic container
  (`containerDefinition` in `hosts/web-components/src/render-tree.ts`) with no
  template, no properties and no behaviors.

WeChat does the opposite in three specific ways (verified against
`WAService.js` / `WAWebview.js` 2.33.0):

1. The component definition crosses the bridge:
   `is / using / generics / behaviors / data / properties / externalClasses /
   template / options` (`WAService.js` @6,301,007).
2. The template is evaluated on **both** threads: the data thread registers
   `template.func = Qn[path]` ("not found in data thread"), the view thread
   registers `template.func = window.__generateFunc__` ("not found in view
   thread").
3. Only components allocate a node id and emit `FLOW_CREATE_NODE`
   (`WAService.js` @6,255,641); built-in tags are virtual nodes on the service
   side and real elements only in the view.

Consequences of the current single-evaluation model (all structural, not bugs):

- `hasBehavior('tiny-form-field')` can never match a custom component in the
  render tree, so `<form>` cannot collect custom form fields.
- `wx-label-target` and the `group` / `item` / `positioning-container`
  behaviors cannot cross a custom-component boundary.
- `slot` semantics are a property of the flattening step, not of a component
  system.

## Decision

Adopt the WeChat path end to end (A/A/A):

| Axis | Decision |
| --- | --- |
| Evaluation | The render tree evaluates user templates again; the service keeps its own evaluation for selectors, relations, data diff and `selectComponent`. |
| Definition transport | The serialized definition crosses the bridge (`ComponentDefinitionPayload`); behavior ids cross as **strings** and each side resolves them against its own registry. |
| Data crossing | `setData` becomes component-scoped `data` flow + structural operations, not a whole-tree snapshot diff. |
| Built-in components | Stay render-only and inline (as in WeChat). They gain real custom-component ancestors, which is what unblocks cross-boundary behaviors. |

Built-in markers are **gone** from the wire: the payload carries the `wx://`
behavior ids only, and each side resolves them against its own registry (the
render side maps them to behavior objects because glass resolves strings by
URL). Form/label consumers in the render tree compare those objects by
identity.

The **service-side** `wx://` behaviors are placeholders, matching WeChat: they
contribute nothing but a marker id, so `this.data` / `this.methods` stay clean.
Everything observable lives where it belongs:

- `wx://component-export` — the `export` → `methods.__export__` rewrite is
  framework logic in the definition normalizer, keyed by the marker.
- `wx://form-field` — the component author declares `name` / `value`; `<form>`
  recognises the field by marker.
- `wx://form-field-button` — the `formSubmit` / `formReset` re-emit is a
  render-side behavior (the form and the wrapped button share one tree).
- `wx://label-target` — activation is the render-side `wx-label-target`
  behavior (`labelTap` → `handleLabelTap`).
- `wx://style-filter` — marker only.
- `wx://functional-page-behavior` — not supported (`UNSUPPORTED_BEHAVIOR`),
  same as `wx://request-filter` / `wx://request-sender`.

The render-side registry (`hosts/web-components/src/behaviors/builtin.ts`)
mirrors that same id set; a unit test compares it with the kernel's
`BUILTIN_BEHAVIOR_NAMES` so the two cannot drift.

`wx://form-field` is a pure marker on **both** sides, like WeChat. `<form>`
collects the way WeChat's view-side form does — from node props:

- page-level components: the render snapshot props (`currentTree`);
- components created while evaluating a template: glass drops undeclared props
  after a warning, so the render tree captures `name` / `value` through
  `unknownPropertyHandler` and `<form>` reads them from that capture;
- declared properties still win for the *current* value (a component that
  updates its own `value` is read from instance data).

A `wx://form-field-group` wrapper is traversed through its shadow tree, so
fields nested in a group component are collected too.

## Payload contract

`ComponentDefinitionPayload` (`tree/protocol.ts`) may carry only JSON-safe
data:

- `path`, `template: { path }`
- `properties` (public type/value table), `data` (property defaults)
- `behaviors` — string ids only; object behaviors were merged in the service
- `externalClasses`
- `options` — `styleIsolation` (already folded through `addGlobalClass`),
  `multipleSlots`, `virtualHost`
- `generics` — `componentGenerics` declarations; the render side resolves a
  declared `default` to a definition, and `generic:x` overrides resolve through
  the parent's `using` map. Page-level overrides (whose parent is the page
  root) resolve through `pageUsing`, the page's `usingComponents` table shipped
  with the flow; only an unresolvable target emits
  `UNSUPPORTED_COMPONENT_GENERIC` and falls back to a virtual placeholder.

It must never carry methods, lifetimes, observers, relations or the `export`
function. `serializeComponentDefinition` enforces this by JSON-cloning the
payload.

## Node identity (verified against 2.33.0)

`WAWebview.js` @4,753,808 defines `allocNodeId(node, id) { const next = id || p() }`:
an id is either supplied by the service or generated **locally**. The view
consumes exactly one `FLOW_CREATE_NODE` id per component while walking the op
stream (@4,853,706) and throws if the stream desynchronizes.

Consequence: only **component** nodes need a shared id. Inside evaluated shadow
trees the render tree already works that way (glass creates those elements and
they carry no service id); page-level elements still carry service ids and
patches address them by id. Demoting those ids to the render side remains a
protocol-cleanliness item, not a correctness gap.

Geometry and animation for render-local nodes use selector-based addressing:

- `measureView` is wired, so nodes with a shared id are measured by id.
- Nodes without one fall back to a **scoped render query**
  (`QUERY_CONTROL.select` with `scopeId`): the render tree resolves the selector
  inside the owning component and returns rects, matched to the logic nodes
  positionally.
- `this.animate` sends `selector` + `scopeId` next to `viewIds`, so the render
  tree can animate targets that only exist in its DOM.
- The render-side matcher mirrors the logic one (a tag also matches its `tiny-`
  host, a class also matches its scope-suffixed variant, descendant selectors are
  supported), so both sides select the same elements.

`createSelectorQuery(...).boundingClientRect()` inside a component now returns
real geometry, and `this.animate` on a node inside an evaluated shadow tree
plays; both were silent no-ops (zero rects / no element) before.

## Behavior ids cannot cross as raw strings

glass-easel resolves behavior strings through URL rules
(`ComponentSpace.normalizeUrl`): `wx://form-field` becomes domain `wx://` plus
path `form-field`, and a flat id such as `tiny-form-field` is resolved relative
to the component's `is`. A component whose `is` is an artifact path
(`components/card/card`) therefore **cannot** match a behavior by string.

Consequence: the definition payload keeps `behaviors` as WeChat-compatible
strings (that is the wire contract), but the render tree resolves them to
behavior objects against its own registry before calling `defineComponent`,
and built-ins compare marker behaviors by identity
(`ctx.behaviors.formField`), not by string id. WeChat's view thread can look
up by string because its Exparser special-cases `wx://`; tiny's cannot.

## Two-evaluation experiment (round 3)

Both sides were switched on together in the acceptance host
(the two options that have since been deleted) and the full gate was run.
Results:

- P0 demo, todos rendering and the interactive todos steps passed, and the
  ECharts canvas step got past its canvas check once built-ins resolved inside
  evaluated templates (see below).
- **Blocker 1 (fixed): tag resolution.** A template evaluated in the render
  space resolved `<canvas>` relative to the component `is`
  (`ec-canvas/canvas`), fell back to a native node, and produced a raw
  `<canvas>` host instead of `tiny-canvas`. Definitions now carry a resolved
  `using` map (built-ins + `usingComponents` paths) and the render definition
  binds it.
- **Blocker 2 (fixed in round 4): style scoping.** Nodes created by
  render-side evaluation carried no `scopes` / `scopeChain`. The definition
  payload now carries the compiler-assigned `styleScope`
  (`manifest.styles[].scope`, keyed by the extension-less component path), the
  render space owns a `StyleScopeManager`, and each component definition is
  registered with that scope id. The acceptance scoping assertion now passes.
- **Blocker 3 (bridge done in round 5): events inside evaluated shadow trees.**
  The definition payload now carries `methods` (names only). The render tree
  installs a forwarding stub per method, the stub reports
  `{ componentId, handler, name, detail, touches, dataset, geometry }` through
  `tree.templateEvent`, and the service runs the real method from the
  normalized definition (`LogicTreeAdapter.dispatchTemplateHandler`). The
  acceptance now passes the todos interaction step, which exercises clicks
  inside evaluated components.
- **Blocker 4 (fixed in round 7): canvas drag repaint.** The probe showed every
  `touchstart/touchmove/touchend` reaching the bridge but the host-core
  serializer rejecting the payload with
  `payload.touches[0].radiusX contains an unsupported undefined value`: the
  forwarding stub normalized glass touch arrays through `normalizeTouchList`,
  which materializes absent fields as `undefined`. Forwarded touch arrays are
  now cloned verbatim (only real `TouchList`s are normalized). ECharts drag
  repaints and the full gate passes.

## Correction: it was not actually active until the WXS fix

The render iframe never installed `globalThis.__tinyWxsRuntime`, so importing
`templates.js` threw `WXS runtime is not installed` and the promise that
installs templates was swallowed. Until that was fixed, every "two-evaluation"
run still executed the flattened snapshot, which is why the gate looked green.
Fixing it exposed four further gaps, all fixed: the render root must carry the
page style scope (`~class`), `apply-shared`/`shared` need `extraStyleScope`,
external class values must be handed to the render instance, and component data
(initial + patches) must be pushed into the render instances.

Progress on the remaining gaps: the render tree now installs its own
`__tinyWxsEventHost` (the template's `Q.B`/`Q.C` hooks resolve to a descriptor
whose `callMethod`/`triggerEvent` go through `wxsEffect`), and definitions set
`writeIdToDOM` so `#id` addressing inside a component works again.

Resolved since: the descriptor receives the *glass* node (not its backend
element), so the host converts it with `getBackendElement()` and then walks
glass ancestry; `writeIdToDOM` restores `#id` addressing inside components.

Two further parity fixes came out of the same work:
- `hostNodeTagName` uses glass's `tiny-*` prefix form, so components created by
  an evaluated template also get the `tiny-` host element (without it
  `van-overlay` rendered as `<van-overlay>`, invisible to selectors that expect
  `tiny-van-overlay`).
- `inspectTree` reads the live DOM instead of `currentTree`, because evaluated
  shadow nodes have no service node record and the debugger's Elements panel
  used to show components as empty shells.
- A structural patch can recreate a component after the initial flow; the stored
  `componentData` patch is re-applied at creation, otherwise service-side data
  (`attached` setData, observers) is lost for the new instance.

The last gap was component *identity* inside an evaluated template. A component
created by an evaluated template (`van-transition` inside `van-overlay`) had no
view id, so the data the service computed for it (`attached`/observers, e.g.
`inited`) never crossed the bridge and its `wx:if` stayed false. `create-node`
now carries `componentInstances`: the view id and path of every component the
render thread will create while evaluating that template, in document order.

`matchComponentInstances` consumes that list **positionally**, the way WeChat's
view thread consumes `FLOW_CREATE_NODE`: the logic tree walks the same template
with the same data, so the two lists must align index by index. A path mismatch
is a hard `TREE_COMPONENT_DESYNC` error (WeChat throws there); matching by path
name instead would silently write data into the wrong instance. A count mismatch
is only decisive right after mount (the post-mount microtask passes
`strictCount`), because later passes can observe a render lag. The matched
prefix stays bound (its ids are correct); the diverging instance is left
unbound so a later snapshot can retry.

## Element id demotion (done)

Only components and the page root carry a shared id across the bridge now;
everything else is render-local or positional:

- **Snapshot**: element/text nodes carry no `id`. The page root and custom
  components keep theirs (component data routing and component identity).
- **Flow**: the snapshot travels as one `{ type: 'tree', root }` message
  after the `define` messages; there is no per-node `create-node` stream and
  no element id on the wire.
- **Render-local ids**: the glass render tree and the native renderer assign
  `r:<n>` ids to nodes without one. They key their node maps by those ids and
  never share them back to the service.
- **Identity**: `diffRenderTree` matches children by `wx:key` or by position
  (a per-parent token), never by id. Element patches address nodes with the
  component-scoped locator (`owner#index.path`), components with their id.
- **Events**: element targets are sent as locators; the service resolves them
  through `LogicBackendContext`'s locator map (`findByViewId` accepts both).
  WXS dynamic bindings are registered with the logic id, then flushed after
  each tree update with the node's *current* render identity, so a structural
  change never leaves a stale key. Custom component events are forwarded to the
  render tree (`tree.customEvent`) only when the page has a WXS binding for that
  event name; the logic tree's WXS listener is a no-op placeholder.
- **Queries**: selector queries measure page-level elements by locator
  (`measureLocators`); elements inside evaluated shadow trees keep the scoped
  render query because their service structure is not mirrored. Intersection
  observer targets use the same locator identity.
- **Devtool**: `InspectNode.id` is already a structural path, so inspection is
  unaffected.

## Single path: no switches

The `renderComponentTemplates` / `evaluateComponentTemplates` options are gone
from the kernel, `hosts/web-components`, `tests/host`, the devtool and iOS.
Every host uses the same path: the definition crosses the bridge, the render
thread evaluates the template, and per-instance data crosses through
`define` + `componentInstances` + `componentData` patches.

A structural patch can recreate a component; the stored `componentData` patch is
re-applied at creation so data from `attached`/observers is not lost. Components
created while evaluating another template are matched through
`componentInstances` (path + document order).

## Phases and exit criteria

| Phase | Scope | Exit criterion | Status |
| --- | --- | --- | --- |
| 1 | `ComponentDefinitionPayload`, `define` messages, `component`/`componentPath` on nodes, `kind` on `create-node`, pure `buildComponentFlow` | Flow marks every custom component as `kind: 'component'` with its path; runtime tests green | **done** |
| 2a | Render tree registers a real component per `define` (path `is`, public properties); light children still come from the flow | `hasBehavior`/ancestor walks see a component at every boundary | **done** |
| 2b | Template transport (`templates`/`loadTemplates`, flows parked until installed) and render-side evaluation | a component's shadow tree is built from its template in the render thread | **done** |
| 3a | Service keeps light children; definition payload carries `styleScope`; render space owns a `StyleScopeManager` | evaluated nodes carry the compiler's scope classes | **done** |
| 3b | Event bridge for template-declared handlers (`methods` in the payload, forwarding stubs, `tree.templateEvent`, `dispatchTemplateHandler`) | a click inside an evaluated component reaches the service handler | **done** |
| 3c | Forwarded touch arrays keep their shape (the bridge rejects `undefined` fields) | ECharts drag repaints under two-evaluation | **done** |
| 4a | Render-side `wx://` registry (form-field/group/button, label-target alias, empty markers), behavior objects resolved from the payload, properties projected into `this.data` | a user component declaring `wx://form-field` is collected by `<form>` | **done** |
| 4b | `definitionFilter` chain resolves string behaviors (`wx://component-export` → `methods.__export__`); `selectComponent` returns the export result | a component declaring `wx://component-export` returns `export()` from `selectComponent` | **done** |
| 5 | `setData` → per-component data patch + structural ops (`updateComponentData`, merged render-side); a data-only change still crosses the bridge | `pnpm accept:glass-easel` green; identity parity test covers the data patch | **done** |
| 6 | Component instances inside evaluated templates (`componentInstances`, positional match + `TREE_COMPONENT_DESYNC`); selector-scoped geometry/animation for render-local nodes | nested components receive their service data; `boundingClientRect`/`this.animate` work inside a component | **done** |
| 7 | Page-level `generic:x` overrides: the page's `usingComponents` ship with the flow (`pageUsing`), the root is (re)built once at mount with the page scope + using table | a page-level component resolves `generic:x` to the declared target; only unresolvable targets warn | **done** |

## Invariants that must not regress

1. **Node identity** — ids are allocated by the service (`ensureViewId`) and
   mirrored by the render host; they are never derived from DOM nodes.
2. **Event routing** — render side reports by node id; the service resolves the
   owning component.
3. **Style scope** — scope names/ids are computed in one place; the render side
   may only consume them (`scopes`, `scopeChain`, `wx-style-scope`).
4. **No host globals in the service** — `pnpm check:runtime-purity` stays green.
5. **Deterministic evaluation** — the same template + data must produce the
   same structure on both threads, or ids drift and patches thrash.

## Rejected alternatives

- **Metadata-only bridge** (send markers, keep single evaluation): fixes
  `form-field`/`label-target` but leaves every cross-boundary behavior broken;
  rejected as a partial fix, not as the target architecture.
- **Moving logic into the render thread**: contradicts the split-tree model and
  the purity check.

## Consequences

- Template artifacts must be available in both threads (hosts load
  `templates.js` on the render side too).
- `setData` cost roughly doubles versus single evaluation — the same trade-off
  WeChat makes; acceptable because correctness of cross-component semantics
  depends on it.
- Every host that mounts a render tree (`hosts/browser`, `hosts/ios`,
  `hosts/web-components`, devtool) must consume `define` messages; until then
  the `kind: 'component'` flag is inert.
