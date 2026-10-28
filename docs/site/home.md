---
layout: 'home'
title: '从编译器到宿主'
highlight: '看清小程序引擎的每一层'
eyebrow: 'Tiny 引擎内部 · Bridge v1'
lede: >-
  Tiny 是一个基于 glass-easel 的小程序引擎。它采用双侧树：service 线程运行小程序逻辑树，宿主 render 线程维护真实渲染树，两者通过 component flow、虚拟节点 patch 和 tree 事件同步。浏览器相关能力单独放在宿主包里，小程序内核不依赖 window、document 或 iframe。
actions:
  - ['先看整体架构', '#/architecture', 'primary']
  - ['打开在线调试器', '#/debugger', 'ghost']
  - ['了解宿主适配', '#/hosts', 'ghost']
  - ['阅读 Bridge 协议', '#/protocol', 'ghost']
  - ['GitHub 仓库 ↗', 'https://github.com/YufJi/tiny', 'ghost']
stats:
  - ['2', '运行时树']
  - ['10', '工作区包']
  - ['246', '单元测试']
  - ['55', '浏览器步骤']
description: 'Tiny 是一个基于 glass-easel 的小程序引擎：编译 WXML/WXSS/TS，service 与 render 双线程运行，核心小程序内核不依赖宿主。'
name: '概览'
pageTitle: 'Tiny 小程序引擎：编译、双线程运行时与宿主适配'
order: 1
---

## 一次编译，产出运行所需的全部产物 {kicker="整体流程"}

编译器只负责生成产物，宿主负责提供运行环境，运行时负责执行小程序语义。三者通过 manifest 和 Bridge 协议衔接，不共享隐式全局状态。

:::flow
| step | title | detail | accent |
| --- | --- | --- | --- |
| 01 · 源码 | 小程序源码 | app.json · WXML · WXSS · JS/TS · WXS | yes |
| 02 · 编译 | tools/cli | ProcGen · 作用域 CSS · service bundle | |
| 03 · 产物 | manifest.json | @tiny/manifest · schemaVersion 2 | |
| 04 · 启动 | 宿主装配 | iframe / worker / native · service + render | yes |
| 05 · 运行 | service + render | 逻辑树 · 渲染树 · tree 协议 | |
| 06 · 观察 | devtool | 控制 · 诊断 · 元素树 | |
:::

:::callout{title="各层分工"}
service 在逻辑树里执行模板、组件语义、observer、relations 和事件回调；render 在宿主渲染树里创建真实内置组件、处理布局、样式和 DOM。iframe、MessagePort、DOM canvas、资源 URL 和调试器界面都属于宿主适配层。
:::

## 四类接口，连接编译、运行和调试 {kicker="接口约定"}

改动之前，先分清改的是产物格式、消息协议、线程启动参数，还是宿主注入的能力。

::::cards
:::card{tag="packages/manifest" title="产物格式"}
编译器、运行时、宿主和调试器共用 manifest 及相关类型，包括页面、组件、样式、资源和编译诊断。

