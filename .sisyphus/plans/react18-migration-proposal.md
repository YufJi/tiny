# React 18 + react-reconciler 迁移技术方案

## 1. 现状分析

### 1.1 当前架构 (nerv)

当前渲染层使用自定义的类 React 框架 **nerv**，位于 `packages/base/src/webview/nerv/`：

```
nerv/
├── index.js              # 公共 API 导出 (createElement/h, render, hooks, Component)
├── render.js             # 顶层渲染入口
├── lifecycle.js          # 组件生命周期管理
├── component.js          # Component 基类
├── hooks.js              # Hooks 实现
├── vdom/
│   ├── create-element.js # DOM 节点创建
│   ├── patch/index.js    # VDOM diff/patch 算法
│   └── ...
└── ...
```

**关键特性：**
- 自定义 VDOM 实现 (VNode 结构: `{type, key, vtype, props, children, dom, ref}`)
- 完整的组件生命周期 (componentWillMount, componentDidMount, shouldComponentUpdate 等)
- Hooks 支持 (useState, useEffect, useLayoutEffect, useRef 等)
- 基于 ivi 算法的关键节点 diff (LIS 优化)
- 直接操作 DOM API (createElement, appendChild, setAttribute)

### 1.2 nerv 渲染流程

```javascript
// bootstrap.js
import { h, hydrate as render } from './nerv';
render(<App fields={fields} />, root);

// render.js
export default function render(vnode, container) {
  const lastVnode = container._component;
  if (lastVnode) {
    dom = patch(lastVnode, vnode, container, {});  // diff + patch
  } else {
    dom = mountVNode(vnode, {});                    // 首次挂载
    mountElement(dom, container);
  }
}
```

### 1.3 与 Web Components 集成

- 使用 Polymer 实现自定义元素 (`tiny-view`, `tiny-button` 等)
- nerv 通过 `document.createElement(tag)` 创建自定义元素
- 属性通过 `setAttribute` 设置，事件通过 `addEventListener` 绑定

## 2. 目标架构 (React 18 + react-reconciler)

### 2.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    小程序业务代码 (JSX)                        │
├─────────────────────────────────────────────────────────────┤
│                      React 18 Runtime                        │
│              (Components, Hooks, Context API)                │
├─────────────────────────────────────────────────────────────┤
│                   react-reconciler                           │
│              (Fiber 架构, 并发特性, 调度)                      │
├─────────────────────────────────────────────────────────────┤
│              Rendering Backend Abstraction                   │
│  ┌─────────────────┬─────────────────┬────────────────────┐ │
│  │   WebView       │   React Native  │    Canvas/Vulkan   │ │
│  │   (DOM)         │   (Native)      │    (GPU)           │ │
│  └─────────────────┴─────────────────┴────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│              Platform Adapter (Host Config)                  │
│         (createInstance, appendChild, commitUpdate)         │
├─────────────────────────────────────────────────────────────┤
│                    平台原生能力层                             │
│         (WebView JSBridge / Native Modules / GPU)           │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心优势

1. **并发渲染**: React 18 的 Concurrent Features (Transitions, Suspense)
2. **生态兼容**: 可直接使用 React 生态 (react-redux, react-router 等)
3. **多后端支持**: 通过 Host Config 抽象，支持 WebView、Native、Canvas 等多种渲染后端
4. **性能优化**: Automatic Batching, useDeferredValue, useTransition
5. **开发体验**: React DevTools 支持

## 3. 技术方案

### 3.1 Host Config 设计

