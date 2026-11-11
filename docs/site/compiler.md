---
title: '从 WXML 到 manifest，'
highlight: '完整拆解编译流程'
eyebrow: '编译器'
lede: >-
  tools/cli 是 Tiny 的产物生成工具。它先找到页面和组件，读取命名配置，再把 WXML 编成 ProcGen、WXSS 编成带作用域的 CSS、TS/JS 打包成 service bundle，最后生成一份所有宿主都能读取的 manifest。
stats:
  - ['1', '编译工具']
  - ['5', '产物类型']
  - ['2', 'manifest schema']
  - ['0', '运行时 WXML 解析']
description: '小程序引擎的编译流程：入口发现、命名配置、WXML 到 ProcGen、WXSS 作用域、TS 转译、service bundle 与 manifest。'
name: '编译'
pageTitle: '编译流程 · Tiny 小程序引擎'
order: 3
---

## 十三个阶段，一次全量构建 {#pipeline kicker="编译流程"}

compileMiniProgram 会按顺序执行这些阶段。每个阶段只生成产物或诊断，不会直接调用 runtime。

:::sequence
| title | actor | detail | code |
| --- | --- | --- | --- |
| 解析兼容输入 |  | 读取 sourceDir/tiny.config.json 的 compatibility；CompileOptions.compatibility 显式覆盖。缺省字段回退到微信规则。 | resolveCompatibilityInput() |
| 准备输出并解析项目根 |  | 按 clean 清空输出目录；读取 compatibility.files.projectConfig 指向的项目配置及其 miniprogramRoot，没有该文件时把 sourceDir 当作小程序根目录。 | prepareOutputDir() · resolveRoot() |
| 扫描源文件 |  | 递归收集项目里的全部文件，跳过 .git、.cache、node_modules、输出目录以及 `packOptions.ignore` 命中的路径；后续各阶段再按扩展名挑出脚本、模板和样式。 | collectFiles(root) |
| 构建 npm |  | 读取小程序根 `package.json#dependencies`，递归解析 `node_modules`（支持 `miniprogram` 字段与 pnpm 符号链接），镜像到 `miniprogram_npm`；源码里已有预构建树时优先使用它。 | buildNpmPackages() |
| 读取小程序配置 |  | 读取 compatibility.files.appConfig 指向的配置，解析 pages 和 subPackages/subpackages。至少要有一个页面，否则记一条 APP_PAGES_REQUIRED 诊断。 | readAppConfig() · resolvePagePaths() |
| 解析入口 |  | 每个路径同时尝试 foo.* 和 foo/index.*，按兼容配置中的扩展名查找 script、template、style 和 config。 | resolveEntry(root, byRelative, path) |
| 查找组件 |  | 从 app 配置和每个页面、组件的 usingComponents 递归查找，记录全局/局部来源，并检查缺失。 | resolveComponentEntries() |
| 编译脚本 |  | 从入口沿 import/require 收集可达脚本（含 `miniprogram_npm` 内的传递依赖），转译 TypeScript，补全模块路径（含裸包名），并输出 source map；页面/组件脚本只带一条中性入口路径 hint。 | compileScripts() |
| 类型检查 |  | 项目有 tsconfig 或显式开启时运行 TypeScript 语义检查，输出 `SCRIPT_TYPE_ERROR`；没有社区 typings 时注入小程序全局声明。 | typecheckScripts() |
| 编译模板 |  | 把所有模板文件放进同一个 TmplGroup，处理 import/include/template、模板脚本、作用域标记和 animation。 | compileTemplates() |
| 编译样式 |  | app 样式保持全局；页面和组件样式加固定 Tiny class/tag scope；rpx 转成 vw；内联简单 `@import`，并按每个 WXSS 文件把 `url()` 归一化成 app-root 路径。 | compileStyles() |
| 复制资源 |  | 所有非编译输入文件按原相对路径复制，不做大小或类型判断；资源 URL 在运行时由宿主解析。 | copyAssets() |
| 生成 manifest 和入口 |  | 汇总产物、runtimeCompatibility 和诊断，写出 manifest.json；按分包拆出 `service.<pkg>.js`，生成 service.js 和 templates.js，并用 esbuild 逐个打包。 | createManifest() · writeEntryArtifacts() |
:::

