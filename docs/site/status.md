---
title: '核心已经跑通，'
highlight: '兼容性还在补齐'
eyebrow: '现状'
lede: >-
  内核已经和宿主解耦，双侧树、组件语义、样式隔离、tabBar、多应用调试器都已就位；接下来主要是补宿主 API、组件覆盖、页面形态、原生渲染树和性能基线。下面的判断都按当前代码和测试来，不按计划来。
pills:
  - ['内核不依赖宿主', 'good']
  - ['组件语义', 'good']
  - ['双侧树', 'good']
  - ['样式隔离', 'good']
  - ['浏览器 + iOS 宿主', 'good']
  - ['generics 已接', 'good']
  - ['API 覆盖有限', 'warn']
  - ['性能未量化', 'warn']
description: 'Tiny 小程序引擎的现状：已跑通的能力、主要缺口、宿主缺口、下一步和设计约束。'
name: '现状'
pageTitle: '现状 · Tiny 小程序引擎'
order: 9
---

## 逐项看现在做到哪一步 {#maturity kicker="成熟度"}

“可用”表示有自动化测试、能在真实测试小程序里跑起来，并不代表和微信语义完全一致。

| 领域 | 状态 | 当前情况和边界 |
| --- | --- | --- |
| 编译核心 | :pill[可用]{tone="good"} | 支持 pages、components、subPackages 元数据、可配置文件/指令/API 约定、WXML/WXSS/WXS、manifest、service bundle、资源复制和 source map；支持从 `node_modules` 构建 `miniprogram_npm`、校验项目/小程序配置、可选 TS 语义检查、分包 service chunk 拆分与共享 `chunks/`、`preloadRule` 归一化、`componentPlaceholder` 编译校验，以及 `theme.json` / `@变量` / WXSS 主题变量注入，独立分包的依赖校验；目前只有全量构建，预下载策略还未接。 |
| WXS | :pill[可用]{tone="good"} | 编译期 AST 转换、模块表、service/render 表达式 runtime、动态 WXS/service 解析、descriptor、change:prop 和 rpx 750；模块状态按 page tree 隔离并在卸载时释放，页面模板、组件模板和同页组件实例共享当前页 runtime；微信 3.17.5 自动化对照已确认页级边界，尚未纳入自动验收。 |
| service runtime | :pill[可用]{tone="good"} | App/Page/Component、页面栈、5 个路由 API、14 项页面生命周期、7 项应用生命周期、setData、兼容全局与 behavior scheme、behaviors/observers/relations/definitionFilter/pureDataPattern、glass-easel 逻辑树、virtual node diff、tree 协议、storage/system/canvas 协议；分包在启动/导航前按需加载，页面级 `preloadRule` 会预取后续包，独立分包入口跳过主包 App 且不加载主包 `app.wxss`，跨包共享模块经 `chunks/` 保持单实例。 |
| render tree | :pill[可用]{tone="good"} | 宿主 `TreeRenderer`：真实内置组件、组件模板求值（shadow tree）、slot、shadow root、样式、布局、DOM、元素树、query、measure、IntersectionObserver；Web 实现是 `createGlassRenderTree`。元素由渲染侧分配本地 id，组件作用域 locator 负责跨线程寻址。 |
| bridge | :pill[可用]{tone="good"} | 7 个在用消息域，含 tree/query；信封和帧、纯 JS 协议/连接、全局 handle（`send`/`sendSync`/`onFrame`）、握手、超时、批处理、JSON 校验；MessagePort 实现在宿主胶水；capabilities 还没有用于协商。 |
| Web 宿主 | :pill[可用]{tone="good"} | @tiny/host-web 支持每页 render 连接、MessageChannel、DOM 渲染树、WebView render entry、OffscreenCanvas handoff 和 resolveAssetUrl；@tiny/host-web-components 只提供 39 个内置组件定义和默认样式；宿主 API handler 由 tests/host 和 devtool 各自注入；devtool 的会话客户端在应用内（`apps/devtool/src/runtimeClient.ts`）。内核依赖检查通过。 |
| iOS 宿主 | :pill[可用（MVP）]{tone="good"} | `ios/` 原生工程 + `hosts/ios` Vite 包（`src/service` / `src/web`）：Rust `HostCoreRuntime`（UniFFI）+ JavaScriptCore service + 每页一个 WKWebView；没有 `host.html`、iframe 或 JS host fallback。SwiftUI Launcher/导航栏/tabBar，UserDefaults 存储，全部 7 个 fixture 已在模拟器 smoke，并覆盖 native 导航/tab 切换、push/pop 动画和左边缘右滑返回；真机 device build/install 也已跑通；Canvas 2D 走 service 录制 + native render 回放，WebGL/同步读回未接。 |
| 内置组件 | :pill[较完整]{tone="good"} | 39 个组件和共享 behaviors；checkbox/radio/switch/slider/icon/image/picker 已按 2.33.0 参考重写；rich-text/match-media/cover-view/cover-image/page-container/root-portal/grid-view 已完成第一版；input/textarea/scroll-view/swiper 仍是近似实现；全部 39 个标签已注册；video/map/audio/web-view 是浏览器近似实现；editor/editor-portal、广告、直播、开放能力等 20 个组件暂不支持。 |
| API | :pill[部分]{tone="warn"} | request、同步/异步 storage、5 个路由 API、system、toast/modal/loading/actionSheet（由 app 注入的宿主 handler 提供 overlay）、clipboard/vibrate、network/battery、canvas、selector query 和 IntersectionObserver 已有；媒体、真实文件系统、位置、WebSocket 和真实账号授权还没有。 |
| 页面能力 | :pill[部分]{tone="warn"} | 14 项页面生命周期、5 个路由 API、内置 tabBar/switchTab、页面滚动/触底/下拉刷新、分享回调和退出状态已经支持；导航栏运行时标题/颜色/loading 已接；devtool 分享面板可触发分享回调，navigateTo/navigateBack 有转场；下拉刷新按 `enablePullDownRefresh` 启用并由宿主指示器呈现，Reload/整页刷新可恢复页面栈、data 和首屏 `this.exitState`；`tabBar.custom` 通过独立页级 `tabRoot` 和 `getTabBar()` 支持。 |
| 组件语义 | :pill[核心可用]{tone="good"} | Behaviors、observers、relations、selectComponent、component-export、component-as-page、generics（含页面级 `generic:x`）、definitionFilter、pureDataPattern 已实现；语义运行在 service 逻辑树，组件模板在 service 与 render 两侧各自求值。componentPlaceholder 已做编译校验、占位渲染和异步替换；trait behaviors 和 chaining API 未实现。 |
| 样式系统 | :pill[核心可用]{tone="good"} | class/tag 作用域、rpx、@import、styleIsolation/addGlobalClass、externalClasses、shared CSS、`:host` 与 low-priority 输出已支持；内置组件内部样式使用独立宿主 scope；`theme.json` 变量会注入为 `:root` CSS 变量，暗色走 `prefers-color-scheme`。 |
| Canvas | :pill[部分]{tone="warn"} | 浏览器走 OffscreenCanvas handoff；iOS 用 service 侧录制 + render `<canvas>` 回放，legacy 与 2D node 都可用，`measureText` 走 CoreText 同步桥；WebGL、`getImageData`、`canvasToTempFilePath` 仍未接。 |
| 动画 | :pill[部分]{tone="warn"} | `this.animate` / `clearAnimate` 走 `tree.animate`，Web 宿主用 Web Animations API 播放，支持多 step 和 scroll-driven 时序；`wx.createAnimation` 仍只生成最终态 CSS transition，没有多 step 时序和事件回调。 |
| 诊断 | :pill[可用]{tone="good"} | 编译、transport、service、render、host 五类诊断统一收集；组件语义新增了 observer、relation、behavior 相关诊断。 |
| Devtool | :pill[运行时级+]{tone="good"} | 应用列表、点击启动、最近 3 个应用保活、返回列表、设备框、宿主导航和 tabBar、每页 render 帧、Console/Lifecycle/Elements、Reload/Close app；Reload 会保存并恢复页面栈、data、savedExitState/exitState，整页刷新会合并最新快照；页面栈默认上限 10，宿主可配置。它仍不是完整的微信开发者工具。 |
| 性能与稳定 | :pill[未量化]{tone="warn"} | 启动、首屏、setData、内存和长时运行都没有基准，也没有压力测试。 |
| 测试 | :pill[核心链路]{tone="good"} | 526 个单元测试、74 个浏览器步骤、7 个测试小程序，以及 iOS 宿主 7 个 fixture 的模拟器 smoke；tree flow/patch、两次求值、locator 寻址、WXS 都有单元和浏览器覆盖，参考协议的细节仍有缺口。 |

