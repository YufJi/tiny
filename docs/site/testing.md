---
title: '用真实小程序验收，'
highlight: '不只跑单元测试'
eyebrow: '测试与验收'
lede: >-
  Tiny 的验收会编译真实的 WXML、WXSS 和 JS，启动 service 逻辑树和宿主渲染树，在 Chromium 里点击、输入、导航，失败时保存截图。496 个单元测试覆盖协议、组件语义、tree 同步和编译逻辑，68 个浏览器步骤验证端到端行为；iOS 宿主另有 7 个 fixture 的 WKWebView + JSCore smoke。
stats:
  - ['496', '单元测试']
  - ['66', '浏览器步骤']
  - ['5', '浏览器流程']
  - ['7', '测试小程序']
  - ['7', 'iOS fixture smoke']
description: '小程序引擎的验收方式：构建、内核检查、496 个单元测试、68 个浏览器步骤、七套测试小程序和 iOS 宿主 smoke。'
name: '测试'
pageTitle: '测试与验收 · Tiny 小程序引擎'
order: 8
---

## 一条命令跑完构建、单测和浏览器验收 {#gate kicker="验收流程"}

pnpm accept:glass-easel 是唯一完整的端到端入口，任何单个包的测试都不能替代它。

:::callout{title="全新 checkout 先构建 wasm"}
`native/host-core-wasm/pkg` 是构建产物，不提交。先运行
`pnpm --filter @tiny/host-core-wasm build`（或 `pnpm build`），浏览器验收才能加载 wasm HostCore。
:::