## 页面和组件是怎么找到的 {#discovery kicker="入口规则"}

编译器给每个页面/组件脚本注入入口路径，运行时按路径注册，因此入口顺序不再是正确性前提；脚本没有 hint 时仍回退到声明顺序。

::::cards
:::card{tag="entry" title="文件入口和目录入口"}
页面或组件路径可以指向文件（`pages/todos/todos`），也可以指向目录（`components/add-button`，编译器会自动查找 `index.*`）。

脚本、模板、样式和配置的扩展名顺序来自 `compatibility.extensions`。
:::

:::card{tag="pages" title="主包和分包"}
`appConfig.pages` 排在前面，`subPackages[].pages` 按 `root + page` 拼接后排在后面；manifest 额外携带每个分包的 `root`/`pages`/`independent`/`service` 元数据。分包页面和“只被这一个分包使用”的组件会进入独立的 `service.<pkg>.js`，主包和跨分包共享组件保持在 `service.js`；带 `componentPlaceholder` 的跨包组件留在所属分包，页面记录 `asyncSubPackages`；主包和分包 entry 一起做 esbuild code splitting，共享模块落在 `chunks/`，另为 iOS 生成 eager `service.all.js`；`preloadRule` 会被校验并归一化进 manifest（`page`/`network`/`packages`）；独立分包会跳过主包全局 `usingComponents`，引用主包组件报 `INDEPENDENT_PACKAGE_DEPENDENCY`。

页面的先后顺序，就是 manifest 里 `pages` 的顺序。
:::

:::card{tag="components" title="全局组件和页面组件"}
页面配置由全局 `usingComponents` 和页面局部配置合并而成，局部配置优先。manifest 会同时记录 `usingComponents` 和 `usingComponentsSource`（global/local）。

组件依赖会递归查找，已经访问过的路径会去重。
:::

:::card{tag="page kind" title="页面还是组件型页面"}
编译器不再判断页面类型，也不写 `bodyType`。每个入口脚本只注入一条中性 `__tinyEntryPath`；运行时 `Page()` 注册为普通页面，`Component()` 且路径在 `app.json.pages` 中则识别为组件型页面。

这样 `Component<Props>(...)`、别名调用、条件导出和注释里出现 `Component(` 都不会影响分类。
:::
::::

:::callout{title="注册按路径，类型由运行时决定" tone="good"}
编译期只在页面/组件脚本前写入 `__tinyEntryPath`，`Page()` / `Component()` 消费后按声明路径注册；页面是否其实是组件型页面，由运行时 registry 根据注册函数和 `app.json.pages` 判定。为兼容 webpack 产物里 `var globalThis = this` 的脚本，这类脚本跳过 hint 并回退到声明顺序。
:::

## 输入格式可配，内部命名固定 {#naming kicker="兼容输入" nav="命名配置"}

扩展名、模板指令、API 全局、注册全局和 behavior scheme 属于兼容输入层；Tiny 编译产物内部的 page/component host、scope、marker 和 behavior 始终使用 tiny-*。

:::::split
```js
// tiny.config.json
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
compileMiniProgram({ sourceDir, outputDir, compatibility })
```

::::stack
:::card{tag="默认值" title="未配置时按微信规则解析"}
默认识别 `.wxml`、`.wxss`、`.wxs/.sjs`，解析 `wx:if`，安装 `wx` API 和 `App/Page/Component` 全局。
:::

:::card{tag="内部命名" tone="violet" title="与用户输入完全解耦"}
无论输入使用 `wx`、`my` 还是自定义扩展名，产物内部都使用 `tiny-page`、`tiny-add-button`、`tiny-scope`、`tiny-tag-button` 和 `tiny-builtin:*`。

