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
        title={<>内核已经解耦，<br /><span className="gradient">兼容面仍在扩张</span></>}
        lede="宿主无关 runtime、host-browser、naming、Behaviors/observers/relations、styleIsolation 与内嵌调试器已经闭环；生产化前仍需补 API、组件、页面能力、generics/definitionFilter、canvas 交互、原生宿主与性能基线。下面按“当前代码证据”评估。"
        pills={[
          ['runtime pure', 'good'],
          ['component semantics', 'good'],
          ['style isolation', 'good'],
          ['browser host only', 'warn'],
          ['generics missing', 'warn'],
          ['api narrow', 'warn'],
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
            ['编译核心', status('可用', 'good'), 'pages / components / subPackages、naming、WXML/WXSS/WXS、manifest、service bundle、资源、source map；只有全量构建。'],
            ['service runtime', status('可用', 'good'), 'App/Page/Component、页面栈、导航、setData、naming、behaviors/observers/relations、逻辑组件树、storage/system/canvas 协议。'],
            ['render adapter', status('可用', 'good'), 'glass-easel ComponentSpace、模板、scope、styleIsolation、externalClasses、组件定义、生命周期、元素树、资源解析、canvas 适配。'],
            ['bridge', status('可用', 'good'), 'envelope、帧、MessagePort/内存 transport、握手、超时、批处理、JSON-safe 校验；capabilities 未用于协商。'],
            ['浏览器宿主', status('可用', 'good'), '@tiny/host-browser 双 iframe、MessageChannel、DOM canvas、resolveAssetUrl、DevtoolRuntimeClient；runtime 纯度检查通过。'],
            ['原生宿主', status('未实现', 'warn'), '没有 native transport、backend 或非浏览器 service 运行时；但 core 已经移除 document/Image/iframe。'],
            ['内置组件', status('较完整', 'good'), '23 个组件、共享 behaviors、接近 WebView 的 button/input/scroll-view/swiper 表面；navigator/video/rich-text/map 等仍缺。'],
            ['API', status('窄', 'warn'), 'storage、导航、system、toast、animation、canvas、selector query；无网络/媒体/文件/账号/位置/WebSocket。'],
            ['页面能力', status('部分', 'warn'), '基础生命周期与导航；无 tabBar、下拉刷新、触底、页面滚动、分享、恢复。'],
            ['组件语义', status('核心可用', 'good'), 'Behaviors、observers、relations、selectComponent、component-export、component-as-page；generics/placeholder/definitionFilter 未实现。'],
            ['样式系统', status('核心可用', 'good'), 'class/tag scope、rpx、@import、styleIsolation/addGlobalClass、externalClasses、shared CSS；:host 与低优先级输出未启用。'],
            ['Canvas', status('部分', 'warn'), 'canvas 适配器注入、50ms PNG 帧、render measure/paint、内置 canvas touch；无 rAF 与完整 2D 语义。'],
            ['动画', status('部分', 'warn'), 'animation 数据编译为最终态 CSS transform/transition；无多 step 时序与回调。'],
            ['诊断', status('可用', 'good'), '编译/transport/service/render/host 五类；组件语义新增 observer/relation/behavior 诊断。'],
            ['Devtool', status('运行时级+', 'good'), '设备框、宿主导航、全部 fixture、Console/Elements、Reload/Terminate；仍不是完整微信开发者工具。'],
            ['性能 / 稳定', status('未量化', 'warn'), '无启动、首屏、setData、内存、长时运行基准；无压力测试。'],
            ['测试', status('核心链路', 'good'), '152 单测 + 46 浏览器步骤 + 5 fixture；没有性能、视觉、原生、安全测试。'],
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
            <p>未实现 API 返回 undefined 并产生 UNSUPPORTED_API 警告，不会抛错。</p>
          </Card>
          <Card tag="components" tone="warn" title="组件库不完整">
            <p>缺 textarea/picker/form/navigator/video/audio/rich-text/map/movable-view 等；已有组件的 open-type 真实能力、表单提交与无障碍也未完整覆盖。</p>
          </Card>
          <Card tag="pages" tone="warn" title="页面能力有限">
            <p>无 tabBar、下拉刷新、触底、页面滚动事件、分享；子包只验证直接启动，没有按需加载；页面返回会重建 DOM。</p>
          </Card>
          <Card tag="component" tone="warn" title="高级组件语义">
            <p>generics、placeholder、definitionFilter 未实现；微信内置 behavior（如 <code>wx://form-field</code>）也不支持，只支持 component-export。</p>
          </Card>
          <Card tag="canvas" tone="warn" title="可交互 canvas 未完成">
            <p>当前是宿主 canvas 适配器 + PNG 帧镜像；没有 canvas rAF、完整 2D API、原生触摸到 service 的完整链路。</p>
          </Card>
          <Card tag="animation" tone="warn" title="动画是最终态映射">
            <p><code>animation</code> 被编译为 CSS transform/transition；多 step 时序和事件回调没有还原。</p>
          </Card>
          <Card tag="navigation" tone="warn" title="返回语义不完整">
            <p>navigateBack 只触发恢复页 onShow，不会把 render 返回的 components 并入 page.ready；组件逻辑树可能要靠后续事件重建。</p>
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
        intro="内核已经跨宿主，但当前只实现了浏览器形态。"
      >
        <div className="split">
          <div className="stack">
            <Card tag="native" tone="warn" title="原生宿主不存在">
              <p>core 已经不依赖 document；原生宿主需要实现 Transport、glass-easel backend、canvas adapters、resolveAssetUrl 与控制面，但还没有落地。</p>
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
            <Card tag="back" tone="warn" title="navigateBack 不补 snapshots">
              <p>navigateTo 会做 <code>{'page.ready({ components })'}</code>；navigateBack 只让 service 恢复 onShow，render 返回的 components 被丢弃。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="roadmap"
        kicker="Next"
        title="下一阶段优先级"
        intro="先补常见小程序需要的 API 与组件，再修页面/组件语义和宿主契约，最后做性能与原生形态。"
      >
        <div className="stack">
          <Card tag="P0" title="扩 API host">
            <p>request、异步 storage、导航变体、modal/loading、系统信息异步版；把 unsupported API 从“静默 undefined”变成可查询能力清单和明确诊断。</p>
          </Card>
          <Card tag="P0" title="补常用组件">
            <p>textarea、picker、form、navigator，并把已有组件的 open-type、表单、颜色、焦点语义补全；同步扩展组件测试与 P0 fixture。</p>
          </Card>
          <Card tag="P0" title="修导航契约">
            <p>让 navigateBack 也把 render components 回传为 page.ready，或在 service 保留可复用的组件实例；补对应浏览器断言。</p>
          </Card>
          <Card tag="P0" title="宿主加固">
            <p>明确 close/terminate 语义，评估 origin 校验与 sandbox，补齐或删除 capability 字段。</p>
          </Card>
          <Card tag="P1" title="页面能力">
            <p>tabBar、下拉刷新、触底、页面滚动、分享、子包按需加载、页面栈恢复。</p>
          </Card>
          <Card tag="P1" title="组件高级语义">
            <p>generics、placeholder、definitionFilter、完整内置 behaviors、relations 的边界情况与组件 export 校验。</p>
          </Card>
          <Card tag="P1" title="Canvas 与动画">
            <p>canvas rAF、完整 2D API、触摸到 service 的链路；animation 多 step 时序与事件回调。</p>
          </Card>
          <Card tag="P2" title="性能与稳定性基线">
            <p>启动耗时、首屏、setData 批量/差量、导航耗时、大列表内存、长时运行；把阈值接入验收。</p>
          </Card>
          <Card tag="P2" title="原生宿主与更多后端">
            <p>用现有 Transport/backend/canvas/assets 注入面实现原生宿主；再评估多渲染后端与编译产物抽象化。</p>
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
          <Card title="内核不拥有环境"><p><code>packages/runtime</code> 不碰 window/document/iframe/MessageChannel；<code>pnpm check:runtime-purity</code> 是硬门槛。</p></Card>
          <Card title="宿主适配器在 core 外"><p>iframe、DOM canvas、devtool overlay 在 <code>hosts/browser</code>，内置组件在 <code>hosts/web-components</code>；核心包不反向依赖 hosts。</p></Card>
          <Card title="一个 manifest 契约"><p>compiler、runtime、host、devtool 都消费 <code>@tiny/manifest</code>，包括 naming；不要复制产物类型。</p></Card>
          <Card title="命名只有一个来源"><p>指令、API、别名、behavior scheme、host attribute、tag marker 全部派生自 <code>manifest.naming</code>。</p></Card>
          <Card title="跨线程只走 bridge"><p>不直接读 iframe 全局、不 executeJavaScript；所有控制面都是版本化消息。</p></Card>
          <Card title="能力靠注入"><p>设备事实走 apiExtensions，canvas 走 canvas adapters，资源走 resolveAssetUrl，backend/mount 与 builtinComponents 由宿主提供。</p></Card>
          <Card title="生成物不入库"><p>宿主产物、组件 ProcGen、devtool static、站点 devtool 都由构建生成；仓库只保留源码、契约和 fixture。</p></Card>
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
          <Card tag="architecture" title="先看边界"><p>状态所有权、runtime 纯度、启动时序与中继矩阵。</p><p><a href="#/architecture">架构总览 →</a></p></Card>
          <Card tag="compiler" title="再看产物"><p>WXML/WXSS/TS/naming 如何变成 manifest。</p><p><a href="#/compiler">编译流水线 →</a></p></Card>
          <Card tag="runtime" title="然后看消费"><p>双线程、组件语义、样式隔离与 canvas 注入。</p><p><a href="#/runtime">运行时内核 →</a></p></Card>
          <Card tag="protocol" title="协议是边界"><p>消息目录、错误与扩展规则。</p><p><a href="#/protocol">Bridge 协议 →</a></p></Card>
          <Card tag="hosts" title="宿主是落地"><p>host-browser、注入面与新宿主检查清单。</p><p><a href="#/hosts">宿主支持 →</a></p></Card>
          <Card tag="testing" title="证据是底线"><p>152 单测与 46 步浏览器验收。</p><p><a href="#/testing">验证体系 →</a></p></Card>
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
