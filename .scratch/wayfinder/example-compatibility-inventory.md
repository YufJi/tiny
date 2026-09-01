# Example compatibility inventory for a glass-easel-based path

## Scope and method

- This inventory is based only on the local repository at the time of writing. It focuses on `example/mini`, `packages/compiler`, `packages/base`, `packages/devtool`, and the local `packages/template-compiler` / `packages/stylesheet-compiler` ports.
- “Glass-easel-based path” here means the in-repo `@tiny/template-compiler` and `@tiny/stylesheet-compiler` packages, which describe themselves as Node.js ports of the glass-easel template and stylesheet compilers. This report does **not** assume that the upstream glass-easel runtime is already installed or integrated; no such runtime dependency exists in the local compiler manifest.
- All templates were smoke-tested locally with `packages/template-compiler/dist`. The test did not install anything: it added all eight example WXML files to a dev-mode `TmplGroup` and invoked `getTmplGenObjectGroups()`. All files parsed and code generation produced 16,670 characters of output; one warning was reported (`ChildNodesNotAllowed`) for the children inside `<template is="templatea">` in the add-todo page.

## Example app inventory

### Routes, configuration, and subpackages

| Area | Used by the example | Local evidence |
| --- | --- | --- |
| Main pages | `pages/todos/todos`, `pages/add-todo/add-todo`, `pages/bar/index` | `example/mini/app.json:2-8` |
| Subpackage | `packageA` with page `pages/c/c` | `example/mini/app.json:9-15` |
| Global window title | `navigationBarTitleText: "哈哈哈"` | `example/mini/app.json:16-18` |
| Global custom component | `add-button` is registered globally and used by the todos page | `example/mini/app.json:16-19`, `example/mini/pages/todos/todos.wxml:26-30` |
| Page component | `ec-canvas` is registered on the chart page | `example/mini/pages/bar/index.json:2-4`, `example/mini/pages/bar/index.wxml:3` |
| Sitemap | A wildcard allow rule is present | `example/mini/sitemap.json:1-6` |
| Compiler output config | The stale local cache also contains the four main-package pages and `packageA/pages/c/c` launch parameters | `example/mini/.cache/appConfig.json:1-28` |

### WXML syntax and template features

| Feature | Concrete uses | Local evidence |
| --- | --- | --- |
| Interpolation | Text, attributes, class suffixes, ternaries, logical operators, string concatenation | `example/mini/pages/todos/todos.wxml:35-43`, `example/mini/pages/todos/todos.wxml:29` |
| Lists | `wx:for`, `wx:for-item`, `wx:key="*this"` over todos and swiper items | `example/mini/pages/todos/todos.wxml:43-47`, `example/mini/pages/todos/todos.wxml:72-79` |
| Blocks | `<block>` as a list wrapper | `example/mini/pages/todos/todos.wxml:74-78` |
| Import/include | `add-todo` imports `a.wxml`, includes `b.wxml`, and uses two locally defined templates | `example/mini/pages/add-todo/add-todo.wxml:1-4`, `example/mini/pages/add-todo/a.wxml:1-12` |
| Template references | Nested `<template is>` usage; the outer template has children, which the glass-easel template port warns about | `example/mini/pages/add-todo/add-todo.wxml:23-26` |
| Default slot | `add-button` renders a default `<slot>` and the todos page supplies a `<text>` child | `example/mini/components/add-button/add-button.wxml:1-6`, `example/mini/pages/todos/todos.wxml:26-28` |
| Custom component properties | Static `text`, dynamic `text`, interpolated property value, and a dynamic custom-event handler string | `example/mini/pages/todos/todos.wxml:26-30` |
| Style/class bindings | Inline `style`, interpolated classes, and `rpx` units | `example/mini/pages/todos/todos.wxml:4-6`, `example/mini/pages/todos/todos.wxml:43`, `example/mini/pages/todos/todos.wxss:17-23` |

The example contains **no `<wxs>` module**. The compiler and template-compiler both have WXS/SJS paths, but they are not exercised by `example/mini`.

### Built-in components and key attributes