这些名称只在 `TINY_ENGINE_NAMING` 中定义。host/style scope 属性暂时同步 glass-easel 的 `wx-host` / `wx-style-scope`。
:::
::::
:::::

| 层 | 示例 | 是否可配置 | 位置 |
| --- | --- | --- | --- |
| 文件约定 | `.wxml / .axml` | 可配置 | compatibility.extensions |
| 模板指令 | `wx:if` | 可配置 | compatibility.directiveNamespace |
| API 全局 | `wx` | 可配置 | compatibility.api |
| 注册全局 | `App / Page / Component` | 可配置 | compatibility.globals |
| behavior 输入 scheme | `wx://component-export` | 可配置 | compatibility.behaviorScheme |
| 组件 host tag | `tiny-view / tiny-add-button` | 固定 | TINY_ENGINE_NAMING |
| style / marker | `tiny-scope / tiny-tag-*` | 固定 | TINY_ENGINE_NAMING |
| 内部 behavior | `tiny-base / tiny-item` | 固定 | TINY_ENGINE_NAMING |
| glass-easel host 属性 | `wx-host / wx-style-scope` | 临时同步 | docs/known-issues/glass-easel-naming.md |

:::callout{title="manifest 只保存运行期需要的兼容信息"}
schema-v2 manifest 使用 `runtimeCompatibility` 保存 API、注册全局、behavior scheme 和兼容探测全局；扩展名与模板指令只在编译期使用。内部 Tiny 名称来自代码常量，不进入用户配置。
:::

## WXML 在构建期变成 ProcGen {#templates kicker="模板编译"}

模板解析、表达式生成、绑定表复用和 WXS 打包都在构建期完成，运行时不再解析 WXML。

::::split
:::card{tag="TmplGroup" title="所有模板共用一棵树"}
- 所有模板文件放进同一个 group，页面/组件按 path 取自己的 ProcGen
- `import` 和 `include` 解析成模板依赖
- `template name` 生成命名子模板
- 模板脚本同时注册带配置扩展名和不带扩展名两个名字，兼容两种引用写法
- 生成函数的签名是 `R,C,D,U,A`，更新时复用绑定表 `A`
:::

:::card{tag="产物" tone="violet" title="templates.js"}
产物不是字符串模板，而是一段可以直接执行的 JavaScript 表达式，service 和 render 各求值一次：

```js
const groupList = (() => {
  const G = {}
  // ... 每个 path 对应一个 ProcGen group
  return G
})()

const wxsModules = { modules: [ ... ] }

export default {
  groupList,
  wxsModules,
  content(path, name = "") {
    const group = groupList[path]
    if (!group) throw new Error(`template not found: ${path}`)
    return group(name)
  },
}
```
:::
::::

| 处理内容 | 实现位置 | 作用 |
| --- | --- | --- |
| WXML 解析 | parse/state.ts · parse/tag.ts · parse/expr.ts | 解析标签、属性、表达式、事件绑定和 meta 标签 |
| ProcGen | proc_gen/tag.ts · expr.ts · writer.ts | 生成 glass-easel 可执行的创建/更新函数 |
| WXS / SJS | TmplGroup.addScript + AST transform + module table | 模板里可以调用脚本模块，支持相对路径 require；事件由 service/render 双 runtime 执行 |
| 作用域标记 | injectScopeClasses() | 给每个元素加上 `<tagClassPrefix><tag>`（固定 `tiny-tag-button`），供 tag 选择器使用 |
| animation | rewriteAnimationAttributes() | 把 `animation="{{...}}"` 改写成内联 style |
| 资源引用 | 不处理 | WXML 里的 `src` / `poster` / `style` 原样保留；`image` 等内置组件在运行时按宿主组件/页面路径解析 |

