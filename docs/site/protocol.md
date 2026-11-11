---
title: '跨线程通信：'
highlight: '消息格式、握手和错误处理'
eyebrow: 'Bridge 协议'
lede: >-
  packages/bridge 不关心 wx API、页面栈，也不碰 glass-easel。它只负责消息信封校验、帧传输、调用关联、事件批处理、超时和 JSON 可序列化检查。职责足够窄，浏览器、测试和未来的原生宿主才能共用一套协议。
stats:
  - ['1', '协议版本']
  - ['4', '消息类型']
  - ['7', '在用消息域']
  - ['30s', '默认调用超时']
description: 'Bridge 协议：消息信封、握手、传输、批处理、错误处理和完整消息列表，是内核与宿主之间的唯一边界。'
name: '协议'
pageTitle: 'Bridge 协议 · Tiny 小程序引擎'
order: 5
---

## Bridge 只负责传输 {#role kicker="职责"}

这是 ADR-0004 定下的边界：Bridge 处理传输和连接，不处理 API 或渲染语义。

::::split
:::card{title="Bridge 负责"}
- 版本化的消息信封和帧结构
- 通信句柄：帧发送/接收 + 必需的同步帧交换；宿主通过 `globalThis.__TINY_HOST_BRIDGE__` 注入，MessagePort、直接对象桥或原生实现都由宿主胶水决定
- call、control、event 三种发送方式
- replyTo 关联、等待中的调用和超时
- 按来源和 pageId 批处理事件
- JSON 可序列化校验
- 结构化的 ProtocolError
:::

:::card{title="Bridge 不负责" tone="violet"}
- wx API 的参数和返回值语义
- 页面栈、路由和生命周期顺序
- glass-easel 的渲染指令
- 权限、鉴权和加密
- 重试、幂等和消息持久化
- 二进制或流式传输
:::
::::

## 每条消息都带路由和关联信息 {#envelope kicker="消息格式"}

消息是自描述的，接收方不需要额外上下文，就能判断版本、方向、类型、消息域和关联关系。

:::::split
```js
{
  protocolVersion: 1,
  messageId: "msg-m...-1-a1b2c3d4",
  kind: "call" | "reply" | "event" | "control" | "callSync",
  domain: "runtime" | "page" | "tree" | "api"
        | "diagnostic" | "canvas" | "query",
  method: "navigate.to",
  source: "host" | "service" | "render",
  target: "host" | "service" | "render",
  payload: { ... },
  pageId?: "page-1",
  replyTo?: "msg-...",
  timestamp: 1710000000000
}
```

::::stack
:::card{title="字段要求"}
- `protocolVersion` 必须是 1
- `messageId` 和 `method` 不能为空
- `kind`、`domain`、`source`、`target` 必须属于枚举值
- `timestamp` 必须是有限数字
- reply 必须带 `replyTo`
- payload 必须能通过 JSON 序列化校验
:::

:::card{title="点对点发送，不做广播"}
`source` 和 `target` 必须和连接双方完全一致；如果收到对不上的消息，会抛 `INVALID_ENVELOPE`。

宿主转发事件时会创建一条新消息（新的 messageId），不会原样转发信封。
:::
::::
:::::

## 由宿主发起，两个线程各自就绪 {#handshake kicker="握手"}

service 和 render 是两条独立连接，握手不能跨连接复用。

:::sequence
| title | detail | code |
| --- | --- | --- |
| 对端先安装 hello 处理器 | service 和 render 的 BridgeConnection 在构造时注册 runtime.hello：收到请求后先发 runtime.ready，再返回握手信息。 | onCall('runtime', 'hello') |
| 宿主等待 ready | 宿主在 hello 回复之外还等待 `runtime.ready`，只有收到 ready 才认为线程装配完成。HostCore 把它映射为 `BridgeEvent::Ready`。 | BridgeEvent::Ready |
| 宿主发起调用 | handshake() 只允许宿主调用；payload 包含 protocolVersion、role 和 capabilities，默认 30 秒超时。 | call('runtime', 'hello', { protocolVersion, role }) |
| 对端回复并发送 ready | hello 的回复带上对端的握手信息；同时对端发出 runtime.ready，宿主收到 ready 后结束等待。 | control('runtime', 'ready', handshakePayload()) |
| 宿主返回握手信息 | 宿主等的是 ready，而不只是 hello 的回复。如果 ready 没到就超时，避免出现“hello 成功但线程还没装配好”的情况。 | handshake → ready |
:::

