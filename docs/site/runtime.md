---
title: 'service 跑逻辑树，'
highlight: '宿主跑渲染树'
eyebrow: '运行时'
lede: >-
  packages/runtime 是 Tiny 的小程序内核，不引用 window、document 或 iframe。service 线程用 glass-easel 维护逻辑树，负责 App/Page/Component、页面栈、setData、observer、relations；render pageframe 执行页面和组件 WXML，宿主持有真实渲染树、内置组件、样式、布局和 DOM。两棵树通过 tree.flow、tree.patch 和 tree.event 同步。
stats:
  - ['2', '运行时树']
  - ['39', '内置组件']
  - ['7', '消息域']
  - ['5', '组件生命周期']
pills:
  - ['双侧树', 'good']
  - ['逻辑树在 service', 'good']
  - ['渲染树在 host', 'good']
  - ['pageframe 执行 WXML', 'good']
description: '小程序内核：service 逻辑树与宿主渲染树的分工、tree 协议、setData、组件语义、样式、查询和 canvas。'
name: '运行时'
pageTitle: '小程序内核与运行时 · Tiny'
order: 4
---

## 两棵树，各管各的 {#overview kicker="总览"}

service 执行小程序逻辑并维护 glass-easel 逻辑树；render pageframe 执行页面和组件 WXML，宿主持有真实组件树和 DOM。service 从同一份编译模板构造逻辑组件实例，供 observer、relations、查询和身份索引使用；pageframe 的求值才是最终渲染结果。两棵树不共享内存，靠组件的共享 id、元素 locator、component flow 和页面数据补丁对齐。

```text
service thread                              render thread (one root per page)
+-------------------------------+           +-------------------------------+
| App / Page / Component        |           | host TreeRenderer             |
| glass-easel logic ComponentSpace |  tree  | real built-in components      |
| logic template -> RenderNode  | <------> | WXML eval + render tree       |
| data / observers / relations  |  flow    | DOM / layout / styles         |
| component ids / locators      |  patch   | no app methods                |
+-------------------------------+           +-------------------------------+
```

::::split
:::card{tag="service" title="逻辑树和业务状态"}
glass-easel ComponentSpace 在 service 中运行，自定义组件是完整实例，拥有 data、properties、observers、relations、lifetimes、事件回调、带类型的 dataset 和组件共享 id。service 从编译模板实例化逻辑树，并输出 `RenderNode` 快照供组件身份、索引和查询使用；最终页面 WXML 由 render pageframe 执行。
:::

:::card{tag="render" tone="violet" title="真实组件和 DOM"}
每个页面有一个 render root。宿主的 `TreeRenderer` 和 pageframe 执行页面与组件 WXML，创建真实内置组件、自定义组件容器、slot、shadow root、样式和布局。render 不执行 app methods、observer 或 relations；元素只持有渲染侧本地 id。
:::
::::

:::callout{title="只有组件共享 id，元素用 locator"}
service 给组件（和页面根）分配稳定 id，render 按这个 id 维护组件实例；元素不带跨线程 id，渲染侧分配本地 id，补丁、事件、查询和元素树检查都用 `owner#index.path` 形式的 locator 寻址。

当前页面由 render pageframe 从 `templates.js` 挂载；component flow 携带 `define`、逻辑身份快照 `tree`、`ready` 和 service 侧 `componentFlow` 组件身份列表。宿主组件 shadow tree 内的子组件身份变化通过结构 hints 同步，禁止 render 按 DOM 顺序猜身份。custom tabBar 额外携带独立 `tabFrame`，由一个独立 pageframe root 挂载，后续 data/身份变化也走 `tabFrame`。页面 DOM 的文本、属性、结构和重排由 pageframe 自己 diff。
:::

