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
        eyebrow="Testing & compatibility"
        title={<>用真实小程序验收，<br /><span className="gradient">而不是用快照自证</span></>}
        lede="Tiny 的验收会编译真实 WXML/WXSS/JS，启动两个 iframe，在 Chromium 里点击、输入、导航，并在失败时保存截图。151 个单测管住协议、组件语义与算法，46 个浏览器步骤管住端到端行为。"
        stats={[['151', 'unit tests'], ['46', 'browser steps'], ['5', 'browser flows'], ['5', 'test fixtures']]}
      />
      <PageNav items={[
        ['gate', '验收闸门'],
        ['flows', '五段浏览器流程'],
        ['units', '单元测试'],
        ['hosts', '两种宿主'],
        ['fixtures', '测试小程序'],
        ['taro', 'Taro 3 兼容'],
        ['commands', '命令与环境'],
        ['uncovered', '未覆盖'],
      ]} />

      <Section
        id="gate"
        kicker="Acceptance gate"
        title="一条命令跑完构建、单测和五段浏览器流程"
        intro="pnpm accept:glass-easel 是唯一的端到端入口；任何包单独测试都不能替代它。"
      >
        <Sequence steps={[
          {
            title: '构建 8 个目标',
            detail: 'manifest、stylesheet-compiler、template-compiler、bridge、components、cli、runtime、host-browser 依次构建，确保后续测试消费的是最新 dist。',
            code: 'pnpm build:glass-easel',
          },
          {
            title: '检查 runtime 纯度',
            detail: '从 packages/runtime/src/index.ts 遍历依赖图，禁止浏览器全局与 hosts/browser 反向依赖。',
            code: 'pnpm check:runtime-purity',
          },
          {
            title: '跑 6 个包的单测',
            detail: 'bridge、template-compiler、stylesheet-compiler、cli、components、runtime；没有全局 runner，逐包过滤执行。',
            code: 'pnpm --filter <package> test',
          },
          {
            title: '编译 P0 demo',
            detail: 'tests/apps/demo → tests/host/generated，启动 5199 端口的 Vite 测试宿主。',
            code: 'pnpm compile:glass-easel',
          },
          {
            title: 'P0 demo 流程',
            detail: '20 步：启动、渲染、作用域样式、快照、自定义事件、checkbox/slider/switch、导航、input、storage、toast、组件语义、样式隔离、按钮矩阵、relations、canvas 诊断、零 console error。',
            code: 'runBrowserAcceptance({ baseUrl })',
          },
          {
            title: 'mini 流程',
            detail: '重新编译 tests/apps/mini 覆盖 generated；9 步：真实 todos、双组件实例、import/include/template、输入、ECharts、子包、warnings、零错误。',
            code: 'runMiniProgramAcceptance()',
          },
          {
            title: 'Taro 3 流程',
            detail: '编译 tests/apps/todo 的预构建产物；6 步：Redux todos、Enter 新增、勾选、筛选、清空、零错误。',
            code: 'runTaroAcceptance()',
          },
          {
            title: 'WeChat demo 流程',
            detail: '编译官方示例子集；4 步：组件索引、button 页、storage API 页、零错误。',
            code: 'runWechatDemoAcceptance()',
          },
          {
            title: '调试器流程',
            detail: '编译全部 tests/apps 到 devtool static，启动 rspack；7 步：boot、状态投影、渲染、导航/返回、逐应用预览、宿主导航/前后台 + Reload/Terminate、零错误。',
            code: 'runDevtoolAcceptance()',
          },
        ]} />
        <Callout title="阶段之间会覆盖 generated" >
          <p>
            前四段流程共用 <code>tests/host/generated</code>；调试器阶段则写入 <code>apps/devtool/static</code>。每次编译前都会 clean，
            因此不能并行跑两段浏览器验收；最后会重新编译 P0 demo，保证 <code>pnpm dev:glass-easel</code> 的默认产物正确。
          </p>
        </Callout>
      </Section>

      <Section
        id="flows"
        kicker="Browser flows"
        title="46 步如何分布"
        intro="每一步都在真实 Chromium 中执行，并对页面状态、DOM、像素或 console 做断言。"
      >
        <Table
          head={['流程', 'fixture', '步数', '证明什么']}
          rows={[
            ['P0 demo', <code>tests/apps/demo</code>, '20', '双线程启动、内置组件、按钮矩阵、样式作用域、事件、导航、storage、canvas 诊断、组件语义、console 干净'],
            ['Existing app', <code>tests/apps/mini</code>, '9', '真实 todos、双 add-button 实例、import/include/template、输入、ECharts bar、子包、warnings'],
            ['Taro 3', <code>tests/apps/todo</code>, '6', 'Redux todos、输入 + Enter、勾选、筛选、清空、零错误'],
            ['WeChat demo', <code>tests/apps/wechat-demo</code>, '4', '组件索引、button 页、storage API 页、零错误'],
            ['Debugger', <code>apps/devtool</code>, '7', 'boot、状态投影、元素树、导航/返回、逐个预览全部 tests/apps、宿主导航/前后台 + Reload/Terminate、零错误'],
          ]}
        />
        <div className="split">
          <Card title="断言的层次">
            <ul>
              <li>页面对象：<code>window.__tinyRuntime</code> 的 pageStack / diagnostics</li>
              <li>DOM：class、属性、文本、计算样式、canvas 像素</li>
              <li>交互：真实 click / fill / press Enter</li>
              <li>副作用：storage 写入、toast 调用、导航 query</li>
              <li>负向：零 console error、预期的 warning</li>
            </ul>
          </Card>
          <Card title="失败可诊断">
            <p>Playwright 失败时保存截图并输出页面/console 错误；测试宿主暴露 <code>__tinyRuntime</code>，可以直接读诊断数组与页面状态。</p>
            <p>验收不依赖 devtool UI，测试宿主也不 import devtool。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="units"
        kicker="Unit tests"
        title="151 个测试，按包隔离"
        intro="没有全局 test runner；每个包独立执行，避免隐式耦合，也让失败定位到包。"
      >
        <Table
          head={['Package', '数量', '重点']}
          rows={[
            [<code>@tiny/bridge</code>, '10', 'envelope 校验、版本/路由/payload 错误、handshake、call 关联、超时、关闭、批处理 FIFO、诊断插队、MessagePort'],
            [<code>@tiny/template-compiler</code>, '30', '脚本依赖、WXS、import/include、模板别名、ProcGen 签名、绑定表复用、事件简写、data-* 绑定、stringify 往返'],
            [<code>@tiny/stylesheet-compiler</code>, '25', 'class/tag 前缀、rpx/calc、@import 编码与包装、@layer、:host 低优先级、hostAttribute、keyframes、page 根节点'],
            [<code>@tiny/cli</code>, '11', 'manifest 全 artifact、naming 配置、WXS 双注册、配置合并、service/render 入口、TS + source map、样式作用域、tag marker'],
            [<code>@tiny/components</code>, '17', '18 个 tag 模板、共享 behaviors、button 对齐、label 基础、input 归一化、checkbox/slider/switch、progress/swiper/icon'],
            [<code>@tiny/runtime</code>, '58', '全局安装与 naming、双线程 bootstrap、component schema、behaviors/observers/relations/externalClasses/styleIsolation/selectComponent、component-as-page、assets、导航、API host、诊断'],
          ]}
        />
        <Callout title="单测也验证协议契约" >
          <p>
            bridge 测试会真的建立两条内存连接并完成握手；runtime 测试会真的启动 service/render 线程、注册 Page、bootstrap 并导航。
            这里没有“mock 掉整个引擎”的通过方式。
          </p>
        </Callout>
      </Section>

      <Section
        id="hosts"
        kicker="Two hosts"
        title="测试宿主与调试器，不是同一个东西"
        intro="两者都通过 @tiny/host-browser 的 createStandaloneDualThreadHost 启动双 iframe，但一个服务自动化，一个服务人。"
      >
        <div className="split">
          <Card tag="tests/host" title="无 UI 单应用宿主">
            <ul>
              <li>Vite 提供 host / service / render 三个入口</li>
              <li>静态导入 <code>generated/manifest.json</code></li>
              <li>启动双线程，把页面挂到 <code>#app</code></li>
              <li>暴露 <code>window.__tinyRuntime</code> 给 Playwright</li>
              <li>P0 / mini / Taro / WeChat 四段都用它</li>
              <li>不依赖 devtool</li>
            </ul>
          </Card>
          <Card tag="apps/devtool" tone="violet" title="带 UI 的多应用调试器">
            <ul>
              <li>React 面板 + rematch/Redux 投影</li>
              <li>扫描 tests/apps/*，全部 fixture 可切换预览</li>
              <li>页面栈、诊断、元素树、状态</li>
              <li>Navigate / Back / Reload / Terminate</li>
              <li>通过 <code>DevtoolRuntimeClient</code> 控制</li>
              <li>独立的 debugger 验收阶段</li>
            </ul>
          </Card>
        </div>
        <Callout title="共享内核，不共享控制面">
          <p>
            测试宿主只调用 <code>host.bootstrap()</code> 并用 Playwright 操作页面；devtool 通过 client 调导航、前后台、重载和树检查。
            两者都不直接读 iframe 全局。宿主差异详见 <a href="#/hosts">宿主支持</a>。
          </p>
        </Callout>
      </Section>

      <Section
        id="fixtures"
        kicker="Fixtures"
        title="五个小程序，覆盖不同的真实产物"
        intro="fixture 不是单元测试的假数据，而是完整的小程序源码或预构建产物。"
      >
        <Table
          head={['Fixture', '形态', '覆盖点', '是否进闸门']}
          rows={[
            [<code>demo</code>, '3 页 + 8 组件', 'P0 内置组件、作用域样式、导航、storage、canvas 诊断、button 矩阵、Behavior/observers/relations、styleIsolation、externalClasses', '是'],
            [<code>mini</code>, '4 页 + 2 组件 + 1 分包', '真实 todos、import/include/template、animation、ECharts 离屏 canvas、资源内联', '是'],
            [<code>todo</code>, '1 页 Taro 3 预构建产物', 'webpackJsonp、外部 WXS、递归模板、循环 usingComponents、Enter 提交', '是'],
            [<code>wechat-demo</code>, '117 页 + 2 分包（示例子集）', '基础组件索引、button 示例、storage API 示例', '是'],
            [<code>echarts</code>, '22 页历史示例', '早期 ECharts 集成参考资料', '否'],
          ]}
        />
      </Section>

      <Section
        id="taro"
        kicker="Taro 3"
        title="社区产物兼容不是“顺便跑跑”"
        intro="Taro 的 prebuilt 输出把运行时假设压到了极限，因此它被当作正式验收阶段，而不是手工 demo。"
      >
        <Cards>
          <Card tag="runtime" title="webpackJsonp 与页面对象">
            <p><code>wx.webpackJsonp</code> 作为 raw 数据属性暴露；生命周期方法绑定到页面实例，支持 <code>this.onReady.called</code>。</p>
          </Card>
          <Card tag="template" title="WXS 与递归组件">
            <p>外部 WXS 按带/不带扩展名注册；usingComponents 环检测避免 comp/custom-wrapper 互相引用时递归爆栈。</p>
          </Card>
          <Card tag="globals" title="getCurrentPages / getSystemInfo">
            <p>补齐 Taro runtime 依赖的全局与 callback 版系统信息；raw wx 数据属性与 unsupported API 诊断分开。</p>
          </Card>
          <Card tag="input" title="confirm 提交">
            <p>input 转发 focus / blur / keydown / confirm，Taro 表单按 Enter 能提交。</p>
          </Card>
        </Cards>
        <Callout title="兼容不等于完整" tone="warn">
          <p>
            这些是“Taro 3 React 产物能跑”的最小集合。Behavior、observers、relations 已经实现，
            但 generics、placeholder、definitionFilter、tabBar 等仍未完成；其他社区框架没有纳入验收。
          </p>
        </Callout>
      </Section>

      <Section
        id="commands"
        kicker="Commands"
        title="命令与环境开关"
        intro="完整闸门需要 Chromium；没有浏览器时只能跑构建、单测和编译。"
      >
        <div className="split">
          <CodeBlock>{`# 完整闸门
pnpm accept:glass-easel

# 只构建 + 单测 + 编译，不起浏览器
SKIP_BROWSER=1 pnpm accept:glass-easel

# 单包测试
pnpm --filter @tiny/runtime test
pnpm --filter @tiny/cli test

# 核心 runtime 纯度
pnpm check:runtime-purity

# 本地宿主 / 调试器
pnpm dev:glass-easel      # :5173
pnpm dev:devtool          # :8080，预览全部 tests/apps

# 网站（含内嵌 devtool）与产物检查
pnpm site:build
pnpm site:check`}</CodeBlock>
          <div className="stack">
            <Card title="环境变量">
              <ul>
                <li><code>SKIP_BROWSER=1</code> 跳过浏览器阶段</li>
                <li><code>TINY_ACCEPT_PORT</code> 测试宿主端口，默认 5199</li>
                <li><code>TINY_DEVTOOL_PORT</code> 调试器端口，默认 5180</li>
                <li><code>HEADED=1</code> 显示浏览器窗口</li>
                <li><code>PLAYWRIGHT_CHROMIUM_PATH</code> 指定 Chromium</li>
              </ul>
            </Card>
            <Card title="浏览器选择">
              <p>使用 <code>playwright-core</code>，优先系统 Chrome（channel: chrome），失败后尝试 Edge。没有安装浏览器时闸门会在浏览器阶段失败。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="uncovered"
        kicker="Not covered"
        title="这些还没有证据"
        intro="把“没有测试”当成“可能有问题”，而不是“应该没问题”。"
      >
        <Cards className="three">
          <Card tag="perf" tone="warn" title="没有性能基线"><p>启动、首屏、setData、导航、内存、长时运行都没有量化门槛。</p></Card>
          <Card tag="visual" tone="warn" title="没有视觉回归"><p>样式断言是计算值/像素抽样，不是截图 diff；组件外观变化不会被稳定捕获。</p></Card>
          <Card tag="native" tone="warn" title="没有原生宿主"><p>浏览器之外的 transport、backend、service 运行时都不存在；canvas 适配器也还没有原生实现。</p></Card>
          <Card tag="components" tone="warn" title="组件高级能力未覆盖"><p>generics、placeholder、definitionFilter、完整内置 behavior、open-type 真实能力都没有验收。</p></Card>
          <Card tag="canvas" tone="warn" title="Canvas 交互未验收"><p>离屏帧、touch 事件、SelectorQuery 有覆盖；canvas rAF、完整 2D API 与原生 touch 链路没有。</p></Card>
          <Card tag="pages" tone="warn" title="页面高级能力未覆盖"><p>tabBar、下拉刷新、触底、分享、页面滚动、页面栈恢复均未验收。</p></Card>
          <Card tag="api" tone="warn" title="API 面很窄"><p>网络、媒体、文件、位置、账号、WebSocket、IntersectionObserver 都没有端到端证据。</p></Card>
          <Card tag="security" tone="warn" title="没有安全边界"><p>iframe 无 sandbox、消息无 origin 校验、跨线程输入只做 JSON-safe，不做权限模型。</p></Card>
        </Cards>
        <Callout title="生成物不入库">
          <p>
            <code>tests/host/generated/</code>、<code>packages/components/src/generated/</code>、<code>apps/devtool/static/</code> 都是构建产物。
            仓库只保留源码、manifest 契约与 fixture；验收会自己生成它们。
          </p>
        </Callout>
      </Section>
    </>
  )
}