::::split
:::card{title="capabilities 目前只是元数据" tone="warn"}
service 声明 `{ role: "service" }`，render 声明 `{ role: "render", mode: "tree" }`；宿主侧没有注入额外 capabilities，也没有代码根据它做能力协商或降级。

它现在只是握手信息，不是必须遵守的约定。
:::

:::card{title="版本不一致会断开连接"}
信封或帧的 `protocolVersion` 不是 1 时会产生 `PROTOCOL_VERSION_MISMATCH`；TypeScript `BridgeConnection` 发送 error 诊断后关闭连接，Rust HostCore 记录错误诊断并拒绝该帧。

没有兼容降级，也没有多版本协商。
:::
::::

## 更换通信方式，只需要实现 Transport {#transport kicker="传输"}

消息层不关心底层是 MessagePort、直接对象桥还是原生 bridge，只要求宿主注入的句柄实现 `send`、`sendSync`、`onFrame` 和 `close`。`callSync` 消息只通过 `sendSync` 交换，不会出现在异步帧队列里；回复仍是普通 `reply`（`replyTo` 指向请求）。

```ts
export interface Transport {
  send(frame: TransportFrame): void
  close(): void | Promise<void>
  onFrame(listener: (frame: TransportFrame) => void): () => void
}

export type TransportFrame = {
  protocolVersion: 1
  messages: ProtocolMessage[]   // 至少一条
}
```

| 实现 | 用途 | 行为 |
| --- | --- | --- |
| `createMessagePortTransport(port, { sendSync })` | `@tiny/host-web` 浏览器胶水 | 通过 postMessage 发帧，校验入站帧；宿主把句柄注入 `__TINY_HOST_BRIDGE__` |
| `createInMemoryTransportPair()` | runtime 单测、进程内模拟 | 同步发送到对端，没有序列化开销，但仍会走完整校验 |
| `createHostMessageChannelPair()` | 浏览器宿主 | 创建 MessageChannel，返回 hostTransport 和可转移的 peerPort；service 用一条，每页 render 各用一条 |
| `自定义 Transport` | 原生宿主 / WebSocket / 进程桥 | 必须保持帧边界、非空 messages 和 protocolVersion 校验 |

:::callout{title="帧边界不能丢"}
一次 send 可以携带多条消息，但不能是空数组。接收端会先校验整个帧，再逐条校验信封；任何一条消息非法都会产生协议错误，不会被悄悄丢掉。
:::

## 事件会攒一帧，调用立即发送 {#batching kicker="批处理"}

只有 event 会批处理；call/control 和诊断都会立即发出。

| API | 行为 | 常见用途 |
| --- | --- | --- |
| `call(domain, method, payload)` | 立即发送并等待回复，有超时 | 需要返回值的跨线程请求 |
| `control(domain, method, payload)` | 立即发送并等待回复，语义上偏控制而不是查询 | bootstrap、navigate、inspectTree |
| `sendEvent(domain, method, payload)` | 放进队列，按 `source:pageId` 分组，在 microtask 中统一发出 | setData、事件、canvas 帧、生命周期 |
| `sendDiagnostic(level, payload)` | 立即发送，不参与事件批处理 | 日志、状态和错误 |
| `flush()` | 手动清空所有队列并发送 | 测试或需要强制同步时 |

::::split
:::card{title="顺序保证"}
同一分组内严格先进先出；跨分组只保证“同一个 microtask 内的队列一起发出”，不承诺不同 pageId 之间的全局顺序。

Bridge 测试覆盖了“事件会批处理但顺序不变”和“诊断会插队立即发送”。
:::

:::card{title="不会自动重试"}
调用超时只会 reject 并清掉等待记录，不会重发。重试策略要由发送方决定；目前 runtime 基本不重试，只把失败转成诊断。
:::
::::

## 错误也有统一结构 {#errors kicker="错误"}

