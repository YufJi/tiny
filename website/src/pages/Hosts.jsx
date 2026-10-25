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
        lede="packages/runtime 是宿主无关内核；浏览器能力单独放在 @tiny/host-browser。createTinyRuntime 只要求两条 Transport、一个 manifest 和初始路径；createStandaloneDualThreadHost 负责 iframe、MessageChannel、15 秒就绪等待和显式 bootstrap。canvas、资源 URL、backend 与挂载点都通过选项注入。"
        stats={[['1', 'browser host package'], ['2', 'iframe threads'], ['4', 'injection seams'], ['0', 'browser globals in core']]}
        pills={[['host-independent', 'good'], ['canvas injected', 'good'], ['assets resolved', 'good'], ['embedded devtool', 'good']]}
      />
      <PageNav items={[
        ['model', '宿主模型'],
        ['purity', 'runtime 纯度'],
        ['boot', '启动与握手'],
        ['threads', '线程契约'],
        ['injections', '宿主注入面'],
        ['browser', '浏览器宿主'],
        ['devtool', '调试器宿主'],
        ['matrix', '宿主矩阵'],
        ['new-host', '新宿主清单'],
        ['risks', '边界与风险'],
      ]} />

      <Section
        id="model"
        kicker="Model"
        title="引擎、线程、宿主、应用"
        intro="把“宿主”当成一个包会看不清边界；它其实是可替换的装配层。"
      >
        <Table
          head={['层', '入口', '环境假设', '职责']}
          rows={[
            ['内核编排', <code>createTinyRuntime(options)</code>, '无 DOM 假设', '两个 BridgeConnection、HostApiRegistry、诊断仓库、bootstrap 顺序'],
            ['线程启动', <><code>bootServiceThread</code> / <code>bootRenderThread</code></>, 'service 需要 JS 全局；render 需要 glass-easel backend', '安装注册表/API、定义组件、响应消息；canvas / assets / builtinComponents 通过选项注入'],
            ['浏览器适配', <><code>@tiny/host-browser</code></>, 'window / iframe / MessageChannel / document', 'iframe、端口、DOM canvas、资源 URL、DevtoolRuntimeClient'],
            ['内置组件', <><code>@tiny/host-web-components</code></>, 'DOM / CSS', 'tiny-* 宿主定义、共享 behaviors、base CSS；通过 builtinComponents 注入 render'],
            ['应用宿主', <><code>tests/host</code> · <code>apps/devtool</code></>, '静态资源服务器 / rspack', '选择 app、加载 manifest、提供 UI 或自动化钩子、调用 bootstrap'],
          ]}
        />
        <CodeBlock>{`app shell (host.ts / devtool React)
              |
              v
@tiny/host-browser                environment adapter
  createStandaloneDualThreadHost
  canvas-bridge / runtime-port
  DevtoolRuntimeClient

@tiny/host-web-components         built-in tag implementation
  webBuiltinComponents (definitions + base CSS)
              |
              v  createTinyRuntime
createTinyRuntime                 engine orchestration
              |
              v  boot*Thread(transport, manifest, canvas, ...)
service iframe / render iframe

A native host replaces the browser adapter, not the runtime semantics.`}</CodeBlock>
        <Callout title="standalone 不是唯一入口">
          <p>
            runtime 单测完全不使用 iframe：它用 <code>createInMemoryTransportPair()</code> 启动两个线程，再用
            <code>createTinyRuntime</code> 组装 host。宿主可替换性不是口号，而是现有测试已经在用的路径。
          </p>
        </Callout>
      </Section>

      <Section
        id="purity"
        kicker="Runtime purity"
        title="core 里没有浏览器"
        intro="这是宿主支持最重要的约束：core runtime 只定义语义，环境能力全部由宿主注入。"
      >
        <div className="split">
          <Card tag="check" title="pnpm check:runtime-purity">
            <p>脚本从 <code>packages/runtime/src/index.ts</code> 遍历相对 import，注释会被剥离，然后搜索宿主全局：</p>
            <CodeBlock>{`window · document · navigator
localStorage · sessionStorage
HTMLCanvasElement · HTMLImageElement · Image
requestAnimationFrame · cancelAnimationFrame
MessageChannel · postMessage · indexedDB
XMLHttpRequest · WebSocket · fetch · performance`}</CodeBlock>
            <p>同时禁止依赖图中出现包含 <code>browser</code> 的模块或 <code>@tiny/host-*</code> 导入。违规直接让闸门失败。</p>
          </Card>
          <div className="stack">
            <Card tag="core" title="packages/runtime">
              <p>导出 types、diagnostics、glass-easel-adapter、service、render、host。<code>canvas</code>、<code>resolveAssetUrl</code>、<code>backend</code>、<code>mountComponent</code>、<code>builtinComponents</code> 都是选项。</p>
            </Card>
            <Card tag="hosts/browser" tone="violet" title="@tiny/host-browser">
              <p>拥有 iframe、MessageChannel、DOM canvas、资源 URL 规则与 <code>DevtoolRuntimeClient</code>；tests/host 与 devtool 都从这里导入。</p>
            </Card>
            <Card tag="hosts/web-components" tone="violet" title="@tiny/host-web-components">
              <p>拥有 <code>tiny-*</code> 宿主定义、behaviors 与 base CSS；tests/host 与 devtool 在 render 入口注入 <code>webBuiltinComponents</code>。</p>
            </Card>
            <Card tag="result" title="可移植性">
              <p>原生宿主只需实现 Transport、backend、canvas 适配器、资源解析与宿主 API，不需要假装自己是浏览器。</p>
            </Card>
          </div>
        </div>
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
            title: 'bootstrap：service → render → page.ready',
            detail: 'service 返回 pageId/initialData/componentSchemas/pageComponents；render 注册样式与 schema、挂载并 settle 组件，返回 components；host 再把 components 并入 page.ready。',
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

