# Glass-easel runtime integration contract

> Research note for [YufJi/tiny#4](https://github.com/YufJi/tiny/issues/4).  
> Primary revision inspected: [`wechat-miniprogram/glass-easel@c1b32d58ec459f26881edf4a7f67de85adb7e22c`](https://github.com/wechat-miniprogram/glass-easel/tree/c1b32d58ec459f26881edf4a7f67de85adb7e22c), whose core and adapter packages report version `1.1.0`. Local terminology is taken from `packages/compiler` and `packages/base` in this repository.

## Executive summary

Glass-easel is **not** a complete mini-program SDK. It supplies the component-management framework: component definitions, templates, data binding, events, lifetimes, style scopes, and a pluggable render backend. Application launch, routing, service-thread APIs, and a `wx`-like native bridge remain host-runtime responsibilities. The official repository describes glass-easel as “a small part of the MiniProgram SDK,” generally the custom-components part, and explicitly warns that some runtime features belong outside it. [^1]

The practical integration boundary for tiny is therefore:

1. Compile WXML/WXSS/JSON/JS into artifacts glass-easel can consume.
2. Provide a backend context that owns the screen tree.
3. Wrap registration so tiny’s `App`, page stack, native APIs, and bridges execute around glass-easel components.

## Package and dependency options

| Package | Role | Integration implication |
| --- | --- | --- |
| `glass-easel` | Core component framework | Required by every route; contains `ComponentSpace`, backend protocols, and default template engine. |
| `glass-easel-miniprogram-adapter` | Mini-program-like `Page`, `Component`, and `Behavior` registration surface | The easiest compatibility layer, but it exposes only a subset of the MiniProgram API. |
| `glass-easel-miniprogram-webpack-plugin` | Webpack compilation of a mini-program-like directory | Useful if tiny accepts glass-easel’s Webpack toolchain; otherwise its loaders/plugin can be used as a reference. |
| `glass-easel-template-compiler` | WXML-to-JavaScript compiler | Produces the template shape expected by glass-easel. |
| `glass-easel-stylesheet-compiler` | WXSS-to-CSS compiler | Handles `rpx`, style-isolation prefixes, and minification. |

The official README identifies exactly these package roles and says that the core module is enough when implementing an adapter or build tool independently. [^2] The adapter has `glass-easel` as a peer dependency. [^3] The Webpack plugin has core, adapter, and Webpack as peers, while depending directly on the template and stylesheet compilers. [^4] The project template depends on core plus adapter and uses the Webpack plugin during build. [^5]

## Runtime object model

The adapter’s root object is `MiniProgramEnv`. One environment owns multiple `CodeSpace` objects and associates backend contexts; a backend context must belong to exactly one environment. [^6] `MiniProgramEnv.createCodeSpace(id, isMainSpace, publicComponents)` creates a space for JS, JSON, WXML, and WXSS artifacts. A main space additionally applies `app.wxss` to root components and accepts `shared` style isolation. [^7]

`CodeSpace` wraps a glass-easel `ComponentSpace` and holds:

- compiled templates (`addCompiledTemplate`);
- static JSON configuration (`addComponentStaticConfig`);
- stylesheet URLs and scopes (`addStyleSheet`);
- global and plugin component spaces. [^8]

This maps cleanly onto tiny’s existing concepts: tiny’s compiler already normalizes `app.json`, page/component JSON, `usingComponents`, and page entries. Its `pageMap` merges global `usingComponents` into page configurations and builds a map of pages. [^9] The adaptation work is less about inventing new terminology and more about retargeting tiny’s compiled artifacts to `CodeSpace` and glass-easel’s template/backend model.

## Registration APIs

### Adapter registration

The adapter creates a `ComponentEnv` containing `Page`, `Component`, and `Behavior`. During `globalComponentEnv(globalObject, path, callback)`, these are temporarily written to the supplied global object, then restored after registration. [^10] The plugin-generated virtual component module uses this method to load each page/component’s JS file. [^11]

`Page(definition)` delegates to `component(path).pageDefinition(definition).register()`. `Component(definition)` delegates to `component(path).definition(definition).register()`, and an omitted argument returns a chainable builder. `Behavior(definition)` behaves similarly. [^12]

### Definition fields

Core component parameters include:

- identity and composition: `is`, `behaviors`, `using`, `generics`, `placeholders`;
- rendering: `template`, `externalClasses`;
- state: `data`, `properties`, `methods`;
- behavior: `listeners`, `relations`, `lifetimes`, `pageLifetimes`, `observers`. [^13]

The adapter’s static JSON model supports `component`, `usingComponents`, `componentGenerics`, `componentPlaceholder`, `styleIsolation`, legacy `addGlobalClass`, and `pureDataPattern`. [^14] At registration, the adapter reads these JSON fields, applies style isolation/options, assigns the compiled template, and then registers the component. [^15]

Core-level registration is also possible without the adapter: `ComponentSpace.defineComponent`, `defineBehavior`, `define`, `defineWithMethodCaller`, and `registerComponent` are exported through the core API. [^16] The tiny host can use the adapter for source compatibility, while using these core APIs internally to bridge page components to the tiny page stack.

### App registration

There is no `App(...)` registration API in the glass-easel adapter. The adapter’s component environment supplies only `Page`, `Component`, and `Behavior`; its generated Webpack entry merely loads `app.js`/`app.ts` before components and does not create an App instance. [^17] Tiny must retain its own app-lifecycle host or wrap an `App` shim outside glass-easel. Tiny’s current service runtime calls `onLaunch`, `onShow`, foreground/background hooks, and page-stack events from its own `loadApp` and routing layers. [^18] That layer remains the natural place to own `App`.

## Lifecycle model

Glass-easel pages and components use the custom-component lifecycle model:

| Lifecycle | Meaning |
| --- | --- |
| `created` | Instance initialized; before backend attachment. |
| `attached` | Added to the tree. |
| `ready` | Backend/layout representation is ready. |
| `moved` | Moved within the tree. |
| `detached` | Removed from the tree. |

Definitions may use either top-level lifecycle methods or the `lifetimes` map. The adapter maps legacy top-level callbacks into `lifetime(...)`, and maps `pageLifetimes` into `pageLifetime(...)`. [^19] Core behavior registration performs the same mapping. [^20] Data observers are registered from the `observers` field and support multi-path fields. [^21]

The lifecycle dispatch boundary is explicit in `AssociatedBackend.Root`:

- `attach(...)` calls `Element.replaceDocumentElement`, which triggers `attached`;
- `release()` pretends the component is detached, destroys the backend element, and triggers `detached`. [^22]

There is no framework-level application lifecycle. Tiny’s host must call `App` callbacks and translate route show/hide/unload events into component attachment/release plus any page-level host events.

## Event model

Glass-easel has a DOM-like capture/bubble event system:

- `EventOptions` supports `originalEvent`, `bubbles`, `composed`, `capturePhase`, `extraFields`, and a listener-return hook. [^23]
- Listener registration supports capture, mutually exclusive `mutated`, and `final` listeners. [^24]
- Dispatch walks a capture phase, an at-target phase, and a bubble phase, respecting shadow-tree and slot boundaries. [^25]
- Components expose `triggerEvent(name, detail, options)`, and core exports `triggerEvent`, `triggerExternalEvent`, and `triggerBackendEvent`. [^26]

Backend input enters through `backend.onEvent(...)`. The adapter’s generated bootstrap connects it with `glassEasel.Event.triggerBackendEvent`, so the backend is responsible for translating platform input into glass-easel events. [^27] Tiny’s current `PAGE_EVENT`/`triggerComponentEvent` bridge can be retired at the render boundary or reimplemented inside the custom backend’s event converter.

## Render adapter surface

Glass-easel supports three backend protocol modes:

1. **Shadow Mode** — glass-easel tracks only the shadow tree and delegates shadow-to-composed composition to the backend.
2. **Composed Mode** — glass-easel tracks both shadow and composed trees; the source calls it the preferred, simpler protocol.
3. **Domlike Mode** — follows standard DOM API conventions and is intended specifically for DOM interop. [^28]

`GeneralBackendContext` is the union of these three protocol contexts. [^29]

### Required backend context surface

Every backend context has a common base:

- `mode`;
- `destroy()`;
- `getWindowWidth()`, `getWindowHeight()`, `getDevicePixelRatio()`;
- `getTheme()`;
- stylesheet registration: `registerStyleSheetContent`, `appendStyleSheetPath`, `disableStyleSheet`;
- asynchronous frame callback: `render(cb)`;
- root access: `getRootNode()`;
- one global input callback: `onEvent(...)`. [^30]

Composed Mode then requires node creation methods such as `createElement`, `createTextNode`, and `createFragment`. [^31] Shadow Mode instead creates nodes through a `ShadowRootContext` and has additional component/virtual-node operations. [^32] Domlike Mode maps operations onto DOM conventions rather than exposing the same logical/styling tag-name split. [^33]

### Required backend element surface

The shared element contract includes tree mutation, identity, slots, style, attributes, text, model binding, and listener configuration:

- tree mutation: `appendChild`, `removeChild`, `insertBefore`, `replaceChild`, and splice methods;
- node data: `associateValue`, `setId`, `setText`;
- slots: `setSlot`, `setSlotName`, `setSlotElement`, `setInheritSlots`;
- presentation: `setStyle`, `addClass`, `removeClass`, class aliases (mode-dependent), `setAttribute`, `removeAttribute`, `setDataset`;
- behavior: `setModelBindingStat`, `setListenerStats`. [^34]

Backends may also implement the optional suggested protocol for queries, layout, observers, scroll, media queries, and node manipulation. [^35] `CurrentWindowBackendContext` is a ready-made Domlike backend for browsers: it uses `document`, `window.devicePixelRatio`, `matchMedia`, `requestAnimationFrame`, and delegates native touch/mouse/click events. [^36]

## Template contract

Glass-easel does not execute WXML directly. The core template engine expects a `ComponentTemplate`:

```ts
type ComponentTemplate = {
  groupList?: ProcGenGroupList
  content: (name: string) => ProcGen
  updateMode?: string
  fallbackListenerOnNativeNode?: boolean
  procGenWrapperType?: typeof ProcGenWrapper
}
```

The generated `content` function returns a `ProcGen`; `updateMode` may be `bindingMap`, `virtualTree`, or empty. [^37] The official template compiler generates that JavaScript. The official Webpack plugin’s WXML loader output is collected into `genObjectGroups`, which are registered as `ComponentTemplate.groupList` and `content`. [^38]

This is the largest source-compatibility gap with tiny’s current compiler. Tiny’s `TemplateTransformer` emits an ES module whose default export is `render(data, _ctx)`. [^39] The generated function relies on tiny-specific globals such as `RenderHelpers.createRoot`, `RenderHelpers.createBlock`, `useTemplate`, `renderSlot`, `getSJSMember`, and `toString`. [^40] It also emits `_ctx.$$eventBinder`, `_ctx.$$class`, and `_ctx.$$resolveComponent` hooks. [^41] Those are not glass-easel `ProcGen` artifacts.

There are two possible integration strategies:

1. **Use `glass-easel-template-compiler`** for WXML and preserve tiny-specific preprocessing around it. This matches the native artifact contract best.
2. **Compile tiny’s existing render function/AST into a `ProcGen`** or implement a custom `TemplateEngine`. This preserves more compiler code but couples tiny to a lower-level and less stable internal interface.

The official README explicitly says custom template engines are advanced features and may be unavailable inside MiniProgram code. [^42]

## Styles and built-in components

The official stylesheet compiler converts `rpx` to `vw`, applies class prefixes for style isolation, and minifies CSS. [^43] The Webpack plugin requires `GlassEaselMiniprogramWxmlLoader` for `.wxml` and `GlassEaselMiniprogramWxssLoader` for `.wxss`; the template uses CSS extraction around the WXSS loader. [^44] This overlaps tiny’s existing WXSS transform, but glass-easel expects registered stylesheet paths/content and style scopes rather than tiny’s current “append a transformed stylesheet to `<head>`” page hook. [^45]

Glass-easel ships component infrastructure, not a UI component library. Unknown tags can be treated as native backend nodes: `ComponentSpace` defaults `allowUnusedNativeNode` to `true`, and shadow-root resolution falls back to a native node string when no component definition or global alias is found. [^46] A host may map tags in one of three ways:

1. register real glass-easel components for each built-in tag;
2. use `setGlobalUsingComponent(tag, definitionOrNativeTag)`;
3. let the backend create the tag as a native node and implement its behavior there.

For a DOM-like backend, `ComponentOptions.hostNodeTagName` can prefix logical tag names; the official Webpack plugin uses `tagNamePrefix: 'wx-'`, which becomes a host-node pattern of `wx-*`. [^47] Tiny currently prefixes built-ins with `tiny-` and registers Polymer-style custom elements such as `tiny-page`, `tiny-view`, and `tiny-button`. [^48] A minimal glass-easel path could keep those custom elements behind a Domlike backend; a native/custom backend would need its own node implementations or bridge.

## Native bridge assumptions

Glass-easel does not prescribe a JSBridge. Its assumptions are limited to:

- a backend context that can create/update nodes and receive events;
- asynchronous `render(cb)` aligned with the backend’s frame callback;
- stylesheet registration/content in a backend-recognizable format;
- an environment that can locate the global object when the adapter injects `Page`, `Component`, and `Behavior`;
- explicit host handling for application lifecycle, routing, and platform APIs.

The official core can run with different backends, but the adapter’s default `CurrentWindowBackendContext` is browser-specific and fails outside a browser if no backend is supplied. [^49] A native tiny runtime therefore needs one of:

1. a custom Shadow/Composed backend implemented over the tiny native bridge;
2. a Domlike facade over a native DOM-compatible engine;
3. a remote DOM/command bridge with serialization at the backend protocol boundary.

The backend protocol’s callback conventions make a bridge possible, but glass-easel supplies no cross-thread serialization, command batching, or security boundary. Tiny’s existing bridge operations—data changes, component events, selectors, observers, relation lookup, scroll, and native hooks—must be redesigned as backend methods or host services around glass-easel. Tiny’s current render-side bridge exposes those operations through `invokeService`/`replyService`. [^50]

## Minimum bootstrap

For the official Webpack path, the minimum project configuration is:

1. Install `glass-easel` and `glass-easel-miniprogram-adapter`, plus the Webpack plugin and compilers if using its build flow.
2. Add `.wxml` and `.wxss` loader rules.
3. Configure `GlassEaselMiniprogramWebpackPlugin` with at least `path` and `defaultEntry`.
4. Use the plugin’s generated virtual entry as the Webpack entry.
5. Run in a browser so `CurrentWindowBackendContext` can attach the default entry.

The official template demonstrates the exact Webpack rules and plugin options (`path`, `resourceFilePattern`, `defaultEntry`, and optional `tagNamePrefix`). [^51] By default, the generated bootstrap creates `CurrentWindowBackendContext`, registers global event handling, associates the backend, creates a root for `defaultEntry`, appends a placeholder, and attaches the root. [^52]

For tiny’s own bootstrap, the equivalent manual sequence is:

```js
import * as glassEasel from 'glass-easel'
import { MiniProgramEnv } from 'glass-easel-miniprogram-adapter'

const env = new MiniProgramEnv()
const backendContext = createTinyBackendContext()
const associatedBackend = env.associateBackend(backendContext)
backendContext.onEvent(glassEasel.Event.triggerBackendEvent)

const codeSpace = env.createCodeSpace('tiny-main', true)

// For each source path:
//  - addComponentStaticConfig(path, json)
//  - addCompiledTemplate(path, componentTemplate)
//  - addStyleSheet(path, urlOrRegisteredPath, scope)
//  - globalComponentEnv(globalObject, path, () => require(pageOrComponent))

const root = associatedBackend.createRoot(
  'tiny-root',
  codeSpace,
  'pages/index/index',
)

root.attach(tinyRootParent, tinyPlaceholder)
```

The plugin’s custom-bootstrap documentation confirms the same public generated exports: `env`, `codeSpace`, `registerGlobalEventListener`, and `initWithBackend`, followed by `initWithBackend(backend)` and `ab.createRoot(tag, codeSpace, pageUrl)`. [^53]

## Boundary decisions for tiny

1. **Keep `App`, routing, and page stack in tiny.** Glass-easel only needs a component definition and a root URL; it has no page-stack contract.
2. **Treat each tiny page as a glass-easel component.** Register it under its page path and create it through `AssociatedBackend.createRoot`.
3. **Choose the backend first.** Browser development can start with `CurrentWindowBackendContext`; native requires a custom backend.
4. **Adopt glass-easel templates at the compiler boundary.** Do not pass tiny’s current `render(data, ctx)` function as a `ComponentTemplate`.
5. **Decide built-in component ownership early.** DOM-only development can reuse `tiny-*` custom elements through a Domlike backend; a native backend cannot assume Web Components.
6. **Replace direct render-thread calls with backend protocol or host APIs.** Selector, observer, relation, and event operations must cross the new boundary.

## Unresolved questions

1. Which deployment target should drive the first implementation: browser-only, native WebView, native non-DOM renderer, or all three?
2. Should tiny adopt `glass-easel-template-compiler` wholesale, or preserve its current compiler and translate to `ProcGen`?
3. Should `Page` lifecycle remain a host concept, or should tiny synthesize page lifetimes from component attachment/release plus tiny route events?
4. Should existing `tiny-*` Web Components be reused through Domlike Mode, or should built-ins become glass-easel component definitions?
5. Which glass-easel optional backend capabilities are required for tiny v1: selector queries, layout rectangles, intersection/resize observers, scroll control, and media queries?
6. What is the compatibility target for style isolation, given the adapter’s documented limitations? [^54]
7. Does the native bridge need glass-easel commands to be synchronous, or can every backend mutation/callback be serialized asynchronously?

## Primary sources

1. Official repository README and package manifests, revision `c1b32d58ec459f26881edf4a7f67de85adb7e22c`.
2. Official source files under `glass-easel/src`, especially `backend/`, `component_space.ts`, `component_params.ts`, `behavior.ts`, `event.ts`, and `tmpl/index.ts`.
3. Official adapter, Webpack plugin, template, template compiler, and stylesheet compiler source files under the same revision.
4. Local tiny compiler/runtime files in `packages/compiler/src` and `packages/base/src`, inspected on 2026-09-01.

## References

[^1]: [`glass-easel/README.md`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/README.md), “What is the relationship with the MiniProgram SDK?” and “What are the differences from the legacy framework?”
[^2]: [`glass-easel/README.md`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/README.md), modules and packages.
[^3]: [`glass-easel-miniprogram-adapter/package.json`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/package.json), `peerDependencies`.
[^4]: [`glass-easel-miniprogram-webpack-plugin/package.json`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/package.json), dependencies.
[^5]: [`glass-easel-miniprogram-template/package.json`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-template/package.json), dependencies/devDependencies.
[^6]: [`glass-easel-miniprogram-adapter/src/env.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/env.ts), `MiniProgramEnv` class documentation and methods.
[^7]: [`glass-easel-miniprogram-adapter/src/env.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/env.ts), `createCodeSpace` documentation.
[^8]: [`glass-easel-miniprogram-adapter/src/space.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/space.ts), `CodeSpace` constructor and resource methods.
[^9]: `packages/compiler/src/pageMap.js`, global component merge and page-map generation.
[^10]: [`glass-easel-miniprogram-adapter/src/space.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/space.ts), `ComponentEnv`, `globalComponentEnv`, and `componentEnv`.
[^11]: [`glass-easel-miniprogram-webpack-plugin/index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/index.ts), `updateComponentJsFile`.
[^12]: [`glass-easel-miniprogram-adapter/src/space.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/space.ts), `pageConstructor`, `componentConstructor`, and `behaviorConstructor`.
[^13]: [`glass-easel/src/component_params.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/component_params.ts), `ComponentParams`.
[^14]: [`glass-easel-miniprogram-adapter/src/types.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/types.ts), `ComponentStaticConfig`.
[^15]: [`glass-easel-miniprogram-adapter/src/builder/component_builder.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/builder/component_builder.ts), `register()`.
[^16]: [`glass-easel/src/component_space.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/component_space.ts), definition/registration methods; [`glass-easel/src/index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/index.ts), exports.
[^17]: [`glass-easel-miniprogram-webpack-plugin/index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/index.ts), app entry handling and generated virtual index.
[^18]: `packages/base/src/service/App/loadApp.js`; `packages/base/src/service/Route/handleRoute.js`.
[^19]: [`glass-easel-miniprogram-adapter/src/builder/base_behavior_builder.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/builder/base_behavior_builder.ts), definition processing.
[^20]: [`glass-easel/src/behavior.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/behavior.ts), lifecycle mapping.
[^21]: [`glass-easel/src/component_params.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/component_params.ts), `observers`; [`glass-easel/src/behavior.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/behavior.ts), observer registration.
[^22]: [`glass-easel-miniprogram-adapter/src/backend.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/backend.ts), `Root.attach` and `Root.release`.
[^23]: [`glass-easel/src/event.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/event.ts), `EventOptions`.
[^24]: [`glass-easel/src/event.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/event.ts), `EventListenerOptions` and `EventTarget.addListener`.
[^25]: [`glass-easel/src/event.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/event.ts), `Event.dispatch`.
[^26]: [`glass-easel/src/element.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/element.ts), `triggerEvent`; [`glass-easel/src/event.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/event.ts), trigger helpers.
[^27]: [`glass-easel-miniprogram-webpack-plugin/index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/index.ts), generated `registerGlobalEventListener`.
[^28]: [`glass-easel/src/backend/backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/backend_protocol.ts), backend protocol modes; [`glass-easel/src/backend/composed_backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/composed_backend_protocol.ts), preferred-mode note; [`glass-easel/src/backend/domlike_backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/domlike_backend_protocol.ts), DOM conventions.
[^29]: [`glass-easel/src/backend/index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/index.ts), `GeneralBackendContext`.
[^30]: [`glass-easel/src/backend/backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/backend_protocol.ts), `Context`; [`glass-easel/src/backend/composed_backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/composed_backend_protocol.ts), `Context`.
[^31]: [`glass-easel/src/backend/composed_backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/composed_backend_protocol.ts), `Context` creation methods.
[^32]: [`glass-easel/src/backend/backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/backend_protocol.ts), `ShadowRootContext`.
[^33]: [`glass-easel/src/backend/domlike_backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/domlike_backend_protocol.ts), mode description.
[^34]: [`glass-easel/src/backend/backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/backend_protocol.ts), Shadow `Element`; [`glass-easel/src/backend/composed_backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/composed_backend_protocol.ts), Composed `Element`; [`glass-easel/src/backend/domlike_backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/domlike_backend_protocol.ts), Domlike element operations.
[^35]: [`glass-easel/src/backend/suggested_backend_protocol.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/suggested_backend_protocol.ts), optional context/element methods.
[^36]: [`glass-easel/src/backend/current_window_backend_context.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/current_window_backend_context.ts), browser dependencies and delegated event list.
[^37]: [`glass-easel/src/tmpl/index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/tmpl/index.ts), `ComponentTemplate`, `GlassEaselTemplate`, and update-mode handling.
[^38]: [`glass-easel-miniprogram-webpack-plugin/index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/index.ts), WXML result collection and `addCompiledTemplate`.
[^39]: `packages/compiler/src/xml/Transformer.js`, `HEADER = 'export default function render(data, _ctx) {'`.
[^40]: `packages/compiler/src/xml/Transformer.js`, render-helper imports.
[^41]: `packages/compiler/src/TemplateTransformer.js`, event/class/component hooks.
[^42]: [`glass-easel/README.md`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/README.md), limitations in MiniProgram environments.
[^43]: [`glass-easel-stylesheet-compiler/README.md`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-stylesheet-compiler/README.md), features and JavaScript interface.
[^44]: [`glass-easel-miniprogram-webpack-plugin/README.md`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/README.md), loaders; [`glass-easel-miniprogram-template/webpack.config.js`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-template/webpack.config.js), rules.
[^45]: `packages/base/src/webview/Page/hooks.js`, `usePageShow` stylesheet injection.
[^46]: [`glass-easel/src/component_space.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/component_space.ts), `allowUnusedNativeNode`; [`glass-easel/src/shadow_root.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/shadow_root.ts), component/native fallback.
[^47]: [`glass-easel/src/global_options.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/global_options.ts), `hostNodeTagName`; [`glass-easel-miniprogram-webpack-plugin/index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/index.ts), generated option.
[^48]: `packages/compiler/src/utils.js`, built-in list and `toComponentName`; `packages/base/src/webview/web-components/index.js`, imported custom elements.
[^49]: [`glass-easel-miniprogram-adapter/src/env.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/env.ts), `associateBackend`; [`glass-easel/src/backend/current_window_backend_context.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/current_window_backend_context.ts), browser assumptions.
[^50]: `packages/base/src/webview/bridge/index.js`; `packages/base/src/webview/api/index.js`.
[^51]: [`glass-easel-miniprogram-template/webpack.config.js`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-template/webpack.config.js), entry/loaders/plugin.
[^52]: [`glass-easel-miniprogram-webpack-plugin/index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/index.ts), generated bootstrap.
[^53]: [`glass-easel-miniprogram-webpack-plugin/README.md`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/README.md), custom bootstrap and manual root creation.
[^54]: [`glass-easel-miniprogram-adapter/README.md`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/README.md), limitations.
