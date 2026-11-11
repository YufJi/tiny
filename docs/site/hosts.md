---
title: '引擎不依赖环境，'
highlight: '运行环境由宿主提供'
eyebrow: '宿主适配'
lede: >-
  packages/runtime 是宿主无关的内核：service 跑逻辑树，宿主提供渲染树。@tiny/host-web 是通用 Web 宿主适配层，负责线程入口、端口、DOM 渲染树和 canvas handoff；@tiny/host-web-components 只提供 39 个内置组件的定义、behaviors 和默认样式；宿主 API 由应用注入。iOS 侧由 @tiny/host-ios 提供 JSCore engine 与每页 native WKWebView 的 transport/canvas 适配，Web render entry 复用 @tiny/host-web；HostCoreRuntime/SwiftUI 壳在 ios/。浏览器侧由 WasmBrowserHost 创建 iframe、转移端口并驱动 Rust HostCore；iOS 侧由 HostCoreRuntime 经 UniFFI 驱动同一个 HostCore。调试器的会话客户端属于 devtool 应用本身（apps/devtool/src/runtimeClient.ts），不在宿主包里。
stats:
  - ['3', '宿主包']
  - ['1', 'service iframe']
  - ['每页', 'render surface']
  - ['5', '注入能力']
pills:
  - ['内核不依赖宿主', 'good']
  - ['canvas 注入', 'good']
  - ['资源解析', 'good']
  - ['在线调试器', 'good']
description: '小程序内核如何接入宿主：host-web、host-web-components、iframe 线程、DOM 渲染树、canvas 与资源注入。'
name: '宿主'
pageTitle: '宿主适配 · Tiny 小程序引擎'
order: 6
---

## 宿主分成几层 {#model kicker="宿主分层"}

把宿主当成一个包，很难看清边界。它其实由几层可替换的装配组成。

| 层 | 入口 | 环境假设 | 职责 |
| --- | --- | --- | --- |
| 内核编排 | `WasmBrowserHost` / `HostCoreRuntime` | 适配器持有 WebView/iframe；HostCore 不依赖 DOM | 一条 service 连接、每页一条 render 连接、平台 handler、诊断通道和启动顺序 |
| 线程启动 | `bootServiceEntry` / `bootRenderEntry` | service 需要 JS 全局；render 需要 `TreeRenderer` | service 加载 templates 并创建逻辑树；render 消费 tree flow/patch；canvas 和资源由宿主注入 |
| Web 宿主适配 | `@tiny/host-web` | window、iframe/WebView、MessageChannel、document | iframe/WebView 线程入口、端口、DOM 渲染树、DOM canvas、资源 URL、页面生命周期 |
| 内置组件 | `@tiny/host-web-components` | DOM 和 CSS | 39 个 tiny-* 定义、共享 behaviors、模板和基础 CSS；不负责线程启动 |
| 宿主 API | `tests/host` · `apps/devtool` · iOS native | 应用/平台自己的环境 | network、clipboard、toast、modal、storage 等 handler，由应用显式注入 |
| 应用宿主 | `tests/host` · `apps/devtool` | 静态资源服务器 / Vite | 选择应用、加载 manifest、提供界面或自动化钩子、调用 bootstrap |

```text
应用外壳（host.ts / devtool React）
              |
              v
@tiny/host-web                通用 Web 宿主适配
  WasmBrowserHost
  bootServiceEntry / bootRenderEntry
  createGlassRenderTree / createGlassRenderEntry
  canvas handoff / runtime-port / page-lifecycle

@tiny/host-web-components        内置组件实现
  39 个 tiny-* definitions / behaviors / 模板 / 基础 CSS
              |
              v  WasmBrowserHost / HostCore
Rust HostCore + platform adapter  内核编排
              |
              v  boot*Thread(transport, manifest, canvas, ...)
service iframe / render iframe

原生宿主替换的是浏览器适配层，不是 runtime 语义。
```

:::callout{title="浏览器只是其中一种适配"}
浏览器验收使用 `WasmBrowserHost`；runtime 单测通过内存 transport 启动 service/render 线程，并用 `tests/support` 下的 test-only host 驱动。生产宿主由 HostCore + 平台适配器提供。
:::

