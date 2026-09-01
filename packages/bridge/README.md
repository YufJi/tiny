# @tiny/bridge

小程序引擎的 JSBridge 通信模块，提供逻辑层与原生环境之间的双向通信能力。

## 概述

`@tiny/bridge` 是 Tiny 小程序引擎的核心通信层，负责逻辑层（Service）与原生环境（Native）之间的方法调用和事件订阅。它实现了小程序架构中关键的双向通信机制：

- **同步/异步调用**：支持调用原生方法并获取返回结果
- **事件订阅**：支持订阅原生端触发的事件

除了下方保留的 Native Bridge API，本包还实现了 Tiny Runtime Protocol v1。该协议面向 host、service、render 和 devtool，提供版本化 envelope、握手、请求关联、JSON-safe 校验、批处理、超时和结构化错误。协议本身的架构决策见 ADR-0003 与 ADR-0004。

## 安装

```bash
pnpm install @tiny/bridge
```

## 使用方式

### 调用原生方法

使用 `call` 函数调用原生端提供的方法：

```typescript
import { call } from '@tiny/bridge';

// 同步调用
const result = call<string>('getSystemInfo', {});

// 异步调用
const asyncResult = await call<object>('request', {
  url: 'https://api.example.com/data',
  method: 'GET'
});
```

### 订阅原生事件

使用 `subscribe` 函数监听原生端触发的事件：

```typescript
import { subscribe } from '@tiny/bridge';

// 订阅事件
subscribe('onAppShow', (data) => {
  console.log('App 进入前台', data);
});

subscribe('onAppHide', () => {
  console.log('App 进入后台');
});
```

## API 文档

### `call<T>(method: string, params?: NativeCallParams): T | Promise<T>`

调用原生方法。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `method` | `string` | 是 | 原生方法的名称 |
| `params` | `NativeCallParams` | 否 | 传递给原生方法的参数对象，默认为 `{}` |

**返回值：**

- 如果原生方法同步返回结果，则直接返回该结果
- 如果原生方法是异步的，则返回一个 `Promise`，等待原生端通过 `nativeCallHandler` 回调返回结果

**示例：**

```typescript
// 同步调用
const info = call<object>('getSystemInfoSync', {});

// 异步调用
const userInfo = await call<object>('getUserInfo', {
  withCredentials: true
});
```

### `nativeCallHandler<T>(id: number, data: T): void`

供原生端调用的回调函数，用于将异步调用的结果传递回 JavaScript。

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | `number` | 调用的唯一标识，由 `call` 函数生成 |
| `data` | `T` | 原生端返回的数据 |

> **注意：** 此函数由原生端调用，JavaScript 代码通常不需要直接调用。

### `subscribe(event: string, callback: (...args: any[]) => void): void`

订阅原生端触发的事件。

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `event` | `string` | 事件名称 |
| `callback` | `Function` | 事件触发时的回调函数 |

**示例：**

```typescript
subscribe('onNetworkStatusChange', (res) => {
  console.log('网络状态变化:', res.isConnected, res.networkType);
});
```

### `nativeSubscribeHandler(event: string, data: any): void`

供原生端调用的函数，用于触发已订阅的事件。

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `event` | `string` | 事件名称 |
| `data` | `any` | 事件携带的数据 |

> **注意：** 此函数由原生端调用，JavaScript 代码通常不需要直接调用。

## 类型定义

### `NativeCallParams`

```typescript
type NativeCallParams = Record<string, any>;
```

调用原生方法时的参数类型，是一个键值对对象。

### `NativeBridge`

```typescript
interface NativeBridge {
  call(requestId: number, method: string, params?: NativeCallParams): any;
}
```

原生桥接接口定义，全局 `native` 对象实现了此接口。

## 架构说明

### 调用流程

```
┌─────────────────┐     call(method, params)      ┌─────────────────┐
│   JavaScript    │ ─────────────────────────────► │      Native     │
│   (Service 层)  │                                │    (原生环境)    │
│                 │ ◄───────────────────────────── │                 │
└─────────────────┘   native.call() 返回结果       └─────────────────┘
         │
         │ 如果是异步调用
         ▼
   返回 Promise
         │
         │ 等待原生回调
         ▼
   nativeCallHandler(id, data)
         │
         ▼
   Promise resolve
```

### 事件订阅流程

```
┌─────────────────┐     subscribe(event, cb)      ┌─────────────────┐
│   JavaScript    │ ─────────────────────────────► │   EventEmitter  │
│   (Service 层)  │                                │   (事件存储)     │
│                 │ ◄───────────────────────────── │                 │
└─────────────────┘   nativeSubscribeHandler()     └─────────────────┘
                             ▲
                             │
                    Native 触发事件
```

## 依赖

- `@tiny/utils`: 提供日志工具
- `eventemitter3`: 事件订阅/发布实现

## 注意事项

1. **同步调用限制**：同步调用依赖于原生端立即返回结果，如果原生方法需要较长时间执行，建议使用异步调用方式
2. **内存管理**：异步调用的回调函数会被存储在内存中直到 `nativeCallHandler` 被调用，确保原生端及时回调以避免内存泄漏
3. **事件解绑**：当前版本的事件订阅不支持手动解绑，如需解绑功能可以扩展 `subscribe` 模块

## License

MIT
