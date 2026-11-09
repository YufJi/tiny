---
title: '一个纯内核，'
highlight: '两棵树，任意宿主'
eyebrow: '架构'
lede: >-
  Tiny 的内核只有一份：runtime 不依赖任何宿主，浏览器、iOS 和测试宿主共享同一份内核，环境能力全部从边界注入。service 线程运行 glass-easel 逻辑树，宿主 render 线程维护真实渲染树，两者通过 component flow、虚拟节点 patch 和 tree 事件同步；编译器和 Bridge 只提供产物与传输，devtool 负责观察和控制。
stats:
  - ['2', '运行时树']
  - ['2', 'manifest schema']
  - ['7', '消息域']
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

        inject: connection / renderer / API table / page-release
              |                          |                          |
  ============+==========================+==========================+============
              v                          v                          v
  host boundary - only explicit ports cross; dependencies point inward

  +-----------------------------------------------------------------------------+
  | packages/runtime - PURE KERNEL                                              |
  |                                                                             |
  | service thread              tree protocol              render thread        |
  | App / Page / Component      flow / patch / event       TreeRenderer         |
  | logic tree / page stack     component ids / locators    host-neutral API     |
  +-----------------------------------------------------------------------------+
                                         | imports
                                         v
  @tiny/manifest / @tiny/bridge / @tiny/wxs-runtime / glass-easel
```

宿主不是内核的上层，而是内核的调用方。**宿主入口负责组装**：创建 `BridgeConnection`，用宿主事实和晚绑定的 runtime accessor 拼出 `ApiContext`，再把 API 表交给内核安装。`@tiny/api` 只依赖 `@tiny/bridge` 和 `@tiny/manifest`，不 import runtime。

| 注入点 | 宿主提供 | 内核拿到什么 | 浏览器宿主 | iOS 宿主 |
| --- | --- | --- | --- | --- |
| `connection` | 在 transport 上创建的连接 | `BridgeConnection` | MessageChannel | JSCore message handler |
| `manifest` 与 loader | 产物与加载方式 | 只读 manifest、templates、styles | 静态资源 | 打包产物 |
| `TreeRenderer` | 真实组件树 | 渲染契约 | `createGlassRenderTree` | 每页 WKWebView |
| `apiHost` | API 表（含宿主扩展） | `MiniProgramApiHost`（不透明表） | `@tiny/api` + 窗口设备信息 + canvas/asset/sync | `@tiny/api` + 菜单按钮、性能 + canvas/asset/sync |
| `onPageRelease` | 页面销毁后的资源回收 | `(pageId) => void` | 释放 canvas 节点 | 释放 display list |

canvas 和 `resolveAssetUrl` 只进入 `@tiny/api` 的 context；同步调用由宿主注入的 `globalThis.__TINY_HOST_BRIDGE__` 句柄的 `sendSync`（帧级 `callSync` 请求/`reply`）承载，runtime 不需要它们，只在页面销毁时调用 `onPageRelease`。`themeListeners` 由宿主创建，同时交给 api（`onThemeChange`）和 runtime（转发 `runtime.themeChange`）。

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
| host | 线程和 transport、启动流程、宿主 API、渲染树、内置组件、canvas、资源 URL、诊断收集 | 页面栈、业务 data、observer、relations 和事件回调 | `hosts/web` · `hosts/web-components` · `apps/devtool` · `tests/host` · `ios/` native adapter |

:::callout{title="页面状态只在 service"}
页面栈、页面 data、组件实例、observer 和 relations 都归 service 线程管；render 线程持有渲染树、DOM 和组件模板求值结果，只镜像组件的共享 id，元素用自己的本地 id 和组件作用域 locator 寻址。两棵树没有共享内存，所有同步都经过宿主转发的 tree 协议。
:::

## 两棵树：逻辑树在 service，渲染树在 host {#split-tree kicker="双侧树"}

这是当前运行时的核心设计。service 不创建 DOM，render 不执行小程序逻辑；组件模板由两侧按同一份编译产物各自求值（two-evaluation），两边通过共享的组件 id、组件作用域 locator、component flow 和 virtual node patch 对齐。

| 层 | 在哪里 | 拥有 | 不负责 |
| --- | --- | --- | --- |
| 逻辑树 | service 线程 | glass-easel ComponentSpace、模板求值、virtual node、组件实例、observer、relations、带类型的 dataset、组件的共享 id | DOM、布局、宿主内置组件实现 |
| 渲染树 | 宿主的 render 线程 | 真实内置组件、组件模板求值（shadow tree）、slot、shadow root、样式、布局、DOM、元素本地 id | app methods、observer、relations、页面栈 |
| 同步协议 | 两棵树之间 | component flow 首屏同步、virtual node patch（组件 id / 元素 locator 寻址）、tree 事件、query/canvas 控制 | 业务语义 |

```text
  SERVICE THREAD (kernel)                          RENDER THREAD (host renderer)
  +------------------------------+             +------------------------------+
  | service thread               |             | render thread                |
  | App / Page / Component       |             | host TreeRenderer            |
  | glass-easel logic tree       |             | glass-easel render tree      |
  | data / observers / relations |             | DOM / layout / styles        |
  | virtual node / component id  |             | template eval / shadow root  |
  | page stack / no DOM          |             | no app methods               |
  +---------------+--------------+             +---------------+--------------+
                  |                                            ^
                  |   tree.flow / tree.patch / tree.animate    |
                  +--------------------------------------------+
                          tree.event / query.* return through the same link
