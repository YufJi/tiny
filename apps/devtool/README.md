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

devtool 是 `apps/` 下的可运行应用，不是核心包；它与 `tests/host` 的区别是：

- `tests/host`：无 UI、单应用、供开发与 Playwright 验收
- `apps/devtool`：React 面板、多应用切换、诊断/元素树/生命周期控制

## 结构

```text
src/next/
├── main.jsx           # 入口，挂载 RuntimePanel
├── runtimePanel.jsx   # React 面板（应用选择、状态、诊断、元素树、控制）
├── runtimeService.js  # service 线程入口
└── runtimeRender.js   # render 线程入口
src/store/
├── index.js           # rematch store
└── models/runtime.js  # 运行时状态投影
```

- 宿主编排、生命周期控制和状态投影都在 `@tiny/runtime` 的 `DevtoolRuntimeClient`
- 面板只通过 client 订阅状态和发送控制命令
- 面板先从 `/runtime/apps.json` 读取应用清单，再从
  `/runtime/apps/<app>/generated` 读取 manifest、templates、styles
- 线程页通过 `?app=<app>` 定位同一个产物目录
- `static/runtime/apps/*/generated` 和 `static/runtime/apps.json` 是编译产物，已 gitignore

## 验收

调试器流程已包含在 `pnpm accept:glass-easel`：启动、状态投影、渲染、导航/返回、
依次预览每个 `tests/apps` 测试应用、Reload/Terminate、控制台零报错。