// render 线程
bootRenderThread({
  transport, manifest,
  artifacts: { templates },
  backend, initialPath,
  loadStyle,
  resolveAssetUrl,
  canvas: { measure, paint },
  mountComponent, unmountComponent,
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
            [<code>manifest</code>, '页面路径、组件、样式、naming、诊断', '是'],
            [<code>initialPath</code>, '首屏页面 path', '是'],
            [<code>loadArtifacts</code>, '在 bootstrap 时 import service.js；保证 App/Page 已注册', '实际必需'],
            [<code>apiExtensions</code>, '注入设备事实与额外同步 API', '否'],
            [<code>canvas</code>, 'createLegacyCanvasContext / createCanvasNode', '使用 canvas API 时必需'],
            [<code>capabilities</code>, '握手元数据；当前未用于协商', '否'],
          ]}
        />
        <Table
          head={['RenderThreadOptions', '用途', '必需']}
          rows={[
            [<code>transport</code>, 'host 连接', '是'],
            [<code>manifest</code>, '页面、样式、组件 artifact、naming', '是'],
            [<code>artifacts.templates</code>, '从 render.js 导入的 groupList/content', '是'],
            [<code>backend</code>, 'glass-easel GeneralBackendContext', '是'],
            [<><code>initialPath</code> / <code>initialData</code></>, '首屏页面与数据；bootstrap 消息优先', 'initialPath 是'],
            [<code>loadStyle</code>, '按 outputPath 返回 CSS 文本', '实际必需'],
            [<code>resolveAssetUrl</code>, '把 app-root 资源路径映射为可加载 URL（模板 img / CSS url）', '使用本地资源时必需'],
            [<code>canvas</code>, 'measure / paint 适配器', '使用 canvas / SelectorQuery 时必需'],
            [<><code>mountComponent</code> / <code>unmountComponent</code></>, '把根组件挂到宿主节点', '否；缺省 pretendAttached'],
            [<code>onDiagnostic</code>, '本地诊断回调；跨线程仍走 bridge', '否'],
          ]}
        />
        <div className="split">
          <Card title="service 线程的额外要求">
            <ul>
              <li>先安装 App/Page/Component/Behavior/getApp 与 naming API 全局</li>
              <li>再 import service.js，让注册调用按 manifest 顺序发生</li>
              <li><code>loadArtifacts</code> 必须在 bootstrap 内 await</li>
              <li>canvas API 由注入的 adapter 提供，core 不碰 document</li>
            </ul>
          </Card>
          <Card title="render 线程的额外要求">
            <ul>
              <li>一个 glass-easel backend 实例</li>
              <li>模板 group 已从 render.js 取出</li>
              <li>样式文本已按 outputPath 预加载</li>
              <li>资源路径能映射到真实 URL，canvas 能测量与绘制</li>
              <li>挂载点有确定的容器</li>
            </ul>
          </Card>
        </div>
        <Callout title="manifest 以消息为准" >
          <p>
            render 的 bootstrap 处理器优先使用消息里的 <code>manifest</code>、<code>initialPath</code>、<code>initialData</code>、
            <code>componentSchemas</code> 与 <code>pageComponents</code>；线程选项只是宿主侧默认值和样式/模板/资源加载来源。
          </p>
        </Callout>
      </Section>

      <Section
        id="injections"
        kicker="Injections"
        title="四条宿主注入面"
        intro="跨线程 API、同步宿主事实、canvas 实现、资源 URL 各走各的缝，放错层就会出现“内核偷偷依赖浏览器”。"
      >
        <div className="split">
          <Card tag="host" title="apiHandlers：跨线程语义">
            <p>注册在 host 的 <code>HostApiRegistry</code>，通过 <code>api.*</code> call 被 service 调用。</p>
            <ul>
              <li><code>navigate.to</code> / <code>navigate.back</code>：host 同时编排 service 与 render</li>
              <li><code>storage.get/set</code>：宿主持久化</li>
              <li><code>toast.show</code>：宿主 UI（当前仅返回 errMsg）</li>
              <li><code>system.info</code>：系统信息快照</li>
              <li>任意自定义 handler，比如文件、网络、设备</li>
            </ul>
          </Card>
          <Card tag="service" tone="violet" title="apiExtensions：同步宿主事实">
            <p>直接合并进 service 的 API host，运行在 service 线程。</p>
            <ul>
              <li><code>getMenuButtonBoundingClientRect</code></li>
              <li><code>getPerformance</code>（now/mark/measure/observer）</li>
              <li>其他依赖设备或壳层的同步 API</li>
            </ul>
            <p>测试宿主和 devtool 各有一份实现；核心 runtime 不硬编码这些值。</p>
          </Card>
        </div>
        <div className="split">
          <Card tag="canvas" title="ServiceCanvasAdapter / RenderCanvasAdapter">
            <p>service 需要 <code>createLegacyCanvasContext</code> 与 <code>createCanvasNode</code>；render 需要 <code>measure</code> 与 <code>paint</code>。浏览器实现位于 <code>hosts/browser/src/canvas-bridge.ts</code>。</p>
          </Card>
          <Card tag="assets" title="resolveAssetUrl + backend + mount">
            <p><code>{'resolveAssetUrl(assetPath, { sourcePath })'}</code> 把 app-root 资源映射为 URL；adapter 用它重写模板 img 与 CSS <code>url()</code>。<code>backend</code> 与挂载钩子决定节点最终落在哪里。</p>
          </Card>
        </div>
        <Table
          head={['问题', '正确落点', '原因']}
          rows={[
            ['菜单按钮位置随设备变化', <code>apiExtensions</code>, 'service 同步调用，属于宿主事实'],
            ['页面跳转要同时改两个线程', <code>apiHandlers</code>, '只有 host 同时持有两侧连接'],
            ['storage 写入要持久化', <code>apiHandlers</code>, '宿主拥有真实存储'],
            ['canvas 绘制与测量', <>canvas adapters</>, 'core 不依赖 document / Image'],
            ['本地图片与 CSS 背景图', <code>resolveAssetUrl</code>, '只有宿主知道静态资源 URL 规则'],
            ['节点挂到哪里', <>backend + mountComponent</>, 'DOM / 原生树由宿主拥有'],
          ]}
        />
        <Callout title="AGENTS 里的硬规则">
          <p>
            Host facts 通过 <code>ServiceThreadOptions.apiExtensions</code> 注入，canvas 通过 <code>ServiceThreadOptions.canvas</code> /
            <code>RenderThreadOptions.canvas</code> 注入；不要把这些能力塞回 <code>packages/runtime</code>。
          </p>
        </Callout>
      </Section>

      <Section
        id="browser"
        kicker="Browser host"
        title="@tiny/host-browser 做了什么、没做什么"
        intro="它把 iframe 生命周期、端口转移、DOM canvas、资源 URL 和调试器客户端收拢在一个宿主包里。"
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
                <li>提供 canvas / asset / devtool client 适配器</li>
                <li>返回 host + 两个 iframe 句柄</li>
              </ul>
            </Card>
            <Card title="没做什么" tone="warn">
              <ul>
                <li>不加载 manifest 或产物</li>
                <li>不调用 bootstrap</li>
                <li>不提供业务 backend 或挂载点</li>
                <li>不注入 systemInfo/storage/apiExtensions</li>
                <li>不管理多应用、诊断或 UI</li>
                <li>不负责关闭时移除 iframe</li>
              </ul>
            </Card>
          </div>
          <div className="stack">
            <Card tag="tests/host" title="无 UI 单应用宿主">
              <p>三个 Vite 入口：<code>index.html</code> host、<code>service.html</code>、<code>render.html</code>。host 把页面挂到 <code>#app</code>，并暴露 <code>window.__tinyRuntime</code> 给 Playwright。</p>
              <p>service 入口注入 menu-button、performance 与 canvas；render 入口用 <code>CurrentWindowBackendContext</code>，提供 <code>resolveAssetUrl</code>、canvas 测量/绘制与挂载钩子。</p>
            </Card>
            <Card tag="static serving" title="产物如何到达线程">
              <p>manifest 由打包器静态导入；render.js 动态 import；styles 通过 <code>fetch('/generated/...')</code> 取文本后交给 <code>loadStyle</code>；资源通过 <code>/generated/&lt;path&gt;</code> 提供。</p>
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
        initialPath, loadStyle, resolveAssetUrl,
        canvas: { measure: measureBrowserCanvas,
                  paint: paintBrowserCanvasFrame },
        mountComponent, unmountComponent,
      })

