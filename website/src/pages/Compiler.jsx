import React from 'react'
import {
  Callout,
  Card,
  Cards,
  CodeBlock,
  PageHero,
  PageNav,
  Section,
  Sequence,
  Table,
} from '../components/ui'

export default function Compiler() {
  return (
    <>
      <PageHero
        eyebrow="Compiler"
        title={<>从 WXML 到 manifest，<br /><span className="gradient">一次编译，处处消费</span></>}
        lede="tools/cli 是唯一的产物生产者。它发现页面与组件，解析 naming 配置，把 WXML 编成 ProcGen、把 WXSS 编成带作用域前缀的 CSS、把 TS/JS 打包成 service bundle，最后写出一份所有宿主共享的 manifest。"
        stats={[['1', 'compiler tool'], ['6', 'artifact kinds'], ['1', 'manifest schema'], ['0', 'runtime WXML parsing']]}
      />
      <PageNav items={[
        ['pipeline', '流水线'],
        ['discovery', '入口发现'],
        ['naming', '命名契约'],
        ['templates', '模板编译'],
        ['styles', '样式编译'],
        ['scripts', '脚本与服务包'],
        ['manifest', 'Manifest'],
        ['output', '产物树'],
        ['diagnostics', '诊断'],
        ['limits', '边界'],
      ]} />

      <Section
        id="pipeline"
        kicker="Pipeline"
        title="十一个阶段，一次全量构建"
        intro="compileMiniProgram 是一个 async 编排器；每个阶段只产出 artifact 或 diagnostic，不直接和 runtime 交互。"
      >
        <Sequence steps={[
          {
            title: '解析项目根',
            detail: '读取 sourceDir/project.config.json 的 miniprogramRoot；不存在时把 sourceDir 当作小程序根。',
            code: 'resolveRoot()',
          },
          {
            title: '扫描源文件',
            detail: '递归收集 .js/.ts/.wxml/.wxss/.wxs/.sjs，跳过 .git、.cache、node_modules。',
            code: 'collectFiles(root, extensions)',
          },
          {
            title: '读取 app.json',
            detail: '解析 pages 与 subPackages/subpackages；至少需要一个页面，否则记 APP_PAGES_REQUIRED。',
            code: 'readAppConfig() · resolvePagePaths()',
          },
          {
            title: '读取 naming 配置',
            detail: '读取 sourceDir/tiny.config.json 的 naming；显式 CompileOptions 覆盖文件配置。默认使用 wx- 命名空间。',
            code: 'readProjectNaming() · resolveNaming()',
          },
          {
            title: '解析入口',
            detail: '每个 path 同时尝试 foo.* 与 foo/index.*，分别找 script/template/style/config 四件套。',
            code: 'resolveEntry(root, byRelative, path)',
          },
          {
            title: '发现组件',
            detail: '从 app.json 和每个页面/组件的 usingComponents 递归发现，记录全局/局部来源并检测缺失。',
            code: 'resolveComponentEntries()',
          },
          {
            title: '编译脚本',
            detail: '从入口沿 import/require 图收集可达脚本，TS 转译、改写无扩展名 specifier、输出 source map。',
            code: 'compileScripts()',
          },
          {
            title: '编译模板',
            detail: '全部 WXML 放进一个 TmplGroup，处理 import/include/template、WXS/SJS、scope 标记与 animation。',
            code: 'compileTemplates()',
          },
          {
            title: '编译样式',
            detail: 'app.wxss 保持全局；页面/组件 WXSS 加 class 与 tag 作用域，rpx 转 vw，内联 @import。',
            code: 'compileStyles()',
          },
          {
            title: '复制资源',
            detail: '图片与字体按原相对路径复制；小图同时会被模板编译期内联为 data URI。',
            code: 'copyAssets()',
          },
          {
            title: '生成 manifest 与入口',
            detail: '汇总 artifact 和诊断，写 manifest.json；生成 service.js / render.js 并 esbuild 打包 service。',
            code: 'createManifest() · writeEntryArtifacts()',
          },
        ]} />
      </Section>

      <Section
        id="discovery"
        kicker="Discovery"
        title="入口与组件的解析规则"
        intro="编译器的发现规则决定了 service 侧 Page/Component 的注册顺序，这是运行时的一条隐式契约。"
      >
        <Cards>
          <Card tag="entry" title="文件或目录入口">
            <p>页面/组件路径既可以是文件（<code>pages/todos/todos</code>），也可以是目录（<code>components/add-button</code>，自动找 <code>index.*</code>）。</p>
            <p>脚本优先 <code>.js</code>，其次 <code>.ts</code>；模板与样式分别找 <code>.wxml</code> / <code>.wxss</code>。</p>
          </Card>
          <Card tag="pages" title="主包与分包">
            <p><code>app.json.pages</code> 在前，<code>subPackages[].pages</code> 按 <code>root + page</code> 拼接在后。分包只影响路径，不改变加载策略。</p>
            <p>页面顺序就是 manifest 中 <code>pages</code> 的顺序。</p>
          </Card>
          <Card tag="components" title="全局与局部合并">
            <p>页面配置 = 全局 <code>usingComponents</code> + 页面局部配置，局部优先。manifest 同时记录 <code>usingComponents</code> 和 <code>usingComponentsSource</code>（global/local）。</p>
            <p>组件依赖递归发现，已访问路径会去重。</p>
          </Card>
          <Card tag="bodyType" title="页面还是组件">
            <p>CLI 直接扫描入口脚本，匹配 <code>/\bComponent\s*\(/</code>。命中则 <code>bodyType = 'component'</code>，表示“组件作为页面启动”。</p>
            <p>这是文本级判断，不做完整静态分析。</p>
          </Card>
        </Cards>
        <Callout title="顺序契约" tone="warn">
          <p>
            service 线程按 manifest 中 <code>pages</code>（过滤掉 bodyType=component）的顺序依次把 <code>Page()</code> 调用绑定到路径，
            组件则按“组件型页面 + components”顺序绑定。改变 CLI 的排序而不改 runtime，会把页面定义挂到错误路径上。
          </p>
        </Callout>
      </Section>

      <Section
        id="naming"
        kicker="Naming"
        title="命名空间也是编译产物"
        intro="Tiny 不再把 wx 写死在引擎里。指令、API 全局、behavior scheme、host attribute、tag marker 都由同一份 naming 配置派生，并随 manifest 下发给 runtime。"
      >
        <div className="split">
          <CodeBlock>{`// tests/apps/my-app/tiny.config.json
{
  "naming": {
    "prefix": "tiny-",
    "apiAliases": ["wx"]
  }
}

// 等价简写
{
  "prefix": "tiny-",
  "apiAliases": ["wx"]
}

// CompileOptions 优先于文件配置
compileMiniProgram({
  sourceDir, outputDir,
  naming: { prefix: 'acme-', api: 'acme' },
})`}</CodeBlock>
          <div className="stack">
            <Card tag="default" title="默认：wx-">
              <p>保持微信兼容：<code>wx:if</code>、<code>wx.getStorageSync()</code>、<code>wx-base</code>、<code>wx://component-export</code>、<code>wx-host</code>、<code>wx-tag-button</code>。</p>
            </Card>
            <Card tag="custom" tone="violet" title="自定义：tiny- / acme-">
              <p>切换后指令变成 <code>tiny:if</code>，API 全局变成 <code>tiny</code>，behavior scheme 变成 <code>tiny://</code>，host attribute 与 tag marker 也同步变化。</p>
              <p><code>apiAliases</code> 可保留 <code>wx</code>，让第三方微信库继续工作。</p>
            </Card>
          </div>
        </div>
        <Table
          head={['表面', '默认 wx-', '自定义 tiny-', '消费方']}
          rows={[
            ['模板指令', <code>wx:if</code>, <code>tiny:if</code>, 'TmplGroup directivePrefix'],
            ['API 全局', <code>wx</code>, <><code>tiny</code>（+ aliases）</>, 'service installMiniProgramGlobals'],
            ['内置 behavior', <code>wx-base</code>, <code>tiny-base</code>, '内置组件 behaviors'],
            ['内置 behavior scheme', <code>wx://component-export</code>, <code>tiny://component-export</code>, 'component-definition'],
            ['组件 host 属性', <code>wx-host</code>, <code>tiny-host</code>, 'adapter inspectTree / stylesheet compiler'],
            ['tag marker class', <code>wx-tag-button</code>, <code>tiny-tag-button</code>, 'template 注入 + WXSS tag 选择器'],
            ['内置组件 tag', <code>&lt;view&gt;</code>, <><code>&lt;view&gt;</code>（不变）</>, '内置组件 tag 表'],
          ]}
        />
        <Callout title="解析后的 naming 进入 manifest" >
          <p>
            compiler 把 <code>resolveNaming()</code> 的结果写进 <code>manifest.naming</code>；service 用它安装 API 全局与别名，
            adapter 用它选择 behavior 前缀与 host attribute。配置文件损坏时只产生 <code>TINY_CONFIG_INVALID</code> warning，并回退默认命名。
          </p>
        </Callout>
      </Section>

      <Section
        id="templates"
        kicker="Template compiler"
        title="WXML 变成 ProcGen，不在运行时解析"
        intro="模板编译是 engines 里最像编译器的一部分：词法/语法解析、表达式生成、绑定表复用、WXS 打包，全部发生在构建期。"
      >
        <div className="split">
          <Card tag="TmplGroup" title="一棵共享模板树">
            <ul>
              <li>所有 WXML 放进同一个 group，页面/组件通过 path 取自己的 ProcGen</li>
              <li><code>import</code> / <code>include</code> 解析为模板依赖</li>
              <li><code>template name</code> 生成命名子模板</li>
              <li>WXS/SJS 同时以带扩展名和不带扩展名注册，兼容两种引用写法</li>
              <li>生成签名是 <code>R,C,D,U,A</code>，更新时复用绑定表 <code>A</code></li>
            </ul>
          </Card>
          <Card tag="template output" tone="violet" title="templates.js">
            <p>产物不是字符串模板，而是一段可执行的 JavaScript 表达式：</p>
            <CodeBlock>{`const groupList = (() => {
  const G = {}
  // ... 每个 path 对应一个 ProcGen group
  return G
})()

export default {
  groupList,
  content(path, name = "") {
    const group = groupList[path]
    if (!group) throw new Error(\`template not found: \${path}\`)
    return group(name)
  },
}`}</CodeBlock>
          </Card>
        </div>

        <Table
          head={['处理', '实现', '目的']}
          rows={[
            ['WXML 解析', 'parse/state.ts · parse/tag.ts · parse/expr.ts', '标签、属性、表达式、事件绑定、meta 标签'],
            ['ProcGen', 'proc_gen/tag.ts · expr.ts · writer.ts', '生成 glass-easel 可执行的创建/更新函数'],
            ['WXS / SJS', 'TmplGroup.addScript + WXS runtime', '模板内可调用脚本模块，支持 require 相对路径'],
            ['scope 标记', 'injectTagClasses()', <>给每个元素加 <code>{'<tagClassPrefix><tag>'}</code>（默认 <code>wx-tag-button</code>），供 tag 选择器作用域改写</>],
            ['animation', 'rewriteAnimationAttributes()', <>把 <code>{'animation="{{...}}"'}</code> 改写为内联 style</>],
            ['图片内联', 'inlineLocalImages()', '≤200KB 的本地图片转 data URI，静态宿主无需资源目录'],
          ]}
        />

        <CodeBlock>{`<!-- 源 WXML（默认 wx- 命名） -->
<button class="primary" bindtap="submit">保存</button>

<!-- 编译器注入 tag marker（存在同名 wxss 时 scope = tiny-pages-form-form） -->
<button class="primary wx-tag-button" bindtap="submit">保存</button>

<!-- 同目录 WXSS：button { color: red } -->
<!-- 产物 CSS：.tiny-pages-form-form--wx-tag-button { color: red } -->

<!-- tiny- 命名下 marker 变成 tiny-tag-button，WXSS 前缀同步变化 -->`}</CodeBlock>
        <Callout title="没有运行时 WXML 解析器">
          <p>
            render 线程只拿到模板 group 并交给 glass-easel 的模板引擎；它不读 <code>.wxml</code>，也不在运行时求值 WXML 语法。
            这样模板错误会在构建期暴露，运行时启动成本也不随模板体积线性增加。
          </p>
        </Callout>
      </Section>

      <Section
        id="styles"
        kicker="Stylesheet compiler"
        title="class 与 tag 两条作用域"
        intro="页面/组件的 WXSS 不会泄漏到全局；app.wxss 则明确保持全局。rpx 在编译期换成 vw。"
      >
        <div className="split">
          <div className="stack">
            <Card tag="scope naming" title="每份页面/组件样式一个 scope">
              <p>scope 形如 <code>tiny-pages-todos-todos</code>：<code>scopePrefix</code> + 路径中非字母数字替换为 <code>-</code>。它与 naming prefix 相互独立。</p>
              <p><code>app.wxss</code> 没有 scope，作为全局样式注册。</p>
            </Card>
            <Card tag="transform" title="两个前缀同时工作">
              <ul>
                <li>class：<code>.card</code> → <code>.tiny-pages-todos-todos--card</code></li>
                <li>tag：<code>button</code> → <code>.tiny-pages-todos-todos--wx-tag-button</code>（前缀随 naming 变化）</li>
                <li><code>page</code> 例外：页面根节点没有 marker class，保持 <code>page</code></li>
                <li><code>@keyframes</code> 内不做 tag 改写</li>
                <li><code>:host</code> 使用 <code>hostAttribute</code>（默认 <code>wx-host</code>）</li>
              </ul>
            </Card>
            <Card tag="rpx" title="750 基准换 vw">
              <p><code>value × 100 / rpxRatio</code>，默认 750，保留 6 位有效精度；<code>calc()</code> 内的 rpx 也会转换。</p>
            </Card>
          </div>
          <div className="stack">
            <CodeBlock>{`/* app.wxss：全局 */
page { background: #f5f5f5; }
.card { padding: 24rpx; }

/* pages/todos/todos.wxss：局部 */
.card { border: 1px solid #ddd; }   /* -> .tiny-pages-todos-todos--card */
button { height: 88rpx; }            /* -> .tiny-pages-todos-todos--wx-tag-button */`}</CodeBlock>
            <Callout title="低优先级 CSS 的现状" tone="warn">
              <p>
                CLI 会同时写出 <code>*.low.css</code>，但当前没有启用 <code>convertHost</code>，所以低优先级输出为空；
                runtime 也只加载普通 CSS。这个通道保留给未来 style isolation / <code>:host</code> 语义。
              </p>
            </Callout>
          </div>
        </div>
        <Callout title="style scope 在 render 侧注册">
          <p>
            编译器只负责生成 CSS 与 scope 名称；render 线程用 <code>StyleScopeManager.register(scope)</code> 取得数字 scope id，
            并在定义页面/组件时传给 glass-easel。注册顺序必须是“先样式、后组件定义”，否则组件拿不到 scope。
          </p>
        </Callout>
      </Section>

      <Section
        id="scripts"
        kicker="Scripts & bundles"
        title="TS 转译、模块改写、service 打包"
        intro="脚本处理分两步：先把每个可达脚本转成独立 ESM，再只把 service 入口打成一个 bundle。"
      >
        <Sequence steps={[
          {
            title: '收集可达脚本',
            detail: '从 app、页面、组件入口出发，解析 import/export 与 require 的静态字面量，按 .js/.ts/.tsx、index.* 规则解析。',
            code: 'collectReachableScripts() · queueLocalScript()',
          },
          {
            title: 'TypeScript 转译',
            detail: 'ts.transpileModule 输出 ESNext + ESNext modules + source map；诊断带行列号。只做转译，不做类型检查。',
            code: 'target: ESNext · module: ESNext',
          },
          {
            title: '重写相对 specifier',
            detail: '浏览器 ESM 需要显式扩展名。把 ./foo 改成 ./foo.js，目录入口改成 ./foo/index.js；裸模块名保持不变。',
            code: 'rewriteRelativeModuleSpecifiers()',
          },
          {
            title: '生成 service.js 入口',
            detail: '入口包含 app、所有页面和所有组件的脚本 import。App/Page/Component 调用在导入时执行，注册到 service registry。',
            code: "import './scripts/app.js' ...",
          },
          {
            title: 'esbuild 打包 service',
            detail: 'format=esm、platform=browser、target=es2019、bundle、sourcemap。ECharts 这类 CJS/UMD 依赖在这一步被吸收。',
            code: 'bundle() · SCRIPT_BUNDLE_ERROR = warning',
          },
          {
            title: '生成 render.js',
            detail: 'render 入口只 re-export templates；组件逻辑不在 render 侧。',
            code: 'render.js',
          },
        ]} />
        <Callout title="打包失败不是致命错误" tone="warn">
          <p>
            <code>SCRIPT_BUNDLE_ERROR</code> 只记 warning，manifest 仍会写出。此时 service 线程导入 bundle 会失败，
            错误表现为启动诊断而不是编译失败。排查时要同时看编译诊断和 <code>BOOTSTRAP_ERROR</code>。
          </p>
        </Callout>
      </Section>

      <Section
        id="manifest"
        kicker="Contract"
        title="manifest 是编译器的唯一出口"
        intro="所有路径都是相对输出目录的 POSIX 路径；宿主和 runtime 不应知道源码目录。"
      >
        <div className="split">
          <CodeBlock>{`{
  "schemaVersion": 1,
  "naming": {
    "prefix": "wx-",
    "directive": "wx",
    "api": "wx",
    "apiAliases": [],
    "hostAttribute": "wx-host",
    "tagClassPrefix": "wx-tag-",
    "behaviorPrefix": "wx-",
    "behaviorScheme": "wx://"
  },
  "entries": {
    "service": "service.js",
    "render": "render.js",
    "templates": "templates.js"
  },
  "app": {
    "path": "app",
    "script": { "path": "scripts/app.js", "sourcePath": "app.js" },
    "style": { "path": "app.wxss", "outputPath": "styles/app.wxss.css" },
    "configuration": {
      "path": "app",
      "effective": { "pages": ["..."], "window": { "..." : "..." } }
    }
  },
  "pages": [{
    "path": "pages/todos/todos",
    "bodyType": "page",
    "script": { "path": "scripts/pages/todos/todos.js", "sourcePath": "..." },
    "template": { "path": "pages/todos/todos", "outputPath": "templates.js" },
    "style": { "path": "pages/todos/todos.wxss", "scope": "tiny-pages-todos-todos", "outputPath": "..." },
    "configuration": {
      "effective": { "usingComponents": { "add-button": "../../components/add-button/add-button" } },
      "usingComponentsSource": { "add-button": "global" }
    }
  }],
  "components": [],
  "styles": [],
  "assets": [],
  "diagnostics": []
}`}</CodeBlock>
          <div className="stack">
            <Card title="字段语义">
              <ul>
                <li><code>naming</code>：解析后的命名配置，runtime / adapter 直接消费</li>
                <li><code>app</code>：App 脚本、全局样式、app.json 的有效配置</li>
                <li><code>pages</code> / <code>components</code>：入口、模板、样式、配置</li>
                <li><code>styles</code>：所有样式（含 app），带 scope 与低优先级路径</li>
                <li><code>assets</code>：复制到输出目录的静态资源</li>
                <li><code>diagnostics</code>：编译期诊断，随 manifest 一起被 host 读取</li>
              </ul>
            </Card>
            <Card title="消费者">
              <ul>
                <li>service：注册表、页面路径、组件 schema、配置</li>
                <li>render：模板、样式、组件 schema、页面 artifact</li>
                <li>host：加载入口、收集编译诊断</li>
                <li>devtool：显示应用列表与诊断</li>
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="output"
        kicker="Output"
        title="实际产物树"
        intro="以测试宿主的 tests/host/generated 为例；目录内容随 fixture 变化。"
      >
        <CodeBlock>{`generated/
|-- manifest.json            # 唯一索引
|-- service.js               # esbuild 打包后的服务线程入口
|-- service.js.map
|-- render.js                # 只导出 templates
|-- templates.js             # groupList + content(path, name)
|-- scripts/
|   |-- app.js
|   |-- components/add-button/add-button.js
|   +-- pages/todos/todos.js
|-- styles/
|   |-- app.wxss.css         # 全局
|   |-- pages/todos/todos.wxss.css
|   |-- pages/todos/todos.wxss.low.css   # 当前为空
|   +-- **.map
|-- logo.svg                 # 资源按原路径复制
+-- assets/**`}</CodeBlock>
        <div className="split">
          <Card tag="source maps" title="脚本与样式都带 map">
            <p>TS 转译与 PostCSS 都会输出 source map，并写入 <code>sourcesContent</code>。浏览器 DevTools 可以直接定位回 WXML/WXSS/TS。</p>
          </Card>
          <Card tag="no minify" title="产物保持可读">
            <p>当前编译器不做 minify，也不做 tree-shaking（除 esbuild bundle 自身）。调试器与验收因此能直接读生成的脚本和模板。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="diagnostics"
        kicker="Diagnostics"
        title="结构化诊断，不用 console"
        intro="编译器把所有问题收进 CompileResult.diagnostics，并同时写进 manifest。"
      >
        <Table
          head={['Code', '级别', '触发条件', '后续行为']}
          rows={[
            [<code>INVALID_JSON</code>, 'error', 'app.json / 页面配置无法解析', '返回空对象并继续'],
            [<code>APP_PAGES_REQUIRED</code>, 'error', 'app.json 没有 pages', 'manifest 仍生成'],
            [<code>PAGE_NOT_FOUND</code>, 'error', '声明的页面没有脚本或模板', '跳过该入口'],
            [<code>COMPONENT_NOT_FOUND</code>, 'error', 'usingComponents 指向不存在的入口', '登记诊断'],
            [<code>SCRIPT_TRANSPILE_ERROR</code>, 'error', 'TS 语法/转译失败', '保留输出，继续'],
            [<code>SCRIPT_IMPORT_NOT_FOUND</code>, 'warning', '相对 import 解析不到文件', '不进入可达图'],
            [<code>TEMPLATE_COMPILE_ERROR</code>, 'error', 'WXML 解析失败', '跳过模板 group 生成'],
            [<code>TINY_CONFIG_INVALID</code>, 'warning', 'tiny.config.json 无法解析', '回退默认命名'],
            [<code>STYLE_IMPORT_NOT_FOUND</code>, 'warning', '@import 解析不到目标', '内联为空串'],
            [<code>STYLE_COMPILE_ERROR</code>, 'error', 'PostCSS 解析/转换失败', '跳过该样式'],
            [<code>SCRIPT_BUNDLE_ERROR</code>, 'warning', 'esbuild 打包失败', 'manifest 仍生成，启动时暴露'],
          ]}
        />
        <Callout title="编译诊断会进入 runtime">
          <p>
            host 创建 <code>HostDiagnosticStore</code> 时会把 <code>manifest.diagnostics</code> 转成 <code>RuntimeDiagnostic</code>，
            所以 devtool 能同时看到编译错误和运行时错误，而不需要另开一个构建日志面板。
          </p>
        </Callout>
      </Section>

      <Section
        id="limits"
        kicker="Limits"
        title="当前编译器的边界"
        intro="这些不是 bug，而是尚未实现的阶段。了解它们能避免把构建问题误判为 runtime 问题。"
      >
        <Cards>
          <Card tag="rebuild" tone="warn" title="只有全量构建">
            <p><code>compileMiniProgram</code> 每次清空输出并全量重编；<code>clean</code> 默认 true。没有增量图，也没有缓存。</p>
            <p>devtool 的 watch 是外部脚本 250ms debounce 后再次全量构建。</p>
          </Card>
          <Card tag="dev flag" tone="warn" title="dev 目前不影响产物">
            <p><code>CompileOptions.dev</code> 被保存但未参与输出；模板始终使用 <code>TmplGroup.newDev()</code>，也没有生产压缩模式。</p>
          </Card>
          <Card tag="analysis" tone="warn" title="文本级判断">
            <p><code>bodyType</code> 靠正则匹配 <code>Component(</code>；动态注册、条件导出、别名调用等写法无法识别。</p>
          </Card>
          <Card tag="styles" tone="warn" title="编译期只管 scope">
            <p>编译器生成 class/tag scope 与 <code>hostAttribute</code>，但 <code>styleIsolation</code>、<code>addGlobalClass</code>、<code>shared</code> 的 CSS 组合发生在 render adapter；<code>:host</code> 低优先级输出仍未启用。</p>
          </Card>
          <Card tag="platform" tone="warn" title="Node 工具">
            <p>编译器依赖 fs、typescript、esbuild 和 PostCSS，只能在构建期运行；它不会进入浏览器线程。</p>
          </Card>
          <Card tag="assets" tone="warn" title="资源分两段处理">
            <p>编译器按原路径复制图片/字体，并把 WXML 中 ≤200KB 的本地图片内联为 data URI；更大的资源与 CSS <code>url()</code> 由宿主 <code>resolveAssetUrl</code> 在 render 侧解析。</p>
          </Card>
        </Cards>
        <Callout title="下一层">
          <p>
            想知道这些产物如何被消费，继续读 <a href="#/runtime">运行时内核</a>；想知道宿主如何加载它们，读 <a href="#/hosts">宿主支持</a>。
          </p>
        </Callout>
      </Section>
    </>
  )
}
