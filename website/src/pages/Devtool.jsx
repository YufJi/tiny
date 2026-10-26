import React from 'react'
import {
  Callout,
  Card,
  Cards,
  CodeBlock,
  Flow,
  PageHero,
  PageNav,
  Section,
  Table,
} from '../components/ui'

const DEVTOOL_URL = './devtool/index.html'

export default function Devtool() {
  return (
    <>
      <PageHero
        eyebrow="在线调试器"
        title={<>不用安装，<br /><span className="gradient">在浏览器里调试真实运行时</span></>}
        lede="这是 apps/devtool 的生产构建，会随网站一起发布。它通过 @tiny/host-browser 启动 service 和 render 线程，加载 tests/apps 里的真实编译产物，并提供应用列表、设备框、宿主导航、页面导航、生命周期控制、Console 和 Elements。"
        stats={[['5', '测试应用'], ['1', 'service iframe'], ['每页', 'render iframe'], ['3', '应用保活']]}
        pills={[['全部测试应用', 'good'], ['宿主导航和 tabBar', 'good'], ['相对路径', 'good'], ['GitHub Pages', 'good']]}
      />
      <PageNav items={[
        ['live', '在线调试器'],
        ['pipeline', '构建流程'],
        ['host', '调试器宿主'],
        ['contracts', '路径约定'],
        ['limits', '限制'],
      ]} />

      <Section
        id="live"
        kicker="在线运行"
        title="直接打开调试器"
        intro="面板会列出 tests/apps 下的全部测试应用。第一次打开时进入应用列表，点击应用后启动运行时，默认从它的首页开始。"
      >
        <div className="devtool-bar">
          <div className="devtool-bar-copy">
            <span className="devtool-dot" aria-hidden="true" />
            <strong>Tiny Runtime Debugger</strong>
            <code>5 个测试应用</code>
          </div>
          <a className="button ghost" href={DEVTOOL_URL} target="_blank" rel="noreferrer">
            在新标签页打开 ↗
          </a>
        </div>
        <div className="devtool-frame">
          <iframe
            src={DEVTOOL_URL}
            title="Tiny 在线调试器"
            loading="lazy"
            allow="fullscreen"
          />
        </div>
        <Callout title="这里跑的是真实运行时">
          <p>
            iframe 里的面板通过 <code>DevtoolRuntimeClient</code>（来自 <code>@tiny/host-browser</code>）启动线程，
            读取 <code>runtime/apps/&lt;app&gt;/generated</code> 下的 manifest、模板、样式和脚本。
            Console 里的诊断、Elements 里的元素树、Lifecycle 里的时间线，都来自当前这次会话。
          </p>
        </Callout>
      </Section>

      <Section
        id="pipeline"
        kicker="构建流程"
        title="调试器是网站构建的一部分"
        intro="网站不引用 apps/devtool/static 下的开发期产物，而是在构建时生成一份自包含、可以放到任意子路径的副本。"
      >
        <Flow nodes={[
          { step: '01 · 测试应用', title: 'tests/apps/*', detail: 'demo · mini · todo · wechat-demo · echarts', accent: true },
          { step: '02 · 编译', title: 'compileMiniProgram', detail: 'manifest · templates · styles · service/render' },
          { step: '03 · 打包', title: 'rspack build', detail: 'nextHost · nextService · nextRender' },
          { step: '04 · 发布', title: 'Vite publicDir', detail: '.cache/site-public/devtool → dist/devtool' },
          { step: '05 · 嵌入', title: '网站 iframe', detail: './devtool/index.html · 同源静态资源', accent: true },
        ]} />
        <div className="split">
          <div className="stack">
            <Card tag="脚本" title="scripts/build-site-devtool.mjs">
              <p>
                扫描测试应用、编译全部应用、写入 <code>apps.json</code>、调用 rspack 生产构建，
                最后把产物复制到 Vite 的 public 目录。默认发布 <code>tests/apps</code> 下的全部应用；
                需要更小的产物时，可以用 <code>TINY_SITE_DEVTOOL_APPS</code> 只取一部分。
              </p>
            </Card>
            <Card tag="Vite" title="publicDir 指向 .cache">
              <p>
                内嵌产物是构建输出，不进入 git。开发时 Vite 从
                <code>website/.cache/site-public</code> 提供文件；构建时再原样复制到
                <code>website/dist/devtool</code>。
              </p>
            </Card>
          </div>
          <CodeBlock>{`# 只重建内嵌调试器（默认全部 tests/apps）
pnpm site:devtool

# 本地预览：先打包调试器，再启动 Vite
pnpm site:dev

# 产物构建和校验：dist/devtool/ 必须存在，资源必须使用相对路径
pnpm site:check

# 只发布部分测试应用，方便本地快速验证
TINY_SITE_DEVTOOL_APPS=demo,mini pnpm site:build`}</CodeBlock>
        </div>
      </Section>

      <Section
        id="host"
        kicker="调试器宿主"
        title="面板只是 DevtoolRuntimeClient 的界面"
        intro="React 不直接发送协议消息。它订阅 host-browser 投影出来的状态，再把用户操作变成 client 方法。"
      >
        <div className="split">
          <div className="stack">
            <Card tag="RuntimePanel" title="控制器">
              <p>读取 <code>./runtime/apps.json</code>，显示应用列表；点击应用后创建 <code>DevtoolRuntimeClient</code>，加载 manifest，启动运行时，并订阅状态。</p>
              <p>最多同时保留 3 个应用会话，超出后关闭最早打开的应用。关闭应用会释放它自己的 iframe 和页面栈。</p>
            </Card>
            <Card tag="PreviewStage" title="设备壳">
              <p>iPhone X 的 375×812 设备框、自动缩放、状态栏和导航栏；页面设置 <code>navigationStyle: custom</code> 时不渲染宿主导航栏。tabBar 由宿主绘制。</p>
            </Card>
          </div>
          <div className="stack">
            <Card tag="DevtoolToolbar" title="控制区">
              <p>应用选择、当前页面、页面栈和上限、Navigate、Inspect、Reload、Close app、Foreground/Background、Back、SwitchTab。</p>
            </Card>
            <Card tag="DebugPanel" title="观察区">
              <p>Console 显示结构化诊断（最多保留 500 条），Elements 显示 <code>runtime.inspectTree</code> 投影出的元素树，Lifecycle 按顺序记录页面生命周期。</p>
            </Card>
          </div>
        </div>
        <Table
          head={['层', '实现', '职责']}
          rows={[
            [<code>DevtoolRuntimeClient</code>, <code>@tiny/host-browser</code>, '创建线程、bootstrap、导航/前后台/Reload/Close、inspectTree，并维护页面栈和生命周期'],
            [<code>runtimeService.js</code>, 'service 线程入口', '读取 <code>?app=</code>，加载 generated manifest 和 service.js'],
            [<code>runtimeRender.js</code>, 'render 线程入口', '加载 templates/styles，注入渲染后端、canvas、资源解析、挂载钩子和内置组件'],
            [<code>RuntimePanel</code>, 'React/Redux', '应用列表、会话管理、首屏选择、状态订阅和面板组合'],
            [<code>PreviewStage</code>, 'React', '设备框、宿主导航/tabBar、前后台遮罩、加载和错误状态'],
          ]}
        />
      </Section>

      <Section
        id="contracts"
        kicker="路径约定"
        title="同一份构建，放在哪都能用"
        intro="调试器里所有 URL 都相对当前文档解析。这样同一份构建可以放在根路径、/devtool/，也可以放在 GitHub Pages 的 /tiny/devtool/ 下。"
      >
        <Table
          head={['资源', '解析方式', '为什么这样处理']}
          rows={[
            [<code>runtime/apps.json</code>, '相对面板文档 fetch', 'GitHub Pages 会在路径前加 /tiny/'],
            [<code>runtime/apps/&lt;app&gt;/generated</code>, <code>new URL(..., location.href)</code>, '线程 iframe 的文档目录不同，绝对路径会指到站点根'],
            [<><code>next-service.html</code> / <code>next-render.html</code></>, '相对面板文档拼接', '同一份构建要同时服务 / 和 /devtool/'],
            [<><code>nextHost.js</code> / CSS</>, 'rspack publicPath: "./"', '生产产物必须可搬运；dev server 仍使用 "/"'],
          ]}
        />
        <Callout title="iframe 必须同源">
          <p>
            网站通过 <code>&lt;iframe src="./devtool/index.html"&gt;</code> 嵌入调试器。面板和线程页必须同源，
            才能用 <code>fetch</code> 读取生成产物，并用 <code>postMessage</code> 转移 MessagePort。
            因此不要给 iframe 加 sandbox，也不要把调试器拆到独立域名。
          </p>
        </Callout>
      </Section>

      <Section
        id="limits"
        kicker="限制"
        title="在线版本也有边界"
        intro="它是完整的 devtool 静态构建，但仍然只是展示入口，不能替代本地开发流程。"
      >
        <Cards className="three">
          <Card title="全部测试应用"><p>默认发布 <code>tests/apps</code> 下全部 5 个应用，和本地 <code>pnpm dev:devtool</code> 的选择器一致；产物约 10 MiB，已移除 source map。</p></Card>
          <Card title="纯静态"><p>没有服务端，也没有编译接口。产物在网站构建时生成，页面本身不会触发新的编译。</p></Card>
          <Card title="需要 HTTP 服务"><p>直接双击 <code>dist/index.html</code> 无法工作；请用 <code>pnpm site:preview</code> 或任意静态服务器打开。</p></Card>
        </Cards>
      </Section>
    </>
  )
}
