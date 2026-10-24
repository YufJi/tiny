import React from 'react'
import { Callout, Card, Cards, PageHero, Section, Table } from '../components/ui'

const status = (label, tone = '') => <span className={`pill${tone ? ` ${tone}` : ''}`}>{label}</span>

export default function Status() {
  return (
    <>
      <PageHero
        eyebrow="Status & roadmap"
        title={<>能跑真实示例，<br /><span className="gradient">还不是完整微信兼容</span></>}
        lede="核心链路和 Taro 3 React 产物已经闭环；生产化前仍需补 API、组件语义、页面能力和性能基线。"
        pills={[
          ['core chain ready', 'good'],
          ['real app ready', 'good'],
          ['taro 3 react', 'good'],
          ['api narrow', 'warn'],
          ['semantics partial', 'warn'],
          ['perf unmeasured', 'warn'],
        ]}
      />

      <Section
        kicker="Maturity"
        title="当前成熟度"
        intro='按“当前证据”评估，而不是按目标能力评估。'
      >
        <Table
          head={['领域', '状态', '说明']}
          rows={[
            ['编译核心', status('可用', 'good'), 'pages / components / subPackages、WXML/WXSS/WXS、manifest、service bundle、图片内联。'],
            ['双线程 runtime', status('可用', 'good'), '页面栈、导航、setData、事件、组件、storage、system info、diagnostics。'],
            ['内置组件', status('部分', 'warn'), '18 个常用组件；示例所需语义可用，完整属性/事件仍缺。'],
            ['API', status('窄', 'warn'), 'storage、导航、system、toast、animation、canvas、selector query；无网络/媒体/账号等。'],
            ['生命周期', status('部分', 'warn'), '基础页面/组件生命周期；tabBar、下拉刷新、触底、分享尚未覆盖。'],
            ['样式系统', status('核心可用', 'good'), 'class/tag 作用域；styleIsolation 等组件配置语义仍待补齐。'],
            ['Devtool', status('运行时级', 'warn'), '状态、诊断、元素树、控制；不是完整微信开发者工具。'],
            ['性能 / 稳定', status('未量化', 'warn'), '无启动、首屏、setData、内存、长时运行基准。'],
          ]}
        />
      </Section>

      <Section kicker="Known gaps" title="主要缺口">
        <Cards>
          <Card tag="API" tone="warn" title="宿主 API 面很窄">
            <p>缺 request、异步 storage、reLaunch/redirectTo/switchTab、showModal/loading、登录、媒体、文件、位置、WebSocket、IntersectionObserver。</p>
          </Card>
          <Card tag="components" tone="warn" title="组件语义不完整">
            <p>缺 textarea/picker/form/navigator/video/audio/rich-text/map/movable-view 等；已有组件的 open-type、focus、confirm、颜色尺寸等属性也未完整覆盖。</p>
          </Card>
          <Card tag="pages" tone="warn" title="页面能力有限">
            <p>无 tabBar、下拉刷新、触底、页面滚动事件、分享；子包只验证直接启动，未覆盖按需加载；pageLifetimes 仍是近似实现。</p>
          </Card>
          <Card tag="styles" tone="warn" title="隔离模式未完整">
            <p>class/tag 作用域已解决，但 styleIsolation、app.wxss 到组件内部的边界、:host 组合和优先级矩阵还没有系统验收。</p>
          </Card>
          <Card tag="canvas" tone="warn" title="可交互 canvas 未完成">
            <p>当前是“离屏绘制 → PNG 帧 → render drawImage”；没有 canvas 触摸事件、requestAnimationFrame、2D API 完整语义。</p>
          </Card>
          <Card tag="animation" tone="warn" title="动画是最终态映射">
            <p><code>animation</code> 数据被编译为 CSS transform/transition；多 step 时序和事件回调还未还原。</p>
          </Card>
        </Cards>
      </Section>

      <Section
        kicker="Next"
        title="下一阶段优先级"
        intro="先把“真实小程序能跑”变成“常见小程序能跑”，再做性能和形态扩展。"
      >
        <div className="stack">
          <Card tag="P0" title="扩 API host">
            <p>request、异步 storage、导航变体、modal/loading、系统信息异步版；把 unsupported API 从“静默失败”变成明确诊断。</p>
          </Card>
          <Card tag="P0" title="补常用组件">
            <p>按真实使用频率补 textarea、picker、form、navigator，并把已有组件的属性/事件语义补全。</p>
          </Card>
          <Card tag="P1" title="页面能力">
            <p>tabBar、下拉刷新、触底、页面滚动、分享、子包按需加载、页面栈恢复。</p>
          </Card>
          <Card tag="P1" title="生命周期与样式语义">
            <p>Behavior mixin、pageLifetimes、组件 styleIsolation、app.wxss 作用边界。</p>
          </Card>
          <Card tag="P2" title="性能基线">
            <p>启动耗时、首屏、setData 批量/差量、导航耗时、大列表内存、长时运行。</p>
          </Card>
        </div>
      </Section>

      <Section kicker="Invariants" title="架构不变量">
        <Cards>
          <Card title="核心不依赖工具/应用"><p><code>packages/*</code> 只能依赖核心包；manifest 契约独立，runtime 不再依赖 CLI。</p></Card>
          <Card title="一个 manifest 契约"><p>compiler、runtime、host、devtool 都消费 <code>@tiny/manifest</code>；不要复制产物类型。</p></Card>
          <Card title="生成物不入库"><p>宿主产物、组件 ProcGen、devtool static 都由构建生成；仓库只保留源码和测试 fixture。</p></Card>
          <Card title="验收必须真实"><p>核心链路用真实双线程 + 浏览器操作验证；不接受只靠 mock 的“通过”。</p></Card>
        </Cards>
        <Callout title="继续深入">
          <p><a href="#/internals">内部分层</a> 看实现细节，<a href="#/testing">测试与兼容</a> 看验收覆盖和 Taro 兼容点。</p>
        </Callout>
      </Section>
    </>
  )
}