| Component | Used attributes / events | Local evidence |
| --- | --- | --- |
| `scroll-view` | `scroll-y="true"` | `example/mini/pages/todos/todos.wxml:2` |
| `view` | `id`, class, inline style, `bindtap`, `bind:tap`, `catchtap`, `catch:tap`, capture bindings, touch bindings, `data-xhq`, `animation` | `example/mini/pages/todos/todos.wxml:4-22`, `example/mini/pages/todos/todos.wxml:64-66` |
| `button` | `bind:tap`, default `hover-class` on another button | `example/mini/pages/todos/todos.wxml:32`, `example/mini/components/add-button/add-button.wxml:1` |
| `text` | Text interpolation and event binding inside a slot | `example/mini/components/add-button/add-button.wxml:3-5`, `example/mini/pages/todos/todos.wxml:27` |
| `input` | `placeholder`, `bindinput`, `value` | `example/mini/pages/add-todo/add-todo.wxml:6-11` |
| `image` | Relative asset path, fallback expression, `background-size="cover"` | `example/mini/pages/todos/todos.wxml:35` |
| `checkbox-group` / `checkbox` | `bindchange`, list values, `checked`, custom styling | `example/mini/pages/todos/todos.wxml:42-47` |
| `label` | `bindtap`, wrapping checkboxes | `example/mini/pages/todos/todos.wxml:42-47` |
| `slider` | `bindchange`, `show-value`, `value`, `min`, `max` | `example/mini/pages/todos/todos.wxml:51`, `example/mini/pages/todos/todos.wxml:104-109` |
| `progress` | `percent`, `show-info`, `active`, `stroke-width` | `example/mini/pages/todos/todos.wxml:53-55` |
| `switch` | `checked`, `bindchange`, `type="checkbox"` | `example/mini/pages/todos/todos.wxml:60`, `example/mini/pages/todos/todos.wxml:87-93` |
| `swiper` / `swiper-item` | `indicator-dots`, `autoplay`, `interval`, `duration`, `circular` | `example/mini/pages/todos/todos.wxml:72-79` |
| `icon` | `type="success_no_circle"` and `type="success"` with `size` | `example/mini/pages/todos/todos.wxml:113`, `example/mini/components/add-button/add-button.wxml:2` |
| `radio` | Static `value` and `checked` | `example/mini/pages/todos/todos.wxml:114` |
| Legacy `canvas` | Static `canvas-id`, fixed CSS size, old `CanvasContext` drawing | `example/mini/pages/todos/todos.wxml:3`, `example/mini/pages/todos/todos.js:78-81` |
| New `canvas` | `type="2d"`, dynamic `canvas-id`, touch event handlers | `example/mini/components/ec-canvas/ec-canvas.wxml:2-9` |

### JavaScript constructors, lifecycles, and data

| Surface | Concrete usage | Local evidence |
| --- | --- | --- |
| `App` | `onLaunch`, `onShow`, `onHide`; stores custom `todos` and `userInfo` directly on the App object | `example/mini/app.js:1-23` |
| `getApp` | Reads and mutates `app.todos` from pages/components | `example/mini/pages/todos/todos.js:2`, `example/mini/pages/todos/todos.js:88-97`, `example/mini/pages/add-todo/add-todo.js:1-25` |
| `Page` | Normal page on `todos` and chart page | `example/mini/pages/todos/todos.js:4-225`, `example/mini/pages/bar/index.js:120-130` |
| Page lifecycles | `onLoad`, `onShow`, `onReady`, `onHide` | `example/mini/pages/todos/todos.js:23-86`, `example/mini/pages/bar/index.js:127-129` |
| `Component` as page body | `add-todo` and subpackage page `c` call `Component()` rather than `Page()` | `example/mini/pages/add-todo/add-todo.js:3-39`, `example/mini/packageA/pages/c/c.js:3-39` |
| Custom `Component` | `properties`, `data`, `methods`, component lifetimes, page lifetimes, `triggerEvent` | `example/mini/components/add-button/add-button.js:1-55` |
| Component lifetimes | `created`, `attached`, `ready`, `moved`, `detached` | `example/mini/components/add-button/add-button.js:15-33` |
| Page lifetimes | `pageLifetimes.show` and `pageLifetimes.hide` | `example/mini/components/add-button/add-button.js:35-42` |
| `setData` | Direct values, array/object updates, animation export result | `example/mini/pages/todos/todos.js:32-40`, `example/mini/pages/todos/todos.js:111-119` |
| Timers | `setTimeout` is called inside page `onReady` | `example/mini/pages/todos/todos.js:61-64` |
| ES modules | ECharts and `EventHub` imports; the runtime also uses modern object spread and optional constructs | `example/mini/pages/bar/index.js:1-8`, `example/mini/pages/todos/todos.js:88-94` |

