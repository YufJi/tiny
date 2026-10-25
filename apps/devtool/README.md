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
rspack dev server。面板顶部的应用下拉框会列出全部测试应用；编译完成后点 `Reload`
加载新产物。新增或删除 `tests/apps/*` 后需要重启 `dev:devtool`。

也可以一次性编译全部测试应用而不启动服务：

```bash
pnpm compile:devtool:all
```

## 预览测试应用

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
- 预览内：宿主状态栏 + 导航栏。导航栏读取**当前页面**的标题/背景/文字色，左侧返回按钮
  调用 `navigate.back`，右侧 capsule 菜单提供 Foreground / Background / Reload
- 右上：应用选择、运行状态、当前页面栈（显示路径和 WebView 可见性），以及 Runtime / Lifecycle / Navigation 控制
- 右下：Console / Lifecycle / Elements 调试栏，分别展示结构化诊断、页面生命周期时间线和可展开的元素树

预览内容区按当前页面是否使用 `navigationStyle: "custom"` 动态扣除宿主导航栏高度，
并通过 `runtime.resize` 同步给 `wx.getSystemInfoSync()` 和 `onResize`。自定义导航页由页面
自绘导航栏，宿主不再重复渲染；此时仍可通过右侧 Lifecycle 控制前后台，后台状态会在预览内
显示遮罩和恢复按钮。

## 页面 WebView 栈

devtool 采用**一页一 iframe** 的 render 方式，而不是所有页面共用一个 render 帧：

- 首个页面启动时创建一个 `next-render.html?pageId=page-1` iframe，service 线程仍只有一个 iframe
- `navigateTo` 为新页面创建独立 iframe，页面拥有自己的 glass-easel 组件树、DOM 和滚动容器
- 旧页面 iframe 不销毁，只隐藏（`data-state="hidden"`）；返回时直接恢复该 iframe，
  不会从 `initialData` 重建页面，因此滚动位置、输入态和组件内部状态都保留
- `navigateBack` 触发被卸载页面的 `onUnload` 后才移除它的 iframe；生命周期顺序由
  service 线程统一驱动
- Foreground / Background 通过 `page.show` / `page.hide` 触发页面生命周期，同时隐藏/恢复整组
  page frame

render 线程把 iframe 的真实滚动位置转成 `onPageScroll`，并在触底时发送一次
`onReachBottom`；devtool 的 Lifecycle 时间线记录 `onLoad/onShow/onReady/onHide/onUnload/
onReachBottom/onResize`。高频 `onPageScroll` 会送达页面，但不写入时间线，避免刷屏。

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
│   ├── PreviewStage.jsx     # 设备框、缩放、预览遮罩
│   ├── PreviewStage.css
│   ├── HostNavigationBar.jsx # 状态栏 + 页面导航栏 + 返回
│   ├── HostNavigationBar.css
│   ├── HostControlsMenu.jsx # capsule 菜单（前后台/Reload）
│   ├── HostControlsMenu.css
│   ├── DevtoolToolbar.jsx   # 应用选择、页面 WebView 栈、运行时控制
│   ├── DevtoolToolbar.css
│   ├── DebugPanel.jsx       # Console / Lifecycle / Elements 调试栏
│   ├── DebugPanel.css
│   └── ElementTree.jsx      # 可展开元素树
├── runtimeService.js        # service 线程入口（单例）
└── runtimeRender.js         # render 线程入口（每个页面一个 iframe）
src/store/
├── index.js                 # rematch store
└── models/runtime.js        # 运行时状态投影
```

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
站点用同源 iframe `./devtool/index.html` 嵌入，应用下拉框与本地 devtool 一致。
站点构建会移除生成产物的 source map，避免把十几 MiB 的 `.map` 发布到 Pages。
详见 `website/README.md`。

## 验收

调试器流程已包含在 `pnpm accept:glass-easel`：启动、状态投影、首屏单 render 帧、
Lifecycle 时间线、导航后旧页面 iframe 仍保留 DOM、返回后只留下首页 iframe、
依次预览每个 `tests/apps` 测试应用、Reload/Terminate、控制台零报错。