## 现在最影响使用的问题 {#gaps kicker="主要缺口"}

按影响面排序：先解决常见小程序能不能跑，再考虑体验和更多宿主。

::::cards
:::card{tag="API" tone="warn" title="宿主 API 还不够全"}
还缺 upload/download、真实登录/账号、媒体、文件系统、位置和 WebSocket。storage 已由宿主持久化，浏览器宿主已接 toast/modal/loading/actionSheet；selector query、`wx.createIntersectionObserver` 和页面/组件级 `this.*` 入口都已接通。

未实现的 API 会返回 undefined 并产生 UNSUPPORTED_API 警告，不会直接抛错。
:::

:::card{tag="组件" tone="warn" title="组件库不完整"}
39 个标签已注册；video/map/audio/web-view 仍是浏览器近似，editor、广告、直播、开放能力等约 20 个组件未实现，已有组件的 open-type 真实能力、表单提交和无障碍也没有完全覆盖。
:::

:::card{tag="页面" tone="warn" title="页面能力有限"}
下拉刷新、分享回调、子包按需加载、`preloadRule` 和独立分包入口已接，devtool 已有分享面板、页面转场、下拉刷新指示器、页面栈/data/exitState 恢复和独立 tabBar root；跨会话冷启动的退出状态持久化和预下载策略还缺。
:::