## 内核不引用浏览器 API {#purity kicker="内核约束"}

这是宿主适配最重要的约束：内核只定义语义，环境能力全部由宿主注入。

:::::split
:::card{tag="检查脚本" title="pnpm check:runtime-purity"}
脚本会从 `packages/runtime/src/index.ts`、`packages/api/src/index.ts` 和 `packages/wxs-runtime/src/index.ts` 遍历相对 import，去掉注释后搜索宿主全局：

```text
window · document · navigator
localStorage · sessionStorage · indexedDB
HTMLCanvasElement · HTMLImageElement · HTMLElement · Image
OffscreenCanvas · getComputedStyle · CustomEvent
requestAnimationFrame · cancelAnimationFrame
MessageChannel · MessagePort · postMessage
XMLHttpRequest · WebSocket · fetch · performance
devicePixelRatio · process · Buffer · require
```

同时禁止依赖图里出现名字带 `browser` 的模块，或导入 `@tiny/host-*`。一旦违规，验收直接失败。
:::

::::stack
:::card{tag="内核" title="packages/runtime"}
导出 service/render 线程入口、TreeRenderer 契约、tree protocol、诊断和 `ServiceThreadRuntime`。宿主入口创建 `BridgeConnection`、组装 API 表和宿主能力，runtime 只接收 connection、API 表、artifacts/loader 与 `onPageRelease`；页面路由和平台调用由 HostCore 承担。
:::

:::card{tag="宿主" tone="violet" title="@tiny/host-web"}
负责 iframe/WebView 线程入口、MessageChannel、DOM 渲染树、OffscreenCanvas handoff、资源 URL 规则和页面生命周期桥；tests/host、devtool 和 iOS render 入口都从这里导入。它不是宿主 API 的实现者，调试器自己的会话与视图模型也不在这个包里。
:::

:::card{tag="组件" tone="violet" title="@tiny/host-web-components"}
只负责 `tiny-*` 内置组件定义、behaviors、模板和基础 CSS；不提供 render tree、render entry 或线程启动。Web 渲染树在 `@tiny/host-web`。
:::

:::card{tag="结果" title="可移植性"}
原生宿主只要实现 `TreeRenderer`、Transport、canvas handoff、资源解析和宿主 API，不需要假装自己是浏览器。
:::
::::
:::::

## 先交端口，再握手，最后启动页面 {#boot kicker="启动流程"}

浏览器宿主的启动顺序里有一个真实竞态：端口转移早于连接安装会丢消息。就绪消息就是为解决它加的。

:::sequence
| title | detail | code |
| --- | --- | --- |
| 创建 service 通道 | 宿主先创建 service 的 MessageChannel；render 连接由每页 connector 在页面创建时建立。 | createHostMessageChannelPair() |
| 启动 service iframe | service iframe 被隐藏（0×0、absolute、opacity 0），加载 service.html。 | createThreadIframe(serviceUrl) |
| 等待 service 就绪 | 宿主监听 tiny-runtime-port-ready，只接受目标 iframe 的消息，最多等 15 秒。 | waitForThreadReady(iframe, 'service') |
| 转移 service 端口并握手 | 宿主把 port2 交给 service，service 安装 Transport 后完成 runtime.hello。 | postMessage({ type: 'tiny-runtime-port' }, '*', [port]) |
| service bootstrap | 导入 service.js，安装兼容全局，加载 templates/styles，创建 glass-easel 逻辑树和首屏页面，返回 pageId、initialData 和 componentSchemas。 | service.control('runtime', 'bootstrap') |
| 创建 render root | 宿主为页面创建 render iframe，render 入口调用 `bootRenderEntry`；它内部安装内置样式、等待端口并创建 `createGlassRenderTree` 和宿主内置组件。 | bootRenderEntry({ container, loadTemplates, resolveAssetUrl }) |
| render 就绪，发送首屏 flow | render 收到 bootstrap 后返回 ready；宿主发 `tree.ready`，service 用逻辑树快照重发 `tree.flow`，render 挂载页面根。首屏 flow 在 service bootstrap 内已经发过一次，宿主会先暂存到该页队列。 | tree.ready → tree.flow |
| 触发 onReady | 宿主发 `page.ready`，service 触发页面 onReady 并广播 RUNTIME_STATE。 | service.control('page', 'ready', { pageId }) |
:::

