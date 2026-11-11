# Runtime Context

## Layer map

Dependencies point inward. `scripts/check-runtime-layers.mjs` enforces the
arrows below; `pnpm check:runtime-layers` fails on a new cross-layer import.

```text
host / tree/render  ──►  tree/protocol  ──►  shared primitives
                              ▲
service/thread (assembly) ──► service/render ──► tree/logic ──► component
        │                          │
        └──► service/page-stack ───┘
```

| Layer | Paths | Owns | Must not import |
| --- | --- | --- | --- |
| Shared domain | `component/`, `data.ts`, `diagnostics.ts`, `assets.ts`, `events.ts`, `protocol-controls.ts` | component definitions/behaviors/options/generics, data patching, diagnostics, shared control constants | `service/`, `tree/` |
| Service runtime | `service/thread.ts` (assembly), `service/page-stack.ts`, `service/page-instance.ts`, `service/page-registry.ts`, `service/component-tree.ts`, `service/route.ts`, `service/router.ts`, `service/tab-bar.ts`, `service/api-globals.ts` | App/Page/Component registration, page stack, routing, page/component routers, component selector tree, tabBar, app visibility, API globals | `tree/` |
| Service render | `service/render/` | service-side logic tree, component schemas/definition payloads, initial flow, patch scheduling, WXS bindings, inbound tree events, render RPCs | service runtime modules, `tree/render/` |
| Tree logic | `tree/logic/` | glass-easel `ComponentSpace`, recording backend, logic selector query, event dispatch | `service/` |
| Tree protocol | `tree/protocol.ts`, `tree/flow.ts`, `tree/diff.ts`, `tree/locator.ts`, `tree/animation.ts` | host-neutral nodes, patches, flow and locator contract | runtime implementations |
| Host render | `tree/render/` | render-thread entry, `TreeRenderer` contract, native renderer | `service/`, `component/`, `tree/logic/` |

`ServicePageStack` talks to the render side only through `ServiceRenderPort`
(implemented by `ServiceRenderBridge`). This keeps page navigation independent
of glass-easel and the tree protocol, and keeps all render-message knowledge in
one layer.

## Router and EventChannel

- `this.router` / `this.pageRouter` are built by `service/router.ts` with one
  stable base path and then call the installed `wx.*` table, so callbacks,
  `EventChannel` and diagnostics are identical to a direct API call. The base is
  the component path for `this.router` and the owning page path for
  `this.pageRouter`; relative URLs are resolved to absolute routes before the
  call so the page stack cannot change the base mid-navigation.
- The logic tree receives `createRouter` / `pageMeta` through
  `ServiceRenderBridge`'s `frameworkContext`; `tree/logic` only forwards these
  opaque objects. Glass component instances get lazy getters for `router`,
  `pageRouter`, `getOpenerEventChannel` (and `route`/`__route__`/`options` on
  page roots): the adapter resolves lifetimes, observers and relation handlers
  to the component, while template events keep the caller proxy, so defining the
  properties on the component instance covers both `this` shapes.
- `EventChannel` lives in `@tiny/api` (`event-channel.ts`); the host wires
  `ServiceThreadRuntime.setNextPageEventChannel` into the API context, and the
  kernel carries the page side through `ServicePageStack`. It is bound before
  the host call (the page runs `onLoad` while the call is in flight) and
  consumed by the next `navigateTo` page.

## Glossary

- **Runtime**: the host-independent `@tiny/runtime` core. It owns the two tree
  entries and the protocol between them; browsers and native containers are
  supplied by hosts.
- **Service logic tree**: glass-easel `ComponentSpace` plus the Tiny recording
  backend running in the service thread. It owns App/Page/Component data,
  properties, observers, relations, lifetimes, template evaluation, and event
  dispatch.