:::card{tag="组件语义" tone="warn" title="高级组件能力仍有缺口"}
generics（含页面级覆盖）、definitionFilter、pureDataPattern、6 个 `wx://` behavior（service 侧占位 marker，表单按钮/label 语义在渲染侧）已实现；componentPlaceholder 已做编译校验、manifest 映射、占位渲染和分包到达后的自动替换；trait behaviors / chaining API 和其余 `wx://` behavior 仍未实现。
:::

:::card{tag="tree" title="增量统一走 patch"}
首屏用 define/tree/ready 对齐组件树（快照作为嵌套树发送，元素不带 id）；后续更新由 snapshot diff 生成 tree.patch，组件按共享 id、元素按 `owner#index.path` locator 寻址，覆盖文本、属性、插入/删除/重排。
:::

:::card{tag="Canvas" tone="warn" title="canvas 边缘能力未覆盖"}
浏览器有 OffscreenCanvas handoff，iOS 已接 Canvas 2D（legacy + 2D node）并跑通 mini ECharts；WebGL、canvasToTempFilePath、createOffscreenCanvas 和 node 事件还没有端到端覆盖。
:::

:::card{tag="动画" tone="warn" title="两套 animation API 的缺口"}
`this.animate` / `clearAnimate` 已走 Web Animations API，支持多 step 和 scroll-driven 时序；`wx.createAnimation` 仍只映射最终态 CSS transform/transition，多 step 时序和事件回调还没有还原。
:::

:::card{tag="原生" tone="warn" title="原生渲染树只有契约"}
`createNativeTreeRenderer` 有契约和 headless 测试；iOS 宿主没有采用它，而是用 WKWebView 渲染。native `TreeRenderer` 仍只有契约，原生渲染后端还要实现 canvas handoff、query、measure 和 IntersectionObserver。
:::

:::card{tag="性能" tone="warn" title="没有性能基线"}
启动、首屏、setData 的数量和体积、导航耗时、大列表内存和长时运行都没有测量，也没有回归门槛。
:::
::::

## 宿主层还缺什么 {#host-gaps kicker="宿主缺口"}

内核已经可以跨宿主，浏览器和 iOS 两条链路都已跑通；iOS 还缺 WebGL、调试面板和更完整的原生 API。

