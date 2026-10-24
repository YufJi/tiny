# Tiny - 小程序引擎

一个基于 [glass-easel](https://github.com/wechat-miniprogram/glass-easel) 的小程序引擎实现：双线程 host、版本化 bridge 协议，以及浏览器调试器。

## 架构

```
小程序源码 (WXML/WXSS/JS)
        │
        ▼
cli ──► manifest + templates/service/render/styles
        │
        ▼
runtime (host)
├─ service iframe : App/Page/Component 逻辑、API
├─ render  iframe : glass-easel 组件树与 DOM
└─ bridge         : Tiny Runtime Protocol v1
        │
        ▼
devtool (可选) : DevtoolRuntimeClient + React 面板
```

## Packages

| Package | 作用 |
| --- | --- |
| `packages/cli` | 活跃编译器：小程序源码 → glass-easel 产物与 manifest |
| `packages/template-compiler` | WXML/ProcGen 编译 |
| `packages/stylesheet-compiler` | WXSS 编译、rpx、class/tag 作用域 |
| `packages/runtime` | 双线程 runtime、glass-easel adapter、DevtoolRuntimeClient |
| `packages/bridge` | 版本化协议、transport、序列化与诊断边界 |
| `packages/components` | 内置组件（view/text/input/swiper/canvas 等） |
| `packages/devtool` | 浏览器调试器 |

## 快速开始

环境要求：Node.js ≥ 22（见 `.nvmrc`，可执行 `nvm use`）与 pnpm 9（仓库已声明 `packageManager`，可执行 `corepack enable` 自动对齐）。

```bash
pnpm install
pnpm accept:glass-easel      # 构建 + 单测 + 三段浏览器验收
```

本地调试：

```bash
pnpm dev:glass-easel         # P0 demo：http://localhost:5173
pnpm dev:devtool             # 调试器：http://localhost:8080
```

## 测试小程序

- `hosts/browser`：浏览器调试宿主（Vite，加载编译产物；不是小程序）
- `test-apps/demo`：P0 验收用的小程序 demo
- `test-apps/mini`：完整示例（todos / add-todo / bar ECharts / 子包页面）
- `test-apps/todo`：Taro 3 预编译产物，已纳入验收（webpack/WXS/递归模板兼容）
- `test-apps/echarts`：历史示例，保留参考

```bash
pnpm compile:glass-easel     # 编译 test-apps/demo
pnpm compile:devtool:all     # 编译 demo + test-apps/mini 到调试器静态目录
```

## 文档

- [Next 版本技术方案](docs/next.md)
- [P0 验收路径](docs/acceptance.md)
- [架构决策记录](docs/adr)
- [Agent 指南](AGENTS.md)

## License

MIT