- **Page tree state**: per-page service-side state split into
  `PageTreeManager` (page root projection, optional independent tabBar root,
  latest render snapshots, component-data baseline, page-scoped component
  schema view) and the glass-side page tree manager (page root and tabBar
  components, component instance registry, relation index, page router, and
  page-local component instance counters).
  The `ComponentSpace` and component definitions remain shared; a page tree
  does not create a second glass-easel realm.
- **Render tree**: the host-owned real component/DOM tree behind `TreeRenderer`.
  It creates built-in components, containers, slots, styles and layout, and
  never executes app methods, observers, relations or templates. Web hosts may
  mount a second page-owned tabBar root outside the page content while sharing
  the same glass component space and WXS runtime.
- **Tree protocol**: the host-neutral contract between the trees. Initial mount
  uses component flow (`define` / `tree` / service-owned `componentFlow` /
  `ready`) and may carry an independent `tabRoot`; every subsequent increment
  uses per-page `tree.patch` (optionally with `tabPatches`) generated by the
  snapshot diff, not WeChat's legacy `FLOW_UPDATE` / `FLOW_SET_DATA` /
  `FLOW_DATA_OBSERVER` messages. Events return through `tree.event`; selector
  queries and intersection observers return through `query.*`. A batch that
  carries `setData` completions also carries opaque `ack` tokens, echoed by the
  render thread on `tree.ack`. Both trees address nodes by the shared stable
  `RenderNodeId`.
- **`setData` completion**: `setData(patch, cb)` applies the patch to service
  data synchronously; `cb` runs only after the render thread applied the batch
  (or after the flush when nothing observable changed). `ServiceRenderBridge`
  owns the token/ack queue; without a render tree the page instance completes in
  a microtask and the standalone logic tree defers to
  `glassEasel.triggerRender`. Completion errors become
  `SET_DATA_CALLBACK_ERROR` diagnostics.
- **Glass-easel adapter**: the internal service-side bridge that registers
  pages/components, resolves events and lifetimes, and drives template updates.
  It is not a public dependency for other packages.
- **Service render bridge**: `ServiceRenderBridge` in `service/render/`, the
  façade of the only service layer that knows `tree/logic` and `tree/protocol`.
  It owns the logic tree lifecycle, component schema/definition payloads,
  initial `tree.flow`, batched `tree.patch` and WXS bindings. Inbound
  `tree.event` / `tree.templateEvent` / `tree.wxsEffect` / `tree.ready` routing
  lives in `inbound.ts`; render-side query/animation RPCs live in `rpc.ts`. The
  page stack sees the bridge only as `ServiceRenderPort`.
- **Core entry**: `@tiny/runtime`, whose explicit public barrel must remain free
  of browser globals.
- **Web host**: `@tiny/host-web` (`hosts/web`), which owns iframes, message
  ports, DOM canvas, the DOM render tree / WebView render entry, page
  visibility, and the devtool overlay.
- **Render thread connector**: `RenderThreadConnector` lets a host create one
  render transport per page. Host-side orchestration now lives in the platform adapters; runtime keeps only
  page ID, bootstraps each render tree with that page's flow, and tears the
  connection down on `onUnload`. Without a connector, a single render transport
  serves the whole stack (tests and simple hosts).
- **Page frame**: the host-owned render document for one page. The devtool
  keeps hidden page frames mounted and only toggles visibility, so back
  navigation does not rebuild the page from data.
- **Page lifecycle**: service-driven `onLoad/onShow/onReady/onHide/onUnload`
  plus host-driven `onPageScroll/onReachBottom/onResize`, and tabBar-driven
  `onTabItemTap`. Every transition is emitted as a `PAGE_LIFECYCLE` diagnostic
  with page identity and a monotonic sequence; `RUNTIME_STATE` carries the page
  stack, live/cached pages, tabBar state, and visible flags.
