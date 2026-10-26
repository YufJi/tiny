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
        eyebrow="架构"
        title={<>五类职责，两个线程，<br /><span className="gradient">一份 manifest</span></>}
        lede="Tiny 按职责划分模块，而不是按目录。编译器只生成产物；runtime 不依赖浏览器，负责小程序语义；Bridge 只负责传输；@tiny/host-browser 提供浏览器环境；@tiny/host-web-components 提供内置组件实现；devtool 负责观察和控制。"
        stats={[['2', '运行时线程'], ['1', 'manifest 版本'], ['7', '消息域'], ['0', '内核中的浏览器全局']]}
      />
      <PageNav items={[
        ['boundaries', '职责边界'],
        ['purity', '内核约束'],
        ['glass-easel', '与 glass-easel 的分工'],
        ['dependencies', '依赖关系'],
        ['boot', '启动流程'],
        ['channels', '消息转发'],
        ['ownership', '状态归属'],
        ['invariants', '设计约束'],
      ]} />

      <Section
        id="boundaries"
        kicker="职责边界"
        title="每一层各自负责什么"
        intro="先看职责，再看代码放在哪。几个角色之间的接口都是显式的。"
      >
        <Table
          head={['角色', '负责', '不负责', '代码位置']}
          rows={[
            ['compiler', '扫描源码、编译模板和样式、转译脚本、打包 service、生成 manifest 和诊断', '页面生命周期、路由、wx API、DOM', <code>tools/cli</code>],
            ['manifest', '定义产物类型、schemaVersion 和解析后的命名配置', '具体实现', <code>packages/manifest</code>],
            ['runtime', 'App/Page/Component 语义、页面栈、setData、事件、组件语义、逻辑组件树、命名和 canvas 帧协议', '传输实现、宿主 API、DOM、canvas 实现、界面', <code>packages/runtime</code>],
            ['bridge', '消息信封和帧、transport、调用与回复、批处理、超时和 JSON 校验', 'wx API 语义、渲染指令、页面状态', <code>packages/bridge</code>],
            ['host', '线程和 transport、启动流程、宿主 API、渲染后端和挂载点、canvas、资源 URL、诊断收集、内置组件定义和样式', '业务状态、glass-easel 语义', <><code>hosts/browser</code> · <code>hosts/web-components</code> · <code>apps/devtool</code> · <code>tests/host</code> · 未来原生宿主</>],
          ]}
        />
        <Callout title="页面状态只在 service">
          <p>
            页面栈、页面 data 和组件的逻辑实例都归 service 线程管；render 线程负责 glass-easel 组件树、DOM，
            以及 adapter 维护的组件 ID 映射。两个线程没有直接通道，跨线程状态必须经过宿主转发，并受 Bridge 校验。
          </p>
        </Callout>
      </Section>

      <Section
        id="purity"
        kicker="内核约束"
        title="内核不依赖浏览器"
        intro="浏览器相关代码和内置组件实现都已经移到 hosts/ 下，并通过脚本检查依赖方向。"
      >
        <div className="split">
          <Card tag="packages/runtime" title="不依赖宿主的内核">
            <p>只依赖 manifest、bridge、glass-easel 和通用工具；入口不再导出 standalone host、runtime port、canvas bridge 或 devtool client。</p>
            <p>service 和 render 需要 DOM 能力时，通过 <code>canvas</code>、<code>resolveAssetUrl</code>、<code>backend</code>、<code>mountComponent</code> 等参数注入；内置组件通过 <code>builtinComponents</code> 注入。</p>
          </Card>
          <div className="stack">
            <Card tag="hosts/browser" tone="violet" title="浏览器适配">
              <p><code>@tiny/host-browser</code> 负责 iframe、MessageChannel、DOM canvas、资源 URL 和 <code>DevtoolRuntimeClient</code>。</p>
              <p>它依赖 runtime 和 bridge，但 runtime 不会反向依赖它。<code>tests/host</code> 和 devtool 都从这里拿浏览器能力。</p>
            </Card>
            <Card tag="hosts/web-components" tone="violet" title="内置组件实现">
              <p><code>@tiny/host-web-components</code> 负责 <code>tiny-*</code> 宿主定义、Web/DOM 行为和默认 CSS。</p>
              <p>它是宿主包，不属于内核。render 线程通过 <code>builtinComponents</code> 注入 <code>webBuiltinComponents</code>，原生宿主可以换成自己的实现。</p>
            </Card>
          </div>
        </div>
        <CodeBlock>{`# pnpm check:runtime-purity
packages/runtime/src/index.ts
  -> types / diagnostics / glass-easel-adapter / service / render / host

不允许出现在依赖图里的内容：
  window · document · navigator · localStorage · MessageChannel
  HTMLCanvasElement · Image · requestAnimationFrame · fetch · performance
  名字里带 "browser" 的模块 · @tiny/host-* 导入

# hosts/browser
  canvas-bridge.ts       service 侧绘制，render 侧测量和上屏
  runtime-port.ts        iframe 端口握手
  standalone-host.ts     两个 iframe + MessageChannel
  devtool-client.ts      调试器控制接口

# hosts/web-components
  webBuiltinComponents   tiny-* 定义和基础 CSS，注入 render`}</CodeBlock>
        <Callout title="为什么要守住这条线">
          <p>
            原生宿主不需要模拟浏览器，只要提供 <code>Transport</code>、glass-easel 后端、canvas 适配器和资源解析即可。
            有了这项检查，内核里如果误用了 <code>document</code>，CI 会直接失败，而不是等到换宿主时才发现。
          </p>
        </Callout>
      </Section>

      <Section
        id="glass-easel"
        kicker="运行时内核"
        title="glass-easel 提供组件框架，Tiny 补齐应用层"
        intro="glass-easel 不是完整的小程序 SDK。它负责组件、模板、数据绑定、事件和生命周期，App、路由、API 等由 Tiny 自己实现。"
      >
        <Table
          head={['能力', '由谁提供', '在 Tiny 中如何使用']}
          rows={[
            ['组件定义、properties、data、methods、模板', 'glass-easel', <><code>defineWithMethodCaller</code> / <code>defineComponent</code></>],
            ['WXML 运行时数据绑定与更新', 'glass-easel', '编译器把 WXML 编成 ProcGen，运行时只传 groupList/content'],
            ['事件捕获与冒泡、slot、shadow 边界', 'glass-easel', 'adapter 把事件序列化后送到 service'],
            ['created/attached/ready/moved/detached 生命周期', 'glass-easel', 'adapter 转成 componentLifecycle 消息'],
            ['样式作用域和 render backend', 'glass-easel', 'StyleScopeManager + backend；styleIsolation 由 Tiny 组装'],
            ['Behaviors / observers / relations / selectComponent', 'Tiny runtime', 'component-definition 归一化 + ComponentTree + RelationManager'],
            ['App 生命周期、页面栈、路由、onLoad/onShow/onReady', 'Tiny runtime', <code>packages/runtime/src/service.ts</code>],
            ['命名空间、manifest naming、API 别名', 'Tiny manifest + runtime', 'tiny.config.json → manifest.naming → 全局 API / marker / host 属性'],
            ['wx API、storage、system info、animation', 'Tiny runtime + host', 'service 侧 API host；设备信息由 extensions 注入'],
            ['canvas、资源 URL、DOM 节点', '宿主适配器', 'canvas 适配器 / resolveAssetUrl / backend / mountComponent'],
            ['跨线程 setData、事件分发、页面切换', 'Tiny runtime + bridge + host', 'data.setData / event.dispatch / page.navigateTo'],
            ['元素树检查、生命周期控制、诊断投影', 'Tiny runtime + devtool', <><code>DevtoolRuntimeClient</code> + <code>runtime.inspectTree</code></>],
          ]}
        />
        <Callout title="为什么不直接用官方的 miniprogram adapter">
          <p>
            官方 adapter 的注册接口更接近微信，但页面生命周期、宿主控制和原生能力都会被限制在 adapter 已支持的范围内。
            Tiny 直接使用 glass-easel 的核心 API，自己管理 App、页面栈、路由和 API host，后续接新宿主时也更自由。
          </p>
        </Callout>
      </Section>

      <Section
        id="dependencies"
        kicker="依赖关系"
        title="依赖只能向内"
        intro="这是当前工作区的真实依赖。核心包不能依赖 tools、apps、hosts 或 tests；宿主适配器反过来依赖内核。"
      >
        <Table
          head={['包或应用', '依赖', '作用']}
          rows={[
            [<code>@tiny/manifest</code>, '无', '产物与诊断类型'],
            [<code>@tiny/bridge</code>, '无', '协议、transport、批处理和错误'],
            [<code>@tiny/template-compiler</code>, '无（纯 TS）', 'WXML → ProcGen'],
            [<code>@tiny/stylesheet-compiler</code>, 'postcss', 'WXSS → 普通/低优先级 CSS'],
            [<code>@tiny/cli</code>, 'manifest · template-compiler · stylesheet-compiler · esbuild · typescript', '负责生成全部产物'],
            [<code>@tiny/runtime</code>, 'manifest · bridge · glass-easel · es-toolkit', '双线程运行时内核，不依赖宿主'],
            [<code>@tiny/host-browser</code>, 'runtime · bridge', '浏览器宿主：iframe、MessageChannel、Canvas、devtool 覆盖层'],
            [<code>@tiny/host-web-components</code>, 'manifest · runtime · glass-easel；构建期 template-compiler', '23 个内置组件、AOT 模板和默认 CSS（宿主包）'],
            [<code>devtool</code>, 'host-browser · host-web-components · glass-easel · React · Redux/rematch', '调试器宿主和控制面板'],
            [<code>@tiny/website</code>, 'React', '架构站点，不进入引擎链路'],
          ]}
        />
        <CodeBlock>{`core        packages/manifest
            packages/bridge
            packages/template-compiler
            packages/stylesheet-compiler
            packages/runtime           -> manifest, bridge, glass-easel
hosts       hosts/browser              -> runtime, bridge   (环境适配)
            hosts/web-components       -> runtime, manifest, glass-easel
                                          (内置组件，注入 render)
tools       tools/cli                  -> manifest, template-compiler, stylesheet-compiler
apps        apps/devtool               -> host-browser, host-web-components
tests       tests/host                 -> host-browser, host-web-components
                                          (不是 workspace 包)
fixtures    tests/apps/*               -> 只有源码，编译后交给宿主

规则：packages/* 不能导入 tools/*、apps/*、hosts/*、tests/*`}</CodeBlock>
        <Callout title="一个常见的错误依赖">
          <p>
            如果 runtime 为了类型去 import <code>@tiny/cli</code>，Node 的 fs 和 esbuild 就会被打进浏览器线程，
            打包时还会出现无法解析的 builtin。共享类型应该放在 <code>@tiny/manifest</code>，不要让工具反向提供类型。
          </p>
        </Callout>
      </Section>

      <Section
        id="boot"
        kicker="启动流程"
        title="一次启动要经过哪些步骤"
        intro="从编译产物到页面可交互，要经过 iframe、两次握手、两次 bootstrap 和一次 page.ready。render 可以共享，也可以每页一个 iframe。"
      >
        <Sequence steps={[
          {
            title: '编译并写出产物',
            actor: 'tools/cli',
            detail: '读取 app.json，扫描入口，生成 templates.js、styles、scripts、service.js 和 render.js，最后写出 manifest.json。诊断信息随 manifest 一起返回。',
            code: 'compileMiniProgram({ sourceDir, outputDir })',
          },
          {
            title: '创建两条独立通道',
            actor: '宿主',
            detail: '每个线程各一条 MessageChannel。service 和 render 不共享端口，由宿主分别持有两条 hostTransport。',
            code: 'createHostMessageChannelPair() × 2',
          },
          {
            title: '创建 iframe，等待线程就绪',
            actor: '宿主',
            detail: 'service iframe 被隐藏为 0×0，render iframe 填满容器；每页 render 模式下，每新建一个页面就创建一个 render iframe。宿主等待线程发回 tiny-runtime-port-ready，最多等 15 秒。',
            code: 'createStandaloneDualThreadHost(...)',
          },
          {
            title: '线程装好连接后再通知宿主',
            actor: 'service / render',
            detail: 'render 先导入 templates 并取到 styles；service 先拿到 manifest。service bundle 更晚，在 bootstrap 时通过 loadArtifacts 导入。线程要等 connection 安装完成，才调用 listenForRuntimePort，避免端口消息到达时丢帧。',
            code: "listenForRuntimePort('render', (transport) => ...)",
          },
          {
            title: '把 MessagePort 交给线程',
            actor: '宿主',
            detail: '宿主把 port2 作为 transferable 发给对应 iframe；线程再用 createMessagePortTransport 包装成 Transport。',
            code: "postMessage({ type: 'tiny-runtime-port' }, '*', [port])",
          },
          {
            title: '两条连接分别握手',
            actor: 'bridge',
            detail: '宿主分别发起 runtime.hello，service/render 回复握手信息并发送 runtime.ready。协议版本不一致时连接会直接关闭。',
            code: 'host.service.handshake() · host.render.handshake()',
          },
          {
            title: 'service 启动首屏',
            actor: '宿主 → service',
            detail: '导入 service.js，App/Page/Component 在这里注册，App.onLaunch/onShow 也会立即执行。随后按 manifest.naming 安装 API 全局，构建组件 schema，创建首个页面并触发 onLoad/onShow，返回 pageId、initialData、componentSchemas 和 pageComponents。',
            code: "service.control('runtime', 'bootstrap')",
          },
          {
            title: 'render 挂载首屏',
            actor: '宿主 → render',
            detail: '先注册基础样式和 manifest 样式，再注册组件 schema 与组件型页面选项，挂载页面并等待组件树稳定，最后返回组件快照。顺序不能反，否则组件定义拿不到样式作用域。',
            code: "render.control('runtime', 'bootstrap')",
          },
          {
            title: 'page.ready 补齐组件树',
            actor: '宿主 → service',
            detail: '宿主把 render 返回的组件快照一起发给 service；service 先创建组件实例、补齐逻辑组件树，再触发 onReady。这样 onReady 里的 selectComponent 和 relations 已经可用。',
            code: "service.control('page', 'ready', { pageId, components })",
          },
          {
            title: '广播状态，页面可交互',
            actor: 'service',
            detail: 'service 发送 RUNTIME_STATE，包含 pageStack、currentPage 和 transport 状态；宿主诊断仓库和 devtool 据此更新界面。',
            code: "sendDiagnostic('state', { code: 'RUNTIME_STATE' })",
          },
        ]} />
        <Callout title="bootstrap 要由宿主主动调用">
          <p>
            <code>createStandaloneDualThreadHost</code> 只负责创建线程、完成握手并返回 host，不会自动调用 bootstrap。
            测试宿主和调试器都需要自己执行 <code>host.bootstrap()</code>，否则页面不会被创建。
          </p>
        </Callout>
      </Section>

      <Section
        id="channels"
        kicker="消息转发"
        title="service 和 render 没有直连"
        intro="所有跨线程消息都经过宿主的两条 BridgeConnection。宿主负责转发，也是唯一能同时看到两侧状态的地方。"
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

                        service 和 render 之间没有直连通道`}</CodeBlock>
        <Table
          head={['消息', '方向', '宿主处理', '用途']}
          rows={[
            [<code>event.dispatch</code>, 'render → service', '转发到 service 连接', '原生事件或组件事件交给页面/组件处理函数'],
            [<code>event.trigger</code>, 'service → render', '转发到 render 连接', 'service 侧组件实例 triggerEvent'],
            [<code>data.setData</code>, 'service → render', '带 pageId 转发', '页面或组件的路径更新'],
            [<code>runtime.componentLifecycle</code>, 'render → service', '转发', 'created/attached/ready/moved/detached，附带 page/tag/parent 信息'],
            [<code>runtime.componentData</code>, 'render → service', '转发 payload（pageId 在 payload 里）', 'render 侧组件 data 变化，同步到 service 实例'],
            [<code>runtime.componentObserved</code>, 'render → service', '转发 payload（pageId 在 payload 里）', 'render 侧 observer 触发，service 用旧值执行 observer'],
            [<code>runtime.componentPageLifetime</code>, 'render → service', '转发', 'show/hide；service 侧由 page.show/hide 统一分发'],
            [<code>canvas.frame</code>, 'service → render', '转发', '宿主 canvas 适配器产生的 PNG 帧'],
            [<code>canvas.measure</code>, 'service → render', '把 call 转成 control', 'SelectorQuery 测量，交给宿主 canvas.measure'],
            [<code>api.*</code>, 'service → host', 'HostApiRegistry 查 handler', '导航、toast、storage 等由宿主提供语义'],
            [<code>diagnostic.*</code>, 'service/render → host', '写入诊断仓库', '不回传另一侧，devtool 从宿主读取'],
          ]}
        />
        <Callout title="导航为什么要经过宿主">
          <p>
            service 只知道页面栈，render 只知道组件树。一次 <code>navigateTo</code> 必须由宿主先让 service 创建页面并返回
            pageId/initialData，再让 render 卸载旧页、挂载新页。只有宿主同时持有两侧的连接。
          </p>
        </Callout>
      </Section>

      <Section
        id="ownership"
        kicker="状态归属"
        title="状态应该放在哪一层"
        intro="很多“页面不更新、事件不触发、返回后白屏”的问题，都是因为状态被复制到了错误的层。"
      >
        <Table
          head={['状态', '归属', '副本或投影', '同步方式']}
          rows={[
            ['manifest 和产物', '编译器生成，运行时只读', '各线程内存中的 manifest', '启动时加载，不做热更新'],
            ['App / Page / Component 定义', 'service registry', 'render 的组件 schema', 'bootstrap 时下发 componentSchemas'],
            ['页面栈、当前页、页面 data', 'service', 'devtool 的 pageStack 投影', 'RUNTIME_STATE 诊断'],
            ['组件实例 data / methods', 'service（逻辑实例）', 'render glass-easel 组件 data', 'componentLifecycle / componentData / componentObserved'],
            ['逻辑组件树与 relations', 'service ComponentTree / RelationManager', 'render 的真实组件树', 'lifecycle attached/moved/detached + page.ready 快照'],
            ['glass-easel 节点树 / DOM', 'render', 'devtool 的 InspectNode', '按需调用 runtime.inspectTree'],
            ['样式和 scope id', 'render StyleScopeManager', '无', 'registerStyles 时注册；styleIsolation 按页面作用域组装'],
            ['canvas 实现', '宿主 canvas 适配器', 'service 绘制上下文 / render 可见 canvas', 'ServiceCanvasAdapter · RenderCanvasAdapter'],
            ['资源 URL', '宿主 resolveAssetUrl', 'render 重写后的 img/src 和 CSS url()', 'adapter 在模板/样式注册时解析'],
            ['宿主 transport / API 语义', '宿主', 'service 侧 API 快照', 'api.* 调用 / systemInfo / storage / apiExtensions'],
            ['诊断', '宿主诊断仓库', 'devtool diagnostics', 'diagnostic.* 事件'],
          ]}
        />
        <Callout title="一个常见错误" tone="warn">
          <p>
            如果在 render 线程也维护一份“当前页面路径”，service 里再存一份，导航返回时两边很容易对不上。
            正确做法是：页面栈归 service，render 只执行挂载和卸载，宿主只负责转发。
          </p>
        </Callout>
      </Section>

      <Section
        id="invariants"
        kicker="设计约束"
        title="这些约束不能破"
        intro="它们决定了引擎能否跨宿主、方便测试，也方便定位问题。"
      >
        <Cards>
          <Card title="所有宿主共用一个 manifest">
            <p>所有宿主只读 <code>@tiny/manifest</code>。一旦复制一份产物类型，编译器和运行时迟早会对不上。</p>
          </Card>
          <Card title="跨线程只传 JSON 安全的数据">
            <p>Date、Map、Set、函数、undefined 和循环引用都会被 Bridge 拒绝。需要传递时，请先转成字符串或普通对象。</p>
          </Card>
          <Card title="依赖只能向内">
            <p>核心包不能依赖 tools、apps、hosts 或 tests；共享类型放在 manifest 里，不要从 CLI 反向导入。浏览器能力只能从 <code>hosts/browser</code> 进入宿主，内置组件只能从 <code>hosts/web-components</code> 进入宿主。</p>
          </Card>
          <Card title="内核不引用浏览器 API">
            <p><code>pnpm check:runtime-purity</code> 会从 runtime 入口遍历依赖，禁止 window、document、iframe、MessageChannel、fetch 等宿主全局。</p>
          </Card>
          <Card title="环境能力由宿主注入">
            <p>设备信息走 <code>apiExtensions</code>，canvas 走 <code>ServiceCanvasAdapter</code> / <code>RenderCanvasAdapter</code>，资源走 <code>resolveAssetUrl</code>，渲染后端和挂载点也由宿主提供。</p>
          </Card>
          <Card title="命名配置只有一个来源">
            <p>模板指令、API 全局、别名、behavior scheme、宿主属性和 tag marker 全部从 <code>manifest.naming</code> 派生，不要在 runtime 里散落 <code>wx</code> 字符串。</p>
          </Card>
          <Card title="构建产物不入库">
            <p>宿主产物、内置组件 ProcGen、devtool 静态文件和站点里的 devtool 都由构建生成；仓库只保留源码、约定和测试 fixture。</p>
          </Card>
        </Cards>
        <Callout title="继续阅读">
          <p>
            <a href="#/compiler">编译流程</a>说明 manifest 是怎么生成的；
            <a href="#/runtime">运行时内核</a>说明双线程内部怎么协作；
            <a href="#/protocol">Bridge 协议</a>列出完整消息；
            <a href="#/hosts">宿主适配</a>说明这些边界在浏览器里怎么实现。
          </p>
        </Callout>
      </Section>
    </>
  )
}
