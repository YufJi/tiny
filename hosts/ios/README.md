# @tiny/host-ios

iOS 宿主的 native adapter。Web render tree 和 render entry 复用
`@tiny/host-web`；本包只保留 iOS 特有的部分：

- JSCore service engine（`src/service`：shims、native transport、Canvas display-list 录制，
  以及读取实时宿主事实的 `getSystemInfoSync` / `getWindowInfo` / `getDeviceInfo` /
  `getAppBaseInfo` / `getMenuButtonBoundingClientRect` 扩展）
- 每页 WKWebView 的 native transport 与 Canvas 回放（`src/web`）
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
