---
title: 'service 跑逻辑树，'
highlight: '宿主跑渲染树'
eyebrow: '运行时'
lede: >-
  packages/runtime 是 Tiny 的小程序内核，不引用 window、document 或 iframe。service 线程用 glass-easel 维护逻辑树，负责 App/Page/Component、页面栈、setData、observer、relations 和模板求值；render 线程由宿主持有真实渲染树，只负责内置组件、样式、布局和 DOM。两棵树通过 tree.flow、tree.patch 和 tree.event 同步。
stats:
  - ['2', '运行时树']
  - ['23', '内置组件']
  - ['9', '消息域']
  - ['5', '组件生命周期']
pills:
  - ['双侧树', 'good']
  - ['逻辑树在 service', 'good']
  - ['渲染树在 host', 'good']
  - ['不再产出 render.js', 'good']
description: '小程序内核：service 逻辑树与宿主渲染树的分工、tree 协议、setData、组件语义、样式、查询和 canvas。'
name: '运行时'
pageTitle: '小程序内核与运行时 · Tiny'
order: 4
---

## 两棵树，各管各的 {#overview kicker="总览"}

service 执行小程序逻辑并维护 glass-easel 逻辑树；render 线程由宿主持有真实组件树。两棵树不共享内存，靠稳定的 node id、component flow 和 virtual node patch 对齐。

```text
service thread                              render thread (one root per page)
+-------------------------------+           +-------------------------------+
| App / Page / Component        |           | host TreeRenderer             |
| glass-easel logic ComponentSpace |  tree  | real built-in components      |
| template -> virtual RenderNode | <------> | glass-easel render tree       |
| data / observers / relations  |  flow    | DOM / layout / styles         |
| node ids + patches            |  patch   | no app methods                |
+-------------------------------+           +-------------------------------+
```

::::split
:::card{tag="service" title="逻辑树和业务状态"}
glass-easel ComponentSpace 在 service 中运行，自定义组件是完整实例，拥有 data、properties、observers、relations、lifetimes、事件回调、带类型的 dataset 和 node id。模板也在 service 求值，输出 `RenderNode` 虚拟树。
:::

:::card{tag="render" tone="violet" title="真实组件和 DOM"}
每个页面有一个 render root。宿主的 `TreeRenderer` 创建真实内置组件、自定义组件容器、slot、shadow root、样式和布局。render 不执行 app methods、observer 或 relations。
:::
::::

:::callout{title="node id 由 service 分配"}
service 在创建虚拟节点时分配稳定 id，render 只维护 id 到真实组件的映射。后续 patch、事件、查询和元素树检查都以这个 id 为锚点，而不是从 DOM 反推小程序语义。