ProtocolError 带有 code、message 和 details；跨线程时会序列化成错误 payload，在接收端还原成 ProtocolError。

| Code | 触发条件 | 处理方式 |
| --- | --- | --- |
| `INVALID_ENVELOPE` | 信封字段缺失、枚举非法，或 source/target 不匹配 | 拒绝消息，并产生 error 诊断 |
| `INVALID_PAYLOAD` | payload 不是 JSON 安全的、reply 结构错误、空帧 | 拒绝发送或拒绝回复 |
| `PROTOCOL_VERSION_MISMATCH` | 消息或帧的版本不是 1 | 拒绝消息并产生错误；TypeScript 连接会关闭 |
| `TRANSPORT_CLOSED` | 端口已关闭，或对端不可用 | send 抛错；close 时 reject 所有等待中的调用 |
| `TIMEOUT` | call/control 超过 timeoutMs | reject，删除等待记录，不重试 |
| `UNSUPPORTED_METHOD` | 收到没有注册 handler 的 call/control | 自动回复 ok:false + UNSUPPORTED_METHOD |
| `HANDLER_ERROR` | handler 抛了非 ProtocolError，或 reply 发送失败 | 包装成错误 payload 返回给调用方 |

```js
// 请求端
try {
  await connection.call('api', 'navigate.to', { url: '/pages/next/next' })
} catch (error) {
  if (error instanceof ProtocolError && error.code === 'TIMEOUT') {
    // 30 秒内没有回复；不会自动重试
  }
}

// 响应端：任何 handler 异常都会变成 reply
reply(request, { ok: false, error: { code, message, details } })
```

:::callout{title="事件没有回复" tone="warn"}
`event` 是单向的。接收端处理失败只会产生诊断，不会通知发送端。如果需要确认结果，请使用 call 或 control。
:::

## payload 必须能通过 JSON 边界 {#json kicker="序列化"}

每次发送前都会检查，不是可选项。违规会抛 INVALID_PAYLOAD，消息根本发不出去。

::::split
:::card{title="允许"}
- null、string、boolean
- 有限的 number（NaN / Infinity 会被拒绝）
- 普通对象（原型必须是 Object.prototype 或 null）
- 数组
- 只要没有循环引用，可以任意嵌套
:::

:::card{title="拒绝" tone="violet"}
- undefined、function、bigint、symbol
- Date、Map、Set
- class 实例、DOM 节点、Promise
- 循环引用
- NaN / Infinity
:::
::::

:::callout{title="两套清洗函数"}
Bridge 的 `assertJsonSafe` 做严格校验；runtime 的 `toJsonSafe` 会主动丢弃函数和 undefined、转换 Date/Map/Set，并把循环引用写成 `[Circular]`。事件序列化会先用后者清洗，确保能通过前者的校验。
:::

## tree 域：两棵树之间的同步 {#tree-protocol kicker="tree 协议"}

双侧树不共享内存。service 逻辑树生成 component flow 和 virtual node patch，render 渲染树应用它们，并按组件定义求值 shadow tree；事件、查询和相交观测再按组件 id 或元素 locator 回到 service。