```typescript
// packages/base/src/renderer/host-config.ts
import { HostConfig } from 'react-reconciler';

interface Instance {
  id: string;
  type: string;
  props: Record<string, any>;
  children: Array<Instance | TextInstance>;
  dom?: Element;  // 可选，WebView 模式下存在
}

interface TextInstance {
  id: string;
  text: string;
  dom?: Text;
}

interface Container {
  rootId: string;
  children: Array<Instance | TextInstance>;
}

const hostConfig: HostConfig<
  string,           // Type
  Record<string, any>, // Props
  Container,        // Container
  Instance,         // Instance
  TextInstance,     // TextInstance
  any,              // SuspenseInstance
  any,              // HydratableInstance
  any,              // PublicInstance
  any,              // HostContext
  any,              // UpdatePayload
  any,              // ChildSet
  any,              // TimeoutHandle
  any               // NoTimeout
> = {
  // 渲染模式
  supportsMutation: true,
  supportsPersistence: false,
  
  // ===== 实例创建 =====
  createInstance(
    type: string,
    props: Record<string, any>,
    rootContainer: Container,
    hostContext: any,
    internalHandle: any
  ): Instance {
    const instance: Instance = {
      id: generateId(),
      type,
      props: filterProps(props),
      children: [],
    };
    
    // WebView 模式下创建真实 DOM
    if (isWebViewMode()) {
      instance.dom = document.createElement(type);
      applyProps(instance.dom, props);
    }
    
    // 发送创建指令到原生层
    sendToNative({
      type: 'CREATE_ELEMENT',
      payload: {
        id: instance.id,
        tag: type,
        props: instance.props,
      },
    });
    
    return instance;
  },

  createTextInstance(
    text: string,
    rootContainer: Container,
    hostContext: any,
    internalHandle: any
  ): TextInstance {
    const instance: TextInstance = {
      id: generateId(),
      text,
    };
    
    if (isWebViewMode()) {
      instance.dom = document.createTextNode(text);
    }
    
    sendToNative({
      type: 'CREATE_TEXT',
      payload: { id: instance.id, text },
    });
    
    return instance;
  },

  // ===== 树操作 =====
  appendInitialChild(parent: Instance, child: Instance | TextInstance): void {
    parent.children.push(child);
    
    if (parent.dom && 'dom' in child && child.dom) {
      parent.dom.appendChild(child.dom);
    }
    
    sendToNative({
      type: 'APPEND_CHILD',
      payload: { parentId: parent.id, childId: child.id },
    });
  },

  appendChild(parent: Instance, child: Instance | TextInstance): void {
    this.appendInitialChild(parent, child);
  },

  appendChildToContainer(container: Container, child: Instance | TextInstance): void {
    container.children.push(child);
    
    if ('dom' in child && child.dom) {
      const rootEl = document.getElementById(container.rootId);
      if (rootEl) rootEl.appendChild(child.dom);
    }
    
    sendToNative({
      type: 'MOUNT_ROOT',
      payload: { rootId: container.rootId, childId: child.id },
    });
  },

  insertBefore(
    parent: Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance
  ): void {
    const index = parent.children.indexOf(beforeChild);
    if (index !== -1) {
      parent.children.splice(index, 0, child);
    }
    
    if (parent.dom && 'dom' in child && child.dom && 'dom' in beforeChild && beforeChild.dom) {
      parent.dom.insertBefore(child.dom, beforeChild.dom);
    }
    
    sendToNative({
      type: 'INSERT_BEFORE',
      payload: { parentId: parent.id, childId: child.id, beforeId: beforeChild.id },
    });
  },

  removeChild(parent: Instance, child: Instance | TextInstance): void {
    const index = parent.children.indexOf(child);
    if (index !== -1) {
      parent.children.splice(index, 1);
    }
    
    if (parent.dom && 'dom' in child && child.dom) {
      parent.dom.removeChild(child.dom);
    }
    
    sendToNative({
      type: 'REMOVE_CHILD',
      payload: { parentId: parent.id, childId: child.id },
    });
  },

  // ===== 更新操作 =====
  prepareUpdate(
    instance: Instance,
    type: string,
    oldProps: Record<string, any>,
    newProps: Record<string, any>,
    rootContainer: Container,
    hostContext: any
  ): any {
    // 计算属性差异
    return diffProps(oldProps, newProps);
  },

  commitUpdate(
    instance: Instance,
    updatePayload: any,
    type: string,
    oldProps: Record<string, any>,
    newProps: Record<string, any>,
    internalHandle: any
  ): void {
    instance.props = { ...instance.props, ...updatePayload };
    
    if (instance.dom) {
      applyProps(instance.dom, updatePayload);
    }
    
    sendToNative({
      type: 'UPDATE_PROPS',
      payload: { id: instance.id, props: updatePayload },
    });
  },

  commitTextUpdate(
    textInstance: TextInstance,
    oldText: string,
    newText: string
  ): void {
    textInstance.text = newText;
    
    if (textInstance.dom) {
      textInstance.dom.nodeValue = newText;
    }
    
    sendToNative({
      type: 'UPDATE_TEXT',
      payload: { id: textInstance.id, text: newText },
    });
  },

  // ===== 上下文 =====
  getRootHostContext(): any {
    return {};
  },

  getChildHostContext(parentHostContext: any, type: string, rootContainer: Container): any {
    return parentHostContext;
  },

  // ===== 提交阶段 =====
  prepareForCommit(): void {
    // 提交前的准备工作
  },

  resetAfterCommit(): void {
    // 提交后的清理工作
  },

  // ===== 其他配置 =====
  shouldSetTextContent(type: string, props: Record<string, any>): boolean {
    return false;
  },

  clearContainer(container: Container): void {
    container.children = [];
    
    const rootEl = document.getElementById(container.rootId);
    if (rootEl) {
      rootEl.innerHTML = '';
    }
    
    sendToNative({
      type: 'CLEAR_CONTAINER',
      payload: { rootId: container.rootId },
    });
  },

  // ===== 并发特性支持 =====
  supportsMicrotasks: true,
  scheduleMicrotask(fn: () => void): void {
    queueMicrotask(fn);
  },

  getCurrentEventPriority(): number {
    // 返回当前事件的优先级
    return DefaultEventPriority;
  },

  // ===== 时间处理 =====
  scheduleTimeout(fn: (...args: any[]) => void, delay: number): any {
    return setTimeout(fn, delay);
  },

  cancelTimeout(id: any): void {
    clearTimeout(id);
  },

  noTimeout: -1,

  // ===== 公共实例 =====
  getPublicInstance(instance: Instance | TextInstance): any {
    return instance.dom || instance;
  },

  // ===== 挂载回调 =====
  finalizeInitialChildren(): boolean {
    return false;
  },

  commitMount(): void {
    // 初始挂载完成后的回调
  },
};

export default hostConfig;
```