:::::split
::::stack
:::card{tag="竞态" title="为什么线程要先装好连接"}
如果线程在安装 connection 之前就发 ready，宿主会立刻转移端口；端口消息到达时还没有监听器，第一帧就丢了。

因此端口监听封装在宿主包里：service 侧等 manifest 和 styles 就绪后才调用 `bootServiceEntry`；render 侧由 `bootRenderEntry` 先装 canvas responder，再监听端口。
:::

:::card{tag="超时" title="15 秒固定超时"}
iframe 超过 15 秒没有发 ready 会直接 reject，不会重试。产物很大或网络很慢时，要调整宿主实现，而不是改 runtime。
:::
::::

```ts
// 宿主侧（tests/host/src/host.ts）
import init, { WasmHostCore } from '@tiny/host-core-wasm'
import { TestBrowserHost } from './test-host'
import { createTestHostApiHandlers, createTestHostSyncApiHandlers } from './host-api'

await init()
const storage = {}
const getSystemInfo = () => ({
  pixelRatio: devicePixelRatio,
  windowWidth: innerWidth,
  windowHeight: innerHeight,
})
const runtime = new TestBrowserHost({
  manifest,
  appId: 'test-host',
  serviceUrl: '/service.html',
  renderUrl: '/render.html',
  initialPath: 'pages/todos/todos',
  container: document.getElementById('app') ?? document.body,
  storage,
  apiHandlers: createTestHostApiHandlers(storage, getSystemInfo),
  syncApiHandlers: createTestHostSyncApiHandlers(storage, getSystemInfo),
}, async (config) => {
  const core = new WasmHostCore(config)
  return {
    start: (now) => core.start(now),
    handle_event: (event, now) => core.handle_event(event, now),
  }
})
window.__tinyRuntime = { host: runtime }
await runtime.launch()

// service 线程：加载模板、样式和 service bundle
bootServiceEntry({
  manifest,
  initialPath,
  loadTemplates: async () => (await import('/generated/templates.js')).default,
  loadArtifacts: () => import('/generated/service.js'),
  loadStyle: (path) => styles[path] ?? '',
  resolveAssetUrl,
  apiExtensions,
})

// render 线程：创建宿主渲染树，并加载同一份 templates.js
bootRenderEntry({
  container: document.getElementById('app'),
  loadTemplates: async () => (await import('/generated/templates.js')).default,
  resolveAssetUrl: (src, sourcePath) => {
    const reference = resolveAssetReference(sourcePath, src)
    return reference ? `${generatedBase}/${reference.path}${reference.suffix}` : undefined
  },
})
```
:::::

## 线程只接收宿主显式传入的参数 {#threads kicker="线程参数"}

service 和 render 都不读取 URL，也不读取全局 manifest；所有输入都由宿主传入。

| ServiceThreadOptions | 用途 | 是否必需 |
| --- | --- | --- |
| `connection` | 宿主在 transport 上创建的 service 连接 | 是 |
| `manifest` | 页面、组件、样式、兼容输入和诊断 | 是 |
| `initialPath` | 首屏页面路径 | 是 |
| `loadArtifacts` | 在 bootstrap 时导入 service.js，保证 App/Page 已注册 | 实际必需 |
| `loadTemplates` | 加载 templates.js，供 service 逻辑树求值 | 是 |
| `loadStyle` | 按 outputPath 返回样式文本，供逻辑树计算样式作用域 | 使用样式时必需 |
| `apiHost` | 宿主入口组装好的 `wx` 表（不透明） | 是（`bootServiceEntry` 默认组装） |
| `events` | api 的全局事件 hub；宿主事件和内核事件都发到它 | 否 |
| `appVisible` | 宿主初始可见性，决定启动时是否调用 App.onShow；默认 true | 否 |
| `launchOptions` | 宿主拥有的启动参数，原样传给 App.onLaunch/onShow 和 `getLaunchOptionsSync` | 否 |

