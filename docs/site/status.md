---
title: '核心已经跑通，'
highlight: '兼容性还在补齐'
eyebrow: '现状'
lede: >-
  内核已经和宿主解耦，命名配置、组件语义、样式隔离、tabBar、多应用调试器都已就位；接下来主要是补宿主 API、组件覆盖、页面能力、generics/definitionFilter、canvas 交互、原生宿主和性能基线。下面的判断都按当前代码和测试来，不按计划来。
pills:
  - ['内核不依赖宿主', 'good']
  - ['组件语义', 'good']
  - ['样式隔离', 'good']
  - ['仅浏览器宿主', 'warn']
  - ['generics 未实现', 'warn']
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
| 编译核心 | :pill[可用]{tone="good"} | 支持 pages、components、subPackages、可配置文件/指令/API 约定、WXML/WXSS/WXS、manifest、service bundle、资源复制和 source map；目前只有全量构建。 |
| service runtime | :pill[可用]{tone="good"} | App/Page/Component、页面栈、navigateTo/back/switchTab、tabBar 状态和 API、setData、兼容全局与行为 scheme、behaviors/observers/relations、逻辑组件树、storage/system/canvas 协议。 |
| render adapter | :pill[可用]{tone="good"} | glass-easel ComponentSpace、模板、作用域、styleIsolation、externalClasses、组件定义、生命周期、元素树、资源解析和 canvas 适配。 |
| bridge | :pill[可用]{tone="good"} | 信封和帧、MessagePort/内存 transport、握手、超时、批处理、JSON 校验；capabilities 还没有用于协商。 |
| 浏览器宿主 | :pill[可用]{tone="good"} | @tiny/host-browser 支持单 render 和每页 render 两种模式、MessageChannel、tabBar 宿主 UI、DOM canvas、resolveAssetUrl 和 DevtoolRuntimeClient；内核依赖检查通过。 |
| 原生宿主 | :pill[未实现]{tone="warn"} | 还没有 native transport、native 渲染后端或非浏览器 service 运行时；不过内核已经移除了 document、Image 和 iframe。 |
| 内置组件 | :pill[较完整]{tone="good"} | 23 个组件和共享 behaviors；checkbox/radio/switch/slider/icon/image/picker 已按 2.7.0 参考重写；input/textarea/scroll-view/swiper 仍是近似实现；navigator/video/rich-text/map 等还缺。 |
| API | :pill[部分]{tone="warn"} | request、异步 storage、导航/switchTab、system、toast/modal、canvas、selector query 已有；媒体、真实文件、账号、位置、WebSocket 还没有。 |
| 页面能力 | :pill[部分]{tone="warn"} | 基础生命周期、导航、内置 tabBar/switchTab、页面滚动和触底已经支持；下拉刷新、分享、页面栈恢复还在计划里。 |
| 组件语义 | :pill[核心可用]{tone="good"} | Behaviors、observers、relations、selectComponent、component-export、component-as-page 已实现；generics、placeholder、definitionFilter 未实现。 |
| 样式系统 | :pill[核心可用]{tone="good"} | class/tag 作用域、rpx、@import、styleIsolation/addGlobalClass、externalClasses、shared CSS 已支持；:host 和低优先级输出未启用。 |
| Canvas | :pill[部分]{tone="warn"} | canvas 适配器注入、50ms PNG 帧、render 测量/绘制、内置 canvas touch 已支持；没有 rAF 和完整 2D 语义。 |
| 动画 | :pill[部分]{tone="warn"} | animation 数据会编译成最终态 CSS transform/transition；没有多 step 时序和事件回调。 |
| 诊断 | :pill[可用]{tone="good"} | 编译、transport、service、render、host 五类诊断统一收集；组件语义新增了 observer、relation、behavior 相关诊断。 |
| Devtool | :pill[运行时级+]{tone="good"} | 应用列表、点击启动、最近 3 个应用保活、返回列表、设备框、宿主导航和 tabBar、每页 render 帧、Console/Lifecycle/Elements、Reload/Close app；页面栈默认上限 10，宿主可配置。它仍不是完整的微信开发者工具。 |
| 性能与稳定 | :pill[未量化]{tone="warn"} | 启动、首屏、setData、内存和长时运行都没有基准，也没有压力测试。 |
| 测试 | :pill[核心链路]{tone="good"} | 180 个单元测试、51 个浏览器步骤和 5 个测试小程序；没有性能、视觉、原生和安全测试。 |