:::callout{title="每页树状态已收口，组件空间仍共享"}
service 为每个 pageId 维护页级树状态：页面根、可选独立 tab 组件根、组件实例表、最近一次 render snapshot、component data 基线、relations、页面 router 和页内组件实例计数。页级状态随页面卸载销毁；每页还按 `usingComponents`（含 generic 默认组件）维护可见 schema 闭包，首屏 flow 只发送该页可见的 `define`。`ComponentSpace`、底层组件 definition 和样式 scope 仍是应用级共享，避免为每个页面复制一套 glass-easel realm。
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
| `page.navigateBack` | 移除页面；倒序触发 onHide → onUnload；恢复页 onShow | 销毁被移除页的 render root，保留目标页的 DOM、滚动位置和定时器 |
| `page.redirectTo` / `reLaunch` | 销毁旧页，创建目标页；执行对应生命周期 | 关闭不再使用的 render root，挂载新页 |
| `page.switchTab` | 复用 tab 页缓存，更新 tabBar 状态 | 切换可见 root，关闭已卸载页 |
| `page.hide` / `page.show` | `hide` 先分发 `onHide`，再执行 `onSaveExitState`；显隐都分发 pageLifetimes | 只切换可见性，不销毁渲染树 |
| `page.unload` | onUnload；组件 detached；清理逻辑树和 relations | 关闭 render root |

::::split
:::card{title="页面实例和组件型页面"}
普通页面保留 pageId、path、query、data、methods 和生命周期记录。组件型页面由运行时注册判定（`Component()` 注册的声明页面）并使用整理后的组件定义：URL query 会按 property 类型转换，并执行 created/attached/ready/detached。

页面根节点也会进入逻辑树（`page:<pageId>`），所以 relations 和 selectComponent 能识别页面边界。
:::

:::card{title="Taro 兼容仍然保留"}
普通页面会把顶层函数（包括生命周期）绑定到实例，兼容 Taro 读取 `this.onReady.called` 的写法；组件型页面走标准 Component 定义。

这是兼容路径，并不等于完整还原了微信的页面语义。
:::
::::

:::callout{title="每个页面都有自己的 render root"}
浏览器宿主固定为每页一个 render iframe，iOS 为每页一个 WKWebView。`navigateBack` 只销毁被移除页面的 surface，保留页的 DOM、滚动位置和定时器继续存在；`switchTab` 复用缓存的 tab 页。
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
  "opaqueGlobals": ["webpackJsonp", "cloud", "env", "__wxConfig", "__wxAppCode__", "__wxAppData"]
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

`canIUse()` 以注入的 `wx.*` 表、内置组件清单和能力声明为准（不看 `SDKVersion`）；诊断和建议信息使用同一组 namespace。
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
| diff 出 patch | 旧快照和新快照按 text、replace、props、insert、remove、reorder 做 diff，同一个 microtask 内的更新会合批。 | diffRenderTree(previous, next) |
| 渲染树应用 patch | 宿主 TreeRenderer 把 patch 应用到真实组件和 DOM；带 completion 的批次同时携带 ack token，渲染树应用后回 `tree.ack`。 | tree.patch · tree.ack |
| 执行完成回调 | `setData(patch, cb)` 的 `cb` 不在数据写入时执行：batch 被确认后才按调用顺序执行，回调异常走 `SET_DATA_CALLBACK_ERROR` 诊断。 | completeAfterRender(pageId, cb) |
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
render 发现 DOM 事件后把组件 id 或元素 locator 和 native 字段发回 service；事件处理、setData、observer 和逻辑树模板求值都在 service 完成。
:::

:::card{title="completion 等 render 确认"}
`setData(patch, cb)` 的 data 写入是同步的，`cb` 却要等对应批次在渲染树应用后才执行。同一 microtask 内的多次 setData 合批、按调用顺序回调；回调里再 setData 会进入下一批。没有可渲染变化时，回调在本次 flush 末尾执行。
:::

:::card{title="递归和异常都有诊断" tone="warn"}
observer 递归深度上限是 20，超过会产生 `OBSERVER_RECURSION_LIMIT`；observer 抛错会产生 `OBSERVER_ERROR`，不会影响其他逻辑。
:::
::::
:::::

## 事件从渲染树回到逻辑树 {#events kicker="事件"}

渲染树只负责把真实 DOM 事件转成 `tree.event`：带组件 id 或元素 locator、事件名、detail、native 字段和 touch 列表。service 解析到逻辑节点，取出带类型的 dataset，再走 glass-easel 的捕获/冒泡。

