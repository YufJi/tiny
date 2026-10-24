import React from 'react'
import {
  Callout,
  Card,
  Cards,
  CodeBlock,
  PageHero,
  PageNav,
  Section,
  Sequence,
  Table,
} from '../components/ui'

export default function Protocol() {
  return (
    <>
      <PageHero
        eyebrow="Bridge protocol"
        title={<>一条版本化的消息总线，<br /><span className="gradient">只负责把话说清楚</span></>}
        lede="packages/bridge 不理解 wx API、不理解页面栈、不碰 glass-easel。它只做 envelope 校验、帧传输、调用关联、事件批处理、超时和数据可序列化检查。正因为职责窄，浏览器、测试和未来原生宿主才能复用同一条协议。"
        stats={[['1', 'protocol version'], ['4', 'message kinds'], ['7', 'domains'], ['30s', 'default call timeout']]}
      />
      <PageNav items={[
        ['role', '职责边界'],
        ['envelope', 'Envelope'],
        ['handshake', '连接与握手'],
        ['transport', '传输与帧'],
        ['batching', '批处理与顺序'],
        ['errors', '错误与超时'],
        ['json', 'JSON-safe'],
        ['catalog', '消息目录'],
        ['relay', '中继矩阵'],
        ['extend', '扩展规则'],
      ]} />

      <Section
        id="role"
        kicker="Scope"
        title="协议层不做业务"
        intro="这是 ADR-0004 的核心决定：bridge 只拥有传输与连接语义，不拥有 API 或渲染语义。"
      >
        <div className="split">
          <Card title="bridge 拥有">
            <ul>
              <li>版本化 envelope 与帧结构</li>
              <li>Transport 抽象：MessagePort / 内存通道</li>
              <li>call / control / event 三种发起方式</li>
              <li>replyTo 关联、pending call、超时</li>
              <li>事件按 source + pageId 批处理</li>
              <li>JSON-safe payload 校验</li>
              <li>结构化 ProtocolError</li>
            </ul>
          </Card>
          <Card title="bridge 不拥有" tone="violet">
            <ul>
              <li>wx API 的参数与返回值语义</li>
              <li>页面栈、路由、生命周期顺序</li>
              <li>glass-easel 渲染命令</li>
              <li>权限、鉴权、加密</li>
              <li>重试、幂等、消息持久化</li>
              <li>二进制 / 流式传输</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        id="envelope"
        kicker="Envelope"
        title="每条消息都带完整的路由与关联信息"
        intro="消息是自描述的：接收方不需要上下文就能判断版本、方向、类型、域和关联。"
      >
        <div className="split">
          <CodeBlock>{`{
  protocolVersion: 1,
  messageId: "msg-m...-1-a1b2c3d4",
  kind: "call" | "reply" | "event" | "control",
  domain: "runtime" | "page" | "data" | "event"
        | "api" | "diagnostic" | "canvas",
  method: "navigate.to",
  source: "host" | "service" | "render" | "devtool",
  target: "host" | "service" | "render" | "devtool",
  payload: { ... },
  pageId?: "page-1",
  replyTo?: "msg-...",
  timestamp: 1710000000000
}`}</CodeBlock>
          <div className="stack">
            <Card title="字段约束">
              <ul>
                <li><code>protocolVersion</code> 必须为 1</li>
                <li><code>messageId</code> / <code>method</code> 非空</li>
                <li><code>kind</code> / <code>domain</code> / <code>source</code> / <code>target</code> 必须命中枚举</li>
                <li><code>timestamp</code> 有限数字</li>
                <li>reply 必须带 <code>replyTo</code></li>
                <li>payload 必须 JSON-safe</li>
              </ul>
            </Card>
            <Card title="点对点，不是广播">
              <p><code>source</code> 与 <code>target</code> 必须和连接双方完全一致；收到 peers 不匹配的消息会抛 <code>INVALID_ENVELOPE</code>。</p>
              <p>host 中继事件时会创建新消息（新 messageId），而不是原样转发 envelope。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="handshake"
        kicker="Handshake"
        title="host 发起，两个线程各自 ready"
        intro="service 与 render 是两条独立连接；握手不能跨连接复用。"
      >
        <Sequence steps={[
          {
            title: 'peer 连接安装 hello 处理器',
            detail: 'service/render 的 BridgeConnection 构造时注册 runtime.hello：收到后先发 runtime.ready，再返回握手载荷。',
            code: "onCall('runtime', 'hello')",
          },
          {
            title: 'host 注册 ready 等待器',
            detail: 'host 的 BridgeConnection 构造时 respondToHello=false，只注册 runtime.ready 的控制处理器，把载荷交给 readyWaiter。',
            code: "onControl('runtime', 'ready')",
          },
          {
            title: 'host 发起 call',
            detail: 'handshake() 只允许 host 调用；payload 包含 protocolVersion、role 和 capabilities。默认 30s 超时。',
            code: "call('runtime', 'hello', { protocolVersion, role })",
          },
          {
            title: 'peer 回复并发送 ready',
            detail: 'hello 的 reply 带 peer 的握手载荷；同时 peer 发出 runtime.ready，host 的 readyWaiter 解析。',
            code: "control('runtime', 'ready', handshakePayload())",
          },
          {
            title: 'host 返回握手载荷',
            detail: 'host 等待 ready 而不是只等待 hello reply。ready 没到就超时，避免“hello 成功但线程未装配完成”。',
            code: 'return await ready',
          },
        ]} />
        <div className="split">
          <Card title="capabilities 的现状" tone="warn">
            <p>service/render 在连接构造时声明 <code>{'{ role: "service" }'}</code> / <code>{'{ role: "render" }'}</code>；host 侧没有注入 capabilities，也没有任何代码根据 capabilities 做能力协商或降级。</p>
            <p>它目前只是握手元数据，不是契约。</p>
          </Card>
          <Card title="版本不一致的后果">
            <p>envelope 或帧的 <code>protocolVersion</code> 不等于 1 时抛 <code>PROTOCOL_VERSION_MISMATCH</code>，连接发送 error 诊断后主动 <code>close()</code>。</p>
            <p>没有兼容降级，也没有多版本协商。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="transport"
        kicker="Transport"
        title="Transport 是唯一的替换点"
        intro="消息层不关心底层是 MessagePort、内存对象还是原生 bridge；它只要求这三件事。"
      >
        <CodeBlock>{`export interface Transport {
  send(frame: TransportFrame): void
  close(): void | Promise<void>
  onFrame(listener: (frame: TransportFrame) => void): () => void
}

export type TransportFrame = {
  protocolVersion: 1
  messages: ProtocolMessage[]   // 至少一条
}`}</CodeBlock>
        <Table
          head={['实现', '用途', '行为']}
          rows={[
            [<code>createMessagePortTransport(port)</code>, '浏览器 iframe / worker', 'postMessage 帧；校验入站帧；close 时清空 onmessage 并关闭端口'],
            [<code>createInMemoryTransportPair()</code>, 'runtime 单测、进程内模拟', '同步 send 到 peer；没有序列化成本，但仍走完整校验'],
            [<code>createHostMessageChannelPair()</code>, 'standalone 宿主', '创建 MessageChannel；hostTransport + 可转移的 peerPort'],
            [<code>自定义 Transport</code>, '原生宿主 / WebSocket / 进程桥', '必须保持帧边界、非空 messages 和 protocolVersion 校验'],
          ]}
        />
        <Callout title="帧边界很重要">
          <p>
            一次 send 可以携带多条消息，但不能是空数组。接收端先校验整个帧，再逐条校验 envelope；任一消息非法都会产生协议错误，
            而不是静默丢弃。
          </p>
        </Callout>
      </Section>

      <Section
        id="batching"
        kicker="Batching"
        title="事件延迟一帧，调用立即发送"
        intro="批处理只针对 event；call/control 和诊断都立即走单独帧。"
      >
        <Table
          head={['API', '行为', '典型用途']}
          rows={[
            [<code>call(domain, method, payload)</code>, '立即发送，等待 reply；有超时', '需要返回值的跨线程请求'],
            [<code>control(domain, method, payload)</code>, '立即发送，等待 reply；语义上是控制而非数据查询', 'bootstrap、navigate、inspectTree'],
            [<code>sendEvent(domain, method, payload)</code>, <>进入 map，按 <code>source:pageId</code> 分桶，microtask flush</>, 'setData、事件、canvas 帧、生命周期'],
            [<code>sendDiagnostic(level, payload)</code>, '立即发送，不参与事件批处理', '日志/状态/错误'],
            [<code>flush()</code>, '手动清空所有桶并发送', '测试或需要强制同步时'],
          ]}
        />
        <div className="split">
          <Card title="顺序保证">
            <p>同一分桶内严格 FIFO；跨桶只保证“同一 microtask 内的桶一起 flush”，不承诺不同 pageId 之间的全局顺序。</p>
            <p>bridge 测试覆盖了“事件批处理但 FIFO 保持”和“诊断插队立即发送”。</p>
          </Card>
          <Card title="没有重试">
            <p>call 超时只 reject 并清掉 pending，不会重发。发送端必须自己决定重试策略；当前 runtime 基本不重试，只把失败转成诊断。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="errors"
        kicker="Errors"
        title="错误也是结构化的"
        intro="ProtocolError 带 code、message、details；跨线程时序列化为错误 payload，在接收端还原成 ProtocolError。"
      >
        <Table
          head={['Code', '触发', '处理']}
          rows={[
            [<code>INVALID_ENVELOPE</code>, 'envelope 字段缺失/枚举非法/source-target 不匹配', '拒绝消息并产生 error 诊断'],
            [<code>INVALID_PAYLOAD</code>, 'payload 非 JSON-safe、reply 结构错误、空帧', '拒绝发送或拒绝回复'],
            [<code>PROTOCOL_VERSION_MISMATCH</code>, '消息或帧版本不是 1', '发送 error 诊断并关闭连接'],
            [<code>TRANSPORT_CLOSED</code>, '端口已关闭或 peer 不可用', 'send 抛错；close 时 reject 所有 pending'],
            [<code>TIMEOUT</code>, 'call/control 超过 timeoutMs', 'reject，pending 删除，不重试'],
            [<code>UNSUPPORTED_METHOD</code>, '收到没有注册 handler 的 call/control', '自动回复 ok:false + UNSUPPORTED_METHOD'],
            [<code>HANDLER_ERROR</code>, 'handler 抛非 ProtocolError，或 reply 发送失败', '包装成错误 payload 回给调用方'],
          ]}
        />
        <CodeBlock>{`// 请求端
try {
  await connection.call('api', 'navigate.to', { url: '/pages/next/next' })
} catch (error) {
  if (error instanceof ProtocolError && error.code === 'TIMEOUT') {
    // 30s 内没有 reply；不会自动重试
  }
}

// 响应端：任何 handler 异常都会变成 reply
reply(request, { ok: false, error: { code, message, details } })`}</CodeBlock>
        <Callout title="事件没有 reply" tone="warn">
          <p>
            <code>event</code> 是单向的。接收端处理失败只会产生诊断，不会通知发送端。需要确认结果的跨线程操作必须用 call/control。
          </p>
        </Callout>
      </Section>

      <Section
        id="json"
        kicker="Serialization"
        title="payload 必须能无损通过 JSON 边界"
        intro="这不是建议，而是每次 send 前都会执行的校验。违规会抛 INVALID_PAYLOAD，消息根本发不出去。"
      >
        <div className="split">
          <Card title="允许">
            <ul>
              <li>null、string、boolean</li>
              <li>有限 number（NaN / Infinity 拒绝）</li>
              <li>普通对象（原型必须是 Object.prototype 或 null）</li>
              <li>数组</li>
              <li>嵌套组合，只要没有循环引用</li>
            </ul>
          </Card>
          <Card title="拒绝" tone="violet">
            <ul>
              <li>undefined、function、bigint、symbol</li>
              <li>Date、Map、Set</li>
              <li>class 实例、DOM 节点、Promise</li>
              <li>循环引用</li>
              <li>NaN / Infinity</li>
            </ul>
          </Card>
        </div>
        <Callout title="两套清洗函数">
          <p>
            bridge 的 <code>assertJsonSafe</code> 是严格校验；runtime 的 <code>toJsonSafe</code> 会主动丢弃函数/undefined、转换 Date/Map/Set、把循环引用写成
            <code>[Circular]</code>。事件序列化用后者，确保 payload 一定能过前者。
          </p>
        </Callout>
      </Section>

      <Section
        id="catalog"
        kicker="Message catalog"
        title="v1 的全部消息"
        intro="domain + method 是字符串，没有集中式 schema 注册表；下方是当前代码实际注册与发送的集合。组件语义扩展通过新增 method 完成，协议版本仍为 1。"
      >
        <Table
          head={['Domain', 'Method', 'Kind', '方向', '语义']}
          rows={[
            ['runtime', <code>hello</code>, 'call', 'host → service/render', '握手；返回 protocolVersion、role、capabilities'],
            ['runtime', <code>ready</code>, 'control', 'service/render → host', '线程装配完成，host 解除握手等待'],
            ['runtime', <code>bootstrap</code>, 'control', 'host → service', '创建首屏并返回 pageId/initialData/componentSchemas/pageComponents'],
            ['runtime', <code>bootstrap</code>, 'control', 'host → render', '注册样式、schema、页面选项，挂载首屏并返回 component snapshots'],
            ['runtime', <code>inspectTree</code>, 'control', 'host/devtool → render', '按 pageId 返回 InspectNode 树'],
            ['runtime', <code>componentLifecycle</code>, 'event', 'render → service', 'created/attached/ready/moved/detached + data + pageId/parent/tag/id/class'],
            ['runtime', <code>componentData</code>, 'event', 'render → service', 'render 侧组件 data 变化；service 同步逻辑实例'],
            ['runtime', <code>componentObserved</code>, 'event', 'render → service', 'render 侧 observer 变化；service 用旧值执行 observer'],
            ['runtime', <code>componentPageLifetime</code>, 'event', 'render → service', 'show/hide；service 当前忽略，由 page.show/hide 统一分发'],
            ['page', <code>ready</code>, 'control', 'host → service', '携带 render component snapshots，先建逻辑树再触发 onReady'],
            ['page', <code>navigateTo</code>, 'control', 'host → service', '当前页 onHide、创建新页、返回 path/pageId/query/initialData'],
            ['page', <code>navigateTo</code>, 'control', 'host → render', '卸载 previousPageId、挂载新页并返回 components'],
            ['page', <code>navigateBack</code>, 'control', 'host → service', '卸载 delta 个页面、恢复栈顶、返回 unloadedPageIds'],
            ['page', <code>navigateBack</code>, 'control', 'host → render', '卸载 unloadedPageIds、重新挂载恢复页并返回 components'],
            ['page', <code>hide</code>, 'control', 'host → service', 'App.onHide、页面 onHide、全部组件 pageLifetimes hide'],
            ['page', <code>show</code>, 'control', 'host → service', 'App.onShow、页面 onShow、全部组件 pageLifetimes show'],
            ['page', <code>unload</code>, 'control', 'host → service', 'onUnload 并移除页面实例（内置宿主未调用）'],
            ['page', <code>getInitialData</code>, 'call', 'host → service', '返回页面定义 data（已注册但当前宿主未使用）'],
            ['data', <code>setData</code>, 'event', 'service → render', '页面或组件的路径补丁'],
            ['event', <code>dispatch</code>, 'event', 'render → service', '序列化后的小程序事件，调用页面/组件方法'],
            ['event', <code>trigger</code>, 'event', 'service → render', 'service 侧组件实例触发 glass-easel 事件'],
            ['canvas', <code>measure</code>, 'call/control', 'service → host → render', '按 selector 测量；宿主 canvas.measure 返回 width/height/canvasId'],
            ['canvas', <code>frame</code>, 'event', 'service → render', '宿主 canvas 适配器产生的 PNG 帧，render 侧 paint'],
            ['diagnostic', <code>diagnostic.log/warn/error/state</code>, 'event', 'service/render → host', '归一化为 RuntimeDiagnostic'],
            ['api', <code>system.info</code>, 'call', 'service → host', '宿主系统信息快照'],
            ['api', <code>storage.get</code>, 'call', 'service → host', '读取宿主 storage'],
            ['api', <code>storage.set</code>, 'call', 'service → host', '写入宿主 storage'],
            ['api', <code>toast.show</code>, 'call', 'service → host', '宿主 toast（当前仅返回 errMsg）'],
            ['api', <code>navigate.to</code>, 'call', 'service → host', 'host 编排 service + render 的导航'],
            ['api', <code>navigate.back</code>, 'call', 'service → host', 'host 编排 service + render 的返回'],
            ['api', <code>*</code>, 'call', 'service → host', 'apiHandlers 注入的任意宿主 API'],
          ]}
        />
      </Section>

      <Section
        id="relay"
        kicker="Relay"
        title="host 如何搬运消息"
        intro="中继不是透明的：host 会重新创建消息、选择目标连接，并在需要时把 call 变成 control。"
      >
        <Table
          head={['来源', '入站', 'host 动作', '出站']}
          rows={[
            ['render', <code>event.dispatch</code>, '取 payload 与 pageId，新建 event', 'service event.dispatch'],
            ['render', <code>runtime.componentLifecycle</code>, '取 payload（含 parent/tag/id/class）', 'service runtime.componentLifecycle'],
            ['render', <code>runtime.componentData</code>, '转发 payload（pageId 在 payload 中）', 'service runtime.componentData'],
            ['render', <code>runtime.componentObserved</code>, '转发 payload（pageId 在 payload 中）', 'service runtime.componentObserved'],
            ['service', <code>event.trigger</code>, '取 payload', 'render event.trigger'],
            ['service', <code>data.setData</code>, '取 payload 与 pageId', 'render data.setData'],
            ['service', <code>canvas.frame</code>, '取 payload 与 pageId', 'render canvas.frame'],
            ['service', <code>canvas.measure</code>, '把 call 的 Promise 直接返回', 'render canvas.measure（control）'],
            ['host', <code>page.navigateTo / bootstrap</code>, '等待 render 返回 components', 'service page.ready({ components })'],
            ['service/render', <code>diagnostic.*</code>, 'normalize 后写入 HostDiagnosticStore', '不转发；供 devtool / 宿主回调'],
            ['service', <code>api.*</code>, 'HostApiRegistry 查找 handler', '本地执行；navigate 类再调用两侧 control'],
          ]}
        />
        <Callout title="中继不保留 replyTo" >
          <p>
            事件没有 reply，host 创建新消息即可；中继里唯一保留请求语义的是 <code>canvas.measure</code>：host 的 onCall 返回 render control 的 Promise，
            由 bridge 用新的 messageId/replyTo 完成关联。导航 handler 还会在 render 返回 components 后补发 <code>page.ready</code>。
          </p>
        </Callout>
      </Section>

      <Section
        id="extend"
        kicker="Extension"
        title="加一条消息需要改哪几处"
        intro="协议没有运行时 schema 注册表，正确性靠两端实现和测试，而不是靠 envelope 自动发现。"
      >
        <Cards>
          <Card tag="01" title="定义 domain / method / payload">
            <p>优先复用现有 domain。payload 必须 JSON-safe；带页面语义的消息应携带 pageId，组件语义应携带 componentId。</p>
          </Card>
          <Card tag="02" title="两端注册 handler">
            <p>call/control 用 onCall/onControl；事件用 onEvent + sendEvent。缺少 handler 会得到 UNSUPPORTED_METHOD，而不是静默。</p>
          </Card>
          <Card tag="03" title="需要中继就改 host">
            <p>service 与 render 不直连。任何跨线程消息都必须在 <code>createTinyRuntime</code> 里显式转发。</p>
          </Card>
          <Card tag="04" title="补协议测试">
            <p>至少覆盖 envelope 校验、方向、超时/错误和批处理顺序；bridge 的现有测试是模板。</p>
          </Card>
        </Cards>
        <div className="split">
          <Card title="什么情况才升级 protocolVersion">
            <p>改变 envelope/帧结构、默认语义或既有字段含义时。单纯新增 method 不需要升版本，但旧 peer 会回 UNSUPPORTED_METHOD。</p>
          </Card>
          <Card title="什么不应该进 bridge">
            <p>wx API 的参数校验、页面栈规则、glass-easel 节点操作、权限模型。这些属于 runtime / host，不属于传输层。</p>
          </Card>
        </div>
        <Callout title="下一层">
          <p>
            消息如何被宿主创建和装配，见 <a href="#/hosts">宿主支持</a>；每条消息在运行时内部怎么被处理，见 <a href="#/runtime">运行时内核</a>。
          </p>
        </Callout>
      </Section>
    </>
  )
}
