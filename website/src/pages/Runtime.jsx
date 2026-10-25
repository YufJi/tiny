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

export default function Runtime() {
  return (
    <>
      <PageHero
        eyebrow="Runtime core"
        title={<>宿主无关的内核，<br /><span className="gradient">两个线程的应用</span></>}
        lede="packages/runtime 不引用 window、document 或 iframe。service 线程拥有 App/Page/Component、页面栈、setData、naming、behaviors/observers/relations 与逻辑组件树；render 线程拥有 glass-easel 组件定义、样式隔离、事件和 DOM。canvas、资源 URL 与 backend 都由宿主注入。"
        stats={[['2', 'threads'], ['18', 'built-in tags'], ['5', 'component lifetimes'], ['7', 'bridge domains']]}
        pills={[['host-independent', 'good'], ['behaviors / relations', 'good'], ['style isolation', 'good'], ['canvas injected', 'good']]}
      />
      <PageNav items={[
        ['overview', '全景'],
        ['service', 'service 线程'],
        ['naming', '命名'],
        ['data', 'setData / observers'],
        ['events', '事件'],
        ['components', '组件语义'],
        ['render', 'render adapter'],
        ['builtins', '内置组件'],
        ['styles', '样式隔离'],
        ['canvas', 'Canvas / Animation'],
        ['limits', '限制'],
      ]} />

      <Section
        id="overview"
        kicker="Overview"
        title="一个应用，两个运行时"
        intro="两个线程各自执行，只有宿主同时持有两侧连接；业务状态在 service，组件树与 DOM 在 render。"
      >
        <CodeBlock>{`service iframe                                  render iframe
+------------------------------+                +------------------------------+
| bootServiceThread            |                | bootRenderThread             |
| host-independent             |                | glass-easel adapter          |
| pageStack / page data        |   messages     | ComponentSpace / DOM         |
| naming / behaviors / tree    | <------------> | styles / events / slots      |
| canvas: injected adapter     |   via host     | canvas: injected adapter     |
+------------------------------+                +------------------------------+
             ^                                               ^
             +------------- BridgeConnection ---------------+
                          (host relays)`}</CodeBlock>
        <div className="split">
          <Card tag="service" title="应用语义与逻辑状态">
            <p>拥有页面栈、当前页、页面/组件 data、命名空间、归一化组件定义、逻辑组件树、relations 与 API host。所有业务状态都在这里。</p>
          </Card>
          <Card tag="render" tone="violet" title="组件框架与 DOM">
            <p>拥有 glass-easel 组件定义、模板实例、样式作用域与隔离、DOM 节点、事件派发和元素树。它不知道页面栈，也不读取 URL。</p>
          </Card>
        </div>
        <Callout title="内核不拥有环境">
          <p>
            service 需要 canvas 时调用注入的 <code>ServiceCanvasAdapter</code>；render 测量/绘制 canvas 时调用注入的 <code>RenderCanvasAdapter</code>；
            图片与 CSS 资源由 <code>resolveAssetUrl</code> 映射；DOM 挂载由 <code>mountComponent</code> 完成。<code>pnpm check:runtime-purity</code> 保证这条规则不被破坏。
          </p>
        </Callout>
      </Section>

      <Section
        id="service"
        kicker="Service thread"
        title="注册、命名、页面栈"
        intro="service 线程是“小程序应用”真正存在的地方。它由 bootServiceThread 一次性装配。"
      >
        <Sequence steps={[
          {
            title: '按 manifest.naming 安装全局',
            detail: '写入 App / Page / Component / Behavior、getApp、getCurrentPages；API 对象安装到 naming.api，并额外挂载 apiAliases。未实现的 API 返回 undefined 并产生 UNSUPPORTED_API 警告。',
            code: 'installMiniProgramGlobals(registry, apiHost)',
          },
          {
            title: '启动时注册 App',
            detail: 'service.js 被 import 时执行 App(...)，registerApp 立即调用 onLaunch 和 onShow。此时页面尚未创建。',
            code: 'registerApp(options)',
          },
          {
            title: '归一化 Page / Component 定义',
            detail: 'Page() 按游标绑定到 manifest 中的页面路径；Component() 额外执行 normalizeComponentDefinition，合并 behaviors、observers、relations、options、externalClasses。',
            code: 'registerComponent(options)',
          },
          {
            title: 'bootstrap 创建首屏',
            detail: '等待 loadArtifacts，写入 systemInfo/storage，构建组件 schema，创建页面并触发 onLoad/onShow；返回 pageComponents 供 render 注册组件型页面。',
            code: "control('runtime', 'bootstrap')",
          },
          {
            title: 'page.ready 建立逻辑组件树',
            detail: 'render settle 后把组件快照发给 service；service 创建组件实例、加入 ComponentTree，并触发 onReady。此时 selectComponent / relations 已经可用。',
            code: "control('page', 'ready', { components })",
          },
        ]} />

        <Table
          head={['控制', 'service 行为', 'render 行为']}
          rows={[
            [<code>page.navigateTo</code>, '当前页 onHide；解析 url/query；创建 pageId；新页 onLoad → onShow；组件型页面 created/attached/ready', '卸载 previousPageId；按新 path + initialData 挂载并 settle 组件'],
            [<code>page.navigateBack</code>, 'splice(delta)；倒序 onHide → onUnload；卸载组件树与 relations；恢复页 onShow', '卸载 unloadedPageIds；用 service 返回的 data 重新挂载恢复页'],
            [<code>page.hide</code>, '当前页 onHide；App.onHide；所有页面/组件 pageLifetime hide', '无消息；组件树仍在'],
            [<code>page.show</code>, 'App.onShow；当前页 onShow；所有页面/组件 pageLifetime show', '无消息'],
            [<code>page.unload</code>, 'onUnload；组件型页面 detached；移除 ComponentTree / relations / 组件实例', '无消息'],
          ]}
        />
        <div className="split">
          <Card title="页面实例与组件型页面">
            <p>普通页面保留 <code>pageId</code>、path、query、data、methods 与 lifecycle 轨迹。组件型页面（<code>bodyType=component</code>）改用归一化组件定义：URL query 会按 property 类型强制转换，并执行 created/attached/ready/detached。</p>
            <p>页面根节点也会进入逻辑树（<code>page:&lt;pageId&gt;</code>），所以 relations 与 selectComponent 能识别页面边界。</p>
          </Card>
          <Card title="Taro 兼容仍然保留">
            <p>普通页面会把顶层函数（包括生命周期）绑定到实例，兼容 Taro 读取 <code>this.onReady.called</code> 的写法；组件型页面走标准 Component 定义。</p>
            <p>这是兼容路径，不是所有微信页面语义的完整还原。</p>
          </Card>
        </div>

        <Callout title="返回不是 DOM 回放" tone="warn">
          <p>
            service 保留页面 <code>data</code>，但 render 在 <code>navigateTo</code> 时卸载旧页、在 <code>navigateBack</code> 时重新挂载。
            返回后 DOM 与滚动位置会重建，只有页面 data、组件逻辑状态和 relations 被恢复。
          </p>
        </Callout>
      </Section>

      <Section
        id="naming"
        kicker="Naming"
        title="wx 不是写死的"
        intro="naming 从 tiny.config.json 进入 manifest，再由 service 与 adapter 派生所有引擎自有名称。"
      >
        <div className="split">
          <CodeBlock>{`// tiny.config.json
{
  "naming": {
    "prefix": "tiny-",
    "apiAliases": ["wx"]
  }
}

// manifest.naming（解析后）
{
  "prefix": "tiny-",
  "directive": "tiny",
  "api": "tiny",
  "apiAliases": ["wx"],
  "hostAttribute": "tiny-host",
  "tagClassPrefix": "tiny-tag-",
  "behaviorPrefix": "tiny-",
  "behaviorScheme": "tiny://"
}`}</CodeBlock>
          <div className="stack">
            <Card tag="runtime" title="service 侧">
              <p><code>namingFromManifest()</code> 决定安装哪个 API 全局、哪些别名、diagnostic 里写什么名字，以及 <code>wx://component-export</code> 对应哪个 behavior id。</p>
              <p>默认 <code>wx</code>；切到 <code>tiny</code> 时旧第三方库仍可通过 <code>apiAliases: ["wx"]</code> 使用。</p>
            </Card>
            <Card tag="render" title="adapter 侧">
              <p>adapter 用 <code>behaviorPrefix</code> 注册内置组件 behaviors，用 <code>hostAttribute</code> 标记组件 host，用 <code>tagClassPrefix</code> 处理 tag 选择器。</p>
              <p>内置组件 tag 本身（<code>view</code>、<code>button</code>）不跟随 prefix。</p>
            </Card>
          </div>
        </div>
        <Table
          head={['表面', 'wx-（默认）', 'tiny-', '生效位置']}
          rows={[
            ['模板指令', <code>wx:if</code>, <code>tiny:if</code>, 'TmplGroup directivePrefix'],
            ['API 全局', <code>wx.getStorageSync()</code>, <><code>tiny.getStorageSync()</code>（可保留 <code>wx</code> alias）</>, 'installMiniProgramGlobals'],
            ['内置 behavior', <><code>wx-base</code> / <code>wx-hover</code></>, <><code>tiny-base</code> / <code>tiny-hover</code></>, 'createBuiltinBehaviors'],
            ['component-export', <code>wx://component-export</code>, <code>tiny://component-export</code>, 'component-definition'],
            ['组件 host', <code>wx-host</code>, <code>tiny-host</code>, 'adapter / stylesheet compiler'],
            ['tag marker', <code>wx-tag-button</code>, <code>tiny-tag-button</code>, 'template 注入 / WXSS'],
          ]}
        />
        <Callout title="命名不是字符串替换">
          <p>
            它同时影响编译器输出、manifest 契约、service 全局安装、内置组件 behavior id、host attribute 与样式选择器。
            <a href="#/compiler">编译页的命名契约</a>列出了完整链路。
          </p>
        </Callout>
      </Section>

      <Section
        id="data"
        kicker="Data flow"
        title="setData 与跨线程观察者"
        intro="service 先改自己的 data，再把 patch 发给 render；render 的组件 data/observer 变化也会回流 service，保证逻辑实例与渲染实例一致。"
      >
        <Sequence steps={[
          {
            title: '克隆 JSON-safe 补丁',
            detail: '页面/组件 setData 先 cloneJsonSafe，再按 a.b、list[0] 等路径写入本地 data。',
            code: 'cloneJsonSafe(patch) · applyDataPatch(data, patch)',
          },
          {
            title: '本地 observers 立即运行',
            detail: 'service 侧组件定义带有 observers 与 property observer。setData 后按变更路径匹配 observer，property observer 额外收到旧值。',
            code: 'runObservers(instance, observers, changedPaths, oldData)',
          },
          {
            title: '发送 data.setData',
            detail: '页面带 pageId；组件带 componentId。bridge 把同一 source + pageId 的事件放进批次，在下一个 microtask 发出。',
            code: "sendEvent('data', 'setData', { componentId, patch })",
          },
          {
            title: 'render 应用补丁',
            detail: 'render 找到页面/组件实例并 setData；adapter 用 begin/endServicePatch 标记这次变更来自 service，避免 observer 重复执行。',
            code: 'adapter.beginServicePatch(component) → component.setData(patch)',
          },
          {
            title: 'render 侧变化回流',
            detail: '组件 data 的任意变化触发 runtime.componentData；schema 中声明的 observer 额外触发 runtime.componentObserved。service 同步 data，并按需用旧值执行 observer。',
            code: "runtime.componentData / runtime.componentObserved",
          },
        ]} />
        <div className="split">
          <div>
            <CodeBlock>{`Component({
  properties: {
    value: { type: String, value: '', observer: 'onValue' },
  },
  observers: {
    value(value) { this.setData({ derived: value.toUpperCase() }) },
    'a, b'(a, b) { this.setData({ sum: a + b }) },
    '**'(data) { /* 任意变化 */ },
  },
  methods: {
    onValue(value, oldValue) {
      this.setData({ changed: value !== oldValue })
    },
  },
})`}</CodeBlock>
          </div>
          <div className="stack">
            <Card title="没有 diff，也没有 ack">
              <p>每次 setData 都生成一个 patch 事件；bridge 只做帧批处理，不做字段合并。service 不等待 render 确认。</p>
            </Card>
            <Card title="observer 只在 service 执行">
              <p>render 负责发现变化并上报 <code>componentObserved</code>，真正的 observer 逻辑在 service 执行。property observer 的参数是 <code>(newValue, oldValue)</code>。</p>
            </Card>
            <Card title="递归与失败可见" tone="warn">
              <p>observer 递归深度上限 20，超过产生 <code>OBSERVER_RECURSION_LIMIT</code>；observer 抛错产生 <code>OBSERVER_ERROR</code>，不会击穿线程。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="events"
        kicker="Events"
        title="两条事件通路，一次往返"
        intro="render 侧事件先序列化，再到 service 调处理函数；service 侧 triggerEvent 反过来走 render。"
      >
        <Sequence steps={[
          {
            title: 'glass-easel 捕获/冒泡',
            detail: '模板里的 bind/catch 被编译成监听器；glass-easel 完成 capture、target、bubble 三个阶段，处理 shadow/slot 边界。',
            code: 'methodCaller → event listener',
          },
          {
            title: 'adapter 序列化事件',
            detail: '提取 type、detail、timeStamp、bubbles、composed、capture、stopped，以及 target/currentTarget 的 id、tag、dataset、class、style。',
            code: 'serializeEvent(handler, event)',
          },
          {
            title: '发送 event.dispatch',
            detail: '自定义组件事件额外带 componentId、componentPath 和当前 componentData，确保 service 侧组件实例能同步。',
            code: "sendEvent('event', 'dispatch')",
          },
          {
            title: 'service 找到接收者',
            detail: '有 pageId 用页面实例；有 componentId 则先 ensureComponentInstance、同步 data，再调用方法。',
            code: 'page.invokeMethod(handler, [event])',
          },
          {
            title: '异常变成诊断',
            detail: '处理函数抛错不会击穿线程，而是发送 EVENT_HANDLER_ERROR，带 handler、eventType 与 pageId。',
            code: "sendDiagnostic('error', { code: 'EVENT_HANDLER_ERROR' })",
          },
        ]} />
        <div className="split">
          <div className="stack">
            <Card tag="event object" title="service 侧收到什么">
              <CodeBlock>{`{
  handler: 'onTap',
  type: 'tap',
  timeStamp: 1710000000000,
  detail: { ... },
  bubbles: true,
  composed: true,
  capture: false,
  stopped: false,
  target: { id, tag, dataset, class, style },
  currentTarget: { id, tag, dataset, class, style },
  componentId?: 'component-1',
  componentPath?: 'components/card/card',
  componentData?: { ... }
}`}</CodeBlock>
            </Card>
            <Callout title="handler 缺失也会诊断">
              <p><code>EVENT_HANDLER_MISSING</code> 与 <code>EVENT_PAGE_NOT_FOUND</code> 都是 warning，不会中断其他事件。</p>
            </Callout>
          </div>
          <div className="stack">
            <Card tag="service → render" title="组件 triggerEvent 的回路">
              <p>service 侧组件实例调用 <code>triggerEvent(name, detail)</code>，bridge 发 <code>event.trigger</code> 到 render，render 调用 glass-easel 组件的 <code>triggerEvent</code>。</p>
              <p>如果父级监听器在 render 侧再次触发 <code>event.dispatch</code>，就形成一次完整往返。</p>
            </Card>
            <Card tag="native events" title="内置组件归一化">
              <p>button 把原生 tap 转成小程序 tap，并处理 formType/openType；input 处理 input/change/focus/blur/keydown/confirm/composition/selectionchange；scroll-view 处理 scroll/refresher/drag；canvas 转发 touch。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="components"
        kicker="Component semantics"
        title="Behavior、observer、relation、tree"
        intro="组件不再是“两份 data 的镜像”：service 侧有完整的归一化定义、逻辑组件树与关系图。"
      >
        <Table
          head={['能力', '实现', '关键语义']}
          rows={[
            ['Behavior', <code>normalizeComponentDefinition</code>, '嵌套 behaviors 去重、循环检测；执行顺序为被引用 behavior → 引用者 → 组件；组件覆盖 properties/methods/data'],
            ['component-export', <><code>wx://component-export</code> behavior + export()</>, 'selectComponent 返回 export() 结果而不是实例'],
            ['observers', <><code>observers</code> / property observer</>, '支持对象/数组写法、逗号多路径、** 与 .** 通配；property observer 收到旧值；递归上限 20'],
            ['relations', <><code>RelationManager</code> + <code>ComponentTree</code></>, 'parent / child / ancestor / descendant；双方声明才建立；linked / unlinked / linkChanged / linkFailed'],
            ['选择器', <><code>selectComponent</code> / <code>selectAllComponents</code> / <code>selectOwnerComponent</code></>, '默认不穿透组件边界；>>> 显式穿透；返回 tree order'],
            ['组件型页面', <><code>MiniProgramPageInstance</code> + normalized definition</>, 'query 按 property 类型转换；created/attached/ready/detached；页面根也进入逻辑树'],
          ]}
        />
        <div className="split">
          <div className="stack">
            <Card tag="behaviors" title="合并与执行顺序">
              <p>每个 behavior 的 properties/data/methods/lifetimes/pageLifetimes/observers/relations/externalClasses/options 会被收集；重复引用只执行一次。</p>
              <p>内置 behavior id（默认 <code>wx://...</code>）目前只支持 <code>component-export</code>；其他会产生 <code>UNSUPPORTED_BEHAVIOR</code>。definitionFilter 尚未实现。</p>
            </Card>
            <Card tag="relations" title="双向声明才连边">
              <p>父组件声明 <code>child</code>，子组件必须声明对应的 <code>parent</code>；祖先/后代同理。只声明一侧不会建立关系。</p>
              <p>attached 时触发 linked，detached 时 unlinked，移动时 linkChanged；父/祖先找不到目标时触发 linkFailed。</p>
            </Card>
          </div>
          <div className="stack">
            <Card tag="tree" title="逻辑树在 service，真实树在 render">
              <p>service 的 ComponentTree 记录 pageId、path、tag、id、class、parent 与顺序；render 的 glass-easel 树才是 DOM 来源。</p>
              <p>两者通过 componentLifecycle 的 parentComponentId/tag/id/class 对齐，page.ready 的 snapshots 做首屏补全。</p>
            </Card>
            <Card tag="pageLifetimes" tone="warn" title="按实例分发">
              <p>page.show/hide 现在遍历全部 service 组件实例，逐个调用 pageLifetimes；render 发来的 <code>componentPageLifetime</code> 仍被忽略，避免重复。</p>
              <p>generics、placeholder、definitionFilter 仍未实现。</p>
            </Card>
            <Card tag="style" title="组件 options 也进入 schema">
              <p><code>multipleSlots</code>、<code>virtualHost</code>、<code>styleIsolation</code>、<code>addGlobalClass</code>、<code>externalClasses</code> 会随 componentSchemas 下发，render 用它们注册定义。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="render"
        kicker="Render adapter"
        title="把产物装配成 glass-easel 组件"
        intro="GlassEaselRuntimeAdapter 是 runtime 内部唯一直接依赖 glass-easel 的地方。"
      >
        <Cards>
          <Card tag="space" title="ComponentSpace + StyleScopeManager">
            <p>每个 render 线程一个 ComponentSpace 和一个 StyleScopeManager；所有页面、组件、内置组件都注册在这里。</p>
          </Card>
          <Card tag="definition" title="定义与隔离">
            <p>页面与组件使用 <code>defineWithMethodCaller(path)</code>。组件 options 写入 multipleSlots、virtualHost、styleScope、extraStyleScope 与 isolation。</p>
          </Card>
          <Card tag="caller" title="事件方法代理">
            <p><code>useMethodCallerListeners</code> 打开后，glass-easel 把模板事件交给 Proxy；核心方法（setData、selectComponent 等）透传，其余变成 service dispatcher。</p>
          </Card>
          <Card tag="assets" title="资源与宿主">
            <p><code>resolveAssetUrl</code> 在模板 img/src 与 CSS url() 注册时调用；<code>canvas.measure</code> / <code>paint</code> 由宿主提供，adapter 不碰 DOM。</p>
          </Card>
        </Cards>
        <div className="split">
          <div className="stack">
            <Card title="bootstrap 的顺序">
              <ol style={{ margin: '8px 0 0', paddingLeft: 18, color: 'var(--muted)', fontSize: 14 }}>
                <li><code>registerStyles</code>：base CSS → manifest styles</li>
                <li><code>setPageComponentOptions</code>：组件型页面的 isolation/options</li>
                <li><code>registerComponentSchemas</code>：定义组件与 observers</li>
                <li><code>mountPage</code>：挂载页面并 settle 组件树</li>
              </ol>
              <p style={{ marginTop: 10 }}>顺序反了，组件定义会拿不到 style scope id。</p>
            </Card>
            <Card title="settle 与 page.ready">
              <p><code>whenRendered()</code> 等 backend 完成一次渲染；如果页面声明了 usingComponents，再等待组件数量稳定，生成 snapshots 返回给 host。host 把它们并入 <code>page.ready</code>。</p>
            </Card>
          </div>
          <Card tag="inspect" title="元素树导出">
            <p>如果 backend 返回 DOM，按 DOM 序列化；否则退回 glass-easel 逻辑树（shadowRoot/childNodes）。</p>
            <ul>
              <li>最多 2000 个节点</li>
              <li>最大深度 60</li>
              <li>文本截断 200 字符</li>
              <li>组件节点用 <code>naming.hostAttribute</code>（默认 <code>wx-host</code>）标记</li>
            </ul>
          </Card>
        </div>
        <Callout title="render 侧没有业务路由">
          <p>
            render 只响应 <code>runtime.bootstrap</code>、<code>page.navigateTo</code>、<code>page.navigateBack</code>、
            <code>runtime.inspectTree</code> 与 data/event/canvas 消息。它不知道“当前是第几个页面”，也不知道 tabBar。
          </p>
        </Callout>
      </Section>

      <Section
        id="builtins"
        kicker="Built-ins"
        title="18 个组件，接近 WebView 的表面"
        intro="内置组件模板在构建期生成 ProcGen，样式按组件拆分后再合成 19 份 stylesheet；每个组件共享同一组 behaviors。"
      >
        <Cards className="three">
          <Card tag="AOT" title="模板与样式">
            <p><code>build-templates.mjs</code> 把 18 个 <code>template.wxml</code> 编成一个模板 group；<code>build-styles.mjs</code> 合成 base + 18 个组件样式。</p>
            <p>生成物在 <code>packages/components/src/generated</code>，不入库。</p>
          </Card>
          <Card tag="behaviors" title="共享 behaviors">
            <p><code>wx-base</code>、<code>wx-hover</code>、<code>wx-label-target</code>、<code>wx-disabled</code>、<code>wx-data-component</code>、<code>wx-group</code>、<code>wx-item</code>、<code>wx-size-normalizer</code>、<code>wx-class-prefix</code>。</p>
            <p>id 前缀跟随 naming。</p>
          </Card>
          <Card tag="always-on" title="无需 usingComponents">
            <p>built-in 组件始终挂在每个页面/组件的 <code>usingComponents</code> 上；即使页面没有声明任何自定义组件也能使用。</p>
            <p>自定义组件同名时会被页面声明覆盖。</p>
          </Card>
        </Cards>
        <Table
          head={['组件', '当前表面', '实现方式']}
          rows={[
            ['view / text / label', 'hover、inline、selectable、decode、space、aria；label for', '真实 tiny-* 宿主 + slot；hover 走宿主 touchstart 监听'],
            ['button', 'type/size/plain/loading/disabled、formType submit/reset、openType 事件映射、hover 时序、aria', '真实 tiny-button 宿主 + 宿主 tap；form/hover behaviors；openType 未支持时发 error 事件'],
            ['input', 'value/type/password/maxlength/focus/confirm/cursor/selection/adjustPosition；input/change/focus/blur/keydown/confirm/composition/selectionchange', '原生 input + dataComponent/classPrefix behaviors'],
            ['checkbox / radio / switch', 'checked/disabled/value/color；change/checkboxstate；group change', '自定义 22×22 / 52×32 结构 + 隐藏原生 input；dataComponent/group/item behaviors'],
            ['slider', 'value/min/max/step/disabled/colors/blockSize；changing/change', '自定义 track/thumb + 透明 range 交互层；数值归一化'],
            ['scroll-view', 'scrollX/Y、scrollTop/Left、scrollIntoView、refresher、drag/scroll 事件', 'CSS overflow + touch/scroll handlers'],
            ['swiper / swiper-item', 'current/currentItemId/indicator/autoplay/circular/vertical；change/transition/animationfinish', 'CSS transform + backend query / touch handlers'],
            ['progress / icon / image', 'percent/showInfo/active/activeMode/colors、type/size/color、src/mode/webp/background', '模板 + observers；icon 内嵌 WeUI 字体 + 15 type 伪元素；image 转发 load/error'],
            ['canvas', 'canvas-id/type/disableScroll；touchstart/move/end/cancel/longtap/error', 'surface 组件；绘制由宿主 canvas 适配器完成'],
          ]}
        />
        <Callout title="仍然不是完整组件库" tone="warn">
          <p>
            textarea、picker、form、navigator、video、rich-text、map、movable-view 等尚未实现；已有组件的 open-type、表单提交、
            无障碍和 Skyline 语义也不完整。
          </p>
        </Callout>
      </Section>

      <Section
        id="styles"
        kicker="Styles"
        title="作用域之外，还有 styleIsolation"
        intro="编译期生成 class/tag scope；render 期再按 page/component 的 isolation 组合样式。"
      >
        <Table
          head={['选项', '生效范围', '行为']}
          rows={[
            ['页面 isolation', '页面根 + 子组件', '默认 shared；显式 isolated/apply-shared/shared 或 styleIsolation 配置优先'],
            ['组件 isolated', '组件自身', '默认；不接收页面样式'],
            ['apply-shared', '组件自身', '页面样式可影响组件；组件样式不反向影响页面'],
            ['shared', '组件自身 + 页面', '组件的 WXSS 以页面 scope 重新注册一份，页面可使用组件样式'],
            ['addGlobalClass', '组件自身', '等价 apply-shared；可由 JSON/options 设置'],
            ['externalClasses', '组件根节点', '把外部 class 透传到组件内部元素'],
          ]}
        />
        <div className="split">
          <Card title="注册顺序">
            <ul>
              <li>base styles 以 global scope 注册</li>
              <li>manifest.styles 逐份注册，scope 来自 style.scope</li>
              <li>共享组件样式按 page scope 重新写入</li>
              <li>最后注册页面/组件定义</li>
            </ul>
          </Card>
          <Card title="命名与低优先级">
            <p>tag marker 与 <code>hostAttribute</code> 跟随 naming；<code>page</code> 根不做 marker。CLI 仍会写 <code>*.low.css</code>，但当前没有启用 <code>convertHost</code>，runtime 也只加载普通 CSS。</p>
            <p><code>:host</code> 组合与优先级矩阵仍未系统化。</p>
          </Card>
        </div>
        <Callout title="app.wxss 是全局的" >
          <p>app.wxss 不带 scope，作为 globalScope 注册。页面的 styleIsolation 只决定组件是否接收页面样式，不会把 app.wxss 变成组件局部样式。</p>
        </Callout>
      </Section>

      <Section
        id="canvas"
        kicker="Canvas & Animation"
        title="宿主提供画布，内核只定义协议"
        intro="canvas 已从 core runtime 移出：service/render 只接收适配器，浏览器实现位于 hosts/browser。"
      >
        <div className="split">
          <div className="stack">
            <Card tag="service adapter" title="离屏绘制">
              <p><code>ServiceCanvasAdapter.createLegacyCanvasContext</code> 提供旧版 canvas API；<code>createCanvasNode</code> 为 SelectorQuery 构造节点。</p>
              <p>浏览器实现用隐藏 canvas + 2D context，50ms 节流 <code>toDataURL('image/png')</code>，通过 <code>canvas.frame</code> 发送。</p>
            </Card>
            <Card tag="render adapter" title="测量与绘制">
              <p><code>RenderCanvasAdapter.measure(selector)</code> 返回宽高；<code>paint(frame)</code> 把 PNG 绘制到可见 <code>canvas[canvas-id]</code>。</p>
              <p>core 中不再出现 <code>document</code> / <code>Image</code>。</p>
            </Card>
          </div>
          <div className="stack">
            <Card tag="selector query" title="跨线程测量">
              <p><code>createSelectorQuery</code> 仍不是通用 DOM 查询：它把 selector 发到 render 做测量，返回宽高与 canvas 节点；每次创建 query 会记 <code>CANVAS_OFFSCREEN</code> info。</p>
            </Card>
            <Card tag="animation" title="最终态 CSS">
              <p><code>wx.createAnimation</code> 仍是链式 CSS transform/transition 生成器；编译期把 <code>animation</code> 属性改写为内联 style。</p>
              <p>多 step 时序、事件回调与 rAF 没有还原。</p>
            </Card>
            <Card tag="compat" tone="warn" title="浏览器 canvas 兼容">
              <p><code>installBrowserCanvasCompat()</code> 在 host-browser 中给 <code>Object.prototype</code> 补 inert 的 add/removeEventListener，避免 ECharts 把普通包装对象误判为 DOM。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="limits"
        kicker="Limits"
        title="当前内核的硬边界"
        intro="组件语义和宿主抽象已经补上，但下面这些仍是明确缺口。"
      >
        <Cards>
          <Card tag="components" tone="warn" title="generics / placeholder / definitionFilter">
            <p>组件泛型、占位组件、definitionFilter、完整内置 behavior 仍未实现；unsupported 项会转成诊断，而不是静默忽略。</p>
          </Card>
          <Card tag="pages" tone="warn" title="页面能力有限">
            <p>无 tabBar、下拉刷新、触底、页面滚动事件、分享、页面栈恢复；子包只是路径，没有按需加载。</p>
          </Card>
          <Card tag="api" tone="warn" title="API 面很窄">
            <p>storage、导航、system、toast、animation、canvas、selector query；无 request、媒体、文件、账号、位置、WebSocket。</p>
          </Card>
          <Card tag="render" tone="warn" title="返回会重挂 DOM">
            <p>navigateTo 卸载旧页，navigateBack 用 service 的 data 重新挂载；滚动位置、焦点、非 data 的内部状态会丢失。navigateBack 目前也不会把 render components 回传为 page.ready。</p>
          </Card>
          <Card tag="canvas" tone="warn" title="离屏镜像不是交互 canvas">
            <p>没有 canvas rAF、完整 2D API、原生触摸到 service 的完整链路；内置 canvas 的 touch 事件目前主要面向组件层。</p>
          </Card>
          <Card tag="host" tone="warn" title="浏览器外仍无宿主">
            <p>runtime 已无浏览器全局，但还没有 native transport/backend；service 的 canvas 适配器也要由原生宿主提供。</p>
          </Card>
        </Cards>
        <Callout title="下一步">
          <p>
            这些边界如何被宿主放大或缓解，见 <a href="#/hosts">宿主支持</a>；证据与验收覆盖见 <a href="#/testing">验证体系</a>。
          </p>
        </Callout>
      </Section>
    </>
  )
}