:::sequence
| title | detail | code |
| --- | --- | --- |
| 渲染树收到原生事件 | 宿主内置组件和 DOM 监听器先处理点击、输入、滚动、触摸等原生事件，并归一化 detail。 | host event listener |
| 发送 tree.event | 渲染树按组件 id 或元素 locator 发出事件；事件不携带 componentData，service 也不按 tag 猜事件语义。 | sendEvent('tree', 'event', payload) |
| service 找到逻辑节点 | 逻辑树按组件 id / locator 找到绑定监听器的元素，读取 typed dataset 和 id，执行 capture/bubble。 | logicTree.dispatchViewEvent(payload) |
| 调用页面或组件方法 | 逻辑树调用对应的方法；抛错会转成 EVENT_HANDLER_ERROR 诊断。 | page.invokeMethod(handler, [event]) |
:::

:::::split
::::stack
:::card{tag="事件对象" title="service 收到的内容"}
```js
{
  id: 'page-1#0',
  name: 'tap',
  detail: { ... },
  native: { clientX: 120, clientY: 80, ... },
  touches: [ ... ],
  changedTouches: [ ... ],
  target: { viewId: 'view-7', offsetLeft: 12, offsetTop: 8, offsetWidth: 80, offsetHeight: 32 },
  currentTarget: { viewId: 'page-1#0', offsetLeft: 0, offsetTop: 0, offsetWidth: 375, offsetHeight: 120 }
}
```
:::

:::callout{title="handler 对不上也会出诊断"}
`EVENT_HANDLER_MISSING` 和 `EVENT_PAGE_NOT_FOUND` 都是 warning，不会影响其他事件。
:::
::::

::::stack
:::card{tag="组件事件" title="triggerEvent 留在逻辑树"}
自定义组件的 `triggerEvent` 在 service 的逻辑树内部完成捕获和冒泡，不会为了一个自定义事件再走一次 render 往返。
:::

:::card{tag="内置组件" title="detail 由宿主归一化"}
button、input、scroll-view、swiper、canvas 等内置组件把原生字段归一化成小程序 detail；service 只负责分发，不按 tag 合成领域事件。
:::
::::
:::::

## WXS：表达式按模板求值，事件与观察器在 render {#wxs kicker="WXS"}

微信官方的 WXS 是运行在视图层的脚本语言，支持模块、受限 globals、`getRegExp` / `getDate`、事件处理和 `change:prop`。参考：[WXS 概述](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxs/)、[WXS 事件](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxs/06event.html)、[WXS 观察](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxs/08observation.html)。

所有正式宿主（browser 测试宿主、devtool、iOS render WKWebView）都启用 pageframe：render 加载一份 `templates.js`，页面和组件 WXML 由 pageframe 求值。service 逻辑树仍从同一份模板生成逻辑节点和组件实例，供查询、关系和组件身份索引使用；它不再是页面 WXML 的执行所有者。WXS 在 pageframe 按页隔离：

| 用途 | 执行侧 | 说明 |
| --- | --- | --- |
| WXML 表达式 | render pageframe | `{{wxs.fn()}}`、class/style 条件、`wx:if` / `wx:for` 在 pageframe 内按模板求值；pageframe 的组件树就是实际 DOM/组件边界 |
| 静态 WXS 事件 | render（所有标签） | 静态 `{{wxs.tap}}` 通过 `Q.B` 发布 handler 路径；逻辑树里的 listener 是占位（`catch` / `capture` 仍参与 service 冒泡），实际 handler 在 render 执行 |
| 动态 WXS | service 解析，render 执行 | `Q.B` + `originOf()` 产出可选 `moduleId/exportPath`；render `resolve()` 失败时回传 `tree.event` |
| 自定义组件事件 | render | service 的 `triggerEvent` 已跑完 JS listener 后转发 `tree.customEvent`；只有页面上存在该事件的 WXS binding 才转发 |
| `change:prop`（内置组件） | render | 节点 props 变化驱动，旧值 / 新值 / ownerInstance / instance |
| `change:prop`（自定义组件） | render | 组件数据变化驱动（编译器对每个标签都产出 `wx-tiny-wxs-props`），不再是 glass `R.p` observer |
| WXS module state | 页级隔离 | render 的每个 pageframe 维护独立模块表，页面模板、组件模板和同页多个组件实例共享；service 逻辑模板有独立表达式 runtime，但不承接 render handler 的闭包状态。页面卸载时释放，跨页不共享 |

