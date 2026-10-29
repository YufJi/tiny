# Tiny iOS 宿主

一个可运行的 iOS 小程序宿主：**SwiftUI 原生壳 + 一个 WKWebView 渲染层 + JavaScriptCore 逻辑层**。
它复用 `@tiny/runtime`、`@tiny/bridge`、`@tiny/host-browser` 的 render entry 和
`@tiny/host-web-components`，不复制小程序运行时语义。

当前验证环境：Xcode 27 / iOS 27 Simulator（iPhone 18 Pro）。最低部署版本 iOS 16。

## 目录

```text
ios/                               原生 iOS App
  TinyHost.xcodeproj/              Xcode 工程（iOS + Mac Catalyst 共用一个 target）
  TinyHost/                        SwiftUI + UIKit/WebKit/JavaScriptCore 代码和资源
  scripts/build.mjs                构建子包 + 编译 fixture + 组装 Generated
  scripts/sim.mjs                  构建、启动模拟器、跑 smoke、截图
  scripts/smoke-service.mjs        macOS jsc 里验证 JSCore engine
  scripts/smoke-web.mjs            Chrome 里验证 WebView host/render
  test/service.html                浏览器 smoke 用的 dev service harness（不随 iOS app 发布）
  Generated/                       组装产物（gitignored）

hosts/ios/                         iOS 的前端标准包（pnpm workspace）
  package.json                     @tiny/host-ios
  tsconfig.json
  vite.config.ts                   一个配置，两种 --mode
  src/
    service/                       JSCore engine、shims、transport
      entry.ts / start.ts / shims.ts / canvas.ts
    web/                           host/render entry、state/storage/pages、HTML/CSS
      host.html / render.html      Vite MPA entry
      canvas.ts                    render 侧 canvas surface / display list 回放
      host.ts / render.ts / ...
  dist/
    service/service-engine.js      vite build --mode service
    web/{host.html,render.html,assets}  vite build --mode web
```

`hosts/ios` 是一个标准前端包：`pnpm --filter @tiny/host-ios build` 会依次构建 service 和 web 两个产物，
也会被根目录的 `pnpm build` 构建。`ios/scripts/build.mjs` 不再自己 bundle JS；它只负责编译 fixture、
写出 app-data、把 `dist/service` 和 `dist/web` 复制到 `ios/Generated`。

## 能力

- 原生 Launcher：自动列出 `tests/apps` 下的全部 fixture（demo、mini、todo、wechat-demo、echarts、vant、weui），点击进入。
- 原生导航栏和 tabBar：标题、返回、关闭胶囊、tab 图标/选中态/badge/redDot，颜色来自页面和 `RUNTIME_STATE`。
- 逻辑层真正跑在 `JSContext`：App/Page/Component、glass-easel 逻辑树、WXML 求值、WXS 表达式、observer/relations/页面栈全部在 JSCore。
- 渲染层跑在 WKWebView：每页一个 render iframe，复用 `createGlassRenderEntry` / `createGlassRenderTree`；
  隐藏页保留 DOM、滚动位置、定时器和页级 WXSS。
- 页面间只走现有 Bridge 协议，没有第二套协议；service 帧经原生中继，render 帧在 WebView 内用 `MessageChannel`。
- 原生存储：启动时把该 app 的 UserDefaults 快照交给 runtime，运行期 `wx.setStorage*` 经宿主 API 落盘。
- 原生系统信息/安全区/菜单按钮几何注入，窗口尺寸变化会触发 runtime `resize`。
- 无调试面板；需要时可在 Web host 层接入 vConsole（见“vConsole”）。

## 架构

```text
┌──────────────────────────── TinyHost.app ─────────────────────────────┐
│ SwiftUI Launcher / Native chrome (nav bar, tabBar, close capsule)     │
│                                                                       │
│  WKWebView  (tinyapp://app/www/host.html?app=demo)                    │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ host shell (host.html + Vite bundle)                            │  │
│  │   createTinyRuntime  ← host orchestration                       │  │
│  │   ├─ page iframe #1 (render.html)                               │  │
│  │   │    createGlassRenderEntry → bootTreeThread → tiny-* DOM     │  │
│  │   ├─ page iframe #2 ...                                         │  │
│  │   └─ host API handlers (storage/toast/request/...)              │  │
│  └───────────────┬─────────────────────────────────────────────────┘  │
│                  │ WKScriptMessageHandler / callAsyncJavaScript        │
│  ┌───────────────▼─────────────────────────────────────────────────┐  │
│  │ native FrameRelay + WKURLSchemeHandler + UserDefaults           │  │
│  └───────────────▲─────────────────────────────────────────────────┘  │
│                  │ JSON Bridge frames                                   │
│  JSContext (service thread)                                           │
│    Generated/service-engine.js  (generic engine)                      │
│    + __TINY_IOS_APP__: manifest/templates/service/styles              │
│    → @tiny/runtime bootServiceThread → glass-easel logic tree         │
└───────────────────────────────────────────────────────────────────────┘
```