service.html
  |-- installBrowserCanvasCompat()
  |-- listenForRuntimePort('service')
  +-- bootServiceThread({
        transport, manifest, initialPath,
        apiExtensions,
        canvas: { createLegacyCanvasContext, createCanvasNode },
        loadArtifacts: () => import(service.js),
      })`}</CodeBlock>
      </Section>

      <Section
        id="devtool"
        kicker="Debugger host"
        title="devtool 是 standalone 的受控封装 + 设备壳"
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
          <Card title="面板与宿主壳">
            <ul>
              <li><code>RuntimePanel</code>：加载 <code>./runtime/apps.json</code>，管理 launcher 与 3 个应用会话</li>
              <li><code>PreviewStage</code>：iPhone X 375×812 设备框、自动缩放、宿主导航栏</li>
              <li><code>DevtoolToolbar</code>：当前应用、页面栈与上限、导航、Reload/Close app</li>
              <li><code>DebugPanel</code>：Console 诊断 + Elements 元素树</li>
            </ul>
          </Card>
          <Card title="多应用与生命周期" tone="violet">
            <p>脚本扫描 <code>tests/apps/*</code>，把产物放在 <code>./runtime/apps/&lt;app&gt;/generated</code>，并生成 <code>apps.json</code>。列表页按需启动应用，最多保活最近 3 个；生命周期控制与 Reload 走各自 client。</p>
            <p>在线版本是同一份构建：<a href="#/devtool">#/devtool</a> 用同源 iframe 嵌入。</p>
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
          head={['宿主', '线程容器', 'backend', 'canvas / assets', '控制面']}
          rows={[
            ['tests/host', '两个 iframe（Vite）', 'CurrentWindowBackendContext', 'host-browser canvas + /generated 资源', 'URL ?path + window.__tinyRuntime'],
            ['apps/devtool', '两个 iframe（rspack）', 'CurrentWindowBackendContext', 'host-browser canvas + 相对 URL', 'DevtoolRuntimeClient + React/Redux'],
            ['runtime 单测', '同进程', 'EmptyBackendContext', '无 canvas / 内联 manifest', '直接持有 BridgeConnection'],
            ['原生宿主（未实现）', 'JSCore / 原生容器 + 渲染层', '需实现 GeneralBackendContext', '需实现 canvas adapters + 资源解析', '自定义控制面'],
          ]}
        />
        <div className="split">
          <Card title="共享的部分">
            <ul>
              <li>manifest + naming 契约</li>
              <li>BridgeConnection 与消息目录</li>
              <li>service/render 启动选项</li>
              <li>bootstrap 顺序与 page.ready</li>
              <li>HostApiRegistry 的默认语义</li>
            </ul>
          </Card>
          <Card title="不共享的部分">
            <ul>
              <li>Transport 与线程容器</li>
              <li>backend 与挂载方式</li>
              <li>canvas 实现</li>
              <li>样式/模板/资源加载策略</li>
              <li>控制面与 UI</li>
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
            detail: '读取 schemaVersion=1、naming 与 artifact 路径。不要复制产物类型。',
          },
          {
            title: '创建两条 Transport',
            detail: 'service 与 render 各一条；帧边界、非空 messages、JSON-safe 由 bridge 兜底，但传输必须保序。',
          },
          {
            title: '实现环境适配器',
            detail: 'glass-easel backend、mount/unmount、styles 与 templates 加载、resolveAssetUrl、canvas measure/paint。',
          },
          {
            title: '启动两个线程并等待安装',
            detail: 'service 安装 naming 全局并 loadArtifacts；在 transport 接收端就绪后再握手，用 ready/同步点避免丢帧。',
          },
          {
            title: '提供宿主事实',
            detail: 'systemInfo、storage 初始快照；设备相关同步 API 走 apiExtensions，网络/文件等跨线程 API 走 apiHandlers。',
          },
          {
            title: '实现导航与 page.ready',
            detail: 'navigate.to/back 必须在 host 侧先 service 后 render；navigateTo 要把 render 返回的 components 并入 page.ready。',
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
          {
            title: '跑 runtime 纯度检查',
            detail: '确认新宿主没有把浏览器/平台依赖反向塞回 packages/runtime。',
            code: 'pnpm check:runtime-purity',
          },
        ]} />
        <Callout title="原生宿主尚未实现" tone="warn">
          <p>
            当前没有 native transport、native backend 或非浏览器 service 运行时。好消息是 core 已经移除了 document/Image/iframe，
            原生宿主只需提供 canvas 适配器、backend、资源解析与控制面，不必模拟浏览器。
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
          <Card tag="back" tone="warn" title="navigateBack 不补 page.ready">
            <p>navigateTo 会把 render components 并入 page.ready；navigateBack 只恢复页面 onShow，目前不会把 render 返回的 components 回传给 service。</p>
          </Card>
          <Card tag="capabilities" tone="warn" title="没有能力协商">
            <p>握手携带 capabilities，但 host 没有注入，也没有降级逻辑。不同宿主的能力差异只能靠代码分支和诊断。</p>
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