| 消息 | 方向 | 内容 |
| --- | --- | --- |
| `tree.flow` | service → render | 首屏 flow：`define`（该页可见组件定义）、`tree`（整棵页面渲染快照）、`ready`；可带独立 `tabRoot`，以及页面样式、fallback app 样式、`pageScope`、`pageUsing`、`behaviorScheme`、`wxsModules`、`pageData` 和 `componentData` |
| `tree.snapshot` | service → render | 旧版完整快照入口仍注册，当前 service 不发送 |
| `tree.patch` | service → render | `text`、`replace`、`props`、`insert`、`remove`、`reorder`；组件用共享 id、元素用 `owner#index.path` locator 寻址；同一 payload 可带 `tabPatches`、`pageData` / `componentData`；页帧结构变化还会带 `renderHints` 刷新组件身份 |
| `tree.ack` | render → service | 批次确认：回显 flow/snapshot/patch 上的 `ack` token；service 用它 settle `setData` completion |
| `tree.event` | render → service | 组件 id 或元素 locator、可选 `targetId`、name、detail、native 字段、touches 和 target/currentTarget 几何；service 从最内层 target 节点开始分发，并保留当前 binding 的 currentTarget |
| `tree.templateEvent` | render → service | render 求值的组件模板把绑定的方法调用交回 service |
| `tree.wxsBinding` | service → render | 动态 WXS 事件绑定决策 |
| `tree.wxsEffect` | render → service | WXS `callMethod` / `triggerEvent` 的跨线程副作用 |
| `tree.wxsHandler` | render → service | 每次 render WXS handler 执行后的 origin 和事件快照；service 用 state-only descriptor 回放模块状态 |
| `tree.hostAction` | render → host | 内置组件的导航等宿主动作 |
| `tree.hostRequest` | render → host | 内置组件的宿主请求/响应（如 picker） |
| `tree.ready` | host → service | render bootstrap 完成后请求逻辑树重发首屏 flow |
| `runtime.inspectTree` / `tree.inspectTree` | host → render | 从渲染树导出 InspectNode |
| `tree.measure` | service/host → render | 按组件 id 或元素 locator 读取 layout 矩形 |
| `query.select` | service → host → render | selector query 在真实 DOM 中查节点，返回 rect/dataset/scroll |
| `query.intersection` | service → render / render → service | 创建、断开 IntersectionObserver；entry 回到逻辑树 |

首屏 flow 是一个带页面元数据的 payload，`messages` 里只放组件定义和一棵嵌套快照，元素 id 不上 wire：

```js
{
  pageId: 'page-1',
  pagePath: 'pages/index/index',
  behaviorScheme: 'wx://',
  pageScope: 'tiny-pages-index-index',
  pageData: { ... },
  messages: [
    { type: 'define', path: 'pages/index/index', definition: { ... } },
    { type: 'tree', root: {
        type: 'element', id: 'page-1', tag: 'page',
        children: [
          { type: 'element', tag: 'view', props: { class: 'card' }, children: [ ... ] },
          { type: 'element', id: 'card-1', tag: 'card', component: true, componentPath: 'components/card/card' },
        ],
    } },
    { type: 'ready' },
  ],
}
```

后续更新只发送 patch：组件按共享 id 寻址，元素按 locator（`owner#index.path`）寻址：

```js
{
  patches: [
    { type: 'props', target: 'page-1#0', props: { class: 'card active' } },
    { type: 'text', target: 'page-1#0.1', text: '新的标题' },
  ],
  pageData: { ... },
}
```

:::callout{title="patch 按页面合批"}
service 在一个 microtask 内合并同一页面的模板更新，再发一条 `tree.patch`；自定义 tabBar 的独立根由 `tabRoot` 挂载，后续结构变化走 `tabPatches`，页面根和 tab 根共享同一个渲染批次。渲染树按顺序应用 patch，组件定义只在首屏或新增组件时注册，并用同一份模板求值 shadow tree。首屏 flow 只负责挂载，后续更新统一走 patch。带 `setData` completion 的批次额外携带 `ack` token，渲染树应用后回 `tree.ack`（失败也回，先发 `RENDER_PATCH_ERROR` 诊断），service 收到确认才执行回调。
:::

## v1 现在有哪些消息 {#catalog kicker="消息列表"}

domain 和 method 都是字符串，没有集中式的 schema 注册表；下面是当前代码实际注册的消息。少数入口只用于测试或宿主显式控制，表中会标注；tree/query 是双侧树新增的域，协议版本仍是 1。