宿主平台事件通过 host core 的 `emitEvent` 命令进入 service（`event.global`）。浏览器已接 `visibilitychange`（appShow/appHide）和 online/offline（networkStatusChange），iOS 接 `scenePhase` 和 `NWPathMonitor`。
| `onPageRelease` | 页面销毁后由宿主回收资源（canvas 节点等） | 否 |
| `maxPageStack` | 页面栈上限，默认 10 | 否 |

render 线程需要拿到编译模板，因为组件 shadow tree 在 render 侧求值；`builtinComponents` 由渲染树工厂（Web 侧 `createGlassRenderTree`）内部创建，不需要线程参数。

| `TreeThreadOptions` / `RenderEntryOptions` | 用途 | 是否必需 |
| --- | --- | --- |
| `connection` | 宿主在 render transport 上创建的连接 | `bootTreeThread` 必需 |
| `renderer` | 宿主 `TreeRenderer`：mountPage / 模板与组件定义 / 页面数据与身份 hints / query / measure / inspectTree | `bootTreeThread` 必需 |
| `templates` | 已加载的模板组，首屏前直接安装 | 与 `loadTemplates` 二选一 |
| `loadTemplates` | 异步加载 templates.js；flow 会等它完成后再挂载 | 与 `templates` 二选一 |
| `prepare` | 内置样式安装后、宣告 ready 前执行的额外宿主设置 | 否 |
| `pageId` | 这个 render root 对应的页面 | 否 |
| `container` | Web 渲染树的 DOM 容器 | 否；默认 `#app`，再退回 `<body>` |
| `resolveAssetUrl` | Web 内置组件解析图片等资源 | 使用本地资源时必需 |
| `document` | 安装内置样式所用的 document | 否；默认当前 document |

::::split
:::card{title="service 线程还要做什么"}
- 先安装 App/Page/Component/Behavior/getApp 和配置后的 API 全局
- 再导入 service.js，让注册调用按 manifest 顺序发生
- 在 bootstrap 内加载 templates/styles，创建 LogicTreeAdapter
- canvas API 由注入的 adapter 提供，内核不碰 document
:::

:::card{title="render 线程还要做什么"}
- 在宣告 ready 之前装好宿主内置样式（`prepare`）
- 实现 TreeRenderer（Web 侧 `createGlassRenderTree`）
- 创建真实内置组件和页面根容器
- 接收 `tree.flow` / `tree.patch`，维护组件 id 到真实组件的映射；元素用渲染侧本地 id 和 locator；custom tabBar 的 `tabRoot` 挂到页面内容外的独立根，`tabPatches` 与 page patch 共用渲染批次
- 按 `templates.js` 求值组件 shadow tree（`loadTemplates` 在首屏 flow 之前装好模板组）
- 提供 query、measure、inspectTree 和 IntersectionObserver
:::
::::

:::callout{title="bootstrap 之后还有 tree.ready 和 page.ready"}
service bootstrap 创建逻辑树并返回 pageId 和 componentSchemas，同时在内部生成首屏 `tree.flow`（此时 render root 还没建立，由宿主暂存）。render bootstrap 只创建渲染根；宿主再发 `tree.ready` 让 service 重发快照，最后发 `page.ready` 触发 onReady。
:::

## 宿主可以注入五类能力 {#injections kicker="注入能力"}

跨线程 API、同步宿主信息、渲染树、canvas handoff 和资源 URL 各有自己的入口。放错层，就会让内核偷偷依赖浏览器。

::::split
:::card{tag="宿主" title="platform handlers：跨线程 API"}
HostCore 把 `api.*` 调用交给平台适配器；浏览器实现集中在 `createBrowserApiHandlers()`，iOS 在 `HostCoreRuntime.platformCall` 里处理。handler 的签名类型 `HostApiHandler(s)`、系统事实 `SystemInfo` 和存储值 `StorageValues` 都由 `@tiny/api` 提供，runtime 不再持有这些宿主契约。