WXS 在编译期完成 globals / `getRegExp` / `getDate` / `.constructor` 改写，并生成外部与内联模块表。所有正式宿主都启用 pageframe，页面和组件 WXML 表达式在 render pageframe 按模板求值；service 逻辑树保留同一份模板用于查询、关系和 headless/legacy snapshot adapter。WXS 事件尽量在 render 本地执行，无法解析到 WXS handler 时回退 service。具体分工见“运行时”页的 WXS 一节。

```html
<!-- 源 WXML（默认微信兼容输入） -->
<button class="primary" bindtap="submit">保存</button>

<!-- 编译器注入 tag marker，scope 为 tiny-pages-form-form -->
<button class="primary tiny-tag-button" bindtap="submit">保存</button>

<!-- 同目录 WXSS：button { color: red } -->
<!-- 产物 CSS：.tiny-pages-form-form--tiny-tag-button { color: red } -->

<!-- marker 与输入侧 wx/tiny 配置无关，始终是 tiny-tag-button -->
```

:::callout{title="运行时不需要解析 WXML"}
service 和 render 都直接取编译好的模板 group 交给 glass-easel 求值。service 得到用于 diff/查询的虚拟树，render 得到真实组件 shadow tree；两边消费同一份 `templates.js`，所以构建期错误会在两侧一致暴露。
:::

## class 和 tag 两套作用域 {#styles kicker="样式编译"}

页面和组件的 WXSS 不会泄漏到全局；app.wxss 继续作为全局样式。rpx 固定按 750 换算成 vw，WXS `setStyle` 使用同一实现。

:::::split
::::stack
:::card{tag="作用域命名" title="每份页面/组件样式都有自己的 scope"}
scope 形如 `tiny-pages-todos-todos`，由固定的 `tiny-` 前缀和路径中非字母数字字符替换成 `-` 得到，不对用户开放配置。

app 样式没有 scope，按全局样式注册。
:::

:::card{tag="选择器改写" title="class 和 tag 各有前缀"}
- class：`.card` → `.tiny-pages-todos-todos--card`
- tag：`button` → `tiny-button:where(.tiny-pages-todos-todos--tiny-tag-button)`
- `page` 重写为 `tiny-page`；自定义组件 `badge` 重写为 `tiny-badge`
- `@keyframes` 内部不做 tag 改写
- `:host { }` → `[wx-host="<scope>"] { }`（仅页面/组件样式），写入低优先级 `*.low.css`
:::

:::card{tag="rpx" title="以 750 为基准换算 vw"}
公式固定为 `value × 100 / 750`，保留 6 位有效数字；`calc()` 里的 rpx 也会换算。
:::
::::

::::stack
```css
/* app.wxss：全局 */
page { background: #f5f5f5; }
.card { padding: 24rpx; }

/* pages/todos/todos.wxss：页面内 */
.card { border: 1px solid #ddd; }   /* -> .tiny-pages-todos-todos--card */
button { height: 88rpx; }            /* -> tiny-button:where(.tiny-pages-todos-todos--tiny-tag-button) */
```

:::callout{title="低优先级 CSS 承载 :host" tone="good"}
页面/组件样式会同时写出 `*.low.css`：`:host { }` 被改写成 `[wx-host="<scope>"] { }` 放在这里，runtime 先追加低优先级表，再追加 app、page-scope 和 page/component，宿主默认样式因此总可以被覆盖。app 样式没有 scope，它的 low-priority 输出通常为空。
:::
::::
:::::

:::callout{title="样式编译给逻辑树用"}
编译器只负责生成 CSS 和 scope 名称；service 的逻辑树在挂载页面时根据页面/组件归属计算 cascade role，注册样式并计算 scope，再把页面/组件样式随 tree.flow 下发给渲染树。渲染树不根据文件名猜样式类型，只按 role 应用。
:::

## 主题变量从 theme.json 进入产物 {#theme kicker="主题变量"}

`app.json` 声明 `themeLocation`（或 `darkmode: true` 时默认 `theme.json`）后，编译器读取其中的 `light` / `dark` 变量表：

