# Next 版本技术架构方案

## 目标回顾
- 全量 TypeScript 支持
- 不再强制对齐微信小程序
- **渲染框架可以自定义，不再强捆绑渲染框架**
- 组件库独立出去，通过约定配置指定
- 支持多渲染后端（WebView、Native、Canvas）
- 编译器产物是抽象组件树，渲染框架通过适配器解析

---

## 技术方案详解

### 1. 核心架构重构

#### 1.1 抽象组件树 (ACT)

编译器产物不再生成特定框架代码，而是生成框架无关的抽象组件树：

```typescript
// 抽象组件树节点定义
interface ACTNode {
  type: string;                    // 组件类型
  props: Record<string, any>;      // 属性
  children: ACTNode[];             // 子节点
  events: EventConfig[];           // 事件配置
  styles: StyleConfig;             // 样式配置
  directives: Directive[];         // 指令（if, for, model）
}

interface ACTPage {
  path: string;
  componentTree: ACTNode;
  script: ScriptModule;
  styles: StyleSheet;
}

interface ACTApp {
  pages: ACTPage[];
  globalConfig: AppConfig;
  tabBar?: TabBarConfig;
}
```

**优势：**
- 编译器与渲染层完全解耦
- 同一套编译产物可运行在不同渲染后端
- 支持多框架渲染

#### 1.2 渲染适配器架构

```
编译器产物 (ACT)
      │
      ▼
渲染适配器 (Adapter)
├─ Vue3 Adapter
├─ React Adapter
├─ Web Components Adapter
└─ Native Adapter
      │
      ▼
渲染后端 (Backend)
├─ WebView (DOM/WebGL)
├─ Native (iOS/Android)
└─ Canvas (2D/WebGL)
```

**适配器接口：**

```typescript
interface RenderAdapter {
  createRenderer(options: RendererOptions): Renderer;
  transformACT(node: ACTNode): RenderNode;
  bindEvent(node: RenderNode, event: EventConfig): void;
  applyStyles(node: RenderNode, styles: StyleConfig): void;
  createComponent(type: string, props: any): ComponentInstance;
}
```

---

### 2. 渲染层多框架支持

#### 2.1 Vue 3 自定义渲染器

```typescript
import { createRenderer, h } from '@vue/runtime-core';

class Vue3Adapter implements RenderAdapter {
  private renderer: Renderer;
  
  constructor() {
    this.renderer = createRenderer({
      createElement: (type) => this.createElement(type),
      patchProp: (el, key, prev, next) => this.patchProp(el, key, prev, next),
      insert: (child, parent, anchor) => this.insert(child, parent, anchor),
      remove: (child) => this.remove(child),
      // ...
    });
  }
  
  transformACT(actNode: ACTNode): VNode {
    const { type, props, children, events } = actNode;
    const component = this.resolveComponent(type);
    
    const onEvents = events.reduce((acc, evt) => {
      acc[`on${capitalize(evt.name)}`] = (e: Event) => {
        this.bridge.publish(evt.handler, e);
      };
      return acc;
    }, {});
    
    return h(component, { ...props, ...onEvents }, 
      children.map(child => this.transformACT(child))
    );
  }
}
```

#### 2.2 React 适配器

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';

class ReactAdapter implements RenderAdapter {
  transformACT(actNode: ACTNode): ReactElement {
    const { type, props, children, events } = actNode;
    const component = this.resolveComponent(type);
    
    const eventHandlers = events.reduce((acc, evt) => {
      acc[evt.name] = (e: Event) => this.bridge.publish(evt.handler, e);
      return acc;
    }, {});
    
    return React.createElement(
      component,
      { ...props, ...eventHandlers },
      children.map(child => this.transformACT(child))
    );
  }
}
```

---

### 3. 组件库独立化

#### 3.1 组件库规范

```typescript
interface ComponentLibraryConfig {
  name: string;
  version: string;
  adapter: 'vue3' | 'react' | 'web-components' | 'native';
  components: Record<string, ComponentDefinition>;
  styles: StyleSheet;
}