- `navigate.*` / `page.*`：HostCore 协调 service 和 render
- `storage.*`：宿主持久化
- `*Sync` 读取（`system.info`、`storage.*`）：具体宿主通过 `WasmHostOptions.syncApiHandlers` 提供同步实现；service entry 用它组装全局句柄 `__TINY_HOST_BRIDGE__` 的 `sendSync`（`callSync` 请求帧 + 普通 `reply`；浏览器经 `__tinySyncHost`，iOS 走 JSCore block），再 `connectHostBridge`；API 层通过 `callHostSync` 调用 `connection.callSync`。没有同步路径时 `*Sync` API 抛错，不回退到快照
- `network.request` / `network.type` / `battery.get`：浏览器 fetch / navigator
- `toast.show` / `ui.*` / `share.menu`：宿主 overlay 或平台壳
- `login` / `getUserProfile`：浏览器 stub，不接真实账号体系

`system.info` 由宿主返回实时系统信息（HostCore 不再缓存快照）。
:::

:::card{tag="service" tone="violet" title="apiHost：宿主编排 API 表"}
内核不内置任何 `wx.*`。宿主入口创建 connection，拼出 `ApiContext`，用 `createApiHost(context, extensions)` 拿标准表并叠加设备事实，再把表交给 `ServiceThreadOptions.apiHost`：

- `getMenuButtonBoundingClientRect`
- `getPerformance`（now/mark/measure/observer）
- 其他依赖设备或宿主壳的同步 API

测试宿主和 devtool 各有一份 `apiExtensions`，`bootServiceEntry` 负责把它们合并到默认表之上；iOS 在 `startTinyService` 里直接组装。
:::
::::

::::split
:::card{tag="renderer" title="TreeRenderer"}
render 线程的核心注入：`mountPage`、模板/组件定义、页面数据与身份 hints、事件 sink、query、measure、inspectTree、observeIntersection 和动画。Web 实现是 `createGlassRenderTree`；独立 custom tabBar 仍通过 `mountTabBar` / `applyTabBarPatches` 注入。
:::

:::card{tag="canvas" title="ServiceCanvasAdapter"}
api 通过 `createLegacyCanvasContext` / `acquireCanvasNode` 拿到同步 canvas 句柄；页面销毁时 runtime 调 `onPageRelease`，宿主再释放该页 canvas 节点。浏览器实现把 render iframe 的 OffscreenCanvas 经 postMessage handoff 给 service；iOS 没有 OffscreenCanvas，service 拿到的是命令录制代理，绘制指令经原生命中继回到每页 WKWebView 的真实 `<canvas>`；`measureText` 由原生 CoreText 同步返回。
:::

:::card{tag="资源" title="resolveAssetUrl"}
宿主把 app-root 资源映射成 URL；api 侧签名是 `(assetPath, { sourcePath })`，Web 渲染树用 `(src, sourcePath)`。api 用于 canvas image，render tree 用于内置组件图片。WXSS 的 `url()` 会先由编译器归一化成 app-root 路径，再由这个 resolver 映射；inline style 由 WebView 自己解析，不经过 resolver。
:::
::::

| 问题 | 应该放在哪里 | 原因 |
| --- | --- | --- |
| 菜单按钮位置随设备变化 | `apiHost` 里的 `apiExtensions` | service 需要同步调用，属于宿主信息 |
| 页面跳转要同时改两个线程 | HostCore 导航控制 | 只有宿主同时持有两侧连接 |
| storage 需要持久化 | 平台 `storage.*` handler | 真实存储由宿主管理 |
| canvas 2D / WebGL / RAF | ServiceCanvasAdapter + OffscreenCanvas handoff | 内核不能依赖 document / Image |
| 真实组件、布局和 DOM | `TreeRenderer` | 渲染树归宿主所有 |
| selector query / IntersectionObserver | 渲染树的 query / observeIntersection | 内核不能依赖 Element / IntersectionObserver |
| 内置组件图片 | `resolveAssetUrl` | 只有宿主知道静态资源的 URL 规则；WXSS `url()` 编译期归一化后同样走这个 resolver |

:::callout{title="仓库里已经定下的规则"}
API 表由宿主入口组装后以值的形式传给 `ServiceThreadOptions.apiHost`（标准集在 `@tiny/api`），宿主事实作为覆盖层；canvas 和 `resolveAssetUrl` 只进入 api context，同步调用由宿主注入的全局句柄的 `sendSync` 提供，页面销毁时由 `onPageRelease` 回收 canvas 资源；渲染树通过 `TreeRenderer` 注入。不要再把这些能力放回 `packages/runtime`。
:::