- `window`、`tabBar` 以及页面/组件 JSON 的窗口字段里，`@name` 会被解析；light 结果写入 `configuration.effective`，dark 结果写入 `configuration.darkEffective`
- 变量表完整写入 `manifest.theme`，宿主可以按当前系统主题选择
- WXSS 会注入 `:root{--name:value}`，暗色用 `@media (prefers-color-scheme: dark)` 覆盖，因此业务样式可以直接写 `var(--name)`
- 未知变量保留 `@name` 并报 `THEME_VARIABLE_NOT_FOUND`，不会静默变成空值

:::callout{title="编译期只负责映射" tone="warn"}
devtool 导航栏已按 `prefers-color-scheme` 读取 `darkEffective`；`wx.onThemeChange` 的宿主联动仍属于宿主侧工作。编译器保证 manifest 里有 light/dark 两份解析结果和 CSS 变量。
:::

## TypeScript 转译、模块路径修正和 service 打包 {#scripts kicker="脚本打包"}

脚本处理分两步：先把每个可达脚本转成独立的 ESM，再只把 service 入口打成一个 bundle。

:::sequence
| title | actor | detail | code |
| --- | --- | --- | --- |
| 收集可达脚本 |  | 从 app、页面和组件入口出发，解析 import/export 和 require 的静态字面量，按 .js/.ts/.tsx 以及 index.* 的规则查找。 | collectReachableScripts() · queueLocalScript() |
| 转译 TypeScript |  | ts.transpileModule 输出 ESNext + ESNext modules + source map，诊断带行列号。这里只做转译；语义检查由独立的 typecheckScripts 阶段负责（有 tsconfig 或显式开启时）。 | target: ESNext · module: ESNext |
| 修正相对模块路径 |  | 浏览器 ESM 需要显式扩展名。把 ./foo 改成 ./foo.js，目录入口改成 ./foo/index.js；裸模块名不变。 | rewriteRelativeModuleSpecifiers() |
| 生成 service.js 入口 |  | 入口会 import app、所有页面和所有组件的脚本。App/Page/Component 在导入时执行，注册到 service 的 registry。 | import './scripts/app.js' ... |
| 用 esbuild 打包 service |  | format 为 esm，platform 为 browser，target 为 es2019，同时开启 bundle 和 sourcemap。ECharts 这类 CJS/UMD 依赖会在这里被吸收。 | bundle() · SCRIPT_BUNDLE_ERROR = warning |
:::

:::callout{title="打包失败不会直接中断编译" tone="warn"}
`SCRIPT_BUNDLE_ERROR` 只会记一条 warning，manifest 仍然会写出。这时 service 线程导入 bundle 会失败，表现为启动诊断而不是编译失败。排查时要同时看编译诊断和 `BOOTSTRAP_ERROR`。
:::

## manifest 是编译器的最终产物 {#manifest kicker="manifest"}

所有路径都是相对输出目录的 POSIX 路径，宿主和 runtime 不需要知道源码目录。

:::::split
```json
{
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
    "opaqueGlobals": ["webpackJsonp", "cloud", "env", "__wxConfig", "__wxAppCode__", "__wxAppData"]
  },
  "entries": {
    "service": "service.js",
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
}
```

::::stack
:::card{title="字段说明"}
- `runtimeCompatibility`：运行期仍需要的 API、注册全局和 behavior scheme；内部 Tiny 名称不在这里
- `app`：App 脚本、全局样式和 app.json 的有效配置
- `pages` / `components`：入口、模板、样式和配置
- `styles`：所有样式（含 app），带 scope 和低优先级路径
- `assets`：按原路径复制到输出目录的非编译输入文件
- `diagnostics`：编译期诊断，宿主启动时会一并读取
:::

