---
title: '引擎不依赖环境，'
highlight: '运行环境由宿主提供'
eyebrow: '宿主适配'
lede: >-
  packages/runtime 是宿主无关的内核；浏览器能力放在 @tiny/host-browser，内置组件放在 @tiny/host-web-components。createTinyRuntime 只需要两条 Transport、manifest 和初始页面；createStandaloneDualThreadHost 负责创建 iframe、转移端口、等待就绪并完成握手。canvas、资源 URL、渲染后端和挂载点都通过参数注入。
stats:
  - ['2', '宿主包']
  - ['1', 'service iframe']
  - ['每页', 'render iframe']
  - ['4', '注入能力']
pills:
  - ['内核不依赖宿主', 'good']
  - ['canvas 注入', 'good']
  - ['资源解析', 'good']
  - ['在线调试器', 'good']
description: '宿主适配：宿主无关的内核如何通过 iframe 线程、canvas、资源解析和宿主 API 装配出浏览器与调试器宿主。'
name: '宿主'
pageTitle: '宿主适配 · Tiny'
order: 6
---

## 宿主分成几层 {#model kicker="宿主分层"}

把宿主当成一个包，很难看清边界。它其实由几层可替换的装配组成。

| 层 | 入口 | 环境假设 | 职责 |
| --- | --- | --- | --- |
| 内核编排 | `createTinyRuntime(options)` | 不假设有 DOM | 两个 BridgeConnection、HostApiRegistry、诊断仓库和启动顺序 |
| 线程启动 | `bootServiceThread` / `bootRenderThread` | service 需要 JS 全局；render 需要 glass-easel 后端 | 安装注册表/API、定义组件、响应消息；canvas、资源和 builtinComponents 通过参数注入 |
| 浏览器适配 | `@tiny/host-browser` | window、iframe、MessageChannel、document | iframe、端口、DOM canvas、资源 URL、DevtoolRuntimeClient |
| 内置组件 | `@tiny/host-web-components` | DOM 和 CSS | tiny-* 宿主定义、共享 behaviors、基础 CSS，通过 builtinComponents 注入 render |
| 应用宿主 | `tests/host` · `apps/devtool` | 静态资源服务器 / rspack | 选择应用、加载 manifest、提供界面或自动化钩子、调用 bootstrap |

```text
应用外壳（host.ts / devtool React）
              |
              v
@tiny/host-browser                浏览器环境适配
  createStandaloneDualThreadHost
  canvas-bridge / runtime-port
  DevtoolRuntimeClient

@tiny/host-web-components         内置组件实现
  webBuiltinComponents（定义 + 基础 CSS）
              |
              v  createTinyRuntime
createTinyRuntime                 内核编排
              |
              v  boot*Thread(transport, manifest, canvas, ...)
service iframe / render iframe

原生宿主替换的是浏览器适配层，不是 runtime 语义。
```

:::callout{title="standalone 只是其中一种入口"}
runtime 单测不使用 iframe：它通过 `createInMemoryTransportPair()` 启动两个线程，再用 `createTinyRuntime` 组装宿主。 可替换性不是口号，现有测试一直在这么做。
:::

## 内核不引用浏览器 API {#purity kicker="内核约束"}

这是宿主适配最重要的约束：内核只定义语义，环境能力全部由宿主注入。

:::::split
:::card{tag="检查脚本" title="pnpm check:runtime-purity"}
脚本会从 `packages/runtime/src/index.ts` 遍历相对 import，去掉注释后搜索宿主全局：

```text
window · document · navigator
localStorage · sessionStorage
HTMLCanvasElement · HTMLImageElement · Image
requestAnimationFrame · cancelAnimationFrame
MessageChannel · postMessage · indexedDB
XMLHttpRequest · WebSocket · fetch · performance
```

同时禁止依赖图里出现名字带 `browser` 的模块，或导入 `@tiny/host-*`。一旦违规，验收直接失败。
:::

::::stack
:::card{tag="内核" title="packages/runtime"}
导出 types、diagnostics、glass-easel-adapter、service、render 和 host。`canvas`、`resolveAssetUrl`、`backend`、`mountComponent`、`builtinComponents` 都是可选参数。
:::

