---
title: '一个纯内核，'
highlight: '两棵树，任意宿主'
eyebrow: '架构'
lede: >-
  Tiny 的内核只有一份：runtime 不依赖任何宿主，浏览器、iOS 和测试宿主共享同一份内核，环境能力全部从边界注入。service 线程运行 glass-easel 逻辑树，宿主 render 线程维护真实渲染树，两者通过 component flow、虚拟节点 patch 和 tree 事件同步；编译器和 Bridge 只提供产物与传输，devtool 负责观察和控制。
stats:
  - ['2', '运行时树']
  - ['2', 'manifest schema']
  - ['9', '消息域']
  - ['0', '内核中的浏览器全局']
description: 'Tiny 小程序引擎的架构：内核绝对纯粹、与宿主无关，双侧树、模块职责、依赖方向、启动握手和状态归属。'
name: '架构'
pageTitle: '架构 · Tiny 小程序引擎'
order: 2
---

## 内核绝对纯粹 {#purity kicker="内核约束"}

Tiny 只守住一条线：`packages/runtime` 是唯一的内核，它不引用 window、document、fetch 或 MessageChannel，也不 import 任何 `@tiny/host-*`。宿主可以有很多个，内核永远只有一份；环境能力从边界注入，内核只定义语义。这条线一旦破掉，换宿主就会变成重写内核。

```text
  HOST SIDE - replaceable; owns the environment
  +-----------------------+  +-----------------------+  +-----------------------+
  | browser host          |  | iOS host              |  | test host             |
  | iframe / port / DOM   |  | JSCore / WKWebView    |  | in-memory transport   |
  +-----------------------+  +-----------------------+  +-----------------------+

              inject: transport / canvas / renderer / API / assets
              |                          |                          |
  ============+==========================+==========================+============
              v                          v                          v
  host boundary - only explicit ports cross; dependencies point inward

  +-----------------------------------------------------------------------------+
  | packages/runtime - PURE KERNEL                                              |
  |                                                                             |
  | service thread              tree protocol              render thread        |
  | App / Page / Component      flow / patch / event       TreeRenderer         |
  | logic tree / page stack     node id / diff             host-neutral API     |
  +-----------------------------------------------------------------------------+
                                         | imports
                                         v
  @tiny/manifest / @tiny/bridge / @tiny/wxs-runtime / glass-easel
```

宿主不是内核的上层，而是内核的调用方。浏览器、iOS 和测试宿主都依赖同一个内核，区别只在注入的实现：`transport` 决定消息怎么走，`TreeRenderer` 决定怎么画，`canvas`、`apiExtensions` 和 `resolveAssetUrl` 决定环境事实。

| 注入点 | 宿主提供 | 内核拿到什么 | 浏览器宿主 | iOS 宿主 |
| --- | --- | --- | --- | --- |
| `transport` | 线程间通道 | `Transport` | MessageChannel | JSCore message handler |
| `manifest` 与 loader | 产物与加载方式 | 只读 manifest、templates、styles | 静态资源 | 打包产物 |
| `TreeRenderer` | 真实组件树 | 渲染契约 | `createGlassRenderTree` | 每页 WKWebView |
| `canvas` | 画布控制面 | `ServiceCanvasAdapter` | OffscreenCanvas | display-list 回放 |
| `apiExtensions` | 设备与平台事实 | 只读 API 扩展 | 窗口与设备信息 | 菜单按钮、性能 |
| `resolveAssetUrl` | 资源地址规则 | URL 映射函数 | 站点路径 | bundle 路径 |