```

首屏由 `tree.flow` 发送 `define`（组件定义）、`tree`（整棵渲染快照）和 `ready`；快照里的组件带共享 id，元素不带 id（渲染侧分配本地 id）。后续模板变化由 `tree.patch` 发送 `text`、`replace`、`props`、`insert`、`remove`、`reorder`、`extra`：组件用共享 id 寻址，元素用 `owner#index.path` 形式的 locator 寻址，宿主只负责应用 patch。

:::callout{title="为什么要拆成两棵树"}
render 只对组件模板做一次确定性的求值（和 service 用同一份 `templates.js`），属性、dataset、函数和 observer 仍然只在 service 里产生和消费。拆开之后，类型和语义留在 service，render 负责“怎么画”和 shadow tree 的求值，同一套 tree 协议可以接 Web、原生或测试渲染器；组件 id 是两侧唯一的共享身份，元素 id 不跨线程。
:::

## glass-easel 提供组件框架，Tiny 补齐应用层 {#glass-easel kicker="运行时内核" nav="与 glass-easel 的分工"}

glass-easel 不是完整的小程序 SDK。它负责组件、模板、数据绑定、事件和生命周期，App、路由、API 等由 Tiny 自己实现。

| 能力 | 由谁提供 | 在 Tiny 中如何使用 |
| --- | --- | --- |
| 组件定义、properties、data、methods、模板 | glass-easel（service 逻辑树 + render shadow tree） | `defineWithMethodCaller` / `defineComponent`；service 求值逻辑树，render 用同一份模板求值 shadow tree |
| WXML 运行时数据绑定与更新 | glass-easel | 编译器把 WXML 编成 ProcGen，运行时只传 groupList/content |
| 事件捕获与冒泡、slot、shadow 边界 | glass-easel（两侧各自） | 逻辑树分发事件，渲染树处理真实 DOM 事件 |
| created/attached/ready/moved/detached 生命周期 | glass-easel（service） | 组件实例和 relations 都在逻辑树 |
| 样式作用域和渲染树 | glass-easel + host | 逻辑树计算 scope；渲染树应用样式和 styleIsolation |
| Behaviors / observers / relations / selectComponent | Tiny runtime | component-definition 归一化 + ComponentTree + glass-easel relation builder |
| App 生命周期、页面栈、路由、onLoad/onShow/onReady | Tiny runtime | `packages/runtime/src/service/thread.ts` |
| 兼容输入配置、内部 Tiny 命名 | Tiny manifest + runtime | tiny.config.json → compatibility / runtimeCompatibility；内部名来自 TINY_ENGINE_NAMING |
| wx API、storage、system info、animation | Tiny runtime + `@tiny/api` + host | 内核只安装宿主注入的 API 表；标准微信兼容集在 `@tiny/api`，设备信息由 extensions 叠加 |
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
| `@tiny/api` | manifest · runtime | 微信兼容 `wx.*` 表，内核和宿主之间的 API 适配层 |
| `@tiny/template-compiler` | manifest · acorn · magic-string | WXML → ProcGen / WXS transform |
| `@tiny/stylesheet-compiler` | manifest · css-units · postcss | WXSS → 普通/低优先级 CSS |
| `@tiny/cli` | manifest · template-compiler · stylesheet-compiler · esbuild · typescript | 负责生成全部产物 |
| `@tiny/runtime` | manifest · bridge · wxs-runtime · glass-easel | 双线程运行时内核，不依赖宿主 |
| `@tiny/host-web` | runtime · bridge · api · host-web-components | 通用 Web 宿主：iframe/WebView 线程入口、MessageChannel、DOM 渲染树、Canvas、页面生命周期；Rust HostCore 的 wasm 适配 |
| `@tiny/host-core-wasm` | Rust `host-core` · wasm-bindgen | 浏览器 HostCore wasm 绑定，devtool/test host 共用 |
| `@tiny/host-core-ffi` | Rust `host-core` · UniFFI | iOS Swift HostCore 绑定 |
| `@tiny/host-web-components` | manifest · css-units · runtime · glass-easel；构建期 template-compiler | 39 个内置组件的定义、behaviors、AOT 模板和默认 CSS（不负责 render tree/线程启动） |
| `@tiny/host-ios` | runtime · bridge · api · host-web | iOS native adapter：JSCore service engine 与每页 WKWebView 的 transport/canvas；render entry 复用 host-web，状态机由 `ios/` 的 UniFFI HostCore 驱动 |
| `devtool` | host-web · host-core-wasm · glass-easel · React · Redux/rematch | 调试器宿主和控制面板；宿主 API handler 由 app 注入 |
| `@tiny/website` | React | 架构站点，不进入引擎链路 |