## @tiny/host-web 负责什么 {#browser kicker="Web 宿主"}

它把 iframe/WebView 线程入口、端口转移、DOM 渲染树、DOM canvas、资源 URL 和页面生命周期桥收在一个包里。宿主 API handler 不在这里。

:::::split
::::stack
:::card{title="它负责"}
- 创建 MessageChannel 和 service/render iframe
- service iframe 隐藏，render iframe 可见
- 等待 ready 消息，最多 15 秒
- 把 port2 转移给线程，提供 `WasmBrowserHost` 驱动 wasm HostCore
- 完成 service 和每页 render 连接的握手
- 提供 DOM 渲染树、canvas 和资源 URL 的适配器
- 暴露当前页（`activePage`）、命令入口和 `dispose` 清理
:::

:::card{title="它不负责" tone="warn"}
- 加载编译产物或编译 manifest
- 调用 service/render bootstrap
- 提供业务渲染后端或挂载点
- 管理多应用会话、诊断展示或调试界面
- 实现 network/clipboard/toast/modal 等宿主 API，或替代 `apps/devtool/src/runtimeClient.ts` 的会话策略
:::
::::

::::stack
:::card{tag="tests/host" title="无界面多应用宿主"}
Vite 提供三个入口：`index.html` 宿主、`service.html` 和 `render.html`。宿主读取 `generated/apps.json`，用 `?app=<id>` 选择 fixture（缺省取清单第一项），把页面挂到 `#app`，并暴露 `window.__tinyRuntime` 给 Playwright。

service 入口使用 `bootServiceEntry` 加载 templates/styles 和 service bundle；render 入口调用 `bootRenderEntry({ container, loadTemplates, resolveAssetUrl })`，由它安装 OffscreenCanvas responder、内置样式，等端口并创建 Web 渲染树和内置组件。
:::

:::card{tag="静态资源" title="产物怎么到线程里"}
manifest 由宿主在运行时 fetch；templates.js 和 service.js 由线程入口动态导入；styles 通过 `fetch('/generated/apps/<id>/generated/...')` 取文本后交给 `loadStyle`；资源通过同一前缀提供。`?app=` 会随 `service.html` / `render.html` 的 URL 传给两个线程，三个文档才不会读到不同的 fixture。

宿主需要能按 manifest 里的相对路径提供静态文件。
:::
::::
:::::

```text
service.html
  |-- bootServiceEntry({
        manifest, initialPath,
        loadTemplates: () => import('/generated/apps/<id>/generated/templates.js'),
        loadArtifacts: () => import('/generated/apps/<id>/generated/service.js'),
        loadStyle, resolveAssetUrl, apiExtensions,
      })

render.html
  +-- bootRenderEntry({
        container: document.getElementById('app'),
        loadTemplates: () => import('/generated/apps/<id>/generated/templates.js'),
        resolveAssetUrl,
      })
```


## devtool 在宿主之上加了控制界面 {#devtool kicker="调试器宿主"}

React/Redux 不直接发送协议消息，只调用 devtool 应用自己的 `DevtoolRuntimeClient`（`apps/devtool/src/runtimeClient.ts`），并订阅它投影出来的状态；它驱动的是 `@tiny/host-web` 提供的宿主。

| DevtoolRuntimeClient 方法 | 底层动作 | 状态变化 |
| --- | --- | --- |
| `launch()` | 创建容器（如果没提供）→ `WasmBrowserHost.launch()` → 等首屏 flow → inspectTree | connecting → running / error |
| `terminate()` | 发送 HostCore `close` 命令 → `dispose()` → 移除自有容器 | terminated |
| `reload()` | terminate → idle → launch | running |
| `navigate(url)` | 发送 HostCore `navigateTo` 命令，再 inspectTree | pageStack 由 RUNTIME_STATE 更新 |
| `tapTab(index)` | 发送 HostCore `switchTab` 命令 | tabBar 和当前页面更新 |
| `back(delta)` | 发送 HostCore `navigateBack` 命令，再 inspectTree | pageStack 收缩 |
| `foreground()` / `background()` | 发送 `setPageVisible` 命令 | 应用可见性变化 |
| `resize(width, height)` | 发送 HostCore `resize` 命令 | 页面 onResize / 系统信息更新 |
| `inspectTree()` | `render.control runtime.inspectTree` | 元素树更新 |

