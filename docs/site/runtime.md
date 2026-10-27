---
title: 'service 管状态，'
highlight: 'render 管组件树'
eyebrow: '运行时'
lede: >-
  packages/runtime 是 Tiny 的小程序内核：不引用 window、document 或 iframe。service 线程负责 App/Page/Component、页面栈、setData、命名、组件语义和逻辑组件树；render 线程负责 glass-easel 组件定义、样式隔离、事件和 DOM。canvas、资源 URL、渲染后端和内置组件都由宿主注入。
stats:
  - ['2', '线程角色']
  - ['23', '内置组件']
  - ['5', '组件生命周期']
  - ['7', '消息域']
pills:
  - ['内核不依赖宿主', 'good']
  - ['组件语义', 'good']
  - ['样式隔离', 'good']
  - ['canvas 由宿主提供', 'good']
description: '小程序内核：service 与 render 双线程分工、页面栈、setData、事件、组件语义、内置组件和样式隔离。'
name: '运行时'
pageTitle: '小程序内核与运行时 · Tiny'
order: 4
---

## 一个小程序，两个运行时角色 {#overview kicker="总览"}

service 负责逻辑和状态，render 负责组件树和 DOM。默认使用两个 iframe；如果需要保留隐藏页面的 DOM 和滚动位置，也可以让每个页面各用一个 render iframe。

```text
service iframe                                  render iframe (one per page optional)
+------------------------------+                +------------------------------+
| bootServiceThread            |                | bootRenderThread             |
| host-independent             |                | glass-easel adapter          |
| pageStack / page data        |    messages    | ComponentSpace / DOM         |
| naming / definitions / tree  | <------------> | styles / events / slots      |
| canvas: injected adapter     |   via host     | canvas: injected adapter     |
+------------------------------+                +------------------------------+
             ^                                               ^
             +------------- BridgeConnection ---------------+
                            (host relays)
```

::::split
:::card{tag="service" title="应用逻辑和状态"}
页面栈、当前页、页面和组件 data、命名空间、组件定义、逻辑组件树、relations 和 API host 都在这里。小程序的业务状态只存在这一侧。
:::

:::card{tag="render" tone="violet" title="组件树和 DOM"}
glass-easel 组件定义、模板实例、样式作用域、DOM 节点、事件派发和元素树都在这里。render 不知道页面栈，也不读取 URL。
:::
::::

:::callout{title="内核不直接接触运行环境"}
service 需要 canvas 时，调用注入的 `ServiceCanvasAdapter`；render 测量和绘制 canvas 时，调用注入的 `RenderCanvasAdapter`；selector query 和 IntersectionObserver 走注入的 `RenderQueryAdapter`；图片和 CSS 资源由 `resolveAssetUrl` 解析；DOM 挂载由 `mountComponent` 完成。`pnpm check:runtime-purity` 会检查这条规则有没有被破坏。
:::

## 注册、命名和页面栈 {#service kicker="service 线程"}

service 是“小程序应用”真正运行的地方，由 bootServiceThread 一次性装配。

:::sequence
| title | actor | detail | code |
| --- | --- | --- | --- |
| 按 runtimeCompatibility 安装兼容全局 | | 按配置写入 App/Page/Component、getApp/getCurrentPages 等全局；API 对象安装到配置的 namespace 和 aliases。未实现的 API 返回 undefined，并产生 UNSUPPORTED_API 警告。 | installMiniProgramGlobals(registry, apiHost) |
| 注册 App | | service.js 被导入时执行 App(...)，registerApp 会立即调用 onLaunch 和 onShow。此时页面还没有创建。 | registerApp(options) |
| 整理 Page 和 Component 定义 | | Page() 按顺序绑定到 manifest 里的页面路径；Component() 还会执行 normalizeComponentDefinition，合并 behaviors、observers、relations、options 和 externalClasses。 | registerComponent(options) |
| bootstrap 创建首屏 | | 等待 loadArtifacts，写入 systemInfo 和 storage，构建组件 schema，创建页面并触发 onLoad/onShow；最后返回 pageComponents，供 render 注册组件型页面。 | control('runtime', 'bootstrap') |
| page.ready 补齐组件树 | | render 等组件树稳定后，把组件快照发给 service。service 创建组件实例、加入 ComponentTree，再触发 onReady。这时 selectComponent 和 relations 已经可用。 | control('page', 'ready', { components }) |
:::