:::card{tag="宿主" tone="violet" title="@tiny/host-browser"}
负责 iframe、MessageChannel、DOM canvas、资源 URL 规则和 `DevtoolRuntimeClient`；tests/host 和 devtool 都从这里导入。
:::

:::card{tag="组件" tone="violet" title="@tiny/host-web-components"}
负责 `tiny-*` 宿主定义、behaviors 和基础 CSS；tests/host 与 devtool 会在 render 入口注入 `webBuiltinComponents`。
:::

:::card{tag="结果" title="可移植性"}
原生宿主只要实现 Transport、渲染后端、canvas 适配器、资源解析和宿主 API，不需要假装自己是浏览器。
:::
::::
:::::

## 先交端口，再握手，最后启动页面 {#boot kicker="启动流程"}

浏览器宿主的启动顺序里有一个真实竞态：端口转移早于连接安装会丢消息。就绪消息就是为解决它加的。

:::sequence
| title | detail | code |
| --- | --- | --- |
| 创建 MessageChannel | 单 render 模式创建两对端口；每页 render 模式先创建 service 端口，渲染端口等到具体页面创建时再建。 | createHostMessageChannelPair() |
| 创建 iframe | service iframe 被隐藏（0×0、absolute、opacity 0）；render iframe 填满容器。每页 render 模式下，每新建一个页面就创建一个 render iframe。 | createIframe('tiny-runtime-service-frame', serviceUrl) |
| 等待线程就绪 | 宿主监听 window message，只接受类型为 tiny-runtime-port-ready、channel 匹配，并且来源是目标 iframe 的消息，最多等 15 秒。 | waitForThreadReady(iframe, 'service') |
| 转移端口 | 宿主把 port2 作为 transferable 发给对应 iframe，线程再用 createMessagePortTransport 包装成 Transport。 | postMessage({ type: 'tiny-runtime-port' }, '*', [port]) |
| 创建运行时并握手 | createTinyRuntime 用两条 hostTransport 建立连接，然后并行等待 service 和 render 的握手。 | Promise.all([service.handshake(), render.handshake()]) |
| 启动首屏 | service 返回 pageId、initialData、componentSchemas 和 pageComponents；render 注册样式和 schema、挂载页面、等组件树稳定后返回组件；宿主再把组件并入 page.ready。 | await runtime.host.bootstrap() |
:::

:::::split
::::stack
:::card{tag="竞态" title="为什么线程要先装好连接"}
如果线程在安装 connection 之前就发 ready，宿主会立刻转移端口；端口消息到达时还没有监听器，第一帧就丢了。

因此 render 入口会先导入 templates、拉取 styles，再调用 `listenForRuntimePort`；devtool 的 service 入口也会先取 manifest。
:::

:::card{tag="超时" title="15 秒固定超时"}
iframe 超过 15 秒没有发 ready 会直接 reject，不会重试。产物很大或网络很慢时，要调整宿主实现，而不是改 runtime。
:::
::::

```ts
// 宿主侧（tests/host/src/host.ts）
const runtime = await createStandaloneDualThreadHost({
  manifest,
  serviceUrl: '/service.html',
  renderUrl: '/render.html',
  initialPath: 'pages/todos/todos',
  container: document.getElementById('app'),
  systemInfo: {
    pixelRatio: devicePixelRatio,
    windowWidth: innerWidth,
    windowHeight: innerHeight,
  },
})
window.__tinyRuntime = runtime
await runtime.host.bootstrap()

// render 线程
bootRenderThread({
  transport, manifest,
  artifacts: { templates },
  backend, initialPath,
  loadStyle,
  resolveAssetUrl,
  canvas: { measure, paint },
  mountComponent, unmountComponent,
  builtinComponents: webBuiltinComponents,
})
```
:::::

## 线程只接收宿主显式传入的参数 {#threads kicker="线程参数"}

service 和 render 不读取 URL，也不读取全局 manifest，所有输入都由宿主传入。