WXS 代码在编译期完成：

- `Math` / `JSON` 等 globals 改写；
- `getRegExp` / `getDate` 映射；
- `.constructor` 值语义转换；
- 外部 / 内联模块表生成。

事件执行对齐微信的主要边界：

- WXS handler / `change:prop` 对内置组件和自定义组件都在 render 执行，包括 `input` / `textarea` 的 WXS `bindinput`；
- 自定义组件事件先由 service 分发 JS listener，再转发 render 派发 WXS handler；WXS `catch` 只影响 render 侧冒泡；
- `input` / `textarea` 的普通 JS `bindinput` 仍使用微信的 `PAGE_EVENT` service 派发；一旦值是 WXS 函数，handler 由 pageframe 执行，并使用 render descriptor（含 `getState` / `getComputedStyle`）；
- `catch` / `capture-bind` / `capture-catch` / `return false` 生效；
- 本地 handler 执行后，只有路径上存在 service listener 才回传；
- `mutated` 元数据会传递，但 `mut-bind` 的本地语义尚未实现。

render 侧 `ComponentDescriptor` 已覆盖 `selectComponent`、`getDataset`、`getState`、`setStyle`、class 方法、`getComputedStyle`、`getBoundingClientRect`、timers / RAF、`callMethod`、`triggerEvent`；service 侧 descriptor 覆盖 `selectComponent`、`getDataset`、`setStyle`、`callMethod`、`triggerEvent`，只用于承接 render WXS handler 的 `callMethod` / `triggerEvent` effect，不执行 WXS handler 本身。`getState` 按 descriptor 元素存储，使 `change:prop` 观察器与后续事件 handler 看到同一份 state；`setStyle` 的 rpx 固定按 750 转成 vw。微信 3.17.5 的 pageframe descriptor 不包含 `getData()`，WXS 通过 `getDataset()` 或事件的 `target` / `currentTarget` 读取渲染数据。

当前明确的限制：

- WXS source map 已随 `wxsModules` 进入 `templates.js`，但 devtool/调试器尚未消费它；
- 微信 `wcc -d -ds` 生成码把 `f_` 指向 `__WXML_GLOBAL__.modules`，用 `f_['wxs/...'] = nv_require(...)` 缓存模块访问器；页面模板、组件模板和同页组件实例都从这里取 exports。Tiny 用 `page:${pageId}` runtime 重建这个 pageframe 边界，卸载页面时释放；
- 2026-11-11 用微信 3.17.5 自动化 fixture 验证：同页两个组件实例共用模块实例，B 页与 A 页重入各自获得新实例；2026-11-12 进一步确认 `input`/`textarea` 的 WXS `bindinput` 也在 pageframe 执行。render WXS handler 只执行一次，跨树 `tree.wxsHandler` 状态回放已移除；service 逻辑模板的 WXS 表达式只用于身份/索引投影，不再承接 render handler 的闭包状态。
- `input` / `textarea` 的普通 JS `bindinput` 仍由 service 侧 `PAGE_EVENT` 语义派发；WXS `bindinput` 在 render 侧执行，使用 render descriptor 的 `getState` / `getComputedStyle`；
- 无法通过 origin 识别的 WXS 函数（例如闭包、`bind()` 后的新函数）不注册 handler，需用模块导出形式；
- `callMethod` / `triggerEvent` 是跨线程 RPC，返回值不是同步语义。

## 组件定义、observer、relation 都在逻辑树 {#components kicker="组件语义"}

service 侧维护完整的组件定义、逻辑树和关系图。render 只保留组件容器和真实节点。

| 能力 | 实现 | 关键行为 |
| --- | --- | --- |
| Behavior | `normalizeComponentDefinition` | 嵌套 behaviors 去重并检测循环；执行顺序是被引用 behavior → 引用者 → 组件；组件覆盖 properties/methods/data |
| component-export | `wx://component-export`（scheme 可配置）+ export() | selectComponent 返回 export() 的结果，而不是组件实例 |
| observers | `observers` / property observer | 支持对象/数组写法、逗号分隔的多路径、** 和 .** 通配；property observer 收到旧值；递归上限 20 |
| relations | `normalizeComponentDefinition` + glass-easel relation builder + `ComponentTree` | parent / child / ancestor / descendant；双方都声明才会建立；支持 linked / unlinked / linkChanged / linkFailed |
| 选择器 | `selectComponent` / `selectAllComponents` / `selectOwnerComponent` | 默认不穿透组件边界；>>> 可以显式穿透；结果按逻辑树顺序返回 |
| 组件型页面 | `MiniProgramPageInstance` + 整理后的定义 | query 按 property 类型转换；执行 created/attached/ready/detached；页面根也会进入逻辑树 |

