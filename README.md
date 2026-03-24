# Tiny v1 - 小程序引擎

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/pnpm-9.0.0-orange.svg" alt="pnpm">
  <img src="https://img.shields.io/badge/turborepo-2.x-green.svg" alt="Turborepo">
</p>

一个对标微信小程序的轻量级小程序引擎实现，采用双线程架构（逻辑层 + 渲染层），支持在浏览器环境中运行小程序。

## ✨ 特性

- **双线程架构**：基于 iframe 实现逻辑层（Service）和渲染层（WebView）分离，符合小程序安全模型
- **自定义组件系统**：基于 Web Components + Virtual DOM 实现高性能组件渲染
- **JSBridge 通信**：完整的逻辑层与渲染层通信机制，支持同步/异步 API 调用
- **编译器支持**：将小程序 WXML/WXSS/JS 编译为可在浏览器运行的代码
- **浏览器调试器**：基于 React 开发的 Web 调试工具，支持真机调试体验
- **现代构建工具**：使用 pnpm + Turborepo + Rspack 构建，极速开发体验

## 📦 项目结构

```
tiny-v1/
├── packages/
│   ├── base/           # 小程序基础库 - 核心运行时
│   ├── compiler/       # 小程序编译器 - 构建工具
│   └── devtool/        # Web 调试器 - 开发调试工具
├── example/            # 示例小程序项目
├── pnpm-workspace.yaml # pnpm 工作区配置
└── turbo.json          # Turborepo 任务管道配置
```

### 1. Base - 基础库

小程序核心运行时，提供双线程架构支持：

**Service（逻辑层）**
- `src/service/` - 逻辑层代码，在独立 iframe 中运行
- 实现 Page、Component、App 注册机制
- 提供小程序 API（网络、存储、路由等）
- JSBridge 调用封装

**WebView（渲染层）**
- `src/webview/` - 渲染层代码，负责 UI 渲染
- 基于 Custom Elements 的组件系统
- Virtual DOM 差异化更新
- 事件处理系统

**核心模块**
- `web-components/` - 小程序组件实现（view、text、image、swiper 等）
- `js-bridge/` - JSBridge 通信机制
- `shared/` - 逻辑层与渲染层共享代码

### 2. Compiler - 编译器

将小程序源代码编译为可运行代码：

- **模板编译**：WXML → JS 渲染函数
- **样式处理**：WXSS → CSS（支持 rpx 单位转换）
- **脚本转换**：ES6+ → ES5，支持 npm 依赖
- **SJS 支持**：小程序逻辑脚本编译

### 3. Devtool - 调试器

基于 React 的 Web 调试工具：

- 多 iframe 架构模拟双线程环境
- 模拟器界面（手机外壳 + 状态栏）
- JSBridge API 模拟实现
- 支持热更新开发模式

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9.0.0

### 安装依赖

```bash
# 安装项目依赖
pnpm install
```

### 开发模式

```bash
# 1. 构建基础库（开发模式）
cd packages/base && pnpm run dev

# 2. 启动调试器（新终端）
cd packages/devtool && pnpm run dev

# 3. 编译示例小程序（新终端）
cd example && NODE_ENV=development node ./scripts/compile.js --root ./mini
```

调试器默认运行在 http://localhost:8080

### 构建生产版本

```bash
# 构建所有包
pnpm run build

# 单独构建
pnpm --filter base2.0 run build
pnpm --filter devtool run build
```

### 代码检查

```bash
pnpm run lint
```

## 🏗️ 架构设计

### 双线程模型

