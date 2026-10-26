import React from 'react'
import { Callout, Card, Cards, CodeBlock, Flow, Section } from '../components/ui'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell">
          <p className="eyebrow">Tiny 引擎内部 · Bridge v1</p>
          <h1>从编译器到宿主<br /><span className="gradient">看清小程序引擎的每一层</span></h1>
          <p className="lede">
            Tiny 是一个基于 glass-easel 的小程序引擎。它把小程序源码编译成 manifest 和线程产物，
            默认用 service、render 两个 iframe 跑起一个小程序，再由 Bridge 协议负责跨线程通信；也可以让每个页面各用一个 render iframe。
            浏览器相关能力单独放在宿主包里，内核不依赖 window、document 或 iframe。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#/architecture">先看整体架构</a>
            <a className="button ghost" href="#/devtool">打开在线调试器</a>
            <a className="button ghost" href="#/hosts">了解宿主适配</a>
            <a className="button ghost" href="#/protocol">阅读 Bridge 协议</a>
            <a className="button ghost" href="https://github.com/YufJi/tiny">GitHub 仓库 ↗</a>
          </div>
          <ul className="hero-stats">
            <li><strong>2</strong><span>运行时线程</span></li>
            <li><strong>10</strong><span>工作区包</span></li>
            <li><strong>168</strong><span>单元测试</span></li>
            <li><strong>47</strong><span>浏览器步骤</span></li>
          </ul>
        </div>
      </section>

      <Section
        kicker="整体流程"
        title="一次编译，产出运行所需的全部产物"
        intro="编译器只负责生成产物，宿主负责提供运行环境，运行时负责执行小程序语义。三者通过 manifest 和 Bridge 协议衔接，不共享隐式全局状态。"
      >
        <Flow nodes={[
          { step: '01 · 源码', title: '小程序源码', detail: 'app.json · WXML · WXSS · JS/TS · WXS', accent: true },
          { step: '02 · 编译', title: 'tools/cli', detail: 'ProcGen · 作用域 CSS · service bundle' },
          { step: '03 · 产物', title: 'manifest.json', detail: '@tiny/manifest · schemaVersion 1' },
          { step: '04 · 启动', title: '宿主装配', detail: 'iframe / worker / native · service + render', accent: true },
          { step: '05 · 运行', title: 'service + render', detail: '应用语义 · glass-easel 组件树' },
          { step: '06 · 观察', title: 'devtool', detail: '控制 · 诊断 · 元素树' },
        ]} />
        <Callout title="各层分工">
          <p>
            glass-easel 提供组件定义、模板、数据绑定、事件和生命周期；App、页面栈、路由、
            <code>wx</code> API、setData、组件语义和诊断由 Tiny 自己实现。
            iframe、MessagePort、DOM canvas、资源 URL 和调试器界面则属于宿主适配层。
          </p>
        </Callout>
      </Section>

      <Section
        kicker="接口约定"
        title="四类接口，连接编译、运行和调试"
        intro="改动之前，先分清改的是产物格式、消息协议、线程启动参数，还是宿主注入的能力。"
      >
        <Cards>
          <Card tag="packages/manifest" title="产物格式">
            <p>编译器、运行时、宿主和调试器共用 manifest 及相关类型，包括页面、组件、样式、资源和编译诊断。</p>
            <p><a href="#/compiler">看编译流程和 manifest →</a></p>
          </Card>
          <Card tag="packages/bridge" tone="violet" title="消息协议">
            <p>Bridge 定义消息信封、帧、调用与回复、事件批处理、超时和 JSON 可序列化校验。</p>
            <p><a href="#/protocol">看 Bridge v1 →</a></p>
          </Card>
          <Card tag="packages/runtime" title="线程启动参数">
            <p><code>bootServiceThread</code> / <code>bootRenderThread</code> 接收 transport、manifest，以及 canvas、资源解析、挂载点和内置组件等可选注入。内核本身不依赖浏览器。</p>
            <p><a href="#/hosts">看宿主如何启动线程 →</a></p>
          </Card>
          <Card tag="hosts/browser" tone="violet" title="宿主注入的能力">
            <p><code>apiHandlers</code> 处理需要跨线程的 API，<code>apiExtensions</code> 补充设备信息；canvas、资源 URL 和内置组件分别由宿主提供。</p>
            <p><a href="#/hosts">看宿主注入方式 →</a></p>
          </Card>
        </Cards>
      </Section>

      <Section
        kicker="按模块阅读"
        title="想改哪一层，就从哪一页开始"
        intro="每一页都从实际代码出发，说明这一层做什么、和相邻层怎么衔接。"
      >
        <Cards className="three">
          <Card tag="architecture" title="系统分层与状态归属">
            <p>编译器、运行时、Bridge、宿主和 devtool 各自负责什么，以及一次启动如何串起来。</p>
            <p><a href="#/architecture">进入架构总览 →</a></p>
          </Card>
          <Card tag="compiler" title="从源码到 manifest">
            <p>入口发现、命名配置、WXML 到 ProcGen、WXSS 作用域、TS 转译、service bundle 和产物目录。</p>
            <p><a href="#/compiler">进入编译流程 →</a></p>
          </Card>
          <Card tag="runtime" title="双线程如何协作">
            <p>页面栈、命名、setData、observer、事件、组件语义、渲染适配、内置组件和按需注入的 canvas。</p>
            <p><a href="#/runtime">进入运行时内核 →</a></p>
          </Card>
          <Card tag="protocol" title="跨线程消息怎么走">
            <p>消息格式、握手、传输、批处理、错误码、JSON 校验和完整消息列表。</p>
            <p><a href="#/protocol">进入 Bridge 协议 →</a></p>
          </Card>
          <Card tag="hosts" title="如何接入运行环境">
            <p>内核约束、host-browser、内置组件宿主、canvas 与资源注入、测试宿主和调试器，以及新宿主的接入步骤。</p>
            <p><a href="#/hosts">进入宿主适配 →</a></p>
          </Card>
          <Card tag="testing" title="靠真实小程序验证">
            <p>168 个单元测试、47 个浏览器步骤、五个测试小程序，以及目前还没有覆盖的部分。</p>
            <p><a href="#/testing">进入测试与验收 →</a></p>
          </Card>
        </Cards>
      </Section>

      <Section
        kicker="在线调试器"
        title="在浏览器里试用调试器"
        intro="不用克隆仓库。页面里嵌的是 devtool 的生产构建，加载 tests/apps 下真实编译产物，Console 和 Elements 都来自当前会话。"
      >
        <div className="split">
          <Card tag="在线" title="Tiny Runtime Debugger">
            <p>默认应用列表、最近 3 个应用保活、页面导航、前后台切换、Reload/Close app、诊断和元素树都可以直接操作。</p>
            <p><a className="button primary" href="#/devtool">打开在线调试器</a></p>
          </Card>
          <Card tag="构建时生成" title="跟站点一起发布">
            <p>构建站点时会先编译 tests/apps 下的全部 fixture，再打包 devtool。Vite 把产物复制到 <code>dist/devtool/</code>，页面通过同源 iframe 嵌入。</p>
            <p><a href="#/devtool">查看接入方式 →</a></p>
          </Card>
        </div>
      </Section>

      <Section
        kicker="运行时结构"
        title="service 管状态，render 管组件树"
        intro="service 和 render 各自启动，host 分别持有它们的连接；页面和组件状态始终在 service。"
      >
        <div className="split">
          <Card tag="service 线程" title="小程序逻辑和平台 API">
            <ul>
              <li>App / Page / Component / Behavior 注册，按 manifest 顺序绑定路径</li>
              <li>页面栈、路由和 onLoad → onShow → onReady</li>
              <li>Behaviors、observers、relations、selectComponent 等组件语义</li>
              <li><code>setData</code> 路径更新和事件处理函数调用</li>
              <li>可配置的命名空间：API 全局、别名和诊断名称</li>
              <li>通过注入的适配器使用 canvas</li>
            </ul>
          </Card>
          <Card tag="render 线程" tone="violet" title="glass-easel 组件树和 DOM">
            <ul>
              <li>ComponentSpace + StyleScopeManager</li>
              <li>23 个内置组件，AOT 模板和共享 behaviors</li>
              <li>styleIsolation / externalClasses / 页面作用域</li>
              <li>事件序列化、dataset、target / currentTarget</li>
              <li>页面挂载、卸载和元素树导出</li>
              <li>canvas 测量与帧绘制由宿主注入</li>
            </ul>
          </Card>
        </div>
        <Callout title="宿主只提供环境">
          <p>
            宿主负责 transport、backend、挂载点、宿主 API、canvas 和资源 URL，但不判断页面生命周期，也不直接操作 glass-easel 组件。
            service 和 render 内核都不引用 <code>window</code>、<code>document</code> 或 <code>iframe</code>。
          </p>
        </Callout>
      </Section>

      <Section
        kicker="宿主对比"
        title="同一套内核，可以换不同宿主"
        intro="浏览器宿主、无界面测试宿主和调试器都复用 createTinyRuntime；单元测试甚至不需要 iframe。"
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>宿主</th><th>通信方式</th><th>渲染后端</th><th>控制方式</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><code>@tiny/host-browser</code></td>
                <td>MessageChannel / iframe</td>
                <td>DOM canvas + 调试器覆盖层</td>
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
                <td>需要实现 <code>Transport</code></td>
                <td>需要实现 <code>GeneralBackendContext</code></td>
                <td>复用宿主 API 注册表和控制消息</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout title="新宿主从 createTinyRuntime 接进来">
          <p>
            只要提供 service 和 render 两条 transport、manifest 和初始页面，就能启动同一个引擎。
            <code>@tiny/host-browser</code> 的 <code>createStandaloneDualThreadHost</code> 只是浏览器适配器，不是引擎本身。
            <a href="#/hosts">看完整接入步骤 →</a>
          </p>
        </Callout>
      </Section>

      <Section
        kicker="测试覆盖"
        title="这些能力都有自动化测试"
        intro="下面这些行为都在 47 个浏览器步骤里实际点击、输入和断言过。"
      >
        <Cards className="three">
          <Card title="真实示例小程序"><p>todos、add-todo、组件语义页、ECharts 柱状图、子包页面、组件插槽、import/include/template 和 animation。</p></Card>
          <Card title="Taro 3 产物"><p>webpackJsonp、外部 WXS、递归模板、循环 usingComponents、Enter 提交和 Redux todos。</p></Card>
          <Card title="微信官方示例子集"><p>基础组件索引、button 示例页和 storage API 页；不包含 Skyline 和依赖原生能力的页面。</p></Card>
          <Card title="组件语义"><p>Behavior 合并、observers、property observer、relations、selectComponent、styleIsolation 和 externalClasses。</p></Card>
          <Card title="可替换宿主"><p>内核边界检查；host-browser 注入 iframe、MessagePort、canvas 和资源 URL；在线调试器随站点发布。</p></Card>
          <Card title="Canvas 镜像"><p>宿主 canvas 适配器负责 service 侧 2D 绘制、50ms 节流 PNG 帧和 render 侧 drawImage；ECharts 会检查非空像素。</p></Card>
          <Card title="命名配置"><p>默认使用 wx- 命名，也可以通过 tiny.config.json 改成 tiny- 或自定义 API 全局与别名。</p></Card>
          <Card title="诊断与元素树"><p>编译、transport、service、render、host 五类诊断统一收集；元素树可以从 DOM 或逻辑树导出。</p></Card>
        </Cards>
        <Callout title="也要看清没有覆盖的部分">
          <p>
            当前测试覆盖核心链路、组件语义、命名配置、样式隔离和五个测试小程序。API 覆盖、页面能力、generics、
            原生宿主和性能基线仍未完成，<a href="#/status">现状页会逐项说明</a>。
          </p>
        </Callout>
      </Section>

      <Section kicker="快速开始" title="从源码跑到调试器" intro="需要 Node.js 22+ 和 pnpm 9；跑浏览器验收还需要 Chromium。">
        <div className="split">
          <div>
            <CodeBlock>{`# 安装并跑完整验收
pnpm install
pnpm accept:glass-easel

# 测试宿主（demo -> tests/host/generated）
pnpm dev:glass-easel

# 调试器（自动预览全部 tests/apps）
pnpm dev:devtool

# 站点（先打包内嵌 devtool，再构建网站）
pnpm site:dev
pnpm site:check

# 检查核心 runtime 是否依赖了浏览器 API
pnpm check:runtime-purity`}</CodeBlock>
            <div className="hero-actions">
              <a className="button primary" href="https://github.com/YufJi/tiny">打开仓库</a>
              <a className="button ghost" href="#/testing">查看测试矩阵</a>
            </div>
          </div>
          <div className="stack">
            <Card tag="当前状态" title="核心链路和组件语义已经跑通">
              <p>双线程、编译、协议、命名配置、组件语义、样式隔离和调试器都已跑通；宿主 API、页面能力、原生宿主和性能基线仍是主要缺口。</p>
              <div className="pill-row">
                <span className="pill good">核心链路可用</span>
                <span className="pill good">内核不依赖宿主</span>
                <span className="pill good">组件语义</span>
                <span className="pill good">Taro 3 React</span>
                <span className="pill warn">API 覆盖有限</span>
                <span className="pill warn">仅浏览器宿主</span>
              </div>
            </Card>
            <Card title="接下来">
              <p>先补宿主 API 和常用组件，再完善页面能力、generics/definitionFilter、canvas 交互和性能基线。</p>
              <p><a href="#/status">查看完整现状和计划 →</a></p>
            </Card>
          </div>
        </div>
      </Section>
    </>
  )
}