:::::split
::::stack
:::card{tag="behaviors" title="合并顺序和限制"}
每个 behavior 的 properties/data/methods/lifetimes/pageLifetimes/observers/relations/externalClasses/options 都会被收集；重复引用只执行一次。

内置 behavior id（默认 `wx://...`）支持 `component-export`、`form-field`、`form-field-button`、`form-field-group`、`label-target` 和 `style-filter`，其余会报 `UNSUPPORTED_BEHAVIOR`。Behavior 的 definitionFilter 已按引用链执行；写在 Component 上的 definitionFilter 仍会报诊断。
:::

:::card{tag="relations" title="双方声明才会建立关系"}
父组件声明 `child` 时，子组件也要声明对应的 `parent`；祖先和后代同理。只声明一侧不会连上。

attached 触发 linked，detached 触发 unlinked，移动时触发 linkChanged；父级或祖先找不到目标时触发 linkFailed。组件型页面的 relations 会按 page shadow tree 的 target path 匹配，并手动触发两端的 linked/unlinked。
:::
::::

::::stack
:::card{tag="tree" title="逻辑树和渲染树只共享组件 id"}
逻辑树保存 pageId、path、tag、id、class、parent、顺序和虚拟节点；渲染树只保存组件 id 到真实组件的映射、元素本地 id 和 locator，不保存组件 data 或 observer。
:::

:::card{tag="页面生命周期" tone="warn" title="按实例分发"}
page.show/hide 会遍历 service 里的所有组件实例，逐个调用 pageLifetimes。render 没有 componentPageLifetime 回路，避免重复执行。

generics（含页面级 `generic:x` 覆盖）、definitionFilter、pureDataPattern、分包按需加载、`preloadRule` 预取、独立分包入口和异步组件 chunk 已接入：占位组件先渲染，分包定义到达后由 glass-easel 自动替换。独立分包页面不继承主包 `app.wxss`；跨包共享模块由 `chunks/` 单实例加载。
:::

:::card{tag="样式" title="组件配置进入 flow"}
`multipleSlots`、`virtualHost`、`styleIsolation`、`addGlobalClass` 和 `externalClasses` 会随 component schema/flow 下发给渲染树，渲染树用它们创建组件容器和作用域。
:::
::::
:::::

## 渲染树：宿主实现真实组件 {#render kicker="渲染树"}

渲染树由宿主实现。runtime 只定义 `TreeRenderer` 契约：从编译模板挂载页面、安装模板与组件定义、接收页面/组件数据和身份 hints、事件/宿主回调、查询、测量、inspectTree、动画和相交观测。渲染树不执行 app methods 或 observer，但会用同一份 `templates.js` 求值页面和组件 shadow tree。

```ts
export type TreeRenderer = {
  mountPage(request: PageFrameMount): void
  mountTabBarPage?(request: PageFrameMount): void
  // 首屏/更新所需的数据和模板
  setTemplates?(templates: TemplateRegistry): void
  setComponentDefinitions?(definitions: Record<string, ComponentDefinitionPayload>): void
  setPageFrameHints?(root: RenderNode): void
  setPageFrameComponents?(components: RenderComponentIdentity[]): void
  setPageData?(data: Record<string, unknown>): void
  applyPageDataPatches?(patches: Array<Record<string, unknown>>): void
  setComponentData?(data: Record<string, Record<string, unknown>>): void
  setWxsModules?(table: WxsModuleTable): void
  // 事件和宿主回调
  setEventSink?(sink: (event: TreeEventPayload) => void): void
  setTemplateEventSink?(sink: (event: RenderTemplateEvent) => void): void
  setWxsEffectSink?(sink: (effect: WxsRenderEffect) => void): void
  setHostActionSink?(sink: (action: RenderHostAction) => void): void
  setHostRequestSink?(sink: (method: string, payload: unknown) => Promise<unknown>): void
  // 查询、测量、样式和收尾
  applyStyles?(styles: string[]): void
  query?(selector: string, all: boolean, scopeId?: string): unknown[]
  measure?(ids: string[]): Record<string, unknown>
  measureLocators?(locators: string[]): Record<string, unknown>
  measureCanvas?(selector: string, canvasId: string): unknown
  inspectTree?(): unknown
  observeIntersection?(request, emit): (() => void) | undefined
  playAnimation?(request: RenderAnimationRequest): void
  clearAnimation?(request: RenderClearAnimationRequest): void
  dispose?(): void
}
```