### APIs and bridge calls

| API | Usage and options | Local evidence |
| --- | --- | --- |
| Storage | `wx.setStorageSync('tinyName', ...)` and `wx.getStorageSync('tinyName')` | `example/mini/app.js:14`, `example/mini/pages/todos/todos.js:27-29` |
| Animation | `wx.createAnimation`, `scale`, `rotate`, `step`, `export`; durations and timing functions | `example/mini/pages/todos/todos.js:30-40`, `example/mini/pages/todos/todos.js:214-224` |
| Legacy canvas | `wx.createCanvasContext`, `setFillStyle`, `fillRect`, `draw` | `example/mini/pages/todos/todos.js:78-81` |
| New canvas path | `wx.createSelectorQuery().in(this)`, `.select`, `.fields({ node: true, size: true })`, `.exec`; then `canvasNode.getContext('2d')`, width/height mutation, and `wx.getSystemInfoSync().pixelRatio` | `example/mini/components/ec-canvas/ec-canvas.js:46-87` |
| Navigation | `wx.navigateTo` with relative URLs; `wx.navigateBack` | `example/mini/pages/todos/todos.js:105-109`, `example/mini/pages/todos/todos.js:207-212`, `example/mini/pages/add-todo/add-todo.js:22-24` |
| Toast | `wx.showToast` with `title`, `icon: 'success'`, `duration` | `example/mini/pages/todos/todos.js:197-202` |
| System info | `wx.getSystemInfoSync().pixelRatio` in the ECharts canvas component | `example/mini/components/ec-canvas/ec-canvas.js:57`, `example/mini/components/ec-canvas/ec-canvas.js:75` |
| User event payload | Code expects `e.detail.value` for input/change events | `example/mini/pages/add-todo/add-todo.js:8-20`, `example/mini/pages/todos/todos.js:88-181` |
| Native touch coordinates | ECharts code expects touch objects with `x` and `y`, as well as standard `touches`/`changedTouches` | `example/mini/components/ec-canvas/ec-canvas.js:88-127` |

### Events

The example exercises a broad event matrix:

- Bubble/bind: `bindtap`, `bind:tap`, `bindchange`, `bindinput`, `bindlongpress`, `bindtouchstart`, `bindtouchmove`, `bindtouchend`, custom `bind:click_me`.
- Stop/catch: `catchtap`, `catch:tap`, `catchtouchmove`, `capture-catch:tap`.
- Capture: `capture-bind:tap` in parent/child trees.
- Dynamic handler: `bind:click_me="{{fn}}"`.
- Custom events: `add-button` triggers `click_me` with `detail` and `{ bubbles: true }`.
- Canvas touch: `bindtouchstart`, `bindtouchmove`, and `bindtouchend`.

Evidence: `example/mini/pages/todos/todos.wxml:4-22`, `example/mini/pages/todos/todos.wxml:26-32`, `example/mini/pages/todos/todos.wxml:42-60`, `example/mini/pages/todos/todos.wxml:64-66`, `example/mini/components/add-button/add-button.js:46-52`, and `example/mini/components/ec-canvas/ec-canvas.wxml:6-8`.

## Local support and compatibility gaps

### Compiler/template support