```text
core        packages/manifest
            packages/bridge
            packages/wxs-runtime
            packages/api                -> bridge, manifest
            packages/template-compiler
            packages/stylesheet-compiler
            packages/runtime            -> manifest, bridge, wxs-runtime, glass-easel
tools       tools/cli                  -> manifest, template-compiler, stylesheet-compiler
hosts       hosts/web              -> runtime, bridge, api, host-web-components   (Web 宿主适配)
            hosts/web-components       -> runtime, manifest, css-units, glass-easel
                                          (内置组件，注入 render)
            hosts/ios                  -> runtime, bridge, api, host-web
                                          (JSCore engine + native WKWebView render)
apps        apps/devtool               -> host-web, host-core-wasm
tests       tests/host                 -> host-web, host-web-components
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
| 创建 service 通道 | 宿主 | service 先建立一条 MessageChannel；render 连接不预先创建，而是每新建一个页面时随 render root 建立一条。 | createHostMessageChannelPair() |
| 创建 iframe，等待线程就绪 | 宿主 | service iframe 被隐藏为 0×0，render iframe 填满容器；每新建一个页面就创建一个 render iframe。宿主等待线程发回 tiny-runtime-port-ready，最多等 15 秒。 | WasmBrowserHost(...) |
| 线程装好连接后再通知宿主 | service / render | service 先拿到 manifest，再在 bootstrap 里加载 templates 和 styles；render 先在 `prepare` 里装好内置样式，渲染树本身在端口到达后创建。线程要等 connection 安装完成，才调用 `listenForRuntimePort`，避免端口消息到达时丢帧。 | bootServiceEntry(...) / bootRenderEntry(...) |
| 把 MessagePort 交给线程 | 宿主 | 宿主把 port2 作为 transferable 发给对应 iframe；线程再用 createMessagePortTransport 包装成 Transport。 | postMessage({ type: 'tiny-runtime-port' }, '*', [port]) |
| 两条连接分别握手 | bridge | 宿主分别发起 runtime.hello，service/render 回复握手信息并发送 runtime.ready。协议版本不一致时连接会直接关闭。 | host.service.handshake() · host.render.handshake() |
| service 启动首屏 | 宿主 → service | 导入 service.js，App/Page/Component 在这里注册，App.onLaunch/onShow 也会立即执行。随后安装 runtimeCompatibility 兼容全局，构建组件 schema 和 glass-easel 逻辑树，创建首个页面并触发 onLoad/onShow；逻辑树挂载后立即生成首屏 tree.flow，返回 pageId、initialData 和 componentSchemas。 | service.control('runtime', 'bootstrap') |
| render 建好渲染树 | 宿主 → render | render 创建 `TreeRenderer`（Web 侧 `createGlassRenderTree`），安装宿主内置组件和编译模板，等待 service 发来的 `tree.flow`。首屏 flow 包含 define/tree/ready：render 先装组件定义，再把快照挂到页面根，并为组件模板求值出 shadow tree。 | render.control('runtime', 'bootstrap') |
| 同步首屏并触发 onReady | 宿主 → service | render bootstrap 完成后，宿主发送 `tree.ready`，service 用逻辑树快照再次发送 `tree.flow`；宿主随后发 `page.ready`，service 触发 onReady。此时逻辑树、组件实例和 relations 已经可用。 | service.control('page', 'ready', { pageId }) |
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
            | HostCore + platform handlers + diagnostics   |
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
  service ── tree.flow / tree.patch / tree.animate ────────────────► host ──► render
  service ◄── tree.event / tree.templateEvent / tree.wxsEffect ────── host ◄── render
  service ◄── page.scroll / reachBottom / pullDownRefresh ──────────── host ◄── render

代理（call/control，host 等渲染树回包后再回 service）
  service ── query.select / query.intersection ───────────────────► host ──► render
  service ◄──────────────── reply ───────────────────────────────── host ◄── reply

终结（host 自己处理，不再转发）
  service ── api.* ─────────────────────────────────► HostCore / platform handlers
  render  ── tree.hostAction ───────────────────────► navigate.* handler
  service/render ── diagnostic.* ───────────────────► host diagnostic callback

发起（host 主动驱动两侧）
  host ── runtime.bootstrap / page.ready / page.navigateTo ──► service
  host ── runtime.bootstrap / runtime.inspectTree ──────────► render
```

