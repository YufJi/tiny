# Tiny - 小程序引擎

[![CI](https://github.com/YufJi/tiny/actions/workflows/ci.yml/badge.svg?branch=next)](https://github.com/YufJi/tiny/actions/workflows/ci.yml)

基于 [glass-easel](https://github.com/wechat-miniprogram/glass-easel) 的小程序引擎：双线程 host、版本化 bridge 协议、独立编译器，以及浏览器调试器。

## 架构

```text
小程序源码 (WXML/WXSS/JS/TS)
        │
        ▼
tools/cli ──► manifest + templates / service / render / styles
        │
        ▼
hosts/browser ──► iframe / MessageChannel / Canvas / devtool overlay
        │
        ▼
packages/runtime : 双线程内核（不依赖 DOM）
├─ service iframe : App/Page/Component 逻辑与 API
├─ render  iframe : glass-easel 组件树，DOM backend 由宿主注入
└─ bridge         : Tiny Runtime Protocol v1
        │
        ▼
apps/devtool (可选) : DevtoolRuntimeClient + React 面板
```

## 工作区分层

| 层 | 路径 | 作用 |
| --- | --- | --- |
| 核心引擎 | `packages/*` | 与宿主无关的库 |
| 宿主适配 | `hosts/*` | 浏览器等环境适配，不属于内核 |
| 工具 | `tools/*` | 编译器 / 构建工具 |
| 应用 | `apps/*` | 可独立运行的调试器 |
| 测试 | `tests/*` | 浏览器测试宿主 + 测试小程序（非 workspace 包） |

### 核心包

| Package | 作用 |
| --- | --- |
| `packages/manifest` | 编译产物 / manifest 契约 |
| `packages/template-compiler` | WXML 解析与 ProcGen |
| `packages/stylesheet-compiler` | WXSS、rpx、class/tag 作用域 |
| `packages/runtime` | 双线程 runtime 内核（无宿主依赖） |
| `packages/bridge` | 版本化协议、transport、序列化与诊断边界 |
| `packages/components` | 内置组件（view/text/input/swiper/canvas 等） |

### 工具与应用

| Package | 作用 |
| --- | --- |
| `tools/cli` | 编译器：小程序源码 → glass-easel 产物与 manifest |
| `apps/devtool` | 浏览器调试器 |
| `hosts/browser` | 浏览器宿主：iframe、MessageChannel、Canvas、devtool overlay |

### 测试

| Path | 作用 |
| --- | --- |
| `tests/host` | 浏览器测试宿主（Vite，加载编译产物） |
| `tests/apps/demo` | P0 验收 demo |
| `tests/apps/mini` | 完整示例（todos / add-todo / bar ECharts / 子包） |
| `tests/apps/todo` | Taro 3 预编译产物 |
| `tests/apps/wechat-demo` | 微信官方组件/API 示例子集 |
| `tests/apps/echarts` | 历史参考示例 |

`tests/host` 与 `apps/devtool` 都基于 `createStandaloneDualThreadHost`：前者是无 UI 的单应用测试宿主，后者通过 `DevtoolRuntimeClient` 提供面板、诊断和元素树。

## 快速开始

环境要求：Node.js ≥ 22（见 `.nvmrc`）与 pnpm 9（仓库已声明 `packageManager`，可执行 `corepack enable`）。

```bash
pnpm install
pnpm accept:glass-easel      # 构建 + 单测 + 五段浏览器验收
```

本地调试：

```bash
pnpm dev:glass-easel         # 编译 tests/apps/demo 并启动测试宿主：http://localhost:5173
pnpm dev:devtool             # 调试器：http://localhost:8080（可切换全部 tests/apps）
```

调试器会扫描 `tests/apps/*` 并为每个应用生成产物与 watcher；顶部下拉框可预览全部测试应用，
也支持 `http://localhost:8080/?app=wechat-demo` 这样的深链。

## 命名配置

引擎默认使用微信兼容的 `wx-` 命名空间；组件、API、编译器三侧的前缀都可以通过
`tiny.config.json` 统一切换（默认可不提供该文件）：

```json
{
  "naming": {
    "prefix": "tiny-",
    "apiAliases": ["wx"]
  }
}
```

| 配置项 | 默认值 | 影响 |
| --- | --- | --- |
| `naming.prefix` | `wx-` | 由它派生下面所有名字；`tiny-` 即切换为 Tiny 命名空间 |
| `naming.directive` | 前缀去掉 `-` | 模板指令命名空间：`wx:if` / `tiny:if` |
| `naming.api` | 前缀去掉 `-` | service 线程全局 API 对象：`wx.*` / `tiny.*` |
| `naming.apiAliases` | `[]` | 额外挂载的 API 全局别名，便于第三方库过渡（如 `["wx"]`） |

派生结果：

| 位置 | `prefix: "wx-"` | `prefix: "tiny-"` |
| --- | --- | --- |
| 模板指令 | `wx:if`、`wx:for` | `tiny:if`、`tiny:for` |
| 全局 API | `wx.getStorageSync()` | `tiny.getStorageSync()` |
| 内置组件 behavior | `wx-base`、`wx-hover` | `tiny-base`、`tiny-hover` |
| 内置 behavior scheme | `wx://component-export` | `tiny://component-export` |
| 组件宿主属性 | `wx-host` | `tiny-host` |
| tag 选择器标记类 | `wx-tag-button` | `tiny-tag-button` |

编译器会把解析后的配置写入 `manifest.json` 的 `naming` 字段，render/service 线程据此
保持一致。`compileMiniProgram({ naming })` 也可直接覆盖配置；内置组件标签本身
（`<view>`、`<button>` 等）不参与前缀。

## 常用命令

```bash
pnpm build                   # 构建全部 workspace 包
pnpm lint                    # Biome
pnpm site:dev                # 构建内嵌 devtool 并本地预览：http://localhost:4173
pnpm site:devtool            # 只重建 website/.cache/site-public/devtool
pnpm site:build              # 构建内嵌 devtool + website/dist
pnpm site:check              # 构建并检查产物资源（含 dist/devtool）
pnpm compile:glass-easel     # tests/apps/demo -> tests/host/generated
pnpm compile:devtool:all     # 全部 tests/apps -> devtool 静态目录
pnpm compile:wechat-demo     # 微信官方组件/API 示例 -> tests/host/generated
pnpm check:runtime-purity    # 校验 runtime 内核无宿主全局依赖
pnpm dev:wechat-demo         # 微信示例宿主：http://127.0.0.1:5174/?path=page/component/index

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
- [微信 WebView 版功能对齐度分析](docs/wechat-webview-parity.md)
- [Next 版本技术方案](docs/next.md)
- [架构决策记录](docs/adr)
- [上下文地图](CONTEXT-MAP.md)
- [Agent 指南](AGENTS.md)
- [网站源码](website/README.md)

## License

MIT