| Area | Status | Notes and evidence |
| --- | --- | --- |
| Glass-easel template parsing | Works for the example | A local smoke test parsed all eight WXML files with `TmplGroup.newDev()` and generated code successfully. The port’s `addTmpl` path is `packages/template-compiler/src/group.ts:145-154` and code generation is `packages/template-compiler/src/group.ts:245-252`. |
| Syntax coverage | Broad enough for the example | The parser handles wx conditionals, loops/keys, imports/includes, templates, WXS, slots, ids/classes/styles, data attributes, event prefixes, model/change/worklet, and generic attributes. See `packages/template-compiler/src/parse/tag.ts:1132-1353`. |
| Event prefix coverage | Matches the example | `bind`, `catch`, `capture-bind`, `capture-catch`, and modern mutation bindings are parsed into event bindings; code generation preserves catch/mut/capture flags. See `packages/template-compiler/src/parse/tag.ts:1562-1579`, `packages/template-compiler/src/proc_gen/tag.ts:873-917`. |
| Dynamic event handlers | Parsed | The same event-binding path supports dynamic values and emits `R.v(...)`, so `bind:click_me="{{fn}}"` is not a parser-level gap. |
| Templates and dependencies | Mostly works | The parser records template definitions/references and computes import/include dependencies. The local smoke test resolved `pages/add-todo/a.wxml` and `pages/add-todo/b.wxml` from the add-todo page. See `packages/template-compiler/src/parse/tag.ts:1947-1958` and `packages/template-compiler/src/proc_gen/tag.ts:594-643`. |
| Slot support | Parsed | `<slot>` and default slot content are distinct parser node kinds; code generation emits `S(...)` for them. See `packages/template-compiler/src/parse/tag.ts:1179-1185` and `packages/template-compiler/src/proc_gen/tag.ts:645-684`. |
| Example warning | `<template>` child nodes | The glass-easel port warns `ChildNodesNotAllowed` at `example/mini/pages/add-todo/add-todo.wxml:23-26`; code generation still succeeds. |
| Integration status | Not integrated | `packages/compiler/package.json` has no dependency on `@tiny/template-compiler`. The active compiler still uses its own `xml/Transformer.js`, which emits Nerv JSX and is converted by Babel. See `packages/compiler/src/loaders/template-loader.js:25-38`, `packages/compiler/src/TemplateTransformer.js:30-100`, and `packages/compiler/src/transformMini.js:151-174`. |

### Styles

- The example uses `rpx`, pseudo-elements, transitions, flex layouts, `vh`, `rgba`, `rgb`, and background properties. See `example/mini/pages/todos/todos.wxss:1-160`.
- The glass-easel stylesheet port supports `rpx -> vw`, class prefixing, host conversion, comments, source maps, and `@import` markers. See `packages/stylesheet-compiler/README.md:7-15` and `packages/stylesheet-compiler/README.md:74-81`.
- The active legacy compiler does not convert `rpx` in `processDeclarations`; the `rpx` replacement is commented out. See `packages/compiler/src/StyleTransformer.js:31-36`.
- Therefore, a glass-easel stylesheet migration would fix or centralize `rpx`, but style prefixing must be coordinated with the runtime’s custom-component shadow-root and slot DOM.

### Built-in components and rendering

The active compiler whitelists the built-ins used by the example: view, button, text, label, form, input, checkbox, checkbox-group, radio, radio-group, icon, image, scroll-view, slider, progress, switch, swiper, swiper-item, and canvas. See `packages/compiler/src/utils.js:12-33`.

The base webview registers matching web components in `packages/base/src/webview/web-components/index.js:1-25`. That gives broad static coverage, but the important compatibility issue is semantic behavior, especially:

| Component / behavior | Gap or risk |
| --- | --- |
| `type="2d"` canvas | `Canvas` accepts a `type` property but ignores it in its implementation. It always creates its internal 2D context and subscribes to old command queues. See `packages/base/src/webview/web-components/canvas.js:14-55` and `packages/base/src/webview/web-components/canvas.js:123-165`. |
| Selector-query canvas node | `fields({ node: true })` returns a plain descriptor object. The service side patches it with a `getContext` function that returns the **old** service-side `CanvasContext`, not the real web DOM context. The returned node also lacks `width`/`height` fields required by ECharts/WxCanvas. See `packages/base/src/webview/api/utils/info.js:87-106`, `packages/base/src/service/apis/SelectorQuery/util.js:14-24`, `example/mini/components/ec-canvas/ec-canvas.js:46-87`, and `example/mini/components/ec-canvas/wx-canvas.js:1-103`. |
| Legacy canvas | The old path is better supported: service commands are queued and applied to the internal DOM canvas. See `packages/base/src/service/apis/Canvas/index.js:19-41` and `packages/base/src/webview/web-components/canvas.js:123-245`. |
| Slot layout | Legacy rendering places slotted nodes inside a `tiny-slot` wrapper with display-contents-like inline styles. This can interact badly with glass-easel component tree assumptions or CSS prefixing. See `packages/base/src/webview/render-helpers/renderSlot.js:6-15`. |
| Custom component style/data isolation | Legacy custom components render into a `ShadowRoot` wrapper and separately publish props/data/dataset to the service thread. A glass-easel node model must preserve node IDs, dataset, class/id forwarding, and component registration. See `packages/base/src/webview/Component/index.js:22-120`. |
| Dynamic classes/inline styles | The old transformer converts `class` to `className`; glass-easel emits its own attribute writer calls. A migration must map `class`, `style`, and `animation` consistently. See `packages/compiler/src/xml/Transformer.js:413-421` and `packages/compiler/src/TemplateTransformer.js:42-61`. |

### Event compatibility

The legacy Nerv runtime has a dedicated event model:

- It synthesizes `tiny-tap` from touch sequences and handles tap, longpress, native touch events, and capture/stop flags. See `packages/base/src/webview/nerv/event.js:14-110`, `packages/base/src/webview/nerv/event.js:112-203`, and `packages/base/src/webview/nerv/event.js:310-324`.
- It transforms WXML event attributes through `xmlEventReg`, which covers the example’s `bind:?`, `catch:?`, `capture-bind:`, and `capture-catch:` forms. See `packages/base/src/webview/nerv/utils/is.js:35`.
- Events are published to the service thread and dispatched to a Page or Component model by node ID. See `packages/base/src/webview/Component/hooks.js:183-206`, `packages/base/src/service/Page/handlePageEvent.js:7-35`, and `packages/base/src/webview/api/index.js:20-42`.
- ECharts canvas touch coordinates receive `x`/`y` only for canvas touch events. The existing wrapper adds those coordinates by subtracting the canvas box. See `packages/base/src/webview/nerv/event.js:250-308`.

A glass-easel runtime or adapter must reproduce: catch semantics, capture order, bubbling through custom component boundaries, `target`/`currentTarget`, dataset, dynamic handlers, touch coordinate normalization, and custom event detail/options.

### Lifecycle compatibility

| Lifecycle | Current state | Gap/risk |
| --- | --- | --- |
| App `onLaunch`/`onShow`/`onHide` | Registered and invoked | `example/mini/app.js:10-22`; `packages/base/src/service/App/index.js:7-23`; `packages/base/src/service/App/loadApp.js:17-38`. |
| Page `onLoad`/`onShow`/`onReady`/`onHide`/`onUnload` | Registered and dispatched through route/page events | `packages/base/src/service/Page/index.js:12-70` and `packages/base/src/service/Route/index.js:23-39`. |
| `Component` as page body | Existing route setup can instantiate a `ComponentPageModel` | `example/mini/pages/add-todo/add-todo.js:3-39`; `packages/base/src/service/Route/handleRoute.js:228-265`; `packages/base/src/service/Component/model.js:135-172`. |
| Component `created`/`attached`/`ready`/`detached` | Render thread publishes events and service model calls them | `packages/base/src/webview/Component/index.js:61-77`, `packages/base/src/webview/Component/hooks.js:47-58`, `packages/base/src/service/Component/model.js:154-169`. |
| Component `moved` | Parsed into behavior defaults but absent from the render-thread event set | `example/mini/components/add-button/add-button.js:24-26`; `packages/base/src/webview/Component/hooks.js:47-58`. |
| `pageLifetimes.show` / `hide` | Stored and mixed, but PageModel’s dispatch code is commented out | `example/mini/components/add-button/add-button.js:35-42`; `packages/base/src/service/Behavior/mixinBehaviors.js:14-16`; `packages/base/src/service/Page/model.js:22-49`. |
| Extra page callbacks | `onPullDownRefresh`, `onReachBottom`, `onPageScroll`, `onShareAppMessage` are registered even though the example does not use all of them | `packages/base/src/service/Page/index.js:26-69`; pull-down dispatch is in `packages/base/src/service/Route/index.js:42-50`. |

