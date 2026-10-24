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
        title={<>service 拥有状态，<br /><span className="gradient">render 拥有组件树</span></>}
        lede="Tiny 的 runtime 是 glass-easel 之上的一层应用语义：service 线程负责 App/Page/Component、路由、setData 与 wx API；render 线程负责组件定义、模板、事件和 DOM；adapter 把两侧的组件实例与生命周期对齐。"
        stats={[['2', 'threads'], ['18', 'built-in tags'], ['5', 'component lifetimes'], ['7', 'bridge domains']]}
      />
      <PageNav items={[
        ['overview', '全景'],
        ['service', 'service 线程'],
        ['data', 'setData'],
        ['events', '事件'],
        ['components', '组件模型'],
        ['render', 'render adapter'],
        ['builtins', '内置组件'],
        ['styles', '样式'],
        ['canvas', 'Canvas / Animation'],
        ['diagnostics', '诊断'],
        ['limits', '限制'],
      ]} />

      <Section
        id="overview"
        kicker="Overview"
        title="两个运行时，一个应用"
        intro="两个线程各自执行，只有宿主同时持有两侧连接；页面数据和组件树通过消息保持同步。"
      >
        <CodeBlock>{`service iframe                          render iframe
+--------------------------+            +--------------------------+
| bootServiceThread        |            | bootRenderThread         |
|                          |            |                          |
| App / Page / Component   |            | ComponentSpace           |
| pageStack / pageId       |  messages  | glass-easel component    |
| data + setData(path)     | <--------> | tree + DOM               |
| wx API host / storage    |  via host  | styles / events / slots  |
| canvas offscreen         |            | canvas frames / inspect  |
+--------------------------+            +--------------------------+
           ^                                         ^
           +------------ BridgeConnection -----------+
                       (host relays)`}</CodeBlock>
        <div className="split">
          <Card tag="service" title="应用生命周期与平台语义">
            <p>拥有页面栈、当前页、页面/组件 data、注册表、API host、canvas 绘制上下文。所有业务状态都在这里。</p>
          </Card>
          <Card tag="render" tone="violet" title="组件框架与后端">
            <p>拥有 glass-easel 组件定义、模板实例、样式作用域、DOM 节点、事件派发和元素树。它不知道页面栈。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="service"
        kicker="Service thread"
        title="注册表、页面栈与 wx 语义"
        intro="service 线程是“小程序应用”真正存在的地方。它由 bootServiceThread 一次性装配。"
      >
        <Sequence steps={[
          {
            title: '安装全局与 wx Proxy',
            detail: '写入 App / Page / Component / Behavior、getApp、getCurrentPages，并把 wx 包成 Proxy：未实现的 API 返回 undefined 并发送 UNSUPPORTED_API 警告。',
            code: 'installMiniProgramGlobals(registry, apiHost)',
          },
          {
            title: '启动时注册 App',
            detail: 'service.js 被 import 时执行 App(...)，registerApp 立即调用 onLaunch 和 onShow。此时页面尚未创建。',
            code: 'registerApp(options)',
          },
          {
            title: '按 manifest 顺序绑定 Page/Component',
            detail: 'Page() 和 Component() 只是把 options 放进队列，registry 用游标把它绑定到预声明的路径。注册数量超过声明会直接抛错。',
            code: 'pageCursor / componentCursor',
          },
          {
            title: 'bootstrap 创建首屏',
            detail: '等待 loadArtifacts，写入 systemInfo/storage，构建组件 schema，预初始化首屏 usingComponents，创建页面并触发 onLoad/onShow。',
            code: "control('runtime', 'bootstrap')",
          },
          {
            title: '页面就绪',
            detail: 'render 挂载完成后，host 发送 page.ready；service 才触发 onReady 并广播 RUNTIME_STATE。',
            code: "control('page', 'ready')",
          },
        ]} />

        <div className="split">
          <Card title="页面实例保留了什么">
            <ul>
              <li><code>pageId</code>、<code>path</code>、query</li>
              <li>深拷贝后的 <code>data</code></li>
              <li>methods、顶层函数、生命周期函数</li>
              <li><code>lifecycleEvents</code> 轨迹</li>
              <li><code>unloaded</code> 标记，卸载后禁止 setData</li>
            </ul>
          </Card>
          <Card title="为什么生命周期方法也挂到实例">
            <p>Taro 3 会读取 <code>this.onReady.called</code> 之类的页面实例字段。service 在构造页面时把顶层函数（包括生命周期）绑定到实例上，再单独维护 methods 表用于事件调用。</p>
            <p>这是兼容性代码，不是微信语义的完整还原。</p>
          </Card>
        </div>

        <Table
          head={['控制', 'service 行为', 'render 行为']}
          rows={[
            [<code>page.navigateTo</code>, '当前页 onHide；解析 url/query；创建 pageId；新页 onLoad → onShow；组件型页面 attached/ready', '卸载 previousPageId；按新 path + initialData 挂载'],
            [<code>page.navigateBack</code>, 'splice(delta)；倒序 onHide → onUnload；恢复页 onShow', '卸载 unloadedPageIds；用 service 返回的 data 重新挂载恢复页'],
            [<code>page.hide</code>, '当前页 onHide；App.onHide；所有页面/组件 pageLifetime hide', '无消息；组件树仍在'],
            [<code>page.show</code>, 'App.onShow；当前页 onShow；所有页面/组件 pageLifetime show', '无消息'],
            [<code>page.unload</code>, 'onUnload 并移除实例（当前 devtool 未暴露此控制）', '无消息'],
          ]}
        />
        <Callout title="返回不是 DOM 回放" tone="warn">
          <p>
            service 保留页面 <code>data</code>，但 render 在 <code>navigateTo</code> 时卸载旧页、在 <code>navigateBack</code> 时重新挂载。
            因此返回后 DOM 与滚动位置会重建，只有页面 data 被恢复。这是当前实现的明确边界。
          </p>
        </Callout>
      </Section>

      <Section
        id="data"
        kicker="Data flow"
        title="setData：本地立即生效，渲染异步"
        intro="service 先改自己的 data，再把同一份 patch 发给 render；render 侧再交给 glass-easel 做更新。"
      >
        <Sequence steps={[
          {
            title: '克隆 JSON-safe 补丁',
            detail: 'page.setData / component.setData 先 cloneJsonSafe；undefined 字段、函数、循环引用会被丢掉或拒绝。',
            code: 'cloneJsonSafe(patch)',
          },
          {
            title: '按路径写入 service data',
            detail: '支持 a.b、list[0]、obj["key"] 等路径；中间节点不存在时按下一段类型创建数组或对象。',
            code: 'applyDataPatch(data, patch)',
          },
          {
            title: '发送 data.setData 事件',
            detail: '页面带 pageId；组件带 componentId。bridge 把同一 source + pageId 的事件放进批次，在下一个 microtask 发出。',
            code: "sendEvent('data', 'setData', { pageId, patch })",
          },
          {
            title: 'host 转发到 render',
            detail: 'host 不做合并，只按 pageId 转发；render 找到对应 page 或 component 实例并调用 setData(patch)。',
            code: "service.onEvent('data', 'setData') → render.sendEvent",
          },
          {
            title: 'glass-easel 更新',
            detail: 'render 的组件实例执行 glass-easel setData，由 ProcGen 的更新路径与绑定表驱动 DOM 变更。',
            code: 'component.setData(patch)',
          },
        ]} />
        <div className="split">
          <div>
            <CodeBlock>{`Page({
  data: { user: { name: '' }, list: [] },
  onLoad() {
    this.setData({
      'user.name': 'tiny',
      'list[0]': { id: 1 },
    })
    console.log(this.data.user.name) // 'tiny'，本地立即生效
  },
})`}</CodeBlock>
          </div>
          <div className="stack">
            <Card title="没有 diff，也没有 ack">
              <p>每次 setData 都生成一个 patch 事件；bridge 只做帧批处理，不做字段合并。service 不会等待 render 确认。</p>
            </Card>
            <Card title="回调在本地同步调用">
              <p><code>setData(patch, callback)</code> 的 callback 在本地 patch 应用后立即执行，不代表 DOM 已更新。</p>
            </Card>
            <Card title="组件也要带 pageId">
              <p>组件的 data patch 带 <code>componentId</code>，但消息仍带当前 <code>pageId</code>，便于宿主与诊断关联。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="events"
        kicker="Events"
        title="两条事件通路，一次往返"
        intro="render 侧的事件先序列化，再到 service 调处理函数；service 侧的 triggerEvent 反过来走 render。"
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
            detail: '有 pageId 用页面实例；有 componentId 则先 ensureComponentInstance，再同步 data 并调用方法。',
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
              <p>button 把原生 tap 转成小程序 tap；input 处理 input/change/focus/blur/keydown/confirm；checkbox/slider/switch 把 DOM 值归一化为小程序 detail。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="components"
        kicker="Component model"
        title="一个组件，两个实例"
        intro="service 侧实例负责逻辑，render 侧实例负责模板与 DOM；它们通过 componentId、schema 和生命周期消息对齐。"
      >
        <Table
          head={['', 'service 侧', 'render 侧']}
          rows={[
            ['类型', <code>MiniProgramComponentInstance</code>, 'glass-easel GeneralComponent'],
            ['创建', 'schema + registry definition；首屏组件预初始化，其余按生命周期/事件懒创建', 'registerComponentDefinition + 模板实例化'],
            ['data', 'clone(options.data)，随后由 lifecycle/event 的 componentData 同步', 'schema.data + properties；glass-easel 管理响应式'],
            ['properties', '与 data 指向同一对象（实现细节）', 'schema.properties 交给 glass-easel 定义'],
            ['methods', '顶层非生命周期函数 + options.methods', '模板事件经 methodCaller 转发到 service'],
            ['生命周期', 'triggerLifecycle 调 lifetimes 或顶层方法', 'created/attached/ready/moved/detached 发消息'],
            ['pageLifetimes', '按路径去重后调用 show/hide', 'pageLifetime 触发 componentPageLifetime（service 当前忽略）'],
            ['identity', 'componentId（首用 base，之后 ~2、~3…）', 'componentId 由 adapter 用 WeakMap 绑定'],
          ]}
        />
        <div className="split">
          <div className="stack">
            <Card tag="schema" title="service 如何知道组件的属性与默认值">
              <p><code>buildComponentSchemas(manifest.components, registry.components)</code> 把 properties 类型归一化为字符串，并把 property 默认值合并进 schema.data。</p>
              <CodeBlock>{`{
  componentId: 'component-2',
  path: 'components/add-button/add-button',
  data: { text: '', ... },
  properties: {
    text: { type: 'string', value: '' },
  },
  using: { 'inner-card': './inner-card' },
}`}</CodeBlock>
            </Card>
            <Card tag="cycle" title="递归 usingComponents 的环">
              <p>render 在注册组件定义时维护 <code>registeringComponents</code>；遇到正在注册的依赖时先传路径字符串，等 glass-easel 解析，避免 Taro 的 comp/custom-wrapper 互相引用导致无限递归。</p>
            </Card>
          </div>
          <div className="stack">
            <Card tag="lifecycle" title="生命周期消息里带 data">
              <p>每个 phase 都把 render 侧组件 data 做 JSON-safe 转换后发给 service。service 先 <code>syncData</code>，再调用同名 lifecycle，因此组件在 attached/ready 里能读到最新属性。</p>
            </Card>
            <Card tag="page lifetimes" tone="warn" title="当前是近似实现">
              <p>service 在 page.show/hide 时按组件路径去重遍历实例，调用 <code>pageLifetimes</code>；render 发来的 <code>componentPageLifetime</code> 被忽略。多个同路径实例不会各自收到一次。</p>
            </Card>
            <Card tag="behavior" tone="warn" title="Behavior 只是透传">
              <p><code>Behavior(options)</code> 直接返回 options，没有 mixin 合并。<code>behaviors</code>、relations、generics、placeholder 等组件高级语义尚未实现。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="render"
        kicker="Render adapter"
        title="把编译产物装配成 glass-easel 组件"
        intro="GlassEaselRuntimeAdapter 是 runtime 内部的桥：它不让其他包直接依赖 glass-easel。"
      >
        <Cards>
          <Card tag="space" title="ComponentSpace + StyleScopeManager">
            <p>每个 render 线程一个 ComponentSpace，配一个 StyleScopeManager。所有页面、组件、内置组件都注册在这个 space 里。</p>
          </Card>
          <Card tag="definition" title="defineWithMethodCaller">
            <p>页面与组件都用 <code>defineWithMethodCaller(path)</code> 定义。模板传 <code>{'{ groupList, content }'}</code>，data 传初始值，usingComponents 合并内置组件与自定义组件。</p>
          </Card>
          <Card tag="caller" title="事件方法代理">
            <p><code>useMethodCallerListeners: true</code> 后，glass-easel 把模板事件交给一个 Proxy。Proxy 对任意名字返回 dispatcher；核心方法（setData、selectComponent 等）直接透传给组件。</p>
          </Card>
          <Card tag="mount" title="挂载钩子">
            <p>宿主通过 <code>mountComponent</code> / <code>unmountComponent</code> 决定节点挂到哪里；没有钩子时用 <code>Element.pretendAttached</code>，组件树仍可测试但不上屏。</p>
          </Card>
        </Cards>
        <div className="split">
          <div className="stack">
            <Card title="bootstrap 中的顺序">
              <ol style={{ margin: '8px 0 0', paddingLeft: 18, color: 'var(--muted)', fontSize: 14 }}>
                <li><code>registerStyles</code>：base CSS → manifest styles</li>
                <li><code>registerComponentSchemas</code>：先注册组件定义</li>
                <li>找到当前 page artifact</li>
                <li><code>registerPageArtifact</code> + <code>mountPage</code></li>
              </ol>
              <p style={{ marginTop: 10 }}>顺序反了，组件定义会拿不到 style scope id。</p>
            </Card>
            <Card title="页面挂载">
              <p><code>Component.createWithContext('page', definition, backend)</code> 创建页面组件，<code>setData</code> 后调用宿主 mount；随后触发 ready，并补齐尚未发过 ready 的自定义组件实例。</p>
            </Card>
          </div>
          <Card tag="inspect" title="元素树导出">
            <p>如果 backend 返回 DOM 节点，按 DOM 序列化；否则退回 glass-easel 逻辑树（shadowRoot/childNodes）。</p>
            <ul>
              <li>最多 2000 个节点</li>
              <li>最大深度 60</li>
              <li>文本截断 200 字符</li>
              <li>DOM 模式下 <code>wx-host</code> 标记组件节点</li>
            </ul>
          </Card>
        </div>
        <Callout title="render 侧没有业务路由">
          <p>
            render 只响应 <code>runtime.bootstrap</code>、<code>page.navigateTo</code>、<code>page.navigateBack</code>、
            <code>runtime.inspectTree</code> 与 canvas 消息。它不知道“当前是第几个页面”，也不知道 tabBar。
          </p>
        </Callout>
      </Section>

      <Section
        id="builtins"
        kicker="Built-ins"
        title="18 个组件，模板在构建期生成"
        intro="内置组件不是运行时 WXML 字符串；每个组件在构建期把自己的 template.wxml 编成 ProcGen，运行时只选择模板。"
      >
        <Cards className="three">
          <Card tag="18 tags" title="组件清单">
            <p><code>view</code> <code>text</code> <code>button</code> <code>label</code> <code>input</code> <code>checkbox</code> <code>checkbox-group</code> <code>radio</code> <code>radio-group</code> <code>icon</code> <code>image</code> <code>scroll-view</code> <code>slider</code> <code>progress</code> <code>switch</code> <code>swiper</code> <code>swiper-item</code> <code>canvas</code></p>
          </Card>
          <Card tag="AOT" title="构建脚本">
            <p><code>packages/components/scripts/build-templates.mjs</code> 扫描每个目录的 <code>template.wxml</code>，编译成一个 group，写到 <code>src/generated/templates.js</code>。</p>
            <p>prebuild/pretest 自动执行，生成物不入库。</p>
          </Card>
          <Card tag="base css" title="基础布局">
            <p><code>BUILTIN_BASE_STYLES</code> 为 page/view/scroll-view/button 等提供 display、尺寸、边框与 swiper/progress 的基础视觉。</p>
            <p>它以 global scope 注册，先于所有 manifest 样式。</p>
          </Card>
        </Cards>
        <Table
          head={['组件', '关键属性 / 事件', '实现方式']}
          rows={[
            ['view / text / label', 'style、selectable、space；slot', 'virtualHost + multipleSlots，DOM 标签 view/text/label'],
            ['button', 'type、disabled、hoverClass；tap', '原生 button，catchtap 后 triggerEvent(bubbles, composed)'],
            ['input', 'value、type、placeholder、disabled；input/change/focus/blur/keydown/confirm', '原生 input；Enter 或 keyCode 13 额外触发 confirm'],
            ['checkbox / checkbox-group', 'value/checked/disabled；change、checkboxstate', 'group 维护 selected 集合并向上触发 change'],
            ['radio / radio-group', 'value/checked/disabled；change', '同组语义较薄，仅原生行为'],
            ['slider', 'value/min/max/step/disabled/showValue；changing/change', '原生 range，值归一化后 triggerEvent'],
            ['switch', 'checked/disabled/type；change', '原生 checkbox 外观包装，触发小程序 change'],
            ['progress / icon / image', 'percent/showInfo/active/strokeWidth、type/size/color、src/mode', '纯模板 + 少量 observer；image 转发 load/error'],
            ['scroll-view / swiper', 'scrollX/scrollY、upperThreshold/lowerThreshold、current/autoplay/circular 等', 'CSS overflow / transform；swiper 观察属性并维护 activeIndex'],
            ['canvas', 'canvas-id、type', '占位组件；真正绘制在 service 侧离屏 canvas，并发送 UNSUPPORTED_CANVAS 警告'],
          ]}
        />
        <Callout title="内置组件是“够用”，不是完整语义" >
          <p>
            属性、事件与无障碍细节只覆盖测试 fixture 需要的行为。textarea、picker、form、navigator、video、rich-text 等尚未实现；
            已有组件的 open-type、focus、颜色、尺寸等属性也不完整。
          </p>
        </Callout>
      </Section>

      <Section
        id="styles"
        kicker="Styles"
        title="作用域注册与页面/组件隔离"
        intro="编译器生成 scope 名称，render 把它注册成数字 id；glass-easel 用这个 id 区分样式和节点。"
      >
        <Sequence steps={[
          {
            title: '注册内置基础样式',
            detail: '首次 registerStyles 时注册 tiny-builtin-base.css，并 append 到 globalScope。',
            code: "registerStyleSheetContent('tiny-builtin-base.css')",
          },
          {
            title: '注册 manifest 中的每份样式',
            detail: '读取宿主 loadStyle(outputPath) 的文本；有 scope 的调用 StyleScopeManager.register(scope)，app.wxss 用 globalScope。',
            code: 'styleScopeManager.register(style.scope)',
          },
          {
            title: '建立 path → scope 映射',
            detail: '同时按 style.path 和入口路径建立映射，兼容 foo.wxss 与 foo/index.wxss 两种产物命名。',
            code: 'styleScopeIds.set(entryPath, scopeId)',
          },
          {
            title: '定义页面/组件时绑定 scope',
            detail: '页面与组件的 options.styleScope 使用该数字 id；glass-easel 在渲染时把 scope 应用到节点和样式表。',
            code: 'options: { styleScope }',
          },
        ]} />
        <div className="split">
          <Card title="编译器与运行时的分工">
            <ul>
              <li>编译器：决定 scope 名称、给 CSS 加前缀、给标签打 marker class</li>
              <li>运行时：注册 scope、按 path 查 id、传给组件定义</li>
              <li>glass-easel：在组件树与 stylesheet 之间应用 scope</li>
            </ul>
          </Card>
          <Card title="app.wxss 为什么是全局的">
            <p>编译 app.wxss 时不传 classPrefix/tagClassPrefix，scope 也是 undefined。它在 render 注册为 globalScope，因此对所有页面生效。</p>
            <p>这也意味着 app.wxss 中的 tag 选择器不会被改写为 marker class。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="canvas"
        kicker="Canvas & animation"
        title="离屏绘制、PNG 帧、最终态动画"
        intro="这两项都不是完整的原生语义，而是为了让真实小程序（尤其 ECharts）先跑起来的最小闭环。"
      >
        <div className="split">
          <div className="stack">
            <Card tag="canvas" title="service 画，render 显示">
              <p><code>createBridgedCanvas</code> 在 service 文档里建一个隐藏 canvas，Proxy 包装 2D context；每次绘制后 50ms 节流 <code>toDataURL('image/png')</code>。</p>
              <p>帧通过 <code>canvas.frame</code> 到 render，render 找到对应 <code>canvas[canvas-id]</code>，用 Image 加载后 drawImage。</p>
              <p><code>createCanvasContext</code> 还提供 setFillStyle 等旧 API 映射。</p>
            </Card>
            <Card tag="selector query" title="测量会跨线程">
              <p><code>createSelectorQuery</code> 不是通用 DOM 查询：它把 selector 发到 render 做 <code>getBoundingClientRect</code>，返回宽高，并构造一个 bridged canvas 节点。</p>
              <p>每次创建 query 都会记一条 <code>CANVAS_OFFSCREEN</code> info。</p>
            </Card>
          </div>
          <div className="stack">
            <Card tag="animation" title="编译期转成 CSS">
              <p><code>wx.createAnimation</code> 返回链式对象，<code>export()</code> 输出 CSS transform/transition 字符串。编译期把 <code>{'animation="{{...}}"'}</code> 属性改写为内联 style。</p>
              <p>多 step 时序、事件回调和关键帧语义没有还原。</p>
            </Card>
            <Card tag="compat" tone="warn" title="Object.prototype 补丁">
              <p>service 线程启动时给 <code>Object.prototype</code> 加 inert 的 addEventListener/removeEventListener，避免 ECharts 这类库把普通 canvas 包装对象误判为 DOM 节点。</p>
              <p>这是浏览器 service 线程的兼容 hack，不是通用运行时能力。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="diagnostics"
        kicker="Diagnostics"
        title="五个来源，一套结构"
        intro="runtime 不 console.log；所有异常与状态都归一化为 RuntimeDiagnostic。"
      >
        <Table
          head={['来源', '典型 Code', '产生位置']}
          rows={[
            ['compiler', 'PAGE_NOT_FOUND、STYLE_COMPILE_ERROR', 'manifest.diagnostics，host 启动时归一化'],
            ['transport', 'PROTOCOL_VERSION_MISMATCH、TIMEOUT、TRANSPORT_CLOSED', 'BridgeConnection 的协议错误'],
            ['service', 'BOOTSTRAP_ERROR、PAGE_READY_ERROR、EVENT_HANDLER_ERROR、UNSUPPORTED_API', <code>packages/runtime/src/service.ts</code>],
            ['render', 'RENDER_BOOTSTRAP_ERROR、UNSUPPORTED_COMPONENT、UNSUPPORTED_CANVAS', 'adapter / render bootstrap'],
            ['host', 'RUNTIME_STATE', 'service 发送的页面栈快照'],
          ]}
        />
        <div className="split">
          <Card title="RuntimeDiagnostic 结构">
            <CodeBlock>{`{
  severity: 'info' | 'warning' | 'error' | 'state',
  code: 'EVENT_HANDLER_ERROR',
  message: '...',
  timestamp: 1710000000000,
  source: 'compiler' | 'transport' | 'service' | 'render' | 'host',
  pageId?: 'page-1',
  details?: { ... },
}`}</CodeBlock>
          </Card>
          <Card title="诊断如何到调试器">
            <p>service/render 通过 <code>diagnostic.log/warn/error/state</code> 发送；host 的 <code>HostDiagnosticStore</code> 归一化并写入数组，devtool 订阅 <code>DevtoolRuntimeClient</code> 的状态投影。</p>
            <p>编译诊断也进入同一个数组，因此面板不需要区分“构建日志”和“运行日志”。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="limits"
        kicker="Limits"
        title="当前运行时的硬边界"
        intro="这些行为由代码直接决定，做兼容前必须先知道。"
      >
        <Cards>
          <Card tag="setData" tone="warn" title="无批合并与 ack">
            <p>每次 setData 都发一条消息；没有字段合并、没有渲染完成回调、没有差量确认。bridge 只把同一 microtask 的事件合成一帧。</p>
          </Card>
          <Card tag="render" tone="warn" title="页面返回会重挂 DOM">
            <p>navigateTo 卸载旧页，navigateBack 用 service 的 data 重新挂载。滚动位置、输入焦点、组件内部非 data 状态都会丢失。</p>
          </Card>
          <Card tag="behavior" tone="warn" title="没有 Behavior mixin">
            <p><code>Behavior</code> 透传 options，没有合并；relations、generics、placeholder、组件间通信未实现。</p>
          </Card>
          <Card tag="page" tone="warn" title="页面能力有限">
            <p>无 tabBar、下拉刷新、触底、页面滚动事件、分享、页面栈恢复；子包只是路径，没有按需加载。</p>
          </Card>
          <Card tag="style" tone="warn" title="隔离模式未完整">
            <p>已做 class/tag 作用域，但没有 styleIsolation、addGlobalClass、app.wxss 边界策略与优先级矩阵。</p>
          </Card>
          <Card tag="host" tone="warn" title="浏览器假设">
            <p>service 侧 canvas 依赖 document；render 依赖 DOM backend；无法直接把同代码搬到原生 service 运行时。</p>
          </Card>
        </Cards>
        <Callout title="下一步">
          <p>
            这些边界如何被宿主放大或缓解，见 <a href="#/hosts">宿主支持</a>；用什么证据保证现状，见 <a href="#/testing">验证体系</a>。
          </p>
        </Callout>
      </Section>
    </>
  )
}