| ServiceThreadOptions | 用途 | 是否必需 |
| --- | --- | --- |
| `transport` | 宿主连接 | 是 |
| `manifest` | 页面路径、组件、样式、运行期兼容信息和诊断 | 是 |
| `initialPath` | 首屏页面路径 | 是 |
| `loadArtifacts` | 在 bootstrap 时导入 service.js，保证 App/Page 已注册 | 实际必需 |
| `apiExtensions` | 注入设备信息和额外的同步 API | 否 |
| `canvas` | createLegacyCanvasContext / createCanvasNode | 使用 canvas API 时必需 |
| `capabilities` | 握手元数据，目前没有用于协商 | 否 |

| RenderThreadOptions | 用途 | 是否必需 |
| --- | --- | --- |
| `transport` | 宿主连接 | 是 |
| `manifest` | 页面、样式、组件产物和运行期兼容信息 | 是 |
| `artifacts.templates` | 从 render.js 导入的 groupList/content | 是 |
| `backend` | glass-easel GeneralBackendContext | 是 |
| `initialPath` / `initialData` | 首屏页面和数据；bootstrap 消息里的值优先 | initialPath 必需 |
| `loadStyle` | 按 outputPath 返回 CSS 文本 | 实际必需 |
| `resolveAssetUrl` | 把 app-root 资源路径映射成可加载 URL（模板 img / CSS url） | 使用本地资源时必需 |
| `canvas` | measure / paint 适配器 | 使用 canvas 或 SelectorQuery 时必需 |
| `builtinComponents` | 内置组件定义和基础样式 | 使用内置组件时必需 |
| `mountComponent` / `unmountComponent` | 把根组件挂到宿主节点 | 否；不传时使用 pretendAttached |
| `onDiagnostic` | 本地诊断回调；跨线程诊断仍走 Bridge | 否 |

::::split
:::card{title="service 线程还要做什么"}
- 先安装 App/Page/Component/Behavior/getApp 和命名后的 API 全局
- 再导入 service.js，让注册调用按 manifest 顺序发生
- 在 bootstrap 内 await `loadArtifacts`
- canvas API 由注入的适配器提供，内核不碰 document
:::

:::card{title="render 线程还要做什么"}
- 准备一个 glass-easel 后端实例
- 从 render.js 取出模板 group
- 按 outputPath 预加载样式文本
- 把资源路径映射到真实 URL，并能测量和绘制 canvas
- 提供确定的挂载容器
:::
::::

:::callout{title="bootstrap 消息优先于线程参数"}
render 的 bootstrap 处理器会优先使用消息里的 `manifest`、`initialPath`、`initialData`、`componentSchemas` 和 `pageComponents`；线程参数只是默认值，以及样式、模板和资源的加载来源。
:::

## 宿主可以注入四类能力 {#injections kicker="注入能力"}

跨线程 API、同步宿主信息、canvas 实现、资源 URL 各有自己的入口，放错层就会出现“内核偷偷依赖浏览器”的问题。

::::split
:::card{tag="宿主" title="apiHandlers：跨线程 API"}
注册在宿主的 `HostApiRegistry` 里，通过 `api.*` 调用由 service 使用。

- `navigate.to` / `navigate.back` / `navigate.switchTab`：宿主协调 service 和 render
- `storage.get/set`：宿主持久化
- `toast.show`：宿主 UI（目前只返回 errMsg）
- `system.info`：系统信息快照
- 文件、网络、设备等自定义 handler
:::

:::card{tag="service" tone="violet" title="apiExtensions：同步宿主信息"}
直接合并进 service 的 API host，在 service 线程执行。

- `getMenuButtonBoundingClientRect`
- `getPerformance`（now/mark/measure/observer）
- 其他依赖设备或宿主壳的同步 API

测试宿主和 devtool 各有一份实现；核心 runtime 不写死这些值。
:::
::::

::::split
:::card{tag="canvas" title="ServiceCanvasAdapter / RenderCanvasAdapter"}
service 需要 `createLegacyCanvasContext` 和 `createCanvasNode`；render 需要 `measure` 和 `paint`。浏览器实现位于 `hosts/browser/src/canvas-bridge.ts`。
:::

:::card{tag="资源" title="resolveAssetUrl + backend + mount"}
`resolveAssetUrl(assetPath, { sourcePath })` 会把 app-root 资源映射成 URL；adapter 用它重写模板 img 和 CSS `url()`。`backend` 和挂载钩子决定节点最终落在哪里。
:::
::::