| 页面操作 | service 做什么 | render 做什么 |
| --- | --- | --- |
| `page.navigateTo` | 当前页 onHide；解析 url 和 query；创建 pageId；新页 onLoad → onShow；组件型页面执行 created/attached/ready | 不再使用的页面会被卸载，新页面按 path 和 initialData 挂载，等待组件树稳定 |
| `page.navigateBack` | 按 delta 移除页面；倒序触发 onHide → onUnload；恢复页 onShow | 每页 render 模式保留原页面 iframe；单 render 模式需要重新挂载恢复页 |
| `page.switchTab` | 切换到 tabBar 页面；复用缓存页面，必要时创建新页面 | 每页 render 模式关闭不再使用的 tab 页，其余页面只切换可见性 |
| `page.hide` | 当前页 onHide；App.onHide；所有页面和组件触发 pageLifetimes hide | 不销毁组件树 |
| `page.show` | App.onShow；当前页 onShow；所有页面和组件触发 pageLifetimes show | 不销毁组件树 |
| `page.unload` | onUnload；组件型页面执行 detached；移除 ComponentTree、relations 和组件实例 | 没有额外消息 |

::::split
:::card{title="页面实例和组件型页面"}
普通页面保留 pageId、path、query、data、methods 和生命周期记录。组件型页面（`bodyType=component`）使用整理后的组件定义：URL query 会按 property 类型转换，并执行 created/attached/ready/detached。

页面根节点也会进入逻辑树（`page:<pageId>`），所以 relations 和 selectComponent 能识别页面边界。
:::

:::card{title="Taro 兼容仍然保留"}
普通页面会把顶层函数（包括生命周期）绑定到实例，兼容 Taro 读取 `this.onReady.called` 的写法；组件型页面走标准 Component 定义。

这是兼容路径，并不等于完整还原了微信的页面语义。
:::
::::

:::callout{title="返回页面时 DOM 是否保留，取决于 render 模式" tone="warn"}
每页 render 模式下，每个页面有独立的 render iframe，返回时只需切换可见性，DOM、滚动位置和定时器都能保留。单 render 模式下所有页面共用一个 render 线程，返回时需要重新挂载页面。devtool 默认使用每页 render 模式，测试宿主默认使用单 render 模式。
:::

## 兼容输入可配，Tiny 内部名固定 {#naming kicker="命名边界" nav="命名"}

runtimeCompatibility 只决定应用需要哪些兼容全局和 behavior scheme；adapter 与 web-components 的内部名称由 TINY_ENGINE_NAMING 统一提供。

:::::split
```json
// tiny.config.json
{
  "compatibility": {
    "api": { "global": "my", "aliases": ["wx"] },
    "globals": {
      "app": "HostApp",
      "page": "HostPage",
      "component": "HostComponent"
    },
    "behaviorScheme": "my://"
  }
}

// manifest.runtimeCompatibility
{
  "api": { "global": "my", "aliases": ["wx"] },
  "globals": { "app": "HostApp", "page": "HostPage", ... },
  "behaviorScheme": "my://",
  "opaqueGlobals": ["webpackJsonp", "cloud", "env"]
}

// 固定内部命名
{
  "hostTag": "tiny-add-button",
  "hostAttribute": "wx-host", // 临时同步 glass-easel
  "styleScopeAttribute": "wx-style-scope",
  "scopeMarkerClass": "tiny-scope",
  "tagClassPrefix": "tiny-tag-",
  "behaviorPrefix": "tiny-",
  "behaviorScheme": "tiny://"
}
```

::::stack
:::card{tag="service" title="兼容全局与 API"}
`installMiniProgramGlobals()` 按 runtimeCompatibility 安装配置的 App/Page/Component/Behavior/getApp/getCurrentPages，以及 API namespace 和 aliases。

`canIUse()`、诊断和建议信息也使用同一组 namespace。
:::

:::card{tag="render" title="Tiny 内部命名"}
ComponentSpace 使用 `tiny-*` host node；scope marker、tag marker 和内置 behavior 都从 `TINY_ENGINE_NAMING` 读取。

