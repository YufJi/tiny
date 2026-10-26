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

export default function Testing() {
  return (
    <>
      <PageHero
        eyebrow="测试与验收"
        title={<>用真实小程序验收，<br /><span className="gradient">不只跑单元测试</span></>}
        lede="Tiny 的验收会编译真实的 WXML、WXSS 和 JS，启动 service 和 render 线程，在 Chromium 里点击、输入、导航，失败时保存截图。180 个单元测试覆盖协议、组件语义和编译逻辑，51 个浏览器步骤验证端到端行为。"
        stats={[['180', '单元测试'], ['51', '浏览器步骤'], ['5', '浏览器流程'], ['5', '测试小程序']]}
      />
      <PageNav items={[
        ['gate', '验收流程'],
        ['flows', '浏览器流程'],
        ['units', '单元测试'],
        ['hosts', '两种宿主'],
        ['fixtures', '测试小程序'],
        ['taro', 'Taro 3 兼容'],
        ['commands', '命令和环境变量'],
        ['uncovered', '尚未覆盖'],
      ]} />

      <Section
        id="gate"
        kicker="验收流程"
        title="一条命令跑完构建、单测和浏览器验收"
        intro="pnpm accept:glass-easel 是唯一完整的端到端入口，任何单个包的测试都不能替代它。"
      >
        <Sequence steps={[
          {
            title: '构建 8 个目标',
            detail: '依次构建 manifest、stylesheet-compiler、template-compiler、bridge、cli、runtime、host-web-components 和 host-browser，确保后面的测试用的是最新产物。',
            code: 'pnpm build:glass-easel',
          },
          {
            title: '检查内核依赖',
            detail: '从 packages/runtime/src/index.ts 遍历依赖图，禁止浏览器全局，也禁止反向依赖 @tiny/host-* 或 hosts/*。',
            code: 'pnpm check:runtime-purity',
          },
          {
            title: '跑 6 个包的单元测试',
            detail: 'bridge、template-compiler、stylesheet-compiler、cli、host-web-components、runtime。没有全局 runner，按包逐个执行。',
            code: 'pnpm --filter <package> test',
          },
          {
            title: '编译 P0 demo',
            detail: '把 tests/apps/demo 编到 tests/host/generated，然后在 5199 端口启动 Vite 测试宿主。',
            code: 'pnpm compile:glass-easel',
          },
          {
            title: 'P0 demo 流程',
            detail: '20 步：启动、渲染、作用域样式、快照、自定义事件、checkbox/slider/switch、导航、输入、storage、toast、组件语义、样式隔离、按钮矩阵、relations、canvas 诊断和零 console error。',
            code: 'runBrowserAcceptance({ baseUrl })',
          },
          {
            title: 'mini 流程',
            detail: '重新编译 tests/apps/mini 覆盖 generated；9 步：真实 todos、双组件实例、import/include/template、输入、ECharts、子包、warning 和零错误。',
            code: 'runMiniProgramAcceptance()',
          },
          {
            title: 'Taro 3 流程',
            detail: '编译 tests/apps/todo 的预构建产物；6 步：Redux todos、Enter 新增、勾选、筛选、清空和零错误。',
            code: 'runTaroAcceptance()',
          },
          {
            title: 'WeChat demo 流程',
            detail: '编译官方示例子集；4 步：组件索引、button 页、storage API 页和零错误。',
            code: 'runWechatDemoAcceptance()',
          },
          {
            title: '调试器流程',
            detail: '把全部 tests/apps 编到 devtool static，再用 rspack 启动；8 步：默认应用列表、点击启动、状态投影、渲染、导航/返回、逐应用预览与 3 个应用 LRU 保活、回到列表/深链/页面栈上限/Reload/Close app、零错误。',
            code: 'runDevtoolAcceptance()',
          },
        ]} />
        <Callout title="各阶段会覆盖 generated">
          <p>
            前四段流程共用 <code>tests/host/generated</code>，调试器阶段写入 <code>apps/devtool/static</code>。每次编译前都会清空输出，
            所以不能并行跑两段浏览器验收。最后会重新编译 P0 demo，保证 <code>pnpm dev:glass-easel</code> 打开时看到的是默认示例。
          </p>
        </Callout>
      </Section>

      <Section
        id="flows"
        kicker="浏览器流程"
        title="51 个步骤怎么分配"
        intro="每一步都在真实 Chromium 中执行，会检查页面状态、DOM、像素或 console。"
      >
        <Table
          head={['流程', '测试小程序', '步数', '验证内容']}
          rows={[
            ['P0 demo', <code>tests/apps/demo</code>, '24', '双线程启动、内置组件、按钮矩阵、样式作用域、事件、导航、storage、canvas 诊断/2D/WebGL/legacy/ECharts、组件语义、零 console error'],
            ['现有示例', <code>tests/apps/mini</code>, '9', '真实 todos、双 add-button 实例、import/include/template、输入、ECharts 柱状图、子包、warning'],
            ['Taro 3', <code>tests/apps/todo</code>, '6', 'Redux todos、输入 + Enter、勾选、筛选、清空、零错误'],
            ['WeChat demo', <code>tests/apps/wechat-demo</code>, '4', '组件索引、button 页、storage API 页、零错误'],
            ['调试器', <code>apps/devtool</code>, '8', '默认列表和启动、状态投影、元素树、导航/返回、逐个预览测试应用、3 应用 LRU 保活、页面栈上限、Reload/Close app、零错误'],
          ]}
        />
        <div className="split">
          <Card title="检查哪些内容">
            <ul>
              <li>页面对象：<code>window.__tinyRuntime</code> 的 pageStack 和 diagnostics</li>
              <li>DOM：class、属性、文本、计算样式和 canvas 像素</li>
              <li>交互：真实 click、fill 和 Enter 按键</li>
              <li>副作用：storage 写入、toast 调用、导航 query</li>
              <li>异常：console error 和预期内的 warning</li>
            </ul>
          </Card>
          <Card title="失败时能查">
            <p>Playwright 失败时会保存截图，并输出页面错误和 console 错误。测试宿主暴露 <code>__tinyRuntime</code>，可以直接读取诊断和页面状态。</p>
            <p>验收不依赖 devtool 界面，测试宿主也不会 import devtool 应用。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="units"
        kicker="单元测试"
        title="180 个单元测试，按包执行"
        intro="没有全局 test runner，每个包单独跑，避免隐式耦合，也方便定位失败。"
      >
        <Table
          head={['Package', '数量', '重点']}
          rows={[
            [<code>@tiny/bridge</code>, '10', '信封校验、版本和路由错误、payload 校验、握手、调用关联、超时、关闭、批处理顺序、诊断插队、MessagePort'],
            [<code>@tiny/template-compiler</code>, '30', '脚本依赖、WXS、import/include、模板别名、ProcGen 签名、绑定表复用、事件简写、data-* 绑定、stringify 往返'],
            [<code>@tiny/stylesheet-compiler</code>, '29', 'class/tag 前缀、rpx/calc、@import 编码和包装、@layer、:host 低优先级、hostAttribute、keyframes、page 根节点'],
            [<code>@tiny/cli</code>, '13', 'manifest 全产物、命名配置、WXS 双注册、配置合并、service/render 入口、TS/source map、样式作用域、tag marker'],
            [<code>@tiny/host-web-components</code>, '30', '23 个 tag 模板、共享 behaviors、button 对齐、label、input、checkbox/slider/switch、progress/swiper/icon、image/icon 渲染'],
            [<code>@tiny/runtime</code>, '64', '全局安装和命名、双线程 bootstrap、组件 schema、behaviors/observers/relations/externalClasses/styleIsolation/selectComponent、组件型页面、资源、导航、API host、诊断'],
          ]}
        />
        <Callout title="单测也会跑真实连接">
          <p>
            Bridge 测试会真的建立两条内存连接并完成握手；runtime 测试会启动 service/render 线程、注册 Page、执行 bootstrap 和导航。
            这里没有把整个引擎 mock 掉的做法。
          </p>
        </Callout>
      </Section>

      <Section
        id="hosts"
        kicker="两种宿主"
        title="测试宿主和调试器不是一回事"
        intro="两者都通过 @tiny/host-browser 的 createStandaloneDualThreadHost 启动线程，但一个服务自动化，一个服务人。"
      >
        <div className="split">
          <Card tag="tests/host" title="无界面单应用宿主">
            <ul>
              <li>Vite 提供 host、service、render 三个入口</li>
              <li>静态导入 <code>generated/manifest.json</code></li>
              <li>启动线程，把页面挂到 <code>#app</code></li>
              <li>暴露 <code>window.__tinyRuntime</code> 给 Playwright</li>
              <li>P0、mini、Taro、WeChat 四段流程都用它</li>
              <li>不依赖 devtool 应用</li>
            </ul>
          </Card>
          <Card tag="apps/devtool" tone="violet" title="带界面的多应用调试器">
            <ul>
              <li>React 面板和 rematch/Redux 状态投影</li>
              <li>扫描 tests/apps/*，全部测试应用都可以切换</li>
              <li>页面栈、诊断、元素树和生命周期时间线</li>
              <li>Navigate / Back / SwitchTab / Reload / Close app</li>
              <li>通过 <code>DevtoolRuntimeClient</code> 控制</li>
              <li>有独立的调试器验收阶段</li>
            </ul>
          </Card>
        </div>
        <Callout title="共用内核，控制方式不同">
          <p>
            测试宿主只调用 <code>host.bootstrap()</code>，然后用 Playwright 操作页面；devtool 通过 client 做导航、前后台、重载和元素树检查。
            两者都不直接读取 iframe 全局变量。更多差异见 <a href="#/hosts">宿主适配</a>。
          </p>
        </Callout>
      </Section>

      <Section
        id="fixtures"
        kicker="测试小程序"
        title="五个测试小程序，覆盖不同产物"
        intro="fixture 不是单元测试里的假数据，而是完整的小程序源码或预构建产物。"
      >
        <Table
          head={['Fixture', '形态', '覆盖内容', '是否进入验收']}
          rows={[
            [<code>demo</code>, '3 个页面 + 8 个组件', 'P0 内置组件、作用域样式、导航、storage、canvas 诊断、按钮矩阵、Behavior/observers/relations、styleIsolation、externalClasses', '是'],
            [<code>mini</code>, '4 个页面 + 2 个组件 + 1 个分包', '真实 todos、import/include/template、animation、ECharts 离屏 canvas、资源内联', '是'],
            [<code>todo</code>, '1 个页面，Taro 3 预构建产物', 'webpackJsonp、外部 WXS、递归模板、循环 usingComponents、Enter 提交', '是'],
            [<code>wechat-demo</code>, '117 个页面 + 2 个分包（示例子集）', '基础组件索引、button 示例、storage API 示例', '是'],
            [<code>echarts</code>, '22 个页面的历史示例', '早期 ECharts 集成参考资料', '否'],
          ]}
        />
      </Section>

      <Section
        id="taro"
        kicker="Taro 3 兼容"
        title="Taro 3 产物也在正式验收里"
        intro="Taro 的预构建输出对运行时假设很多，所以它被当成正式验收阶段，而不是手工示例。"
      >
        <Cards>
          <Card tag="运行时" title="webpackJsonp 和页面对象">
            <p><code>wx.webpackJsonp</code> 作为原始数据属性暴露；生命周期方法绑定到页面实例，支持 <code>this.onReady.called</code>。</p>
          </Card>
          <Card tag="模板" title="WXS 和递归组件">
            <p>外部 WXS 按带扩展名和不带扩展名注册；usingComponents 环检测避免 comp/custom-wrapper 互相引用时递归爆栈。</p>
          </Card>
          <Card tag="全局对象" title="getCurrentPages / getSystemInfo">
            <p>补上 Taro 运行时依赖的全局对象和 callback 版系统信息；raw wx 数据属性和 unsupported API 诊断分开处理。</p>
          </Card>
          <Card tag="输入" title="confirm 提交">
            <p>input 会转发 focus、blur、keydown 和 confirm，Taro 表单按 Enter 可以提交。</p>
          </Card>
        </Cards>
        <Callout title="兼容不等于完整" tone="warn">
          <p>
            这些只是让 Taro 3 React 产物能跑起来的最小集合。Behavior、observers 和 relations 已经实现，
            但 generics、placeholder、definitionFilter 和自定义 tabBar 还没有完成；其他社区框架没有进入验收。
          </p>
        </Callout>
      </Section>

      <Section
        id="commands"
        kicker="命令和环境变量"
        title="常用命令"
        intro="完整验收需要 Chromium；没有浏览器时，可以只跑构建、单测和编译。"
      >
        <div className="split">
          <CodeBlock>{`# 完整验收
pnpm accept:glass-easel

# 只构建、单测和编译，不启动浏览器
SKIP_BROWSER=1 pnpm accept:glass-easel

# 单包测试
pnpm --filter @tiny/runtime test
pnpm --filter @tiny/cli test

# 检查内核是否依赖浏览器 API
pnpm check:runtime-purity

# 本地宿主和调试器
pnpm dev:glass-easel      # :5173
pnpm dev:devtool          # :8080，预览全部 tests/apps

# 网站（包含内嵌调试器）和产物检查
pnpm site:build
pnpm site:check`}</CodeBlock>
          <div className="stack">
            <Card title="环境变量">
              <ul>
                <li><code>SKIP_BROWSER=1</code>：跳过浏览器阶段</li>
                <li><code>TINY_ACCEPT_PORT</code>：测试宿主端口，默认 5199</li>
                <li><code>TINY_DEVTOOL_PORT</code>：调试器端口，默认 5180</li>
                <li><code>HEADED=1</code>：显示浏览器窗口</li>
                <li><code>PLAYWRIGHT_CHROMIUM_PATH</code>：指定 Chromium 路径</li>
              </ul>
            </Card>
            <Card title="浏览器选择">
              <p>使用 <code>playwright-core</code>，优先找系统 Chrome（channel: chrome），失败后尝试 Edge。机器上没有浏览器时，验收会在浏览器阶段失败。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="uncovered"
        kicker="尚未覆盖"
        title="这些还没有测试"
        intro="没测到不等于没问题。下面这些需要单独补测试。"
      >
        <Cards className="three">
          <Card tag="性能" tone="warn" title="没有性能基线"><p>启动、首屏、setData、导航、内存和长时运行都没有量化门槛。</p></Card>
          <Card tag="视觉" tone="warn" title="没有视觉回归"><p>样式断言只看计算值和像素抽样，没有截图 diff；组件外观变化不会被稳定发现。</p></Card>
          <Card tag="原生" tone="warn" title="没有原生宿主"><p>浏览器之外的 transport、渲染后端和 service 运行时都不存在；canvas 适配器也还没有原生实现。</p></Card>
          <Card tag="组件" tone="warn" title="组件高级能力未覆盖"><p>generics、placeholder、definitionFilter、完整内置 behavior 和 open-type 真实能力都没有验收。</p></Card>
          <Card tag="Canvas" tone="warn" title="Canvas 交互未验收"><p>离屏帧、touch 事件和 SelectorQuery 有覆盖；canvas rAF、完整 2D API 和原生 touch 链路没有。</p></Card>
          <Card tag="页面" tone="warn" title="页面高级能力未覆盖"><p>下拉刷新、分享、页面栈恢复、自定义 tabBar 没有验收；内置 tabBar、滚动和触底已经接入。</p></Card>
          <Card tag="API" tone="warn" title="API 覆盖有限"><p>网络、媒体、文件、位置、账号、WebSocket 和 IntersectionObserver 都没有端到端测试。</p></Card>
          <Card tag="安全" tone="warn" title="缺少安全隔离"><p>iframe 没有 sandbox，消息没有 origin 校验，跨线程输入只做 JSON 安全校验，没有权限模型。</p></Card>
        </Cards>
        <Callout title="构建产物不入库">
          <p>
            <code>tests/host/generated/</code>、<code>hosts/web-components/src/generated/</code> 和 <code>apps/devtool/static/</code> 都是构建产物。
            仓库只保留源码、manifest 约定和测试小程序，验收时会自己生成它们。
          </p>
        </Callout>
      </Section>
    </>
  )
}
