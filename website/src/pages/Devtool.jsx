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
        eyebrow="Live devtool"
        title={<>不用安装，<br /><span className="gradient">直接在浏览器里拆运行时</span></>}
        lede="这是 apps/devtool 的生产构建，作为静态产物随站点一起发布。它启动真实的 service / render 双线程、加载真实的编译产物，并开放应用切换、页面导航、生命周期控制、Console 与 Elements 面板。tests/apps 下的全部测试应用都会随包发布。"
        stats={[['5', 'test apps'], ['2', 'iframe threads'], ['0', 'backend services'], ['100%', 'static assets']]}
        pills={[['all tests/apps', 'good'], ['relative URLs', 'good'], ['GitHub Pages', 'good']]}
      />
      <PageNav items={[
        ['live', '在线调试器'],
        ['pipeline', '产物链路'],
        ['contracts', '路径契约'],
        ['limits', '边界'],
      ]} />

      <Section
        id="live"
        kicker="Live"
        title="在线调试器"
        intro="面板列出 tests/apps 下的全部 fixture，默认从 tests/apps/demo 启动。所有编译产物、线程入口和调试器 UI 都来自同一次静态构建。"
      >
        <div className="devtool-bar">
          <div className="devtool-bar-copy">
            <span className="devtool-dot" aria-hidden="true" />
            <strong>Tiny Runtime Debugger</strong>
            <code>5 test apps</code>
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
        <Callout title="这是真实运行时，不是录屏">
          <p>
            iframe 内的面板通过 <code>DevtoolRuntimeClient</code> 启动两个独立线程，读取
            <code>runtime/apps/&lt;app&gt;/generated</code> 下的 manifest、模板、样式与脚本；
            顶部下拉框可以在 demo、mini、Taro 3、WeChat demo 与 ECharts 之间切换。
            Console 中的诊断、Elements 中的元素树都来自当前这次会话。
          </p>
        </Callout>
      </Section>

      <Section
        id="pipeline"
        kicker="Build pipeline"
        title="devtool 是站点构建的一部分"
        intro="站点不引用 apps/devtool/static 下的开发期产物，而是在构建时生成一份自包含、可放到任意子路径的副本。"
      >
        <Flow nodes={[
          { step: '01 · FIXTURE', title: 'tests/apps/*', detail: 'demo · mini · todo · wechat-demo · echarts', accent: true },
          { step: '02 · COMPILE', title: 'compileMiniProgram', detail: 'manifest · templates · styles · service/render' },
          { step: '03 · BUNDLE', title: 'rspack build', detail: 'nextHost · nextService · nextRender' },
          { step: '04 · PUBLISH', title: 'Vite publicDir', detail: '.cache/site-public/devtool → dist/devtool' },
          { step: '05 · EMBED', title: 'website iframe', detail: './devtool/index.html · 同源静态资源', accent: true },
        ]} />
        <div className="split">
          <div className="stack">
            <Card tag="script" title="scripts/build-site-devtool.mjs">
              <p>
                发现 fixture、编译全部应用、写入 <code>apps.json</code>、调用 rspack 生产构建，
                最后把整份产物复制到 Vite 的 public 目录。默认发布 <code>tests/apps</code>
                下全部应用；需要更小的产物时可用 <code>TINY_SITE_DEVTOOL_APPS</code> 取子集。
              </p>
            </Card>
            <Card tag="vite" title="publicDir 指向 .cache">
              <p>
                内嵌产物是构建输出，不进入 git。开发时 Vite 从
                <code> website/.cache/site-public</code> 提供文件；构建时 Vite 再原样复制到
                <code> website/dist/devtool</code>。
              </p>
            </Card>
          </div>
          <CodeBlock>{`# 只重建内嵌 devtool（默认全部 tests/apps）
pnpm site:devtool

# 本地预览：先打包 devtool，再启动 Vite
pnpm site:dev

# 产物构建与校验：dist/devtool/ 必须存在且资源相对
pnpm site:check

# 只发布部分 fixture（例如本地快速验证）
TINY_SITE_DEVTOOL_APPS=demo,mini pnpm site:build`}</CodeBlock>
        </div>
      </Section>

      <Section
        id="contracts"
        kicker="Path contract"
        title="一条相对路径贯穿三层文档"
        intro="devtool 的面板页、service/render 线程页都位于同一个目录；所有产物 URL 都相对当前文档解析，因此部署前缀不影响启动。"
      >
        <Table
          head={['位置', '解析方式', '为什么不能写死 /']}
          rows={[
            [<code>runtime/apps.json</code>, '相对面板文档 fetch', 'GitHub Pages 会加 /tiny/ 前缀'],
            [<code>runtime/apps/&lt;app&gt;/generated</code>, <code>new URL(..., location.href)</code>, '线程 iframe 的文档目录不同，绝对路径会指到站点根'],
            [<><code>next-service.html</code> / <code>next-render.html</code></>, '相对面板文档拼接', '同一份构建要同时服务 / 与 /devtool/'],
            [<><code>nextHost.js</code> / CSS</>, 'rspack publicPath: "./"', '生产产物必须可搬运；dev server 仍用 "/"'],
          ]}
        />
        <Callout title="iframe 同源">
          <p>
            站点页面通过 <code>&lt;iframe src="./devtool/index.html"&gt;</code> 嵌入调试器。面板与两条线程页
            同源，才能用 <code>fetch</code> 读取生成产物、用 <code>postMessage</code> 转移 MessagePort。
            因此不要给 iframe 加 sandbox，也不要把调试器拆到独立域名。
          </p>
        </Callout>
      </Section>

      <Section
        id="limits"
        kicker="Boundaries"
        title="在线版本仍然有这些边界"
        intro="它是完整的 devtool 静态构建，但仍然是展示入口，不替代本地开发流程。"
      >
        <Cards className="three">
          <Card title="全量 fixture"><p>默认发布 <code>tests/apps</code> 下全部应用（当前 5 个），下拉框与本地 <code>pnpm dev:devtool</code> 一致；产物约 26 MiB。</p></Card>
          <Card title="纯静态"><p>没有服务端、没有编译接口。产物在站点构建时生成，页面不会触发新的编译。</p></Card>
          <Card title="需要 HTTP"><p>直接双击 <code>dist/index.html</code> 无法工作；用 <code>pnpm site:preview</code> 或静态服务器。</p></Card>
        </Cards>
      </Section>
    </>
  )
}