**为什么 render 页用 iframe**：一个 WKWebView 里放多个页面，最稳的隔离方式仍然是每页一个 document。
这样页面 WXSS、滚动容器、`onPageScroll` / `onReachBottom` / 下拉手势和隐藏页状态都跟 devtool 的
每页 render iframe 一致，同时不需要为每页创建一个 WKWebView（内存代价太高）。

**为什么原生侧有一个 FrameRelay**：JSCore 和 WKWebView 不共享内存，只能把 Bridge 帧序列化成 JSON
字符串跨边界。render 侧不需要跨原生，所以页面 iframe 之间仍然直接使用 `MessageChannel`。

**为什么 service engine 是通用的**：`hosts/ios` 的 service build 只构建一次运行时引擎（不包含小程序产物）。
原生在求值 engine 前把 `apps/<id>/app-data.json` 注入 `globalThis.__TINY_IOS_APP__`，engine 再启动
对应 app。`templates.js` 的 ESM 入口在运行时转成工厂函数求值，不依赖模块加载器。

## 构建与运行

前置：

```bash
pnpm install
pnpm build:glass-easel   # 至少要有 packages/*、hosts/*、tools/cli 的 dist
```

单独构建前端子包（标准命令）：

```bash
pnpm --filter @tiny/host-ios build          # service + web
pnpm --filter @tiny/host-ios build:service  # -> hosts/ios/dist/service/service-engine.js
pnpm --filter @tiny/host-ios build:web      # -> hosts/ios/dist/web/{host.html,render.html,assets}
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
    host.html
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
```

也可以不依赖模拟器做 JS 层验证：

```bash
pnpm ios:smoke:jsc    # 在 macOS jsc 里启动 demo 的真实 service engine + app-data
pnpm ios:smoke:web    # Chrome 里跑 host.html + render.html，原生桥用 mock
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
2. `TinyWebView` 创建 WKWebView，注册 `tinyapp://` scheme handler、`tinyControl` / `tinyService` message handler，注入 `window.__TINY_IOS__`（系统信息、安全区、菜单按钮、smoke flag）。
3. 同时 `ServiceEngine` 创建 `JSContext`，安装 `__tinySend` / `__tinyLog` / `__tinyError` / `__tinySchedule` 等回调；读取 `Generated/apps/<id>/app-data.json` 注入 `__TINY_IOS_APP__`，再求值 `Generated/service-engine.js`。
4. engine 内 `bootServiceThread` 启动逻辑线程；app 的 `App()` / `Page()` 注册在 service bundle 求值时发生。
5. Web host 载入后定义 `__tinyHostReceive` / `__tinyServiceReady` / `__tinyHostCommand`，向原生发 `hostReady`；
   原生在 service 和 host shell 都就绪后调用 `window.__tinyServiceReady()`。
6. host 创建 `createTinyRuntime`，发 `runtimeReady`，随后 `handshake()` + `bootstrap()`。
7. `bootstrap()` 创建第一页逻辑树和 render iframe；render entry 用 `MessageChannel` 接过 port，
   挂载 `createGlassRenderTree`；service 发 `tree.flow`，host 发 `tree.ready` / `page.ready`。
8. `RUNTIME_STATE` 诊断被 host 投影成 `ui-state`，原生据此更新标题、返回按钮、tabBar 和页面可见性。

`runtimeReady` 是关键门控：service 在 onLaunch 阶段可能已经发出 `api.storage.set` 等帧，host 的
BridgeConnection 和 transport 还没安装；原生的 FrameRelay 会先排队，等 host 真正创建 runtime
后再按顺序放行。否则会丢帧或把 message port 的握手顺序打乱。