[看编译流程和 manifest →](#/compiler)
:::

:::card{tag="packages/bridge" tone="violet" title="消息协议"}
Bridge 定义消息信封、帧、调用与回复、事件批处理、超时和 JSON 可序列化校验。

[看 Bridge v1 →](#/protocol)
:::

:::card{tag="packages/runtime" title="线程启动参数"}
`bootServiceThread` 接收 transport、manifest、`loadTemplates`、`loadStyle` 和宿主 canvas；render 线程用 `bootTreeThread` + `TreeRenderer`（Web 侧由 `createGlassRenderEntry` 提供渲染树，浏览器入口是 `bootBrowserRenderEntry`）消费逻辑树发来的 flow 和 patch。内核本身不依赖浏览器。

[看宿主如何启动线程 →](#/hosts)
:::

:::card{tag="hosts/browser" tone="violet" title="宿主注入的能力"}
`apiHandlers` 处理需要跨线程的 API，`apiExtensions` 补充设备信息；canvas、资源 URL 和内置组件分别由宿主提供。

[看宿主注入方式 →](#/hosts)
:::
::::

## 想改哪一层，就从哪一页开始 {kicker="按模块阅读"}

每一页都从实际代码出发，说明这一层做什么、和相邻层怎么衔接。

::::cards{layout="three"}
:::card{tag="architecture" title="系统分层与状态归属"}
编译器、运行时、Bridge、宿主和 devtool 各自负责什么，以及一次启动如何串起来。

[进入架构总览 →](#/architecture)
:::

:::card{tag="compiler" title="从源码到 manifest"}
入口发现、兼容输入配置、WXML 到 ProcGen、WXSS 作用域、TS 转译、service bundle 和产物目录。

[进入编译流程 →](#/compiler)
:::

:::card{tag="runtime" title="双线程如何协作"}
页面栈、兼容全局、setData、observer、事件、组件语义、逻辑树、虚拟节点 diff 和 tree 协议。

[进入运行时内核 →](#/runtime)
:::

:::card{tag="protocol" title="跨线程消息怎么走"}
消息格式、握手、传输、批处理、错误码、JSON 校验和完整消息列表。

[进入 Bridge 协议 →](#/protocol)
:::

:::card{tag="hosts" title="如何接入运行环境"}
内核约束、host-browser、内置组件宿主、canvas 与资源注入、测试宿主和调试器，以及新宿主的接入步骤。

[进入宿主适配 →](#/hosts)
:::

:::card{tag="testing" title="靠真实小程序验证"}
246 个单元测试、55 个浏览器步骤、七个测试小程序，以及目前还没有覆盖的部分。

[进入测试与验收 →](#/testing)
:::
::::

## 在浏览器里试用调试器 {kicker="在线调试器"}

不用克隆仓库。页面里嵌的是 devtool 的生产构建，加载 tests/apps 下真实编译产物，Console 和 Elements 都来自当前会话。

::::split
:::card{tag="在线" title="Tiny Runtime Debugger"}
默认应用列表、最近 3 个应用保活、页面导航、前后台切换、Reload/Close app、诊断和元素树都可以直接操作。

:button[打开在线调试器]{href="#/debugger" variant="primary"}
:::

:::card{tag="构建时生成" title="跟站点一起发布"}
构建站点时会先编译 tests/apps 下的全部 fixture，再打包 devtool。Vite 把产物复制到 `dist/devtool/`，页面通过同源 iframe 嵌入。

[查看接入方式 →](#/debugger)
:::
::::

## service 跑逻辑树，宿主跑渲染树 {kicker="运行时结构"}

service 执行小程序逻辑并维护逻辑树，render 线程由宿主持有真实组件树；两棵树通过 `tree.flow` 首屏同步、`tree.patch` 增量更新、`tree.event` 回传事件，页面和组件状态始终在 service。

::::split
:::card{tag="service 线程" title="小程序逻辑和平台 API"}
- App / Page / Component / Behavior 注册，按 manifest 顺序绑定路径
- 页面栈、路由和 onLoad → onShow → onReady
- glass-easel 逻辑树、模板求值、virtual node diff
- Behaviors、observers、relations、selectComponent 等组件语义
- 事件按 node id 回到逻辑树，用带类型的 dataset 分发
- 通过宿主 canvas 适配器使用 2D/WebGL 和 selector query
:::

:::card{tag="render 线程" tone="violet" title="宿主渲染树和 DOM"}
- 每页一个 render root；Web 侧由 `createGlassRenderTree` 创建
- 真实 `tiny-*` 内置组件、slot、shadow root 和布局
- 应用 flow 和 patch，不执行 app methods / observers / relations
- 事件带上 node id、name、detail 和 native 字段回传
- 元素树导出、canvas 测量、DOM 查询和 IntersectionObserver
- 内置组件和基础 CSS 由 `@tiny/host-web-components` 提供
:::
::::

:::callout{title="两棵树各做各的事"}
service 不创建真实 DOM，也不加载 Web 内置组件；render 不执行小程序方法、observer 或 relations。service 分配稳定的 node id，render 只负责把这些 id 映射到真实组件和节点。这样才能在 Web 和原生宿主之间复用同一套语义。
:::

## 同一套内核，可以换不同宿主 {kicker="宿主对比"}

浏览器宿主、无界面测试宿主和调试器都复用 createTinyRuntime；单元测试甚至不需要 iframe。

| 宿主 | 通信方式 | 渲染后端 | 控制方式 |
| --- | --- | --- | --- |
| `@tiny/host-browser` | MessageChannel / iframe | 浏览器线程与 canvas handoff | `createStandaloneDualThreadHost`、`DevtoolRuntimeClient` |
| `tests/host` | service + 每页 render 的 MessageChannel | `createGlassRenderTree` | URL `?path=`、`window.__tinyRuntime` |
| `apps/devtool` | service + 每页 render 的 MessageChannel | `createGlassRenderTree` | `DevtoolRuntimeClient` + React/Redux |
| runtime 单测 | `createInMemoryTransportPair()` | 测试 renderer / headless tree | 直接持有 service / render 连接 |
| 原生宿主（未实现） | 需要实现 `Transport` | `createNativeTreeRenderer` 契约 | 复用宿主 API 注册表和控制消息 |

:::callout{title="新宿主从 createTinyRuntime 接进来"}
只要提供 service transport、每页 render 的 connector、manifest 和初始页面，就能启动同一个引擎。`@tiny/host-browser` 的 `createStandaloneDualThreadHost` 只是浏览器适配器，不是引擎本身。[看完整接入步骤 →](#/hosts)
:::

## 这些能力都有自动化测试 {kicker="测试覆盖"}

下面这些行为都在 55 个浏览器步骤里实际点击、输入和断言过，覆盖逻辑树与渲染树的同步。

::::cards{layout="three"}
:::card{title="真实示例小程序"}
todos、add-todo、组件语义页、ECharts 柱状图、子包页面、组件插槽、import/include/template 和 animation。
:::

:::card{title="Taro 3 产物"}
webpackJsonp、外部 WXS、递归模板、循环 usingComponents、Enter 提交和 Redux todos。
:::

:::card{title="微信官方示例子集"}
基础组件索引、button 示例页和 storage API 页；不包含 Skyline 和依赖原生能力的页面。
:::

:::card{title="组件语义"}
Behavior 合并、observers、property observer、relations、selectComponent、styleIsolation 和 externalClasses。
:::

:::card{title="社区组件库"}
Vant 的 dashboard、button、calendar、cascader 等页面和 WeUI 的表单/按钮示例，通过调试器逐个预览，验证双侧树首屏和组件容器。
:::

:::card{title="可替换宿主"}
内核边界检查；host-browser 注入 service 连接、每页 render root、OffscreenCanvas 和资源 URL；host-web-components 提供 Web 渲染树和内置组件。
:::

:::card{title="Canvas handoff"}
宿主把 render iframe 的 OffscreenCanvas 交给 service，支持 2D/WebGL/RAF/createImage；ECharts 会检查非空像素，不再走 PNG 镜像。
:::

:::card{title="兼容输入与内部命名"}
扩展名、指令、API 和注册全局可配置；Tiny 产物内部始终使用固定的 tiny-* 名称。
:::

:::card{title="诊断与元素树"}
编译、transport、service、render、host 五类诊断统一收集；devtool 的 Elements 来自渲染树 inspectTree。
:::
::::

:::callout{title="也要看清没有覆盖的部分"}
当前测试覆盖核心链路、组件语义、兼容输入、内部命名、样式隔离和七个测试小程序。API 覆盖、分享菜单等页面形态、原生宿主和性能基线仍未完成，[现状页会逐项说明](#/status)。
:::

## 从源码跑到调试器 {kicker="快速开始"}

需要 Node.js 22+ 和 pnpm 9；跑浏览器验收还需要 Chromium。

::::::split
:::::group
```bash
# 安装并跑完整验收
pnpm install
pnpm accept:glass-easel

# 测试宿主（demo -> tests/host/generated）
pnpm dev:glass-easel

# 调试器（自动预览全部 tests/apps）
pnpm dev:devtool

# 站点（先打包内嵌 devtool，再构建网站）
pnpm site:dev
pnpm site:check

# 检查核心 runtime 是否依赖了浏览器 API
pnpm check:runtime-purity
```

::::actions
:button[打开仓库]{href="https://github.com/YufJi/tiny" variant="primary"}
:button[查看测试矩阵]{href="#/testing" variant="ghost"}
::::
:::::

:::::stack
::::card{tag="当前状态" title="核心链路和组件语义已经跑通"}
双线程、编译、协议、命名配置、组件语义、样式隔离和调试器都已跑通；宿主 API、页面能力、原生宿主和性能基线仍是主要缺口。

:::pill-row
:pill[核心链路可用]{tone="good"} :pill[内核不依赖宿主]{tone="good"} :pill[组件语义]{tone="good"} :pill[Taro 3 React]{tone="good"} :pill[API 覆盖有限]{tone="warn"} :pill[仅浏览器宿主]{tone="warn"}
:::
::::

::::card{title="接下来"}
先补宿主 API 和常用组件，再完善分享菜单等页面形态、canvas 交互和性能基线。

[查看完整现状和计划 →](#/status)
::::
:::::
::::::