:::card{title="谁会读取 manifest"}
- service：注册表、页面路径、组件 schema、模板和样式，负责创建逻辑树
- render：只接收 tree flow/patch 和宿主渲染能力，不读取 manifest 里的页面产物
- 宿主：加载入口、收集编译诊断
- devtool：显示应用列表和诊断
:::
::::
:::::

## 实际生成的文件 {#output kicker="产物目录"}

以测试宿主为例，每个 fixture 落在 `tests/host/generated/apps/<id>/generated/`，同级的 `apps.json` 是 fixture 清单（测试宿主和调试器共用）。下面是一个 fixture 目录的内容，具体会随 fixture 变化。

```text
generated/
|-- manifest.json            # 唯一索引
|-- service.js               # esbuild 打包后的服务线程入口
|-- service.js.map
|-- templates.js             # groupList + wxsModules + content(path, name)
|-- scripts/
|   |-- app.js
|   |-- components/add-button/add-button.js
|   +-- pages/todos/todos.js
|-- styles/
|   |-- app.wxss.css         # 全局
|   |-- app.wxss.low.css                # app 的低优先级输出（通常为空）
|   |-- app.wxss.page-scope.css         # app 的 page-scope 模板（按需）
|   |-- pages/todos/todos.wxss.css
|   |-- pages/todos/todos.wxss.low.css   # :host 低优先级输出
|   +-- **.map
|-- logo.svg                 # 资源按原路径复制
+-- assets/**
```

::::split
:::card{tag="source map" title="脚本和样式都有 source map"}
TypeScript 转译和 PostCSS 都会输出 source map，并写入 `sourcesContent`。浏览器 DevTools 可以把脚本和样式定位回 TS/WXSS；模板产物本身没有单独的 source map。
:::

:::card{tag="不压缩" title="产物保持可读"}
当前编译器不做 minify，也不做 tree-shaking（esbuild 自己的打包行为除外）。调试器和验收可以直接阅读生成的脚本和模板。
:::
::::

## 编译问题也会变成结构化诊断 {#diagnostics kicker="诊断"}

编译器把所有问题放进 CompileResult.diagnostics，同时写进 manifest。

| Code | 级别 | 触发条件 | 后续处理 |
| --- | --- | --- | --- |
| `INVALID_JSON` | error | 小程序配置或页面配置无法解析 | 返回空对象并继续 |
| `APP_PAGES_REQUIRED` | error | 小程序配置没有 pages | manifest 仍会生成 |
| `APP_PAGE_INVALID` / `APP_PAGE_DUPLICATE` | error / warning | 页面路径越界或重复声明 | 跳过重复项 |
| `APP_SUBPACKAGE_INVALID` / `APP_SUBPACKAGE_ROOT_DUPLICATE` | error | 分包缺少 root/pages 或 root 重复 | 跳过该分包 |
| `APP_TABBAR_PAGE_NOT_FOUND` | warning | tabBar.pagePath 未声明 | 保留配置，宿主可能无法切换 |
| `APP_LAZY_CODE_LOADING_UNSUPPORTED` | warning | lazyCodeLoading 不是 requiredComponents | 按普通加载处理 |
| `PROJECT_COMPILE_TYPE_UNSUPPORTED` | error | compileType 不是 miniprogram | 继续按小程序编译 |
| `NPM_PACKAGE_NOT_FOUND` | warning | package.json 依赖在 node_modules 中缺失 | 跳过该包 |
| `NPM_PREBUILT_SOURCE` | info | 源码已有 miniprogram_npm | 不再从 node_modules 重建 |
| `PAGE_NOT_FOUND` | error | 声明的页面没有脚本或模板 | 跳过这个入口 |
| `COMPONENT_NOT_FOUND` | error | usingComponents 指向不存在的入口 | 记录诊断 |
| `SCRIPT_TRANSPILE_ERROR` | error | TypeScript 语法或转译失败 | 保留输出并继续 |
| `SCRIPT_TYPE_ERROR` | error | 可选语义检查发现类型错误 | 仍生成产物，诊断随 manifest 输出 |
| `THEME_FILE_NOT_FOUND` / `THEME_FILE_OUTSIDE_ROOT` | error | themeLocation 缺失或越界 | 不生成主题表 |
| `THEME_MODE_MISSING` / `THEME_VALUE_INVALID` | error / warning | theme.json 缺少 light/dark 或值不是字符串 | 跳过非法变量 |
| `THEME_VARIABLE_NOT_FOUND` | warning | 配置引用了未定义变量 | 保留 `@name` |
| `INDEPENDENT_PACKAGE_DEPENDENCY` | error | 独立分包引用了主包/其他分包组件 | 记录诊断，组件不注入 |
| `SCRIPT_TSCONFIG_INVALID` | warning | tsconfig 读取/解析失败 | 回退到默认编译选项 |
| `SCRIPT_IMPORT_NOT_FOUND` | warning | 相对 import 找不到文件 | 不进入可达脚本图 |
| `TEMPLATE_COMPILE_ERROR` | error | WXML 解析失败 | 跳过模板 group 生成 |
| `TINY_CONFIG_INVALID` | warning | tiny.config.json 无法解析 | 回退到默认兼容规则 |
| `TINY_CONFIG_NAMING_REMOVED` | warning | 仍使用已删除的 `naming` 配置 | 忽略 `naming`，只读 `compatibility` |
| `STYLE_IMPORT_NOT_FOUND` | warning | @import 找不到目标 | 内联为空字符串 |
| `STYLE_COMPILE_ERROR` | error | PostCSS 解析或转换失败 | 跳过这份样式 |
| `SCRIPT_BUNDLE_ERROR` | warning | esbuild 打包失败 | manifest 仍生成，启动时暴露 |