### Routing

The example uses only:

1. Initial launch of `pages/todos/todos`.
2. `wx.navigateTo` to `pages/add-todo/add-todo` and `pages/bar/index`.
3. `wx.navigateBack` from add-todo.
4. A configured subpackage page that is not navigated to.

The current route service validates `navigateTo`, `navigateBack`, `reLaunch`, `redirectTo`, and `switchTab`, resolves relative paths, and enforces declared pages. See `packages/base/src/service/apis/Route.js:7-99` and `packages/base/src/service/apis/util.js:63-107`. The route handler supports app launch, push, redirect, back, tab switch, and reLaunch. See `packages/base/src/service/Route/handleRoute.js:72-102`.

Potential glass-easel compatibility work is therefore less about basic route types and more about preserving:

- `Component()`-style page bodies.
- Page query semantics.
- Page show/hide event ordering.
- Webview identity and component node registries across route transitions.
- Subpackage lazy registration.

### Subpackages

The active compiler generates separate `index.webview.js` and `index.service.js` bundles for each subpackage and emits a call to `self.bootstrapSubPackage(root, { success })`. See `packages/compiler/src/generateEntries.js:113-153`.

However, a repository-wide local search found no implementation of `bootstrapSubPackage` outside the generated string itself. The stale example cache also does not contain a packageA bundle. This suggests that subpackage runtime bootstrapping is a real gap or at least incomplete in the current local tree.

### APIs and devtool host

The base service exposes the APIs used by the example, with these important caveats:

| API group | Current local support | Evidence |
| --- | --- | --- |
| Storage sync | Service API exists; devtool implements in-memory storage | `packages/base/src/service/apis/Storage.js:21-85`; `packages/devtool/src/utils/jsbridge/API/storage.js:1-20`. |
| Toast | Service API and devtool handler exist; devtool body is a no-op | `packages/base/src/service/apis/UI.js:3-26`; `packages/devtool/src/utils/jsbridge/API/ui.js:1-3`. |
| System info sync | Base service queries native; devtool returns a fixed object with `pixelRatio` | `packages/base/src/service/apis/System.js:18-28`; `packages/devtool/src/utils/jsbridge/API/system.js:1-10`. |
| Navigation | Base service APIs exist; devtool supports iframe push/pop for navigateTo/back only | `packages/base/src/service/apis/Route.js:7-42`; `packages/devtool/src/utils/jsbridge/API/index.js:10-26`; `packages/devtool/src/utils/jsbridge/API/navigation.js:9-122`. |
| Animation | `createAnimation`, `step`, and transform methods are implemented client-side | `packages/base/src/service/apis/Animation/index.js:3-56`; `packages/base/src/service/apis/Animation/util.js:1-129`. |
| Old canvas | Command queue and context methods exist | `packages/base/src/service/apis/Canvas/index.js:19-41`; `packages/base/src/service/apis/Canvas/CanvasContext.js:9-252`. |
| New canvas node | Partially emulated | `packages/base/src/service/apis/SelectorQuery/util.js:14-24` returns a legacy context, not a real new-canvas node. |
| Unknown host methods | Devtool logs “bridge: method暂不支持” | `packages/devtool/src/utils/jsbridge/index.js:11-18`. |

## Preliminary priority tiers

### P0 — minimum viable example path

1. **Wire the glass-easel template compiler into the active compiler/runtime.** Today the example compiler still routes WXML through the legacy Nerv JSX transformer, while the glass-easel port is a standalone package. Define the output contract (`R`, `C`, `D`, `U`, `E`, `F`, `S`, etc.) and adapt it to the target renderer.
2. **Preserve the service/render component model.** Component pages, `properties`, `data`, `setData`, `triggerEvent`, node IDs, datasets, and slot distribution must survive the new template output.
3. **Implement the complete event adapter.** This includes bind/catch/capture, custom component custom events, dynamic handlers, touch normalization, target/currentTarget, and dataset.
4. **Make the app/page/component lifecycle sequence equivalent.** In particular, fix or explicitly replace missing `moved` dispatch and disabled `pageLifetimes.show`/`hide` dispatch.
5. **Bridge the APIs actually used by the example**: sync storage, navigate to/back, toast, system info, animation, and both canvas paths.
6. **Fix the 2D canvas node contract.** For `fields({ node: true })`, the node must expose a real or adapter context plus mutable/readable width/height; otherwise `ec-canvas` and ECharts cannot initialize.