glass-easel 尚未公开 host/style scope 属性配置，因此 `TINY_ENGINE_NAMING` 暂时同步其 `wx-host` / `wx-style-scope`；runtime 不做 DOM 观察或属性改写。
:::
::::
:::::

| 名称 | 输入侧配置 | 当前内部值 | 生效位置 |
| --- | --- | --- | --- |
| 模板指令 | `wx:if / directive:if` | 编译期消除 | TmplGroup directivePrefix |
| API 全局 | `wx / my` | 不参与内部命名 | installMiniProgramGlobals |
| 组件宿主 | `add-button` | `tiny-add-button` | ComponentSpace hostNodeTagName |
| 宿主属性 | `—` | `wx-host`（临时） | adapter / 样式编译器 |
| style scope attribute | `—` | `wx-style-scope`（临时） | glass-easel DOM |
| 内置 behavior | `my://component-export` | `tiny-base / tiny-item` | runtime + web-components |
| tag / scope marker | `—` | `tiny-tag-* / tiny-scope` | 模板注入 + WXSS |

:::callout{title="输入兼容不等于内部命名"}
切换 API 或指令 namespace 不会改变 DOM、CSS scope 或内部 behavior。要支持第三方微信库时只增加 `api.aliases: ["wx"]`。当前唯一例外是 glass-easel 尚未配置化的 host/style scope 属性名。
:::

## setData 和跨线程 observer {#data kicker="数据同步" nav="setData 与 observer"}

service 先改自己的 data，再把更新发给 render；render 侧组件 data 和 observer 的变化也会回流 service，保证逻辑实例和渲染实例一致。

:::sequence
| title | actor | detail | code |
| --- | --- | --- | --- |
| 生成一份可 JSON 序列化的更新 | | 页面或组件调用 setData 时，先做 cloneJsonSafe，再按 a.b、list[0] 这样的路径写入本地 data。 | cloneJsonSafe(patch) · applyDataPatch(data, patch) |
| 本地 observer 先执行 | | service 侧的组件定义里有 observers 和 property observer。setData 后按变更路径匹配 observer，property observer 还会收到旧值。 | runObservers(instance, observers, changedPaths, oldData) |
| 发送 data.setData | | 页面更新带 pageId，组件更新带 componentId。Bridge 会把同一来源、同一页面的事件攒起来，在下一个 microtask 发出。 | sendEvent('data', 'setData', { componentId, patch }) |
| render 应用更新 | | render 找到页面或组件实例并执行 setData。adapter 用 beginServicePatch/endServicePatch 标出这次变化来自 service，避免 observer 再执行一遍。 | adapter.beginServicePatch(component) → component.setData(patch) |
| render 侧变化回流 | | 组件 data 变化会触发 runtime.componentData；schema 里声明的 observer 还会触发 runtime.componentObserved。service 同步 data，需要时再用旧值执行 observer。 | runtime.componentData / runtime.componentObserved |
:::

:::::split
::::group
```js
Component({
  properties: {
    value: { type: String, value: '', observer: 'onValue' },
  },
  observers: {
    value(value) { this.setData({ derived: value.toUpperCase() }) },
    'a, b'(a, b) { this.setData({ sum: a + b }) },
    '**'(data) { /* 任意变化 */ },
  },
  methods: {
    onValue(value, oldValue) {
      this.setData({ changed: value !== oldValue })
    },
  },
})
```
::::

::::stack
:::card{title="不合并字段，也没有渲染完成回调"}
每次 setData 都会生成一条更新消息；Bridge 只做帧批处理，不会合并字段。service 也不会等 render 确认。
:::

:::card{title="observer 在 service 执行"}
render 负责发现变化并上报 `componentObserved`，真正的 observer 逻辑在 service 执行。property observer 的参数是 `(newValue, oldValue)`。
:::

:::card{title="递归和异常都有诊断" tone="warn"}
observer 递归深度上限是 20，超过会产生 `OBSERVER_RECURSION_LIMIT`；observer 抛错会产生 `OBSERVER_ERROR`，不会影响其他逻辑。
:::
::::
:::::

## 事件要跨线程走一个来回 {#events kicker="事件"}

render 侧先把事件序列化，再交给 service 调用处理函数；service 侧的 triggerEvent 反过来经过 render。

