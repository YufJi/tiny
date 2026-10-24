import React from 'react'
import { Callout, Card, Cards, CodeBlock, Flow, PageHero, Section, Table } from '../components/ui'

export default function Internals() {
  return (
    <>
      <PageHero
        eyebrow="Internals"
        title="内部分层与运行链路"
        lede="从源码扫描到 manifest，再到 service / render 双线程；包边界、协议边界和样式边界都在这里。"
        stats={[['6', 'core packages'], ['1', 'compiler tool'], ['1', 'debugger app'], ['1', 'browser host']]}
      />

      <Section
        kicker="Dependency direction"
        title="依赖只向内"
        intro="核心库不依赖工具/应用/测试；工具和应用只消费核心契约。"
      >
        <Flow nodes={[
          { step: 'CORE', title: '@tiny/manifest', detail: 'artifact contract', accent: true },
          { step: 'CORE', title: 'runtime', detail: 'bridge · components · manifest' },
          { step: 'TOOL', title: 'tools/cli', detail: 'template · stylesheet · manifest' },
          { step: 'APP', title: 'apps/devtool', detail: 'runtime · DevtoolRuntimeClient' },
        ]} />
        <Cards>
          <Card tag="packages/manifest" title="共享契约">
            <p>只有类型，没有 compiler / runtime 逻辑。Manifest、PageArtifact、ComponentArtifact、Diagnostic 都在这里，避免 runtime 为了类型依赖 cli。</p>
          </Card>
          <Card tag="packages/runtime" title="消费契约">
            <p>service / render 线程、glass-easel adapter、standalone host、canvas bridge、DevtoolRuntimeClient。</p>
          </Card>
          <Card tag="tools/cli" tone="violet" title="生产契约">
            <p>扫描源码并生成 manifest 与线程产物；通过 library API 被测试脚本和 devtool watcher 调用。</p>
          </Card>
          <Card tag="apps/devtool" tone="violet" title="观察与控制">
            <p>React 面板通过 DevtoolRuntimeClient 启动、导航、Reload、Terminate，并投影诊断与元素树。</p>
          </Card>
        </Cards>
      </Section>

      <Section
        kicker="Compiler pipeline"
        title="一次编译，产出 manifest + 线程产物"
        intro="tools/cli 是唯一的产物生产者；所有宿主只读 manifest。"
      >
        <Cards>
          <Card tag="01 · scan" title="源码发现">
            <p>读取 app.json，解析 pages、subPackages、usingComponents；扫描 WXML/WXSS/JS/TS/WXS 与静态资源。</p>
          </Card>
          <Card tag="02 · template" title="模板编译">
            <p>WXML → ProcGen；处理 import / include / template / slot / wx:for / wx:if。外部 WXS 同时按带/不带扩展名注册。</p>
          </Card>
          <Card tag="03 · style" title="样式编译">
            <p>rpx → vw；class 作用域；tag 选择器改写成 scoped marker class；生成 source map。</p>
          </Card>
          <Card tag="04 · bundle" title="脚本与服务入口">
            <p>TS → JS，重写无扩展名 ESM specifier，esbuild 打包 service；支持 ECharts 这类 CJS/UMD 依赖。</p>
          </Card>
          <Card tag="05 · manifest" title="产物索引">
            <p>输出 <code>manifest.json</code>（schemaVersion 1）、<code>service.js</code>、<code>render.js</code>、<code>templates.js</code>、styles 和 assets。</p>
          </Card>
          <Card tag="06 · assets" title="资源内联">
            <p>本地图片（相对/绝对路径）在编译期内联为 data URI，静态宿主无需额外资源目录。</p>
          </Card>
        </Cards>
      </Section>

      <Section
        kicker="Threads"
        title="service 与 render 的职责边界"
        intro="两个 iframe 各有 entry；host 只负责创建、握手、转发与暴露控制面。"
      >
        <Table
          head={['线程', '入口', '主要职责']}
          rows={[
            [<code>service</code>, <code>bootServiceThread</code>, 'App/Page/Component 注册、生命周期、页面栈、路由、setData、wx API、storage、animation、canvas 绘制。'],
            [<code>render</code>, <code>bootRenderThread</code>, 'glass-easel DOM backend、组件定义、样式注册、事件派发、元素树导出、内置组件、canvas 帧绘制。'],
            [<code>host</code>, <code>createStandaloneDualThreadHost</code>, '创建 iframe、MessageChannel 握手、BridgeConnection、页面 bootstrap、导航/API 转发。'],
            [<code>devtool</code>, <code>DevtoolRuntimeClient</code>, '在 host 之上提供 launch/reload/terminate、foreground/background、navigate/back、inspectTree 与状态投影。'],
          ]}
        />

        <div className="split">
          <Card title="页面生命周期">
            <ul>
              <li><code>onLoad</code> → <code>onShow</code> → <code>onReady</code></li>
              <li><code>navigateTo</code> 隐藏当前页、创建新页</li>
              <li><code>navigateBack</code> 按 delta 卸载页面</li>
              <li>组件生命周期 created / attached / ready / detached</li>
              <li>pageLifetimes 的 show/hide 由页面栈控制</li>
            </ul>
          </Card>
          <Card title="组件模型">
            <ul>
              <li>usingComponents 逐层解析，环检测避免递归注册</li>
              <li>properties / data / observers / methods</li>
              <li>externalClasses 与 slotted content 转发</li>
              <li>组件方法挂到实例上，支持 <code>this.method()</code></li>
              <li>生命周期方法同时挂到页面实例，兼容 Taro</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        kicker="Bridge protocol v1"
        title="显式的跨线程契约"
        intro="协议只做传输、校验、关联、超时和批处理，不定义 API 语义。"
      >
        <div className="split">
          <CodeBlock>{`{
  protocolVersion: 1,
  messageId: "msg-...",
  kind: "call" | "reply" | "event" | "control",
  domain: "runtime" | "page" | "data" | "event"
        | "api" | "diagnostic" | "canvas",
  method: "navigate.to",
  source: "service",
  target: "host",
  payload: { ... },   // JSON-safe
  pageId?: "page-1",
  replyTo?: "msg-...",
  timestamp: 1710000000000
}`}</CodeBlock>
          <div className="stack">
            <Card title="传输与批处理">
              <p>MessagePort 或内存 transport；同一 page + source 的消息保序，flush 时合成 frame。</p>
            </Card>
            <Card title="错误">
              <p>ProtocolError 携带 code / message / details；超时、非法 envelope、JSON-safe 校验失败都会结构化返回。</p>
            </Card>
            <Card title="诊断">
              <p>diagnostic.log / warn / error / state 统一走 bridge，host 端归一化为 RuntimeDiagnostic，devtool 直接消费。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        kicker="Styles and components"
        title="样式作用域与内置组件"
      >
        <Cards>
          <Card tag="style scope" title="class 隔离">
            <p>编译期给 class 加页面/组件 scope 前缀；运行时注册顺序保证组件定义拿到 scope id。</p>
          </Card>
          <Card tag="tag marker" title="tag 选择器隔离">
            <p>模板元素注入 <code>wx-tag-&lt;tag&gt;</code>，WXSS 的 <code>button</code> 改写成 <code>.scope--wx-tag-button</code>，不会跨页面/组件泄漏。</p>
          </Card>
          <Card tag="AOT" title="内置组件">
            <p>18 个组件各自拥有 <code>template.wxml</code> + <code>index.ts</code>；构建期预编译为 ProcGen，运行时不解析 WXML。</p>
          </Card>
          <Card tag="canvas" title="离屏绘制镜像">
            <p>service 侧 canvas 2D 调用被节流快照为 PNG；通过 <code>canvas.frame</code> 到 render 绘制到 <code>canvas[canvas-id]</code>。</p>
          </Card>
        </Cards>
        <Callout title="继续阅读">
          <p><a href="#/testing">测试与兼容</a>：测试宿主、devtool、四段验收和 Taro 3 兼容点。<br />
          <a href="#/status">现状与路线</a>：成熟度、主要缺口和下一阶段优先级。</p>
        </Callout>
      </Section>
    </>
  )
}