## 现在最影响使用的问题 {#gaps kicker="主要缺口"}

按影响面排序：先解决常见小程序能不能跑，再考虑体验和更多宿主。

::::cards
:::card{tag="API" tone="warn" title="宿主 API 还不够全"}
还缺异步 storage、reLaunch/redirectTo、showModal/showLoading、登录、媒体、文件、位置、WebSocket 和 IntersectionObserver。

未实现的 API 会返回 undefined 并产生 UNSUPPORTED_API 警告，不会直接抛错。
:::

:::card{tag="组件" tone="warn" title="组件库不完整"}
还缺 navigator、video、audio、rich-text、map、movable-view 等；已有组件的 open-type 真实能力、表单提交和无障碍也没有完全覆盖。
:::

:::card{tag="页面" tone="warn" title="页面能力有限"}
没有下拉刷新、分享、页面栈恢复和自定义 tabBar；子包只验证了直接启动，没有按需加载。
:::

:::card{tag="组件语义" tone="warn" title="高级组件能力缺失"}
generics、placeholder、definitionFilter 未实现；微信内置 behavior（例如 `wx://form-field`）也不支持，目前只支持 component-export。
:::

:::card{tag="Canvas" tone="warn" title="canvas 还不是完整交互"}
目前是宿主 canvas 适配器加 PNG 帧镜像；没有 canvas rAF、完整 2D API，也没有原生触摸到 service 的完整链路。
:::

:::card{tag="动画" tone="warn" title="动画只有最终态"}
`animation` 会编译成 CSS transform/transition；多 step 时序和事件回调还没有还原。
:::

:::card{tag="导航" tone="warn" title="单 render 模式返回语义不完整"}
每页 render 模式会保留页面 DOM；单 render 模式返回时仍会重新挂载页面，不会把 render 返回的组件快照重新发给 service。
:::

:::card{tag="性能" tone="warn" title="没有性能基线"}
启动、首屏、setData 的数量和体积、导航耗时、大列表内存和长时运行都没有测量，也没有回归门槛。
:::
::::

## 宿主层还缺什么 {#host-gaps kicker="宿主缺口"}

内核已经可以跨宿主，但目前只实现了浏览器形态。

:::::split
::::stack
:::card{tag="原生" tone="warn" title="原生宿主还没有"}
内核已经不依赖 document，但原生宿主还需要实现 Transport、glass-easel 渲染后端、canvas 适配器、resolveAssetUrl 和控制界面。
:::

:::card{tag="部署" tone="warn" title="部署假设还没有建模"}
iframe 没有 sandbox；转移端口和发送 ready 时使用 targetOrigin `'*'`；线程侧也没有校验 origin。当前默认同源静态部署。
:::

:::card{tag="关闭" tone="warn" title="关闭连接和卸载页面是两件事"}
`host.close()` 只关闭连接，不会触发页面 onUnload，也不会移除 iframe；standalone 的 `dispose()` 才会清理 iframe 和容器。
:::
::::

::::stack
:::card{tag="能力" tone="warn" title="没有能力协商"}
握手会带 capabilities，但宿主没有注入，也没有降级逻辑。不同宿主的能力差异只能靠 apiExtensions 和诊断暴露。
:::

:::card{tag="更新" tone="warn" title="没有热更新"}
产物变化后必须重启或 reload，协议里没有 artifact reload。devtool 的 Reload 会重建整个 iframe 运行时。
:::

:::card{tag="加载" tone="warn" title="没有子包按需加载"}
service bundle 包含所有页面脚本；manifest 记录了 subpackage，但宿主还没有按需下载和执行策略。
:::

