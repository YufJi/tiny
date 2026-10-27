---
title: '不用安装，'
highlight: '在浏览器里调试真实运行时'
eyebrow: '在线调试器'
lede: >-
  这是 apps/devtool 的生产构建，会随网站一起发布。它通过 @tiny/host-browser 启动 service 和 render 线程，加载 tests/apps 里的真实编译产物，并提供应用列表、设备框、宿主导航、页面导航、生命周期控制、Console 和 Elements。
stats:
  - ['5', '测试应用']
  - ['1', 'service iframe']
  - ['每页', 'render iframe']
  - ['3', '应用保活']
pills:
  - ['全部测试应用', 'good']
  - ['宿主导航和 tabBar', 'good']
  - ['相对路径', 'good']
  - ['GitHub Pages', 'good']
description: '站点内嵌的 Tiny 运行时调试器：构建方式、宿主结构和路径约定。'
order: 7
---

## 直接打开调试器 {#live kicker="在线运行" nav="在线调试器"}

面板会列出 tests/apps 下的全部测试应用。第一次打开时进入应用列表，点击应用后启动运行时，默认从它的首页开始。

:::embed{src="./devtool/index.html" title="Tiny 在线调试器" label="Tiny Runtime Debugger" badge="5 个测试应用" open="在新标签页打开 ↗"}
:::

:::callout{title="这里跑的是真实运行时"}
iframe 里的面板通过 `DevtoolRuntimeClient`（来自 `@tiny/host-browser`）启动线程，读取 `runtime/apps/<app>/generated` 下的 manifest、模板、样式和脚本。Console 里的诊断、Elements 里的元素树、Lifecycle 里的时间线，都来自当前这次会话。
:::

## 调试器是网站构建的一部分 {#pipeline kicker="构建流程"}

网站不引用 apps/devtool/static 下的开发期产物，而是在构建时生成一份自包含、可以放到任意子路径的副本。

:::flow
| step | title | detail | accent |
| --- | --- | --- | --- |
| 01 · 测试应用 | tests/apps/* | demo · mini · todo · wechat-demo · echarts | yes |
| 02 · 编译 | compileMiniProgram | manifest · templates · styles · service/render | |
| 03 · 打包 | rspack build | nextHost · nextService · nextRender | |
| 04 · 发布 | Vite publicDir | .cache/site-public/devtool → dist/devtool | |
| 05 · 嵌入 | 网站 iframe | ./devtool/index.html · 同源静态资源 | yes |
:::

:::::split
::::stack
:::card{tag="脚本" title="scripts/build-site-devtool.mjs"}
扫描测试应用、编译全部应用、写入 `apps.json`、调用 rspack 生产构建，最后把产物复制到 Vite 的 public 目录。默认发布 `tests/apps` 下的全部应用；需要更小的产物时，可以用 `TINY_SITE_DEVTOOL_APPS` 只取一部分。
:::

:::card{tag="Vite" title="publicDir 指向 .cache"}
内嵌产物是构建输出，不进入 git。开发时 Vite 从 `website/.cache/site-public` 提供文件；构建时再原样复制到 `website/dist/devtool`。
:::
::::

```bash
# 只重建内嵌调试器（默认全部 tests/apps）
pnpm site:devtool

# 本地预览：先打包调试器，再启动 Vite
pnpm site:dev

# 产物构建和校验：dist/devtool/ 必须存在，资源必须使用相对路径
pnpm site:check

# 只发布部分测试应用，方便本地快速验证
TINY_SITE_DEVTOOL_APPS=demo,mini pnpm site:build
```
:::::

## 面板只是 DevtoolRuntimeClient 的界面 {#host kicker="调试器宿主"}

React 不直接发送协议消息。它订阅 host-browser 投影出来的状态，再把用户操作变成 client 方法。

:::::split
::::stack
:::card{tag="RuntimePanel" title="控制器"}
读取 `./runtime/apps.json`，显示应用列表；点击应用后创建 `DevtoolRuntimeClient`，加载 manifest，启动运行时，并订阅状态。

最多同时保留 3 个应用会话，超出后关闭最早打开的应用。关闭应用会释放它自己的 iframe 和页面栈。
:::

:::card{tag="PreviewStage" title="设备壳"}
iPhone X 的 375×812 设备框、自动缩放、状态栏和导航栏；页面设置 `navigationStyle: custom` 时不渲染宿主导航栏。tabBar 由宿主绘制。
:::
::::

::::stack
:::card{tag="DevtoolToolbar" title="控制区"}
应用选择、当前页面、页面栈和上限、Navigate、Inspect、Reload、Close app、Foreground/Background、Back、SwitchTab。
:::

:::card{tag="DebugPanel" title="观察区"}
Console 显示结构化诊断（最多保留 500 条），Elements 显示 `runtime.inspectTree` 投影出的元素树，Lifecycle 按顺序记录页面生命周期。
:::
::::
:::::

| 层 | 实现 | 职责 |
| --- | --- | --- |
| `DevtoolRuntimeClient` | `@tiny/host-browser` | 创建线程、bootstrap、导航/前后台/Reload/Close、inspectTree，并维护页面栈和生命周期 |
| `runtimeService.js` | service 线程入口 | 读取 `?app=`，加载 generated manifest 和 service.js |
| `runtimeRender.js` | render 线程入口 | 加载 templates/styles，注入渲染后端、canvas、资源解析、挂载钩子和内置组件 |
| `RuntimePanel` | React/Redux | 应用列表、会话管理、首屏选择、状态订阅和面板组合 |
| `PreviewStage` | React | 设备框、宿主导航/tabBar、前后台遮罩、加载和错误状态 |

## 同一份构建，放在哪都能用 {#contracts kicker="路径约定"}

调试器里所有 URL 都相对当前文档解析。这样同一份构建可以放在根路径、/devtool/，也可以放在 GitHub Pages 的 /tiny/devtool/ 下。

| 资源 | 解析方式 | 为什么这样处理 |
| --- | --- | --- |
| `runtime/apps.json` | 相对面板文档 fetch | GitHub Pages 会在路径前加 /tiny/ |
| `runtime/apps/<app>/generated` | `new URL(..., location.href)` | 线程 iframe 的文档目录不同，绝对路径会指到站点根 |
| `next-service.html` / `next-render.html` | 相对面板文档拼接 | 同一份构建要同时服务 / 和 /devtool/ |
| `nextHost.js` / CSS | `rspack publicPath: "./"` | 生产产物必须可搬运；dev server 仍使用 "/" |

:::callout{title="iframe 必须同源"}
网站通过 `<iframe src="./devtool/index.html">` 嵌入调试器。面板和线程页必须同源，才能用 `fetch` 读取生成产物，并用 `postMessage` 转移 MessagePort。因此不要给 iframe 加 sandbox，也不要把调试器拆到独立域名。
:::

## 在线版本也有边界 {#limits kicker="限制"}

它是完整的 devtool 静态构建，但仍然只是展示入口，不能替代本地开发流程。

::::cards{layout="three"}
:::card{title="全部测试应用"}
默认发布 `tests/apps` 下全部 5 个应用，和本地 `pnpm dev:devtool` 的选择器一致；产物约 10 MiB，已移除 source map。
:::

:::card{title="纯静态"}
没有服务端，也没有编译接口。产物在网站构建时生成，页面本身不会触发新的编译。
:::

:::card{title="需要 HTTP 服务"}
直接双击 `dist/index.html` 无法工作；请用 `pnpm site:preview` 或任意静态服务器打开。
:::
::::
