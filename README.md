# Tiny - 小程序引擎

基于 [glass-easel](https://github.com/wechat-miniprogram/glass-easel) 的小程序引擎：双线程 host、版本化 bridge 协议、独立编译器，以及浏览器调试器。

## 架构

```text
小程序源码 (WXML/WXSS/JS/TS)
        │
        ▼
tools/cli ──► manifest + templates / service / render / styles
        │
        ▼
packages/runtime
├─ service iframe : App/Page/Component 逻辑与 API
├─ render  iframe : glass-easel 组件树与 DOM
└─ bridge         : Tiny Runtime Protocol v1
        │
        ▼
apps/devtool (可选) : DevtoolRuntimeClient + React 面板
```

## 工作区分层

| 层 | 路径 | 作用 |
| --- | --- | --- |
| 核心引擎 | `packages/*` | 被 runtime、工具和应用复用的库 |
| 工具 | `tools/*` | 编译器 / 构建工具 |
| 应用 | `apps/*` | 可独立运行的调试器 |
| 测试 | `tests/*` | 浏览器测试宿主 + 测试小程序（非 workspace 包） |

### 核心包

| Package | 作用 |
| --- | --- |
| `packages/manifest` | 编译产物 / manifest 契约 |
| `packages/template-compiler` | WXML 解析与 ProcGen |
| `packages/stylesheet-compiler` | WXSS、rpx、class/tag 作用域 |
| `packages/runtime` | 双线程 runtime、glass-easel adapter、devtool client |
| `packages/bridge` | 版本化协议、transport、序列化与诊断边界 |
| `packages/components` | 内置组件（view/text/input/swiper/canvas 等） |

### 工具与应用

| Package | 作用 |
| --- | --- |
| `tools/cli` | 编译器：小程序源码 → glass-easel 产物与 manifest |
| `apps/devtool` | 浏览器调试器 |

### 测试

| Path | 作用 |
| --- | --- |
| `tests/host` | 浏览器测试宿主（Vite，加载编译产物） |
| `tests/apps/demo` | P0 验收 demo |
| `tests/apps/mini` | 完整示例（todos / add-todo / bar ECharts / 子包） |
| `tests/apps/todo` | Taro 3 预编译产物 |
| `tests/apps/echarts` | 历史参考示例 |

`tests/host` 与 `apps/devtool` 都基于 `createStandaloneDualThreadHost`：前者是无 UI 的单应用测试宿主，后者通过 `DevtoolRuntimeClient` 提供面板、诊断和元素树。

## 快速开始

环境要求：Node.js ≥ 22（见 `.nvmrc`）与 pnpm 9（仓库已声明 `packageManager`，可执行 `corepack enable`）。

```bash
pnpm install
pnpm accept:glass-easel      # 构建 + 单测 + 四段浏览器验收
```

本地调试：

```bash
pnpm dev:glass-easel         # 编译 tests/apps/demo 并启动测试宿主：http://localhost:5173
pnpm dev:devtool             # 调试器：http://localhost:8080
```

## 常用命令

```bash
pnpm build                   # 构建全部 workspace 包
pnpm lint                    # Biome
pnpm site:dev                # 本地预览架构网站：http://localhost:4173
pnpm site:check              # 检查网站内链
pnpm compile:glass-easel     # tests/apps/demo -> tests/host/generated
pnpm compile:devtool:all     # demo + tests/apps/mini -> devtool 静态目录

pnpm --filter @tiny/runtime test
pnpm --filter @tiny/cli test
pnpm --filter @tiny/components test
```

## 生成物

以下目录是构建产物，不提交：

- `tests/host/generated/`
- `packages/components/src/generated/`
- `apps/devtool/static/`

## 文档

- [在线架构站点](https://yufji.github.io/tiny/)
- [验收指南](docs/acceptance.md)
- [Next 版本技术方案](docs/next.md)
- [架构决策记录](docs/adr)
- [上下文地图](CONTEXT-MAP.md)
- [Agent 指南](AGENTS.md)
- [网站源码](website/README.md)

## License

MIT