:::::split
::::stack
:::card{tag="原生" tone="warn" title="iOS 宿主还有缺口"}
JSCore + native WKWebView 的 Transport、页面 surface、原生 chrome、UserDefaults 和 Canvas 2D 已经跑通；还缺 toast/network 等原生 host API、WebGL、调试面板，以及真机自动化 smoke。
:::

:::card{tag="部署" tone="warn" title="部署假设还没有建模"}
iframe 没有 sandbox；转移端口和发送 ready 时使用 targetOrigin `'*'`；线程侧也没有校验 origin。当前默认同源静态部署。
:::

:::card{tag="关闭" tone="warn" title="关闭连接不会补发页面卸载"}
HostCore 的 `close` 会销毁页面 surface 并关闭 Bridge，但不会补发小程序 `onUnload`；需要业务级卸载时，平台适配器要在关闭前显式处理。
:::
::::

::::stack
:::card{tag="能力" tone="warn" title="没有能力协商"}
握手会带 capabilities，但宿主没有注入，也没有降级逻辑。不同宿主的能力差异只能靠 API 表组装和诊断暴露。
:::

:::card{tag="更新" tone="warn" title="没有热更新"}
产物变化后必须重启或 reload，协议里没有 artifact reload。devtool 的 Reload 会重建整个 iframe 运行时。
:::

:::card{tag="加载" tone="warn" title="没有子包预下载策略"}
按需加载和页面级 `preloadRule` 已经接通：分包页面和独占组件进入 `service.<pkg>.js`，启动/导航前由宿主加载，`wifi` 规则需宿主提供网络事实；按网络/时机的预下载策略和独立分包运行时还没有。
:::

:::card{tag="恢复" tone="warn" title="页面恢复仍以 devtool 为主"}
navigateBack 和 switchTab 会复用页面 surface，DOM、滚动位置和定时器可以保留；devtool 的 Reload/整页刷新已能恢复页面栈、data 和 `this.exitState`。跨浏览器会话或原生冷启动时的状态落盘仍由具体宿主决定，通用 `host-web` 还没有统一策略。
:::
::::
:::::

## 接下来先做什么 {#roadmap kicker="下一步"}

先把常见小程序需要的 API 和组件补上，再处理页面、组件和宿主约定，最后做性能和原生形态。

::::stack
:::card{tag="P0" title="补齐宿主 API"}
upload/download、真实登录/账号、媒体、文件系统、位置和 WebSocket；同时把 unsupported API 从“静默返回 undefined”变成可查询的能力清单和明确诊断。
:::

:::card{tag="P0" title="补常用组件"}
把 video/map/audio/web-view 从浏览器近似提升到可用实现，补 editor、广告、直播、开放能力等未支持组件，并完善已有组件的 open-type、表单、颜色和焦点语义。
:::

:::card{tag="P1" title="对齐事件目标语义"}
tree.event 已带 `target` / `currentTarget` 的 offset 几何，但两者目前都解析到绑定 handler 的节点；嵌套元素的 `event.target` 语义还需要对齐。
:::

:::card{tag="P0" title="宿主加固"}
明确 close 和 dispose 的语义，评估 origin 校验和 sandbox，补齐或删除 capability 字段。
:::

:::card{tag="P1" title="页面能力"}
Web 端预下载策略 / 独立分包，以及 Skyline 风格的宿主级 tabBar 单例语义。
:::

:::card{tag="P1" title="组件高级语义"}
trait behaviors / chaining API、宿主侧内置 behaviors，以及 relations 的边界情况和组件 export 校验。
:::

:::card{tag="P1" title="Canvas 和动画"}
canvasToTempFilePath、wx.createOffscreenCanvas、canvas node 事件；`wx.createAnimation` 的多 step 时序和事件回调。
:::

:::card{tag="P2" title="性能和稳定性"}
启动耗时、首屏、setData 批量和差量、导航耗时、大列表内存、长时运行，把阈值接进验收。
:::

:::card{tag="P2" title="更多宿主能力和渲染后端"}
iOS 宿主补 WebGL、原生 API 和真机自动化；再评估 native `TreeRenderer` 与更多渲染后端。
:::