:::sequence
| title | actor | detail | code |
| --- | --- | --- | --- |
| glass-easel 处理捕获和冒泡 | | 模板里的 bind/catch 会编译成监听器；glass-easel 完成捕获、target 和冒泡三个阶段，并处理 shadow/slot 边界。 | methodCaller → event listener |
| adapter 序列化事件 | | 提取 type、detail、timeStamp、bubbles、composed、capture、stopped，以及 target 和 currentTarget 的 id、tag、dataset、class、style。 | serializeEvent(handler, event) |
| 发送 event.dispatch | | 自定义组件事件会额外带上 componentId、componentPath 和当前 componentData，确保 service 侧组件实例能同步。 | sendEvent('event', 'dispatch') |
| service 找到接收者 | | 有 pageId 就找页面实例；有 componentId 就先确保组件实例存在、同步 data，再调用方法。 | page.invokeMethod(handler, [event]) |
| 异常转成诊断 | | 处理函数抛错不会中断线程，而是发送 EVENT_HANDLER_ERROR，带上 handler、eventType 和 pageId。 | sendDiagnostic('error', { code: 'EVENT_HANDLER_ERROR' }) |
:::

:::::split
::::stack
:::card{tag="事件对象" title="service 收到的内容"}
```js
{
  handler: 'onTap',
  type: 'tap',
  timeStamp: 1710000000000,
  detail: { ... },
  bubbles: true,
  composed: true,
  capture: false,
  stopped: false,
  target: { id, tag, dataset, class, style },
  currentTarget: { id, tag, dataset, class, style },
  componentId?: 'component-1',
  componentPath?: 'components/card/card',
  componentData?: { ... }
}
```
:::

:::callout{title="handler 对不上也会出诊断"}
`EVENT_HANDLER_MISSING` 和 `EVENT_PAGE_NOT_FOUND` 都是 warning，不会影响其他事件。
:::
::::

::::stack
:::card{tag="service → render" title="组件 triggerEvent 的回路"}
service 侧组件实例调用 `triggerEvent(name, detail)`，Bridge 发送 `event.trigger` 到 render，render 再调用 glass-easel 组件的 `triggerEvent`。

如果父级监听器在 render 侧又触发 `event.dispatch`，就形成一次完整往返。
:::

:::card{tag="原生事件" title="内置组件做了事件归一化"}
button 把原生 tap 转成小程序 tap，并处理 formType 和 openType；input 处理 input/change/focus/blur/keydown/confirm/composition/selectionchange；scroll-view 处理 scroll/refresher/drag；canvas 转发 touch。
:::
::::
:::::

## Behavior、observer、relation 和组件树 {#components kicker="组件语义"}

service 侧维护完整的组件定义、逻辑组件树和关系图，并不只是保存一份 data。

| 能力 | 实现 | 关键行为 |
| --- | --- | --- |
| Behavior | `normalizeComponentDefinition` | 嵌套 behaviors 会去重并检测循环；执行顺序是被引用 behavior → 引用者 → 组件；组件覆盖 properties/methods/data |
| component-export | `wx://component-export`（scheme 可配置）+ export() | selectComponent 返回 export() 的结果，而不是组件实例 |
| observers | `observers` / property observer | 支持对象/数组写法、逗号分隔的多路径、** 和 .** 通配；property observer 收到旧值；递归上限 20 |
| relations | `RelationManager` + `ComponentTree` | parent / child / ancestor / descendant；双方都声明才会建立；支持 linked / unlinked / linkChanged / linkFailed |
| 选择器 | `selectComponent` / `selectAllComponents` / `selectOwnerComponent` | 默认不穿透组件边界；>>> 可以显式穿透；结果按树中的顺序返回 |
| 组件型页面 | `MiniProgramPageInstance` + 整理后的定义 | query 按 property 类型转换；执行 created/attached/ready/detached；页面根也会进入逻辑树 |

:::::split
::::stack
:::card{tag="behaviors" title="合并顺序和限制"}
每个 behavior 的 properties/data/methods/lifetimes/pageLifetimes/observers/relations/externalClasses/options 都会被收集；重复引用只执行一次。

内置 behavior id（默认 `wx://...`）目前只支持 `component-export`，其他会报 `UNSUPPORTED_BEHAVIOR`。Behavior 的 definitionFilter 已按引用链执行；写在 Component 上的 definitionFilter 仍会报诊断。
:::