| 消息 | 路径 | 宿主处理 | 用途 |
| --- | --- | --- | --- |
| `tree.flow` · `tree.patch` | service → host → render | 按 pageId 转发；目标页还没打开时先入队 | 首屏 component flow、虚拟节点 patch |
| `tree.snapshot` | service → host → render | 保留入口，当前 service 不发送 | 旧版完整快照 |
| `tree.animate` · `tree.clearAnimate` | service → host → render | 按 pageId 转发 | `this.animate` / `clearAnimate` 的关键帧 |
| `tree.wxsBinding` | service → host → render | 按 pageId 转发 | 动态 WXS 事件绑定决策 |
| `tree.event` | render → host → service | 按 pageId 转发 | 事件带组件 id 或元素 locator、name、detail、native、touches 和 target/currentTarget 几何 |
| `tree.templateEvent` | render → host → service | 按 pageId 转发 | render 求值的组件模板把方法调用交回 service |
| `tree.wxsEffect` | render → host → service | 按 pageId 转发 | WXS `callMethod` / `triggerEvent` 的跨线程副作用 |
| `tree.hostAction` · `tree.hostRequest` | render → host | 宿主直接处理 | 内置组件的导航、picker 等宿主动作 |
| `tree.ready` | host → service | render bootstrap 完成后由宿主发送 | 请求逻辑树重发首屏 flow |
| `query.select` | service → host → render → host → service | 两次 RPC | selector query 在真实 DOM 中查节点，返回 rect/dataset/scroll |
| `query.intersection` | service → host → render；entry 反向 render → host → service | 代理 observe/disconnect，再转发回调 | 页面/组件级 IntersectionObserver |
| `canvas` handoff | service → host → render → host → service | 只中继 transferable，不解析 | 把 OffscreenCanvas 交给 service；之后直接绘制 |
| `api.*` | service → host | HostCore / 平台 handler 查表；`navigate.*` 会再 control service | 导航、toast、storage、request 等宿主语义 |
| `page.scroll` · `page.reachBottom` · `page.pullDownRefresh` | render → host → service | 按 pageId 转发 | 页面滚动、触底和下拉手势——render 文档才是页面的滚动容器 |
| `page.ready` · `page.navigateTo` · `page.navigateBack` · `page.switchTab` · `page.redirectTo` · `page.reLaunch` · `page.pullDownRefresh` · `page.share` · `page.saveExitState` · `page.hide` · `page.show` · `page.unload` | host → service | 宿主发起 | 页面栈和生命周期由 service 执行，宿主负责开/关 render 页面 |
| `runtime.bootstrap` · `runtime.resize` · `runtime.themeChange` | host → service | 宿主发起 | 启动、窗口尺寸、主题 |
| `diagnostic.*` | service/render → host | 写入宿主诊断通道，devtool 通过回调读取 | 不回传另一侧 |