完整签名和可选字段见 `packages/runtime/src/tree/render/thread.ts`。

::::cards{layout="three"}
:::card{tag="Web" title="createGlassRenderTree"}
`@tiny/host-web` 的 DOM 渲染树注册真实 `tiny-*` 内置组件，维护 slot、shadow root、class/scope、样式和 DOM；`createGlassRenderTree` 负责创建它，`bootRenderEntry` / `createGlassRenderEntry` 负责安装基础 CSS。内置组件定义和默认样式来自 `@tiny/host-web-components`。
:::

:::card{tag="iOS" title="WKWebView render root"}
iOS 与 browser 一样使用 pageframe：每个页面一个 render WKWebView，加载同一份 `templates.js`，由 `createGlassRenderEntry` 创建 DOM 渲染树。
:::

:::card{tag="Test" title="headless pageframe"}
runtime 单测用 headless pageframe 验证数据补丁、组件身份、元素 locator 和事件回传，不需要 iframe 或 DOM。
:::
::::

:::::split
::::stack
:::card{title="首屏：tree.flow"}
service 把组件定义、整棵身份快照和页面数据编成 component flow（define/tree/ready）；pageframe 安装组件定义后从编译模板挂载页面。
:::

:::card{title="更新：tree.patch"}
service 发送 `pageDataPatches` / `componentData`；结构变化只附 `renderHints` / `componentFlow`。pageframe 在本地 diff，独立 tabBar 使用 `tabFrame` 重新挂载/更新。更新按 pageId 合批，保持页面内顺序。
:::
::::

:::card{tag="元素树" title="inspectTree"}
渲染树按自己的真实组件树返回 `InspectNode`，包括 tag、attributes、className、style 和 children；宿主和 devtool 通过 `runtime.inspectTree` 读取。
:::
:::::

:::callout{title="render 不负责业务路由"}
渲染树不保存页面栈，也不决定页面切换。它只响应宿主转发的 tree flow/patch、query/canvas 控制和 inspectTree，并把事件按组件 id / 元素 locator 回传 service。
:::

## 39 个内置组件由宿主提供 {#builtins kicker="内置组件"}

内置组件不是 service 里的 glass 组件，也不是用户 WXML；service 只输出语义 tag，宿主把它们映射成真实内置组件。

::::cards{layout="three"}
:::card{tag="AOT" title="模板和样式"}
`build-templates.mjs` 把 39 个 `template.wxml` 编成一个模板 group；`build-styles.mjs` 合成基础样式加 39 份组件样式。

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

:::callout{title="不是完整微信组件库" tone="warn"}
2.33.0 的 39 个 WebView 目标标签都已落地，但 video/audio/web-view 是浏览器近似；open-type 的真实平台能力、表单上报、无障碍细节和 Skyline 语义仍不完整。
:::

## 样式：service 算 scope，render 应用 {#styles kicker="样式隔离"}

样式表按 cascade role 分类（builtin / low-priority / app / page / component / page-scope / shared）。service 过滤并计算 scope，渲染树把样式应用到真实组件树；内置 CSS 始终归宿主。

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

:::callout{title="低优先级 CSS 先于页面样式" tone="good"}
页面/组件的 `:host` 规则编译进 `*.low.css`，runtime 按 role 先追加 low-priority，再追加 app、page-scope 和 page/component，宿主默认样式因此总可以被覆盖。app 样式没有 scope，它的 low-priority 输出通常为空。
:::