:::card{tag="relations" title="双方声明才会建立关系"}
父组件声明 `child` 时，子组件也要声明对应的 `parent`；祖先和后代同理。只声明一侧不会连上。

attached 触发 linked，detached 触发 unlinked，移动时触发 linkChanged；父级或祖先找不到目标时触发 linkFailed。
:::
::::

::::stack
:::card{tag="tree" title="逻辑树在 service，真实树在 render"}
service 的 ComponentTree 记录 pageId、path、tag、id、class、parent 和顺序；render 的 glass-easel 树才是 DOM 的来源。

两边通过 componentLifecycle 里的 parentComponentId/tag/id/class 对齐，page.ready 的组件快照负责补齐首屏。
:::

:::card{tag="页面生命周期" tone="warn" title="按实例分发"}
page.show/hide 会遍历 service 里的所有组件实例，逐个调用 pageLifetimes；render 发来的 `componentPageLifetime` 会被忽略，避免重复执行。

generics、definitionFilter 和 pureDataPattern 已接入；componentPlaceholder 仍未实现。
:::

:::card{tag="样式" title="组件配置也会进入 schema"}
`multipleSlots`、`virtualHost`、`styleIsolation`、`addGlobalClass` 和 `externalClasses` 会随 componentSchemas 下发，render 用它们注册组件。
:::
::::
:::::

## render 适配器如何装配组件 {#render kicker="render 适配"}

GlassEaselRuntimeAdapter 是 runtime 内部唯一直接依赖 glass-easel 的地方。

::::cards
:::card{tag="组件空间" title="ComponentSpace + StyleScopeManager"}
每个 render 线程有一个 ComponentSpace 和一个 StyleScopeManager；页面、组件和内置组件都注册在这里。
:::

:::card{tag="定义" title="定义与隔离"}
页面和组件使用 `defineWithMethodCaller(path)`。组件 options 会写入 multipleSlots、virtualHost、styleScope、extraStyleScope 和 isolation。
:::

:::card{tag="事件代理" title="模板事件怎么找到处理函数"}
打开 `useMethodCallerListeners` 后，glass-easel 会把模板事件交给 Proxy。核心方法（setData、selectComponent 等）直接透传，其他名字交给 service 处理。
:::

:::card{tag="宿主" title="资源和画布"}
`resolveAssetUrl` 会在模板 img/src 和 CSS url() 注册时调用；`canvas.measure` 和 `paint` 由宿主提供，adapter 不直接操作 DOM。
:::
::::

:::::split
::::stack
:::card{title="启动顺序"}
1. `registerStyles`：注册基础样式和 manifest 样式
2. `setPageComponentOptions`：设置组件型页面的 isolation/options
3. `registerComponentSchemas`：注册组件定义和 observers
4. `mountPage`：挂载页面，等待组件树稳定

顺序反了，组件定义就拿不到样式作用域 id。
:::

:::card{title="组件树稳定后发 page.ready"}
`whenRendered()` 会等 backend 完成一次渲染。如果页面声明了 usingComponents，还要等组件数量稳定，再生成组件快照返回给宿主。宿主把它并入 `page.ready`。
:::
::::

:::card{tag="元素树" title="元素树导出"}
如果 backend 返回 DOM，就按 DOM 序列化；否则退回 glass-easel 逻辑树（shadowRoot/childNodes）。

- 最多 2000 个节点
- 最大深度 60
- 文本截断到 200 个字符
- 组件节点当前用 `wx-host` 标记，待 glass-easel 提供配置后切换为 `tiny-host`
:::
:::::

:::callout{title="render 不负责业务路由"}
render 会响应 `runtime.bootstrap`、`page.navigateTo`、`page.navigateBack`、`page.switchTab`、`runtime.inspectTree` 以及 data/event/canvas 消息。devtool 会给每个页面维护独立的 render 帧；tabBar 由宿主绘制，service 只负责投影状态。
:::

## 23 个内置组件，已经比较接近 WebView {#builtins kicker="内置组件"}

内置组件模板在构建期生成 ProcGen，样式按组件拆分后再合成 24 份 stylesheet；每个组件共用一组 behaviors。

