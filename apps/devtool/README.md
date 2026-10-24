# devtool

Tiny 运行时调试器。

## 启动

```bash
pnpm dev:devtool
# http://localhost:8080/
```

`dev:devtool` 会编译 `tests/apps/demo`（demo）和 `tests/apps/mini`（真实示例）到
`apps/devtool/static/runtime/apps/*/generated`，启动两个 watcher，再启动 rspack
dev server。编译完成后在面板点 `Reload` 加载新产物。

devtool 是 `apps/` 下的可运行应用，不是核心包；它与 `tests/host` 的区别是：

- `tests/host`：无 UI、单应用、供开发与 Playwright 验收
- `apps/devtool`：React 面板、多应用切换、诊断/元素树/生命周期控制

## 结构

```text
src/next/
├── main.jsx           # 入口，挂载 RuntimePanel
├── runtimePanel.jsx   # React 面板（状态、诊断、元素树、控制）
├── runtimeService.js  # service 线程入口
└── runtimeRender.js   # render 线程入口
src/store/
├── index.js           # rematch store
└── models/runtime.js  # 运行时状态投影
```

- 宿主编排、生命周期控制和状态投影都在 `@tiny/runtime` 的 `DevtoolRuntimeClient`
- 面板只通过 client 订阅状态和发送控制命令
- 线程页从 `/runtime/apps/<app>/generated` 读取 manifest、templates、styles
- `static/runtime/apps/*/generated` 是编译产物，已 gitignore

## 验收

调试器流程已包含在 `pnpm accept:glass-easel`：启动、状态投影、渲染、导航/返回、
应用切换、Reload/Terminate、控制台零报错。
