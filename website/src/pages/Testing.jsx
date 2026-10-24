import React from 'react'
import { Callout, Card, Cards, CodeBlock, PageHero, Section, Table } from '../components/ui'

export default function Testing() {
  return (
    <>
      <PageHero
        eyebrow="Testing & compatibility"
        title="用真实小程序验收"
        lede="Tiny 的验收不是快照测试：它编译、启动双线程、在真实浏览器里操作页面，并在失败时保存截图。"
        stats={[['92', 'unit tests'], ['36', 'browser steps'], ['4', 'browser flows'], ['4', 'test fixtures']]}
      />

      <Section
        kicker="Two hosts"
        title="测试宿主与调试器，不是同一个东西"
        intro="两者都基于 createStandaloneDualThreadHost，但一个服务于自动化，一个服务于人。"
      >
        <div className="split">
          <Card tag="tests/host" title="无 UI 单应用测试宿主">
            <ul>
              <li>Vite 提供 host / service / render 三个入口</li>
              <li>加载 tests/host/generated 的一份 manifest</li>
              <li>启动双线程，把页面挂到 #app</li>
              <li>暴露 window.__tinyRuntime 给 Playwright</li>
              <li>P0 / mini / Taro 三个阶段用它</li>
            </ul>
          </Card>
          <Card tag="apps/devtool" tone="violet" title="带 UI 的多应用调试器">
            <ul>
              <li>React 面板 + Redux 投影</li>
              <li>应用切换（demo / real）</li>
              <li>页面栈、诊断、元素树</li>
              <li>Navigate / Back / Reload / Terminate</li>
              <li>独立的 debugger 验收阶段</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        kicker="Acceptance gate"
        title="四段浏览器流程"
        intro="pnpm accept:glass-easel 会先构建并跑单测，再依次启动宿主。"
      >
        <Table
          head={['阶段', '应用', '覆盖']}
          rows={[
            ['P0 demo', <code>tests/apps/demo</code>, '14 步：双线程启动、组件渲染、样式作用域、checkbox/slider/switch、导航、storage、canvas 诊断、零 console error。'],
            ['Existing app', <code>tests/apps/mini</code>, '9 步：真实 todos、双 add-button 实例、import/include/template、输入、ECharts bar 页、子包页面、warnings。'],
            ['Taro 3', <code>tests/apps/todo</code>, '6 步：Redux todos 渲染、输入 + Enter 新增、勾选、筛选、Clear completed、零错误。'],
            ['Debugger', <code>apps/devtool</code>, '7 步：boot、状态投影、渲染、导航/返回、应用切换、Reload/Terminate、零错误。'],
          ]}
        />
        <Callout title="36 步的边界">
          <p>这些步骤覆盖核心链路和真实交互，但不等于完整微信语义。API 广度、组件属性、tabBar 和页面高级事件仍需单独补齐。</p>
        </Callout>
      </Section>

      <Section
        kicker="Unit tests"
        title="按包拆分的 Vitest"
        intro="没有全局 test runner；每个包独立运行，避免隐式耦合。"
      >
        <Table
          head={['Package', 'Tests', '重点']}
          rows={[
            [<code>@tiny/bridge</code>, '10', 'envelope、校验、超时、批处理、MessagePort'],
            [<code>@tiny/template-compiler</code>, '28', '解析、ProcGen、WXS、import/include、dataset'],
            [<code>@tiny/stylesheet-compiler</code>, '24', 'rpx、class/tag scope、host、keyframes'],
            [<code>@tiny/cli</code>, '10', 'manifest、配置合并、脚本/样式/WXS 产物'],
            [<code>@tiny/components</code>, '6', '组件注册、事件归一化、AOT 模板覆盖'],
            [<code>@tiny/runtime</code>, '14', 'API、导航、组件 schema、诊断、生命周期'],
          ]}
        />
        <CodeBlock>{`# 全部验收
pnpm accept:glass-easel

# 只跑构建 + 单测，不起浏览器
SKIP_BROWSER=1 pnpm accept:glass-easel

# 单包测试
pnpm --filter @tiny/runtime test
pnpm --filter @tiny/cli test`}</CodeBlock>
      </Section>

      <Section
        kicker="Taro 3"
        title="社区产物兼容不是“顺便跑跑”"
        intro="tests/apps/todo 是预编译的 Taro 3 React 产物，已进入正式验收。"
      >
        <Cards>
          <Card tag="runtime" title="webpackJsonp 与页面对象">
            <p><code>wx.webpackJsonp</code> 作为 raw 数据属性暴露；生命周期方法挂到页面实例，支持 <code>this.onReady.called</code>。</p>
          </Card>
          <Card tag="template" title="WXS 与递归组件">
            <p>外部 WXS 按带/不带扩展名注册；usingComponents 环检测避免 comp / custom-wrapper 互相引用时递归爆栈。</p>
          </Card>
          <Card tag="globals" title="getCurrentPages / getSystemInfo">
            <p>补上 Taro runtime 依赖的全局与 callback 版系统信息；raw wx 数据属性与 unsupported API 诊断分开。</p>
          </Card>
          <Card tag="input" title="confirm 提交">
            <p>input 组件转发 focus / blur / keydown / confirm，Taro 表单按 Enter 能提交。</p>
          </Card>
        </Cards>
      </Section>

      <Section kicker="Artifacts" title="生成物不入库">
        <Cards>
          <Card tag="ignored" title="tests/host/generated"><p>编译测试小程序的输出；每个验收阶段覆盖它。</p></Card>
          <Card tag="ignored" title="packages/components/src/generated"><p>内置组件 ProcGen；prebuild / pretypecheck / pretest 自动生成。</p></Card>
          <Card tag="ignored" title="apps/devtool/static"><p>devtool 的 demo / real 产物；由 dev script 或 compile:devtool:all 写入。</p></Card>
        </Cards>
        <Callout title="下一步阅读">
          <p><a href="#/status">现状与路线</a> 说明哪些能力已经闭环、哪些仍是生产化前必须补的缺口。</p>
        </Callout>
      </Section>
    </>
  )
}