::::cards{layout="three"}
:::card{tag="AOT" title="模板和样式"}
`build-templates.mjs` 把 23 个 `template.wxml` 编成一个模板 group；`build-styles.mjs` 合成基础样式加 23 份组件样式。

生成物在 `hosts/web-components/src/generated`，不提交到仓库。
:::

:::card{tag="behaviors" title="共享 behaviors"}
`tiny-base`、`tiny-hover`、`tiny-label-target`、`tiny-disabled`、`tiny-data-component`、`tiny-group`、`tiny-item`、`tiny-size-normalizer`、`tiny-class-prefix`。

id 前缀跟随 naming 配置。
:::

:::card{tag="默认可用" title="不需要写 usingComponents"}
宿主注入内置组件后，它们会默认挂到每个页面和组件上，即使页面没有声明自定义组件也能使用。

提供方是 `RenderThreadOptions.builtinComponents`；自定义组件同名时会被页面声明覆盖。
:::
::::

| 组件 | 当前支持的接口 | 实现方式 |
| --- | --- | --- |
| view / text / label | hover、inline、selectable、decode、space、aria；label for | 真实 tiny-* 宿主 + slot；hover 监听宿主 touchstart |
| button | type/size/plain/loading/disabled、formType submit/reset、openType 事件映射、hover 时序、aria | 真实 tiny-button 宿主 + 宿主 tap；form/hover behaviors；openType 不支持时发 error 事件 |
| input | value/type/password/maxlength/focus/confirm/cursor/selection/adjustPosition；input/change/focus/blur/keydown/confirm/composition/selectionchange | 原生 input + dataComponent/classPrefix behaviors |
| checkbox / radio / switch | checked/disabled/value/color；change/checkboxstate；group change | 自定义 22×22 / 52×32 结构 + 隐藏原生 input；dataComponent/group/item behaviors |
| slider | value/min/max/step/disabled/colors/blockSize；changing/change | 自定义 track/thumb + 透明的 range 交互层；数值归一化 |
| scroll-view | scrollX/Y、scrollTop/Left、scrollIntoView、refresher、drag/scroll 事件 | CSS overflow + touch/scroll 事件处理 |
| swiper / swiper-item | current/currentItemId/indicator/autoplay/circular/vertical；change/transition/animationfinish | CSS transform + 后端查询和 touch 事件 |
| progress / icon / image | percent/showInfo/active/activeMode/colors、type/size/color、src/mode/webp/background | 模板 + observers；icon 使用内嵌 WeUI 字体和 15 种伪元素；image 用 div 背景图，并用 probe 测量兜底 |
| canvas | canvas-id/type/disableScroll；touchstart/move/end/cancel/longtap/error | surface 组件；实际绘制由宿主 canvas 适配器完成 |

:::callout{title="还不是完整组件库" tone="warn"}
navigator、video、rich-text、map、movable-view 等还没有实现；已有组件的 open-type、表单提交、无障碍和 Skyline 语义也不完整。
:::

## 除了作用域，还有 styleIsolation {#styles kicker="样式隔离"}

编译期生成 class/tag 作用域；render 期再按页面或组件的 isolation 配置组合样式。

| 配置 | 生效范围 | 行为 |
| --- | --- | --- |
| 页面 isolation | 页面根 + 子组件 | 默认 shared；显式 isolated/apply-shared/shared 或 styleIsolation 配置优先 |
| 组件 isolated | 组件自身 | 默认值；不接收页面样式 |
| apply-shared | 组件自身 | 页面样式可以影响组件；组件样式不会反过来影响页面 |
| shared | 组件自身 + 页面 | 组件的 WXSS 会以页面 scope 重新注册一份，页面也可以使用组件样式 |
| addGlobalClass | 组件自身 | 等价于 apply-shared；可以通过 JSON 或 options 设置 |
| externalClasses | 组件根节点 | 把外部 class 透传到组件内部元素 |

::::split
:::card{title="注册顺序"}
- 基础样式以 global scope 注册
- manifest.styles 逐份注册，scope 来自 style.scope
- 共享组件样式按页面 scope 重新写入
- 最后注册页面和组件定义
:::

:::card{title="命名和低优先级样式"}
tag marker 和 `hostAttribute` 跟随 naming；`page` 根节点不加 marker。CLI 仍会写 `*.low.css`，但目前没有启用 `convertHost`，runtime 也只加载普通 CSS。

