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
- 预览内：宿主状态栏 + 导航栏。导航栏读取页面 `app.json` 的标题/背景/文字色，左侧返回按钮
  调用 `navigate.back`，右侧 capsule 菜单提供 Foreground / Background / Reload
- 右上：应用选择、运行状态、当前页面栈，以及 Runtime / Lifecycle / Navigation 控制
- 右下：Console / Elements 调试栏，分别展示结构化诊断和可展开的元素树

预览内容区按宿主导航栏高度从 `812px` 中扣除（`724px`），并同步给运行时的
`windowHeight`。`navigationStyle: "custom"` 的页面由页面自绘导航栏，宿主不再重复渲染；
此时仍可通过右侧 Lifecycle 控制前后台，后台状态会在预览内显示遮罩和恢复按钮。

devtool 是 `apps/` 下的可运行应用，不是核心包；它与 `tests/host` 的区别是：

- `tests/host`：无 UI、单应用、供开发与 Playwright 验收
- `apps/devtool`：React 面板、多应用切换、诊断/元素树/生命周期控制

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
│   ├── DevtoolToolbar.jsx   # 应用选择、页面信息、运行时控制
│   ├── DevtoolToolbar.css
│   ├── DebugPanel.jsx       # Console / Elements 调试栏
│   ├── DebugPanel.css
│   └── ElementTree.jsx      # 可展开元素树
├── runtimeService.js        # service 线程入口
└── runtimeRender.js         # render 线程入口
src/store/
├── index.js                 # rematch store
└── models/runtime.js        # 运行时状态投影
```

- 宿主编排、生命周期控制和状态投影都在 `@tiny/runtime` 的 `DevtoolRuntimeClient`
- 面板只通过 client 订阅状态和发送控制命令
- 面板先从 `./runtime/apps.json` 读取应用清单，再从
  `./runtime/apps/<app>/generated` 读取 manifest、templates、styles
- 线程页通过 `?app=<app>` 定位同一个产物目录
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

调试器流程已包含在 `pnpm accept:glass-easel`：启动、状态投影、渲染、导航/返回、
依次预览每个 `tests/apps` 测试应用、Reload/Terminate、控制台零报错。
