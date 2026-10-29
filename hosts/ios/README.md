# @tiny/host-ios

iOS 宿主的前端标准包。所有源码都在 `src/`，一个 Vite 配置通过两种 mode 输出两份产物：

| 命令 | 入口 | 产物 |
| --- | --- | --- |
| `vite build --mode service` | `src/service/entry.ts` | `dist/service/service-engine.js`：通用 JavaScriptCore service engine |
| `vite build --mode web` | `src/web/host.html`、`src/web/render.html` | `dist/web/host.html`、`dist/web/render.html`、`dist/web/assets/*` |

```bash
pnpm --filter @tiny/host-ios build          # 两份都构建
pnpm --filter @tiny/host-ios build:service
pnpm --filter @tiny/host-ios build:web
pnpm --filter @tiny/host-ios typecheck
```

`ios/scripts/build.mjs` 会把 `dist/service` / `dist/web` 收集进 `ios/Generated/`，并编译
`tests/apps` 下全部 fixture（demo、mini、todo、wechat-demo、echarts、vant、weui）、写 `apps/<id>/app-data.json`。原生工程在
[`ios/`](../../ios)，完整说明见 [`ios/README.md`](../../ios/README.md)。