## 子包与产物

### `src/service`（`--mode service`）

- Vite lib 模式，单个 IIFE 入口 `src/service/entry.ts`，输出 `dist/service/service-engine.js`。
- 依赖 `@tiny/runtime`、`@tiny/bridge`；`@tiny/runtime` / `@tiny/host-browser` 的 dist 还是 CommonJS，Vite 用 `commonjsOptions` 处理，其他 workspace 包直接走 package exports。
- 提供 JSCore 缺失的 shims：原生定时器、`console`、`queueMicrotask`、`URLSearchParams`、
  `TextEncoder` / `TextDecoder`、`atob` / `btoa`、`structuredClone`、`performance.now`。
- 不提供 `document` / `window` / `fetch`；网络和文件走 `wx.*` 宿主 API。

### `src/web`（`--mode web`）

- Vite MPA，两个 HTML entry：`host.html` 和 `render.html`，共享 `assets/` chunk；输出 `dist/web/`。
- `host.html`：`createTinyRuntime`、每页 render connector、宿主 API、状态投影。
- `render.html`：`bootBrowserRenderEntry` + `createGlassRenderEntry`，每页一个 iframe。
- 输出扁平结构，原生直接加载 `tinyapp://app/www/host.html`，render iframe 加载
  `tinyapp://app/www/render.html`；不再使用 `host/index.html` 这种只为产物拆的目录。

### 组装脚本

`ios/scripts/build.mjs`：

1. 调 `pnpm --filter @tiny/host-ios build`（内部先 service 后 web）；
2. 用 `compileMiniProgram` 编译 fixture 到 `ios/.build/<id>/compiled`；
3. 写 `apps/<id>/app-data.json`（manifest、templates 源码、service 源码、全部 WXSS）；
4. 复制 `hosts/ios/dist/web` → `ios/Generated/www`，复制 `hosts/ios/dist/service/service-engine.js`；
5. 复制图片/字体资源，写 `meta.json` 和 `apps.json`。

fixture 通过 `scripts/devtool-apps.mjs` 的 `discoverTestApps()` 自动发现；新增 `tests/apps/<id>/app.json` 后直接跑 `pnpm ios:assets` 即可，展示名可在 `ios/scripts/build.mjs` 的 `APP_LABELS` 里补。

## Bridge 与存储

- `Transport` 的两端：
  - service 端在 JSCore：`send(frame) → __tinySend(JSON.stringify(frame))`；原生调用
    `__tinyReceiveFrame(json)` 进入监听器。
  - host 端在 WebView：`send(frame) → webkit.messageHandlers.tinyService.postMessage({type:'frame', frame})`；
    原生用 `callAsyncJavaScript("window.__tinyHostReceive(frame)")` 投递。
- render 端不经过原生：`PageFrameConnector.connect(pageId)` 创建 iframe，等
  `tiny-runtime-port-ready` 后用 `MessageChannel` 转移 port。
- 存储：`storage.get/set/remove/clear/info` 被 host 覆盖为原生 UserDefaults 调用；启动时 `all` 一次
  拿到快照放进 `createTinyRuntime({ storage })`，保证 `getStorageSync` 首次读取正确。UserDefaults key
  前缀是 `tiny.storage.<appId>.`。
- 存储值以 JSON 字符串写入 UserDefaults；`NSNull`、数字、布尔、对象、数组都支持。

## 原生 chrome

- 普通页面：原生 nav bar（44pt + 安全区）+ WKWebView + 可选原生 tabBar（50pt + 底部安全区）。
- `navigationStyle: "custom"`：隐藏 nav bar，WebView 延伸到状态栏下方，右上角保留浮动胶囊（关闭）；
  有返回能力时左上角出现浮动返回按钮。
- 无 tabBar 时 WebView 延伸到屏幕底部，页面背景覆盖 home indicator；有 tabBar 时 tabBar 背景延伸到底部安全区。
- 关闭：胶囊 → “关闭小程序” → dismiss；`dismantleUIView` 会停止 JSContext、关闭 BridgeConnection、移除 iframe。
- 不做调试面板；Console/Elements/Lifecycle 需要的话后续在 Web host 层接 vConsole 或另做。

## 已支持/未支持

已支持：

