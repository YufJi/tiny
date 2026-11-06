# Tiny iOS 宿主

一个可运行的 iOS 小程序宿主：**SwiftUI 原生壳 + 一个 WKWebView 渲染层 + JavaScriptCore 逻辑层**。
它复用 `@tiny/runtime`、`@tiny/bridge`、`@tiny/host-web` 的 render entry；
`@tiny/host-web-components` 只提供内置组件定义和样式，不复制小程序运行时语义。

当前验证环境：Xcode 27 / iOS 27 Simulator（iPhone 18 Pro）。最低部署版本 iOS 16。

## 目录

```text
ios/                               原生 iOS App
  TinyHost.xcodeproj/              Xcode 工程（iOS + Mac Catalyst 共用一个 target）
  TinyHost/                        SwiftUI + UIKit/WebKit/JavaScriptCore 代码和资源
  scripts/build.mjs                构建子包 + 编译 fixture + 组装 Generated
  scripts/sim.mjs                  构建、启动模拟器、跑 smoke、截图
  scripts/smoke-service.mjs        macOS jsc 里验证 JSCore engine
  test/service.html                浏览器 smoke 用的 dev service harness（不随 iOS app 发布）
  Generated/                       组装产物（gitignored）

hosts/ios/                         iOS 的前端标准包（pnpm workspace）
  package.json                     @tiny/host-ios
  tsconfig.json
  vite.config.ts                   一个配置，两种 --mode
  src/
    service/                       JSCore engine、shims、transport
      entry.ts / start.ts / shims.ts / canvas.ts
    web/                           每页 native render entry + canvas
      render.html                  WKWebView render entry
      render.ts / canvas.ts
  dist/
    service/service-engine.js      vite build --mode service
    web/{render.html,assets}       vite build --mode web
```

`hosts/ios` 是一个标准前端包：`pnpm --filter @tiny/host-ios build` 会依次构建 service 和 web 两个产物，
也会被根目录的 `pnpm build` 构建。`ios/scripts/build.mjs` 不再自己 bundle JS；它只负责编译 fixture、
写出 app-data、把 `dist/service` 和 `dist/web` 复制到 `ios/Generated`。

## 能力

- 原生 Launcher：自动列出 `tests/apps` 下的全部 fixture（demo、mini、todo、wechat-demo、echarts、vant、weui），点击进入。
- 原生导航栏和 tabBar：标题、返回、关闭胶囊、tab 图标/选中态/badge/redDot，颜色来自页面和 `RUNTIME_STATE`。
- 逻辑层真正跑在 `JSContext`：App/Page/Component、glass-easel 逻辑树、WXML 求值、WXS 表达式、observer/relations/页面栈全部在 JSCore。
- 渲染层跑在 WKWebView：每页一个独立 `NativeRenderSurface`，复用 `createGlassRenderEntry` / `createGlassRenderTree`；
  隐藏页保留 DOM、滚动位置、定时器和页级 WXSS。
- 页面间只走现有 Bridge 协议；service 帧和 render 帧由 Swift `HostCoreSession` 通过原生消息处理器转发。
- 原生存储：启动时把该 app 的 UserDefaults 快照交给 runtime，运行期 `wx.setStorage*` 经宿主 API 落盘。
- 原生系统信息/安全区/菜单按钮几何注入，窗口尺寸变化会触发 runtime `resize`。
- 无调试面板；需要时可在 Web host 层接入 vConsole（见“vConsole”）。

## 架构

```text
┌──────────────────────────── TinyHost.app ─────────────────────────────┐
│ SwiftUI Launcher / Native chrome (nav bar, tabBar, close capsule)     │
│                                                                       │
│  MiniProgramSession                                                   │
│    HostCoreRuntime                                                    │
│      RustHostCore (UniFFI)  ← host orchestration / page stack        │
│      ├─ page WKWebView #1  render.html                       │
│      ├─ page WKWebView #2  ...                                        │
│      └─ native Host API handlers (storage, ...)                       │
│                  ↕ JSON Bridge frames                                 │
│  JSContext (service thread)                                           │
│    Generated/service-engine.js  (generic engine)                      │
│    + __TINY_IOS_APP__: manifest/templates/service/styles              │
│    → @tiny/runtime bootServiceThread → glass-easel logic tree         │
└───────────────────────────────────────────────────────────────────────┘
```

每页使用一个独立 WKWebView，由 `NativeRenderSurface` 持有。页面 WXSS、滚动容器、
`onPageScroll` / `onReachBottom` / 下拉手势和隐藏页状态都在该 WebView 内；页面间不共享 DOM。
Bridge 帧通过 `WKScriptMessageHandler` 和 `callAsyncJavaScript` 在两个隔离进程间转发。