| 问题 | 应该放在哪里 | 原因 |
| --- | --- | --- |
| 菜单按钮位置随设备变化 | `apiExtensions` | service 需要同步调用，属于宿主信息 |
| 页面跳转要同时改两个线程 | `apiHandlers` | 只有宿主同时持有两侧连接 |
| storage 需要持久化 | `apiHandlers` | 真实存储由宿主管理 |
| canvas 绘制和测量 | canvas 适配器 | 内核不能依赖 document / Image |
| 本地图片和 CSS 背景图 | `resolveAssetUrl` | 只有宿主知道静态资源的 URL 规则 |
| 节点挂到哪里 | backend + mountComponent | DOM 或原生树归宿主所有 |

:::callout{title="仓库里已经定下的规则"}
宿主信息通过 `ServiceThreadOptions.apiExtensions` 注入，canvas 通过 `ServiceThreadOptions.canvas` / `RenderThreadOptions.canvas` 注入。不要再把这些能力放回 `packages/runtime`。
:::

## @tiny/host-browser 负责什么 {#browser kicker="浏览器宿主"}

它把 iframe 生命周期、端口转移、DOM canvas、资源 URL 和调试器客户端收在一个包里。

:::::split
::::stack
:::card{title="它负责"}
- 创建 MessageChannel 和 iframe
- service iframe 隐藏，render iframe 可见
- 等待 ready 消息，最多 15 秒
- 转移 port2，创建 createTinyRuntime
- 完成两条连接的握手
- 提供 canvas、资源和 devtool client 适配器
- 返回 host 和 iframe 句柄，并提供清理方法
:::

:::card{title="它不负责" tone="warn"}
- 加载 manifest 或编译产物
- 调用 bootstrap
- 提供业务渲染后端或挂载点
- 注入 systemInfo、storage 或 apiExtensions
- 管理多应用、诊断展示或界面
:::
::::

::::stack
:::card{tag="tests/host" title="无界面单应用宿主"}
Vite 提供三个入口：`index.html` 宿主、`service.html` 和 `render.html`。宿主把页面挂到 `#app`，并暴露 `window.__tinyRuntime` 给 Playwright。

service 入口注入菜单按钮、performance 和 canvas；render 入口使用 `CurrentWindowBackendContext`，提供资源解析、canvas 测量/绘制和挂载钩子。
:::

:::card{tag="静态资源" title="产物怎么到线程里"}
manifest 由打包器静态导入；render.js 动态导入；styles 通过 `fetch('/generated/...')` 取文本后交给 `loadStyle`；资源通过 `/generated/<path>` 提供。

宿主需要能按 manifest 里的相对路径提供静态文件。
:::
::::
:::::

```text
render.html
  |-- import render.js
  |-- fetch manifest + styles
  |-- new CurrentWindowBackendContext
  |-- listenForRuntimePort('render')
  +-- bootRenderThread({
        transport, manifest, artifacts, backend,
        initialPath, loadStyle, resolveAssetUrl,
        canvas: { measure: measureBrowserCanvas,
                  paint: paintBrowserCanvasFrame },
        mountComponent, unmountComponent,
        builtinComponents: webBuiltinComponents,
      })

service.html
  |-- installBrowserCanvasCompat()
  |-- listenForRuntimePort('service')
  +-- bootServiceThread({
        transport, manifest, initialPath,
        apiExtensions,
        canvas: { createLegacyCanvasContext, createCanvasNode },
        loadArtifacts: () => import(service.js),
      })
```

## devtool 在宿主之上加了控制界面 {#devtool kicker="调试器宿主"}

React/Redux 不直接发送协议消息，只调用 DevtoolRuntimeClient，并订阅它投影出来的状态。