:::callout{title="首屏 flow 会先于 render 到达"}
service 在 bootstrap 里就会为首屏生成一次 `tree.flow`，而这时宿主还没创建 render root。HostCore 按 pageId 把页面级事件暂存（每页最多 256 条），页面连上后按顺序投递；没有 pageId 或队列溢出只会产生 warning 诊断，不会静默丢消息。
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

iOS 路径不使用 iframe 或 `host.html`；页面切换由 `HostCoreRuntime` 做 native push/pop 动画，左边缘 `UIScreenEdgePanGestureRecognizer` 提供交互式右滑返回。
`RUNTIME_STATE` 仍由 HostCore 投影成 UIState，SwiftUI chrome 只消费投影结果。

## 状态应该放在哪一层 {#ownership kicker="状态归属"}

很多“页面不更新、事件不触发、返回后白屏”的问题，都是因为状态被复制到了错误的层。

| 状态 | 归属 | 副本或投影 | 同步方式 |
| --- | --- | --- | --- |
| manifest 和产物 | 编译器生成，运行时只读 | 各线程内存中的 manifest | 启动时加载，不做热更新 |
| App / Page / Component 定义 | service registry + 逻辑树 | 宿主不保存组件定义 | bootstrap 时构建 schema；flow 只带渲染所需元数据 |
| 页面栈、当前页、页面 data | service | devtool 的 pageStack 投影 | RUNTIME_STATE 诊断 |
| 组件实例、observer、relations | service 逻辑树 | render 只有组件容器和节点镜像 | component flow + 组件共享 id；不跨线程执行逻辑 |
| 虚拟节点树和组件 id | service 逻辑树 | render 的节点映射 | 组件 id 由 service 分配；元素 id 渲染侧本地，事件/补丁用 locator；tree.flow / tree.patch 同步 |
| 真实组件树 / DOM / 布局 | render 渲染树 | devtool 的 InspectNode | 渲染树 `inspectTree` |
| 样式和 scope id | service 计算 scope，render 应用 | 无 | 逻辑树生成带 role 的样式，flow 下发 |
| canvas 实现 | 宿主 canvas 适配器 | 浏览器由 service 持有 OffscreenCanvas 控制面；iOS 由 service 录制 display-list、render WKWebView 回放 | ServiceCanvasAdapter / 宿主 canvas relay |
| DOM 查询 | 宿主渲染树 | selector query / IntersectionObserver | query.select / query.intersection |
| 资源 URL | 宿主 resolveAssetUrl | render 内置组件的 img/src；CSS url() 原样保留 | 渲染树解析内置组件资源，样式按文档相对路径解析 |
| 宿主 transport / API 语义 | 宿主（system/storage 事实的唯一来源） | 仅保存注入的 API 表 | api.* 调用 / 全局句柄 sendSync / apiHost |
| 诊断 | 宿主诊断仓库 | devtool diagnostics | diagnostic.* 事件 |