### 3.2 Renderer 封装

```typescript
// packages/base/src/renderer/index.ts
import Reconciler from 'react-reconciler';
import hostConfig from './host-config';

const TinyRenderer = Reconciler(hostConfig);

export interface RenderOptions {
  mode: 'webview' | 'native' | 'canvas';
  container: string | HTMLElement;
}

export function render(
  element: React.ReactElement,
  container: string | HTMLElement,
  callback?: () => void
): void {
  const containerNode: Container = {
    rootId: typeof container === 'string' ? container : container.id,
    children: [],
  };

  const root = TinyRenderer.createContainer(
    containerNode,
    0,  // ConcurrentRoot = 1, LegacyRoot = 0
    null,
    false,
    null,
    '',
    () => {},
    null
  );

  TinyRenderer.updateContainer(element, root, null, callback);
}

export function createRoot(container: string | HTMLElement) {
  const containerNode: Container = {
    rootId: typeof container === 'string' ? container : container.id,
    children: [],
  };

  const root = TinyRenderer.createContainer(
    containerNode,
    1,  // ConcurrentRoot
    null,
    false,
    null,
    '',
    () => {},
    null
  );

  return {
    render(element: React.ReactElement, callback?: () => void) {
      TinyRenderer.updateContainer(element, root, null, callback);
    },
    unmount() {
      TinyRenderer.updateContainer(null, root, null, () => {});
    },
  };
}

export default TinyRenderer;
```

### 3.3 兼容层设计 (nerv API 兼容)

```typescript
// packages/base/src/renderer/compat.ts
/**
 * 提供 nerv API 兼容层，使现有代码可以平滑迁移
 */

import React from 'react';
import { render as tinyRender, createRoot } from './index';

// 导出 React API 作为 nerv 兼容
export const h = React.createElement;
export const createElement = React.createElement;
export const cloneElement = React.cloneElement;
export const Fragment = React.Fragment;
export const Component = React.Component;
export const PureComponent = React.PureComponent;

// Hooks
export const useState = React.useState;
export const useEffect = React.useEffect;
export const useLayoutEffect = React.useLayoutEffect;
export const useRef = React.useRef;
export const useCallback = React.useCallback;
export const useMemo = React.useMemo;
export const useContext = React.useContext;
export const useReducer = React.useReducer;
export const useImperativeHandle = React.useImperativeHandle;
export const createContext = React.createContext;
export const createRef = React.createRef;
export const forwardRef = React.forwardRef;
export const memo = React.memo;

// 渲染 API 兼容
export function render(vnode: React.ReactElement, container: HTMLElement | string, callback?: () => void) {
  return tinyRender(vnode, container, callback);
}

export function hydrate(vnode: React.ReactElement, container: HTMLElement | string, callback?: () => void) {
  // hydrate 逻辑与 render 相同，因为小程序不需要 SSR
  return tinyRender(vnode, container, callback);
}

// nextTick 兼容 (使用 React 的调度)
export function nextTick(callback: () => void) {
  Promise.resolve().then(callback);
}

// options 兼容 (空实现)
export const options = {
  roots: [],
  // ...其他配置
};

// 其他工具函数
export function findDOMNode(component: any): Element | null {
  // 通过 ref 获取 DOM 节点
  return component?._reactInternals?.stateNode?.dom || null;
}

export function unmountComponentAtNode(container: HTMLElement | string): boolean {
  const rootId = typeof container === 'string' ? container : container.id;
  const rootEl = document.getElementById(rootId);
  if (rootEl) {
    const root = createRoot(rootId);
    root.unmount();
    return true;
  }
  return false;
}

export function isValidElement(object: any): boolean {
  return React.isValidElement(object);
}

export function unstable_batchedUpdates(callback: () => void) {
  // React 18 自动批处理
  callback();
}

// transformRpx 保持兼容
export function transformRpx(value: string | number): string {
  if (typeof value === 'number') {
    return `${value}rpx`;
  }
  return value.replace(/(\d+(?:\.\d+)?)rpx/g, (match, num) => {
    return `${parseFloat(num)}px`;
  });
}
```