:::callout{title="编译诊断会进入 runtime"}
宿主会把 `manifest.diagnostics` 和运行时诊断放进同一条诊断通道，所以 devtool 能同时看到编译错误和运行时错误，不需要另开一个构建日志面板。
:::

## 当前编译器还有这些限制 {#limits kicker="限制"}

这些不是缺陷，而是还没有做的部分。了解之后，排查问题时就不容易把构建问题当成运行时问题。

::::cards
:::card{tag="全量构建" tone="warn" title="每次都从头编译"}
`compileMiniProgram` 每次都会清空输出并重新编译，`clean` 默认开启。没有增量依赖图，也没有缓存。

devtool 的监听是外部脚本在 250ms 防抖后重新全量构建。
:::

:::card{tag="样式" tone="warn" title="编译期只处理作用域"}
编译器生成 class/tag 作用域和 `hostAttribute`，并把 `:host` 转成低优先级 `[wx-host]` 规则；cascade role、`styleIsolation`、`addGlobalClass` 和 `shared` 的样式组合发生在逻辑树和渲染树的样式应用阶段。
:::

:::card{tag="运行环境" tone="warn" title="依赖 Node 工具链"}
编译器依赖 fs、typescript、esbuild 和 PostCSS，只能在构建期运行，不会进入浏览器线程。
:::

:::card{tag="资源" tone="warn" title="WXML 运行时解析，WXSS 编译期归一化"}
WXML 的 `image` / `video poster` / `cover-image` 等引用原样保留，运行时按宿主组件/页面路径解析，动态 `src` 也在运行时求值。WXSS 的 `url()` 在编译期按每个 WXSS 文件（含简单 `@import`）归一化成 app-root 路径，运行时再映射成宿主 URL；带 media/layer 条件的 `@import` 仍按原样保留，不会展开。inline `style` 里的 `url()` 由 WebView CSS 引擎解析，小程序不负责资源解析；本地包背景图不要依赖它，使用 CDN、base64 或 `<image>`。
:::
::::

:::callout{title="继续阅读"}
想知道这些产物在运行时怎么用，可以看 [运行时内核](#/runtime)；想知道宿主怎么加载它们，可以看 [宿主适配](#/hosts)。
:::