### P1 — correctness for the example’s secondary behavior

1. Reconcile built-in component semantics rather than only tag names: swiper, slider, checkbox/radio group events, input events, progress active state, image sizing, and scroll-view touch behavior.
2. Centralize `rpx`, class-prefix, and shadow-root styling strategy in the glass-easel stylesheet compiler; verify `::before`, transitions, component styles, and page/global style imports.
3. Validate template import/include and nested template semantics, including whether glass-easel’s child-node warning changes visible behavior for the add-todo page.
4. Preserve default-slot event bubbling and component-boundary event composition for `add-button`.
5. Implement lazy subpackage bootstrap for `packageA`; add a navigation path that actually enters `packageA/pages/c/c` during verification.
6. Ensure component page bodies (`add-todo` and `packageA/pages/c/c`) receive route/query and page lifecycle callbacks consistently.
7. Add route success/failure behavior and page stack restoration tests for relative navigation.

### P2 — robustness and later migration

1. Support WXS even though `example/mini` does not use it, because the compiler already has an SJS loader and the glass-easel template compiler has script APIs.
2. Handle non-example route types (`redirectTo`, `switchTab`, `reLaunch`) if the goal is broader compatibility than issue #6’s example.
3. Clarify unknown/unregistered component fallbacks and warnings.
4. Decide whether host-only devtool APIs should be no-op implementations, polyfills, or explicit unsupported errors.
5. Replace stale compiled cache assumptions with deterministic build tests.
6. Add golden-template tests for glass-easel codegen against every example WXML, including warnings and dependency resolution.

## Local citations index

The report above cites the following primary local files:

- Example configuration: `example/mini/app.json`, `example/mini/project.config.json`, `example/mini/sitemap.json`.
- Example pages and components: `example/mini/app.js`, `example/mini/EventHub.js`, `example/mini/pages/**`, `example/mini/components/**`, `example/mini/packageA/**`.
- Active compiler: `packages/compiler/src/transformMini.js`, `packages/compiler/src/transform.js`, `packages/compiler/src/loaders/*`, `packages/compiler/src/xml/Transformer.js`, `packages/compiler/src/TemplateTransformer.js`, `packages/compiler/src/utils.js`, `packages/compiler/src/generateEntries.js`, `packages/compiler/src/StyleTransformer.js`.
- Base runtime: `packages/base/src/service/**`, `packages/base/src/webview/**`, especially `Component`, `Page`, `Route`, `apis`, `web-components`, and `nerv/event.js`.
- Devtool host: `packages/devtool/src/utils/jsbridge/**`.
- Glass-easel compiler ports: `packages/template-compiler/**` and `packages/stylesheet-compiler/**`.
- Compiled example cache: `example/mini/.cache/appConfig.json`, `example/mini/.cache/index.service.js`, `example/mini/.cache/index.webview.js`.

## Unresolved questions

1. Is the intended target the **upstream glass-easel runtime**, the existing Tiny service/webview bridge, or a hybrid where glass-easel templates/styles are compiled but Tiny remains the component/runtime host?
2. Should the initial migration preserve Tiny’s current two-thread JSBridge and node ID model, or adopt glass-easel’s component tree/data-update model end to end?
3. What is the expected behavior for `type="2d"` canvas: expose the real DOM canvas node, provide a Tiny adapter that implements enough of the Web canvas API, or replace `ec-canvas` with a Tiny-native chart component?
4. Should a child inside `<template is="templatea">` be rejected, silently dropped, or rendered only when the referenced template contains a matching slot? The current glass-easel port warns, while the legacy compiler emits the child in the call site.
5. Is `bootstrapSubPackage` implemented in a host/runtime asset outside this repository, or is the missing implementation a known defect?
6. Which component/page lifecycle timings are contractual for the migration—especially `created` before initial data, `attached`, first render, `ready`, and `pageLifetimes` ordering?