:::callout{title="一个常见错误" tone="warn"}
如果让 render 保存页面栈或组件 data，逻辑树和渲染树很容易对不上。页面栈、组件实例和业务 data 只归 service；render 只保存渲染节点、组件共享 id 和本地元素 id，宿主只负责转发。
:::

## 这些约束不能破 {#invariants kicker="设计约束"}

它们决定了引擎能否跨宿主、方便测试，也方便定位问题。

::::cards
:::card{title="所有宿主共用一个 manifest"}
所有宿主只读 `@tiny/manifest`。一旦复制一份产物类型，编译器和运行时迟早会对不上。
:::

:::card{title="跨线程只传 JSON 安全的数据"}
调用和回复必须能通过 Bridge 的严格 JSON 校验；事件路径会先经 runtime 的 `toJsonSafe` 清洗。函数、undefined、类实例和循环引用不会原样跨线程，需要传递时先转成普通对象或字符串。
:::

:::card{title="依赖只能向内"}
核心包不能依赖 tools、apps、hosts 或 tests；共享类型放在 manifest 里，不要从 CLI 反向导入。Web 宿主能力（线程、端口、DOM 渲染树、canvas）从 `hosts/web` 进入宿主，内置组件定义从 `hosts/web-components` 进入宿主；宿主 API handler 由应用注入。
:::

:::card{title="每个线程一份 glass-easel"}
宿主代码只从 `@tiny/runtime/glass-easel` 导入 glass-easel；host 包声明 `glass-easel` 为 peer dependency，Vite 配置使用 `dedupe: ['glass-easel']`。service 和 render 是两个 JS realm，各自持有一份 module instance 和 `ComponentSpace`，不能跨线程传递 glass-easel 对象。
:::

:::card{title="内核不引用浏览器 API"}
`pnpm check:runtime-purity` 会从 runtime 入口遍历依赖，禁止 window、document、iframe、MessageChannel、fetch 等宿主全局。
:::

:::card{title="环境能力由宿主注入"}
API 表由宿主入口组装（标准集来自 `@tiny/api`，设备事实用扩展叠加），canvas/资源只进入 api context，同步调用由宿主注入的全局句柄的 `sendSync` 提供；runtime 只接收不透明 API 表和 `onPageRelease` 清理钩子。DOM 查询与相交观测走 `TreeRenderer.query` / `observeIntersection`，渲染后端和挂载点也由宿主提供。
:::

:::card{title="命名配置只有一个来源"}
输入侧模板指令、API、注册全局和 behavior scheme 来自 compatibility；Tiny 宿主属性、scope、marker 和内部 behavior 只来自 `TINY_ENGINE_NAMING`。不要在 runtime 里散落兼容字符串。
:::

:::card{title="两棵树不互相越界"}
service 不创建真实 DOM、不加载 Web 内置组件；render 不执行 app methods、observer 或 relations。组件 id 由 service 分配，元素 id 由渲染侧分配，跨线程寻址用 locator。
:::

:::card{title="构建产物不入库"}
宿主产物、内置组件 ProcGen、devtool 静态文件和站点里的 devtool 都由构建生成；仓库只保留源码、约定和测试 fixture。
:::
::::

:::callout{title="继续阅读"}
[编译流程](#/compiler)说明 manifest 是怎么生成的；[运行时内核](#/runtime)说明双线程内部怎么协作；[Bridge 协议](#/protocol)列出完整消息；[宿主适配](#/hosts)说明这些边界在浏览器里怎么实现。
:::