:::card{tag="已完成" title="HostCore 统一宿主编排"}
`HostCoreRuntime` 通过 UniFFI 驱动 Rust HostCore，页面栈、render surface 和 UIState 都在 Swift 侧；每页一个 render WKWebView。
:::

::::

## 这些约束不能破 {#invariants kicker="设计约束"}

路线可以调整，但下面的约束一旦破了，现有宿主和测试会一起失效。

::::cards
:::card{title="内核不负责环境"}
`packages/runtime` 不碰 window、document、iframe 或 MessageChannel；`pnpm check:runtime-purity` 是硬门槛。
:::

:::card{title="宿主适配器在核心之外"}
iframe、DOM canvas、DOM 渲染树和 WebView 线程入口放在 `hosts/web`，内置组件放在 `hosts/web-components`，宿主 API handler 由 `tests/host` / `apps/devtool` 注入；调试器的会话与界面属于 `apps/devtool`。核心包不能反向依赖 hosts。
:::

:::card{title="所有宿主共用一个 manifest"}
编译器、runtime、宿主和 devtool 都读 `@tiny/manifest`，包括 runtimeCompatibility 和固定 Tiny 命名常量。不要复制一份产物类型。
:::

:::card{title="输入与内部命名分离"}
扩展名、指令、API、注册全局和 behavior scheme 来自 compatibility；Tiny 宿主、scope、marker 和内部 behavior 只来自 `TINY_ENGINE_NAMING`。
:::

:::card{title="跨线程只走 Bridge"}
不直接读 iframe 全局，也不使用 executeJavaScript；所有控制都走版本化消息。
:::

:::card{title="环境能力靠注入"}
宿主入口组装 API 表（标准集来自 @tiny/api，设备信息在其上覆盖），canvas 和资源 URL 进入 api context，同步调用由宿主注入的全局句柄的 `sendSync` 提供，渲染后端和挂载点由宿主提供。
:::

:::card{title="构建产物不入库"}
宿主产物、组件 ProcGen、devtool 静态文件和站点里的 devtool 都由构建生成；仓库只保留源码、约定和测试 fixture。
:::

:::card{title="两棵树不互相越界"}
service 不创建真实 DOM、不加载 Web 内置组件；render 不执行 app methods、observer 或 relations。组件 id 由 service 分配，元素 id 由渲染侧本地分配，跨线程寻址用 locator。
:::

:::card{title="验收必须跑真实应用"}
核心链路要用真实双线程、tree flow/patch 和浏览器操作验证，不能只靠 mock 通过。
:::
::::

## 按依赖顺序继续看 {#next kicker="继续阅读"}

如果要改代码，建议先看边界，再看产物，最后看运行和宿主。

::::cards{layout="three"}
:::card{tag="架构" title="先看整体边界"}
各层职责、内核约束、启动流程和消息转发。

[架构总览 →](#/architecture)
:::

:::card{tag="编译" title="再看产物"}
WXML、WXSS、TS 和命名配置如何变成 manifest。

[编译流程 →](#/compiler)
:::

:::card{tag="运行时" title="然后看执行"}
双线程、组件语义、样式隔离和 canvas 注入。

[运行时内核 →](#/runtime)
:::

:::card{tag="协议" title="协议是通信边界"}
消息格式、错误处理和扩展规则。

[Bridge 协议 →](#/protocol)
:::

:::card{tag="宿主" title="宿主负责接入环境"}
host-web、host-web-components、注入能力和接入步骤。

[宿主适配 →](#/hosts)
:::

:::card{tag="测试" title="以测试为准"}
526 个单元测试和 74 个浏览器步骤；WXS 专项覆盖事件、descriptor、change:prop、动态切换和双页模块状态隔离（页面/组件模板均按页）。iOS 宿主另有 `pnpm ios:sim`，逐 fixture 跑真实 WKWebView + JSCore。

[测试与验收 →](#/testing)
:::
::::

:::callout{title="仓库"}
[github.com/YufJi/tiny](https://github.com/YufJi/tiny) · [验收指南](https://github.com/YufJi/tiny/blob/next/docs/acceptance.md) · [架构决策记录](https://github.com/YufJi/tiny/tree/next/docs/adr)
:::
