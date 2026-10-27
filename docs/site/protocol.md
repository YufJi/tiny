---
title: '跨线程通信：'
highlight: '消息格式、握手和错误处理'
eyebrow: 'Bridge 协议'
lede: >-
  packages/bridge 不关心 wx API、页面栈，也不碰 glass-easel。它只负责消息信封校验、帧传输、调用关联、事件批处理、超时和 JSON 可序列化检查。职责足够窄，浏览器、测试和未来的原生宿主才能共用一套协议。
stats:
  - ['1', '协议版本']
  - ['4', '消息类型']
  - ['9', '消息域']
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
- Transport 抽象：MessagePort 或内存通道
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
  kind: "call" | "reply" | "event" | "control",
  domain: "runtime" | "page" | "data" | "event"
        | "api" | "diagnostic" | "canvas"
        | "query" | "tree",
  method: "navigate.to",
  source: "host" | "service" | "render" | "devtool",
  target: "host" | "service" | "render" | "devtool",
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
| 宿主等待 ready | 宿主的 BridgeConnection 把 respondToHello 设为 false，只注册 runtime.ready 的控制处理器，把收到的信息交给 readyWaiter。 | onControl('runtime', 'ready') |
| 宿主发起调用 | handshake() 只允许宿主调用；payload 包含 protocolVersion、role 和 capabilities，默认 30 秒超时。 | call('runtime', 'hello', { protocolVersion, role }) |
| 对端回复并发送 ready | hello 的回复带上对端的握手信息；同时对端发出 runtime.ready，宿主的 readyWaiter 收到后结束等待。 | control('runtime', 'ready', handshakePayload()) |
| 宿主返回握手信息 | 宿主等的是 ready，而不只是 hello 的回复。如果 ready 没到就超时，避免出现“hello 成功但线程还没装配好”的情况。 | return await ready |
:::

::::split
:::card{title="capabilities 目前只是元数据" tone="warn"}
service 和 render 在构造连接时会声明 `{ role: "service" }` 或 `{ role: "render" }`；宿主没有注入 capabilities，也没有代码根据它做能力协商或降级。

它现在只是握手信息，不是必须遵守的约定。
:::

:::card{title="版本不一致会断开连接"}
信封或帧的 `protocolVersion` 不是 1 时会抛 `PROTOCOL_VERSION_MISMATCH`；连接发送一条 error 诊断后主动 `close()`。

没有兼容降级，也没有多版本协商。
:::
::::

## 更换通信方式，只需要实现 Transport {#transport kicker="传输"}

消息层不关心底层是 MessagePort、内存对象还是原生 bridge，只要求实现三个方法。

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
| `createMessagePortTransport(port)` | 浏览器 iframe / worker | 通过 postMessage 发帧，校验入站帧，close 时清空 onmessage 并关闭端口 |
| `createInMemoryTransportPair()` | runtime 单测、进程内模拟 | 同步发送到对端，没有序列化开销，但仍会走完整校验 |
| `createHostMessageChannelPair()` | 单 render 浏览器宿主 | 创建 MessageChannel，返回 hostTransport 和可转移的 peerPort |
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
| `PROTOCOL_VERSION_MISMATCH` | 消息或帧的版本不是 1 | 发送 error 诊断并关闭连接 |
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

双侧树不共享内存。service 逻辑树生成 component flow 和 virtual node patch，render 渲染树应用它们；事件、查询和相交观测再按 node id 回到 service。

| 消息 | 方向 | 内容 |
| --- | --- | --- |
| `tree.flow` | service → render | 首屏 component flow：`define`、`create-node`、`props`、`children`、`ready`；带页面样式和 fallback app 样式 |
| `tree.snapshot` | service → render | 完整虚拟节点快照；渲染树保留该入口 |
| `tree.patch` | service → render | `text`、`replace`、`props`、`insert`、`remove`、`reorder`、`extra` |
| `tree.event` | render → service | node id、name、detail、native 字段、touches；service 负责找到逻辑节点并分发 |
| `tree.ready` | host → service | render 根挂载完成后请求逻辑树发送首屏 flow |
| `tree.inspectTree` | host → render | 从渲染树导出 InspectNode |
| `tree.measure` | service/host → render | 按 node id 读取 layout 矩形 |
| `query.select` | service → host → render | selector query 在真实 DOM 中查节点，返回 rect/dataset/scroll |
| `query.intersection` | service → render / render → service | 创建、更新、断开 IntersectionObserver；entry 回到逻辑树 |
| `canvas.measure` | service → render | 测量 canvas 节点 |

首屏 flow 的核心是稳定 node id：

```js
[
  { type: 'define', path: 'pages/index/index', definition: { ... } },
  { type: 'create-node', id: 'node-1', tag: 'view', parentId: undefined, index: 0 },
  { type: 'props', id: 'node-1', props: { class: 'card' } },
  { type: 'children', id: 'node-1', inserts: ['node-2'] },
  { type: 'ready' },
]
```

后续更新只发送 patch：

```js
[
  { type: 'props', id: 'node-2', props: { class: 'card active' } },
  { type: 'text', id: 'node-3', text: '新的标题' },
]
```