:::card{tag="返回" tone="warn" title="单 render 模式缺少 page.ready"}
navigateTo 会补发 `page.ready({ components })`；navigateBack 在单 render 模式下不会重新下发组件快照。
:::
::::
:::::

## 接下来先做什么 {#roadmap kicker="下一步"}

先把常见小程序需要的 API 和组件补上，再处理页面、组件和宿主约定，最后做性能和原生形态。

::::stack
:::card{tag="P0" title="补齐宿主 API"}
异步 storage、reLaunch/redirectTo、modal/loading、系统信息异步版；同时把 unsupported API 从“静默返回 undefined”变成可查询的能力清单和明确诊断。
:::

:::card{tag="P0" title="补常用组件"}
navigator、textarea、picker、form、video、rich-text、map；把已有组件的 open-type、表单、颜色和焦点语义补全，并同步扩展组件测试与 P0 fixture。
:::

:::card{tag="P0" title="修复单 render 模式的返回流程"}
让 navigateBack 在单 render 模式下也把 render 返回的组件并入 page.ready，或者让 service 复用已有组件实例；同时补浏览器断言。
:::

:::card{tag="P0" title="宿主加固"}
明确 close 和 dispose 的语义，评估 origin 校验和 sandbox，补齐或删除 capability 字段。
:::

:::card{tag="P1" title="页面能力"}
下拉刷新、分享、页面栈恢复、自定义 tabBar、子包按需加载。
:::

:::card{tag="P1" title="组件高级语义"}
generics、placeholder、definitionFilter、完整内置 behaviors，以及 relations 的边界情况和组件 export 校验。
:::

:::card{tag="P1" title="Canvas 和动画"}
canvas rAF、完整 2D API、触摸到 service 的链路；animation 多 step 时序和事件回调。
:::

:::card{tag="P2" title="性能和稳定性"}
启动耗时、首屏、setData 批量和差量、导航耗时、大列表内存、长时运行，把阈值接进验收。
:::

:::card{tag="P2" title="原生宿主和更多渲染后端"}
用现有的 Transport、渲染后端、canvas 和资源注入接口实现原生宿主；再评估多渲染后端和编译产物抽象化。
:::
::::

:::callout{title="关于架构演进" tone="warn"}
早期讨论过抽象组件树、多渲染后端和渲染框架解耦，但那条路线没有采用；现在引擎仍以 glass-easel + 浏览器 DOM 渲染后端为核心。
:::

## 这些约束不能破 {#invariants kicker="设计约束"}

路线可以调整，但下面的约束一旦破了，现有宿主和测试会一起失效。

::::cards
:::card{title="内核不负责环境"}
`packages/runtime` 不碰 window、document、iframe 或 MessageChannel；`pnpm check:runtime-purity` 是硬门槛。
:::

:::card{title="宿主适配器在核心之外"}
iframe、DOM canvas 和 devtool 覆盖层放在 `hosts/browser`，内置组件放在 `hosts/web-components`；核心包不能反向依赖 hosts。
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
设备信息走 apiExtensions，canvas 走 canvas 适配器，资源走 resolveAssetUrl，渲染后端和挂载点由宿主提供。
:::

:::card{title="构建产物不入库"}
宿主产物、组件 ProcGen、devtool 静态文件和站点里的 devtool 都由构建生成；仓库只保留源码、约定和测试 fixture。
:::

:::card{title="验收必须跑真实应用"}
核心链路要用真实双线程和浏览器操作验证，不能只靠 mock 通过。
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
host-browser、host-web-components、注入能力和接入步骤。

[宿主适配 →](#/hosts)
:::

:::card{tag="测试" title="以测试为准"}
180 个单元测试和 51 个浏览器步骤。

[测试与验收 →](#/testing)
:::
::::

:::callout{title="仓库"}
[github.com/YufJi/tiny](https://github.com/YufJi/tiny) · [验收指南](https://github.com/YufJi/tiny/blob/next/docs/acceptance.md) · [架构决策记录](https://github.com/YufJi/tiny/tree/next/docs/adr)
:::