| Domain | Method | 类型 | 方向 | 语义 |
| --- | --- | --- | --- | --- |
| runtime | `hello` | call | host → service/render | 握手，返回 protocolVersion、role 和 capabilities |
| runtime | `ready` | control | service/render → host | 线程装配完成，宿主结束握手等待 |
| runtime | `bootstrap` | control | host → service | 创建逻辑树和首屏，返回 pageId/initialData/componentSchemas；可选 `initialExitState` 在首屏 `onLoad` 前映射为 `this.exitState` |
| runtime | `bootstrap` | control | host → render | 创建 TreeRenderer 并等待 tree.flow |
| runtime | `inspectTree` | control | host/devtool → render | 返回渲染树 InspectNode |
| runtime | `resize` | control | host → service | 转发窗口尺寸并触发页面 resize（内核不保存尺寸） |
| runtime | `themeChange` | control | host → service | 转发宿主深浅色主题，向全局事件 hub 发 `themeChange` |
| event | `global` | event | host → service | 宿主全局事件入口：payload `{ name, payload }`，runtime 转发到 `GlobalEventHub`（`wx.onXXX`） |
| page | `ready` | control | host → service | 首屏同步后触发 onReady |
| page | `navigateTo` | control | host → service | 创建新页逻辑树，返回 pageId/path/initialData |
| page | `navigateBack` | control | host → service | 移除页面，恢复栈顶 |
| page | `redirectTo` / `reLaunch` | control | host → service | 替换或重置页面栈 |
| page | `switchTab` | control | host → service | 切换 tabBar 页面并复用缓存 |
| page | `show` / `hide` | control | host → service | 页面显隐；`hide` 先触发 `onHide`，再调用 `onSaveExitState`；应用前后台由 `event.global` 的 `appShow`/`appHide` 控制 |
| page | `unload` | control | host/测试 → service | 关闭页面并触发 onUnload；生产宿主当前不主动发送 |
| page | `scroll` / `reachBottom` / `pullDownRefresh` | event | render → service | 页面滚动、触底和下拉手势 |
| page | `share` / `saveExitState` | control | host/测试 → service | 分享与退出状态控制入口；devtool 在后台切换时通过 `hide` 自动保存 |
| page | `snapshotState` / `restoreState` | control | host/devtool → service | 快照或恢复页面栈的 `data`、`savedExitState` 与 `exitState`；用于 Reload 和整页刷新 |
| page | `pullDownRefresh` | control | host → service | 下拉刷新 API 的宿主控制入口 |
| tree | `flow` | event | service → render | 首屏 flow：组件定义 + 嵌套快照 + 页面元数据 + 数据快照 |
| tree | `snapshot` | event | service → render | 旧版完整快照入口，当前不发送 |
| tree | `patch` | event | service → render | 虚拟节点增量 patch、页面/组件数据快照；页帧结构变化可带身份 hints |
| tree | `ack` | event | render → service | 回显批次 ack token，settle 该批次的 `setData` completion |
| tree | `animate` / `clearAnimate` | event | service → render | `this.animate` 关键帧与取消 |
| tree | `event` | event | render → service | 渲染树事件回传逻辑树 |
| tree | `templateEvent` | event | render → service | render 求值的组件模板回调 service 方法 |
| tree | `wxsBinding` | event | service → render | 动态 WXS 事件绑定 |
| tree | `wxsEffect` | event | render → service | WXS `callMethod` / `triggerEvent` |
| tree | `wxsHandler` | event | render → service | WXS handler 的 page-scoped 状态回放 |
| tree | `hostAction` | event | render → host | 内置组件主动导航等宿主动作 |
| tree | `hostRequest` | call | render → host | 内置组件的宿主请求/响应 |
| tree | `ready` | event | host → service | 请求首屏 flow |
| tree | `inspectTree` | control | host/devtool → render | 导出渲染树元素树 |
| tree | `measure` | control | service → render | 按组件 id / 元素 locator 测量矩形 |
| query | `select` | control | service → host → render | 在渲染树中查 selector，返回 rect/dataset/scroll |
| query | `intersection` | control/event | service ↔ render | observe/disconnect 与 IntersectionObserver entry |
| diagnostic | `diagnostic.log/warn/error/state` | event | service/render → host | 统一转成 RuntimeDiagnostic / UIState |
| api | `system.info` | call | service → host | 获取宿主系统信息（平台 handler；同步变体是 `callSync` 请求帧） |
| api | `storage.*` | call | service → host | 读写宿主 storage |
| api | `network.*` / `battery.get` | call | service → host | 网络请求、网络类型和电量 |
| api | `toast.show` / `ui.*` | call | service → host | 宿主 overlay UI |
| api | `navigate.*` / `page.*` | call | service → host | 宿主协调 service 和 render 完成导航、下拉刷新 |
| api | `*` | call | service → host | `@tiny/api` 与宿主平台 handler 提供的其余 API |

