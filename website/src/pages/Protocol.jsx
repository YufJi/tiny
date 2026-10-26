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
        eyebrow="Bridge 协议"
        title={<>跨线程通信：<br /><span className="gradient">消息格式、握手和错误处理</span></>}
        lede="packages/bridge 不关心 wx API、页面栈，也不碰 glass-easel。它只负责消息信封校验、帧传输、调用关联、事件批处理、超时和 JSON 可序列化检查。职责足够窄，浏览器、测试和未来的原生宿主才能共用一套协议。"
        stats={[['1', '协议版本'], ['4', '消息类型'], ['7', '消息域'], ['30s', '默认调用超时']]}
      />
      <PageNav items={[
        ['role', '职责'],
        ['envelope', '消息格式'],
        ['handshake', '握手'],
        ['transport', '传输'],
        ['batching', '批处理'],
        ['errors', '错误'],
        ['json', '序列化'],
        ['catalog', '消息列表'],
        ['relay', '转发'],
        ['extend', '扩展'],
      ]} />

      <Section
        id="role"
        kicker="职责"
        title="Bridge 只负责传输"
        intro="这是 ADR-0004 定下的边界：Bridge 处理传输和连接，不处理 API 或渲染语义。"
      >
        <div className="split">
          <Card title="Bridge 负责">
            <ul>
              <li>版本化的消息信封和帧结构</li>
              <li>Transport 抽象：MessagePort 或内存通道</li>
              <li>call、control、event 三种发送方式</li>
              <li>replyTo 关联、等待中的调用和超时</li>
              <li>按来源和 pageId 批处理事件</li>
              <li>JSON 可序列化校验</li>
              <li>结构化的 ProtocolError</li>
            </ul>
          </Card>
          <Card title="Bridge 不负责" tone="violet">
            <ul>
              <li>wx API 的参数和返回值语义</li>
              <li>页面栈、路由和生命周期顺序</li>
              <li>glass-easel 的渲染指令</li>
              <li>权限、鉴权和加密</li>
              <li>重试、幂等和消息持久化</li>
              <li>二进制或流式传输</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        id="envelope"
        kicker="消息格式"
        title="每条消息都带路由和关联信息"
        intro="消息是自描述的，接收方不需要额外上下文，就能判断版本、方向、类型、消息域和关联关系。"
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
            <Card title="字段要求">
              <ul>
                <li><code>protocolVersion</code> 必须是 1</li>
                <li><code>messageId</code> 和 <code>method</code> 不能为空</li>
                <li><code>kind</code>、<code>domain</code>、<code>source</code>、<code>target</code> 必须属于枚举值</li>
                <li><code>timestamp</code> 必须是有限数字</li>
                <li>reply 必须带 <code>replyTo</code></li>
                <li>payload 必须能通过 JSON 序列化校验</li>
              </ul>
            </Card>
            <Card title="点对点发送，不做广播">
              <p><code>source</code> 和 <code>target</code> 必须和连接双方完全一致；如果收到对不上的消息，会抛 <code>INVALID_ENVELOPE</code>。</p>
              <p>宿主转发事件时会创建一条新消息（新的 messageId），不会原样转发信封。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="handshake"
        kicker="握手"
        title="由宿主发起，两个线程各自就绪"
        intro="service 和 render 是两条独立连接，握手不能跨连接复用。"
      >
        <Sequence steps={[
          {
            title: '对端先安装 hello 处理器',
            detail: 'service 和 render 的 BridgeConnection 在构造时注册 runtime.hello：收到请求后先发 runtime.ready，再返回握手信息。',
            code: "onCall('runtime', 'hello')",
          },
          {
            title: '宿主等待 ready',
            detail: '宿主的 BridgeConnection 把 respondToHello 设为 false，只注册 runtime.ready 的控制处理器，把收到的信息交给 readyWaiter。',
            code: "onControl('runtime', 'ready')",
          },
          {
            title: '宿主发起调用',
            detail: 'handshake() 只允许宿主调用；payload 包含 protocolVersion、role 和 capabilities，默认 30 秒超时。',
            code: "call('runtime', 'hello', { protocolVersion, role })",
          },
          {
            title: '对端回复并发送 ready',
            detail: 'hello 的回复带上对端的握手信息；同时对端发出 runtime.ready，宿主的 readyWaiter 收到后结束等待。',
            code: "control('runtime', 'ready', handshakePayload())",
          },
          {
            title: '宿主返回握手信息',
            detail: '宿主等的是 ready，而不只是 hello 的回复。如果 ready 没到就超时，避免出现“hello 成功但线程还没装配好”的情况。',
            code: 'return await ready',
          },
        ]} />
        <div className="split">
          <Card title="capabilities 目前只是元数据" tone="warn">
            <p>service 和 render 在构造连接时会声明 <code>{'{ role: "service" }'}</code> 或 <code>{'{ role: "render" }'}</code>；宿主没有注入 capabilities，也没有代码根据它做能力协商或降级。</p>
            <p>它现在只是握手信息，不是必须遵守的约定。</p>
          </Card>
          <Card title="版本不一致会断开连接">
            <p>信封或帧的 <code>protocolVersion</code> 不是 1 时会抛 <code>PROTOCOL_VERSION_MISMATCH</code>；连接发送一条 error 诊断后主动 <code>close()</code>。</p>
            <p>没有兼容降级，也没有多版本协商。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="transport"
        kicker="传输"
        title="更换通信方式，只需要实现 Transport"
        intro="消息层不关心底层是 MessagePort、内存对象还是原生 bridge，只要求实现三个方法。"
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
            [<code>createMessagePortTransport(port)</code>, '浏览器 iframe / worker', '通过 postMessage 发帧，校验入站帧，close 时清空 onmessage 并关闭端口'],
            [<code>createInMemoryTransportPair()</code>, 'runtime 单测、进程内模拟', '同步发送到对端，没有序列化开销，但仍会走完整校验'],
            [<code>createHostMessageChannelPair()</code>, '单 render 浏览器宿主', '创建 MessageChannel，返回 hostTransport 和可转移的 peerPort'],
            [<code>自定义 Transport</code>, '原生宿主 / WebSocket / 进程桥', '必须保持帧边界、非空 messages 和 protocolVersion 校验'],
          ]}
        />
        <Callout title="帧边界不能丢">
          <p>
            一次 send 可以携带多条消息，但不能是空数组。接收端会先校验整个帧，再逐条校验信封；任何一条消息非法都会产生协议错误，不会被悄悄丢掉。
          </p>
        </Callout>
      </Section>

      <Section
        id="batching"
        kicker="批处理"
        title="事件会攒一帧，调用立即发送"
        intro="只有 event 会批处理；call/control 和诊断都会立即发出。"
      >
        <Table
          head={['API', '行为', '常见用途']}
          rows={[
            [<code>call(domain, method, payload)</code>, '立即发送并等待回复，有超时', '需要返回值的跨线程请求'],
            [<code>control(domain, method, payload)</code>, '立即发送并等待回复，语义上偏控制而不是查询', 'bootstrap、navigate、inspectTree'],
            [<code>sendEvent(domain, method, payload)</code>, <>放进队列，按 <code>source:pageId</code> 分组，在 microtask 中统一发出</>, 'setData、事件、canvas 帧、生命周期'],
            [<code>sendDiagnostic(level, payload)</code>, '立即发送，不参与事件批处理', '日志、状态和错误'],
            [<code>flush()</code>, '手动清空所有队列并发送', '测试或需要强制同步时'],
          ]}
        />
        <div className="split">
          <Card title="顺序保证">
            <p>同一分组内严格先进先出；跨分组只保证“同一个 microtask 内的队列一起发出”，不承诺不同 pageId 之间的全局顺序。</p>
            <p>Bridge 测试覆盖了“事件会批处理但顺序不变”和“诊断会插队立即发送”。</p>
          </Card>
          <Card title="不会自动重试">
            <p>调用超时只会 reject 并清掉等待记录，不会重发。重试策略要由发送方决定；目前 runtime 基本不重试，只把失败转成诊断。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="errors"
        kicker="错误"
        title="错误也有统一结构"
        intro="ProtocolError 带有 code、message 和 details；跨线程时会序列化成错误 payload，在接收端还原成 ProtocolError。"
      >
        <Table
          head={['Code', '触发条件', '处理方式']}
          rows={[
            [<code>INVALID_ENVELOPE</code>, '信封字段缺失、枚举非法，或 source/target 不匹配', '拒绝消息，并产生 error 诊断'],
            [<code>INVALID_PAYLOAD</code>, 'payload 不是 JSON 安全的、reply 结构错误、空帧', '拒绝发送或拒绝回复'],
            [<code>PROTOCOL_VERSION_MISMATCH</code>, '消息或帧的版本不是 1', '发送 error 诊断并关闭连接'],
            [<code>TRANSPORT_CLOSED</code>, '端口已关闭，或对端不可用', 'send 抛错；close 时 reject 所有等待中的调用'],
            [<code>TIMEOUT</code>, 'call/control 超过 timeoutMs', 'reject，删除等待记录，不重试'],
            [<code>UNSUPPORTED_METHOD</code>, '收到没有注册 handler 的 call/control', '自动回复 ok:false + UNSUPPORTED_METHOD'],
            [<code>HANDLER_ERROR</code>, 'handler 抛了非 ProtocolError，或 reply 发送失败', '包装成错误 payload 返回给调用方'],
          ]}
        />
        <CodeBlock>{`// 请求端
try {
  await connection.call('api', 'navigate.to', { url: '/pages/next/next' })
} catch (error) {
  if (error instanceof ProtocolError && error.code === 'TIMEOUT') {
    // 30 秒内没有回复；不会自动重试
  }
}

// 响应端：任何 handler 异常都会变成 reply
reply(request, { ok: false, error: { code, message, details } })`}</CodeBlock>
        <Callout title="事件没有回复" tone="warn">
          <p>
            <code>event</code> 是单向的。接收端处理失败只会产生诊断，不会通知发送端。如果需要确认结果，请使用 call 或 control。
          </p>
        </Callout>
      </Section>

      <Section
        id="json"
        kicker="序列化"
        title="payload 必须能通过 JSON 边界"
        intro="每次发送前都会检查，不是可选项。违规会抛 INVALID_PAYLOAD，消息根本发不出去。"
      >
        <div className="split">
          <Card title="允许">
            <ul>
              <li>null、string、boolean</li>
              <li>有限的 number（NaN / Infinity 会被拒绝）</li>
              <li>普通对象（原型必须是 Object.prototype 或 null）</li>
              <li>数组</li>
              <li>只要没有循环引用，可以任意嵌套</li>
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
            Bridge 的 <code>assertJsonSafe</code> 做严格校验；runtime 的 <code>toJsonSafe</code> 会主动丢弃函数和 undefined、转换 Date/Map/Set，并把循环引用写成
            <code>[Circular]</code>。事件序列化会先用后者清洗，确保能通过前者的校验。
          </p>
        </Callout>
      </Section>

      <Section
        id="catalog"
        kicker="消息列表"
        title="v1 现在有哪些消息"
        intro="domain 和 method 都是字符串，没有集中式的 schema 注册表；下面是当前代码实际注册和发送的消息。组件语义扩展通过新增 method 完成，协议版本仍是 1。"
      >
        <Table
          head={['Domain', 'Method', '类型', '方向', '语义']}
          rows={[
            ['runtime', <code>hello</code>, 'call', 'host → service/render', '握手，返回 protocolVersion、role 和 capabilities'],
            ['runtime', <code>ready</code>, 'control', 'service/render → host', '线程装配完成，宿主结束握手等待'],
            ['runtime', <code>bootstrap</code>, 'control', 'host → service', '创建首屏，返回 pageId/initialData/componentSchemas/pageComponents'],
            ['runtime', <code>bootstrap</code>, 'control', 'host → render', '注册样式、schema 和页面选项，挂载首屏并返回组件快照'],
            ['runtime', <code>inspectTree</code>, 'control', 'host/devtool → render', '按 pageId 返回 InspectNode 树'],
            ['runtime', <code>componentLifecycle</code>, 'event', 'render → service', 'created/attached/ready/moved/detached，附带 data、pageId/parent/tag/id/class'],
            ['runtime', <code>componentData</code>, 'event', 'render → service', 'render 侧组件 data 变化，service 同步逻辑实例'],
            ['runtime', <code>componentObserved</code>, 'event', 'render → service', 'render 侧 observer 变化，service 用旧值执行 observer'],
            ['runtime', <code>componentPageLifetime</code>, 'event', 'render → service', 'show/hide；service 目前忽略，由 page.show/hide 统一分发'],
            ['page', <code>ready</code>, 'control', 'host → service', '携带 render 的组件快照，先建立逻辑树，再触发 onReady'],
            ['page', <code>navigateTo</code>, 'control', 'host → service', '当前页 onHide，创建新页，返回 path/pageId/query/initialData'],
            ['page', <code>navigateTo</code>, 'control', 'host → render', '卸载 previousPageId，挂载新页并返回组件'],
            ['page', <code>navigateBack</code>, 'control', 'host → service', '移除 delta 个页面，恢复栈顶，返回 unloadedPageIds'],
            ['page', <code>navigateBack</code>, 'control', 'host → render', '卸载 unloadedPageIds，重新挂载恢复页并返回组件'],
            ['page', <code>switchTab</code>, 'control', 'host → service/render', '切换 tabBar 页面；service 复用缓存页面，render 切换或挂载对应帧'],
            ['page', <code>hide</code>, 'control', 'host → service', 'App.onHide、页面 onHide、所有组件 pageLifetimes hide'],
            ['page', <code>show</code>, 'control', 'host → service', 'App.onShow、页面 onShow、所有组件 pageLifetimes show'],
            ['page', <code>scroll</code>, 'event', 'render → service', '把页面滚动位置和事件交给 service'],
            ['page', <code>reachBottom</code>, 'event', 'render → service', '触发页面触底回调'],
            ['page', <code>unload</code>, 'control', 'host → service', 'onUnload，并移除页面实例（内置宿主没有调用）'],
            ['page', <code>getInitialData</code>, 'call', 'host → service', '返回页面定义的 data（已注册，但目前没有宿主使用）'],
            ['data', <code>setData</code>, 'event', 'service → render', '页面或组件的路径更新'],
            ['event', <code>dispatch</code>, 'event', 'render → service', '序列化后的小程序事件，用来调用页面或组件方法'],
            ['event', <code>trigger</code>, 'event', 'service → render', 'service 侧组件实例触发 glass-easel 事件'],
            ['canvas', <code>measure</code>, 'call/control', 'service → host → render', '按 selector 测量，返回 width/height/canvasId'],
            ['canvas', <code>frame</code>, 'event', 'service → render', '宿主 canvas 适配器产生的 PNG 帧，render 侧负责上屏'],
            ['diagnostic', <code>diagnostic.log/warn/error/state</code>, 'event', 'service/render → host', '统一转成 RuntimeDiagnostic'],
            ['api', <code>system.info</code>, 'call', 'service → host', '获取宿主系统信息快照'],
            ['api', <code>storage.get</code>, 'call', 'service → host', '读取宿主 storage'],
            ['api', <code>storage.set</code>, 'call', 'service → host', '写入宿主 storage'],
            ['api', <code>toast.show</code>, 'call', 'service → host', '宿主 toast（目前只返回 errMsg）'],
            ['api', <code>navigate.to</code>, 'call', 'service → host', '宿主协调 service 和 render 完成导航'],
            ['api', <code>navigate.back</code>, 'call', 'service → host', '宿主协调 service 和 render 完成返回'],
            ['api', <code>*</code>, 'call', 'service → host', 'apiHandlers 注入的任意宿主 API'],
          ]}
        />
      </Section>

      <Section
        id="relay"
        kicker="转发"
        title="宿主如何转发消息"
        intro="转发不是透明的：宿主会重新创建消息、选择目标连接，有时还要把 call 变成 control。"
      >
        <Table
          head={['来源', '收到', '宿主处理', '发出']}
          rows={[
            ['render', <code>event.dispatch</code>, '取出 payload 和 pageId，新建事件', 'service event.dispatch'],
            ['render', <code>runtime.componentLifecycle</code>, '取出 payload（含 parent/tag/id/class）', 'service runtime.componentLifecycle'],
            ['render', <code>runtime.componentData</code>, '转发 payload（pageId 在 payload 里）', 'service runtime.componentData'],
            ['render', <code>runtime.componentObserved</code>, '转发 payload（pageId 在 payload 里）', 'service runtime.componentObserved'],
            ['render', <code>page.scroll</code> / <code>page.reachBottom</code>, '按 pageId 转发', 'service 对应页面事件'],
            ['service', <code>event.trigger</code>, '取出 payload', 'render event.trigger'],
            ['service', <code>data.setData</code>, '取出 payload 和 pageId', 'render data.setData'],
            ['service', <code>canvas.frame</code>, '取出 payload 和 pageId', 'render canvas.frame'],
            ['service', <code>canvas.measure</code>, '把调用 Promise 直接返回', 'render canvas.measure（control）'],
            ['host', <code>page.navigateTo / bootstrap</code>, '等待 render 返回组件', 'service page.ready({ components })'],
            ['service/render', <code>diagnostic.*</code>, 'normalize 后写入 HostDiagnosticStore', '不转发，供 devtool 或宿主回调'],
            ['service', <code>api.*</code>, '在 HostApiRegistry 里查 handler', '本地执行；导航类 API 再调用两侧 control'],
          ]}
        />
        <Callout title="转发时不会保留 replyTo">
          <p>
            事件没有 reply，宿主新建一条消息就可以；转发中唯一保留请求语义的是 <code>canvas.measure</code>：宿主的 onCall 返回 render control 的 Promise，
            Bridge 会用新的 messageId/replyTo 完成关联。导航 handler 也会在 render 返回组件后补发 <code>page.ready</code>。
          </p>
        </Callout>
      </Section>

      <Section
        id="extend"
        kicker="扩展"
        title="新增一条消息要改哪些地方"
        intro="协议没有运行时 schema 注册表，正确性靠两端实现和测试，而不是靠信封自动发现。"
      >
        <Cards>
          <Card tag="01" title="定义 domain / method / payload">
            <p>优先复用现有 domain。payload 必须能通过 JSON 校验；带页面语义的消息要带 pageId，组件语义要带 componentId。</p>
          </Card>
          <Card tag="02" title="两端都要注册 handler">
            <p>call/control 用 onCall/onControl，事件用 onEvent + sendEvent。缺少 handler 会得到 UNSUPPORTED_METHOD，不会静默失败。</p>
          </Card>
          <Card tag="03" title="需要转发就改宿主">
            <p>service 和 render 不直连。任何跨线程消息都必须在 <code>createTinyRuntime</code> 里显式转发。</p>
          </Card>
          <Card tag="04" title="补协议测试">
            <p>至少覆盖信封校验、方向、超时/错误和批处理顺序；Bridge 现有测试可以作为模板。</p>
          </Card>
        </Cards>
        <div className="split">
          <Card title="什么时候才需要升级 protocolVersion">
            <p>改变信封或帧结构、默认语义，或者既有字段的含义时。单纯新增 method 不需要升版本，但旧版本对端会返回 UNSUPPORTED_METHOD。</p>
          </Card>
          <Card title="哪些东西不应该放进 Bridge">
            <p>wx API 的参数校验、页面栈规则、glass-easel 节点操作和权限模型。这些属于 runtime 或宿主，不属于传输层。</p>
          </Card>
        </div>
        <Callout title="继续阅读">
          <p>
            宿主如何创建和装配消息，可以看 <a href="#/hosts">宿主适配</a>；每条消息在运行时内部怎么处理，可以看 <a href="#/runtime">运行时内核</a>。
          </p>
        </Callout>
      </Section>
    </>
  )
}
