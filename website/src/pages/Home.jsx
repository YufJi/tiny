import React from 'react'
import { Callout, Card, Cards, CodeBlock, Flow, Section } from '../components/ui'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell">
          <p className="eyebrow">glass-easel runtime · protocol v1</p>
          <h1>把小程序源码<br /><span className="gradient">编译成双线程运行时</span></h1>
          <p className="lede">
            Tiny 是一个基于 glass-easel 的小程序引擎实现。编译器产出 manifest 与线程产物，
            runtime 用 service / render 双 iframe 运行小程序，bridge 负责版本化消息，devtool 负责观察与控制。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#/internals">看架构分层</a>
            <a className="button ghost" href="#/testing">看验收体系</a>
            <a className="button ghost" href="https://github.com/YufJi/tiny">GitHub 仓库 ↗</a>
          </div>
          <ul className="hero-stats">
            <li><strong>6</strong><span>CORE PACKAGES</span></li>
            <li><strong>9</strong><span>WORKSPACE PACKAGES</span></li>
            <li><strong>92</strong><span>UNIT TESTS</span></li>
            <li><strong>36</strong><span>BROWSER STEPS</span></li>
          </ul>
        </div>
      </section>

      <Section
        kicker="Architecture at a glance"
        title="一张图看懂主链路"
        intro="源码只经过一次编译，之后所有宿主都消费同一份 manifest 和线程产物。"
      >
        <Flow nodes={[
          { step: '01 · SOURCE', title: '小程序源码', detail: 'app.json · WXML · WXSS · JS/TS', accent: true },
          { step: '02 · COMPILER', title: 'tools/cli', detail: 'templates · service · styles' },
          { step: '03 · CONTRACT', title: 'manifest + artifacts', detail: '@tiny/manifest · schema v1' },
          { step: '04 · RUNTIME', title: '双线程 host', detail: 'service iframe · render iframe', accent: true },
          { step: '05 · OPTIONAL', title: 'apps/devtool', detail: 'controls · diagnostics · tree' },
        ]} />
      </Section>

      <Section
        kicker="Workspace layers"
        title="按职责分层，依赖只向内"
        intro="核心包不依赖工具、应用或测试；工具、应用和测试都只消费核心契约。"
        link={['展开依赖关系 →', '#/internals']}
      >
        <Cards>
          <Card tag="packages/" title="核心引擎">
            <p>可被 runtime、工具和应用共同复用的库。</p>
            <ul>
              <li><code>manifest</code> · 产物契约</li>
              <li><code>runtime</code> · 双线程与适配器</li>
              <li><code>bridge</code> · 版本化协议</li>
              <li><code>components</code> · 内置组件</li>
              <li><code>template-compiler</code> / <code>stylesheet-compiler</code></li>
            </ul>
          </Card>
          <Card tag="tools/" tone="violet" title="编译工具">
            <p>开发者使用的构建工具，把小程序源码变成 glass-easel 可消费的产物。</p>
            <ul>
              <li>扫描 pages / components / subPackages</li>
              <li>WXML → ProcGen，WXSS → scoped CSS</li>
              <li>service 入口打包与 manifest 生成</li>
            </ul>
          </Card>
          <Card tag="apps/" tone="violet" title="调试应用">
            <p>面向人的运行形态，而不是核心库。</p>
            <ul>
              <li><code>devtool</code> · React 面板</li>
              <li>多应用切换、页面栈、诊断</li>
              <li>元素树、导航、Reload / Terminate</li>
            </ul>
          </Card>
          <Card tag="tests/" title="测试与 fixtures">
            <p>浏览器测试宿主与完整测试小程序，不注册为 workspace 包。</p>
            <ul>
              <li><code>host</code> · 无 UI 单应用宿主</li>
              <li><code>apps/demo</code> · P0 demo</li>
              <li><code>apps/mini</code> · 完整示例</li>
              <li><code>apps/todo</code> · Taro 3 产物</li>
            </ul>
          </Card>
        </Cards>
      </Section>

      <Section
        kicker="Runtime skeleton"
        title="两个线程，一条桥"
        intro="service 拥有逻辑和 API，render 拥有 glass-easel 组件树；host 只做编排与转发。"
      >
        <div className="split">
          <Card tag="service thread" title="逻辑与 API">
            <ul>
              <li>App / Page / Component 注册与生命周期</li>
              <li>页面栈、路由、setData patch</li>
              <li>wx API host、storage、系统信息</li>
              <li>canvas 离屏绘制与帧快照</li>
              <li>动画数据生成 CSS transform</li>
            </ul>
          </Card>
          <Card tag="render thread" tone="violet" title="组件树与 DOM">
            <ul>
              <li>glass-easel 组件定义与 DOM backend</li>
              <li>页面挂载、样式作用域、tag 隔离</li>
              <li>事件派发、dataset、元素树导出</li>
              <li>内置组件 AOT 模板（无运行时 WXML 解析）</li>
              <li>canvas 帧绘制到可见页面</li>
            </ul>
          </Card>
        </div>
        <Callout title="协议是显式边界">
          <p>消息 envelope 带 version、kind、domain、source/target、pageId 和 replyTo；payload 必须 JSON-safe。transport 可以替换为 MessagePort 或内存通道。</p>
        </Callout>
      </Section>

      <Section
        kicker="What is aligned"
        title="已经闭环的能力"
        intro="这些不是路线图，是当前自动化验收覆盖的行为。"
        link={['看验收矩阵 →', '#/testing']}
      >
        <Cards className="three">
          <Card title="真实示例 app"><p>todos、add-todo、ECharts bar 页、子包页面、组件插槽与自定义组件。</p></Card>
          <Card title="Taro 3 兼容"><p>webpackJsonp、外部 WXS、递归模板、循环 usingComponents、页面生命周期方法都能运行。</p></Card>
          <Card title="样式作用域"><p>class 与 tag 选择器都按页面/组件隔离；组件内部 WXSS 不再泄漏到全局。</p></Card>
          <Card title="Canvas 镜像"><p>service 侧绘制、50ms 节流快照、render 侧 drawImage；ECharts 页面能看到真实图表。</p></Card>
          <Card title="内置组件 AOT"><p>构建期把 18 个内置组件模板编译成 ProcGen，启动时只选择模板。</p></Card>
          <Card title="可观测性"><p>结构化诊断贯穿 service/render/host，bootstrap、page-ready 失败都带 stack。</p></Card>
        </Cards>
      </Section>

      <Section kicker="Quick start" title="从零跑起来" intro="需要 Node.js 22+ 和 pnpm 9（仓库已声明 packageManager）。">
        <div className="split">
          <div>
            <CodeBlock>{`# 安装依赖
pnpm install

# 完整验收：构建、单测、四段浏览器流程
pnpm accept:glass-easel

# 本地起测试宿主
pnpm dev:glass-easel

# 调试器
pnpm dev:devtool`}</CodeBlock>
            <div className="hero-actions">
              <a className="button primary" href="https://github.com/YufJi/tiny">打开仓库</a>
              <a className="button ghost" href="#/testing">验收说明</a>
            </div>
          </div>
          <div className="stack">
            <Card tag="current status" title="能跑示例，不是完整微信兼容">
              <p>核心链路和 Taro React 产物已对齐；API 面、组件语义、tabBar/下拉刷新、样式隔离模式仍在补齐。</p>
              <div className="pill-row">
                <span className="pill good">core chain ready</span>
                <span className="pill good">taro 3 react</span>
                <span className="pill warn">api surface narrow</span>
                <span className="pill warn">semantics partial</span>
              </div>
            </Card>
            <Card title="下一步">
              <p>扩 API host、补常用组件语义、补齐页面能力，再建立启动/渲染性能基线。</p>
              <p style={{ marginTop: 10 }}><a href="#/status">查看完整现状与路线 →</a></p>
            </Card>
          </div>
        </div>
      </Section>
    </>
  )
}