:::sequence
| title | detail | code |
| --- | --- | --- |
| 构建 12 个目标 | 通过 turbo 构建 css-units、manifest、wxs-runtime、stylesheet-compiler、template-compiler、bridge、cli、runtime、api、host-web-components、host-core-wasm 和 host-web；本地命中 turbo 缓存时约 1 秒。 | `pnpm build:glass-easel` |
| 检查内核依赖 | 从 packages/runtime/src/index.ts、packages/api/src/index.ts 和 packages/wxs-runtime/src/index.ts 遍历依赖图，禁止浏览器全局，也禁止反向依赖 @tiny/host-* 或 hosts/*；WXS 语言级 require 单独放行。 | `pnpm check:runtime-purity` |
| 一次跑完单元测试 | 根 `vitest.workspace.ts` 把 12 个包的配置装进同一个 Vitest 进程，各包仍保留自己的 alias、snapshot 和 globals 配置；单包调试仍可 `pnpm --filter <package> test`。 | `pnpm test` |
| 一次编译全部 fixture | 7 个测试小程序并发编译到 `tests/host/generated/apps/<id>/generated`，并写入 `apps.json` 清单；比逐段重编译少 3 次覆盖和 1 次恢复。 | `node scripts/compile-apps.mjs --all` |
| 启动两个宿主 | 测试宿主（默认 5199）与调试器（默认 5180）各启动一次，结束后只关闭一次。 | `node scripts/accept-glass-easel.mjs` |
| P0 demo 流程 | 29 步：启动、渲染、作用域样式、快照、自定义事件、checkbox/slider/switch、导航、输入、storage、toast、组件语义、样式隔离、按钮矩阵、relations、WXS 本地事件与 change:prop、catchtouchmove 滚动锁、真实滚动触发 `onPageScroll`、canvas 诊断和零 console error。 | `runBrowserAcceptance({ baseUrl, app: 'demo' })` |
| mini 流程 | 共享同一棵产物树，用 `?app=mini` 选择；10 步：真实 todos、双组件实例、import/include/template、输入、ECharts、子包、warning 和零错误。 | `runMiniProgramAcceptance({ baseUrl, app: 'mini' })` |
| Taro 3 流程 | 用 `?app=todo` 读取 Taro 3 预构建产物；6 步：Redux todos、Enter 新增、勾选、筛选、清空和零错误。 | `runTaroAcceptance({ baseUrl, app: 'todo' })` |
| WeChat demo 流程 | 用 `?app=wechat-demo` 读取官方示例子集；12 步：组件索引、button 页、aria、swiper、radio、API 页、navigator、WXS 拖拽、Canvas 2D/WebGL 和零错误。 | `runWechatDemoAcceptance({ baseUrl, app: 'wechat-demo' })` |
| 调试器流程 | `TINY_DEVTOOL_RUNTIME_ROOT` 指向同一棵产物树，不再重编译 7 个 fixture；9 步：默认应用列表、点击启动、状态投影、渲染、导航/返回、逐应用预览与 3 个应用 LRU 保活、回到列表/深链/页面栈上限/Reload/Close app、零错误；渲染树由 `bootRenderEntry` 创建。 | `runDevtoolAcceptance({ baseUrl: devtoolUrl })` |
:::

:::callout{title="五段流程共享产物树，并行执行"}
全部 fixture 只编译一次到 `tests/host/generated/apps/<id>`，测试宿主用 `?app=` 选择，调试器把同一个目录挂到 `/runtime`。因为不再有阶段重写别人的产物，五段浏览器验收共用一个 Chromium（每段独立 page/context）并行执行；单步日志带 `[P0]`、`[mini]` 等前缀，失败仍按阶段输出 `currentStep` 并保存截图。
:::

## 66 个步骤怎么分配 {#flows kicker="浏览器流程"}

每一步都在真实 Chromium 中执行，会检查页面状态、DOM、像素或 console。

| 流程 | 测试小程序 | 步数 | 验证内容 |
| --- | --- | --- | --- |
| P0 demo | `tests/apps/demo` | 29 | 双线程启动、内置组件、按钮矩阵、样式作用域、事件、导航、storage、WXS 事件、滚动锁、页面滚动 `onPageScroll`、canvas 诊断、组件语义、零 console error |
| 现有示例 | `tests/apps/mini` | 10 | 真实 todos、双 add-button 实例、import/include/template、输入、ECharts 柱状图、子包、warning |
| Taro 3 | `tests/apps/todo` | 6 | Redux todos、输入 + Enter、勾选、筛选、清空、零错误 |
| WeChat demo | `tests/apps/wechat-demo` | 12 | 组件索引、button 页、aria、text、swiper autoplay、radio、storage API 页、navigator、WXS 拖拽、Canvas 2D/WebGL、零错误 |
| 调试器 | `apps/devtool` | 9 | 默认列表和启动、状态投影、元素树、导航/返回、逐个预览测试应用、3 应用 LRU 保活、页面栈上限、Reload/Close app、零错误 |

::::split
:::card{title="检查哪些内容"}
- 页面对象：`window.__tinyRuntime` 的 pageStack 和 diagnostics
- DOM：class、属性、文本、计算样式和 canvas 像素
- 交互：真实 click、fill 和 Enter 按键
- 副作用：storage 写入、toast 调用、导航 query
- 异常：console error 和预期内的 warning
:::

:::card{title="失败时能查"}
Playwright 失败时会保存截图，并输出页面错误和 console 错误。测试宿主暴露 `__tinyRuntime`，可以直接读取诊断和页面状态。

验收不依赖 devtool 界面，测试宿主也不会 import devtool 应用。
:::
::::

## 496 个单元测试，一次运行 {#units kicker="单元测试"}

12 个包各有自己的 `vitest.config.ts`，根 `vitest.workspace.ts` 把它们装进同一个 Vitest 进程：一次启动、并行执行各包测试，但 alias、snapshot 格式和 globals 仍按包隔离。需要单独排查时仍可运行 `pnpm --filter <package> test`。

| Package | 数量 | 重点 |
| --- | --- | --- |
| `@tiny/manifest` | 2 | 固定引擎命名、builtin tags、WXS 保留名 |
| `@tiny/css-units` | 2 | rpx 750、vw 舍入、无 rpx 文本保持 |
| `@tiny/bridge` | 14 | 信封校验、版本和路由错误、payload 校验、握手、调用关联、超时、关闭、批处理顺序、诊断插队、`callSync` 请求/reply 与跨 realm 结果 |
| `@tiny/wxs-runtime` | 13 | 模块加载、循环依赖、相对 require、constructor、globals、origin / resolve、模块表 |
| `@tiny/template-compiler` | 47 | 脚本依赖、WXS transform、模块表、动态事件元数据、change:prop、import/include、模板别名、ProcGen 签名、绑定表复用、事件简写、data-* 绑定、stringify 往返 |
| `@tiny/stylesheet-compiler` | 36 | class/tag 前缀、rpx/calc、@import 编码和包装、@layer、:host 低优先级、hostAttribute、keyframes、page 根节点 |
| `@tiny/cli` | 18 | manifest 全产物、兼容输入配置、WXS 双注册、配置合并、service/templates 入口、TS/source map、样式 role、tag marker |
| `@tiny/host-web-components` | 24 | 内置组件 batches、共享 behaviors 和默认样式断言；`canIUse` 用的组件属性清单与真实定义保持一致；组件行为细节由 host-web 的 render-tree 测试覆盖 |
| `@tiny/host-web` | 103 | DOM render tree、built-in composition、事件、WXS dispatch、event compositor、内置组件与渲染树集成 |
| `@tiny/runtime` | 166 | 全局安装和命名、双线程 bootstrap、逻辑树、tree protocol/patch diff、两次求值与 locator 寻址、headless renderer、组件 schema、behaviors/observers/relations/definitionFilter/externalClasses/styleIsolation/selectComponent、generics/pureDataPattern、组件型页面、资源、5 个导航 API、页面/应用生命周期、API 注入缝、诊断、WXS 宽松求值、`this.animate`、事件冒泡/几何 |
| `@tiny/api` | 37 | 微信兼容 API 表：storage 同步/异步、request 回调、导航与 EventChannel、base64/ArrayBuffer 转换、`canIUse` schema 解析（API/对象/组件三类）、全局 `wx.onXXX` 事件 hub、动画与 canvas stub |
| `devtool` | 6 | 元素树投影：engine class 过滤、节点/文本/属性投影 |

:::callout{title="单测也会跑真实连接"}
Bridge 测试会真的建立两条内存连接并完成握手；runtime 测试会启动 service 逻辑树和 headless render tree、注册 Page、执行 bootstrap 和导航，并验证 tree flow 与 patch。这里没有把整个引擎 mock 掉的做法。
:::

## iOS 宿主单独验收 {#ios kicker="原生宿主"}

iOS 宿主不进入 `pnpm accept:glass-easel`，因为它依赖已安装的 iOS Simulator runtime；构建、模拟器和真机链路有独立命令：

```bash
pnpm ios:assets       # 构建 @tiny/host-ios + 编译 tests/apps 全部 fixture
pnpm ios:sim          # 构建 TinyHost.app，逐个 fixture 在模拟器里 smoke
pnpm ios:device       # 构建/签名/安装到已连接的物理 iPhone
pnpm ios:smoke:jsc    # 在 macOS jsc 里启动 demo 的 service engine + app-data
```

`pnpm ios:sim` 默认跑 `Generated/apps.json` 里的全部 7 个 fixture：demo、mini、todo、wechat-demo、echarts、vant、weui。每个 fixture 都验证 native HostCore 启动、首屏、页面导航/tab 切换和 Launcher 截图；ECharts 截图确认 Canvas display-list 已到达 render WKWebView。产物在 `ios/.artifacts/`，不提交。

真机安装使用 `pnpm ios:device`（Xcode 自动签名 + `devicectl`）；首次启动前仍需在设备上信任开发者证书。真机 smoke 不替代性能、安全或长时运行测试。

## 测试宿主和调试器不是一回事 {#hosts kicker="两种宿主"}

两者都通过 @tiny/host-web 的 WasmBrowserHost 启动 service 和每页 render 线程，但一个服务自动化，一个服务人。

::::split
:::card{tag="tests/host" title="无界面多应用宿主"}
- Vite 提供 host、service、render 三个入口
- 用 `?app=` 从 `generated/apps.json` 选择 fixture，再加载对应 manifest
- 启动 service 逻辑树和 render 树，把页面挂到 `#app`
- 暴露 `window.__tinyRuntime` 给 Playwright
- 用 `TestBrowserHost`（`tests/host/src/test-host.ts`）保留诊断历史和 storage 供断言
- P0、mini、Taro、WeChat 四段流程并行使用它
- 只读编译产物，不依赖 devtool 应用
:::

:::card{tag="apps/devtool" tone="violet" title="带界面的多应用调试器"}
- React 面板和 rematch/Redux 状态投影
- 每页独立 render root 和生命周期时间线
- 扫描 tests/apps/*，全部测试应用都可以切换
- 页面栈、诊断、元素树和生命周期时间线
- Navigate / Back / SwitchTab / Reload / Close app
- 通过 `DevtoolRuntimeClient` 控制
- 有独立的调试器验收阶段
:::
::::

:::callout{title="共用内核，控制方式不同"}
测试宿主只调用 `host.launch()`，然后用 Playwright 操作页面并读取 `host.diagnostics` / `host.apiRegistry.storage`；devtool 通过 client 做导航、前后台、重载和元素树检查。两者都不直接读取 iframe 全局变量。更多差异见 [宿主适配](#/hosts)。
:::

## 七个测试小程序，覆盖不同产物 {#fixtures kicker="测试小程序"}

fixture 不是单元测试里的假数据，而是完整的小程序源码或预构建产物。

| Fixture | 形态 | 覆盖内容 | 是否进入验收 |
| --- | --- | --- | --- |
| `demo` | 6 个页面 + 11 个组件 | P0 内置组件、作用域样式、导航、storage、页面滚动、WXS 事件、canvas 诊断、按钮矩阵、Behavior/observers/relations、styleIsolation、externalClasses | 是 |
| `mini` | 3 个页面 + 1 个分包页面 + 2 个组件 | 真实 todos、import/include/template、animation、ECharts 离屏 canvas、资源内联 | 是 |
| `todo` | 1 个页面，Taro 3 预构建产物 | webpackJsonp、外部 WXS、递归模板、循环 usingComponents、Enter 提交 | 是 |
| `wechat-demo` | 4 个主包页面 + 2 个分包，共 125 页（示例子集） | 基础组件索引、button 示例、storage API 示例 | 是 |
| `echarts` | 22 个页面的历史示例 | 早期 ECharts 集成参考资料 | 否 |
| `vant` | 13 个页面 | Vant Weapp 的 dashboard、button、calendar、cascader 等页面，调试器逐个预览 | 是（调试器） |
| `weui` | 54 个页面 | WeUI 的表单、按钮和示例页，调试器逐个预览 | 是（调试器） |

## Taro 3 产物也在正式验收里 {#taro kicker="Taro 3 兼容"}

Taro 的预构建输出对运行时假设很多，所以它被当成正式验收阶段，而不是手工示例。

::::cards
:::card{tag="运行时" title="webpackJsonp 和页面对象"}
`wx.webpackJsonp` 作为原始数据属性暴露；生命周期方法绑定到页面实例，支持 `this.onReady.called`。
:::

:::card{tag="模板" title="WXS 和递归组件"}
外部 WXS 按带扩展名和不带扩展名注册；usingComponents 环检测避免 comp/custom-wrapper 互相引用时递归爆栈。
:::

:::card{tag="全局对象" title="getCurrentPages / getSystemInfo"}
补上 Taro 运行时依赖的全局对象和 callback 版系统信息；raw wx 数据属性和 unsupported API 诊断分开处理。
:::

:::card{tag="输入" title="confirm 提交"}
input 会转发 focus、blur、keydown 和 confirm，Taro 表单按 Enter 可以提交。
:::
::::

:::callout{title="兼容不等于完整" tone="warn"}
这些只是让 Taro 3 React 产物能跑起来的最小集合。Behavior、observers、relations、generics、definitionFilter 和 pureDataPattern 已经有覆盖，但 componentPlaceholder、自定义 tabBar 和其他社区框架没有进入验收。双侧树目前对 Taro 的影响主要在逻辑树求值和渲染树挂载，不改变其页面注册方式。
:::

## 常用命令 {#commands kicker="命令和环境变量"}

完整验收需要 Chromium；没有浏览器时，可以只跑构建、单测和编译。

:::::split
```bash
# 完整验收
pnpm accept:glass-easel

# 只构建、内核检查和单测，不启动浏览器
SKIP_BROWSER=1 pnpm accept:glass-easel

# 全部单元测试 / 单包测试
pnpm test
pnpm --filter @tiny/runtime test
pnpm --filter @tiny/cli test

# 检查内核是否依赖浏览器 API
pnpm check:runtime-purity

# 本地宿主和调试器
pnpm dev:glass-easel      # :5173
pnpm dev:devtool          # :8080，预览全部 tests/apps

# 网站（包含内嵌调试器）和产物检查
pnpm site:build
pnpm site:check
```

::::stack
:::card{title="环境变量"}
- `SKIP_BROWSER=1`：跳过浏览器阶段
- `TINY_ACCEPT_PORT`：测试宿主端口，默认 5199
- `TINY_DEVTOOL_PORT`：调试器端口，默认 5180
- `HEADED=1`：显示浏览器窗口
- `PLAYWRIGHT_CHROMIUM_PATH`：指定 Chromium 路径
:::

:::card{title="浏览器选择"}
使用 `playwright-core`，优先找系统 Chrome（channel: chrome），失败后尝试 Edge。机器上没有浏览器时，验收会在浏览器阶段失败。
:::
::::
:::::

## 这些还没有测试 {#uncovered kicker="尚未覆盖"}

没测到不等于没问题。下面这些需要单独补测试。

::::cards{layout="three"}
:::card{tag="性能" tone="warn" title="没有性能基线"}
启动、首屏、setData、导航、内存和长时运行都没有量化门槛。
:::

:::card{tag="视觉" tone="warn" title="没有视觉回归"}
样式断言只看计算值和像素抽样，没有截图 diff；组件外观变化不会被稳定发现。
:::

:::card{tag="原生" tone="warn" title="没有原生宿主"}
`createNativeTreeRenderer` 只有契约和 headless smoke test；没有真实的 native transport、render tree 或 canvas handoff 实现。
:::

:::card{tag="组件" tone="warn" title="组件高级能力未覆盖"}
componentPlaceholder、完整内置 behavior 和 open-type 真实能力都没有验收；generics、definitionFilter、pureDataPattern 只在 P0 组件语义用例里覆盖。
:::

:::card{tag="tree" tone="warn" title="target 语义仍缺覆盖"}
首屏 flow 和 patch 有单测和浏览器覆盖；`tree.event` 已带 target/currentTarget offset 几何，剩余缺口是嵌套元素 `event.target` 的语义对齐。
:::

:::card{tag="Canvas" tone="warn" title="Canvas 边缘能力未验收"}
OffscreenCanvas handoff、2D/WebGL、RAF、createImage 和 touch 有覆盖；canvasToTempFilePath、createOffscreenCanvas 和 canvas node 事件没有。
:::

:::card{tag="页面" tone="warn" title="页面高级能力未覆盖"}
下拉刷新、分享、页面栈恢复、自定义 tabBar 没有验收；内置 tabBar、滚动和触底已经接入。
:::

:::card{tag="API" tone="warn" title="API 覆盖有限"}
网络、媒体、文件、位置、账号和 WebSocket 都没有端到端测试；页面/组件级 selector query 与 IntersectionObserver 已有 service→host→render 的 runtime 集成用例，浏览器验收还没有独立的交互用例。
:::

:::card{tag="安全" tone="warn" title="缺少安全隔离"}
iframe 没有 sandbox，消息没有 origin 校验，跨线程输入只做 JSON 安全校验，没有权限模型。
:::
::::

:::callout{title="构建产物不入库"}
`tests/host/generated/`、`hosts/web-components/src/generated/` 和 `apps/devtool/static/` 都是构建产物。仓库只保留源码、manifest 约定和测试小程序，验收时会自己生成它们。
:::