::::split
:::card{title="面板和宿主壳"}
- `RuntimePanel`：读取 `./runtime/apps.json`，管理应用列表和最多 3 个应用会话
- `PreviewStage`：iPhone X 375×812 设备框、自动缩放、宿主导航栏和 tabBar
- `DevtoolToolbar`：当前应用、页面栈和上限、导航、Reload/Close app
- `DebugPanel`：Console 诊断和 Elements 元素树
:::

:::card{title="多应用和生命周期" tone="violet"}
脚本会扫描 `tests/apps/*`，把产物放到 `./runtime/apps/<app>/generated`，并生成 `apps.json`。应用列表页按需启动应用，最多保活最近 3 个；每个应用有自己的 client、页面栈和 render 帧。

在线版本是同一份构建：[#/debugger](#/debugger) 通过同源 iframe 嵌入。
:::
::::

:::callout{title="为什么用 new Function import"}
devtool 的 service/render 入口用 `new Function('url', 'return import(url)')` 加载生成产物，避免打包器把动态 import 改写成自己的模块系统。这只是打包器适配，不是协议要求。
:::

## 几种宿主形态 {#matrix kicker="宿主对比"}

区别不在 runtime，而在谁提供环境、谁负责控制界面。

| 宿主 | 线程容器 | 渲染后端 | canvas / 资源 | 控制方式 |
| --- | --- | --- | --- | --- |
| tests/host | 1 个 service + 每页 1 个 render iframe（Vite） | `createGlassRenderTree` | OffscreenCanvas handoff + /generated 资源 | URL ?path + window.__tinyRuntime |
| apps/devtool | 1 个 service + 每页一个 render iframe（Vite） | `createGlassRenderTree` | OffscreenCanvas handoff + 相对 URL | DevtoolRuntimeClient + React/Redux |
| runtime 单测 | 同进程 | headless TreeRenderer | 无 canvas，manifest 内联 | 直接持有 BridgeConnection |
| iOS 宿主（ios + hosts/ios） | JavaScriptCore service + 每页一个 WKWebView（`render.html`，无 iframe） | `createGlassRenderTree`（native surface） | UserDefaults 存储；Canvas 2D 走 service 录制 + native render 回放，WebGL 未接 | SwiftUI Launcher / 原生导航栏 + tabBar / UniFFI HostCore |

::::split
:::card{title="共享的部分"}
- manifest 和 naming 约定
- Bridge 消息和 HostCore 状态机
- service/render 线程参数
- bootstrap 顺序和 page.ready
- 平台 handler 的调用契约
:::

:::card{title="各自实现的部分"}
- Transport 和线程容器
- 渲染后端和挂载方式
- canvas 实现
- 样式、模板和资源加载策略
- 控制界面和 UI
:::
::::

## 接入一个新宿主需要做什么 {#new-host kicker="接入步骤"}

按顺序完成这些步骤，才能算真正跑通 Tiny。

:::sequence
| title | detail | code |
| --- | --- | --- |
| 加载并校验 manifest | 读取 schemaVersion=2、runtimeCompatibility 和产物路径。不要自己复制一份产物类型。 | |
| 创建 Transport | service 一条，每页 render 各一条；帧边界、非空 messages 和 JSON 安全由 Bridge 兜底，但传输必须保序。 | |
| 实现渲染树 | 实现 `TreeRenderer`：`mountPage`、模板/组件定义、页面数据与身份 hints、事件 sink、query、measure、inspectTree、observeIntersection 和动画；Web 侧可直接用 `createGlassRenderTree`。 | |
| 启动线程并等待连接装好 | service 安装兼容全局、loadTemplates 和 loadArtifacts；render 创建 TreeRenderer 并加载模板；宿主拿到 port 后创建 connection 再握手，用 ready 或同步点避免丢帧。 | |
| 提供宿主信息 | 具体宿主提供 systemInfo/storage 的异步 handler 与同步 `syncApiHandlers`；入口注入 `__TINY_HOST_BRIDGE__`（含 `sendSync`）并 `connectHostBridge`，拼出 `ApiContext`（canvas、资源、晚绑定页面访问器），交给 `createApiHost` 组装；`runtime.bootstrap` 不再传快照。设备事实用 apiExtensions 覆盖，网络请求等跨线程 API 走平台 handler。 | |
| 实现导航和 tree.ready | navigate.to/back/redirectTo/reLaunch/switchTab 必须由宿主先调用 service、再创建/激活 render root；render bootstrap 后发 tree.ready，service 发送 tree.flow，最后 page.ready。 | |
| 接入诊断和控制 | 收集 diagnostic.*；按需暴露 inspectTree、page.show/hide 和关闭方法。 | |
| 定义关闭语义 | HostCore `close` 销毁页面 surface 并关闭 Bridge；平台适配器再清理 WebView/iframe、容器和其他资源。 | |
| 跑真实测试小程序 | 至少覆盖 demo、mini、Taro 3 中的一条；否则只能证明“能启动”，不能证明“能跑应用”。 | |
| 跑内核约束检查 | 确认新宿主没有把浏览器或平台依赖反向塞回 packages/runtime。 | pnpm check:runtime-purity |
:::

:::callout{title="iOS 宿主已落地" tone="warn"}
原生工程在 `ios/`，前端标准包在 `hosts/ios`（`src/service` + `src/web`）；`HostCoreRuntime` 通过 UniFFI 驱动 Rust HostCore，JSCore 跑 service，每页一个独立 render WKWebView，没有 host.html/iframe/JS fallback。render WKWebView 与 browser/devtool 一样走 pageframe WXML；全部 9 个 fixture 已在模拟器 smoke，并覆盖 native 导航/tab 切换。Canvas 2D 由 service 侧录制、native render 回放，`measureText` 走原生 CoreText；WebGL 和同步读回仍未接。细节见 `ios/README.md`。
:::

## 当前宿主实现的已知问题 {#risks kicker="风险"}

这些是生产化之前需要知道的事实，不是设计目标。

::::cards
:::card{tag="origin" tone="warn" title="postMessage 使用 '*'"}
宿主转移端口、线程发送 ready 时都使用 `'*'` 作为 targetOrigin；线程侧也没有校验 origin。当前默认是同源静态部署。
:::

:::card{tag="sandbox" tone="warn" title="iframe 没有 sandbox"}
service iframe 只是视觉上隐藏，没有 sandbox 属性，仍然可以访问同源 DOM。隔离依赖同源部署和约定，不是浏览器安全边界。
:::

:::card{tag="close" tone="warn" title="关闭连接不等于执行页面卸载"}
`HostCore.close()` 会销毁所有页面 surface 并关闭 Bridge，但不会补发小程序的 `onUnload`。需要业务级卸载时，由平台适配器在关闭前显式处理。
:::

:::card{tag="flow" title="增量统一走 patch"}
首屏用 define/tree/ready 对齐组件树（身份快照作为嵌套树发送，元素不带 id）；pageframe 从模板挂载页面并本地 diff。custom tabBar 通过可选 `tabRoot` 挂载，后续更新走 `tabPatches`。
:::

:::card{tag="event" tone="warn" title="target 语义仍是近似"}
`tree.event` 已带 `target` / `currentTarget` 的 offset 几何，但两者目前都解析到绑定 handler 的节点；嵌套元素的 `event.target` 和微信仍有差别。
:::

:::card{tag="capability" tone="warn" title="没有能力协商"}
握手会携带 capabilities，但宿主没有注入，也没有降级逻辑。不同宿主的能力差异只能靠代码分支和诊断暴露。
:::

:::card{tag="reload" tone="warn" title="没有热更新"}
产物变化后必须重新 reload 或 launch，没有 HMR，也没有协议级的 artifact reload。devtool 的 Reload 会重建整个 iframe 运行时。
:::

:::card{tag="subpackage" tone="warn" title="没有子包按需加载"}
service bundle 包含所有页面脚本，子包只是 manifest 里的路径；宿主不能按子包延迟下载或执行。
:::
::::

:::callout{title="继续阅读"}
看测试怎么覆盖这些宿主：[测试与验收](#/testing)； 看问题对应的计划：[现状](#/status)。
:::
