# devtool

Tiny 运行时调试器。

## 启动

```bash
pnpm dev:devtool
# http://localhost:8080/

TINY_DEVTOOL_PORT=8090 pnpm dev:devtool
# http://localhost:8090/（8080 被占用时）
```

`dev:devtool` 会扫描 `tests/apps/*`（要求目录内存在 `app.json`），为每个测试应用启动
一个 watcher，把产物写到 `apps/devtool/static/runtime/apps/<app>/generated`，再启动
rspack dev server。首次打开显示测试小程序列表；点击某个应用启动，列表会自动展示已保活/后台
运行的应用。编译完成后进入应用点 `Reload` 重新加载产物。新增或删除 `tests/apps/*` 后需要
重启 `dev:devtool`。

也可以一次性编译全部测试应用而不启动服务：

```bash
pnpm compile:devtool:all
```

## 移动端访问

- 通过手机/平板浏览器打开时，面板只显示“请在电脑端访问”的提示页，不加载应用列表或任何 runtime iframe
- 识别依据：`navigator.userAgentData.mobile`、移动端 User-Agent、iPadOS 的 Macintosh + 多点触控组合
- 调试器需要桌面端的大屏、多窗口预览和元素检查能力；手机端不提供降级布局
- 显式加上 `?desktop=1` 可绕过提示页（仅供桌面模式/特殊调试）

## 预览测试应用

默认打开 `http://localhost:8080/` 的测试应用列表；点击应用卡片启动。也支持深链直接启动：

- `http://localhost:8080/?app=demo`：P0 demo
- `http://localhost:8080/?app=mini`：完整示例
- `http://localhost:8080/?app=todo`：Taro 3 产物
- `http://localhost:8080/?app=wechat-demo`：微信官方组件/API 示例子集
- `http://localhost:8080/?app=echarts`：历史 ECharts 示例
- `?app=<app>&path=pages/...`：直接从指定页面启动

应用清单由 `scripts/devtool-apps.mjs` 扫描 `tests/apps` 生成到
`static/runtime/apps.json`；目录名就是 `app` 参数。每个应用的首个页面来自其 `app.json`
的 `pages[0]`。

## 界面布局

- 左侧：iPhone X 逻辑尺寸 `375 × 812` 的预览窗口；窗口空间不足时等比缩放并显示缩放比例
- 无前台应用时显示 **Mini programs** 列表：每个 fixture 的状态、当前页面、保活/关闭操作
- 预览内：宿主状态栏 + 导航栏。导航栏读取**当前页面**的标题/背景/文字色，左侧返回按钮
  调用 `navigate.back`；capsule 左侧三点打开 Host controls，右侧圆圈把当前应用送入后台
  并回到列表页
- tab 页底部/顶部显示内置 tabBar（图标、文字、选中色、badge、红点）；点击调用 `switchTab`
- 右上：当前应用、运行状态、页面栈深度（`n / maxPageStack`）、Runtime / Navigation 控制
- 右下：Console / Lifecycle / Elements 调试栏，分别展示结构化诊断、页面生命周期时间线和可展开的元素树

预览内容区按当前页面是否使用 `navigationStyle: "custom"`、当前 tab 页是否显示 tabBar
动态扣除 `88px` 导航栏 / `50px` tabBar，并通过 `runtime.resize` 同步给
`wx.getSystemInfoSync()` 和 `onResize`。自定义导航页由页面自绘导航栏，宿主不再重复渲染；
同时保留一个 debugger-only 的浮动圆圈，用于把应用送入后台并返回列表。

## 多应用保活

- 默认列表页不启动任何 runtime；点击应用才创建 service/render iframe
- 圆圈 / `App list` 会先调用 `page.hide`（App/Page `onHide`），隐藏该应用的全部页面帧，
  再回到列表；应用保持运行，重新点击即恢复现场
- 最多保活最近 `MAX_LIVE_APPS = 3` 个应用（含前台）；打开第 4 个时关闭最久未使用的后台应用
- 每个应用拥有独立的 service iframe、页面 render 帧和 DOM surface；最多同时存在 3 套
- 列表里可以关闭任意后台应用，释放全部线程
- `?maxPageStack=<n>` 可覆盖每个应用的页面栈上限，宿主 API 默认 `10`

## 页面 WebView 栈

devtool 采用**一页一 iframe** 的 render 方式，而不是所有页面共用一个 render 帧：

- 首个页面启动时创建一个 `next-render.html?pageId=page-1` iframe，service 线程仍只有一个 iframe
- `navigateTo` 为新页面创建独立 iframe，页面拥有自己的 glass-easel 组件树、DOM 和滚动容器
- 每个页面 iframe 只注册全局 app 样式（如 `app.wxss`）、当前页面样式和递归组件样式，不加载 manifest 中其他页面的样式
- 旧页面 iframe 不销毁，只隐藏（`data-state="hidden"`）；返回时直接恢复该 iframe，
  不会从 `initialData` 重建页面，因此滚动位置、输入态和组件内部状态都保留
- `navigateBack` 触发被卸载页面的 `onUnload` 后才移除它的 iframe；生命周期顺序由
  service 线程统一驱动
- 把应用送入后台通过 `page.hide` 触发页面生命周期，同时隐藏整组 page frame；从列表恢复时
  通过 `page.show` 恢复

render 线程把 iframe 的真实滚动位置转成 `onPageScroll`，并在触底时发送一次
`onReachBottom`；devtool 的 Lifecycle 时间线记录 `onLoad/onShow/onReady/onHide/onUnload/
onReachBottom/onResize/onTabItemTap`。高频 `onPageScroll` 会送达页面，但不写入时间线，避免刷屏。