当前模板更新走 virtual node patch；component flow 只覆盖首屏挂载（`define`、`create-node`、`props`、`children`、`ready`）。这一点和微信参考协议还有协议面差异，见 [限制](#limits)。
:::

## service 线程：逻辑树和页面栈 {#service kicker="service 线程"}

service 是“小程序应用”真正运行的地方，由 bootServiceThread 一次性装配。

:::sequence
| title | detail | code |
| --- | --- | --- |
| 安装兼容全局 | 按 runtimeCompatibility 写入 App/Page/Component、getApp/getCurrentPages 等全局；API 对象安装到配置的 namespace 和 aliases。未实现的 API 返回 undefined，并产生 UNSUPPORTED_API 警告。 | installMiniProgramGlobals(registry, apiHost) |
| 注册 App | service.js 被导入时执行 App(...)，registerApp 会立即调用 onLaunch 和 onShow。此时页面还没有创建。 | registerApp(options) |
| 整理 Page 和 Component 定义 | Page() 按顺序绑定到 manifest 里的页面路径；Component() 执行 normalizeComponentDefinition，合并 behaviors、observers、relations、options 和 externalClasses。 | registerComponent(options) |
| bootstrap 创建逻辑树 | 等待 loadArtifacts，加载 templates 和 styles，构建组件 schema，创建 LogicTreeAdapter，挂载首屏逻辑树并触发 onLoad/onShow。 | control('runtime', 'bootstrap') |
| render 就绪后同步首屏 | 宿主的渲染树挂载完成后发送 `tree.ready`，service 用逻辑树快照发送 `tree.flow`；随后宿主发 `page.ready`，service 触发 onReady。 | control('page', 'ready', { pageId }) |
:::

| 页面操作 | service 逻辑树 | render 渲染树 |
| --- | --- | --- |
| `page.navigateTo` | 当前页 onHide；创建 pageId；挂载新页逻辑树；onLoad → onShow | 宿主创建新的 render root，应用新页 flow |
| `page.navigateBack` | 移除页面；倒序触发 onHide → onUnload；恢复页 onShow | 每页 render 模式保留原 root；单 render 模式重新挂载 |
| `page.redirectTo` / `reLaunch` | 销毁旧页，创建目标页；执行对应生命周期 | 关闭不再使用的 render root，挂载新页 |
| `page.switchTab` | 复用 tab 页缓存，更新 tabBar 状态 | 切换可见 root，关闭已卸载页 |
| `page.hide` / `page.show` | 分发页面和组件 pageLifetimes | 只切换可见性，不销毁渲染树 |
| `page.unload` | onUnload；组件 detached；清理逻辑树和 relations | 关闭 render root |

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

runtimeCompatibility 只决定应用需要哪些兼容全局和 behavior scheme；逻辑树和渲染树的内部名称由 TINY_ENGINE_NAMING 统一提供。

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
逻辑树和渲染树使用 `tiny-*` host node；scope marker、tag marker 和内置 behavior 都从 `TINY_ENGINE_NAMING` 读取。

glass-easel 尚未公开 host/style scope 属性配置，因此 `TINY_ENGINE_NAMING` 暂时同步其 `wx-host` / `wx-style-scope`；runtime 不做 DOM 观察或属性改写。
:::
::::
:::::

| 名称 | 输入侧配置 | 当前内部值 | 生效位置 |
| --- | --- | --- | --- |
| 模板指令 | `wx:if / directive:if` | 编译期消除 | TmplGroup directivePrefix |
| API 全局 | `wx / my` | 不参与内部命名 | installMiniProgramGlobals |
| 组件宿主 | `add-button` | `tiny-add-button` | ComponentSpace hostNodeTagName |
| 宿主属性 | `—` | `wx-host`（临时） | render tree / 样式编译器 |
| style scope attribute | `—` | `wx-style-scope`（临时） | glass-easel DOM |
| 内置 behavior | `my://component-export` | `tiny-base / tiny-item` | runtime + web-components |
| tag / scope marker | `—` | `tiny-tag-* / tiny-scope` | 模板注入 + WXSS |

:::callout{title="输入兼容不等于内部命名"}
切换 API 或指令 namespace 不会改变 DOM、CSS scope 或内部 behavior。要支持第三方微信库时只增加 `api.aliases: ["wx"]`。当前唯一例外是 glass-easel 尚未配置化的 host/style scope 属性名。
:::

## setData 走逻辑树，更新走 patch {#data kicker="数据同步" nav="setData 与 patch"}

页面和组件的 setData 只改 service 的逻辑树。模板重新求值后，service 把旧虚拟树和新虚拟树做 diff，再把 patch 发给渲染树。

:::sequence
| title | detail | code |
| --- | --- | --- |
| 写入逻辑树 | 页面或组件调用 setData 时，先做 cloneJsonSafe，再按 a.b、list[0] 这样的路径写入 service 的 data。 | cloneJsonSafe(patch) · applyDataPatch(data, patch) |
| 执行 observer | service 侧的 observers 和 property observer 按变更路径匹配执行；property observer 会收到旧值。 | runObservers(instance, observers, changedPaths, oldData) |
| 重新求值模板 | 逻辑树里的 glass-easel 重新计算模板，得到新的虚拟 RenderNode。 | logicTree.updateRenderTree(pageId) |
| diff 出 patch | 旧快照和新快照按 text、replace、props、insert、remove、reorder、extra 做 diff，同一个 microtask 内的更新会合批。 | diffRenderTree(previous, next) |
| 渲染树应用 patch | 宿主 TreeRenderer 把 patch 应用到真实组件和 DOM；service 不等待 render 的确认。 | tree.patch |
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
:::card{title="没有 render 侧 data 镜像"}
组件 data、observer 和 property 都只在 service 逻辑树里。render 只收到节点 props 和 patch，不保存第二份小程序 data。
:::

:::card{title="observer 只在 service 执行"}
render 发现 DOM 事件后把 node id 和 native 字段发回 service；事件处理、setData、observer 和模板求值都在逻辑树完成。
:::

:::card{title="递归和异常都有诊断" tone="warn"}
observer 递归深度上限是 20，超过会产生 `OBSERVER_RECURSION_LIMIT`；observer 抛错会产生 `OBSERVER_ERROR`，不会影响其他逻辑。
:::
::::
:::::

## 事件从渲染树回到逻辑树 {#events kicker="事件"}

渲染树只负责把真实 DOM 事件转成 `tree.event`：带 node id、事件名、detail、native 字段和 touch 列表。service 用 node id 找到逻辑节点，取出带类型的 dataset，再走 glass-easel 的捕获/冒泡。

:::sequence
| title | detail | code |
| --- | --- | --- |
| 渲染树收到原生事件 | 宿主内置组件和 DOM 监听器先处理点击、输入、滚动、触摸等原生事件，并归一化 detail。 | host event listener |
| 发送 tree.event | 渲染树按稳定 node id 发出事件；不再传 componentData，也不要求 service 根据 tag 猜事件语义。 | sendEvent('tree', 'event', payload) |
| service 找到逻辑节点 | 逻辑树按 node id 找到绑定监听器的元素，读取 typed dataset 和 id，执行 capture/bubble。 | logicTree.dispatchViewEvent(payload) |
| 调用页面或组件方法 | 逻辑树调用对应的方法；抛错会转成 EVENT_HANDLER_ERROR 诊断。 | page.invokeMethod(handler, [event]) |
:::

:::::split
::::stack
:::card{tag="事件对象" title="service 收到的内容"}
```js
{
  viewId: 'node-42',
  name: 'tap',
  detail: { ... },
  native: { clientX: 120, clientY: 80, ... },
  touches: [ ... ],
  changedTouches: [ ... ]
}
```
:::

:::callout{title="handler 对不上也会出诊断"}
`EVENT_HANDLER_MISSING` 和 `EVENT_PAGE_NOT_FOUND` 都是 warning，不会影响其他事件。
:::
::::

::::stack
:::card{tag="组件事件" title="triggerEvent 不再跨线程"}
自定义组件的 `triggerEvent` 在 service 的逻辑树内部完成捕获和冒泡，不会为了一个自定义事件再走一次 render 往返。
:::

:::card{tag="内置组件" title="detail 由宿主归一化"}
button、input、scroll-view、swiper、canvas 等内置组件把原生字段归一化成小程序 detail；service 只负责分发，不再按 tag 合成领域事件。
:::
::::
:::::

## 组件定义、observer、relation 都在逻辑树 {#components kicker="组件语义"}

service 侧维护完整的组件定义、逻辑树和关系图。render 只保留组件容器和真实节点。

| 能力 | 实现 | 关键行为 |
| --- | --- | --- |
| Behavior | `normalizeComponentDefinition` | 嵌套 behaviors 去重并检测循环；执行顺序是被引用 behavior → 引用者 → 组件；组件覆盖 properties/methods/data |
| component-export | `wx://component-export`（scheme 可配置）+ export() | selectComponent 返回 export() 的结果，而不是组件实例 |
| observers | `observers` / property observer | 支持对象/数组写法、逗号分隔的多路径、** 和 .** 通配；property observer 收到旧值；递归上限 20 |
| relations | `RelationManager` + `ComponentTree` | parent / child / ancestor / descendant；双方都声明才会建立；支持 linked / unlinked / linkChanged / linkFailed |
| 选择器 | `selectComponent` / `selectAllComponents` / `selectOwnerComponent` | 默认不穿透组件边界；>>> 可以显式穿透；结果按逻辑树顺序返回 |
| 组件型页面 | `MiniProgramPageInstance` + 整理后的定义 | query 按 property 类型转换；执行 created/attached/ready/detached；页面根也会进入逻辑树 |

:::::split
::::stack
:::card{tag="behaviors" title="合并顺序和限制"}
每个 behavior 的 properties/data/methods/lifetimes/pageLifetimes/observers/relations/externalClasses/options 都会被收集；重复引用只执行一次。

内置 behavior id（默认 `wx://...`）目前只支持 `component-export`，其他会报 `UNSUPPORTED_BEHAVIOR`。Behavior 的 definitionFilter 已按引用链执行；写在 Component 上的 definitionFilter 仍会报诊断。
:::

:::card{tag="relations" title="双方声明才会建立关系"}
父组件声明 `child` 时，子组件也要声明对应的 `parent`；祖先和后代同理。只声明一侧不会连上。

attached 触发 linked，detached 触发 unlinked，移动时触发 linkChanged；父级或祖先找不到目标时触发 linkFailed。组件型页面的 relations 会按 page shadow tree 的 target path 匹配，并手动触发两端的 linked/unlinked。
:::
::::

::::stack
:::card{tag="tree" title="逻辑树和渲染树只共享 node id"}
逻辑树保存 pageId、path、tag、id、class、parent、顺序和虚拟节点；渲染树只保存 node id 到真实组件的映射，不保存组件 data 或 observer。
:::

:::card{tag="页面生命周期" tone="warn" title="按实例分发"}
page.show/hide 会遍历 service 里的所有组件实例，逐个调用 pageLifetimes。render 没有 componentPageLifetime 回路，避免重复执行。

generics、definitionFilter 和 pureDataPattern 已接入；componentPlaceholder 仍未实现。
:::

:::card{tag="样式" title="组件配置进入 flow"}
`multipleSlots`、`virtualHost`、`styleIsolation`、`addGlobalClass` 和 `externalClasses` 会随 component schema/flow 下发给渲染树，渲染树用它们创建组件容器和作用域。
:::
::::
:::::

## 渲染树：宿主实现真实组件 {#render kicker="渲染树"}

渲染树由宿主实现。runtime 只定义 `TreeRenderer` 契约：mount、applyPatches、applyStyles、query、measure、inspectTree、observeIntersection、dispose。它不知道 WXML，也不执行 app methods。

```ts
export type TreeRenderer = {
  mount(root: RenderNode): void
  applyPatches(patches: RenderPatch[]): void
  applyStyles?(styles: string[]): void
  setEventSink?(sink: (event: TreeEventPayload) => void): void
  setPagePath?(pagePath: string): void
  query?(selector: string, all: boolean): unknown[]
  measure?(ids: string[]): Record<string, unknown>
  inspectTree?(): unknown
  observeIntersection?(request, emit): (() => void) | undefined
  dispose?(): void
}
```

::::cards{layout="three"}
:::card{tag="Web" title="createGlassRenderTree"}
`@tiny/host-web-components` 的 Web 渲染树注册真实 `tiny-*` 内置组件，维护 slot、shadow root、class/scope、样式和 DOM；`bootGlassRenderEntry` 负责创建它并安装基础 CSS。
:::

:::card{tag="Native" title="createNativeTreeRenderer"}
同一个 `TreeRenderer` 契约，把 RenderNode 和 patch 映射到原生视图。目前只有契约和 headless smoke test，没有实际原生宿主。
:::

:::card{tag="Test" title="headless renderer"}
runtime 单测用 headless renderer 验证整棵树、patch 顺序、node id 和事件回传，不需要 iframe 或 DOM。
:::
::::

:::::split
::::stack
:::card{title="首屏：tree.flow"}
service 把组件定义、create-node、props、children 和 ready 编成 component flow，渲染树按顺序创建真实节点，最后把页面根挂到容器。
:::

:::card{title="更新：tree.patch"}
service 对虚拟树做 diff，渲染树只应用 text、replace、props、insert、remove、reorder、extra。patch 按 pageId 合批，保持页面内顺序。
:::
::::

:::card{tag="元素树" title="inspectTree"}
渲染树按自己的真实组件树返回 `InspectNode`，包括 tag、attributes、className、style 和 children；宿主和 devtool 通过 `runtime.inspectTree` 读取。

- 最多 2000 个节点
- 最大深度 60
- 文本截断到 200 个字符
:::
:::::

:::callout{title="render 不负责业务路由"}
渲染树不保存页面栈，也不决定页面切换。它只响应宿主转发的 tree flow/patch、query/canvas 控制和 inspectTree，并把事件按 node id 回传 service。
:::

## 23 个内置组件由宿主提供 {#builtins kicker="内置组件"}

内置组件不再是 service 里的玻璃组件，也不是 render 里重新求值的 WXML；service 只输出语义 tag，宿主把它们映射成真实内置组件。

::::cards{layout="three"}
:::card{tag="AOT" title="模板和样式"}
`build-templates.mjs` 把 23 个 `template.wxml` 编成一个模板 group；`build-styles.mjs` 合成基础样式加 23 份组件样式。

生成物在 `hosts/web-components/src/generated`，不提交到仓库。
:::

:::card{tag="host-owned" title="Web 内置组件"}
`@tiny/host-web-components` 用真实 `tiny-*` 自定义元素实现 view/button/input/textarea/picker 等组件，并维护 behaviors、默认 CSS、事件归一化和 canvas surface。
:::

:::card{tag="semantic" title="service 只发语义 tag"}
逻辑树里的内置节点是语义虚拟节点，不带 Web/native 实现。无论宿主是 Web 还是原生，service 发出的是 `view`、`button`、`checkbox-group` 这类小程序 tag。
:::
::::

| 组件组 | 当前支持 | 实现方式 |
| --- | --- | --- |
| view / text / label / image / icon | hover、inline、selectable、decode、space、aria；label for；图片 mode/background | 真实 tiny-* 宿主 + slot；默认 CSS |
| button | type/size/plain/loading/disabled、formType、openType 事件映射、hover 时序 | tiny-button + 宿主 tap；form/hover behaviors |
| input / textarea / picker | value、focus、confirm、selection、composition；picker 列和值 | 原生输入 / 自定义 picker surface |
| checkbox / radio / switch / slider | checked/disabled/value/color；change/checkboxstate；group change | 自定义 22×22 等结构 + 隐藏原生输入 |
| scroll-view / swiper | scrollX/Y、scrollTop/Left、refresher、drag/scroll；swiper change/transition | CSS overflow / transform + touch/scroll 监听 |
| progress / canvas | percent/showInfo/active；canvas-id、2D/WebGL、rAF、createImage、touch | tiny-progress；canvas surface + OffscreenCanvas handoff |

:::callout{title="仍然不是完整组件库" tone="warn"}
navigator、video、rich-text、map、movable-view 等还没有实现；已有组件的 open-type、表单提交、无障碍和 Skyline 语义也不完整。
:::

## 样式：service 算 scope，render 应用 {#styles kicker="样式隔离"}

样式表按 cascade role 分类（builtin / app / page / component / page-scope / shared）。service 过滤并计算 scope，渲染树把样式应用到真实组件树；内置 CSS 始终归宿主。

| 配置 | 生效范围 | 行为 |
| --- | --- | --- |
| 页面 isolation | 页面根 + 子组件 | 默认 shared；显式 isolated/apply-shared/shared 优先 |
| 组件 isolated | 组件自身 | 默认值；不接收页面样式 |
| apply-shared | 组件自身 | 页面样式可以影响组件；组件样式不影响页面 |
| shared | 组件自身 + 页面 | 组件样式按页面 scope 重新生成一份 |
| addGlobalClass | 组件自身 | 等价 apply-shared；可由 JSON 或 options 设置 |
| externalClasses | 组件根节点 | 把外部 class 透传到组件内部 |

::::split
:::card{title="逻辑树负责"}
- 读取 manifest.styles 的 role 和 scope
- 注册 glass-easel 逻辑树样式
- 在 tree.flow 里带页面/组件样式文本和 fallback app 样式
:::

:::card{title="渲染树负责"}
- 应用 flow 里的样式
- 维护真实组件的 scope 和 class marker
- 用样式作用域渲染内置组件和自定义组件容器
:::
::::

:::callout{title="低优先级 CSS 还没有启用"}
CLI 仍会写 `*.low.css`，但目前没有启用 `convertHost`，runtime 也不会加载它。`:host` 组合和优先级还没有系统整理。
:::

## Canvas、查询和相交观测 {#canvas kicker="Canvas 与查询"}

canvas 已经从核心 runtime 移出。service 通过 `ServiceCanvasAdapter` 取得 OffscreenCanvas 控制面，渲染树提供画布 surface 和测量；selector query 和 IntersectionObserver 通过 `query` 控制面回到真实 DOM。

:::::split
::::stack
:::card{tag="Canvas handoff" title="2D / WebGL / RAF"}
浏览器宿主把 render iframe 的 OffscreenCanvas 通过 postMessage 中继给 service；之后 service 直接持有控制面，支持 2D、WebGL、requestAnimationFrame 和 `createImage`。不再走 PNG 帧镜像。
:::

:::card{tag="SelectorQuery" title="在渲染树里查节点"}
`createSelectorQuery` 把 selector、page/component 作用域和 all 发给渲染树；宿主返回 rect、dataset 和 scroll。`.node()` 仍走 canvas handoff，并支持组件作用域下的样式 class。
:::
::::

::::stack
:::card{tag="IntersectionObserver" title="observe / unobserve"}
service 把 observe 请求和 view id 发给渲染树；Web 宿主用原生 IntersectionObserver，entry 通过 `query.intersection` 事件回到逻辑树。
:::

:::card{tag="animation" title="仍是最终态 CSS"}
`wx.createAnimation` 会生成链式的 CSS transform/transition；编译期把 `animation` 属性改写成内联 style。多 step 时序和事件回调还没有还原。
:::
::::
:::::

## 当前限制 {#limits kicker="限制"}

两侧树已经接管默认宿主，但下面这些仍是明确缺口。

::::cards
:::card{tag="协议" tone="warn" title="component flow 只覆盖首屏"}
目前只有 `define`、`create-node`、`props`、`children` 和 `ready`；后续更新走 virtual node patch。微信还会发送 FLOW_UPDATE、FLOW_SET_DATA、FLOW_DATA_OBSERVER 等，这是协议面差异，不影响常规 UI 更新。
:::

:::card{tag="事件" tone="warn" title="tree.event 还没有 target geometry"}
事件只带 node id、name、detail、native 字段和 touches；目标节点的几何信息由 service 侧逻辑节点补足，和微信协议仍有差别。
:::

:::card{tag="原生" tone="warn" title="原生渲染器只有契约"}
`createNativeTreeRenderer` 有契约和 headless smoke test，没有实际原生宿主。原生宿主还需要实现 OffscreenCanvas/查询/相交观测等 host 能力。
:::

:::card{tag="组件" tone="warn" title="componentPlaceholder 等未实现"}
componentPlaceholder、trait behaviors / chaining API 和大多数微信内置 behavior 仍未实现；generics、definitionFilter、pureDataPattern 已接入。
:::

:::card{tag="页面" tone="warn" title="页面形态不完整"}
14 项页面生命周期和 5 个路由 API 已接，分享回调、下拉刷新和退出状态可用；分享菜单 UI、页面栈恢复、页面转场和自定义 tabBar 还缺。
:::

:::card{tag="API" tone="warn" title="API 覆盖有限"}
目前支持 storage、导航、system、toast、animation、canvas 和 selector query；request、媒体、文件、账号、位置、WebSocket 还没有。
:::
::::

:::callout{title="继续阅读"}
这些问题在宿主侧怎么处理，可以看 [宿主适配](#/hosts)；现有测试覆盖到哪里，可以看 [测试与验收](#/testing)。
:::
