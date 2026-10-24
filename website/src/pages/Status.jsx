import React from 'react'
import {
  Callout,
  Card,
  Cards,
  PageHero,
  PageNav,
  Section,
  Table,
} from '../components/ui'

const status = (label, tone = '') => <span className={`pill${tone ? ` ${tone}` : ''}`}>{label}</span>

export default function Status() {
  return (
    <>
      <PageHero
        eyebrow="Status & roadmap"
        title={<>能跑真实示例，<br /><span className="gradient">还不是完整微信兼容</span></>}
        lede="核心链路、Taro 3 React 产物、样式作用域和调试器已经闭环；生产化前仍需补 API、组件语义、页面能力、宿主抽象与性能基线。下面按“当前代码证据”评估，而不是按目标能力评估。"
        pills={[
          ['core chain ready', 'good'],
          ['bridge v1', 'good'],
          ['taro 3 react', 'good'],
          ['browser host only', 'warn'],
          ['api narrow', 'warn'],
          ['semantics partial', 'warn'],
          ['perf unmeasured', 'warn'],
        ]}
      />
      <PageNav items={[
        ['maturity', '成熟度'],
        ['gaps', '主要缺口'],
        ['host-gaps', '宿主缺口'],
        ['roadmap', '优先级'],
        ['invariants', '不变量'],
        ['next', '继续阅读'],
      ]} />

      <Section
        id="maturity"
        kicker="Maturity"
        title="逐项成熟度"
        intro="“可用”表示有自动化证据且能在真实 fixture 中运行，不表示与微信语义完全一致。"
      >
        <Table
          head={['领域', '状态', '当前证据 / 边界']}
          rows={[
            ['编译核心', status('可用', 'good'), 'pages / components / subPackages、WXML/WXSS/WXS、manifest、service bundle、图片内联、source map；只有全量构建。'],
            ['service runtime', status('可用', 'good'), 'App/Page/Component 注册、页面栈、导航、setData、事件、storage、system info、animation、canvas 离屏。'],
            ['render adapter', status('可用', 'good'), 'glass-easel ComponentSpace、模板、样式 scope、组件定义、生命周期、元素树、内置组件。'],
            ['bridge', status('可用', 'good'), 'envelope、帧、MessagePort/内存 transport、握手、超时、批处理、JSON-safe 校验；capabilities 未用于协商。'],
            ['浏览器宿主', status('可用', 'good'), 'standalone 双 iframe、MessageChannel、15s readiness、显式 bootstrap；测试宿主与 devtool 共用。'],
            ['原生宿主', status('未实现', 'warn'), '没有 native transport、backend 或非浏览器 service 运行时。'],
            ['内置组件', status('部分', 'warn'), '18 个常用组件；属性/事件语义覆盖 fixture 所需，不覆盖完整微信行为。'],
            ['API', status('窄', 'warn'), 'storage、导航、system、toast、animation、canvas、selector query；无网络/媒体/文件/账号/位置/WebSocket。'],
            ['页面能力', status('部分', 'warn'), '基础生命周期与导航；无 tabBar、下拉刷新、触底、页面滚动、分享、恢复。'],
            ['组件语义', status('部分', 'warn'), 'properties/data/methods/lifetimes/slots/externalClasses；无 Behavior mixin、relations、generics、placeholder。'],
            ['样式系统', status('核心可用', 'good'), 'class/tag 作用域、rpx、@import、keyframes；无 styleIsolation/addGlobalClass/:host 组合。'],
            ['Canvas', status('部分', 'warn'), '离屏绘制 → 50ms PNG 帧 → drawImage；无 canvas 触摸、rAF、完整 2D 语义。'],
            ['动画', status('部分', 'warn'), 'animation 数据编译为最终态 CSS transform/transition；无多 step 时序与回调。'],
            ['诊断', status('可用', 'good'), '编译/transport/service/render/host 五类；结构统一，devtool 可直接消费。'],
            ['Devtool', status('运行时级', 'warn'), '状态、诊断、元素树、导航/前后台/Reload/Terminate；不是完整微信开发者工具。'],
            ['性能 / 稳定', status('未量化', 'warn'), '无启动、首屏、setData、内存、长时运行基准；无压力测试。'],
            ['测试', status('核心链路', 'good'), '115 单测 + 45 浏览器步骤 + 5 fixture；没有性能、视觉、原生、安全测试。'],
          ]}
        />
      </Section>

      <Section
        id="gaps"
        kicker="Known gaps"
        title="主要缺口"
        intro="按影响面排序：先阻断“常见小程序能跑”，再影响体验与形态。"
      >
        <Cards>
          <Card tag="API" tone="warn" title="宿主 API 面很窄">
            <p>缺 request、异步 storage、reLaunch/redirectTo/switchTab、showModal/showLoading、登录、媒体、文件、位置、WebSocket、IntersectionObserver。</p>
            <p>未实现 API 当前返回 undefined 并产生 UNSUPPORTED_API 警告，不会抛错。</p>
          </Card>
          <Card tag="components" tone="warn" title="组件语义不完整">
            <p>缺 textarea/picker/form/navigator/video/audio/rich-text/map/movable-view 等；已有组件的 open-type、focus、颜色、尺寸也未完整覆盖。</p>
          </Card>
          <Card tag="pages" tone="warn" title="页面能力有限">
            <p>无 tabBar、下拉刷新、触底、页面滚动事件、分享；子包只验证直接启动，没有按需加载；页面返回会重建 DOM。</p>
          </Card>
          <Card tag="styles" tone="warn" title="隔离模式未完整">
            <p>class/tag 作用域已解决，但 styleIsolation、addGlobalClass、app.wxss 到组件内部的边界、:host 组合与优先级矩阵没有实现。</p>
          </Card>
          <Card tag="canvas" tone="warn" title="可交互 canvas 未完成">
            <p>当前是“离屏绘制 → PNG 帧 → render drawImage”；没有 canvas 触摸事件、requestAnimationFrame、完整 2D API。</p>
          </Card>
          <Card tag="animation" tone="warn" title="动画是最终态映射">
            <p><code>animation</code> 被编译为 CSS transform/transition；多 step 时序和事件回调没有还原。</p>
          </Card>
          <Card tag="behavior" tone="warn" title="组件高级语义缺失">
            <p><code>Behavior</code> 只是透传 options；没有 mixin 合并、relations、generics、placeholder，service 侧也没有组件间 <code>selectComponent</code> 关系语义。</p>
          </Card>
          <Card tag="perf" tone="warn" title="没有性能基线">
            <p>启动、首屏、setData 数量/体积、导航耗时、大列表内存、长时运行都没有测量，也没有回归门槛。</p>
          </Card>
        </Cards>
      </Section>

      <Section
        id="host-gaps"
        kicker="Host gaps"
        title="宿主层的缺口"
        intro="引擎内核可以跨宿主，但当前只实现了浏览器形态。"
      >
        <div className="split">
          <div className="stack">
            <Card tag="native" tone="warn" title="原生宿主不存在">
              <p>service 线程的 canvas 依赖 <code>document</code>；render 的 selector 测量、canvas 帧绘制也直接用 <code>document</code>。要支持原生/JSCore，需要先抽象这些环境依赖。</p>
            </Card>
            <Card tag="deployment" tone="warn" title="部署假设未建模">
              <p>iframe 无 sandbox；端口转移和 ready 消息使用 targetOrigin <code>'*'</code>；线程没有校验 origin。当前默认同源静态部署。</p>
            </Card>
            <Card tag="lifecycle" tone="warn" title="关闭语义不完整">
              <p><code>host.close()</code> 只关连接，不触发页面 onUnload，也不移除 iframe；devtool 自己做了 iframe 移除，测试宿主依赖页面刷新。</p>
            </Card>
          </div>
          <div className="stack">
            <Card tag="capability" tone="warn" title="没有能力协商">
              <p>握手的 capabilities 没有被 host 注入，也没有降级逻辑。不同宿主的 API/device 能力差异只能靠 apiExtensions 和诊断暴露。</p>
            </Card>
            <Card tag="delivery" tone="warn" title="没有产物热更新">
              <p>产物变化必须 restart/reload host；协议没有 artifact reload。devtool 的 Reload 是重建整个 iframe 运行时。</p>
            </Card>
            <Card tag="loading" tone="warn" title="没有子包按需加载">
              <p>service bundle 包含所有页面脚本；manifest 记录 subpackage，但宿主没有按需下载或执行策略。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="roadmap"
        kicker="Next"
        title="下一阶段优先级"
        intro="先把“真实小程序能跑”变成“常见小程序能跑”，再做页面体验、宿主扩展和性能门槛。"
      >
        <div className="stack">
          <Card tag="P0" title="扩 API host">
            <p>request、异步 storage、导航变体、modal/loading、系统信息异步版；把 unsupported API 从“静默 undefined”变成可查询的能力清单与明确诊断。</p>
          </Card>
          <Card tag="P0" title="补常用组件">
            <p>按真实使用频率补 textarea、picker、form、navigator，并把已有组件的属性/事件语义补全；同步更新 AOT 模板与组件测试。</p>
          </Card>
          <Card tag="P0" title="宿主加固">
            <p>明确 close/terminate 语义，加入 origin 校验与 sandbox 策略评估，补齐 capability 声明或删除误导性的字段。</p>
          </Card>
          <Card tag="P1" title="页面能力">
            <p>tabBar、下拉刷新、触底、页面滚动、分享、子包按需加载、页面栈恢复。</p>
          </Card>
          <Card tag="P1" title="组件与样式语义">
            <p>Behavior mixin、relations、pageLifetimes 多实例、styleIsolation/addGlobalClass、app.wxss 作用边界。</p>
          </Card>
          <Card tag="P1" title="Canvas 与动画">
            <p>canvas 触摸与 rAF、完整 2D API；animation 多 step 时序与事件回调，而不是只映射最终态。</p>
          </Card>
          <Card tag="P2" title="性能与稳定性基线">
            <p>启动耗时、首屏、setData 批量/差量、导航耗时、大列表内存、长时运行；把阈值接入验收。</p>
          </Card>
          <Card tag="P2" title="宿主与渲染后端扩展">
            <p>抽象 document 依赖，实现原生 transport/backend 与挂载策略；再评估多渲染后端、编译产物抽象化等更长期方向。</p>
          </Card>
        </div>
        <Callout title="关于 docs/next" tone="warn">
          <p>
            仓库里的 Next 方案讨论了抽象组件树、多渲染后端与渲染框架解耦。这些是方向性设计，不是当前实现；
            当前引擎仍以 glass-easel + 浏览器 DOM backend 为核心。
          </p>
        </Callout>
      </Section>

      <Section
        id="invariants"
        kicker="Invariants"
        title="架构不变量"
        intro="路线可以变，这些约束不能变，否则现有宿主与测试会同时失效。"
      >
        <Cards>
          <Card title="核心不依赖工具/应用"><p><code>packages/*</code> 只能依赖核心包；manifest 契约独立，runtime 不依赖 CLI。</p></Card>
          <Card title="一个 manifest 契约"><p>compiler、runtime、host、devtool 都消费 <code>@tiny/manifest</code>；不要复制产物类型。</p></Card>
          <Card title="跨线程只走 bridge"><p>不直接读 iframe 全局、不 executeJavaScript；所有控制面都是版本化消息。</p></Card>
          <Card title="宿主事实走 extensions"><p>设备、菜单按钮、性能等通过 <code>apiExtensions</code> 注入，不在 runtime 硬编码。</p></Card>
          <Card title="生成物不入库"><p>宿主产物、组件 ProcGen、devtool static 都由构建生成；仓库只保留源码、契约和 fixture。</p></Card>
          <Card title="验收必须真实"><p>核心链路用真实双线程 + 浏览器操作验证；不接受只靠 mock 的“通过”。</p></Card>
        </Cards>
      </Section>

      <Section
        id="next"
        kicker="Continue"
        title="继续阅读"
        intro="如果你要改代码，建议按依赖顺序读。"
      >
        <Cards className="three">
          <Card tag="architecture" title="先看边界"><p>状态所有权、启动时序与中继矩阵。</p><p><a href="#/architecture">架构总览 →</a></p></Card>
          <Card tag="compiler" title="再看产物"><p>WXML/WXSS/TS 如何变成 manifest。</p><p><a href="#/compiler">编译流水线 →</a></p></Card>
          <Card tag="runtime" title="然后看消费"><p>双线程如何注册、渲染与通信。</p><p><a href="#/runtime">运行时内核 →</a></p></Card>
          <Card tag="protocol" title="协议是边界"><p>消息目录、错误与扩展规则。</p><p><a href="#/protocol">Bridge 协议 →</a></p></Card>
          <Card tag="hosts" title="宿主是落地"><p>三种宿主与新宿主检查清单。</p><p><a href="#/hosts">宿主支持 →</a></p></Card>
          <Card tag="testing" title="证据是底线"><p>115 单测与 45 步浏览器验收。</p><p><a href="#/testing">验证体系 →</a></p></Card>
        </Cards>
        <Callout title="仓库">
          <p>
            <a href="https://github.com/YufJi/tiny">github.com/YufJi/tiny</a> ·
            <a href="https://github.com/YufJi/tiny/blob/next/docs/acceptance.md">验收指南</a> ·
            <a href="https://github.com/YufJi/tiny/tree/next/docs/adr">架构决策记录</a>
          </p>
        </Callout>
      </Section>
    </>
  )
}