service engine 只构建一次通用运行时；原生在求值前注入 `apps/<id>/app-data.json` 的
`globalThis.__TINY_IOS_APP__`，engine 再启动对应 app。`templates.js` 的 ESM 入口在运行时转成
工厂函数求值，不依赖模块加载器。

单独构建前端子包（标准命令）：

```bash
pnpm --filter @tiny/host-ios build          # service + web
pnpm --filter @tiny/host-ios build:service  # -> hosts/ios/dist/service/service-engine.js
pnpm --filter @tiny/host-ios build:web      # -> hosts/ios/dist/web/{render.html,assets}
```

组装 iOS 产物：

```bash
pnpm ios:assets
# 等价于 node ios/scripts/build.mjs（默认 tests/apps 下全部 fixture）
# 只组装一个：node ios/scripts/build.mjs demo
```

它会先构建 `@tiny/host-ios`，再编译 fixture，最后写 `ios/Generated`：

```text
ios/Generated/
  service-engine.js
  www/
    render.html
    assets/*.js,*.css
  apps/
    demo/app-data.json, meta.json, assets/
    mini/...
    todo/...
  apps.json
```

用 Xcode 打开 `ios/TinyHost.xcodeproj`，选择 iPhone 模拟器或真机运行。
同一个 target 也可以构建 Mac Catalyst 版本，用于在没有模拟器时验证 WKWebView/JSCore 链路。
## Rust HostCore (UniFFI)

The native adapter now has a UniFFI-bound Rust HostCore slice:

```bash
pnpm ios:host-core   # build simulator staticlib + generate ios/HostCoreGenerated
pnpm ios:sim         # assets + native build + HostCore smoke
pnpm ios:device      # build simulator/device FFI, sign, install and launch on a connected iPhone
```

`HostCoreAdapter.smoke()` creates a `RustHostCore` through the generated Swift
bindings, starts the host handshake and writes `host-core-smoke.json`. The
simulator gate validates that file and requires `ok: true`.

The native adapter now also has:

- `HostCoreSession`: Swift event/action dispatcher around the UniFFI core.
- `NativeRenderSurface`: one standalone WKWebView per page, `nativeRender` message handler and frame queue.
- `render.html`: native render Bridge entry, independent of iframes/MessagePorts.

`HostCoreRuntime` now wires the UniFFI HostCore to the JSCore service and
`NativeRenderSurface` pages. The smoke launches the demo through this native path
`HostCoreRuntime` is the production path; there is no JS-host fallback.

`ios/Generated/` 是 Xcode 的 folder reference，构建前必须存在。

一条命令验收（推荐）：

```bash
pnpm ios:sim
```

它会：

1. 重新构建 `@tiny/host-ios` 和 iOS 资源；
2. 用 `xcodebuild` 构建 `TinyHost.app`；
3. 启动可用的 iPhone 模拟器；
4. 安装并依次以 smoke 模式启动 `Generated/apps.json` 里的全部 fixture；
5. 读取 app Documents 里的 `smoke-result.json` 和 `ui-state.json`，失败即退出；
6. 把截图写到 `ios/.artifacts/ios-*.png`，最后回到 Launcher 截一张图。

常用参数：

```bash
node ios/scripts/sim.mjs demo           # 只跑一个 fixture
node ios/scripts/sim.mjs --skip-assets  # 复用已生成的 Generated
node ios/scripts/sim.mjs --skip-build   # 复用已构建的 app
TINY_IOS_DEVICE="iPhone 17" pnpm ios:sim
TINY_IOS_DEVICE="iPhone 14 Pro Max" pnpm ios:device
```

也可以不依赖模拟器做 JS 层验证：

```bash
pnpm ios:smoke:jsc    # 在 macOS jsc 里启动 demo 的真实 service engine + app-data
```

调试启动参数（只影响 debug 流程，不改变 UI）：

```text
-TINY_AUTOLAUNCH <appId>  直接打开某个小程序
-TINY_SMOKE               启动后自动 bootstrap、导航到第二页/切 tab、再返回
-TINY_RUN_ID <id>         写入 smoke-result.json / ui-state.json，供脚本识别本次运行
-TINY_RESULT_DIR <path>   把日志和结果写到指定目录（默认 Documents）
```

## 启动时序