## 4. 迁移策略

### 4.1 分阶段迁移

```
Phase 1: 基础设施 (2-3 周)
├── 引入 React 18 + react-reconciler 依赖
├── 实现 Host Config 基础版本
├── 实现 nerv API 兼容层
└── 验证基础渲染流程

Phase 2: WebView 后端 (2-3 周)
├── 实现 DOM 操作后端
├── 集成现有 Web Components
├── 事件系统迁移
├── 样式系统迁移
└── 性能基准测试

Phase 3: 业务代码迁移 (4-6 周)
├── 逐步替换 nerv 导入为 React
├── 组件级测试验证
├── 修复兼容性问题
└── 代码清理

Phase 4: 新后端扩展 (4-6 周)
├── 设计 Native 后端 Host Config
├── 实现 Canvas/Vulkan 后端
├── 多后端切换机制
└── 性能优化
```

### 4.2 文件迁移清单

| 文件路径 | 当前用途 | 迁移策略 |
|---------|---------|---------|
| `webview/nerv/index.js` | nerv 公共 API | 替换为 compat.ts |
| `webview/nerv/render.js` | 渲染入口 | 替换为 renderer/index.ts |
| `webview/nerv/lifecycle.js` | 生命周期 | 移除，使用 React 生命周期 |
| `webview/nerv/vdom/*.js` | VDOM 实现 | 移除，使用 react-reconciler |
| `webview/nerv/hooks.js` | Hooks 实现 | 移除，使用 React Hooks |
| `webview/bootstrap.js` | 应用启动 | 修改导入路径 |
| `webview/App.js` | 根组件 | 保持，修改导入 |
| `webview/Component/*.js` | 自定义组件 | 保持，修改导入 |
| `webview/render-helpers/*.js` | 渲染辅助函数 | 保持，修改导入 |
| `webview/web-components/*.js` | Web Components | 保持，集成到 Host Config |

### 4.3 关键变更点

```javascript
// 变更前 (nerv)
import { h, useState, useEffect } from './nerv';

function App() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('mounted');
  }, []);
  
  return h('view', { className: 'container' },
    h('text', null, `Count: ${count}`),
    h('button', { onClick: () => setCount(c => c + 1) }, 'Add')
  );
}

// 变更后 (React 18)
import React, { useState, useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('mounted');
  }, []);
  
  return (
    <view className="container">
      <text>Count: {count}</text>
      <button onClick={() => setCount(c => c + 1)}>Add</button>
    </view>
  );
}
```

## 5. 多后端架构设计

### 5.1 后端抽象接口

```typescript
// packages/base/src/renderer/backends/interface.ts
export interface RenderingBackend {
  name: string;
  
  // 实例创建
  createElement(type: string, props: Record<string, any>): BackendElement;
  createTextNode(text: string): BackendTextNode;
  
  // 树操作
  appendChild(parent: BackendElement, child: BackendNode): void;
  insertBefore(parent: BackendElement, child: BackendNode, before: BackendNode): void;
  removeChild(parent: BackendElement, child: BackendNode): void;
  
  // 属性操作
  setAttribute(element: BackendElement, name: string, value: any): void;
  removeAttribute(element: BackendElement, name: string): void;
  setStyle(element: BackendElement, style: Record<string, any>): void;
  
  // 事件操作
  addEventListener(element: BackendElement, event: string, handler: Function): void;
  removeEventListener(element: BackendElement, event: string, handler: Function): void;
  
  // 其他
  getRootElement(): BackendElement;
  flushUpdates(): void;
}

export interface BackendElement {
  id: string;
  type: string;
  children: BackendNode[];
}

export interface BackendTextNode {
  id: string;
  text: string;
}

export type BackendNode = BackendElement | BackendTextNode;
```

### 5.2 WebView 后端实现

