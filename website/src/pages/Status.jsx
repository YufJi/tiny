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
        eyebrow="现状"
        title={<>核心已经跑通，<br /><span className="gradient">兼容性还在补齐</span></>}
        lede="内核已经和宿主解耦，命名配置、组件语义、样式隔离、tabBar、多应用调试器都已就位；接下来主要是补宿主 API、组件覆盖、页面能力、generics/definitionFilter、canvas 交互、原生宿主和性能基线。下面的判断都按当前代码和测试来，不按计划来。"
        pills={[
          ['内核不依赖宿主', 'good'],
          ['组件语义', 'good'],
          ['样式隔离', 'good'],
          ['仅浏览器宿主', 'warn'],
          ['generics 未实现', 'warn'],
          ['API 覆盖有限', 'warn'],
          ['性能未量化', 'warn'],
        ]}
      />
      <PageNav items={[
        ['maturity', '成熟度'],
        ['gaps', '主要缺口'],
        ['host-gaps', '宿主缺口'],
        ['roadmap', '下一步'],
        ['invariants', '设计约束'],
        ['next', '继续阅读'],
      ]} />

      <Section
        id="maturity"
        kicker="成熟度"
        title="逐项看现在做到哪一步"
        intro="“可用”表示有自动化测试、能在真实测试小程序里跑起来，并不代表和微信语义完全一致。"
      >
        <Table
          head={['领域', '状态', '当前情况和边界']}
          rows={[
            ['编译核心', status('可用', 'good'), '支持 pages、components、subPackages、命名配置、WXML/WXSS/WXS、manifest、service bundle、资源复制和 source map；目前只有全量构建。'],
            ['service runtime', status('可用', 'good'), 'App/Page/Component、页面栈、navigateTo/back/switchTab、tabBar 状态和 API、setData、命名、behaviors/observers/relations、逻辑组件树、storage/system/canvas 协议。'],
            ['render adapter', status('可用', 'good'), 'glass-easel ComponentSpace、模板、作用域、styleIsolation、externalClasses、组件定义、生命周期、元素树、资源解析和 canvas 适配。'],
            ['bridge', status('可用', 'good'), '信封和帧、MessagePort/内存 transport、握手、超时、批处理、JSON 校验；capabilities 还没有用于协商。'],
            ['浏览器宿主', status('可用', 'good'), '@tiny/host-browser 支持单 render 和每页 render 两种模式、MessageChannel、tabBar 宿主 UI、DOM canvas、resolveAssetUrl 和 DevtoolRuntimeClient；内核依赖检查通过。'],
            ['原生宿主', status('未实现', 'warn'), '还没有 native transport、native 渲染后端或非浏览器 service 运行时；不过内核已经移除了 document、Image 和 iframe。'],
            ['内置组件', status('较完整', 'good'), '23 个组件和共享 behaviors；checkbox/radio/switch/slider/icon/image/picker 已按 2.7.0 参考重写；input/textarea/scroll-view/swiper 仍是近似实现；navigator/video/rich-text/map 等还缺。'],
            ['API', status('部分', 'warn'), 'request、异步 storage、导航/switchTab、system、toast/modal、canvas、selector query 已有；媒体、真实文件、账号、位置、WebSocket 还没有。'],
            ['页面能力', status('部分', 'warn'), '基础生命周期、导航、内置 tabBar/switchTab、页面滚动和触底已经支持；下拉刷新、分享、页面栈恢复还在计划里。'],
            ['组件语义', status('核心可用', 'good'), 'Behaviors、observers、relations、selectComponent、component-export、component-as-page 已实现；generics、placeholder、definitionFilter 未实现。'],
            ['样式系统', status('核心可用', 'good'), 'class/tag 作用域、rpx、@import、styleIsolation/addGlobalClass、externalClasses、shared CSS 已支持；:host 和低优先级输出未启用。'],
            ['Canvas', status('部分', 'warn'), 'canvas 适配器注入、50ms PNG 帧、render 测量/绘制、内置 canvas touch 已支持；没有 rAF 和完整 2D 语义。'],
            ['动画', status('部分', 'warn'), 'animation 数据会编译成最终态 CSS transform/transition；没有多 step 时序和事件回调。'],
            ['诊断', status('可用', 'good'), '编译、transport、service、render、host 五类诊断统一收集；组件语义新增了 observer、relation、behavior 相关诊断。'],
            ['Devtool', status('运行时级+', 'good'), '应用列表、点击启动、最近 3 个应用保活、返回列表、设备框、宿主导航和 tabBar、每页 render 帧、Console/Lifecycle/Elements、Reload/Close app；页面栈默认上限 10，宿主可配置。它仍不是完整的微信开发者工具。'],
            ['性能与稳定', status('未量化', 'warn'), '启动、首屏、setData、内存和长时运行都没有基准，也没有压力测试。'],
            ['测试', status('核心链路', 'good'), '180 个单元测试、51 个浏览器步骤和 5 个测试小程序；没有性能、视觉、原生和安全测试。'],
          ]}
        />
      </Section>

      <Section
        id="gaps"
        kicker="主要缺口"
        title="现在最影响使用的问题"
        intro="按影响面排序：先解决常见小程序能不能跑，再考虑体验和更多宿主。"
      >
        <Cards>
          <Card tag="API" tone="warn" title="宿主 API 还不够全">
            <p>还缺异步 storage、reLaunch/redirectTo、showModal/showLoading、登录、媒体、文件、位置、WebSocket 和 IntersectionObserver。</p>
            <p>未实现的 API 会返回 undefined 并产生 UNSUPPORTED_API 警告，不会直接抛错。</p>
          </Card>
          <Card tag="组件" tone="warn" title="组件库不完整">
            <p>还缺 navigator、video、audio、rich-text、map、movable-view 等；已有组件的 open-type 真实能力、表单提交和无障碍也没有完全覆盖。</p>
          </Card>
          <Card tag="页面" tone="warn" title="页面能力有限">
            <p>没有下拉刷新、分享、页面栈恢复和自定义 tabBar；子包只验证了直接启动，没有按需加载。</p>
          </Card>
          <Card tag="组件语义" tone="warn" title="高级组件能力缺失">
            <p>generics、placeholder、definitionFilter 未实现；微信内置 behavior（例如 <code>wx://form-field</code>）也不支持，目前只支持 component-export。</p>
          </Card>
          <Card tag="Canvas" tone="warn" title="canvas 还不是完整交互">
            <p>目前是宿主 canvas 适配器加 PNG 帧镜像；没有 canvas rAF、完整 2D API，也没有原生触摸到 service 的完整链路。</p>
          </Card>
          <Card tag="动画" tone="warn" title="动画只有最终态">
            <p><code>animation</code> 会编译成 CSS transform/transition；多 step 时序和事件回调还没有还原。</p>
          </Card>
          <Card tag="导航" tone="warn" title="单 render 模式返回语义不完整">
            <p>每页 render 模式会保留页面 DOM；单 render 模式返回时仍会重新挂载页面，不会把 render 返回的组件快照重新发给 service。</p>
          </Card>
          <Card tag="性能" tone="warn" title="没有性能基线">
            <p>启动、首屏、setData 的数量和体积、导航耗时、大列表内存和长时运行都没有测量，也没有回归门槛。</p>
          </Card>
        </Cards>
      </Section>

      <Section
        id="host-gaps"
        kicker="宿主缺口"
        title="宿主层还缺什么"
        intro="内核已经可以跨宿主，但目前只实现了浏览器形态。"
      >
        <div className="split">
          <div className="stack">
            <Card tag="原生" tone="warn" title="原生宿主还没有">
              <p>内核已经不依赖 document，但原生宿主还需要实现 Transport、glass-easel 渲染后端、canvas 适配器、resolveAssetUrl 和控制界面。</p>
            </Card>
            <Card tag="部署" tone="warn" title="部署假设还没有建模">
              <p>iframe 没有 sandbox；转移端口和发送 ready 时使用 targetOrigin <code>'*'</code>；线程侧也没有校验 origin。当前默认同源静态部署。</p>
            </Card>
            <Card tag="关闭" tone="warn" title="关闭连接和卸载页面是两件事">
              <p><code>host.close()</code> 只关闭连接，不会触发页面 onUnload，也不会移除 iframe；standalone 的 <code>dispose()</code> 才会清理 iframe 和容器。</p>
            </Card>
          </div>
          <div className="stack">
            <Card tag="能力" tone="warn" title="没有能力协商">
              <p>握手会带 capabilities，但宿主没有注入，也没有降级逻辑。不同宿主的能力差异只能靠 apiExtensions 和诊断暴露。</p>
            </Card>
            <Card tag="更新" tone="warn" title="没有热更新">
              <p>产物变化后必须重启或 reload，协议里没有 artifact reload。devtool 的 Reload 会重建整个 iframe 运行时。</p>
            </Card>
            <Card tag="加载" tone="warn" title="没有子包按需加载">
              <p>service bundle 包含所有页面脚本；manifest 记录了 subpackage，但宿主还没有按需下载和执行策略。</p>
            </Card>
            <Card tag="返回" tone="warn" title="单 render 模式缺少 page.ready">
              <p>navigateTo 会补发 <code>{'page.ready({ components })'}</code>；navigateBack 在单 render 模式下不会重新下发组件快照。</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="roadmap"
        kicker="下一步"
        title="接下来先做什么"
        intro="先把常见小程序需要的 API 和组件补上，再处理页面、组件和宿主约定，最后做性能和原生形态。"
      >
        <div className="stack">
          <Card tag="P0" title="补齐宿主 API">
            <p>异步 storage、reLaunch/redirectTo、modal/loading、系统信息异步版；同时把 unsupported API 从“静默返回 undefined”变成可查询的能力清单和明确诊断。</p>
          </Card>
          <Card tag="P0" title="补常用组件">
            <p>navigator、textarea、picker、form、video、rich-text、map；把已有组件的 open-type、表单、颜色和焦点语义补全，并同步扩展组件测试与 P0 fixture。</p>
          </Card>
          <Card tag="P0" title="修复单 render 模式的返回流程">
            <p>让 navigateBack 在单 render 模式下也把 render 返回的组件并入 page.ready，或者让 service 复用已有组件实例；同时补浏览器断言。</p>
          </Card>
          <Card tag="P0" title="宿主加固">
            <p>明确 close 和 dispose 的语义，评估 origin 校验和 sandbox，补齐或删除 capability 字段。</p>
          </Card>
          <Card tag="P1" title="页面能力">
            <p>下拉刷新、分享、页面栈恢复、自定义 tabBar、子包按需加载。</p>
          </Card>
          <Card tag="P1" title="组件高级语义">
            <p>generics、placeholder、definitionFilter、完整内置 behaviors，以及 relations 的边界情况和组件 export 校验。</p>
          </Card>
          <Card tag="P1" title="Canvas 和动画">
            <p>canvas rAF、完整 2D API、触摸到 service 的链路；animation 多 step 时序和事件回调。</p>
          </Card>
          <Card tag="P2" title="性能和稳定性">
            <p>启动耗时、首屏、setData 批量和差量、导航耗时、大列表内存、长时运行，把阈值接进验收。</p>
          </Card>
          <Card tag="P2" title="原生宿主和更多渲染后端">
            <p>用现有的 Transport、渲染后端、canvas 和资源注入接口实现原生宿主；再评估多渲染后端和编译产物抽象化。</p>
          </Card>
        </div>
        <Callout title="关于 docs/next" tone="warn">
          <p>
            仓库里的 Next 方案讨论过抽象组件树、多渲染后端和渲染框架解耦。这些是方向性设计，不是当前实现；
            现在引擎仍以 glass-easel + 浏览器 DOM 渲染后端为核心。
          </p>
        </Callout>
      </Section>

      <Section
        id="invariants"
        kicker="设计约束"
        title="这些约束不能破"
        intro="路线可以调整，但下面的约束一旦破了，现有宿主和测试会一起失效。"
      >
        <Cards>
          <Card title="内核不负责环境"><p><code>packages/runtime</code> 不碰 window、document、iframe 或 MessageChannel；<code>pnpm check:runtime-purity</code> 是硬门槛。</p></Card>
          <Card title="宿主适配器在核心之外"><p>iframe、DOM canvas 和 devtool 覆盖层放在 <code>hosts/browser</code>，内置组件放在 <code>hosts/web-components</code>；核心包不能反向依赖 hosts。</p></Card>
          <Card title="所有宿主共用一个 manifest"><p>编译器、runtime、宿主和 devtool 都读 <code>@tiny/manifest</code>，包括 naming。不要复制一份产物类型。</p></Card>
          <Card title="命名只有一个来源"><p>模板指令、API、别名、behavior scheme、宿主属性和 tag marker 都从 <code>manifest.naming</code> 派生。</p></Card>
          <Card title="跨线程只走 Bridge"><p>不直接读 iframe 全局，也不使用 executeJavaScript；所有控制都走版本化消息。</p></Card>
          <Card title="环境能力靠注入"><p>设备信息走 apiExtensions，canvas 走 canvas 适配器，资源走 resolveAssetUrl，渲染后端和挂载点由宿主提供。</p></Card>
          <Card title="构建产物不入库"><p>宿主产物、组件 ProcGen、devtool 静态文件和站点里的 devtool 都由构建生成；仓库只保留源码、约定和测试 fixture。</p></Card>
          <Card title="验收必须跑真实应用"><p>核心链路要用真实双线程和浏览器操作验证，不能只靠 mock 通过。</p></Card>
        </Cards>
      </Section>

      <Section
        id="next"
        kicker="继续阅读"
        title="按依赖顺序继续看"
        intro="如果要改代码，建议先看边界，再看产物，最后看运行和宿主。"
      >
        <Cards className="three">
          <Card tag="架构" title="先看整体边界"><p>各层职责、内核约束、启动流程和消息转发。</p><p><a href="#/architecture">架构总览 →</a></p></Card>
          <Card tag="编译" title="再看产物"><p>WXML、WXSS、TS 和命名配置如何变成 manifest。</p><p><a href="#/compiler">编译流程 →</a></p></Card>
          <Card tag="运行时" title="然后看执行"><p>双线程、组件语义、样式隔离和 canvas 注入。</p><p><a href="#/runtime">运行时内核 →</a></p></Card>
          <Card tag="协议" title="协议是通信边界"><p>消息格式、错误处理和扩展规则。</p><p><a href="#/protocol">Bridge 协议 →</a></p></Card>
          <Card tag="宿主" title="宿主负责接入环境"><p>host-browser、host-web-components、注入能力和接入步骤。</p><p><a href="#/hosts">宿主适配 →</a></p></Card>
          <Card tag="测试" title="以测试为准"><p>180 个单元测试和 51 个浏览器步骤。</p><p><a href="#/testing">测试与验收 →</a></p></Card>
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