:::callout{title="patch 按页面合批"}
service 在一个 microtask 内合并同一页面的模板更新，再发一条 `tree.patch`；渲染树按顺序应用 patch，不重新求值模板。component flow 目前只覆盖首屏挂载，后续更新统一走 patch，这是和微信参考协议的已知差异。
:::

## v1 现在有哪些消息 {#catalog kicker="消息列表"}

domain 和 method 都是字符串，没有集中式的 schema 注册表；下面是当前代码实际注册和发送的消息。tree/query 是双侧树新增的域，协议版本仍是 1。

| Domain | Method | 类型 | 方向 | 语义 |
| --- | --- | --- | --- | --- |
| runtime | `hello` | call | host → service/render | 握手，返回 protocolVersion、role 和 capabilities |
| runtime | `ready` | control | service/render → host | 线程装配完成，宿主结束握手等待 |
| runtime | `bootstrap` | control | host → service | 创建逻辑树和首屏，返回 pageId/initialData/componentSchemas |
| runtime | `bootstrap` | control | host → render | 创建 TreeRenderer 并等待 tree.flow |
| runtime | `inspectTree` | control | host/devtool → render | 返回渲染树 InspectNode |
| runtime | `resize` | control | host → service | 更新窗口快照并触发页面 resize |
| page | `ready` | control | host → service | 首屏同步后触发 onReady |
| page | `navigateTo` | control | host → service | 创建新页逻辑树，返回 pageId/path/initialData |
| page | `navigateBack` | control | host → service | 移除页面，恢复栈顶 |
| page | `redirectTo` / `reLaunch` | control | host → service | 替换或重置页面栈 |
| page | `switchTab` | control | host → service | 切换 tabBar 页面并复用缓存 |
| page | `show` / `hide` | control | host → service | 应用和页面前后台生命周期 |
| page | `scroll` / `reachBottom` | event | render → service | 页面滚动和触底回调 |
| page | `share` / `saveExitState` / `pullDownRefresh` | control | host → service | 页面分享、退出状态和下拉刷新 |
| tree | `flow` | event | service → render | 首屏 component flow |
| tree | `snapshot` | event | service → render | 完整虚拟节点快照 |
| tree | `patch` | event | service → render | 虚拟节点增量 patch |
| tree | `event` | event | render → service | 渲染树事件回传逻辑树 |
| tree | `ready` | event | host → service | 请求首屏 flow |
| tree | `inspectTree` | control | host/devtool → render | 导出渲染树元素树 |
| tree | `measure` | control | service → render | 按 node id 测量矩形 |
| query | `select` | call/control | service → host → render | 在渲染树中查 selector，返回 rect/dataset/scroll |
| query | `intersection` | control/event | service ↔ render | observe/unobserve 与 IntersectionObserver entry |
| canvas | `measure` | call/control | service → host → render | 测量 canvas 节点 |
| diagnostic | `diagnostic.log/warn/error/state` | event | service/render → host | 统一转成 RuntimeDiagnostic |
| api | `system.info` | call | service → host | 获取宿主系统信息快照 |
| api | `storage.get/set` | call | service → host | 读写宿主 storage |
| api | `toast.show` | call | service → host | 宿主 toast（目前只返回 errMsg） |
| api | `navigate.to/back/switchTab` | call | service → host | 宿主协调 service 和 render 完成导航 |
| api | `*` | call | service → host | apiHandlers 注入的任意宿主 API |

:::callout{title="data.setData 是旧路径，不要作为新宿主依赖" tone="warn"}
service 里还保留旧的 `data.setData` 发送代码，但双侧树的渲染树不消费它；模板更新以 `tree.patch` 为准。新宿主只需要实现 tree/query/canvas 域，不要基于 `data.setData` 实现渲染。
:::

## 宿主如何转发消息 {#relay kicker="转发"}

转发不是透明的：宿主会重新创建消息、选择目标连接，有时还要把 call 变成 control。

| 来源 | 收到 | 宿主处理 | 发出 |
| --- | --- | --- | --- |
| service | `tree.flow` / `tree.snapshot` / `tree.patch` | 按 pageId 找渲染树连接，未就绪时先排队 | render 对应 tree 消息 |
| render | `tree.event` | 补上 pageId 后转发 | service `tree.event` |
| render | `query.intersection` | 按 pageId 转发 | service `query.intersection` |
| service | `query.select` / `canvas.measure` | 把调用 Promise 转给渲染树 | render 对应 control |
| host | `tree.ready` | 通知 service 发送首屏 flow | service `tree.flow` |
| host | `page.navigateTo / bootstrap` | 创建 service 页面和 render root | service `page.ready` |
| service/render | `diagnostic.*` | normalize 后写入 HostDiagnosticStore | 不转发，供 devtool 或宿主回调 |
| service | `api.*` | 在 HostApiRegistry 里查 handler | 本地执行；导航类 API 再调用两侧 control |

:::callout{title="转发时不会保留 replyTo"}
tree 事件没有 reply，宿主新建一条消息即可；`query.select` 和 `canvas.measure` 这类调用会返回 render control 的 Promise，由 Bridge 用新的 messageId/replyTo 完成关联。导航 handler 还会在 render root 就绪后补发 `tree.ready` / `page.ready`。
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
service 和 render 不直连。任何跨线程消息都必须在 `createTinyRuntime` 里显式转发。
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