```
┌─────────────────────────────────────────────────────────────┐
│                        宿主环境（浏览器）                      │
│  ┌──────────────────────┐      ┌──────────────────────────┐  │
│  │     Service          │      │       WebView            │  │
│  │   （逻辑层 iframe）   │◄────►│    （渲染层 iframe）      │  │
│  │                      │      │                          │  │
│  │  • App/Page/Component │      │  • Web Components        │  │
│  │  • 数据逻辑处理        │      │  • Virtual DOM           │  │
│  │  • API 调用           │      │  • 事件处理               │  │
│  │                      │      │                          │  │
│  │  JSBridge.invoke     │      │  JSBridge.subscribe      │  │
│  └──────────────────────┘      └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 通信流程

1. **Service → WebView**：数据变更通过 JSBridge 发送到渲染层
2. **WebView → Service**：用户事件通过 JSBridge 发送到逻辑层处理
3. **Service → Native**：API 调用通过 JSBridge 发送到宿主环境

## 📋 支持的组件

### 基础组件
- `view` - 视图容器
- `text` - 文本
- `image` - 图片
- `icon` - 图标
- `progress` - 进度条

### 表单组件
- `button` - 按钮
- `input` - 输入框
- `checkbox` / `checkbox-group` - 复选框
- `radio` / `radio-group` - 单选框
- `label` - 标签
- `form` - 表单

### 导航与媒体
- `canvas` - 画布

### 视图容器
- `swiper` / `swiper-item` - 滑块视图
- `scroll-view` - 可滚动视图
- `slider` - 滑动选择器

## 🔧 支持的 API

### 网络
- `tiny.request` - HTTP 请求

### 存储
- `tiny.setStorage` / `tiny.getStorage` - 本地存储
- `tiny.setStorageSync` / `tiny.getStorageSync` - 同步存储

### 路由
- `tiny.navigateTo` - 页面跳转
- `tiny.redirectTo` - 重定向
- `tiny.navigateBack` - 返回上一页

### 界面
- `tiny.showToast` / `tiny.hideToast` - 提示框
- `tiny.showLoading` / `tiny.hideLoading` - 加载框
- `tiny.showModal` - 模态框
- `tiny.showActionSheet` - 操作菜单

### 系统
- `tiny.getSystemInfo` / `tiny.getSystemInfoSync` - 系统信息
- `tiny.getMenuButtonBoundingClientRect` - 胶囊按钮信息

### 节点查询
- `tiny.createSelectorQuery` - 节点选择器

### 动画
- `tiny.createAnimation` - 动画实例

### Canvas
- `tiny.createCanvasContext` - Canvas 上下文

## 🛠️ 技术栈

| 包 | 技术栈 |
|---|---|
| base | Rspack, SWC, Web Components, Virtual DOM |
| compiler | Babel, Webpack, PostCSS |
| devtool | React 17, Redux (Rematch), Rspack |

## 📁 目录详情

```
packages/base/src/
├── service/           # 逻辑层
│   ├── App/          # App 实现
│   ├── Page/         # Page 实现
│   ├── Component/    # Component 实现
│   ├── apis/         # 小程序 API 实现
│   ├── bridge/       # JSBridge
│   └── Model/        # 数据模型
├── webview/          # 渲染层
│   ├── web-components/  # 组件实现
│   ├── api/          # 渲染层 API
│   └── App.js        # 渲染层 App
├── js-bridge/        # JSBridge 核心
└── shared/           # 共享代码

packages/compiler/src/
├── loaders/          # Webpack loaders
├── xml/              # 模板解析
└── *.js             # 编译逻辑

packages/devtool/src/
├── components/       # React 组件
├── store/            # Redux store
├── utils/            # 工具函数
│   └── jsbridge/     # JSBridge 模拟实现
└── *.jsx            # 入口文件
```

## 📝 开发指南

### 添加新组件

1. 在 `packages/base/src/webview/web-components/` 创建组件文件
2. 继承 BaseElement，实现组件逻辑
3. 在 `packages/base/src/webview/web-components/index.js` 注册组件

### 添加新 API

1. 在 `packages/base/src/service/apis/` 创建 API 实现
2. 在 `packages/devtool/src/utils/jsbridge/API/` 添加模拟实现（如需要）

### 调试技巧

- 使用浏览器开发者工具检查 iframe 内容
- Service 和 WebView 分别运行在不同 iframe，可独立调试
- 查看 JSBridge 日志了解通信详情

## 🚧 待办事项

- [ ] TabBar 支持
- [ ] 分包加载
- [ ] 使用 QuickJS WASM 代替逻辑层 iframe 实现沙盒
- [ ] 使用 Vue 2/3 重写渲染层

## 📄 许可证

[MIT](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

<p align="center">Made with ❤️ for mini-program developers</p>