```typescript
// packages/base/src/renderer/backends/webview.ts
import { RenderingBackend, BackendElement, BackendTextNode } from './interface';

export class WebViewBackend implements RenderingBackend {
  name = 'webview';
  
  private elementMap = new Map<string, Element | Text>();
  
  createElement(type: string, props: Record<string, any>): BackendElement {
    const id = generateId();
    const dom = document.createElement(type);
    
    // 应用初始属性
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        dom.className = value;
      } else if (key.startsWith('on')) {
        // 事件在 commitMount 中处理
      } else if (key === 'style') {
        Object.assign(dom.style, value);
      } else {
        dom.setAttribute(key, value);
      }
    });
    
    this.elementMap.set(id, dom);
    
    return {
      id,
      type,
      children: [],
    };
  }
  
  createTextNode(text: string): BackendTextNode {
    const id = generateId();
    const dom = document.createTextNode(text);
    this.elementMap.set(id, dom);
    
    return { id, text };
  }
  
  appendChild(parent: BackendElement, child: BackendNode): void {
    const parentDom = this.elementMap.get(parent.id);
    const childDom = this.elementMap.get(child.id);
    if (parentDom && childDom) {
      parentDom.appendChild(childDom);
    }
    parent.children.push(child);
  }
  
  // ...其他方法实现
}
```

### 5.3 Native 后端实现 (示例)

```typescript
// packages/base/src/renderer/backends/native.ts
import { RenderingBackend } from './interface';

export class NativeBackend implements RenderingBackend {
  name = 'native';
  
  createElement(type: string, props: Record<string, any>): BackendElement {
    const id = generateId();
    
    // 通过 JSBridge 发送创建指令
    JSBridge.invoke('createView', {
      id,
      type,
      props: serializeProps(props),
    });
    
    return {
      id,
      type,
      children: [],
    };
  }
  
  appendChild(parent: BackendElement, child: BackendNode): void {
    JSBridge.invoke('addChild', {
      parentId: parent.id,
      childId: child.id,
    });
    parent.children.push(child);
  }
  
  // ...其他方法通过 JSBridge 调用原生能力
}
```

## 6. 性能优化策略

### 6.1 React 18 并发特性利用

```typescript
// 使用 useTransition 处理非紧急更新
import { useTransition } from 'react';

function SearchResults() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = (value: string) => {
    setQuery(value); // 紧急更新
    startTransition(() => {
      setResults(searchData(value)); // 非紧急更新
    });
  };
  
  return (
    <>
      <input value={query} onChange={e => handleSearch(e.target.value)} />
      {isPending && <span>Loading...</span>}
      <ResultsList data={results} />
    </>
  );
}
```

### 6.2 虚拟列表优化

```typescript
// 使用 useDeferredValue 延迟大列表渲染
import { useDeferredValue } from 'react';

function LargeList({ items }) {
  const deferredItems = useDeferredValue(items);
  
  return (
    <scroll-view>
      {deferredItems.map(item => (
        <ListItem key={item.id} data={item} />
      ))}
    </scroll-view>
  );
}
```

### 6.3 批量更新优化

```typescript
// React 18 自动批处理
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只会触发一次重新渲染
}
```

## 7. 风险评估与应对

| 风险 | 影响 | 应对策略 |
|-----|------|---------|
| react-reconciler API 不稳定 | 高 | 锁定 React 版本，关注官方更新 |
| 性能下降 | 中 | 建立性能基准测试，逐步优化 |
| 兼容性问题 | 中 | 提供完善的兼容层，灰度发布 |
| 包体积增加 | 中 | Tree-shaking，按需加载 |
| 开发成本 | 高 | 分阶段实施，先 WebView 后 Native |

## 8. 总结

### 8.1 核心变更

1. **渲染引擎**: nerv → React 18 + react-reconciler
2. **架构模式**: 单一 WebView → 多后端抽象
3. **API 兼容**: 提供 nerv 兼容层，平滑迁移
4. **性能优化**: 利用 React 18 并发特性

### 8.2 预期收益

1. **生态兼容**: 可直接使用 React 生态工具
2. **并发渲染**: 更好的用户体验
3. **多平台支持**: 一套代码支持 WebView/Native/Canvas
4. **开发效率**: React DevTools，更好的调试体验
5. **长期维护**: 跟随 React 社区发展

### 8.3 下一步行动

1. 创建技术验证原型 (PoC)
2. 评估包体积和性能影响
3. 制定详细的项目排期
4. 准备开发环境和工具链
5. 开始 Phase 1 开发

---

**文档版本**: 1.0  
**创建日期**: 2026-03-24  
**作者**: Prometheus (AI Planning Agent)