## Canvas、查询和相交观测 {#canvas kicker="Canvas 与查询"}

canvas 已经从核心 runtime 移出。浏览器宿主的 service 通过 `ServiceCanvasAdapter` 取得 OffscreenCanvas 控制面；iOS 的 service 通过命令录制把 display-list 交给 render WKWebView 回放。selector query 和 IntersectionObserver 通过渲染树的 `query` / `observeIntersection` 回到真实 DOM。

:::::split
::::stack
:::card{tag="Canvas handoff" title="浏览器：2D / WebGL / RAF"}
浏览器宿主把 render iframe 的 OffscreenCanvas 通过 postMessage 中继给 service；之后 service 直接持有控制面，支持 2D、WebGL、requestAnimationFrame 和 `createImage`。
:::

:::card{tag="SelectorQuery" title="在渲染树里查节点"}
`createSelectorQuery` 把 selector、page/component 作用域和 all 发给渲染树；宿主返回 rect、dataset 和 scroll。`.node()` 仍走 canvas handoff，并支持组件作用域下的样式 class。
:::
::::

::::stack
:::card{tag="IntersectionObserver" title="observe / disconnect"}
service 把 observe 请求和 view id 发给渲染树；Web 宿主用原生 IntersectionObserver，entry 通过 `query.intersection` 事件回到逻辑树。
:::

:::card{tag="Native Canvas" title="iOS：display-list 回放"}
iOS 没有 OffscreenCanvas。service 侧记录 Canvas 2D 调用，native 渲染层在每页 WKWebView 的真实 `<canvas>` 上回放；`measureText` 走 CoreText 同步桥，WebGL 和同步读回仍未接。
:::
::::
:::::

:::callout{title="两套 animation API" tone="warn"}
`this.animate` / `clearAnimate` 会把 keyframes 归一化后走 `tree.animate`，Web 宿主用 Web Animations API 播放，支持多 step 和 scroll-driven 时序；scroll 模式目前不回传完成回调。

`wx.createAnimation` 仍是最终态 CSS transition：编译期把 `animation` 属性改写成内联 style，多 step 时序和事件回调没有还原。
:::

## 当前限制 {#limits kicker="限制"}

两侧树已经接管默认宿主，但下面这些仍是明确缺口。

::::cards


:::card{tag="事件" tone="warn" title="target 语义仍是近似"}
`tree.event` 已带 `target` / `currentTarget` 的 offset 几何，但两者目前都解析到绑定 handler 的节点；嵌套元素的 `event.target` 语义和微信仍有差别。
:::

:::card{tag="tabBar" tone="warn" title="独立 tabBar 仍使用快照"}
页面根和自定义 tabBar 都已经走 pageframe。tabBar 通过独立 `tabFrame` 从组件模板挂载，source 仍由 service 逻辑树维护；页面和 tab 根共享同一个渲染批次。
:::

:::card{tag="组件" tone="warn" title="trait/chaining 和平台组件仍有缺口"}
trait behaviors / chaining API 和 20 个平台/开放能力组件仍未实现；componentPlaceholder、generics、definitionFilter、pureDataPattern 和 6 个 `wx://` behavior 已接入。
:::

:::card{tag="页面" tone="warn" title="页面形态仍以 devtool 宿主为主"}
14 项页面生命周期和 5 个路由 API 已接，分享回调、下拉刷新和退出状态可用；devtool 已有分享面板、forward/back/replace 页面转场、页面栈 + data 恢复、首屏 `this.exitState` 和独立页级 custom tabBar `tabFrame`。跨宿主冷启动时的退出状态落盘仍由宿主决定；通用 `host-web` 的页面 chrome 和预下载策略仍是缺口。
:::

:::card{tag="API" tone="warn" title="API 覆盖有限"}
已支持 storage、导航、system、request、toast/modal/loading/actionSheet、network/battery、剪贴板、振动、base64/ArrayBuffer 转换、canvas、selector query 和 IntersectionObserver；媒体、真实文件系统、位置、WebSocket 和真实账号授权还没有。
:::
::::

:::callout{title="继续阅读"}
这些问题在宿主侧怎么处理，可以看 [宿主适配](#/hosts)；现有测试覆盖到哪里，可以看 [测试与验收](#/testing)。
:::
