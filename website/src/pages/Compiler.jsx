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
        eyebrow="编译器"
        title={<>从 WXML 到 manifest，<br /><span className="gradient">完整拆解编译流程</span></>}
        lede="tools/cli 是 Tiny 的产物生成工具。它先找到页面和组件，读取命名配置，再把 WXML 编成 ProcGen、WXSS 编成带作用域的 CSS、TS/JS 打包成 service bundle，最后生成一份所有宿主都能读取的 manifest。"
        stats={[['1', '编译工具'], ['6', '产物类型'], ['1', 'manifest 版本'], ['0', '运行时 WXML 解析']]}
      />
      <PageNav items={[
        ['pipeline', '编译流程'],
        ['discovery', '入口规则'],
        ['naming', '命名配置'],
        ['templates', '模板编译'],
        ['styles', '样式编译'],
        ['scripts', '脚本打包'],
        ['manifest', 'manifest'],
        ['output', '产物目录'],
        ['diagnostics', '诊断'],
        ['limits', '限制'],
      ]} />

      <Section
        id="pipeline"
        kicker="编译流程"
        title="十一个阶段，一次全量构建"
        intro="compileMiniProgram 会按顺序执行这些阶段。每个阶段只生成产物或诊断，不会直接调用 runtime。"
      >
        <Sequence steps={[
          {
            title: '解析项目根目录',
            detail: '读取 compatibility.files.projectConfig 指向的项目配置及其 miniprogramRoot；没有该文件时把 sourceDir 当作小程序根目录。',
            code: 'resolveRoot()',
          },
          {
            title: '扫描源文件',
            detail: '按 compatibility.extensions 递归收集脚本、模板、样式、模板脚本和配置文件，跳过 .git、.cache 和 node_modules。',
            code: 'collectFiles(root, extensions)',
          },
          {
            title: '读取小程序配置',
            detail: '读取 compatibility.files.appConfig 指向的配置，解析 pages 和 subPackages/subpackages。至少要有一个页面，否则记一条 APP_PAGES_REQUIRED 诊断。',
            code: 'readAppConfig() · resolvePagePaths()',
          },
          {
            title: '解析兼容输入',
            detail: '读取 sourceDir/tiny.config.json 的 compatibility；CompileOptions.compatibility 显式覆盖。缺省字段回退到微信规则。',
            code: 'readProjectCompatibility() · resolveCompatibility()',
          },
          {
            title: '解析入口',
            detail: '每个路径同时尝试 foo.* 和 foo/index.*，按兼容配置中的扩展名查找 script、template、style 和 config。',
            code: 'resolveEntry(root, byRelative, path)',
          },
          {
            title: '查找组件',
            detail: '从 app 配置和每个页面、组件的 usingComponents 递归查找，记录全局/局部来源，并检查缺失。',
            code: 'resolveComponentEntries()',
          },
          {
            title: '编译脚本',
            detail: '从入口沿 import/require 收集可达脚本，转译 TypeScript，补全无扩展名的模块路径，并输出 source map。',
            code: 'compileScripts()',
          },
          {
            title: '编译模板',
            detail: '把所有模板文件放进同一个 TmplGroup，处理 import/include/template、模板脚本、作用域标记和 animation。',
            code: 'compileTemplates()',
          },
          {
            title: '编译样式',
            detail: 'app 样式保持全局；页面和组件样式加固定 Tiny class/tag scope；rpx 转成 vw；内联 @import。',
            code: 'compileStyles()',
          },
          {
            title: '复制资源',
            detail: '图片和字体按原相对路径复制；小图还会在模板编译阶段内联成 data URI。',
            code: 'copyAssets()',
          },
          {
            title: '生成 manifest 和入口',
            detail: '汇总产物、runtimeCompatibility 和诊断，写出 manifest.json；生成 service.js、render.js，并用 esbuild 打包 service。',
            code: 'createManifest() · writeEntryArtifacts()',
          },
        ]} />
      </Section>

      <Section
        id="discovery"
        kicker="入口规则"
        title="页面和组件是怎么找到的"
        intro="编译器的入口规则会影响 service 线程里 Page/Component 的注册顺序，这是运行时依赖的一条隐式约定。"
      >
        <Cards>
          <Card tag="entry" title="文件入口和目录入口">
            <p>页面或组件路径可以指向文件（<code>pages/todos/todos</code>），也可以指向目录（<code>components/add-button</code>，编译器会自动查找 <code>index.*</code>）。</p>
            <p>脚本、模板、样式和配置的扩展名顺序来自 <code>compatibility.extensions</code>。</p>
          </Card>
          <Card tag="pages" title="主包和分包">
            <p><code>appConfig.pages</code> 排在前面，<code>subPackages[].pages</code> 按 <code>root + page</code> 拼接后排在后面。分包只影响路径，不改变加载策略。</p>
            <p>页面的先后顺序，就是 manifest 里 <code>pages</code> 的顺序。</p>
          </Card>
          <Card tag="components" title="全局组件和页面组件">
            <p>页面配置由全局 <code>usingComponents</code> 和页面局部配置合并而成，局部配置优先。manifest 会同时记录 <code>usingComponents</code> 和 <code>usingComponentsSource</code>（global/local）。</p>
            <p>组件依赖会递归查找，已经访问过的路径会去重。</p>
          </Card>
          <Card tag="bodyType" title="页面还是组件型页面">
            <p>CLI 会扫描入口脚本，匹配 <code>compatibility.globals.component</code> 对应的调用。命中时把 <code>bodyType</code> 标成 <code>component</code>，表示这个页面由 Component 定义启动。</p>
            <p>这只是文本级判断，不做完整的静态分析。</p>
          </Card>
        </Cards>
        <Callout title="注册顺序不能乱" tone="warn">
          <p>
            service 线程会按 manifest 里 <code>pages</code> 的顺序（过滤掉 bodyType=component）依次把 <code>Page()</code> 调用绑定到路径，
            组件则按“组件型页面 + components”的顺序绑定。只改 CLI 的排序而不改 runtime，页面定义就会挂到错误路径上。
          </p>
        </Callout>
      </Section>

      <Section
        id="naming"
        kicker="兼容输入"
        title="输入格式可配，内部命名固定"
        intro="扩展名、模板指令、API 全局、注册全局和 behavior scheme 属于兼容输入层；Tiny 编译产物内部的 page/component host、scope、marker 和 behavior 始终使用 tiny-*。"
      >
        <div className="split">
          <CodeBlock>{`// tiny.config.json
{
  "compatibility": {
    "extensions": {
      "script": [".js", ".ts"],
      "template": [".wxml"],
      "style": [".wxss"],
      "templateScript": [".wxs", ".sjs"],
      "config": [".json"]
    },
    "files": {
      "appConfig": "app.json",
      "projectConfig": "project.config.json"
    },
    "directiveNamespace": "wx",
    "api": {
      "global": "wx",
      "aliases": []
    },
    "globals": {
      "app": "App",
      "page": "Page",
      "component": "Component",
      "behavior": "Behavior",
      "getApp": "getApp",
      "getCurrentPages": "getCurrentPages"
    },
    "behaviorScheme": "wx://"
  }
}

// CompileOptions 显式字段覆盖同名字段
compileMiniProgram({ sourceDir, outputDir, compatibility })`}</CodeBlock>
          <div className="stack">
            <Card tag="默认值" title="未配置时按微信规则解析">
              <p>默认识别 <code>.wxml</code>、<code>.wxss</code>、<code>.wxs/.sjs</code>，解析 <code>wx:if</code>，安装 <code>wx</code> API 和 <code>App/Page/Component</code> 全局。</p>
            </Card>
            <Card tag="内部命名" tone="violet" title="与用户输入完全解耦">
              <p>无论输入使用 <code>wx</code>、<code>my</code> 还是自定义扩展名，产物内部都使用 <code>tiny-page</code>、<code>tiny-add-button</code>、<code>tiny-scope</code>、<code>tiny-tag-button</code> 和 <code>tiny-builtin:*</code>。</p>
              <p>这些名称只在 <code>TINY_ENGINE_NAMING</code> 中定义。host/style scope 属性暂时同步 glass-easel 的 <code>wx-host</code> / <code>wx-style-scope</code>。</p>
            </Card>
          </div>
        </div>
        <Table
          head={['层', '示例', '是否可配置', '位置']}
          rows={[
            ['文件约定', <code>.wxml / .axml</code>, '可配置', 'compatibility.extensions'],
            ['模板指令', <code>wx:if</code>, '可配置', 'compatibility.directiveNamespace'],
            ['API 全局', <code>wx</code>, '可配置', 'compatibility.api'],
            ['注册全局', <code>App / Page / Component</code>, '可配置', 'compatibility.globals'],
            ['behavior 输入 scheme', <code>wx://component-export</code>, '可配置', 'compatibility.behaviorScheme'],
            ['组件 host tag', <code>tiny-view / tiny-add-button</code>, '固定', 'TINY_ENGINE_NAMING'],
            ['style / marker', <code>tiny-scope / tiny-tag-*</code>, '固定', 'TINY_ENGINE_NAMING'],
            ['内部 behavior', <code>tiny-base / tiny-item</code>, '固定', 'TINY_ENGINE_NAMING'],
            ['glass-easel host 属性', <code>wx-host / wx-style-scope</code>, '临时同步', 'docs/known-issues/glass-easel-naming.md'],
          ]}
        />
        <Callout title="manifest 只保存运行期需要的兼容信息">
          <p>
            schema-v2 manifest 使用 <code>runtimeCompatibility</code> 保存 API、注册全局、behavior scheme 和兼容探测全局；扩展名与模板指令只在编译期使用。内部 Tiny 名称来自代码常量，不进入用户配置。
          </p>
        </Callout>
      </Section>

      <Section
        id="templates"
        kicker="模板编译"
        title="WXML 在构建期变成 ProcGen"
        intro="模板解析、表达式生成、绑定表复用和 WXS 打包都在构建期完成，运行时不再解析 WXML。"
      >
        <div className="split">
          <Card tag="TmplGroup" title="所有模板共用一棵树">
            <ul>
              <li>所有模板文件放进同一个 group，页面/组件按 path 取自己的 ProcGen</li>
              <li><code>import</code> 和 <code>include</code> 解析成模板依赖</li>
              <li><code>template name</code> 生成命名子模板</li>
              <li>模板脚本同时注册带配置扩展名和不带扩展名两个名字，兼容两种引用写法</li>
              <li>生成函数的签名是 <code>R,C,D,U,A</code>，更新时复用绑定表 <code>A</code></li>
            </ul>
          </Card>
          <Card tag="产物" tone="violet" title="templates.js">
            <p>产物不是字符串模板，而是一段可以直接执行的 JavaScript 表达式：</p>
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
          head={['处理内容', '实现位置', '作用']}
          rows={[
            ['WXML 解析', 'parse/state.ts · parse/tag.ts · parse/expr.ts', '解析标签、属性、表达式、事件绑定和 meta 标签'],
            ['ProcGen', 'proc_gen/tag.ts · expr.ts · writer.ts', '生成 glass-easel 可执行的创建/更新函数'],
            ['WXS / SJS', 'TmplGroup.addScript + WXS runtime', '模板里可以调用脚本模块，支持相对路径 require'],
            ['作用域标记', 'injectTagClasses()', <>给每个元素加上 <code>{'<tagClassPrefix><tag>'}</code>（固定 <code>tiny-tag-button</code>），供 tag 选择器使用</>],
            ['animation', 'rewriteAnimationAttributes()', <>把 <code>{'animation="{{...}}"'}</code> 改写成内联 style</>],
            ['图片内联', 'inlineLocalImages()', '小于 200KB 的本地图片转成 data URI，静态宿主不需要额外资源目录'],
          ]}
        />

        <CodeBlock>{`<!-- 源 WXML（默认微信兼容输入） -->
<button class="primary" bindtap="submit">保存</button>

<!-- 编译器注入 tag marker，scope 为 tiny-pages-form-form -->
<button class="primary tiny-tag-button" bindtap="submit">保存</button>

<!-- 同目录 WXSS：button { color: red } -->
<!-- 产物 CSS：.tiny-pages-form-form--tiny-tag-button { color: red } -->

<!-- marker 与输入侧 wx/tiny 配置无关，始终是 tiny-tag-button -->`}</CodeBlock>
        <Callout title="运行时不需要解析 WXML">
          <p>
            render 线程只拿到模板 group，再交给 glass-easel 的模板引擎。它不会读取 <code>.wxml</code>，也不会在运行时计算 WXML 语法。
            这样模板错误会在构建期暴露，启动开销也不会随着模板体积线性增长。
          </p>
        </Callout>
      </Section>

      <Section
        id="styles"
        kicker="样式编译"
        title="class 和 tag 两套作用域"
        intro="页面和组件的 WXSS 不会泄漏到全局；app.wxss 继续作为全局样式。rpx 会在编译期换算成 vw。"
      >
        <div className="split">
          <div className="stack">
            <Card tag="作用域命名" title="每份页面/组件样式都有自己的 scope">
              <p>scope 形如 <code>tiny-pages-todos-todos</code>，由固定的 <code>tiny-</code> 前缀和路径中非字母数字字符替换成 <code>-</code> 得到，不对用户开放配置。</p>
              <p>app 样式没有 scope，按全局样式注册。</p>
            </Card>
            <Card tag="选择器改写" title="class 和 tag 各有前缀">
              <ul>
                <li>class：<code>.card</code> → <code>.tiny-pages-todos-todos--card</code></li>
                <li>tag：<code>button</code> → <code>tiny-button:where(.tiny-pages-todos-todos--tiny-tag-button)</code></li>
                <li><code>page</code> 重写为 <code>tiny-page</code>；自定义组件 <code>badge</code> 重写为 <code>tiny-badge</code></li>
                <li><code>@keyframes</code> 内部不做 tag 改写</li>
                <li><code>:host</code> 当前使用同步 glass-easel 的 <code>wx-host</code></li>
              </ul>
            </Card>
            <Card tag="rpx" title="以 750 为基准换算 vw">
              <p>公式是 <code>value × 100 / rpxRatio</code>，默认 750，保留 6 位有效数字；<code>calc()</code> 里的 rpx 也会换算。</p>
            </Card>
          </div>
          <div className="stack">
            <CodeBlock>{`/* app.wxss：全局 */
page { background: #f5f5f5; }
.card { padding: 24rpx; }

/* pages/todos/todos.wxss：页面内 */
.card { border: 1px solid #ddd; }   /* -> .tiny-pages-todos-todos--card */
button { height: 88rpx; }            /* -> tiny-button:where(.tiny-pages-todos-todos--tiny-tag-button) */`}</CodeBlock>
            <Callout title="低优先级 CSS 目前还是空的" tone="warn">
              <p>
                CLI 会同时写出 <code>*.low.css</code>，但目前没有启用 <code>convertHost</code>，所以低优先级输出为空；
                runtime 也只加载普通 CSS。这条通道是留给以后的 style isolation 和 <code>:host</code> 语义的。
              </p>
            </Callout>
          </div>
        </div>
        <Callout title="样式作用域在 render 线程注册">
          <p>
            编译器只负责生成 CSS 和 scope 名称；render 线程调用 <code>StyleScopeManager.register(scope)</code> 拿到数字 scope id，
            再在定义页面/组件时传给 glass-easel。注册顺序必须是先样式、后组件定义，否则组件拿不到作用域。
          </p>
        </Callout>
      </Section>

      <Section
        id="scripts"
        kicker="脚本打包"
        title="TypeScript 转译、模块路径修正和 service 打包"
        intro="脚本处理分两步：先把每个可达脚本转成独立的 ESM，再只把 service 入口打成一个 bundle。"
      >
        <Sequence steps={[
          {
            title: '收集可达脚本',
            detail: '从 app、页面和组件入口出发，解析 import/export 和 require 的静态字面量，按 .js/.ts/.tsx 以及 index.* 的规则查找。',
            code: 'collectReachableScripts() · queueLocalScript()',
          },
          {
            title: '转译 TypeScript',
            detail: 'ts.transpileModule 输出 ESNext + ESNext modules + source map，诊断带行列号。这里只做转译，不做类型检查。',
            code: 'target: ESNext · module: ESNext',
          },
          {
            title: '修正相对模块路径',
            detail: '浏览器 ESM 需要显式扩展名。把 ./foo 改成 ./foo.js，目录入口改成 ./foo/index.js；裸模块名不变。',
            code: 'rewriteRelativeModuleSpecifiers()',
          },
          {
            title: '生成 service.js 入口',
            detail: '入口会 import app、所有页面和所有组件的脚本。App/Page/Component 在导入时执行，注册到 service 的 registry。',
            code: "import './scripts/app.js' ...",
          },
          {
            title: '用 esbuild 打包 service',
            detail: 'format 为 esm，platform 为 browser，target 为 es2019，同时开启 bundle 和 sourcemap。ECharts 这类 CJS/UMD 依赖会在这里被吸收。',
            code: 'bundle() · SCRIPT_BUNDLE_ERROR = warning',
          },
          {
            title: '生成 render.js',
            detail: 'render 入口只重新导出 templates，组件逻辑不会进入 render。',
            code: 'render.js',
          },
        ]} />
        <Callout title="打包失败不会直接中断编译" tone="warn">
          <p>
            <code>SCRIPT_BUNDLE_ERROR</code> 只会记一条 warning，manifest 仍然会写出。这时 service 线程导入 bundle 会失败，
            表现为启动诊断而不是编译失败。排查时要同时看编译诊断和 <code>BOOTSTRAP_ERROR</code>。
          </p>
        </Callout>
      </Section>

      <Section
        id="manifest"
        kicker="manifest"
        title="manifest 是编译器的最终产物"
        intro="所有路径都是相对输出目录的 POSIX 路径，宿主和 runtime 不需要知道源码目录。"
      >
        <div className="split">
          <CodeBlock>{`{
  "schemaVersion": 2,
  "runtimeCompatibility": {
    "api": { "global": "wx", "aliases": [] },
    "globals": {
      "app": "App",
      "page": "Page",
      "component": "Component",
      "behavior": "Behavior",
      "getApp": "getApp",
      "getCurrentPages": "getCurrentPages"
    },
    "behaviorScheme": "wx://",
    "opaqueGlobals": ["webpackJsonp", "cloud", "env"]
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
            <Card title="字段说明">
              <ul>
                <li><code>runtimeCompatibility</code>：运行期仍需要的 API、注册全局和 behavior scheme；内部 Tiny 名称不在这里</li>
                <li><code>app</code>：App 脚本、全局样式和 app.json 的有效配置</li>
                <li><code>pages</code> / <code>components</code>：入口、模板、样式和配置</li>
                <li><code>styles</code>：所有样式（含 app），带 scope 和低优先级路径</li>
                <li><code>assets</code>：复制到输出目录的静态资源</li>
                <li><code>diagnostics</code>：编译期诊断，宿主启动时会一并读取</li>
              </ul>
            </Card>
            <Card title="谁会读取 manifest">
              <ul>
                <li>service：注册表、页面路径、组件 schema 和配置</li>
                <li>render：模板、样式、组件 schema 和页面产物</li>
                <li>宿主：加载入口、收集编译诊断</li>
                <li>devtool：显示应用列表和诊断</li>
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="output"
        kicker="产物目录"
        title="实际生成的文件"
        intro="以测试宿主的 tests/host/generated 为例，具体内容会随 fixture 变化。"
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
|   |-- pages/todos/todos.wxss.low.css   # 目前为空
|   +-- **.map
|-- logo.svg                 # 资源按原路径复制
+-- assets/**`}</CodeBlock>
        <div className="split">
          <Card tag="source map" title="脚本和样式都有 source map">
            <p>TypeScript 转译和 PostCSS 都会输出 source map，并写入 <code>sourcesContent</code>。浏览器 DevTools 可以直接定位回 WXML/WXSS/TS。</p>
          </Card>
          <Card tag="不压缩" title="产物保持可读">
            <p>当前编译器不做 minify，也不做 tree-shaking（esbuild 自己的打包行为除外）。调试器和验收可以直接阅读生成的脚本和模板。</p>
          </Card>
        </div>
      </Section>

      <Section
        id="diagnostics"
        kicker="诊断"
        title="编译问题也会变成结构化诊断"
        intro="编译器把所有问题放进 CompileResult.diagnostics，同时写进 manifest。"
      >
        <Table
          head={['Code', '级别', '触发条件', '后续处理']}
          rows={[
            [<code>INVALID_JSON</code>, 'error', '小程序配置或页面配置无法解析', '返回空对象并继续'],
            [<code>APP_PAGES_REQUIRED</code>, 'error', '小程序配置没有 pages', 'manifest 仍会生成'],
            [<code>PAGE_NOT_FOUND</code>, 'error', '声明的页面没有脚本或模板', '跳过这个入口'],
            [<code>COMPONENT_NOT_FOUND</code>, 'error', 'usingComponents 指向不存在的入口', '记录诊断'],
            [<code>SCRIPT_TRANSPILE_ERROR</code>, 'error', 'TypeScript 语法或转译失败', '保留输出并继续'],
            [<code>SCRIPT_IMPORT_NOT_FOUND</code>, 'warning', '相对 import 找不到文件', '不进入可达脚本图'],
            [<code>TEMPLATE_COMPILE_ERROR</code>, 'error', 'WXML 解析失败', '跳过模板 group 生成'],
            [<code>TINY_CONFIG_INVALID</code>, 'warning', 'tiny.config.json 无法解析', '回退到默认命名'],
            [<code>STYLE_IMPORT_NOT_FOUND</code>, 'warning', '@import 找不到目标', '内联为空字符串'],
            [<code>STYLE_COMPILE_ERROR</code>, 'error', 'PostCSS 解析或转换失败', '跳过这份样式'],
            [<code>SCRIPT_BUNDLE_ERROR</code>, 'warning', 'esbuild 打包失败', 'manifest 仍生成，启动时暴露'],
          ]}
        />
        <Callout title="编译诊断会进入 runtime">
          <p>
            宿主创建 <code>HostDiagnosticStore</code> 时会把 <code>manifest.diagnostics</code> 转成 <code>RuntimeDiagnostic</code>，
            所以 devtool 能同时看到编译错误和运行时错误，不需要另开一个构建日志面板。
          </p>
        </Callout>
      </Section>

      <Section
        id="limits"
        kicker="限制"
        title="当前编译器还有这些限制"
        intro="这些不是缺陷，而是还没有做的部分。了解之后，排查问题时就不容易把构建问题当成运行时问题。"
      >
        <Cards>
          <Card tag="全量构建" tone="warn" title="每次都从头编译">
            <p><code>compileMiniProgram</code> 每次都会清空输出并重新编译，<code>clean</code> 默认开启。没有增量依赖图，也没有缓存。</p>
            <p>devtool 的监听是外部脚本在 250ms 防抖后重新全量构建。</p>
          </Card>
          <Card tag="dev 参数" tone="warn" title="dev 暂时没有影响">
            <p><code>CompileOptions.dev</code> 会被保存，但没有参与输出；模板始终使用 <code>TmplGroup.newDev()</code>，也没有生产压缩模式。</p>
          </Card>
          <Card tag="静态分析" tone="warn" title="页面类型靠正则判断">
            <p><code>bodyType</code> 通过匹配 <code>Component(</code> 判断，动态注册、条件导出、别名调用等写法无法识别。</p>
          </Card>
          <Card tag="样式" tone="warn" title="编译期只处理作用域">
            <p>编译器生成 class/tag 作用域和 <code>hostAttribute</code>，但 <code>styleIsolation</code>、<code>addGlobalClass</code> 和 <code>shared</code> 的样式组合发生在 render adapter。<code>:host</code> 的低优先级输出目前也还没有启用。</p>
          </Card>
          <Card tag="运行环境" tone="warn" title="依赖 Node 工具链">
            <p>编译器依赖 fs、typescript、esbuild 和 PostCSS，只能在构建期运行，不会进入浏览器线程。</p>
          </Card>
          <Card tag="资源" tone="warn" title="资源分两段处理">
            <p>编译器按原路径复制图片和字体，并把 WXML 里小于 200KB 的本地图片内联成 data URI。更大的资源、以及 CSS 里的 <code>url()</code>，由宿主的 <code>resolveAssetUrl</code> 在 render 侧解析。</p>
          </Card>
        </Cards>
        <Callout title="继续阅读">
          <p>
            想知道这些产物在运行时怎么用，可以看 <a href="#/runtime">运行时内核</a>；想知道宿主怎么加载它们，可以看 <a href="#/hosts">宿主适配</a>。
          </p>
        </Callout>
      </Section>
    </>
  )
}