interface ComponentDefinition {
  name: string;
  props: PropDefinition[];
  events: EventDefinition[];
  slots: SlotDefinition[];
  implementation: VueComponent | ReactComponent | WebComponentClass;
}
```

#### 3.2 使用方式

```json
{
  "componentLibrary": {
    "name": "tiny-ui",
    "version": "^2.0.0",
    "adapter": "vue3"
  }
}
```

---

### 4. 多渲染后端支持

```typescript
interface RenderBackend {
  initialize(): Promise<void>;
  createContext(options: ContextOptions): RenderContext;
  render(actTree: ACTNode, context: RenderContext): void;
  handleInput(event: InputEvent): void;
  capture(context: RenderContext): ImageData;
}

// WebView 后端
class WebViewBackend implements RenderBackend { }

// Native 后端
class NativeBackend implements RenderBackend { }

// Canvas 后端
class CanvasBackend implements RenderBackend { }
```

---

### 5. TypeScript 全量支持

```typescript
// 全局类型定义
declare global {
  const tiny: TinyAPI;
  
  interface PageInstance<T = Record<string, any>> {
    data: T;
    setData(data: Partial<T>, callback?: () => void): void;
    onLoad(options: Record<string, string>): void;
    onShow(): void;
    onHide(): void;
    onUnload(): void;
  }
}

interface TinyAPI {
  request<T = any>(options: RequestOptions): Promise<RequestResult<T>>;
  setStorage<T>(key: string, data: T): Promise<void>;
  getStorage<T>(key: string): Promise<T>;
  navigateTo(options: NavigateOptions): Promise<void>;
  showToast(options: ToastOptions): Promise<void>;
}
```

---

### 6. 编译器架构

#### 6.1 编译流程

```
Source (WXML/WXSS/TS)
      │
      ▼
┌─────────────┐
│   Parser    │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Transformer │
└─────────────┘
      │
      ▼
┌─────────────┐
│ ACT Generator│
└─────────────┘
      │
      ▼
┌─────────────┐
│ Code Generator│
└─────────────┘
      │
      ▼
Output (.act, .js, .css)
```

```html
<button class="add-button" hover-class="none" bind:tap="onClickMe">
    <icon type="success" size="23"></icon>
    <text>{{text}}</text>
</button>
```
```tsx
<button class="add-button" hover-class="none" onClick={onClickMe}>
    <icon type="success" size={23} />
    <text>{text}</text>
</button>
```

#### 6.2 产物格式

```
dist/
├── app.json
├── app.act          # 抽象组件树
├── app.js           # 应用逻辑脚本
├── pages/
│   └── index/
│       ├── index.act
│       ├── index.js
│       └── index.css
└── assets/
```

---

### 7. 性能优化

#### 7.1 启动优化
- 懒加载
- 资源预加载
- 代码分割

#### 7.2 运行时优化
- ACT Diff（类似 Virtual DOM）
- 事件委托
- 内存池

---

### 8. 开发体验

#### 8.1 DevTools 增强
- ACT 可视化
- 性能分析
- 内存分析
- 网络监控
- 热更新

#### 8.2 CLI 工具

```bash
tiny create my-app
tiny dev
tiny build --adapter vue3
tiny analyze
```

---

## 实施建议

### P0（优先实施）
1. Runtime 分层硬化（engine/bridge/renderer 解耦）
2. setData 管线优化（差量 patch、批处理）
3. 启动性能优化（初始渲染缓存）
4. 可观测性（性能打点）

### P1（中期）
1. 渲染任务独立调度
2. Worker 与任务隔离
3. 跨端兼容矩阵

### P2（探索）
1. 构建系统升级（webpack/Rspack 可切换）

---

## 参考资源

- [Vue 3 Custom Renderer](https://vuejs.org/api/custom-renderer.html)
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [字节跳动小程序文档](https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/developer-instrument/overview)
