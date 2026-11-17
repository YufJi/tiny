# @tiny/host-ios

iOS 宿主的 native adapter。Web render tree 和 render entry 复用
`@tiny/host-web`；本包只保留 iOS 特有的部分：

- JSCore service engine（`src/service`：shims、native transport、Canvas display-list 录制，
  以及读取实时宿主事实的 `getSystemInfoSync` / `getWindowInfo` / `getDeviceInfo` /
  `getAppBaseInfo` / `getMenuButtonBoundingClientRect` 扩展）
- 每页 WKWebView 的 native transport 与 Canvas 回放（`src/web`）
- WKWebView render host events：页面可见性与原生键盘高度转发；
  `NativeRenderSurface` 会在 WebView ready 前缓存事件，ready 后按顺序投递
- 页面级 `NativeSameLayerHost`：render 通过 `nativeView.attach/update/detach` 上报原生视图的
  content frame、marker 和样式；iOS 宿主找到 WebKit 为 `overflow: scroll` 占位层生成的
  `WKChildScrollView`，把原生输入控件挂进该滚动子树。没有页面级 overlay 回退
- WKWebView render 入口会在树挂载前声明 `keyboardMode: native`，内置 input/textarea
  据此进入原生输入模式；原生 first responder、键盘配置与输入 accessory 由 iOS 宿主实现，
  同类型输入框切换时复用同一 native first responder，不销毁重建键盘
- input/textarea 的模板和逻辑按宿主拆分：Web/devtool 走 `template.wxml` + `dom-host.ts`，
  iOS 走 `template.native.wxml` + `native-host.ts`；native 模板按微信同层结构保留
  `container/inner/placeholder`，textarea 的 `native-textarea` 只作为自动高度测量和
  原生控件接管前的透明内容层
- input/textarea 还提供 WebKit child-scroll-view 同层路径：native 占位层设置
  `overflow: scroll`，`NativeSameLayerHost` 按 content frame 查找
  `WKCompositingView/WKChildScrollView` 并把原生控件挂入；找不到内部视图时重试若干帧，
  仍失败则让 `showKeyboard` 明确失败。该路径依赖 WebKit 内部类，需按 iOS 版本回归
- 原生注入编译后的 render templates，并在 renderer/WXS 初始化后求值，避免
  `tinyapp://` 自定义 scheme 的 `fetch()` 在真机上不可用

一个 Vite 配置通过两种 mode 输出两份产物：

| 命令 | 入口 | 产物 |
| --- | --- | --- |
| `vite build --mode service` | `src/service/entry.ts` | `dist/service/service-engine.js`：通用 JavaScriptCore service engine |
| `vite build --mode web` | `src/web/render.html` | `dist/web/render.html`、`dist/web/assets/*`：native HostCore 的每页 WKWebView render entry |

```bash
pnpm --filter @tiny/host-ios build          # 两份都构建
pnpm --filter @tiny/host-ios build:service
pnpm --filter @tiny/host-ios build:web
pnpm --filter @tiny/host-ios typecheck
```

`ios/scripts/build.mjs` 会把 `dist/service` / `dist/web` 收集进 `ios/Generated/`，并编译
`tests/apps` 下全部 fixture（demo、mini、todo、wechat-demo、echarts、vant、weui）、写 `apps/<id>/app-data.json`；Canvas 2D 的 service 录制器在 `src/service/canvas.ts`，render 回放在 `src/web/canvas.ts`。原生工程在
[`ios/`](../../ios)，完整说明见 [`ios/README.md`](../../ios/README.md)。