1. `LauncherView` 读取 `Generated/apps.json`，点击某个 app 后全屏打开 `MiniProgramView`。
2. `NativeHostView` 创建容器；`MiniProgramSession` 创建 `HostCoreRuntime`。
3. `HostCoreRuntime` 启动 `ServiceEngine`（JavaScriptCore），读取 `apps/<id>/app-data.json`，
   求值 `service-engine.js`；App/Page/Component 注册在 service bundle 内完成。
4. UniFFI `RustHostCore` 启动 host handshake，向 JSCore 发送 `runtime.hello`；service 回复 ready。
5. HostCore bootstrap 创建首屏页面；`createPage` action 创建 `NativeRenderSurface`。
6. render WKWebView 加载 `render.html`，通过 `tinyRender` handler 报告 ready；
   HostCore 发送 render bootstrap 和 `tree.flow`，页面挂载 `GlassRenderTree`。
7. HostCore 发送 `page.ready`、`tree.ready`，service 触发 onReady，宿主激活 page surface。
8. `RUNTIME_STATE` 被 HostCore 投影为 `HostUIState`；SwiftUI chrome 更新标题、返回、tabBar。

## 子包与产物

### `src/service`（`--mode service`）

- Vite lib 模式，单个 IIFE 入口 `src/service/entry.ts`，输出 `dist/service/service-engine.js`。
- 依赖 `@tiny/runtime`、`@tiny/bridge`；`@tiny/runtime` / `@tiny/host-web` 的 dist 还是 CommonJS，Vite 用 `commonjsOptions` 处理，其他 workspace 包直接走 package exports。
- 提供 JSCore 缺失的 shims：原生定时器、`console`、`queueMicrotask`、`URLSearchParams`、
  `TextEncoder` / `TextDecoder`、`atob` / `btoa`、`structuredClone`、`performance.now`。
- 不提供 `document` / `window` / `fetch`；网络和文件走 `wx.*` 宿主 API。

### `src/web`（`--mode web`）

- Vite MPA，唯一 HTML entry：`render.html`，输出 `dist/web/`。
- `render.html`：`render.ts` 内联 native Bridge，配合 `createGlassRenderEntry`，每页一个独立 WKWebView。
- 通过 `window.webkit.messageHandlers.tinyRender` 发送 Bridge frames，通过
  `window.__tinyRenderReceive` 接收 HostCore frames。
- render page 不依赖 iframe、MessagePort 或 `host.html`。

### 组装脚本

`ios/scripts/build.mjs`：

1. 调 `pnpm --filter @tiny/host-ios build`（内部先 service 后 web）；
2. 用 `compileMiniProgram` 编译 fixture 到 `ios/.build/<id>/compiled`；
3. 写 `apps/<id>/app-data.json`（manifest、templates 源码、service 源码、全部 WXSS）；
4. 复制 `hosts/ios/dist/web` → `ios/Generated/www`，复制 `hosts/ios/dist/service/service-engine.js`；
5. 复制图片/字体资源，写 `meta.json` 和 `apps.json`。

fixture 通过 `scripts/devtool-apps.mjs` 的 `discoverTestApps()` 自动发现；新增 `tests/apps/<id>/app.json` 后直接跑 `pnpm ios:assets` 即可，展示名可在 `ios/scripts/build.mjs` 的 `APP_LABELS` 里补。

## Bridge 与存储

- `Transport` 两端：
  - service 端在 JSCore：`send(frame) → __tinySend(JSON.stringify(frame))`；Swift `ServiceEngine` 接收。
  - render 端在每页 WKWebView：`send(frame) → tinyRender.postMessage({type:'frame'})`；
    `NativeRenderSurface` 用 `callAsyncJavaScript("window.__tinyRenderReceive(frame)")` 投递。
- 页面 surface 不再使用 iframe 或 MessagePort；HostCore 直接向对应 page 的 WKWebView 转发帧。
- 存储：HostCore `platformCall` 的 `storage.*` 由 `HostCoreRuntime` 处理，值通过 JSON 写入
  `UserDefaults`（前缀 `tiny.storage.<appId>.`），启动时恢复快照。

## 原生 chrome

- 普通页面：原生 nav bar（44pt + 安全区）+ WKWebView + 可选原生 tabBar（50pt + 底部安全区）。
- `navigationStyle: "custom"`：隐藏 nav bar，WebView 延伸到状态栏下方，右上角保留浮动胶囊（关闭）；
  有返回能力时左上角出现浮动返回按钮。
- 无 tabBar 时 WebView 延伸到屏幕底部，页面背景覆盖 home indicator；有 tabBar 时 tabBar 背景延伸到底部安全区。
- 关闭：胶囊 → “关闭小程序” → dismiss；`MiniProgramSession.close()` 停止 JSContext、关闭 HostCore 会话并移除所有 native render surface。
- 不做调试面板；Console/Elements/Lifecycle 需要的话后续在 Web host 层接 vConsole 或另做。