| DevtoolRuntimeClient 方法 | 底层动作 | 状态变化 |
| --- | --- | --- |
| `launch()` | 创建容器（如果没提供）→ 启动宿主 → bootstrap → inspectTree | connecting → running / error |
| `terminate()` | 关闭连接、移除 iframe 和自有容器 | terminated |
| `reload()` | terminate → idle → launch | running |
| `navigate(url)` | 调用宿主的 `navigate.to` handler，再 inspectTree | pageStack 由 RUNTIME_STATE 更新 |
| `switchTab(index)` | 调用宿主的 `navigate.switchTab` handler | tabBar 和当前页面更新 |
| `back(delta)` | 调用宿主的 `navigate.back` handler，再 inspectTree | pageStack 收缩 |
| `foreground()` | 直接调用 `service.control page.show` | 页面生命周期变化 |
| `background()` | 直接调用 `service.control page.hide` | 页面生命周期变化 |
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
devtool 的 service/render 入口用 `new Function('url', 'return import(url)')` 加载生成产物， 避免 rspack 把动态 import 改写成自己的模块系统。这只是打包器适配，不是协议要求。
:::

## 几种宿主形态 {#matrix kicker="宿主对比"}

区别不在 runtime，而在谁提供环境、谁负责控制界面。

| 宿主 | 线程容器 | 渲染后端 | canvas / 资源 | 控制方式 |
| --- | --- | --- | --- | --- |
| tests/host | 1 个 service + 1 个 render iframe（Vite） | CurrentWindowBackendContext | host-browser canvas + /generated 资源 | URL ?path + window.__tinyRuntime |
| apps/devtool | 1 个 service + 每页一个 render iframe（rspack） | CurrentWindowBackendContext | host-browser canvas + 相对 URL | DevtoolRuntimeClient + React/Redux |
| runtime 单测 | 同进程 | EmptyBackendContext | 无 canvas，manifest 内联 | 直接持有 BridgeConnection |
| 原生宿主（未实现） | JSCore / 原生容器 + 渲染层 | 需要实现 GeneralBackendContext | 需要实现 canvas 适配器和资源解析 | 自定义控制界面 |

::::split
:::card{title="共享的部分"}
- manifest 和 naming 约定
- BridgeConnection 和消息列表
- service/render 参数
- bootstrap 顺序和 page.ready
- HostApiRegistry 的默认语义
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
| 创建两条 Transport | service 和 render 各一条；帧边界、非空 messages 和 JSON 安全由 Bridge 兜底，但传输必须保序。 | |
| 实现环境适配器 | glass-easel 后端、mount/unmount、样式和模板加载、resolveAssetUrl、canvas measure/paint，以及内置组件。 | |
| 启动线程并等待连接装好 | service 安装命名后的全局对象并 loadArtifacts；等 transport 接收端就绪后再握手，用 ready 或同步点避免丢帧。 | |
| 提供宿主信息 | systemInfo、storage 初始快照；设备相关的同步 API 走 apiExtensions，网络和文件等跨线程 API 走 apiHandlers。 | |
| 实现导航和 page.ready | navigate.to/back/switchTab 必须由宿主先调用 service、再调用 render；navigateTo 和 switchTab 要把 render 返回的组件并入 page.ready。 | |
| 接入诊断和控制 | 收集 diagnostic.*；按需暴露 inspectTree、page.show/hide 和关闭方法。 | |
| 定义关闭语义 | 关闭两条连接、释放线程、卸载页面。当前 host.close 只关连接，不自动移除 iframe；standalone 的 dispose 会负责清理。 | |
| 跑真实测试小程序 | 至少覆盖 demo、mini、Taro 3 中的一条；否则只能证明“能启动”，不能证明“能跑应用”。 | |
| 跑内核约束检查 | 确认新宿主没有把浏览器或平台依赖反向塞回 packages/runtime。 | pnpm check:runtime-purity |
:::

:::callout{title="原生宿主还没有实现" tone="warn"}
目前没有 native transport、native 渲染后端，也没有非浏览器的 service 运行时。好消息是内核已经移除了 document/Image/iframe， 原生宿主只需要提供 canvas 适配器、渲染后端、资源解析和控制界面，不必模拟浏览器。
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

:::card{tag="close" tone="warn" title="关闭连接不等于卸载页面"}
`host.close()` 只关闭连接并 reject 等待中的调用。页面 onUnload、iframe 移除和容器清理由调用方负责；standalone 宿主的 `dispose()` 会统一清理。
:::

:::card{tag="back" tone="warn" title="单 render 模式返回不补 page.ready"}
每页 render 模式会保留页面 DOM；单 render 模式返回时需要重新挂载，而且不会把 render 返回的组件快照重新发给 service。
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