## tabBar

- `app.json.tabBar` 的内置配置由 service 解析，状态通过 `RUNTIME_STATE.tabBar` 投影到面板
- tab 页面实例和 iframe 会缓存：切走时只触发 `onHide`，切回时复用页面数据、滚动位置和组件状态
- `wx.switchTab` / tabBar 点击会清理非 tab 页面、显示目标 tab 页，并触发 `onTabItemTap`
- `setTabBarStyle` / `setTabBarItem` / `setTabBarBadge` / `removeTabBarBadge` /
  `showTabBarRedDot` / `hideTabBarRedDot` / `showTabBar` / `hideTabBar` 会即时更新宿主 tabBar
- `custom: true` 目前只发 `TABBAR_CUSTOM_UNSUPPORTED` 警告，自定义 tabBar 组件仍需页面自行实现
- tab 页面外的 `navigateTo` 页面不显示 tabBar；`navigateTo` 到 tab 页面会被拒绝，和微信一致

devtool 是 `apps/` 下的可运行应用，不是核心包；它与 `tests/host` 的区别是：

- `tests/host`：无 UI、单应用、单 render 帧、供开发与 Playwright 验收
- `apps/devtool`：React 面板、多应用切换、多 render 帧、诊断/元素树/生命周期控制

## 结构

```text
src/next/
├── main.jsx                 # 入口，挂载 RuntimePanel
├── runtimePanel.jsx         # 容器：应用加载、运行时生命周期、布局
├── runtimePanel.css         # 根布局、主题变量、右侧面板
├── config.js                # iPhone X / 宿主 chrome 尺寸常量
├── appRegistry.js           # 应用清单、manifest 导航配置、fetch 工具
├── components/
│   ├── PreviewStage.jsx     # 设备框、缩放、launcher/应用 surface 容器
│   ├── PreviewStage.css
│   ├── AppLauncher.jsx      # 默认测试应用列表 / 保活状态 / 关闭
│   ├── AppLauncher.css
│   ├── HostNavigationBar.jsx # 状态栏 + 页面导航栏 + 返回
│   ├── HostNavigationBar.css
│   ├── HostControlsMenu.jsx # capsule 菜单 + 回列表圆圈
│   ├── HostControlsMenu.css
│   ├── DevtoolToolbar.jsx   # 当前应用、页面 WebView 栈、运行时控制
│   ├── DevtoolToolbar.css
│   ├── HostTabBar.jsx       # 内置 tabBar（图标/选中态/badge/红点）
│   ├── HostTabBar.css
│   ├── DebugPanel.jsx       # Console / Lifecycle / Elements 调试栏
│   ├── DebugPanel.css
│   └── ElementTree.jsx      # 可展开元素树
├── runtimeService.js        # service 线程入口（单例）
└── runtimeRender.js         # render 线程入口（每个页面一个 iframe）
src/store/
├── index.js                 # rematch store
└── models/runtime.js        # 运行时状态投影
```

- 每个应用一个 `DevtoolRuntimeClient`；`RuntimePanel` 管理 LRU 会话池和 DOM surface
- 宿主编排、多 render 帧连接、生命周期控制和状态投影都在 `@tiny/host-browser` 的
  `DevtoolRuntimeClient`
- 面板只通过 client 订阅状态和发送控制命令
- 面板先从 `./runtime/apps.json` 读取应用清单，再从
  `./runtime/apps/<app>/generated` 读取 manifest、templates、styles
- 线程页通过 `?app=<app>` 定位同一个产物目录；render 线程额外带 `?pageId=<page-id>`，
  iframe 同时写入 `data-page-id` / `data-state` 供调试和验收使用
- `static/runtime/apps/*/generated` 和 `static/runtime/apps.json` 是编译产物，已 gitignore

## 部署到子路径

面板、线程页和生成产物之间的 URL 都相对当前文档解析，因此同一份构建可以挂在
`http://localhost:8080/`、`/tiny/devtool/` 或任意静态子目录。生产构建使用
`publicPath: './'`，`NODE_ENV=production` 时 rspack 会输出相对的脚本与 CSS URL。

两个可选环境变量用于把站点产物和开发期产物隔离：

```bash
NODE_ENV=production \
TINY_DEVTOOL_RUNTIME_ROOT=/path/to/runtime \
TINY_DEVTOOL_OUT_DIR=/path/to/dist \
pnpm --filter devtool build
```

website 的接入由 `pnpm site:devtool` 完成：它编译 `tests/apps` 下全部 fixture
（可用 `TINY_SITE_DEVTOOL_APPS=demo,mini` 取子集）、生成 `apps.json`、调用上面的
生产构建，并把结果复制到 Vite 的 public 目录
`website/.cache/site-public/devtool`。Vite 构建后位于 `website/dist/devtool/`，
站点用同源 iframe `./devtool/index.html` 嵌入，应用列表与本地 devtool 一致。
站点构建会移除生成产物的 source map，避免把十几 MiB 的 `.map` 发布到 Pages。
详见 `website/README.md`。

## 验收

调试器流程已包含在 `pnpm accept:glass-easel`：默认列表页、点击启动、状态投影、首屏单 render 帧、
Lifecycle 时间线、导航后旧页面 iframe 仍保留 DOM、返回后只留下首页 iframe、mini tabBar 的
图标/选中态与 `switchTab` 缓存、依次预览每个 `tests/apps` 测试应用、最近 3 个保活与 LRU 淘汰、
圆圈回列表、深链启动、`maxPageStack` 限制、Reload/关闭应用、控制台零报错。