## 已支持/未支持

已支持：

- `tests/apps` 下 7 个 fixture（demo、mini、todo、wechat-demo、echarts、vant、weui）的启动、首屏、页面导航、tab 切换、返回、原生导航栏/tabBar；
- 每页 native WKWebView 的隐藏/恢复、滚动容器、页面 WXSS 隔离；
- `navigateTo` 的 native push 动画、返回的 pop 动画，以及左边缘右滑交互式返回；
- 5 个路由 API、`RUNTIME_STATE` 投影、UserDefaults storage、系统信息和 SwiftUI 原生导航/tabBar；
- **Canvas 2D**：legacy `createCanvasContext` 与 selector-query canvas node 都通过 service 侧录制、
  render `<canvas>` 回放；`measureText` 走 JSCore → CoreText 同步桥；mini ECharts 柱状图已跑通；
- 无 DOM 的 service 线程（`pnpm check:runtime-purity` 仍通过）。

明确不支持（第一版）：

- **Canvas WebGL**：不做远程 WebGL 代理；WebGL 小程序仍会得到空 context。
- **Canvas 同步读回**：`getImageData` / `isPointInPath` / `toDataURL` / `canvasToTempFilePath`
  暂不支持；需要时再补原生 shadow 或异步导出方案。
- **vConsole / 调试面板**：按要求不做；接 vConsole 时在 native render surface 加载即可，不影响 runtime。
- **子包按需加载 / 热更新 / 远程下载**：当前全部产物构建时打进 app bundle。要接 dev server，可在
  `loadMeta` / `loadArtifacts` 前改成 fetch + 缓存，并处理离线/校验。
- **原生网络/登录/媒体 API**：HostCore `platformCall` 目前只完整实现 storage；toast/network/媒体等仍返回占位结果，需要继续补原生 handler。
- **多 app 同时保活**：一次只保留一个 WKWebView + 一个 JSContext；关闭再开另一个。
- **自定义 tabBar / 顶部 tabBar 的完整视觉**：顶部位置有布局分支，但内置 fixture 未覆盖自定义 tabBar。
- **真机签名**：`CODE_SIGNING_ALLOWED=NO` 只用于模拟器；`pnpm ios:device` 使用 Xcode 自动签名，Team 可用 `TINY_IOS_DEVELOPMENT_TEAM` 覆盖。

## 验证记录

在 iPhone 18 Pro / iOS 27 模拟器上：

```text
✅ demo: P0 demo (pages/todos/todos) navigated=true
✅ mini: 自测小程序 (pages/bar/index) navigated=true (legacy canvas + ECharts)
✅ todo: TODO List (pages/index/index) navigated=false (单页)
✅ wechat-demo: 小程序官方组件展示 (page/component/index) navigated=true
✅ echarts: ECharts 图表示例 (pages/index/index) navigated=true
✅ vant: Vant 组件库 (pages/dashboard/index) navigated=true
✅ weui: WeUI for 小程序 (example/index) navigated=true
```

Canvas smoke 额外采样真实 canvas 像素：

```text
✅ mini pages/todos/todos  canvas=11250 px
✅ mini pages/bar/index    canvas=576548 px（ECharts 柱状图）
```

截图在 `ios/.artifacts/`（不提交）。`pnpm ios:smoke:jsc` 在 macOS 的 `jsc` 里启动真实 `service-engine.js` + app-data，
验证 JSCore 侧的 `runtime.bootstrap`。

## 当前迁移状态

Host orchestration 已迁到 Swift：

- `HostCoreRuntime`：UniFFI HostCore ↔ JSCore service ↔ 每页 `NativeRenderSurface`
- `NativeRenderSurface`：独立 WKWebView、`tinyRender` handler、frame queue
- `render.html`：native render Bridge entry
- `MiniProgramSession`：native-only；SwiftUI chrome 使用 HostCore UIState

仍需补齐：

- toast/network/媒体等 native host API（storage 已完成）
- 更强的 native interaction smoke（tap、scroll、Canvas 操作）
- 真机自动化 smoke（device build/install 已跑通）
- 子包按需加载和真机分发签名

HostCore 已经负责 Bridge 会话、页面栈、路由和 UIState；App/Page/Component、setData、WXML 求值和
glass-easel 逻辑树仍留在 JSCore。Swift 只负责页面 surface、宿主 API 和 SwiftUI chrome。