页面快照的每一项是 `{ pageId, path, query, data, savedExitState, exitState }`。`restoreState` 在页面重建后应用数据；如果宿主在 launch 时把保存值放进 `initialExitState`，首屏会在 `onLoad` 就能读到 `this.exitState`，不依赖二次恢复。`savedExitState` 保留最近一次 `onSaveExitState` 的返回值，`exitState` 是本次页面实例启动时加载的值。

`*Sync` API（`getSystemInfoSync`、`getStorageSync` 等）不走这条异步链路：宿主注入的 `__TINY_HOST_BRIDGE__` 实现 `sendSync`，`connection.callSync` 通过 `callSync` 请求 + `reply` 返回（见 [ADR-0016](../adr/0016-pure-js-bridge-host-handle.md)），内核不保存 system/storage 快照。

## 宿主如何转发消息 {#relay kicker="转发"}

转发不是透明的：宿主会重新创建消息、选择目标连接，有时还要把 call 变成 control。

| 来源 | 收到 | 宿主处理 | 发出 |
| --- | --- | --- | --- |
| service | `tree.flow` / `tree.patch` / `tree.animate` / `tree.wxsBinding` | 按 pageId 找渲染树连接，未就绪时先排队 | render 对应 tree 消息 |
| render | `tree.event` / `tree.templateEvent` / `tree.wxsEffect` / `tree.wxsHandler` | 补上 pageId 后转发 | service 对应 tree 消息 |
| render | `tree.ack` | 按 pageId 转发给 service | service `tree.ack` |
| render | `page.scroll` / `page.reachBottom` / `page.pullDownRefresh` | 补上 pageId 后转发 | service `page` 事件 |
| render | `query.intersection` | 按 pageId 转发 | service `query.intersection` |
| service | `query.select` / `tree.measure` | 把调用 Promise 转给渲染树 | render 对应 control |
| host | `tree.ready` | 通知 service 重新发送首屏 flow | service `tree.flow` |
| host | `page.navigateTo / bootstrap` | 创建 service 页面和 render root | service `page.ready` |
| service/render | `diagnostic.*` | normalize 后交给宿主回调 / UIState | 不转发，供 devtool 或宿主调用方读取 |
| service | `api.*` | 由 HostCore 路由到平台 handler | 本地执行；导航类 API 再调用两侧 control |

:::callout{title="转发时不会保留 replyTo"}
tree 事件没有 reply，宿主新建一条消息即可；`query.select` 和 `tree.measure` 这类调用会返回 render control 的 Promise，由 Bridge 用新的 messageId/replyTo 完成关联。导航 handler 还会在 render root 就绪后补发 `tree.ready` / `page.ready`。
:::

## 新增一条消息要改哪些地方 {#extend kicker="扩展"}

协议没有运行时 schema 注册表，正确性靠两端实现和测试，而不是靠信封自动发现。

::::cards
:::card{tag="01" title="定义 domain / method / payload"}
优先复用现有 domain。payload 必须能通过 JSON 校验；带页面语义的消息要带 pageId，组件语义要带 componentId。
:::

:::card{tag="02" title="两端都要注册 handler"}
call/control 用 onCall/onControl，事件用 onEvent + sendEvent。缺少 handler 会得到 UNSUPPORTED_METHOD，不会静默失败。
:::

:::card{tag="03" title="需要转发就改宿主"}
service 和 render 不直连。任何跨线程消息都必须由 HostCore 显式路由和转发。
:::

:::card{tag="04" title="补协议测试"}
至少覆盖信封校验、方向、超时/错误和批处理顺序；Bridge 现有测试可以作为模板。
:::
::::

::::split
:::card{title="什么时候才需要升级 protocolVersion"}
改变信封或帧结构、默认语义，或者既有字段的含义时。单纯新增 method 不需要升版本，但旧版本对端会返回 UNSUPPORTED_METHOD。
:::

:::card{title="哪些东西不应该放进 Bridge"}
wx API 的参数校验、页面栈规则、glass-easel 节点操作和权限模型。这些属于 runtime 或宿主，不属于传输层。
:::
::::

:::callout{title="继续阅读"}
宿主如何创建和装配消息，可以看 [宿主适配](#/hosts)；每条消息在运行时内部怎么处理，可以看 [运行时内核](#/runtime)。
:::