- **TabBar**: `app.json.tabBar` is normalized by the service. Tab pages are
  cached across `switchTab` (hidden, not unloaded), non-tab pages are destroyed,
  and `RUNTIME_STATE.tabBar` exposes visibility, selected index, style, icons,
  badges, and red dots to a host. The service implements `switchTab` and the
  standard tabBar mutation APIs; the browser host owns rendering.
- **Page stack limit**: `maxPageStack` defaults to 10 and is supplied by the host
  through the runtime bootstrap. `navigateTo` rejects before hiding the current
  page when the stack is full; the limit is echoed in
  `RUNTIME_STATE.maxPageStack`.
- **Bridge**: the transport-only boundary for serialization, batching, timeouts,
  and errors. It does not define API or rendering behavior.
- **Service API table**: the `wx.*` functions installed on the global API object.
  It is not kernel code: the host entry creates the connection, composes the
  `ApiContext` and passes the assembled table through
  `ServiceThreadOptions.apiHost`; the standard WeChat-compatible table ships in
  `@tiny/api`. The kernel owns only the global namespace and the
  unsupported-API fallback, so adding an API never changes runtime semantics.
- **API context**: `ApiContext` in `@tiny/api` — bridge connection, page
  identity, tabBar, canvas, asset resolution and diagnostics. Synchronous calls
  use `connection.callSync`, backed by the host-injected global handle. The host entry builds it from host facts plus late-bound runtime
  accessors (`activePage`, `tabBar`, `setNextPageEventChannel`). `@tiny/api`
  must not import `@tiny/runtime`; host contracts (`SystemInfo`, `StorageValues`,
  `HostApiHandlers`) live in `@tiny/api`, and shared pure helpers live in
  `@tiny/manifest`. The runtime stores no system-info or storage snapshot: hosts
  own those facts.
- **Built-in components**: host-owned render components for mini-program tags
  such as `view`, `text`, `image`, `button`, and `input`. The service logic tree
  emits only semantic tags; the web host supplies `tiny-*` implementations and
  CSS, and a native host supplies its own `TreeRenderer` views.
- **Runtime compatibility**: manifest-provided API namespace/aliases,
  registration globals, behavior scheme, and legacy opaque globals. These affect
  the mini-program input contract, not Tiny's fixed internal naming.
- **Asset resolution**: `ServiceThreadOptions.resolveAssetUrl` maps app-root
  asset paths for service-side canvas/selector nodes and compiler-normalized
  WXSS `url(...)` values; the web render entry's `resolveAssetUrl` maps paths
  for rendered `<image>` nodes. The compiler normalizes local WXSS references at
  build time; inline `style` URLs are left to the WebView CSS engine, matching
  WeChat. External/data URLs and paths escaping the app root stay unchanged.
- **Style scope**: the compiler emits scoped CSS plus low-priority/page-scope
  artifacts. The service logic tree assigns cascade roles
  (builtin/low-priority/app/page/component/page-scope/shared), registers the
  sheets before registering component definitions, then sends the selected
  page's role-filtered style text with its tree flow; the render tree only
  applies that text. `:host` rules travel in the low-priority sheet,
  which is appended before app/page/component styles. Page roots are `shared` by
  default; component-as-page roots
  read an explicit `styleIsolation` and otherwise also default to `shared`.
  Page/component tag selectors are rewritten to
  `tiny-<tag>:where(.tiny-tag-<tag>)`, preserving tag specificity while
  preventing leakage. Every rendered element carries the fixed generic scope
  marker (`tiny-scope`); selector-only rules such as `*`, `#id`, and bare
  pseudo-classes are anchored with `:where()` and cannot escape their
  page/component. Page elements keep both scoped classes and unscoped names (the
  page's `extraStyleScope` is the global scope), so global app selectors match
  page-owned nodes. Built-in hosts are a public global-style boundary; each
  built-in's private internal DOM uses an independent `tiny-builtin-<tag>`
  stylesheet scope. Consumers identify sheets through manifest artifact
  references and `pageScopeClassSign`, never through source filenames or
  extensions.