- `tests/apps` 下 7 个 fixture（demo、mini、todo、wechat-demo、echarts、vant、weui）的启动、首屏、页面导航、tab 切换、返回、原生导航栏/tabBar；
- 页面 iframe 的隐藏/恢复、滚动容器、页面 WXSS 隔离；
- 5 个路由 API、`RUNTIME_STATE` 投影、storage、系统信息、toast/modal/loading 等宿主 UI（Web overlay）；
- **Canvas 2D**：legacy `createCanvasContext` 与 selector-query canvas node 都通过 service 侧录制、
  render `<canvas>` 回放；`measureText` 走 JSCore → CoreText 同步桥；mini ECharts 柱状图已跑通；
- 无 DOM 的 service 线程（`pnpm check:runtime-purity` 仍通过）。

明确不支持（第一版）：

- **Canvas WebGL**：不做远程 WebGL 代理；WebGL 小程序仍会得到空 context。
- **Canvas 同步读回**：`getImageData` / `isPointInPath` / `toDataURL` / `canvasToTempFilePath`
  暂不支持；需要时再补原生 shadow 或异步导出方案。
- **vConsole / 调试面板**：按要求不做；接 vConsole 时在 `hosts/ios/src/web/host.html` 或
  `hosts/ios/src/web/host.ts` 里同步加载即可，不影响 runtime。
- **子包按需加载 / 热更新 / 远程下载**：当前全部产物构建时打进 app bundle。要接 dev server，可在
  `loadMeta` / `loadArtifacts` 前改成 fetch + 缓存，并处理离线/校验。
- **原生网络/登录/媒体 API**：`network.request` 仍使用 WKWebView 里的 `fetch`（受 CORS 限制）；
  要绕开 CORS 或接原生能力，需要把 `apiHandlers` 换成原生桥。
- **多 app 同时保活**：一次只保留一个 WKWebView + 一个 JSContext；关闭再开另一个。
- **自定义 tabBar / 顶部 tabBar 的完整视觉**：顶部位置有布局分支，但内置 fixture 未覆盖自定义 tabBar。
- **真机签名**：`CODE_SIGNING_ALLOWED=NO` 只用于模拟器；真机需要在 Xcode 里选择自己的 Team。

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

截图在 `ios/.artifacts/`（不提交）。`pnpm ios:smoke:jsc` 在 macOS 的 `jsc` 里启动真实
`service-engine.js` + app-data，验证 JSCore 侧的 `runtime.bootstrap`；`pnpm ios:smoke:web` 在 Chrome
里用 mock 原生桥验证 host.html + render.html + 导航，便于在没有模拟器时排查 Web 层问题。

## 后续：把 host 编排收敛到 Swift（待办）

当前 host 编排在 `hosts/ios/src/web/host.ts`：`createTinyRuntime`、页面栈、每页 render connector、
Host API、storage 和 `RUNTIME_STATE` 投影都在 WebView 里。后续需要把这层**host orchestration**
搬到 Swift，WebView 只保留页面渲染。

迁移边界：

- **保留不动**：Bridge 协议与 `Transport`、JSCore service engine、`@tiny/host-web-components` 的
  render entry、`render.html` 的页面渲染职责。
- **搬到 Swift**：host 侧 `BridgeConnection`、页面栈与导航、render 容器/iframe 生命周期、
  `HostApiRegistry`、storage、`systemInfo`/`resize`、`RUNTIME_STATE` → 原生 chrome 的状态投影。
- **渲染容器待定**：可以继续用一个 WKWebView + 每页 iframe，由 Swift 通过一个很薄的 JS relay 转发
  tree/patch/event；也可以改成每页一个 WKWebView，让 Swift 直接做 render connector。后者隔离更强但
  内存占用更高，需要在实现前用 `ios:sim` 做一次对比。
- **不能搬**：App/Page/Component、setData、WXML 求值和 glass-easel 逻辑树必须留在 JSCore。
- **验收**：沿用 `pnpm ios:sim` 的全 fixture smoke，并补一条“Swift host 编排”的页面栈/导航/tab
  smoke；`pnpm ios:smoke:web` 只适合验证 WebView render 层。

这样做的收益是原生层可以直接控制页面生命周期、导航转场、多窗口/多实例和原生渲染容器；
代价是 Swift 要重新实现一套 host 编排，Web host 层的浏览器 API 也要改为原生实现。