:::callout{title="这条线由脚本守着"}
`pnpm check:runtime-purity` 从 `packages/runtime/src/index.ts` 遍历依赖图，出现 window、document、fetch、MessageChannel 或 `@tiny/host-*` 就失败。它验证的不是“当前浏览器能跑”，而是“同一个内核还能装进下一个宿主”。实现细节见[宿主适配](#/hosts)。
:::

## 每一层各自负责什么 {#boundaries kicker="职责边界"}

先看职责，再看代码放在哪。几个角色之间的接口都是显式的。

| 角色 | 负责 | 不负责 | 代码位置 |
| --- | --- | --- | --- |
| compiler | 扫描源码、编译模板和样式、转译脚本、打包 service、生成 manifest 和诊断 | 页面生命周期、路由、wx API、DOM | `tools/cli` |
| manifest | 定义产物类型、schemaVersion 和解析后的命名配置 | 具体实现 | `packages/manifest` |
| runtime | App/Page/Component 语义、页面栈、setData、observer、relations、逻辑树、virtual node diff、tree 协议和 canvas 协议 | 真实 DOM、宿主内置组件实现、宿主 API、界面 | `packages/runtime` |
| bridge | 消息信封和帧、transport、调用与回复、批处理、超时和 JSON 校验 | wx API 语义、渲染指令、页面状态 | `packages/bridge` |
| host | 线程和 transport、启动流程、宿主 API、渲染树、内置组件、canvas、资源 URL、诊断收集 | 页面栈、业务 data、observer、relations 和事件回调 | `hosts/browser` · `hosts/web-components` · `apps/devtool` · `tests/host` · `ios/` native adapter |

:::callout{title="页面状态只在 service"}
页面栈、页面 data、组件实例、observer 和 relations 都归 service 线程管；render 线程只有宿主渲染树、DOM 和稳定 node id 的镜像。两棵树没有共享内存，所有同步都经过宿主转发的 tree 协议。
:::

## 两棵树：逻辑树在 service，渲染树在 host {#split-tree kicker="双侧树"}

这是当前运行时的核心设计。service 不创建 DOM，render 不执行小程序逻辑；两边通过稳定的 node id、component flow 和 virtual node patch 对齐。

| 层 | 在哪里 | 拥有 | 不负责 |
| --- | --- | --- | --- |
| 逻辑树 | service 线程 | glass-easel ComponentSpace、模板求值、virtual node、组件实例、observer、relations、带类型的 dataset、node id | DOM、布局、宿主内置组件实现 |
| 渲染树 | 宿主的 render 线程 | 真实内置组件、自定义组件容器、slot、shadow root、样式、布局、DOM | app methods、observer、relations、页面栈 |
| 同步协议 | 两棵树之间 | component flow 首屏同步、virtual node patch 增量更新、tree 事件、query/canvas 控制 | 业务语义 |

```text
  SERVICE THREAD (kernel)                          RENDER THREAD (host renderer)
  +------------------------------+             +------------------------------+
  | service thread               |             | render thread                |
  | App / Page / Component       |             | host TreeRenderer            |
  | glass-easel logic tree       |             | glass-easel render tree      |
  | data / observers / relations |             | DOM / layout / styles        |
  | virtual node / node id       |             | slot / shadow root           |
  | page stack / no DOM          |             | no app methods               |
  +---------------+--------------+             +---------------+--------------+
                  |                                            ^
                  |   tree.flow / tree.patch / tree.animate    |
                  +--------------------------------------------+
                          tree.event / query.* return through the same link
```

首屏由 `tree.flow` 发送一组 component flow：`define`、`create-node`、`props`、`children`、`ready`。后续模板变化由 `tree.patch` 发送 `text`、`replace`、`props`、`insert`、`remove`、`reorder`、`extra`，宿主只负责应用 patch。

:::callout{title="为什么要拆成两棵树"}
如果让 render 负责模板求值、属性和 dataset，dataset 会经过 DOM 丢失类型，函数属性也无法跨线程；原生宿主还得重新实现一遍小程序语义。拆开之后，类型和语义留在 service，render 只负责“怎么画”，同一套 tree 协议可以接 Web、原生或测试渲染器。
:::

## glass-easel 提供组件框架，Tiny 补齐应用层 {#glass-easel kicker="运行时内核" nav="与 glass-easel 的分工"}

glass-easel 不是完整的小程序 SDK。它负责组件、模板、数据绑定、事件和生命周期，App、路由、API 等由 Tiny 自己实现。

| 能力 | 由谁提供 | 在 Tiny 中如何使用 |
| --- | --- | --- |
| 组件定义、properties、data、methods、模板 | glass-easel（service 逻辑树） | `defineWithMethodCaller` / `defineComponent`，模板在 service 求值 |
| WXML 运行时数据绑定与更新 | glass-easel | 编译器把 WXML 编成 ProcGen，运行时只传 groupList/content |
| 事件捕获与冒泡、slot、shadow 边界 | glass-easel（两侧各自） | 逻辑树分发事件，渲染树处理真实 DOM 事件 |
| created/attached/ready/moved/detached 生命周期 | glass-easel（service） | 组件实例和 relations 都在逻辑树 |
| 样式作用域和渲染树 | glass-easel + host | 逻辑树计算 scope；渲染树应用样式和 styleIsolation |
| Behaviors / observers / relations / selectComponent | Tiny runtime | component-definition 归一化 + ComponentTree + RelationManager |
| App 生命周期、页面栈、路由、onLoad/onShow/onReady | Tiny runtime | `packages/runtime/src/service/thread.ts` |
| 兼容输入配置、内部 Tiny 命名 | Tiny manifest + runtime | tiny.config.json → compatibility / runtimeCompatibility；内部名来自 TINY_ENGINE_NAMING |
| wx API、storage、system info、animation | Tiny runtime + host | service 侧 API host；设备信息由 extensions 注入 |
| canvas、资源 URL、DOM 节点 | 宿主 | canvas handoff / resolveAssetUrl / TreeRenderer |
| 跨线程模板更新、事件、页面切换 | Tiny runtime + bridge + host | tree.flow / tree.patch / tree.event / page.navigateTo |
| 元素树检查、生命周期控制、诊断投影 | Tiny runtime + devtool | `DevtoolRuntimeClient` + 渲染树 `inspectTree` |

:::callout{title="为什么不直接用官方的 miniprogram adapter"}
官方 adapter 的注册接口更接近微信，但页面生命周期、宿主控制和原生能力都会被限制在 adapter 已支持的范围内。Tiny 直接使用 glass-easel 的核心 API，自己管理 App、页面栈、路由和 API host，后续接新宿主时也更自由。
:::

## 依赖只能向内 {#dependencies kicker="依赖关系"}

这是当前工作区的真实依赖。核心包不能依赖 tools、apps、hosts 或 tests；宿主适配器反过来依赖内核。

| 包或应用 | 依赖 | 作用 |
| --- | --- | --- |
| `@tiny/manifest` | 无 | 产物、诊断类型和固定引擎命名；ESM/CJS 双入口 |
| `@tiny/css-units` | 无 | 编译器和 WXS 共用的 rpx→vw 转换 |
| `@tiny/wxs-runtime` | 无 | WXS 模块加载、transform 和值语义内核 |
| `@tiny/bridge` | 无 | 协议、transport、批处理和错误 |
| `@tiny/template-compiler` | manifest · acorn · magic-string | WXML → ProcGen / WXS transform |
| `@tiny/stylesheet-compiler` | manifest · css-units · postcss | WXSS → 普通/低优先级 CSS |
| `@tiny/cli` | manifest · template-compiler · stylesheet-compiler · esbuild · typescript | 负责生成全部产物 |
| `@tiny/runtime` | manifest · bridge · wxs-runtime · glass-easel · es-toolkit | 双线程运行时内核，不依赖宿主 |
| `@tiny/host-browser` | runtime · bridge | 浏览器宿主：iframe、MessageChannel、Canvas、devtool 覆盖层；wasm HostCore 适配 |
| `@tiny/host-core-wasm` | Rust `host-core` · wasm-bindgen | 浏览器 HostCore wasm 绑定，devtool/test host 共用 |
| `@tiny/host-core-ffi` | Rust `host-core` · UniFFI | iOS Swift HostCore 绑定 |
| `@tiny/host-web-components` | manifest · css-units · runtime · glass-easel；构建期 template-compiler | 24 个内置组件、AOT 模板和默认 CSS（宿主包） |
| `@tiny/host-ios` | runtime · bridge · host-browser · host-web-components | iOS 宿主前端：JSCore engine 与每页 native render 产物；状态机由 `ios/` 的 UniFFI HostCore 驱动 |
| `devtool` | host-browser · host-web-components · glass-easel · React · Redux/rematch | 调试器宿主和控制面板 |
| `@tiny/website` | React | 架构站点，不进入引擎链路 |

```text
core        packages/manifest
            packages/bridge
            packages/template-compiler
            packages/stylesheet-compiler
            packages/runtime           -> manifest, bridge, glass-easel
hosts       hosts/browser              -> runtime, bridge   (环境适配)
            hosts/web-components       -> runtime, manifest, glass-easel
                                          (内置组件，注入 render)
            hosts/ios                  -> runtime, bridge, host-browser
                                          (JSCore engine + native WKWebView render)
tools       tools/cli                  -> manifest, template-compiler, stylesheet-compiler
apps        apps/devtool               -> host-browser, host-web-components
tests       tests/host                 -> host-browser, host-web-components
                                          (不是 workspace 包)
fixtures    tests/apps/*               -> 只有源码，编译后交给宿主

规则：packages/* 不能导入 tools/*、apps/*、hosts/*、tests/*
```

:::callout{title="一个常见的错误依赖"}
如果 runtime 为了类型去 import `@tiny/cli`，Node 的 fs 和 esbuild 就会被打进浏览器线程，打包时还会出现无法解析的 builtin。共享类型应该放在 `@tiny/manifest`，不要让工具反向提供类型。
:::

## 一次启动要经过哪些步骤 {#boot kicker="启动流程"}

浏览器路径从编译产物到页面可交互，要经过 iframe、两次握手、两次 bootstrap 和一次 page.ready；iOS 路径把 iframe 换成每页一个 WKWebView，但 Bridge 握手、bootstrap 和 page.ready 的语义相同。

:::sequence
| title | actor | detail | code |
| --- | --- | --- | --- |
| 编译并写出产物 | tools/cli | 读取 app.json，扫描入口，生成 templates.js、styles、scripts 和 service.js，最后写出 schema-v2 manifest.json。诊断信息随 manifest 一起返回。 | compileMiniProgram({ sourceDir, outputDir }) |
| 创建两条独立通道 | 宿主 | 每个线程各一条 MessageChannel。service 和 render 不共享端口，由宿主分别持有两条 hostTransport。 | createHostMessageChannelPair() × 2 |
| 创建 iframe，等待线程就绪 | 宿主 | service iframe 被隐藏为 0×0，render iframe 填满容器；每页 render 模式下，每新建一个页面就创建一个 render iframe。宿主等待线程发回 tiny-runtime-port-ready，最多等 15 秒。 | WasmBrowserHost(...) |
| 线程装好连接后再通知宿主 | service / render | service 先拿到 manifest、templates 和 styles；render 先在 `prepare` 里装好内置样式，渲染树本身在端口到达后创建。service bundle 在 bootstrap 时通过 loadArtifacts 导入。线程要等 connection 安装完成，才调用 `listenForRuntimePort`，避免端口消息到达时丢帧。 | bootBrowserServiceEntry(...) / bootBrowserRenderEntry(createGlassRenderEntry(...)) |
| 把 MessagePort 交给线程 | 宿主 | 宿主把 port2 作为 transferable 发给对应 iframe；线程再用 createMessagePortTransport 包装成 Transport。 | postMessage({ type: 'tiny-runtime-port' }, '*', [port]) |
| 两条连接分别握手 | bridge | 宿主分别发起 runtime.hello，service/render 回复握手信息并发送 runtime.ready。协议版本不一致时连接会直接关闭。 | host.service.handshake() · host.render.handshake() |
| service 启动首屏 | 宿主 → service | 导入 service.js，App/Page/Component 在这里注册，App.onLaunch/onShow 也会立即执行。随后安装 runtimeCompatibility 兼容全局，构建组件 schema 和 glass-easel 逻辑树，创建首个页面并触发 onLoad/onShow，返回 pageId、initialData 和 componentSchemas。 | service.control('runtime', 'bootstrap') |
| render 建好渲染树 | 宿主 → render | render 创建 `TreeRenderer`（Web 侧 `createGlassRenderTree`），安装宿主内置组件，等待 service 发来的 `tree.flow`。首屏 flow 包含 define/create-node/props/children/ready，render 应用后挂到页面根。 | render.control('runtime', 'bootstrap') |
| 同步首屏并触发 onReady | 宿主 → service | render 挂载完成后宿主发送 `tree.ready`，service 用逻辑树快照发送 `tree.flow`；随后宿主发 `page.ready`，service 触发 onReady。此时逻辑树、组件实例和 relations 已经可用。 | service.control('page', 'ready', { pageId }) |
| 广播状态，页面可交互 | service | service 发送 RUNTIME_STATE，包含 pageStack、currentPage 和 transport 状态；宿主诊断仓库和 devtool 据此更新界面。 | sendDiagnostic('state', { code: 'RUNTIME_STATE' }) |
:::

:::callout{title="bootstrap 要由宿主主动调用"}
`WasmBrowserHost` 负责创建线程、完成握手并驱动 HostCore action；测试宿主和调试器调用 `launch()`，HostCore 会完成 service/render bootstrap。
:::

## service 和 render 没有直连 {#channels kicker="消息转发"}

所有跨线程消息都经过宿主的两条 BridgeConnection。宿主不是透明管道：它按 pageId 路由、在页面还没打开时排队、把请求代理到渲染树，还自己处理宿主 API 和诊断。

```text
            +----------------------------------------------+
            | WasmBrowserHost / HostCoreRuntime            |
            |                                              |
            | BridgeConnection(host <-> service)           |
            | BridgeConnection(host <-> render) x page     |
            | pageId -> render connection + queue          |
            | HostApiRegistry / HostDiagnosticStore        |
            +-----+-----------------------------------+----+
                  |                                   |
           MessageChannel                            MessageChannel
                  |                                   |
  +---------------+---------------+   +---------------+---------------+
  | service iframe                |   | render iframe                 |
  | logic tree / page stack       |   | render tree / DOM             |
  +-------------------------------+   +-------------------------------+

  service and render never connect directly; the host owns both links.
```

### 转发、代理、终结、发起

宿主对消息有四种处理方式，决定了这条链路要等几次往返。

```text
转发（event，host 重新封装后立即发给另一侧）
  service ── tree.flow / tree.snapshot / tree.patch / tree.animate ──► host ──► render
  service ◄── tree.event ───────────────────────────────────────────── host ◄── render
  service ◄── page.scroll / reachBottom / pullDownRefresh ──────────── host ◄── render

代理（call/control，host 等渲染树回包后再回 service）
  service ── query.select / query.intersection / canvas.measure ──► host ──► render
  service ◄──────────────── reply ───────────────────────────────── host ◄── reply

终结（host 自己处理，不再转发）
  service ── api.* ─────────────────────────────────► HostApiRegistry
  render  ── tree.hostAction ───────────────────────► navigate.* handler
  service/render ── diagnostic.* ───────────────────► HostDiagnosticStore

发起（host 主动驱动两侧）
  host ── runtime.bootstrap / page.ready / page.navigateTo ──► service
  host ── runtime.bootstrap / runtime.inspectTree ──────────► render
```

| 消息 | 路径 | 宿主处理 | 用途 |
| --- | --- | --- | --- |
| `tree.flow` · `tree.snapshot` · `tree.patch` | service → host → render | 按 pageId 转发；目标页还没打开时先入队 | 首屏 component flow、完整快照、虚拟节点 patch |
| `tree.animate` · `tree.clearAnimate` | service → host → render | 按 pageId 转发 | `this.animate` / `clearAnimate` 的关键帧 |
| `tree.event` | render → host → service | 按 pageId 转发 | 事件带 node id、name、detail、native、touches |
| `tree.ready` | host → service | render bootstrap 完成后由宿主发送 | 请求逻辑树发送首屏 flow |
| `query.select` | service → host → render → host → service | 两次 RPC | selector query 在真实 DOM 中查节点，返回 rect/dataset/scroll |
| `query.intersection` | service → host → render；entry 反向 render → host → service | 代理 observe/unobserve，再转发回调 | 页面/组件级 IntersectionObserver |
| `canvas.measure` | service → host → render → host → service | 把 call 转给渲染树 | 测量 canvas 节点 |
| `canvas` handoff | service → host → render → host → service | 只中继 transferable，不解析 | 把 OffscreenCanvas 交给 service；之后直接绘制 |
| `api.*` | service → host | `HostApiRegistry` 查 handler；`navigate.*` 会再 control service | 导航、toast、storage、request 等宿主语义 |
| `page.scroll` · `page.reachBottom` · `page.pullDownRefresh` | render → host → service | 按 pageId 转发 | 页面滚动、触底和下拉手势——render 文档才是页面的滚动容器 |
| `page.ready` · `page.navigateTo` · `page.navigateBack` · `page.switchTab` · `page.redirectTo` · `page.reLaunch` · `page.pullDownRefresh` · `page.share` · `page.saveExitState` · `page.hide` · `page.show` | host → service | 宿主发起 | 页面栈和生命周期由 service 执行，宿主负责开/关 render 页面 |
| `runtime.bootstrap` · `runtime.resize` · `runtime.themeChange` | host → service | 宿主发起 | 启动、窗口尺寸、主题 |
| `diagnostic.*` | service/render → host | 写入 `HostDiagnosticStore` | 不回传另一侧，devtool 从宿主读取 |

:::callout{title="首屏 flow 会先于 render 到达"}
service 在 `runtime.bootstrap` 里就发出首屏 `tree.flow`，而 render 页面要等 bootstrap 返回 pageId 之后才会被宿主创建。宿主把这段窗口期的消息放进待发队列（最多 16 页），页面打开后按顺序 flush；没有 pageId 或队列溢出会记 `RENDER_SESSION_MISSING`，而不是静默丢弃。
:::

:::callout{title="导航为什么要经过宿主"}
service 只知道页面栈，render 只知道组件树。一次 `navigateTo` 必须由宿主先让 service 创建页面并返回 pageId/initialData，再让 render 卸载旧页、挂载新页。只有宿主同时持有两侧的连接。
:::

:::callout{title="canvas 不是第二条通道"}
唯一的“点对点”是 `OffscreenCanvas` 对象移交：render 在 iframe 内执行 `transferControlToOffscreen()`，宿主把它作为 transferable 转给 service。移交完成后 service 直接持有控制面，绘制不再产生任何跨线程消息——这也是它和普通消息链路的区别。
:::

## iOS 使用同一个 HostCore，但没有 iframe {#ios-native kicker="原生适配"}

iOS 不是另一套 host 语义，而是同一个 Rust HostCore 的 Swift 适配器：

```text
SwiftUI MiniProgramSession
  -> HostCoreRuntime
      -> RustHostCore (UniFFI)
      -> ServiceEngine (JavaScriptCore)
      -> NativeRenderSurface (one WKWebView per page)
```

| 层 | 浏览器宿主 | iOS 宿主 |
| --- | --- | --- |
| Host 编排 | `WasmBrowserHost` + wasm HostCore | `HostCoreRuntime` + UniFFI HostCore |
| service 容器 | service iframe | `JSContext` |
| render 容器 | 每页 render iframe | 每页独立 WKWebView |
| service/render 传输 | MessageChannel | `tinyRender` message handler / `__tinyRenderReceive` |
| host UI | devtool React 面板 | SwiftUI nav bar / tabBar |
| storage | 浏览器 storage | UserDefaults |
| canvas | OffscreenCanvas handoff | service display-list + native render 回放 |

`host.html`、`TinyWebView`、`FrameRelay` 和 `createTinyRuntime` 都已从 iOS 路径删除；
页面切换由 `HostCoreRuntime` 做 native push/pop 动画，左边缘 `UIScreenEdgePanGestureRecognizer`
提供交互式右滑返回。
`RUNTIME_STATE` 仍由 HostCore 投影成 UIState，SwiftUI chrome 只消费投影结果。

## 状态应该放在哪一层 {#ownership kicker="状态归属"}

很多“页面不更新、事件不触发、返回后白屏”的问题，都是因为状态被复制到了错误的层。

| 状态 | 归属 | 副本或投影 | 同步方式 |
| --- | --- | --- | --- |
| manifest 和产物 | 编译器生成，运行时只读 | 各线程内存中的 manifest | 启动时加载，不做热更新 |
| App / Page / Component 定义 | service registry + 逻辑树 | 宿主不保存组件定义 | bootstrap 时构建 schema；flow 只带渲染所需元数据 |
| 页面栈、当前页、页面 data | service | devtool 的 pageStack 投影 | RUNTIME_STATE 诊断 |
| 组件实例、observer、relations | service 逻辑树 | render 只有组件容器和节点镜像 | component flow + node id；不跨线程执行逻辑 |
| 虚拟节点树和 node id | service 逻辑树 | render 的节点映射 | service 分配 id；tree.flow / tree.patch 同步 |
| 真实组件树 / DOM / 布局 | render 渲染树 | devtool 的 InspectNode | 渲染树 `inspectTree` |
| 样式和 scope id | service 计算 scope，render 应用 | 无 | 逻辑树生成带 role 的样式，flow 下发 |
| canvas 实现 | 宿主 canvas handoff | service 持有 OffscreenCanvas 控制面 | ServiceCanvasAdapter / 浏览器 OffscreenCanvas relay |
| DOM 查询 | 宿主渲染树 | selector query / IntersectionObserver | query.select / query.intersection |
| 资源 URL | 宿主 resolveAssetUrl | render 重写后的 img/src 和 CSS url() | 渲染树在应用 flow 时解析 |
| 宿主 transport / API 语义 | 宿主 | service 侧 API 快照 | api.* 调用 / systemInfo / storage / apiExtensions |
| 诊断 | 宿主诊断仓库 | devtool diagnostics | diagnostic.* 事件 |

:::callout{title="一个常见错误" tone="warn"}
如果让 render 保存页面栈或组件 data，逻辑树和渲染树很容易对不上。页面栈、组件实例和业务 data 只归 service；render 只保存渲染节点和稳定 id，宿主只负责转发。
:::

## 这些约束不能破 {#invariants kicker="设计约束"}

它们决定了引擎能否跨宿主、方便测试，也方便定位问题。

::::cards
:::card{title="所有宿主共用一个 manifest"}
所有宿主只读 `@tiny/manifest`。一旦复制一份产物类型，编译器和运行时迟早会对不上。
:::

:::card{title="跨线程只传 JSON 安全的数据"}
Date、Map、Set、函数、undefined 和循环引用都会被 Bridge 拒绝。需要传递时，请先转成字符串或普通对象。
:::

:::card{title="依赖只能向内"}
核心包不能依赖 tools、apps、hosts 或 tests；共享类型放在 manifest 里，不要从 CLI 反向导入。浏览器能力只能从 `hosts/browser` 进入宿主，内置组件只能从 `hosts/web-components` 进入宿主。
:::

:::card{title="内核不引用浏览器 API"}
`pnpm check:runtime-purity` 会从 runtime 入口遍历依赖，禁止 window、document、iframe、MessageChannel、fetch 等宿主全局。
:::

:::card{title="环境能力由宿主注入"}
设备信息走 `apiExtensions`，canvas 走 `ServiceCanvasAdapter` / `RenderCanvasAdapter`，DOM 查询与相交观测走 `RenderQueryAdapter`，资源走 `resolveAssetUrl`，渲染后端和挂载点也由宿主提供。
:::

:::card{title="命名配置只有一个来源"}
输入侧模板指令、API、注册全局和 behavior scheme 来自 compatibility；Tiny 宿主属性、scope、marker 和内部 behavior 只来自 `TINY_ENGINE_NAMING`。不要在 runtime 里散落兼容字符串。
:::

:::card{title="两棵树不互相越界"}
service 不创建真实 DOM、不加载 Web 内置组件；render 不执行 app methods、observer 或 relations。node id 由 service 分配，渲染树只做映射。
:::

:::card{title="构建产物不入库"}
宿主产物、内置组件 ProcGen、devtool 静态文件和站点里的 devtool 都由构建生成；仓库只保留源码、约定和测试 fixture。
:::
::::

:::callout{title="继续阅读"}
[编译流程](#/compiler)说明 manifest 是怎么生成的；[运行时内核](#/runtime)说明双线程内部怎么协作；[Bridge 协议](#/protocol)列出完整消息；[宿主适配](#/hosts)说明这些边界在浏览器里怎么实现。
:::