`:host` 的组合和优先级还没有系统整理。
:::
::::

:::callout{title="app.wxss 仍然是全局样式"}
app.wxss 不带 scope，按 globalScope 注册。页面的 styleIsolation 只决定组件是否接收页面样式，不会把 app.wxss 变成组件的局部样式。
:::

## 画布由宿主提供，内核只定义消息 {#canvas kicker="Canvas 与动画"}

canvas 已经从核心 runtime 移出：service 和 render 只接收适配器，浏览器实现放在 hosts/browser。

:::::split
::::stack
:::card{tag="service 适配器" title="离屏绘制"}
`ServiceCanvasAdapter.createLegacyCanvasContext` 提供旧版 canvas API，`createCanvasNode` 为 SelectorQuery 构造节点。

浏览器实现会创建一个隐藏 canvas + 2D context，每 50ms 最多生成一次 PNG 快照，通过 `canvas.frame` 发送。
:::

:::card{tag="render 适配器" title="测量和绘制"}
`RenderCanvasAdapter.measure(selector)` 返回宽高，`paint(frame)` 把 PNG 画到可见的 `canvas[canvas-id]` 上。

核心 runtime 里不再出现 `document` 或 `Image`。
:::
::::

::::stack
:::card{tag="SelectorQuery" title="跨线程 DOM 查询"}
`createSelectorQuery` 把选择器发到 render 线程，由宿主注入的 `RenderQueryAdapter` 对真实 DOM 返回 `rect`/`dataset`/`scroll`，并支持组件作用域（`this.createSelectorQuery()`、`.in(component)`）与样式作用域下的原类名选择器。浏览器实现位于 `@tiny/host-browser` 的 `createBrowserRenderQuery()`；canvas 的 `.node()` 仍走宿主 handoff。
:::

:::card{tag="animation" title="目前仍是最终态 CSS"}
`wx.createAnimation` 会生成链式的 CSS transform/transition；编译期把 `animation` 属性改写成内联 style。

多 step 时序、事件回调和 rAF 都还没有还原。
:::

:::card{tag="兼容处理" tone="warn" title="浏览器 canvas 兼容"}
`installBrowserCanvasCompat()` 会在 host-browser 里给 `Object.prototype` 补上空的 add/removeEventListener，避免 ECharts 把普通包装对象当成 DOM 节点。
:::
::::
:::::

## 当前还有哪些限制 {#limits kicker="限制"}

组件语义和宿主抽象已经补上，但下面这些仍是明确缺口。

::::cards
:::card{tag="组件" tone="warn" title="componentPlaceholder / 内置 behavior"}
componentPlaceholder、trait behaviors / chaining API 和大多数微信内置 behavior 仍未实现。遇到不支持的写法会生成诊断，但不会自动降级。
:::

:::card{tag="页面" tone="warn" title="页面形态不完整"}
14 项页面生命周期和 5 个路由 API 已接，分享回调、下拉刷新和退出状态可用；分享菜单 UI、页面栈恢复、页面转场和自定义 tabBar 还缺。子包目前只是路径，没有按需加载。
:::

:::card{tag="API" tone="warn" title="API 覆盖有限"}
目前支持 storage、导航、system、toast、animation、canvas 和 selector query；request、媒体、文件、账号、位置、WebSocket 还没有。
:::

:::card{tag="render 模式" tone="warn" title="单 render 模式返回会重建页面"}
每页 render 模式会保留每个页面的 DOM；单 render 模式共用一个 render 线程，返回时需要重新挂载。单 render 模式下 navigateBack 也不会重新下发组件快照。
:::

:::card{tag="canvas" tone="warn" title="离屏镜像不是交互 canvas"}
没有 canvas rAF、完整 2D API，也没有从原生触摸到 service 的完整链路。内置 canvas 的 touch 事件目前主要停留在组件层。
:::

:::card{tag="宿主" tone="warn" title="浏览器之外还没有宿主"}
runtime 已经不依赖浏览器全局，但还没有 native transport 和 backend；原生宿主需要自己提供 canvas 适配器。
:::
::::

:::callout{title="继续阅读"}
这些问题在宿主侧怎么处理，可以看 [宿主适配](#/hosts)；现有测试覆盖到哪里，可以看 [测试与验收](#/testing)。
:::
