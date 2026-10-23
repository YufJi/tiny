# @tiny/bridge

Tiny Runtime Protocol v1：host、service、render、devtool 之间的版本化消息通道。

## 职责

- envelope 校验（version / kind / domain / role / JSON-safe payload）
- 请求关联、超时、结构化错误
- 事件与 control 消息
- 按 page + source 保序的批处理
- 可插拔 transport（MessagePort / 内存）

## 使用

```ts
import {
  BridgeConnection,
  createInMemoryTransportPair,
} from '@tiny/bridge'

const [hostTransport, serviceTransport] = createInMemoryTransportPair()

const host = new BridgeConnection({
  localRole: 'host',
  peerRole: 'service',
  transport: hostTransport,
  respondToHello: false,
})

const service = new BridgeConnection({
  localRole: 'service',
  peerRole: 'host',
  transport: serviceTransport,
})

host.onCall('data', 'setData', (message) => {
  // handle message.payload
  return { ok: true }
})

await host.handshake({ canvas: true })
```

浏览器线程之间使用 `createMessagePortTransport(port)`；线程启动时从父窗口等待
MessagePort，再交给 `BridgeConnection`。

## 协议

```ts
type ProtocolMessage = {
  protocolVersion: 1
  messageId: string
  kind: 'call' | 'reply' | 'event' | 'control'
  domain: 'runtime' | 'page' | 'data' | 'event' | 'api' | 'diagnostic' | 'canvas'
  method: string
  source: ProtocolRole
  target: ProtocolRole
  payload: unknown
  pageId?: string
  replyTo?: string
  timestamp: number
}
```

`payload` 必须 JSON-safe（不能包含 `undefined`、函数、循环引用）。跨线程帧由
`Transport` 发送，一个 frame 可以携带多条 message。

架构决策见 [ADR-0003](../../docs/adr/0003-tiny-runtime-protocol.md) 与
[ADR-0004](../../docs/adr/0004-tiny-bridge-protocol.md)。
