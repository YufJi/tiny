# Tiny - 小程序引擎

[![CI](https://github.com/YufJi/tiny/actions/workflows/ci.yml/badge.svg?branch=next)](https://github.com/YufJi/tiny/actions/workflows/ci.yml)

基于 [glass-easel](https://github.com/wechat-miniprogram/glass-easel) 的小程序引擎：双线程 host、版本化 bridge 协议、独立编译器，以及浏览器调试器。

**在线体验**：[Tiny 调试器在线版](https://yufji.github.io/tiny/devtool/index.html)，无需本地构建，可直接选择 `tests/apps` 下的示例应用运行。

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
hosts/web-components ──► 内置组件定义与样式，注入 render 线程
        │
        ▼
packages/runtime : 双线程内核（不依赖 DOM）
├─ service iframe : App/Page/Component 逻辑与 API
├─ render  iframe : glass-easel 组件树；devtool 为每个页面创建独立 render 帧
└─ bridge         : Tiny Runtime Protocol v1
        │
        ▼
apps/devtool (可选) : DevtoolRuntimeClient + React 面板（多 iframe 页面栈 / 生命周期时间线）
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

### 工具与应用

| Package | 作用 |
| --- | --- |
| `tools/cli` | 编译器：小程序源码 → glass-easel 产物与 manifest |
| `apps/devtool` | 浏览器调试器 |
| `hosts/browser` | 浏览器宿主：iframe、MessageChannel、Canvas、devtool overlay |
| `hosts/web-components` | 内置组件的 Web/DOM 实现（view/text/input/swiper/canvas 等），注入 render 线程 |

### 测试

| Path | 作用 |
| --- | --- |
| `tests/host` | 浏览器测试宿主（Vite，加载编译产物） |
| `tests/apps/demo` | P0 验收 demo |
| `tests/apps/mini` | 完整示例（todos / add-todo / bar ECharts / 子包） |
| `tests/apps/todo` | Taro 3 预编译产物 |
| `tests/apps/wechat-demo` | 微信官方组件/API 示例子集 |
| `tests/apps/echarts` | 历史参考示例 |

`tests/host` 与 `apps/devtool` 都基于 `@tiny/host-browser` 的 `createStandaloneDualThreadHost`，浏览器宿主固定为每页一个 render iframe。前者是无 UI 的单应用测试宿主；后者通过 `DevtoolRuntimeClient` 提供测试应用列表、最近 3 个应用保活/LRU、面板、诊断、生命周期时间线、元素树和内置 tabBar。每个应用页面栈默认最多 10 层，宿主可通过 `maxPageStack` 配置。

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

## 兼容输入与内部命名

接入侧的小程序格式通过 `tiny.config.json` 的 `compatibility` 配置；未填写字段按微信规则解析。Tiny 编译产物和运行时内部名称始终使用固定的 `tiny-*` 命名，不受接入侧配置影响。

```json
{
  "compatibility": {
    "extensions": {
      "script": [".js", ".ts"],
      "template": [".wxml"],
      "style": [".wxss"],
      "templateScript": [".wxs", ".sjs"],
      "config": [".json"]
    },
    "files": {
      "appConfig": "app.json",
      "projectConfig": "project.config.json"
    },
    "directiveNamespace": "wx",
    "api": {
      "global": "wx",
      "aliases": []
    },
    "globals": {
      "app": "App",
      "page": "Page",
      "component": "Component",
      "behavior": "Behavior",
      "getApp": "getApp",
      "getCurrentPages": "getCurrentPages"
    },
    "behaviorScheme": "wx://"
  }
}
```

| 配置项 | 默认值 | 影响 |
| --- | --- | --- |
| `compatibility.extensions.*` | 微信扩展名 | 脚本、模板、样式、模板脚本和配置文件的发现规则 |
| `compatibility.files.*` | `app.json` / `project.config.json` | 小程序入口配置与项目配置文件 |
| `compatibility.directiveNamespace` | `wx` | 模板指令命名空间：`wx:if` |
| `compatibility.api.global` | `wx` | service 线程 API 全局对象 |
| `compatibility.api.aliases` | `[]` | 额外安装的 API 全局别名，便于第三方库过渡 |
| `compatibility.globals.*` | `App` / `Page` / ... | 最小程序注册和查询全局名 |
| `compatibility.behaviorScheme` | `wx://` | 组件 behavior 的接入侧 URI scheme |
| `compatibility.opaqueGlobals` | `__wxConfig` 等 | 第三方兼容代码会探测、但不应生成不支持 API 的全局名 |

兼容配置只影响输入解析和运行期兼容全局。除 glass-easel 当前仍硬编码的两个属性外，编译产物和执行时内部名称统一使用 Tiny 命名：

| 内部对象 | 当前内部名称 |
| --- | --- |
| page/component host tag | `tiny-page`、`tiny-add-button` |
| 内置组件 host tag | `tiny-view`、`tiny-button` |
| 内置 glass-easel definition | `tiny-builtin:view` |
| style scope | `tiny-<path>` |
| tag marker | `tiny-tag-button` |
| scope marker | `tiny-scope` |
| host attribute | `wx-host`（临时同步 glass-easel） |
| style scope attribute | `wx-style-scope`（临时同步 glass-easel） |
| 内置 behavior | `tiny-base`、`tiny-item` 等 |
| 内置 behavior scheme | `tiny://` |

编译器会把运行时仍需要的兼容信息写入 `manifest.json` 的 `runtimeCompatibility`；内部 Tiny 名称由 `@tiny/manifest` 的 `TINY_ENGINE_NAMING` 统一提供。当前 manifest schema 为 `2`。`compileMiniProgram({ compatibility })` 可覆盖配置文件中的同名字段。

`glass-easel@1.1.0` 没有公开配置 host/style scope 属性名的 API。当前不使用 patch，也不在 runtime 观察或改写 DOM，而是让 `TINY_ENGINE_NAMING.hostAttribute` / `styleScopeAttribute` 暂时同步为 `wx-host` / `wx-style-scope`。后续处理见 [known issue](docs/known-issues/glass-easel-naming.md)。

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
pnpm --filter @tiny/host-web-components test
```

## 生成物

以下目录是构建产物，不提交：

- `tests/host/generated/`
- `hosts/web-components/src/generated/`
- `apps/devtool/static/`

## 文档

- [在线架构站点](https://yufji.github.io/tiny/)
- [文档索引](docs/README.md)：验收指南、微信对齐度、组件对齐状态、ADR
- [上下文地图](CONTEXT-MAP.md)
- [Agent 指南](AGENTS.md)
- [网站源码](website/README.md)

## 致谢

本项目基于微信小程序团队开源的 [glass-easel](https://github.com/wechat-miniprogram/glass-easel) 构建：
render 线程的组件树、behavior 机制与模板执行均由它承载，`hosts/web-components` 的内置组件也经由
`packages/runtime` 的适配层接入。

## License

MIT
