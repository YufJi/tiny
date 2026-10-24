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

export default function Hosts() {
  return (
    <>
      <PageHero
        eyebrow="Host support"
        title={<>宿主不是引擎，<br /><span className="gradient">宿主是环境适配层</span></>}
        lede="createTinyRuntime 只要求两条 Transport、一个 manifest 和初始路径。@tiny/host-browser 的 createStandaloneDualThreadHost 是浏览器实现：两个 iframe、两个 MessageChannel、15 秒就绪等待和显式 bootstrap。测试宿主与调试器都建立在它之上，但控制面不同。"
        stats={[['3', 'host shapes'], ['2', 'iframe threads'], ['2', 'API seams'], ['15s', 'thread ready timeout']]}
      />
      <PageNav items={[
        ['model', '宿主模型'],
        ['boot', '启动与握手'],
        ['threads', '线程契约'],
        ['api', '两条 API 缝'],
        ['browser', '浏览器宿主'],
        ['devtool', '调试器宿主'],
        ['matrix', '宿主矩阵'],
        ['new-host', '新宿主清单'],
        ['risks', '边界与风险'],
      ]} />

      <Section
        id="model"
        kicker="Model"
        title="四层：引擎、线程、宿主、应用"
        intro="把“宿主”当成一个包会看不清边界；它其实是四层可替换的装配。"
      >
        <Table
          head={['层', '入口', '环境假设', '职责']}
          rows={[
            ['引擎编排', <code>createTinyRuntime(options)</code>, '无 DOM 假设', '两个 BridgeConnection、HostApiRegistry、诊断仓库、bootstrap 顺序'],
            ['线程启动', <><code>bootServiceThread</code> / <code>bootRenderThread</code></>, 'service 需要 JS 全局；render 需要 glass-easel backend', '安装注册表/API、定义组件、响应消息'],
            ['浏览器宿主', <code>createStandaloneDualThreadHost</code>, 'window / iframe / MessageChannel / document', '创建 iframe、转移端口、握手、返回 host 与 iframe 句柄'],
            ['应用宿主', <><code>tests/host</code> · <code>apps/devtool</code></>, '静态资源服务器 / rspack', '选择 app、加载 manifest、提供 UI 或自动化钩子、调用 bootstrap'],
          ]}
        />
        <CodeBlock>{`app shell (host.ts / devtool React)
              |
              v
createStandaloneDualThreadHost     browser adapter
              |
              v  createTinyRuntime
createTinyRuntime                  engine orchestration
              |
              v  boot*Thread(transport, manifest)
service iframe / render iframe

A native host replaces the middle two layers, not the runtime semantics.`}</CodeBlock>
        <Callout title="standalone 不是唯一入口">
          <p>
            runtime 单测完全不使用 iframe：它用 <code>createInMemoryTransportPair()</code> 启动两个线程，再用
            <code>createTinyRuntime</code> 组装 host。这说明宿主可替换性不是口号，而是现有测试已经在用的路径。
          </p>
        </Callout>
      </Section>

      <Section
        id="boot"
        kicker="Boot"
        title="先转移端口，再握手，最后 bootstrap"
        intro="浏览器宿主的启动顺序里有一个真实竞态：端口转移早于连接安装会丢消息。就绪消息就是为此存在的。"
      >
        <Sequence steps={[
          {
            title: '建立两条 MessageChannel',
            detail: 'host 先创建两对端口；此时 iframe 还不存在。',
            code: 'createHostMessageChannelPair() × 2',
          },
          {
            title: '创建并插入 iframe',
            detail: 'service 线程被隐藏（0×0、absolute、opacity 0），render 线程 100% 填满容器；默认容器是 document.body。',
            code: "createIframe('tiny-runtime-service-frame', serviceUrl)",
          },
          {
            title: '等待线程就绪',
            detail: '监听 window message，只接受 type=tiny-runtime-port-ready、channel 匹配且 event.source 是目标 iframe 的消息；15 秒超时。',
            code: "waitForThreadReady(iframe, 'service')",
          },
          {
            title: '转移端口',
            detail: 'host 把 port2 作为 transferable 发给对应 iframe；线程用 createMessagePortTransport 包装。',
            code: "postMessage({ type: 'tiny-runtime-port' }, '*', [port])",
          },
          {
            title: '创建运行时并握手',
            detail: 'createTinyRuntime 用两条 hostTransport 建立连接；随后并行等待 service/render 两条连接的握手。',
            code: 'Promise.all([service.handshake(), render.handshake()])',
          },
          {
            title: '应用层显式 bootstrap',
            detail: 'standalone host 到此返回。测试宿主与 devtool 自己调用 host.bootstrap()，按 service → render → page.ready 顺序启动页面。',
            code: 'await runtime.host.bootstrap()',
          },
        ]} />
        <div className="split">
          <div className="stack">
            <Card tag="race" title="为什么线程要先加载再宣告">
              <p>如果线程在安装 connection 前就发 ready，host 会立刻转移端口；端口消息到达时没有 listener，第一帧就丢了。</p>
              <p>render 入口因此先 import templates、fetch styles，再调用 <code>listenForRuntimePort</code>；devtool 的 service 入口也先取 manifest。</p>
            </Card>
            <Card tag="timeout" title="15 秒固定超时">
              <p>线程 iframe 未在 15 秒内发 ready 会直接 reject，没有重试。大产物或慢网络下需要调整宿主实现，而不是改 runtime。</p>
            </Card>
          </div>
          <CodeBlock>{`// host 侧（tests/host/src/host.ts）
const runtime = await createStandaloneDualThreadHost({
  manifest,
  serviceUrl: '/service.html',
  renderUrl: '/render.html',
  initialPath: 'pages/todos/todos',
  container: document.getElementById('app'),
  systemInfo: {
    pixelRatio: devicePixelRatio,
    windowWidth: innerWidth,
    windowHeight: innerHeight,
  },
})
window.__tinyRuntime = runtime
await runtime.host.bootstrap()

// thread 侧
listenForRuntimePort('render', (transport) => {
  bootRenderThread({
    transport, manifest,
    artifacts: { templates },
    backend,
    initialPath,
    loadStyle: (path) => styles[path] ?? '',
    mountComponent,
    unmountComponent,
  })
})`}</CodeBlock>
        </div>
      </Section>

      <Section
        id="threads"
        kicker="Thread contract"
        title="线程入口只接受显式选项"
        intro="service 与 render 不读取 URL、不读取全局 manifest；所有输入都由宿主传入。"
      >
        <Table
          head={['ServiceThreadOptions', '用途', '必需']}
          rows={[
            [<code>transport</code>, 'host 连接', '是'],
            [<code>manifest</code>, '页面路径、组件、样式、诊断', '是'],
            [<code>initialPath</code>, '首屏页面 path', '是'],
            [<code>loadArtifacts</code>, '在 bootstrap 时 import service.js；保证 App/Page 已注册', '实际必需'],
            [<code>apiExtensions</code>, '注入宿主事实与额外 wx API', '否'],
            [<code>capabilities</code>, '握手元数据；当前未使用', '否'],
          ]}
        />
        <Table
          head={['RenderThreadOptions', '用途', '必需']}
          rows={[
            [<code>transport</code>, 'host 连接', '是'],
            [<code>manifest</code>, '页面、样式、组件 artifact', '是'],
            [<code>artifacts.templates</code>, '从 render.js 导入的 groupList/content', '是'],
            [<code>backend</code>, 'glass-easel GeneralBackendContext', '是'],
            [<code>initialPath</code>, '首屏页面 path', '是'],
            [<code>initialData</code>, '首屏数据；bootstrap 消息中的值优先', '否'],
            [<code>loadStyle</code>, '按 outputPath 返回 CSS 文本', '实际必需'],
            [<><code>mountComponent</code> / <code>unmountComponent</code></>, '把根组件挂到宿主节点', '否；缺省 pretendAttached'],
            [<code>onDiagnostic</code>, '本地诊断回调；跨线程仍走 bridge', '否'],
          ]}
        />
        <div className="split">
          <Card title="service 线程的额外要求">
            <ul>
              <li>先安装 <code>App/Page/Component/Behavior/getApp/wx</code> 全局</li>
              <li>再 import service.js，让注册调用按 manifest 顺序发生</li>
              <li><code>loadArtifacts</code> 必须在 bootstrap 内 await</li>
              <li>浏览器 canvas 依赖 <code>document</code></li>
            </ul>
          </Card>
          <Card title="render 线程的额外要求">
            <ul>
              <li>一个 glass-easel backend 实例</li>
              <li>模板 group 已从 render.js 取出</li>
              <li>样式文本已按 outputPath 预加载</li>
              <li>挂载点有确定的 DOM 容器</li>
            </ul>
          </Card>
        </div>
        <Callout title="manifest 以消息为准" >
          <p>
            render 的 bootstrap 处理器优先使用消息里的 <code>manifest</code>、<code>initialPath</code>、<code>initialData</code>、
            <code>componentSchemas</code>；线程选项只是宿主侧默认值和样式/模板加载来源。
          </p>
        </Callout>
      </Section>

      <Section
        id="api"
        kicker="API seams"
        title="两条扩展缝，别放错位置"
        intro="这是宿主支持里最容易混的一点：跨线程 API 在 host，宿主事实在 service。"
      >
        <div className="split">
          <Card tag="host" title="apiHandlers：跨线程语义">
            <p>注册在 host 的 <code>HostApiRegistry</code>，通过 <code>api.*</code> call 被 service 调用。</p>
            <ul>
              <li><code>navigate.to</code> / <code>navigate.back</code>：host 同时编排 service 与 render</li>
              <li><code>storage.get/set</code>：宿主持久化</li>
              <li><code>toast.show</code>：宿主 UI（当前仅返回 errMsg）</li>
              <li><code>system.info</code>：宿主系统信息快照</li>
              <li>任意自定义 <code>apiHandlers</code>，比如文件、网络、设备</li>
            </ul>
            <p>默认 handler 位于 <code>packages/runtime/src/host-api.ts</code>，可被选项覆盖；浏览器能力位于 <code>hosts/browser</code>。</p>
          </Card>
          <Card tag="service" tone="violet" title="apiExtensions：宿主事实">
            <p>直接合并进 service 线程的 <code>wx</code> API host，运行在 service 线程。</p>
            <ul>
              <li><code>getMenuButtonBoundingClientRect</code></li>
              <li><code>getPerformance</code>（now/mark/measure/observer）</li>
              <li>其他依赖设备或壳层的同步 API</li>
            </ul>
            <p>测试宿主和 devtool 各有一份实现；核心 runtime 不硬编码这些值。</p>
          </Card>
        </div>
        <Table
          head={['问题', '正确落点', '原因']}
          rows={[
            ['菜单按钮位置随设备变化', <code>apiExtensions</code>, 'service 代码同步调用，且属于宿主事实'],
            ['页面跳转要同时改两个线程', <code>apiHandlers</code>, '只有 host 同时持有两侧连接'],
            ['storage 写入要持久化', <code>apiHandlers</code>, '宿主拥有真实存储'],
            ['system info 快照', 'bootstrap 的 systemInfo + 可选 apiExtensions', 'service 需要同步读取'],
            ['原生 toast/loading', <code>apiHandlers</code>, '需要壳层 UI，不属于 runtime'],
          ]}
        />
        <Callout title="AGENTS 里的硬规则">
          <p>
            “Host facts (menu-button geometry, performance, device capabilities) are supplied by the host through
            <code>ServiceThreadOptions.apiExtensions</code>; do not hardcode them in packages/runtime's service API host.”
            这条规则就是这两条缝的分界。
          </p>
        </Callout>
      </Section>

      <Section
        id="browser"
        kicker="Browser host"
        title="standalone 宿主做了什么、没做什么"
        intro="它只有约一百行，但把 iframe 生命周期、端口转移和握手都收拢在一处。"
      >
        <div className="split">
          <div className="stack">
            <Card title="做了什么">
              <ul>
                <li>创建两对 MessageChannel</li>
                <li>创建 service（隐藏）/ render（可见）iframe</li>
                <li>等待 ready 消息，最多 15s</li>
                <li>转移 port2，调用 createTinyRuntime</li>
                <li>并行完成两条握手</li>
                <li>返回 host + 两个 iframe 句柄</li>
              </ul>
            </Card>
            <Card title="没做什么" tone="warn">
              <ul>
                <li>不加载 manifest 或产物</li>
                <li>不调用 bootstrap</li>
                <li>不提供 backend、样式加载或挂载点</li>
                <li>不注入 systemInfo/storage/apiExtensions</li>
                <li>不管理多应用、诊断或 UI</li>
                <li>不负责关闭时移除 iframe</li>
              </ul>
            </Card>
          </div>
          <div className="stack">
            <Card tag="tests/host" title="无 UI 单应用宿主">
              <p>三个 Vite 入口：<code>index.html</code> host、<code>service.html</code>、<code>render.html</code>。host 把页面挂到 <code>#app</code>，并暴露 <code>window.__tinyRuntime</code> 给 Playwright。</p>
              <p>service 入口注入 menu-button 与 performance；render 入口用 <code>CurrentWindowBackendContext</code>，通过 <code>Element.replaceDocumentElement</code> 挂载。</p>
            </Card>
            <Card tag="static serving" title="产物如何到达线程">
              <p>manifest 由打包器静态导入；render.js 动态 import；styles 通过 <code>fetch('/generated/...')</code> 取文本后交给 <code>loadStyle</code>。</p>
              <p>宿主必须能按 manifest 中的相对路径提供静态文件。</p>
            </Card>
          </div>
        </div>
        <CodeBlock>{`render.html
  |-- import render.js
  |-- fetch manifest + styles
  |-- new CurrentWindowBackendContext
  |-- listenForRuntimePort('render')
  +-- bootRenderThread({
        transport, manifest, artifacts, backend,
        initialPath, loadStyle,
        mountComponent, unmountComponent,
      })

service.html
  |-- listenForRuntimePort('service')
  +-- bootServiceThread({
        transport, manifest, initialPath,
        apiExtensions,
        loadArtifacts: () => import(service.js),
      })`}</CodeBlock>
      </Section>

      <Section
        id="devtool"
        kicker="Debugger host"
        title="devtool 只是 standalone 的受控封装"
        intro="React/Redux 不发送协议消息；它们只调用 DevtoolRuntimeClient，并订阅它投影出来的状态。"
      >
        <Table
          head={['DevtoolRuntimeClient 方法', '底层动作', '状态变化']}
          rows={[
            [<code>launch()</code>, '创建容器（如未提供）→ standalone host → bootstrap → inspectTree', 'connecting → running / error'],
            [<code>terminate()</code>, '关闭两个连接、移除 iframe、移除自有容器', 'terminated'],
            [<code>reload()</code>, 'terminate → idle → launch', 'running'],
            [<code>navigate(url)</code>, <>调用 host 的 <code>navigate.to</code> handler，再 inspectTree</>, 'pageStack 由 RUNTIME_STATE 更新'],
            [<code>back(delta)</code>, <>调用 host 的 <code>navigate.back</code> handler，再 inspectTree</>, 'pageStack 收缩'],
            [<code>foreground()</code>, <>直接 <code>service.control page.show</code></>, '页面生命周期变化'],
            [<code>background()</code>, <>直接 <code>service.control page.hide</code></>, '页面生命周期变化'],
            [<code>inspectTree()</code>, <><code>render.control runtime.inspectTree</code></>, 'tree 更新'],
          ]}
        />
        <div className="split">
          <Card title="状态投影">
            <p><code>DevtoolRuntimeState</code> 包含 status、currentPage、pageStack、diagnostics、tree、error。诊断最多保留 500 条。</p>
            <p><code>RUNTIME_STATE</code> 诊断里的 pageStack/currentPage 会被提取成独立字段，React 面板无需解析诊断文本。</p>
          </Card>
          <Card title="多应用切换" tone="violet">
            <p>devtool 扫描 <code>tests/apps/*</code>，把每个 fixture 的产物放在 <code>/runtime/apps/&lt;app&gt;/generated</code>，并通过 <code>/runtime/apps.json</code> 生成应用下拉框；线程入口从 <code>?app=</code> 读取 appId，再 fetch 对应 manifest。</p>
            <p>面板切换应用是整页重载（<code>window.location.assign</code>），不是运行时内切换。</p>
          </Card>
        </div>
        <Callout title="为什么用 new Function import">
          <p>
            devtool 的 service/render 线程入口用 <code>new Function('url', 'return import(url)')</code> 加载生成产物，
            避免 rspack 把动态 import 重写成自己的模块系统。这是打包器适配，不是协议要求。
          </p>
        </Callout>
      </Section>

      <Section
        id="matrix"
        kicker="Host matrix"
        title="三种真实宿主，一个未实现方向"
        intro="区别不在 runtime，而在谁提供环境、谁拥有控制面。"
      >
        <Table
          head={['宿主', '线程容器', 'backend', '控制面', '产物加载', '诊断']}
          rows={[
            ['tests/host', '两个 iframe（Vite）', 'CurrentWindowBackendContext', 'URL ?path + window.__tinyRuntime', '静态 import + fetch', 'host 数组 + window'],
            ['apps/devtool', '两个 iframe（rspack）', 'CurrentWindowBackendContext', 'DevtoolRuntimeClient + React/Redux', 'fetch manifest + new Function import', '投影到 Redux'],
            ['runtime 单测', '同进程', 'EmptyBackendContext', '直接持有 BridgeConnection', '测试内联 manifest/templates', '断言数组'],
            ['原生宿主（未实现）', 'JSCore / 原生容器 + 原生渲染层', '需实现 GeneralBackendContext', '自定义控制面', '需为原生打包 ESM/资源', '需接入 host store 或自定义'],
          ]}
        />
        <div className="split">
          <Card title="共享的部分">
            <ul>
              <li>manifest 契约</li>
              <li>BridgeConnection 与消息目录</li>
              <li>service/render 启动选项</li>
              <li>bootstrap 顺序</li>
              <li>HostApiRegistry 的默认语义</li>
            </ul>
          </Card>
          <Card title="不共享的部分">
            <ul>
              <li>Transport 实现</li>
              <li>backend 与挂载方式</li>
              <li>样式/模板加载策略</li>
              <li>控制面与 UI</li>
              <li>关闭与重启策略</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        id="new-host"
        kicker="New host"
        title="接入一个新宿主的检查清单"
        intro="按顺序做完这些，才能声称“支持 Tiny”。"
      >
        <Sequence steps={[
          {
            title: '加载并校验 manifest',
            detail: '读取 schemaVersion=1，按 entries 与 artifact 路径解析产物。不要复制产物类型。',
          },
          {
            title: '创建两条 Transport',
            detail: 'service 与 render 各一条；帧边界、非空 messages、JSON-safe 由 bridge 兜底，但传输必须保序。',
          },
          {
            title: '启动两个线程',
            detail: 'service 侧安装全局并 loadArtifacts；render 侧提供 templates、backend、loadStyle、mount/unmount。',
          },
          {
            title: '等待连接安装后再握手',
            detail: '不要在 transport 接收端就绪前发送帧；用 ready 消息/显式同步点。',
          },
          {
            title: '提供宿主事实',
            detail: 'systemInfo、storage 初始快照；设备相关同步 API 走 apiExtensions。',
          },
          {
            title: '实现导航与宿主 API',
            detail: 'navigate.to/back 必须在 host 侧先 service 后 render；storage/toast 等按需实现。',
          },
          {
            title: '调用 bootstrap',
            detail: '依次 service.bootstrap → render.bootstrap → service.page.ready；不要跳过 page.ready。',
          },
          {
            title: '接入诊断与控制',
            detail: '收集 diagnostic.*；按需暴露 inspectTree、page.show/hide、close。',
          },
          {
            title: '定义关闭语义',
            detail: '关闭两条连接、释放线程、卸载页面；当前 host.close 只关连接，不自动移除 iframe。',
          },
          {
            title: '跑真实 fixture',
            detail: '至少覆盖 demo、mini、Taro 3 中的一条；否则只能证明“能启动”，不能证明“能跑应用”。',
          },
        ]} />
        <Callout title="原生宿主尚未实现" tone="warn">
          <p>
            当前没有 native transport、native backend 或非浏览器 service 运行时。service 的 canvas 适配依赖 <code>document</code>，
            render 的 selector 测量与 canvas 帧绘制也直接使用 <code>document</code>。原生宿主需要先抽象这些环境依赖，或按平台提供替代实现。
          </p>
        </Callout>
      </Section>

      <Section
        id="risks"
        kicker="Risks"
        title="当前宿主实现的边界"
        intro="这些是生产化前必须知道的实现事实，不是设计目标。"
      >
        <Cards>
          <Card tag="origin" tone="warn" title="postMessage 使用 '*'">
            <p>宿主转移端口与线程发 ready 都使用 <code>'*'</code> targetOrigin；线程侧没有校验 origin。当前假设同源静态宿主。</p>
          </Card>
          <Card tag="sandbox" tone="warn" title="iframe 没有 sandbox">
            <p>service iframe 只是视觉隐藏，没有 sandbox 属性；它仍能访问同源 DOM。隔离依靠同源部署与约定，不是浏览器安全边界。</p>
          </Card>
          <Card tag="close" tone="warn" title="关闭不卸载页面">
            <p><code>host.close()</code> 只关闭两条连接并 reject pending。页面 onUnload、iframe 移除、容器清理由调用方负责（devtool 自己做了）。</p>
          </Card>
          <Card tag="capabilities" tone="warn" title="没有能力协商">
            <p>握手携带 capabilities，但 host 没有注入，也没有任何降级逻辑。不同宿主的能力差异只能靠代码分支和诊断。</p>
          </Card>
          <Card tag="reload" tone="warn" title="没有热更新">
            <p>产物变更后必须重新 reload/launch；没有 HMR，也没有协议级 artifact reload。devtool 的 Reload 是重建整个 host。</p>
          </Card>
          <Card tag="subpackage" tone="warn" title="没有按需加载">
            <p>service bundle 包含所有页面脚本，子包只是 manifest 中的路径；宿主不能按子包延迟加载。</p>
          </Card>
        </Cards>
        <Callout title="下一层">
          <p>
            看宿主如何被验收：<a href="#/testing">测试与兼容</a>；
            看这些边界对应的路线：<a href="#/status">现状与路线</a>。
          </p>
        </Callout>
      </Section>
    </>
  )
}
