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

export default function Architecture() {
  return (
    <>
      <PageHero
        eyebrow="Architecture"
        title={<>五个边界，<br /><span className="gradient">两条线程，一份契约</span></>}
        lede="Tiny 的架构不是按目录切的，而是按谁能拥有状态、谁只能转发消息切的。编译器生产 manifest；runtime 消费 manifest 并拥有应用语义；bridge 只做传输；host 拥有环境；devtool 只观察和控制。"
        stats={[['2', 'runtime threads'], ['1', 'manifest contract'], ['7', 'bridge domains'], ['0', 'direct service ↔ render channels']]}
      />
      <PageNav items={[
        ['boundaries', '五个边界'],
        ['glass-easel', 'glass-easel 边界'],
        ['dependencies', '真实依赖'],
        ['boot', '启动时序'],
        ['channels', '通道与中继'],
        ['ownership', '状态所有权'],
        ['invariants', '架构不变量'],
      ]} />

      <Section
        id="boundaries"
        kicker="Boundaries"
        title="谁拥有什么"
        intro="先看职责，再看目录。五个角色之间的接口都是显式的。"
      >
        <Table
          head={['角色', '拥有', '不拥有', '落点']}
          rows={[
            ['compiler', '源码扫描、模板 ProcGen、CSS 作用域、TS 转译、service bundle、manifest 与诊断', '页面生命周期、路由、wx API、DOM', <code>tools/cli</code>],
            ['manifest', '产物类型与 schemaVersion，不包含编译器或运行时逻辑', '任何实现', <code>packages/manifest</code>],
            ['runtime', 'App/Page/Component 语义、页面栈、setData、事件分发、组件实例、canvas 镜像', '传输实现、宿主 API 实现、UI', <code>packages/runtime</code>],
            ['bridge', 'envelope、帧、transport、call/reply、批处理、超时、JSON-safe 校验', 'wx API 语义、渲染命令、页面状态', <code>packages/bridge</code>],
            ['host', '线程创建、transport、bootstrap 调用、宿主 API、后端与挂载点、诊断收集', '应用业务状态、glass-easel 组件定义', <><code>apps/devtool</code> · <code>tests/host</code> · 未来原生宿主</>],
          ]}
        />
        <Callout title="关键结论">
          <p>
            应用语义中的页面栈、页面 data 和组件逻辑实例只存在于 service 线程；render 线程拥有 glass-easel 组件树、DOM 与 adapter 维护的组件 ID 映射。
            两个线程之间没有直接通道，所有跨线程状态都必须经过 host 中继并受 bridge 校验。
          </p>
        </Callout>
      </Section>

      <Section
        id="glass-easel"
        kicker="Runtime core"
        title="glass-easel 给组件框架，Tiny 补应用语义"
        intro="这是理解 runtime 设计的关键：glass-easel 不是一个完整的小程序 SDK。"
      >
        <Table
          head={['能力', '由谁提供', '在 Tiny 中的表现']}
          rows={[
            ['组件定义、properties、data、observers、methods', 'glass-easel', <><code>defineWithMethodCaller</code> / <code>defineComponent</code></>],
            ['WXML 运行时数据绑定与更新', 'glass-easel', '编译器把 WXML 编成 ProcGen，运行时只传 groupList/content'],
            ['事件捕获/冒泡、slot、shadow 边界', 'glass-easel', 'adapter 把事件序列化后送到 service'],
            ['生命周期 created/attached/ready/moved/detached', 'glass-easel', 'adapter 转发为 componentLifecycle 消息'],
            ['样式作用域、backend 协议', 'glass-easel', 'StyleScopeManager + CurrentWindowBackendContext'],
            ['App 生命周期、页面栈、路由、onLoad/onShow/onReady', 'Tiny runtime', <code>packages/runtime/src/service.ts</code>],
            ['wx API、storage、system info、animation、canvas', 'Tiny runtime + host', 'service 侧 API host；宿主事实由 extensions 注入'],
            ['跨线程 setData、事件分发、页面切换', 'Tiny runtime + bridge + host', 'data.setData / event.dispatch / page.navigateTo'],
            ['元素树检查、生命周期控制、诊断投影', 'Tiny runtime + devtool', <><code>DevtoolRuntimeClient</code> + <code>runtime.inspectTree</code></>],
          ]}
        />
        <Callout title="为什么不用 glass-easel 的 miniprogram adapter">
          <p>
            官方 adapter 能提供更接近微信的注册面，但会把页面生命周期、宿主控制与原生能力挡在 adapter 子集后面。
            Tiny 直接使用 glass-easel core API，自己拥有 App、页面栈、路由和 API host，从而为未来宿主保留控制面。
          </p>
        </Callout>
      </Section>

      <Section
        id="dependencies"
        kicker="Dependency edges"
        title="依赖只向内，契约在中心"
        intro="这是 workspace 的真实依赖，不是理想图。核心包不依赖 tools、apps 或 tests。"
      >
        <Table
          head={['包 / 应用', '依赖', '职责']}
          rows={[
            [<code>@tiny/manifest</code>, '无', '产物与诊断类型'],
            [<code>@tiny/bridge</code>, '无', '协议、transport、批处理与错误'],
            [<code>@tiny/template-compiler</code>, '无（纯 TS）', 'WXML → ProcGen'],
            [<code>@tiny/stylesheet-compiler</code>, 'postcss', 'WXSS → 普通/低优先级 CSS'],
            [<code>@tiny/components</code>, 'glass-easel；构建期 template-compiler', '18 个内置组件与 AOT 模板'],
            [<code>@tiny/cli</code>, 'manifest · template-compiler · stylesheet-compiler · esbuild · typescript', '唯一产物生产者'],
            [<code>@tiny/runtime</code>, 'manifest · bridge · components · glass-easel · es-toolkit', '双线程运行时与 adapter'],
            [<code>devtool</code>, 'runtime · glass-easel · React · Redux/rematch', '宿主适配 + 控制面板'],
            [<code>@tiny/website</code>, 'React', '架构站点，不进入引擎链路'],
          ]}
        />
        <CodeBlock>{`core        packages/manifest
            packages/bridge
            packages/template-compiler
            packages/stylesheet-compiler
            packages/components        -> glass-easel
            packages/runtime           -> manifest, bridge, components
tools       tools/cli                  -> manifest, template-compiler, stylesheet-compiler
apps        apps/devtool               -> runtime
tests       tests/host                 -> runtime          (not a workspace package)
fixtures    tests/apps/*               -> source only      (compiled into a host)

rule: packages/* never import tools/*, apps/*, tests/*`}</CodeBlock>
        <Callout title="一个反例">
          <p>
            runtime 如果为了类型去 import <code>@tiny/cli</code>，就会把 Node 的 fs/esbuild 依赖带进浏览器线程，
            并在打包时产生无法解析的 builtin。共享类型必须放 <code>@tiny/manifest</code>，而不是从工具反向导出。
          </p>
        </Callout>
      </Section>

      <Section
        id="boot"
        kicker="Boot sequence"
        title="从 manifest 到可交互页面"
        intro="一次完整启动跨过编译产物、两个 iframe、两次握手、两次 bootstrap 和一次 page.ready。"
      >
        <Sequence steps={[
          {
            title: '编译产物写盘',
            actor: 'tools/cli',
            detail: '读取 app.json、扫描入口、生成 templates.js / styles / scripts / service.js / render.js，最后写 manifest.json。诊断随 manifest 一起返回。',
            code: 'compileMiniProgram({ sourceDir, outputDir })',
          },
          {
            title: '宿主创建两条独立通道',
            actor: 'host',
            detail: '每个线程一条 MessageChannel。service 和 render 不共享端口；host 自己持有两条 hostTransport。',
            code: 'createHostMessageChannelPair() × 2',
          },
          {
            title: '创建 iframe 并等待线程就绪',
            actor: 'host',
            detail: 'service iframe 被隐藏为 0×0，render iframe 填满容器。等待线程发回 tiny-runtime-port-ready，超时 15s。',
            code: 'createStandaloneDualThreadHost(...)',
          },
          {
            title: '线程加载产物后宣告就绪',
            actor: 'service / render',
            detail: 'render 先导入 templates 并取到 styles；service 先拿到 manifest。service bundle 更晚，在 bootstrap 时通过 loadArtifacts 导入。线程在 connection 安装完成后才调用 listenForRuntimePort，避免端口到达时丢帧。',
            code: "listenForRuntimePort('render', (transport) => ...)",
          },
          {
            title: '转移 MessagePort',
            actor: 'host',
            detail: 'host 把 port2 作为 transferable 传给对应 iframe；线程用 createMessagePortTransport 包装成 Transport。',
            code: "postMessage({ type: 'tiny-runtime-port' }, '*', [port])",
          },
          {
            title: '双连接握手',
            actor: 'bridge',
            detail: 'host 分别发起 runtime.hello；service/render 回复握手载荷并发送 runtime.ready。协议版本不一致会直接关闭连接。',
            code: 'host.service.handshake() · host.render.handshake()',
          },
          {
            title: 'service bootstrap',
            actor: 'host → service',
            detail: '导入 service.js（App/Page/Component 在这里注册，App.onLaunch/onShow 立即执行），构建组件 schema，创建首个页面，触发 onLoad/onShow，返回 pageId、initialData 与 componentSchemas。',
            code: "service.control('runtime', 'bootstrap')",
          },
          {
            title: 'render bootstrap',
            actor: 'host → render',
            detail: '先注册基础样式与 manifest 样式，再注册组件 schema，按 path 找到页面并挂载。顺序不能反，否则组件定义拿不到 style scope。',
            code: "render.control('runtime', 'bootstrap')",
          },
          {
            title: 'page.ready',
            actor: 'host → service',
            detail: '页面已经挂到 DOM 后，service 才触发 onReady。这保证 onReady 里读取布局/查询节点时 render 已存在。',
            code: "service.control('page', 'ready')",
          },
          {
            title: '状态诊断与可交互',
            actor: 'service',
            detail: 'service 发送 RUNTIME_STATE（pageStack / currentPage / transport），宿主诊断仓库与 devtool 据此投影状态。',
            code: "sendDiagnostic('state', { code: 'RUNTIME_STATE' })",
          },
        ]} />
        <Callout title="宿主必须显式 bootstrap">
          <p>
            <code>createStandaloneDualThreadHost</code> 只完成创建、握手和返回 host，不会自动 bootstrap。
            测试宿主、调试器都必须自己调用 <code>host.bootstrap()</code>，否则页面不会创建。
          </p>
        </Callout>
      </Section>

      <Section
        id="channels"
        kicker="Topology"
        title="没有 service ↔ render 的直连"
        intro="所有跨线程消息都经过 host 的两个 BridgeConnection。host 是路由器，也是唯一能同时看到两侧状态的地方。"
      >
        <CodeBlock>{`                    +---------------- host ----------------+
                    | createTinyRuntime(options)           |
                    |                                      |
                    |  BridgeConnection(host <-> service)  |
                    |  BridgeConnection(host <-> render)   |
                    |  HostApiRegistry                     |
                    |  HostDiagnosticStore                 |
                    +--------------+------------+----------+
                                   |            |
                          MessageChannel   MessageChannel
                                   |            |
                    +--------------v--+  +------v-----------+
                    |  service iframe |  |  render iframe   |
                    |                 |  |                  |
                    | pages / data    |  | glass-easel tree |
                    | wx API / canvas |  | DOM / styles     |
                    +-----------------+  +------------------+

                        no direct service <-> render channel`}</CodeBlock>
        <Table
          head={['消息', '方向', 'host 行为', '用途']}
          rows={[
            [<code>event.dispatch</code>, 'render → service', '转发到 service 连接', '原生/组件事件交给页面或组件处理函数'],
            [<code>event.trigger</code>, 'service → render', '转发到 render 连接', 'service 侧组件实例 triggerEvent'],
            [<code>data.setData</code>, 'service → render', '带 pageId 转发', '页面或组件的路径补丁'],
            [<code>runtime.componentLifecycle</code>, 'render → service', '转发', 'created/attached/ready/moved/detached'],
            [<code>runtime.componentPageLifetime</code>, 'render → service', '转发', 'show/hide；当前 service 侧为空处理，由 page.show/hide 统一分发'],
            [<code>canvas.frame</code>, 'service → render', '转发', '离屏 canvas 的 PNG 帧'],
            [<code>canvas.measure</code>, 'service → render', 'call 转 control', 'SelectorQuery 测量'],
            [<code>api.*</code>, 'service → host', 'HostApiRegistry', '导航、toast、storage 等宿主持有语义'],
            [<code>diagnostic.*</code>, 'service/render → host', '写入诊断仓库', '不跨线程回传，devtool 从 host 读取'],
          ]}
        />
        <Callout title="导航为什么需要 host">
          <p>
            service 只知道页面栈，render 只知道组件树。一次 <code>navigateTo</code> 必须由 host 先让 service 创建页面并返回
            pageId/initialData，再让 render 卸载旧页、挂载新页。宿主是唯一同时握有两侧句柄的角色。
          </p>
        </Callout>
      </Section>

      <Section
        id="ownership"
        kicker="State ownership"
        title="状态放在正确的层"
        intro="绝大多数“页面不更新/事件不触发/导航后白屏”都来自状态被复制到了错误的层。"
      >
        <Table
          head={['状态', '唯一所有者', '副本 / 投影', '同步方式']}
          rows={[
            ['manifests / artifacts', 'compiler 产出，运行时只读', '各线程内存中的 manifest', '启动时加载，不热更新'],
            ['App / Page / Component 定义', 'service registry', 'render 的组件 schema', 'bootstrap 时下发 componentSchemas'],
            ['页面栈、当前页、页面 data', 'service', 'devtool 的 pageStack 投影', 'RUNTIME_STATE 诊断'],
            ['组件实例 data / methods', 'service（自定义组件）', 'render glass-easel 组件 data', '生命周期与事件消息中携带 data'],
            ['glass-easel 节点树 / DOM', 'render', 'devtool 的 InspectNode', 'runtime.inspectTree 按需拉取'],
            ['样式与 scope id', 'render StyleScopeManager', '—', 'registerStyles 时注册'],
            ['宿主 transport / API 语义', 'host', 'service 侧 API 快照', 'api.* call / systemInfo / storage'],
            ['诊断', 'host 诊断仓库', 'devtool diagnostics', 'diagnostic.* event'],
          ]}
        />
        <Callout title="一个典型错误" tone="warn">
          <p>
            在 render 线程维护“当前页面路径”并在 service 里再存一份，会导致导航回退时两边不一致。
            正确做法是 service 拥有 pageStack，render 只执行 mount/unmount 指令，宿主只转发。
          </p>
        </Callout>
      </Section>

      <Section
        id="invariants"
        kicker="Invariants"
        title="六条不能破的约束"
        intro="它们不是风格偏好，而是这套架构能跨宿主、可测试、可诊断的原因。"
      >
        <Cards>
          <Card title="一份 manifest 契约">
            <p>所有宿主只读 <code>@tiny/manifest</code>。复制一份产物类型，就等着编译器和 runtime 各自漂移。</p>
          </Card>
          <Card title="跨线程只传 JSON-safe">
            <p>Date、Map、Set、函数、undefined、循环引用都会被 bridge 拒绝。需要传递就显式转成字符串或普通对象。</p>
          </Card>
          <Card title="依赖只向内">
            <p>核心包不能依赖 tools/apps/tests；共享类型放 manifest，而不是从 CLI 反向 import。</p>
          </Card>
          <Card title="宿主事实不写死在 runtime">
            <p>菜单按钮、性能、设备能力应通过 <code>apiExtensions</code> 注入；runtime 只定义通用 <code>wx</code> 语义。</p>
          </Card>
          <Card title="不碰 iframe 全局">
            <p>没有 <code>executeJavaScript</code>、没有直接读子帧变量。所有控制走 bridge 消息，才能被测试与替换传输。</p>
          </Card>
          <Card title="生成物不入库">
            <p>宿主产物、内置组件 ProcGen、devtool static 都由构建生成；仓库只保留源码、契约和 fixture。</p>
          </Card>
        </Cards>
        <Callout title="下一层">
          <p>
            <a href="#/compiler">编译流水线</a>解释 manifest 是怎么造出来的；
            <a href="#/runtime">运行时内核</a>解释双线程内部；
            <a href="#/protocol">Bridge 协议</a>给出完整消息目录；
            <a href="#/hosts">宿主支持</a>是这套边界真正落地的地方。
          </p>
        </Callout>
      </Section>
    </>
  )
}
