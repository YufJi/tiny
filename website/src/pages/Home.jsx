import React from 'react'
import { Callout, Card, Cards, CodeBlock, Flow, Section } from '../components/ui'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell">
          <p className="eyebrow">engine internals · protocol v1</p>
          <h1>把小程序引擎<br /><span className="gradient">拆到每一条线程和契约</span></h1>
          <p className="lede">
            Tiny 把引擎拆成可替换的三层：host-independent 的 runtime 内核、版本化的 Bridge 协议、以及独立的宿主适配层。
            编译器产出 manifest、ProcGen 模板、作用域样式与 service bundle；<code>@tiny/host-browser</code> 用 iframe 与 MessagePort 拉起双线程；
            naming、组件语义、canvas、资源解析都能按宿主注入。这份站点逐层拆开它们的实现边界。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#/architecture">从架构总览开始</a>
            <a className="button ghost" href="#/devtool">在线调试器</a>
            <a className="button ghost" href="#/hosts">看宿主支持</a>
            <a className="button ghost" href="#/protocol">读 Bridge 协议</a>
            <a className="button ghost" href="https://github.com/YufJi/tiny">GitHub 仓库 ↗</a>
          </div>
          <ul className="hero-stats">
            <li><strong>2</strong><span>RUNTIME THREADS</span></li>
            <li><strong>10</strong><span>WORKSPACE PACKAGES</span></li>
            <li><strong>148</strong><span>UNIT TESTS</span></li>
            <li><strong>46</strong><span>BROWSER STEPS</span></li>
          </ul>
        </div>
      </section>

      <Section
        kicker="Engine at a glance"
        title="一份产物，三种角色，两条通道"
        intro="编译器只生产契约，宿主只负责环境与编排，运行时只消费契约。三者之间没有隐式全局。"
      >
        <Flow nodes={[
          { step: '01 · SOURCE', title: '小程序源码', detail: 'app.json · WXML · WXSS · JS/TS · WXS', accent: true },
          { step: '02 · COMPILER', title: 'tools/cli', detail: 'ProcGen · scoped CSS · service bundle' },
          { step: '03 · CONTRACT', title: 'manifest.json', detail: '@tiny/manifest · schemaVersion 1' },
          { step: '04 · HOST', title: '宿主编排', detail: 'iframe / worker / native · 两条 transport', accent: true },
          { step: '05 · RUNTIME', title: 'service + render', detail: '应用语义 · glass-easel 组件树' },
          { step: '06 · OBSERVE', title: 'devtool', detail: '控制面 · 诊断 · 元素树' },
        ]} />
        <Callout title="关键分界">
          <p>
            glass-easel 只提供组件定义、模板、数据绑定、事件、生命周期和可插拔 backend；
            App 生命周期、页面栈、路由、<code>wx</code> API、跨线程 setData、组件语义与诊断由 Tiny runtime 补齐；
            iframe、MessagePort、DOM canvas、资源 URL 和调试器 UI 则全部落在 <code>@tiny/host-browser</code>。
          </p>
        </Callout>
      </Section>

      <Section
        kicker="Four contracts"
        title="四份契约撑起整个引擎"
        intro="改任何一层之前，先确认你改的是契约、实现，还是宿主适配。"
      >
        <Cards>
          <Card tag="packages/manifest" title="产物契约">
            <p>编译器、runtime、宿主和调试器共同消费的类型：manifest、页面/组件/样式/资源 artifact 与结构化诊断。</p>
            <p><a href="#/compiler">编译流水线与 manifest →</a></p>
          </Card>
          <Card tag="packages/bridge" tone="violet" title="消息契约">
            <p>版本化 envelope、帧、传输适配、call/reply 关联、事件批处理、超时与 JSON-safe 校验。</p>
            <p><a href="#/protocol">Bridge 协议 v1 →</a></p>
          </Card>
          <Card tag="packages/runtime" title="启动契约">
            <p><code>bootServiceThread</code> / <code>bootRenderThread</code> 接收 transport、manifest 与可注入的 canvas / asset / mount / builtinComponents 钩子；runtime 内核本身不含浏览器全局。</p>
            <p><a href="#/hosts">宿主支持与启动时序 →</a></p>
          </Card>
          <Card tag="hosts/browser" tone="violet" title="宿主注入面">
            <p><code>apiHandlers</code> 处理跨线程 API，<code>apiExtensions</code> 注入设备事实；canvas 与资源 URL 由宿主适配器提供，内置组件由 <code>@tiny/host-web-components</code> 注入。</p>
            <p><a href="#/hosts">宿主注入面 →</a></p>
          </Card>
        </Cards>
      </Section>

      <Section
        kicker="Read the internals"
        title="按层深入"
        intro="每个页面都从真实源码路径出发，而不是概念图。"
      >
        <Cards className="three">
          <Card tag="architecture" title="系统边界与状态所有权">
            <p>五个边界、真实依赖边、启动时序、中继矩阵，以及 glass-easel 与 Tiny 的职责切分。</p>
            <p><a href="#/architecture">进入架构总览 →</a></p>
          </Card>
          <Card tag="compiler" title="源码到 manifest">
            <p>入口发现、WXML → ProcGen、WXSS 作用域、TS 转译、service bundle、产物树与诊断。</p>
            <p><a href="#/compiler">进入编译流水线 →</a></p>
          </Card>
          <Card tag="runtime" title="双线程内核">
            <p>注册表、页面栈、naming、behaviors / observers / relations、setData、事件、组件树与 host 注入的 canvas 适配。</p>
            <p><a href="#/runtime">进入运行时内核 →</a></p>
          </Card>
          <Card tag="protocol" title="显式的跨线程语言">
            <p>envelope 字段、handshake、帧与批处理、错误码、JSON-safe 规则和完整消息目录。</p>
            <p><a href="#/protocol">进入 Bridge 协议 →</a></p>
          </Card>
          <Card tag="hosts" title="宿主如何接引擎">
            <p>runtime 纯度、host-browser 适配器、canvas / asset 注入、测试宿主与调试器，以及新宿主检查清单。</p>
            <p><a href="#/hosts">进入宿主支持 →</a></p>
          </Card>
          <Card tag="testing" title="证据而不是声明">
            <p>148 个单测、46 个浏览器步骤、五段真实小程序流程，以及仍未覆盖的边界。</p>
            <p><a href="#/testing">进入验证体系 →</a></p>
          </Card>
        </Cards>
      </Section>

      <Section
        kicker="Live devtool"
        title="在线跑一遍调试器"
        intro="不用克隆仓库：内嵌版本加载 tests/apps 下全部测试应用的真实编译产物，双线程、Console 和 Elements 都在。"
      >
        <div className="split">
          <Card tag="online" title="Tiny Runtime Debugger">
            <p>默认应用列表、最近 3 个应用保活、页面导航、前后台、Reload/Close app、诊断流与元素树。</p>
            <p><a className="button primary" href="#/devtool">打开在线调试器</a></p>
          </Card>
          <Card tag="build-time" title="随站点构建，而不是外链">
            <p>构建时编译 tests/apps 下全部 fixture、打包 devtool，Vite 把产物复制到 <code>dist/devtool/</code>；页面用同源 iframe 嵌入。</p>
            <p><a href="#/devtool">查看接入方式 →</a></p>
          </Card>
        </div>
      </Section>

      <Section
        kicker="Runtime skeleton"
        title="service 拥有状态，render 拥有树"
        intro="两个 iframe 各自启动，只有 host 持有两条通道；业务状态永远在 service。"
      >
        <div className="split">
          <Card tag="service thread" title="应用语义与平台 API">
            <ul>
              <li>App / Page / Component / Behavior 注册，按 manifest 顺序绑定路径</li>
              <li>页面栈、路由、onLoad → onShow → onReady</li>
              <li>Behaviors、observers、relations、selectComponent 组件语义</li>
              <li><code>setData</code> 路径补丁、事件处理函数调用</li>
              <li>可配置 naming：API 全局、别名、diagnostics</li>
              <li>canvas 通过注入的适配器离屏绘制</li>
            </ul>
          </Card>
          <Card tag="render thread" tone="violet" title="glass-easel 组件树">
            <ul>
              <li>ComponentSpace + StyleScopeManager</li>
              <li>23 个内置组件，AOT 模板 + 共享 behaviors</li>
              <li>styleIsolation / externalClasses / page scope</li>
              <li>事件序列化、dataset、target / currentTarget</li>
              <li>页面 mount / unmount 与元素树导出</li>
              <li>canvas 测量与帧绘制由宿主注入</li>
            </ul>
          </Card>
        </div>
        <Callout title="宿主不解释业务">
          <p>
            host 提供环境：transport、backend 与挂载点、宿主 API、canvas 适配、资源 URL。它不判断页面生命周期，也不直接操作 glass-easel 组件；
            service / render 内核本身不引用 <code>window</code>、<code>document</code> 或 <code>iframe</code>。
          </p>
        </Callout>
      </Section>

      <Section
        kicker="Host matrix"
        title="同一内核，不同宿主形态"
        intro="浏览器 standalone、无 UI 测试宿主、调试器宿主共享 createTinyRuntime；单测甚至不需要 iframe。"
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>宿主</th><th>transport</th><th>render backend</th><th>控制面</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><code>@tiny/host-browser</code></td>
                <td>MessageChannel / iframe</td>
                <td>DOM canvas + devtool overlay</td>
                <td><code>createStandaloneDualThreadHost</code>、<code>DevtoolRuntimeClient</code></td>
              </tr>
              <tr>
                <td><code>tests/host</code></td>
                <td>两个 MessageChannel</td>
                <td><code>CurrentWindowBackendContext</code></td>
                <td>URL <code>?path=</code>、<code>window.__tinyRuntime</code></td>
              </tr>
              <tr>
                <td><code>apps/devtool</code></td>
                <td>两个 MessageChannel</td>
                <td><code>CurrentWindowBackendContext</code></td>
                <td><code>DevtoolRuntimeClient</code> + React/Redux</td>
              </tr>
              <tr>
                <td>runtime 单测</td>
                <td><code>createInMemoryTransportPair()</code></td>
                <td><code>EmptyBackendContext</code></td>
                <td>直接持有 service / render 连接</td>
              </tr>
              <tr>
                <td>原生宿主（未实现）</td>
                <td>需实现 <code>Transport</code></td>
                <td>需实现 <code>GeneralBackendContext</code></td>
                <td>复用 host API registry + 控制消息</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout title="新宿主的入口在 createTinyRuntime">
          <p>
            只要提供 service / render 两条 transport、manifest 和初始路径，就能启动同一个引擎。
            <code>@tiny/host-browser</code> 的 <code>createStandaloneDualThreadHost</code> 只是浏览器形态的适配器，不是引擎本身。
            <a href="#/hosts">看完整检查清单 →</a>
          </p>
        </Callout>
      </Section>

      <Section
        kicker="Evidence"
        title="这些能力已经有自动化证据"
        intro="不是路线图：下面的行为都在 46 个浏览器步骤里被真实点击、输入和断言过。"
      >
        <Cards className="three">
          <Card title="真实示例 app"><p>todos、add-todo、组件语义页、ECharts bar、子包页面、组件插槽、import/include/template、animation。</p></Card>
          <Card title="Taro 3 产物"><p>webpackJsonp、外部 WXS、递归模板、循环 usingComponents、Enter 提交、Redux todos。</p></Card>
          <Card title="微信官方示例子集"><p>基础组件索引、button 示例页、storage API 页；不包含 Skyline 与原生依赖页面。</p></Card>
          <Card title="组件语义"><p>Behavior 合并、observers、property observer、relations、selectComponent、styleIsolation 与 externalClasses。</p></Card>
          <Card title="可替换宿主"><p>runtime 纯度检查；host-browser 注入 iframe、MessagePort、canvas 与资源 URL；在线调试器随站点发布。</p></Card>
          <Card title="Canvas 镜像"><p>宿主 canvas 适配器：service 侧 2D 绘制、50ms 节流 PNG 帧、render 侧 drawImage；ECharts 非空像素断言。</p></Card>
          <Card title="Naming"><p>默认 wx- 命名，也可以通过 tiny.config.json 切到 tiny- 或自定义 API 全局与别名。</p></Card>
          <Card title="可观测性"><p>编译、transport、service、render、host 五类诊断；元素树从 DOM 或逻辑树导出。</p></Card>
        </Cards>
        <Callout title="边界同样重要">
          <p>
            当前证据覆盖核心链路、组件语义、naming、样式隔离和五个真实 fixture。API 广度、页面能力、generics、
            native 宿主与性能基线仍未闭环，<a href="#/status">路线页逐项列出</a>。
          </p>
        </Callout>
      </Section>

      <Section kicker="Quick start" title="从源码跑到调试器" intro="Node.js ≥ 22、pnpm 9；验收需要可用的 Chromium。">
        <div className="split">
          <div>
            <CodeBlock>{`# 安装并跑完整闸门
pnpm install
pnpm accept:glass-easel

# 测试宿主（demo -> tests/host/generated）
pnpm dev:glass-easel

# 调试器（自动预览全部 tests/apps）
pnpm dev:devtool

# 站点（先打包内嵌 devtool，再构建网站）
pnpm site:dev
pnpm site:check

# 核心 runtime 不得依赖浏览器全局
pnpm check:runtime-purity`}</CodeBlock>
            <div className="hero-actions">
              <a className="button primary" href="https://github.com/YufJi/tiny">打开仓库</a>
              <a className="button ghost" href="#/testing">验收矩阵</a>
            </div>
          </div>
          <div className="stack">
            <Card tag="current status" title="核心链路与组件语义可用，兼容面仍在扩张">
              <p>双线程、编译、协议、naming、组件语义、样式隔离和调试器已闭环；宿主 API、页面能力与原生宿主仍是主要缺口。</p>
              <div className="pill-row">
                <span className="pill good">core chain ready</span>
                <span className="pill good">host-independent</span>
                <span className="pill good">component semantics</span>
                <span className="pill good">taro 3 react</span>
                <span className="pill warn">api surface narrow</span>
                <span className="pill warn">browser host only</span>
              </div>
            </Card>
            <Card title="下一步">
              <p>先补宿主 API 与常用组件，再做页面能力、generics/definitionFilter、canvas 交互和性能基线。</p>
              <p><a href="#/status">查看完整现状与路线 →</a></p>
            </Card>
          </div>
        </div>
      </Section>
    </>
  )
}
