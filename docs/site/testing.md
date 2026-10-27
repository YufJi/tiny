---
title: '用真实小程序验收，'
highlight: '不只跑单元测试'
eyebrow: '测试与验收'
lede: >-
  Tiny 的验收会编译真实的 WXML、WXSS 和 JS，启动 service 和 render 线程，在 Chromium 里点击、输入、导航，失败时保存截图。180 个单元测试覆盖协议、组件语义和编译逻辑，51 个浏览器步骤验证端到端行为。
stats:
  - ['180', '单元测试']
  - ['51', '浏览器步骤']
  - ['5', '浏览器流程']
  - ['5', '测试小程序']
description: 'Tiny 的验收方式：构建、内核检查、单元测试和五段真实浏览器流程。'
order: 8
---

## 一条命令跑完构建、单测和浏览器验收 {#gate kicker="验收流程"}

pnpm accept:glass-easel 是唯一完整的端到端入口，任何单个包的测试都不能替代它。

:::sequence
| title | detail | code |
| --- | --- | --- |
| 构建 8 个目标 | 依次构建 manifest、stylesheet-compiler、template-compiler、bridge、cli、runtime、host-web-components 和 host-browser，确保后面的测试用的是最新产物。 | `pnpm build:glass-easel` |
| 检查内核依赖 | 从 packages/runtime/src/index.ts 遍历依赖图，禁止浏览器全局，也禁止反向依赖 @tiny/host-* 或 hosts/*。 | `pnpm check:runtime-purity` |
| 跑 6 个包的单元测试 | bridge、template-compiler、stylesheet-compiler、cli、host-web-components、runtime。没有全局 runner，按包逐个执行。 | `pnpm --filter <package> test` |
| 编译 P0 demo | 把 tests/apps/demo 编到 tests/host/generated，然后在 5199 端口启动 Vite 测试宿主。 | `pnpm compile:glass-easel` |
| P0 demo 流程 | 20 步：启动、渲染、作用域样式、快照、自定义事件、checkbox/slider/switch、导航、输入、storage、toast、组件语义、样式隔离、按钮矩阵、relations、canvas 诊断和零 console error。 | `runBrowserAcceptance({ baseUrl })` |
| mini 流程 | 重新编译 tests/apps/mini 覆盖 generated；9 步：真实 todos、双组件实例、import/include/template、输入、ECharts、子包、warning 和零错误。 | `runMiniProgramAcceptance()` |
| Taro 3 流程 | 编译 tests/apps/todo 的预构建产物；6 步：Redux todos、Enter 新增、勾选、筛选、清空和零错误。 | `runTaroAcceptance()` |
| WeChat demo 流程 | 编译官方示例子集；4 步：组件索引、button 页、storage API 页和零错误。 | `runWechatDemoAcceptance()` |
| 调试器流程 | 把全部 tests/apps 编到 devtool static，再用 rspack 启动；8 步：默认应用列表、点击启动、状态投影、渲染、导航/返回、逐应用预览与 3 个应用 LRU 保活、回到列表/深链/页面栈上限/Reload/Close app、零错误。 | `runDevtoolAcceptance()` |
:::

:::callout{title="各阶段会覆盖 generated"}
前四段流程共用 `tests/host/generated`，调试器阶段写入 `apps/devtool/static`。每次编译前都会清空输出，所以不能并行跑两段浏览器验收。最后会重新编译 P0 demo，保证 `pnpm dev:glass-easel` 打开时看到的是默认示例。
:::

## 51 个步骤怎么分配 {#flows kicker="浏览器流程"}

每一步都在真实 Chromium 中执行，会检查页面状态、DOM、像素或 console。

| 流程 | 测试小程序 | 步数 | 验证内容 |
| --- | --- | --- | --- |
| P0 demo | `tests/apps/demo` | 24 | 双线程启动、内置组件、按钮矩阵、样式作用域、事件、导航、storage、canvas 诊断/2D/WebGL/legacy/ECharts、组件语义、零 console error |
| 现有示例 | `tests/apps/mini` | 9 | 真实 todos、双 add-button 实例、import/include/template、输入、ECharts 柱状图、子包、warning |
| Taro 3 | `tests/apps/todo` | 6 | Redux todos、输入 + Enter、勾选、筛选、清空、零错误 |
| WeChat demo | `tests/apps/wechat-demo` | 4 | 组件索引、button 页、storage API 页、零错误 |
| 调试器 | `apps/devtool` | 8 | 默认列表和启动、状态投影、元素树、导航/返回、逐个预览测试应用、3 应用 LRU 保活、页面栈上限、Reload/Close app、零错误 |

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

## 180 个单元测试，按包执行 {#units kicker="单元测试"}

没有全局 test runner，每个包单独跑，避免隐式耦合，也方便定位失败。

| Package | 数量 | 重点 |
| --- | --- | --- |
| `@tiny/bridge` | 10 | 信封校验、版本和路由错误、payload 校验、握手、调用关联、超时、关闭、批处理顺序、诊断插队、MessagePort |
| `@tiny/template-compiler` | 30 | 脚本依赖、WXS、import/include、模板别名、ProcGen 签名、绑定表复用、事件简写、data-* 绑定、stringify 往返 |
| `@tiny/stylesheet-compiler` | 29 | class/tag 前缀、rpx/calc、@import 编码和包装、@layer、:host 低优先级、hostAttribute、keyframes、page 根节点 |
| `@tiny/cli` | 13 | manifest 全产物、命名配置、WXS 双注册、配置合并、service/render 入口、TS/source map、样式作用域、tag marker |
| `@tiny/host-web-components` | 30 | 23 个 tag 模板、共享 behaviors、button 对齐、label、input、checkbox/slider/switch、progress/swiper/icon、image/icon 渲染 |
| `@tiny/runtime` | 64 | 全局安装和命名、双线程 bootstrap、组件 schema、behaviors/observers/relations/externalClasses/styleIsolation/selectComponent、组件型页面、资源、导航、API host、诊断 |

:::callout{title="单测也会跑真实连接"}
Bridge 测试会真的建立两条内存连接并完成握手；runtime 测试会启动 service/render 线程、注册 Page、执行 bootstrap 和导航。这里没有把整个引擎 mock 掉的做法。
:::

## 测试宿主和调试器不是一回事 {#hosts kicker="两种宿主"}

两者都通过 @tiny/host-browser 的 createStandaloneDualThreadHost 启动线程，但一个服务自动化，一个服务人。

::::split
:::card{tag="tests/host" title="无界面单应用宿主"}
- Vite 提供 host、service、render 三个入口
- 静态导入 `generated/manifest.json`
- 启动线程，把页面挂到 `#app`
- 暴露 `window.__tinyRuntime` 给 Playwright
- P0、mini、Taro、WeChat 四段流程都用它
- 不依赖 devtool 应用
:::

:::card{tag="apps/devtool" tone="violet" title="带界面的多应用调试器"}
- React 面板和 rematch/Redux 状态投影
- 扫描 tests/apps/*，全部测试应用都可以切换
- 页面栈、诊断、元素树和生命周期时间线
- Navigate / Back / SwitchTab / Reload / Close app
- 通过 `DevtoolRuntimeClient` 控制
- 有独立的调试器验收阶段
:::
::::

:::callout{title="共用内核，控制方式不同"}
测试宿主只调用 `host.bootstrap()`，然后用 Playwright 操作页面；devtool 通过 client 做导航、前后台、重载和元素树检查。两者都不直接读取 iframe 全局变量。更多差异见 [宿主适配](#/hosts)。
:::

## 五个测试小程序，覆盖不同产物 {#fixtures kicker="测试小程序"}

fixture 不是单元测试里的假数据，而是完整的小程序源码或预构建产物。

| Fixture | 形态 | 覆盖内容 | 是否进入验收 |
| --- | --- | --- | --- |
| `demo` | 3 个页面 + 8 个组件 | P0 内置组件、作用域样式、导航、storage、canvas 诊断、按钮矩阵、Behavior/observers/relations、styleIsolation、externalClasses | 是 |
| `mini` | 4 个页面 + 2 个组件 + 1 个分包 | 真实 todos、import/include/template、animation、ECharts 离屏 canvas、资源内联 | 是 |
| `todo` | 1 个页面，Taro 3 预构建产物 | webpackJsonp、外部 WXS、递归模板、循环 usingComponents、Enter 提交 | 是 |
| `wechat-demo` | 117 个页面 + 2 个分包（示例子集） | 基础组件索引、button 示例、storage API 示例 | 是 |
| `echarts` | 22 个页面的历史示例 | 早期 ECharts 集成参考资料 | 否 |

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
这些只是让 Taro 3 React 产物能跑起来的最小集合。Behavior、observers 和 relations 已经实现，但 generics、placeholder、definitionFilter 和自定义 tabBar 还没有完成；其他社区框架没有进入验收。
:::

## 常用命令 {#commands kicker="命令和环境变量"}

完整验收需要 Chromium；没有浏览器时，可以只跑构建、单测和编译。

:::::split
```bash
# 完整验收
pnpm accept:glass-easel

# 只构建、单测和编译，不启动浏览器
SKIP_BROWSER=1 pnpm accept:glass-easel

# 单包测试
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
浏览器之外的 transport、渲染后端和 service 运行时都不存在；canvas 适配器也还没有原生实现。
:::

:::card{tag="组件" tone="warn" title="组件高级能力未覆盖"}
generics、placeholder、definitionFilter、完整内置 behavior 和 open-type 真实能力都没有验收。
:::

:::card{tag="Canvas" tone="warn" title="Canvas 交互未验收"}
离屏帧、touch 事件和 SelectorQuery 有覆盖；canvas rAF、完整 2D API 和原生 touch 链路没有。
:::

:::card{tag="页面" tone="warn" title="页面高级能力未覆盖"}
下拉刷新、分享、页面栈恢复、自定义 tabBar 没有验收；内置 tabBar、滚动和触底已经接入。
:::

:::card{tag="API" tone="warn" title="API 覆盖有限"}
网络、媒体、文件、位置、账号、WebSocket 和 IntersectionObserver 都没有端到端测试。
:::

:::card{tag="安全" tone="warn" title="缺少安全隔离"}
iframe 没有 sandbox，消息没有 origin 校验，跨线程输入只做 JSON 安全校验，没有权限模型。
:::
::::

:::callout{title="构建产物不入库"}
`tests/host/generated/`、`hosts/web-components/src/generated/` 和 `apps/devtool/static/` 都是构建产物。仓库只保留源码、manifest 约定和测试小程序，验收时会自己生成它们。
:::
