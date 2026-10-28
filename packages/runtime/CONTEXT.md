# Runtime Context

## Glossary

- **Runtime**: the host-independent `@tiny/runtime` core. It owns the two tree
  entries and the protocol between them; browsers and native containers are
  supplied by hosts.
- **Service logic tree**: glass-easel `ComponentSpace` plus the Tiny recording
  backend running in the service thread. It owns App/Page/Component data,
  properties, observers, relations, lifetimes, template evaluation, and event
  dispatch.
- **Render tree**: the host-owned real component/DOM tree behind `TreeRenderer`.
  It creates built-in components, containers, slots, styles and layout, and
  never executes app methods, observers, relations or templates.
- **Tree protocol**: the host-neutral contract between the trees. Initial mount
  uses component flow (`define` / `create-node` / `props` / `children` /
  `ready`); updates use per-page `tree.patch`; events return through
  `tree.event`; selector queries and intersection observers return through
  `query.*`. Both trees address nodes by the shared stable `RenderNodeId`.
- **Glass-easel adapter**: the internal service-side bridge that registers
  pages/components, resolves events and lifetimes, and drives template updates.
  It is not a public dependency for other packages.
- **Core entry**: `@tiny/runtime`, whose explicit public barrel must remain free
  of browser globals.
- **Browser host**: `@tiny/host-browser` (`hosts/browser`), which owns iframes,
  message ports, DOM canvas, page visibility, and the devtool overlay.
- **Render thread connector**: `RenderThreadConnector` lets a host create one
  render transport per page. `createTinyRuntime` routes page-scoped messages by
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
- **Built-in components**: host-owned render components for mini-program tags
  such as `view`, `text`, `image`, `button`, and `input`. The service logic tree
  emits only semantic tags; the web host supplies `tiny-*` implementations and
  CSS, and a native host supplies its own `TreeRenderer` views.
- **Runtime compatibility**: manifest-provided API namespace/aliases,
  registration globals, behavior scheme, and legacy opaque globals. These affect
  the mini-program input contract, not Tiny's fixed internal naming.
- **Asset resolution**: `ServiceThreadOptions.resolveAssetUrl` maps app-root
  asset paths for service-side canvas/selector nodes; the web render entry's
  `resolveAssetUrl` maps paths for rendered `<image>` nodes and styles. The
  compiler rewrites local WXSS `url(...)` references. External/data URLs and
  paths escaping the app root stay unchanged.
- **Style scope**: the compiler emits scoped CSS plus explicit roles
  (app/page/component/page-scope/builtin). The service logic tree registers the
  sheets before registering component definitions, then sends the selected
  page's role-filtered style text with its tree flow; the render tree only
  applies that text. Page roots are `shared` by default; component-as-page roots
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
