# 微信 WebView 版功能对齐度分析

> **快照**：2026-10-26（第十三次同步） · **基准**：微信小程序 WebView 渲染版（不含 Skyline / XR-FRAME / 扩展组件库）
>
> **结论**：加权功能对齐约 **44.7%（43–46%）**；页面启动率 92.3%；生产可替换 < 20%
>
> **维护**：功能完成后更新本文的评分表、覆盖表、实测数据和变更记录

---

## 1. 结论摘要

- 按微信 WebView 版全量能力计算，当前引擎约完成 **四成半**：加权得分 **44.67%**。
- 能力结构仍然偏科：**编译/渲染约 75%，框架约 63%，内置组件约 54%，平台 API 约 13%，页面形态约 25%**。
- 自定义组件高级语义已补齐：`behaviors`、`observers`、`relations`、`externalClasses`、`styleIsolation`、`selectComponent` 均已落地，Component-as-page 也接入了同一套核心语义；UI 库的核心语义障碍基本移除，但 npm 构建、`generics`/`definitionFilter` 等仍有缺口。
- 内置组件已完成宿主迁移、P0 视觉重写和 P1 内部结构收口：23 个标签为真实 `tiny-*` 宿主，采用 Flat DOM + scoped CSS 隔离公开宿主与私有内部实现；checkbox/radio/switch/slider/icon/image/picker/picker-view 已按 2.7.0 参考实现重写；input/textarea/button/form 完成 wrapper/分支/语义补强，scroll-view 接受 native 滚动近似。
- 仓库内置的微信官方 demo 子集（117 页）中，**108 页能启动（92.3%）**，104 页有可见文本；canvas 2D/WebGL 两页已修复，但启动率仍是“能挂载”，不是“功能对齐”。
- 普通业务小程序最依赖的 `wx.login`、`wx.requestPayment`、媒体/文件/定位等平台 API 仍未实现；内置导航栏/tabBar 已在 devtool 宿主落地并接入 `switchTab`，但自定义 tabBar、下拉刷新、分享与转场仍缺。
- 一句话：**组件语义这条线已经补齐，平台 API 和页面形态仍是决定“能否替换微信运行时”的主要短板。**

仓库自己的 [Status 页](../website/src/pages/Status.jsx) 也给出了相同定性判断（“能跑真实示例，还不是完整微信兼容”），本文把它量化，并保留可复测的口径。

---

## 2. 评估口径

### 2.1 基准规模

以 2026-10-24 的[微信组件文档](https://developers.weixin.qq.com/miniprogram/dev/component/)与[微信 API 文档](https://developers.weixin.qq.com/miniprogram/dev/api/)为准：

| 项目 | 微信 WebView 版规模 | 说明 |
| --- | ---: | --- |
| 内置组件 | **60** | 剔除 Skyline 的 23 个组件/手势；含 11 个开放能力组件（web-view/ad/store-* 等），以及 `page-meta`、`navigation-bar` 配置节点 |
| 核心 UI 组件 | **45** | 60 减去 11 个开放组件、`aria-component`、`navigation-bar`、`page-meta`、`functional-page-navigator` |
| wx API 条目 | **502** | API 索引中的 `wx.*` 条目；同步/异步、`on*`/`off*` 分别计数，含少量命名空间入口。分母未逐条剔除 Skyline/云开发/AI 条目，对量级结论影响很小 |
| 页面生命周期 | **14** | onLoad / onShow / onReady / onHide / onUnload / onPullDownRefresh / onReachBottom / onPageScroll / onResize / onTabItemTap / onShareAppMessage / onShareTimeline / onAddToFavorites / onSaveExitState |
| 应用生命周期 | **7** | onLaunch / onShow / onHide / onError / onPageNotFound / onUnhandledRejection / onThemeChange |
| 路由 API | **5** | navigateTo / navigateBack / redirectTo / reLaunch / switchTab |
| app.json 关键字段 | **20+** | pages / window / tabBar / subPackages / usingComponents / style / lazyCodeLoading / permission / sitemapLocation / workers / plugins / renderer / preloadRule 等 |

> Skyline 对结论影响很小：把 Skyline 的 23 个组件算进来，组件覆盖率会从 30% 降到 22%，总分只掉约 1.5 个百分点。**真正拉低分数的是 API 和页面形态，不是 Skyline。**

### 2.2 权重

权重按“普通业务小程序能否跑起来”的主观重要性分配，不是微信官方标准：

| 维度 | 权重 | 说明 |
| --- | ---: | --- |
| 编译/构建 | 10% | WXML/WXSS/JS/TS/WXS、产物、配置 |
| 框架运行时 | 18% | 生命周期、路由、组件语义、setData、事件 |
| 内置组件 | 17% | 标签数量、属性/事件、默认外观 |
| wx API | 20% | 平台能力广度与真实行为 |
| 页面形态 | 12% | 导航栏、tabBar、下拉/触底/滚动、分享、转场 |
| 样式/渲染 | 8% | WXSS 能力、作用域、隔离、canvas |
| 宿主/平台 | 8% | 浏览器/原生宿主、网络/登录/支付等平台层 |
| 开发工具 | 4% | 调试、状态、元素树、网络/存储面板 |
| 质量/验证 | 3% | 单测、浏览器验收、性能/视觉/安全 |

### 2.3 计分方式

- **完成度**：该维度内“已实现且有代码证据的条目 / 微信 WebView 文档条目”，或按关键能力清单打分。
- **加权得分**：`Σ(权重 × 完成度)`。
- **区间**：权重调整会让结果在 35–39% 之间浮动；把 API 权重降到 15%、框架权重升到 20%，结果约 38–39%，但不会到 50%。
- 所有百分比都是**工程估算**，用于判断量级和优先级，不是精确指标。

---

## 3. 总评分

| 维度 | 权重 | 完成度 | 加权 | 关键依据 |
| --- | ---: | ---: | ---: | --- |
| 编译/构建 | 10% | 75% | 7.50 | WXML/WXSS/WXS 基本完整；app.wxss 的 tag/class 规则可作用到页面与内置宿主；app.json 只消费少量字段；无 npm 构建、无 TS 类型检查 |
| 框架运行时 | 18% | 63% | 11.34 | 9/14 页面生命周期、3/5 路由；tab 页缓存/onTabItemTap、group/label/touchtrack/scroller 基础已接；缺 generics/definitionFilter |
| 内置组件 | 17% | 55% | 9.35 | 23/60 标签；P0 视觉完成，P1 内部结构大幅收口；canvas 2D/WebGL 已接真实 context；已统计属性 118/146、事件 44/46 |
| wx API | 20% | 13% | 2.60 | 65/502；request/async storage/modal/loading/网络/剪贴板/主题/profile/tabBar/switchTab 等已接或桩 |
| 页面形态 | 12% | 25% | 3.00 | devtool 宿主已实现导航栏/tabBar/页面滚动/触底/tab 页缓存；测试/生产宿主仍未提供，评分保守；缺下拉刷新/分享/转场 |
| 样式/渲染 | 8% | 76% | 6.08 | WXSS/rpx/作用域强；app.wxss tag/class 规则作用到页面与共享组件；canvas 2D/WebGL/RAF 已接，导出 API 仍缺 |
| 宿主/平台 | 8% | 15% | 1.20 | 仅浏览器宿主；无原生/网络/登录/支付/分享 |
| 开发工具 | 4% | 45% | 1.80 | 应用列表/3 应用保活、每页 render 帧、生命周期时间线、宿主导航/tabBar、移动端访问提示；不是完整微信开发者工具 |
| 质量/验证 | 3% | 55% | 1.65 | 180 单测 + 48 步浏览器验收；新增 tabBar/视觉结构、应用列表/LRU/页面栈上限、移动端提示页断言；无性能/安全/原生测试 |
| **合计** | **100%** | — | **44.67%** | |

### 条目覆盖率速览

| 指标 | 微信 WebView | Tiny | 覆盖率 |
| --- | ---: | ---: | ---: |
| 内置组件标签 | 60 | 23 | 38.3% |
| 核心 UI 组件 | 45 | 23 | 51.1% |
| wx API 条目 | 502 | 65 | 12.9% |
| 官方 demo 实际调用 API | 150 | ~35 | ~23% |
| 页面生命周期 | 14 | 9 | 64.3% |
| 应用生命周期 | 7 | 3 | 42.9% |
| 路由 API | 5 | 3 | 60.0% |
| 已统计组件属性 | 146 | 118 | 80.8% |
| 已统计组件事件 | 46 | 44 | 95.7% |
| app.json 关键字段 | 20+ | 4 | ≈20% |

> API 的 65 个 = 63 个 core service API + 2 个宿主扩展（`getMenuButtonBoundingClientRect`、`getPerformance`）；不含命名空间、同步/异步别名去重后的额外条目。
>
> 自定义组件核心语义本次盘点 **8 / 12**：已实现 behaviors、observers、relations、externalClasses、styleIsolation/addGlobalClass、selectComponent/selectAll/selectOwner、multipleSlots/virtualHost、component-export/export；仍缺 generics、placeholders、definitionFilter、pureDataPattern。该口径只统计核心 12 项，不含 trait/chaining、内置 `wx://form-field`、Component-as-page 等边缘项；不参与上面的加权总分。

---

## 4. 分项覆盖

### 4.1 内置组件

**23 / 60 = 38%**。按分类：

| 分类 | 数量 | 已实现 | 缺口 |
| --- | ---: | ---: | --- |
| 视图容器 | 11 | 4 | movable-area、movable-view、cover-view、cover-image、match-media、page-container、root-portal |
| 基础内容 | 5 | 3 | rich-text、selection |
| 表单 | 17 | 14 | editor、editor-portal、keyboard-accessory |
| 导航 | 2 | 0 | navigator、functional-page-navigator |
| 媒体 | 9 | 1 | audio、video、camera、live-player、live-pusher、voip-room、channel-live、channel-video |
| 地图 | 1 | 0 | map |
| 画布 | 1 | 1 | canvas（selector node 与 legacy 均走 OffscreenCanvas） |
| 开放能力 | 11 | 0 | web-view、ad、ad-custom、official-account、official-account-publish、open-data、reward、store-* |
| 无障碍 | 1 | 0 | aria-component |
| 导航栏 | 1 | 0 | navigation-bar |
| 页面属性 | 1 | 0 | page-meta |
| **合计** | **60** | **23** | |

**已实现组件**（[tags.ts](../hosts/web-components/src/tags.ts:1)）：
`view`、`text`、`button`、`label`、`input`、`checkbox`、`checkbox-group`、`radio`、`radio-group`、`icon`、`image`、`scroll-view`、`slider`、`progress`、`switch`、`swiper`、`swiper-item`、`canvas`、`textarea`、`form`、`picker`、`picker-view`、`picker-view-column`。

> 逐组件的当前状态/剩余问题见 [component-reference-diff.md](./component-reference-diff.md)；历史差异审计与修复方案见 [component-reference-history.md](./component-reference-history.md)。

**属性/事件覆盖**（仅统计 WebView 适用属性；事件按组件文档属性表中的 `bind*`/`catch*` 条目统计，不含 `tap`/`longpress` 等通用事件）：

| 组件 | 文档属性 | 已支持 | 文档事件 | 已支持 | 主要缺口 |
| --- | ---: | ---: | ---: | ---: | --- |
| button | 22 | 22 | 9 | 9 | open-type 事件以失败回调形式触发；真实平台 API 未接 |
| canvas | 3 | 3 | 6 | 6 | 触摸/longtap/error 已接；仍为占位画布 |
| checkbox-group | 0 | 0 | 1 | 1 | 缺公开受控 `value` |
| checkbox | 4 | 4 | 0 | 0 | 自定义视觉已对齐；tap/group 语义仍差 |
| icon | 3 | 3 | 0 | 0 | WeUI 字体重写完成；longpress 缺 |
| image | 6 | 5 | 2 | 2 | 背景图已对齐；longpress/lazy 仍缺 |
| input | 26 | 17 | 10 | 8 | keyboardheightchange、nicknamereview、placeholder-style |
| label | 1 | 1 | 0 | 0 | `for` 已绑定；label-target 分发仍依赖原生 label |
| progress | 11 | 10 | 1 | 1 | 少量外观/动画细节 |
| radio-group | 0 | 0 | 1 | 1 | 缺公开受控 `value` |
| radio | 4 | 4 | 0 | 0 | 自定义视觉已对齐；tap/group 语义仍差 |
| scroll-view | 24 | 10 | 10 | 10 | 三层结构/touchtrack 仍是近似 |
| slider | 12 | 12 | 2 | 2 | 自定义 track/thumb；透明 range 交互层 |
| swiper-item | 2 | 1 | 0 | 0 | skip-hidden-item-layout |
| swiper | 16 | 15 | 3 | 3 | 仍为 flex track，未改 slide-frame |
| switch | 4 | 4 | 1 | 1 | 52×32 自定义视觉；type="checkbox" 缺 |
| text | 4 | 3 | 0 | 0 | decode 未真正解码 |
| view | 4 | 4 | 0 | 0 | hover 默认 none；shared `wx-hover` |
| **合计（19 个已统计组件）** | **146** | **118（80.8%）** | **46** | **44（95.7%）** | |

> `textarea` / `form` / `picker` / `picker-view` / `picker-view-column` 已计入标签数，但属性/事件明细尚未并入上表；因此 146 是这 19 个组件的文档条目之和，不是 23 个组件的全量分母。
>
> 当前剩余项：`input`/`textarea` 的原生键盘属性、`button` 的 native/open-type、`form` 的真实上报、`picker` 的 region；`scroll-view` 接受 native 滚动近似，不再列为待修复。

> 事件覆盖按“事件名已绑定并能触发基础 detail”统计；button open-type 事件和部分 scroll-view refresher 事件目前是失败/模拟回调，不是微信平台 API 的真实成功语义。

**外观保真度**：P0 视觉重写已完成，P1 组件也补齐了 wrapper/结构（input/textarea/button/form/swiper）；剩余差异主要是原生键盘属性、native/open-type、picker region 和 scroll-view 的 native 滚动，不再有 P0 级默认外观错位。

> 不支持的标签会降级为普通 DOM 元素，只发 `UNSUPPORTED_COMPONENT` warning，不抛错。页面能开，但组件没有行为。

### 4.2 wx API

**65 / 502 ≈ 13%；官方 demo 实际用到的 150 个唯一 `wx.*` 中约支持 35 个（~23%）。**

能力分布：

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| 系统信息 | 部分 | `getSystemInfo` / `getSystemInfoSync` 可用；字段仍以宿主快照为准，缺完整设备/安全区信息 |
| 数据缓存 | 部分 | sync/async、remove/clear/info 已接；仍只有宿主内存快照，刷新即丢，无 batch |
| 路由 | 部分 | navigateTo/navigateBack/switchTab；无 redirectTo/reLaunch |
| 界面交互 | 部分 | toast/loading/modal/actionSheet 有浏览器 overlay；导航栏/tabBar 在 devtool 宿主可用 |
| 网络 | 部分 | `request` 已接 fetch；upload/download/WebSocket/UDP/TCP 仍无 |
| 登录/账号 | 桩 | `login` 返回宿主 stub code，`checkSession` 成功；无真实会话/getUserProfile |
| 支付/分享/订阅 | 桩 | show/hide/updateShareMenu 成功；无 UI、支付、订阅；tabBar badge/red-dot 已接 |
| 媒体 | 无 | 无 chooseImage/chooseMedia/previewImage/audio/video/recorder/camera |
| 文件 | 桩 | getFileSystemManager 只有可调用的 fail stub；无真实读写/openDocument/saveFile |
| 位置/设备 | 部分 | 网络类型、电池、剪贴板、震动已接；无定位/扫码/电话/蓝牙/NFC |
| 画布 | 部分 | 浏览器宿主把 selector-query 与 legacy canvas 都 handoff 为 OffscreenCanvas，service 侧保留同步 Canvas API；触摸、RAF、createImage、WebGL 已接，导出 API 仍缺 |
| 动画 | 部分 | `createAnimation` 只映射最终态 CSS transform/transition，无多 step 时序与回调 |
| 选择器 | 桩 | `createSelectorQuery` 只对 canvas 做 measure，普通节点返回 0×0 |
| 观测器 | 无 | 无 `createIntersectionObserver` |
| 更新/性能/隐私 | 无/桩 | 无 getUpdateManager；getPerformance 为宿主桩；无隐私授权 |

关键代码入口：

- 服务 API：[service/api-host.ts](../packages/runtime/src/service/api-host.ts:1)
- 宿主 API：[host-api.ts](../packages/runtime/src/host-api.ts:1)、[hosts/browser/api-handlers.ts](../hosts/browser/src/api-handlers.ts:1)
- 不支持 API 的降级：`wx` Proxy 返回 `undefined` + `UNSUPPORTED_API` warning（[service/api-host.ts](../packages/runtime/src/service/api-host.ts:1)）

> 降级策略是“静默 undefined”，不是抛错。页面不会立刻崩，但失败会推迟到调用方 `.then`/属性访问时才暴露，排查成本高。

### 4.3 生命周期与路由

页面生命周期 **9 / 14**（[service.ts](../packages/runtime/src/service.ts:18)）：

| 生命周期 | 状态 |
| --- | --- |
| onLoad / onShow / onReady / onHide / onUnload | ✅ |
| onPageScroll / onReachBottom | ✅ 由 render 页面帧的真实滚动容器驱动 |
| onResize | ✅ 宿主窗口快照变化时触发（devtool 导航栏/内容区变化） |
| onTabItemTap | ✅ switchTab / 点击 tabBar 时触发 |
| onPullDownRefresh | ❌ |
| onShareAppMessage / onShareTimeline / onAddToFavorites / onSaveExitState | ❌ |

应用生命周期 **3 / 7**：

| 生命周期 | 状态 |
| --- | --- |
| onLaunch / onShow / onHide | ✅ |
| onError / onPageNotFound / onUnhandledRejection / onThemeChange | ❌ |

路由 **3 / 5**：

| API | 状态 |
| --- | --- |
| navigateTo / navigateBack | ✅ |
| switchTab | ✅ tab 页缓存、tabBar 状态、onTabItemTap |
| redirectTo / reLaunch | ❌ |

### 4.4 app.json 配置

| 字段 | 状态 |
| --- | --- |
| `pages` | ✅ |
| `subPackages` / `subpackages` | ✅ 编译、可直接启动；无按需加载/预下载/独立分包 |
| `usingComponents` | ✅ |
| `window` | ⚠️ 只透传到 manifest，运行时不消费 |
| `tabBar` | ✅ 内置 tabBar 配置、颜色/位置/徽标/红点/显隐、`switchTab`；`custom: true` 发 `TABBAR_CUSTOM_UNSUPPORTED` 警告 |
| `style` / `lazyCodeLoading` / `permission` / `sitemapLocation` / `workers` / `plugins` | ❌ |
| `renderer` / `rendererOptions` / `preloadRule` / `resizable` / `darkmode` / `requiredPrivateInfos` | ❌ |

`project.config.json` 只读取 `miniprogramRoot`。没有 npm 构建 / `miniprogram_npm`，第三方组件库无法按微信方式安装。

### 4.5 自定义组件语义

2026-10-24 已完成核心语义（[component-definition.ts](../packages/runtime/src/component-definition.ts:115)）：

```text
properties / data / methods / lifetimes / pageLifetimes / slots
behaviors / observers / relations / externalClasses
options: multipleSlots / virtualHost / styleIsolation / addGlobalClass
selectComponent / selectAllComponents / selectOwnerComponent / getRelationNodes
hasBehavior / export / wx://component-export
```

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| `behaviors` | ✅ | 嵌套合并、去重、环检测、组件覆盖、生命周期/observers 顺序；`wx://` 内置 behavior 仅支持 `component-export` |
| `observers` | ✅ | `observers` 块 + 属性级 `observer`；支持多字段、`arr[12]`、`some.field.**`、`**`；本地 `setData` 同步，父级属性变化异步一个 bridge 往返 |
| `relations` / `getRelationNodes` | ✅ | parent/child/ancestor/descendant；双向声明校验；`linked` / `unlinked` / `linkChanged` / `linkFailed`；按节点树顺序返回 |
| `externalClasses` | ✅ | 父级 class 可在组件模板内解析，参与样式作用域 |
| `styleIsolation` / `addGlobalClass` | ✅ | `isolated` / `apply-shared` / `shared`；`shared` 组件样式回写 page scope；`:host` 已接入 low-priority CSS；component-as-page 显式 isolation 生效，普通 Page 根固定 shared；内置组件宿主公开、内部私有 |
| `selectComponent` / `selectAllComponents` / `selectOwnerComponent` | ✅ | 页面/组件作用域；ID/class/tag、子代/后代/`>>>`/并集；普通选择器不跨组件边界 |
| `multipleSlots` / `virtualHost` | ✅ | 按 options 映射；`multipleSlots` 默认 false |
| `wx://component-export` / `export` | ✅ | `selectComponent` 返回 `export()` 结果，异常回退实例 |
| `generics` / `placeholder` | ❌ | 编译器能解析，运行时未注册 |
| `definitionFilter` | ❌ | 发 `UNSUPPORTED_BEHAVIOR_FILTER` 诊断 |
| `pureDataPattern` | ❌ | 未映射 |
| `trait behaviors` / chaining API | ❌ | 未支持 |
| Component-as-page 全套语义 | ✅ | query→properties、methods 页面生命周期、behaviors/observers/relations/styleIsolation/selectComponent/getRelationNodes/hasBehavior 已接入；generics/definitionFilter/pureDataPattern 与普通组件同样缺失，moved/页面分享/下拉刷新等全局页面生命周期未实现 |
| `wx://form-field` 等内置 behaviors | ❌ | 发 `UNSUPPORTED_BEHAVIOR` 诊断 |

> 这使 Vant Weapp、TDesign 等组件库的**核心语义障碍**基本移除；剩余限制主要来自 npm 构建（`miniprogram_npm`）、内置 behaviors、`generics` 和 `definitionFilter`。

### 4.6 样式作用域与内置组件边界

Tiny 当前对齐 WebView 渲染模型，采用 Flat DOM + scoped CSS，不使用真实
Shadow DOM：

- `app.wxss` 保持在全局作用域，但每个 compound 都以应用节点的通用 marker
  锚定；class、tag、`*`、id 和裸伪类规则不能通过全局 CSS 穿透页面外节点。
- 页面和自定义组件的 class/tag 由 page/component scope 加 marker class 重写。
  普通 Page 根固定 `shared`；Component-as-page 仅在显式配置时读取
  `styleIsolation`，否则仍为 `shared`。
- `apply-shared` / `shared` 组件额外获得当前 page scope，因此能收到页面规则和
  经 page-scope 模板展开的 app 规则；`isolated` 组件不会获得该 scope。
- 内置组件的 `tiny-*` 宿主是公开样式边界，可用 app/page/component 规则定制。
  其余内部 DOM 由独立的 `tiny-builtin-<tag>` stylesheet scope 保护，外部选择器
  不能直接命中；继承属性、CSS 变量和声明的 `externalClasses` 仍可进入内部。
- `input` / `textarea` 的 `placeholder-class` 通过 `externalClasses` 受控穿透，
  而不是通过取消整个组件的样式隔离实现。

当前仍不等同于浏览器原生 Shadow DOM：宿主 DOM 是扁平树，隔离依赖编译期 marker
和 glass-easel scope 前缀；动态写入且绕过编译器的 CSS 不在保证范围内。

### 4.7 页面形态与宿主

| 能力 | 状态 |
| --- | --- |
| 导航栏（标题/返回/背景色/`navigationStyle: custom`） | ✅ devtool 宿主实现 |
| tabBar（内置、`switchTab`、badge/red-dot、show/hide） | ✅ devtool 宿主实现；自定义 tabBar ❌ |
| 下拉刷新 | ❌ |
| 触底、页面滚动事件 | ✅ devtool 页面帧驱动 |
| 分享菜单/转发/朋友圈 | ❌ |
| 页面转场动画 | ❌ |
| 原生组件（video/map/camera/live-player 等） | ❌ |
| 浏览器宿主 | ✅ |
| 原生/JSCore 宿主 | ❌ |
| iframe sandbox / origin 校验 | ❌ |
| 能力协商（capabilities） | ❌ 基本未使用 |

---

## 5. 实测证据

### 5.1 验收门禁

2026-10-26 本地跑 `pnpm accept:glass-easel`，全部通过：

- 8 个编译器/运行时/宿主目标构建
- **180 个单元测试**（runtime 68 个，host-web-components 30 个）
- 5 段浏览器验收：P0 demo、mini、Taro 3、微信 demo 子集、运行时调试器
- **51 个浏览器步骤**全部通过；P0 覆盖组件语义/样式隔离/button/relations/selectComponent，devtool 覆盖列表/保活/LRU/tabBar/页面栈上限/每页 render 帧，canvas 覆盖 2D/WebGL/legacy/ECharts
- 门禁覆盖的 5 段流程无 console/page error（117 页探针的 pageerror 见 5.2）

这说明现有能力是**真实可运行**的，不是纸面设计。

### 5.2 官方 demo 逐页启动探针

对 `tests/apps/wechat-demo`（117 页，已剔除 Skyline/AR/聊天工具）全量编译，用 headless Chrome 逐页 `?path=` 启动：

| 指标 | 结果 |
| --- | --- |
| 成功挂载 | **108 / 117（92.3%）** |
| 有可见文本 | 104 / 117 |
| 页面级报错/崩溃 | 9 页 |
| console error | 0 |

**探针方法**：

1. `pnpm compile:wechat-demo` 生成产物到 `tests/host/generated`。
2. 启动 `tests/host` Vite 服务。
3. Playwright 打开 `/?path=<page>`，等待 `window.__tinyRuntime`，再等 350ms。
4. 收集 `pageerror`、`console.error`、`window.__tinyRuntime.host.diagnostics`，以及当前 active render iframe `#app` 的子节点/文本（浏览器宿主固定每页一个 render 帧）。
5. 判定：`__tinyRuntime` 出现、`#app` 有子节点、无 pageerror = booted；否则 render-failed。

**结果解读**：

- 92.3% 是“能挂载”，不是“功能对齐”。
- 108 页能启动，很大程度是因为不支持的组件降级成普通 DOM、不支持的 API 返回 `undefined` 且只发 warning、很多调用发生在点击之后。
- 9 页失败集中在 worker、媒体/音频、平台 API、WXS 和 `this.animate`（canvas 2D/WebGL 已修复，明细见附录 A）。
- 2026-10-26 第十三次探针：canvas 2D/WebGL handoff 后从 100/117 提升到 108/117，可见文本 104/117；仍保持 0 console error。

### 5.3 官方 demo API 覆盖

从 `tests/apps/wechat-demo` 源码中提取到 **150 个唯一 `wx.*` 调用**，引擎约支持 **35 个（~23%）**；服务 API 总面 65/502：

```text
getSystemInfo / getSystemInfoSync / getStorageSync / setStorageSync
getStorage / setStorage / removeStorage / clearStorage / getStorageInfo
navigateTo / navigateBack / request / getNetworkType / getBatteryInfo
showToast / showLoading / hideLoading / showModal / showActionSheet
setClipboardData / getClipboardData / vibrateShort / vibrateLong
getSetting / openSetting / login / checkSession / canIUse / nextTick
switchTab / setTabBarStyle / setTabBarItem / setTabBarBadge / showTabBar / hideTabBar
onThemeChange / offThemeChange / hideToast / getFileSystemManager
createAnimation / createCanvasContext / createSelectorQuery
getMenuButtonBoundingClientRect / getPerformance
```

其中 `login` 只是宿主 stub code，`openSetting/authorize` 还没有真实权限模型；`createCanvasContext` 已接 OffscreenCanvas handoff；`createSelectorQuery` 只支持 canvas；`createAnimation` 只映射最终态；`getFileSystemManager` 只有 fail stub。真正“能用”的核心 API 约 18–22 个。

### 5.4 为什么“92.3% 启动”和“44.7% 对齐”不矛盾

| 口径 | 回答的问题 | 结果 |
| --- | --- | --- |
| 启动率 | 页面能不能挂载？ | 92.3% |
| 功能对齐 | 页面上的功能是否按微信语义工作？ | ~44.7% |
| 生产可替换 | 普通业务小程序能否直接上线？ | < 20% |

启动率高，是因为引擎“尽量不崩”；功能对齐仍只有约 44.7%，是因为 API、页面形态和剩余 P1 组件语义仍有大量缺口；canvas 修复和组件结构收口只把高权重短板抬了一部分。

---

## 6. 已经对齐的部分

这些是实打实的能力，不是占位：

### 6.1 WXML 编译器

- `wx:if` / `wx:elif` / `wx:else` / `wx:for` / `wx:for-item` / `wx:for-index` / `wx:key`
- `template` / `import` / `include`、命名模板、递归模板
- `slot` / 作用域插槽、`generic:`、`model:` 双向绑定
- `wxs` / `sjs`、`bind` / `catch` / `capture-bind` / `mut-bind`
- 表达式、注释、HTML 实体、`data-*`、`mark:*`
- 源码 7,241 行，基本是 glass-easel 编译器的完整移植

### 6.2 WXSS 编译器

- `rpx`、`@import`、`@media`、`@supports`、`@keyframes`、`:host`
- class/tag 作用域、source map
- 850 行，行为接近 glass-easel 的 Rust 版 transformer

### 6.3 双线程运行时与 bridge

- service iframe / render iframe（devtool 为每页一帧）/ MessageChannel
- 握手、超时、批处理、JSON-safe 校验
- 结构化诊断：compile / transport / service / render / host
- 跨线程只走版本化消息，不直接读 iframe 全局

### 6.4 框架基本功

- App / Page / Component 注册
- 页面栈、页面 query、`getCurrentPages`、`getApp`
- `setData` 支持 `a.b[0]` 路径
- 事件冒泡/捕获、`dataset`、`target`/`currentTarget`、自定义事件
- 自定义组件 properties/data/methods/lifetimes/pageLifetimes/slots
- `behaviors` / `observers` / `relations` / `externalClasses`
- `styleIsolation` / `addGlobalClass` / `shared`、`selectComponent` / `selectAllComponents` / `selectOwnerComponent`
- Component-as-page：query→properties、`methods` 页面生命周期、behaviors/observers/relations/styleIsolation
- 组件树按 componentId 唯一，detach/page unload 清理；页面 `onReady` 可见初始组件快照
- 子包页面直接启动

### 6.5 真实兼容证据

- Taro 3 React 产物（todo）能跑：`webpackJsonp`、递归模板、外部 WXS、Redux 列表均通过
- 微信官方 demo 子集 108/117 页能挂载，104 页有可见文本
- ECharts 通过 service 离屏 canvas → PNG 帧 → render `drawImage` 跑通
- 内置组件、页面样式、`app.wxss` 作用域在验收中有真实断言
- P0 新增 5 步组件语义验收：Behavior/observer、styleIsolation 矩阵、externalClasses、relations、selectComponent

### 6.6 调试器

- 运行时状态、诊断、元素树
- 测试应用列表 / 3 应用保活 / Navigate / Back / Reload / Close app / `maxPageStack`
- 对“运行时级调试”够用，但不是完整微信开发者工具

---

## 7. 关键缺口与优先级

> 本节是缺口与优先级的唯一清单，不再维护单独的第 10 节“进度清单”勾选表：
> 完成度看第 3 节，变更记录看第 9.4 节，避免同一批状态在多个地方重复且过期。

### P0：不补就跑不了普通业务小程序

| 缺口 | 影响 | 建议 |
| --- | --- | --- |
| `wx.request` / `uploadFile` / `downloadFile` | 无法联网，绝大多数业务小程序不可用 | 先做 request + 拦截器/超时/错误码 |
| 异步 storage + remove/clear/info/batch | 只能同步、刷新即丢 | 持久化到 localStorage/IndexedDB，补全 API |
| `redirectTo` / `reLaunch` | 不能重置/替换页面栈 | 复用 `switchTab` 的页面栈与渲染帧清理逻辑 |
| `showModal` / `showLoading` / `hideLoading` | 常用交互缺失 | 宿主层 UI + API |
| 下拉刷新 | 列表页/feed 页无法下拉刷新 | 页面生命周期 + 宿主手势 |
| `picker` / `textarea` / `form` / `navigator` | 表单与导航高频组件缺失 | 优先补这 4 个 |
| 登录/支付/分享 | 商业化能力缺失 | P0 末或 P1 初 |

### P1：组件与页面语义

**已完成（2026-10-24）**：`behaviors` / `observers` / `relations` / `externalClasses` / `styleIsolation` / `addGlobalClass` / `selectComponent`。剩余：

| 缺口 | 影响 |
| --- | --- |
| 剩余组件语义：`generics` / `placeholder` / `definitionFilter` / `pureDataPattern` | 泛型组件、插件式定义扩展仍不可用 |
| scroll-view/input/swiper/button 属性与事件补全 | 已实现组件“形似神不似” |
| `canvasToTempFilePath` / `wx.createOffscreenCanvas` / node 事件 | selector-query 2D/WebGL 动画、图片与触摸已可用；导出、独立离屏画布与 node 事件仍缺 |
| animation 多 step / 回调 | 复杂动画不可用 |
| 子包按需加载 / 预下载 / 独立分包 | 首屏与包体不可控 |
| npm 构建 / `miniprogram_npm` | 第三方组件库无法安装 |
| 内置组件默认样式对齐 | 视觉不一致 |

### P2：平台能力与生产化

| 缺口 | 影响 |
| --- | --- |
| 原生/JSCore 宿主 | 只能在浏览器里跑 |
| 原生网络桥、媒体、地图、视频、文件、Worker、订阅消息/客服等平台扩展 | 平台能力缺失 |
| 性能基线（启动/首屏/setData/内存/长时运行） | 无法回归 |
| 视觉回归、安全测试、原生测试 | 生产质量不可控 |
| iframe sandbox / origin 校验 / 能力协商 | 部署安全与多宿主适配 |

---

## 8. 补齐路线与预期

以下百分比是按同一权重表的估算，不是承诺：

| 阶段 | 补齐内容 | 预计完整度 |
| --- | --- | --- |
| **P0：能跑常见业务** | redirectTo/reLaunch、下拉刷新、分享、navigator、真实登录/支付；picker/textarea/form 已补 | **~50%** |
| **P1：组件与页面语义** | 剩余组件语义（generics/placeholder/definitionFilter/pureDataPattern）；补全常用组件属性事件；canvas 2D/交互；animation 多 step；子包按需加载、npm 构建 | **~65–70%** |
| **P2：平台能力与生产化** | 原生宿主、网络桥、登录/支付/分享、媒体/地图/视频、文件系统、Worker；性能/视觉/安全基线 | **~80%+** |

**最短路径**：组件语义和第一轮视觉结构已补齐，下一步优先补 redirectTo/reLaunch、下拉刷新/分享、navigator 与真实平台 API；页面 chrome 仍只在 devtool 宿主，测试/生产宿主需要复用同一套实现。继续打磨编译器的收益已经很小。

---

## 9. 维护指南

### 9.1 复测命令

```bash
# 完整门禁（构建 + 单测 + 5 段浏览器验收）
pnpm accept:glass-easel

# 只跑单测
pnpm --filter @tiny/runtime test
pnpm --filter @tiny/cli test

# 编译微信官方 demo 子集
pnpm compile:wechat-demo

# 启动测试宿主（默认 P0 demo；微信 demo 可用 ?path= 指定页面）
pnpm --filter @tiny/cli exec vite --config ../../tests/host/vite.config.ts --port 5174
```

### 9.2 更新本文的步骤

1. **跑门禁**：确认单测/浏览器验收仍通过；记录测试数量与步骤数。
2. **重数组件与组件语义**：对照[微信组件文档](https://developers.weixin.qq.com/miniprogram/dev/component/)与 [tags.ts](../hosts/web-components/src/tags.ts:1)，更新 23/60、分类表、属性/事件表；同时按第 4.5 节更新 behaviors/observers/relations/styleIsolation/selectComponent 状态。
3. **重数 API**：对照[微信 API 索引](https://developers.weixin.qq.com/miniprogram/dev/api/)与 [service.ts](../packages/runtime/src/service.ts:320) + [service-thread.ts](../tests/host/src/service-thread.ts:1) 的 `apiExtensions`，更新 65/502、能力表。
4. **重数生命周期/路由/配置**：对照第 4.3、4.4 节逐项打勾。
5. **重跑 117 页探针**：按 5.2 节方法，更新启动率与失败明细；若后续把探针整理为 `scripts/parity-probe.mjs`，改用该脚本并在此处替换命令。
6. **重算总分**：更新第 3 节表格的完成度/加权分；如果权重调整，在变更记录中说明。
7. **更新变更记录**：日期、变更摘要、新的总分。

### 9.3 探针口径说明

- 探针使用 `tests/apps/wechat-demo` 的 117 个页面（app.json 的 `pages` + 两个 subpackage）。
- “booted”只代表 `window.__tinyRuntime` 出现、render `#app` 有子节点、无 pageerror；不代表页面功能正确。
- 不支持的组件/API 的 warning 不计入失败；这也是启动率偏高的原因。
- 如果后续补了原生组件/网络能力，探针应增加“关键页面交互”断言，而不是只看启动。

### 9.4 口径变更记录

| 日期 | 变更 | 完整度 |
| --- | --- | --- |
| 2026-10-24 | 初始快照：WebView 基准、117 页探针、加权评分 | **31.3%** |
| 2026-10-24 | 第二次同步：补齐自定义组件高级语义（behaviors/observers/relations/externalClasses/styleIsolation/selectComponent）；框架 42→58、样式 62→68；115 单测 + 45 浏览器步骤 | **34.77%** |
| 2026-10-24 | 第三次同步：Component-as-page 核心语义接入（query properties、methods 生命周期、behaviors/observers/relations/styleIsolation）；框架 58→60；116 单测 | **35.13%** |
| 2026-10-24 | 第四次同步：button 对齐 2.7.0 核心属性/默认样式，内置共享 wx-base/wx-hover/wx-label-target；内置组件 30→32；120 单测 / 46 步 | **35.47%** |
| 2026-10-24 | 第五次同步：内置组件属性/默认样式与事件面成批对齐（canvas 触摸/longtap、input 组合/选区、button open-type 失败回调、scroll-view refresher/drag/scroll 边界）；属性 119/146、事件 44/46 | **36.18%** |
| 2026-10-25 | 第六次校准：重新跑完整门禁；148 单测（runtime 56） / 46 浏览器步骤；修正文档中的事件覆盖与测试计数 | **36.18%** |
| 2026-10-25 | 第七次同步：补齐 request、异步 storage、网络/电池/剪贴板/震动、modal/loading/actionSheet、login stub、share menu、canIUse/nextTick；API 8%；150 单测 | **36.58%** |
| 2026-10-25 | 第八次同步：新增 textarea/form/picker 三个常用内置标签（form 收集、picker selector/date/time、textarea 事件）；内置组件 36→38；151 单测 | **36.92%** |
| 2026-10-25 | 第九次同步：补主题/键盘监听、getUserProfile/getUserInfo、tabBar/导航栏/pageScrollTo、hideToast、getFileSystemManager 等高频 API 面；API 8→12%；151 单测 | **37.72%** |
| 2026-10-25 | 第十次同步：新增 picker-view / picker-view-column（滚动列、columnchange、value 数组）；格式化 WXML 模板；内置组件 38→39；152 单测 | **37.89%** |
| 2026-10-25 | 审计与方案：新增 [内置组件参考差异与修复方案（归档）](./component-reference-history.md)，逐项对照微信 2.7.0 的结构/逻辑/CSS，并给出目标模板/CSS/TS 改造与验收清单 | **37.89%** |
| 2026-10-25 | 修复：virtualHost 内置组件丢失 `data-*` 属性；WeChat demo 的 `[data-weui-theme]` 重新生效，深色系统下恢复浅色主题变量；新增 dark color-scheme 验收 | **37.89%** |
| 2026-10-25 | 文档维护：移除重复且长期未同步的“进度清单”章节；缺口统一看第 7 节，变更看第 9.4 节 | **37.89%** |
| 2026-10-25 | 宿主迁移：23 个内置组件从 `virtualHost` + 内层根迁移为真实 `tiny-*` 宿主；`class`/`style`/`id`/`data-*`/`hidden` 与属性反射落到宿主，根级 `.tiny-*` 样式上移；新增宿主事件监听与 group 子项回传；P0 + mini 浏览器验收保持通过 | **37.89%** |
| 2026-10-25 | 视觉结构重写：checkbox/radio 改为 22×22 自定义控件，switch 改为 52×32 轨道+滑块，slider 改为自定义 track/thumb + 透明 range 交互层；保留视觉隐藏原生 input 与既有属性/事件/表单语义；新增尺寸/结构浏览器断言 | **37.89%** |
| 2026-10-25 | 全局标签选择器映射：`app.wxss` 的 `view`/`button`/`input`/`canvas` 等 tag 规则编译为 `tiny-*` 宿主选择器；scoped 页面/组件继续使用 marker class；修复后代选择器中的 tag 未 scoped 的问题 | **37.89%** |
| 2026-10-25 | icon 对齐 WeUI 字体实现：内嵌 `@font-face`、15 种 type 的 `::before` 字形与参考颜色表；`i` 宿主内渲染并支持 `size`/`color`/`aria`；补浏览器 fontFamily/伪元素断言 | **37.89%** |
| 2026-10-25 | image 对齐参考结构：`div` 背景图 + 隐藏 probe `<img>` + fallback slot，补 320×240/inline-block、各 mode 的 background-size/position、widthFix/heightFix 比例计算与 load/error 宽高 | **37.89%** |
| 2026-10-25 | picker-view / picker-view-column 对齐参考结构：mask/indicator 下放到 column，`translateY` 吸附滚动、点击定位、value 同步、columnchange/pickstart/pickend；内置模板内部统一改用原生 `div`/`span` | **37.89%** |
| 2026-10-25 | picker 采用参考 wrapper + slot 结构，原生 select/date/time 改为透明覆盖层；slot 当前值恢复展示，change/disabled 语义保持 | **37.89%** |
| 2026-10-25 | picker 自绘浮层：wrapper + slot + toolbar + picker-view 列，支持 selector/multiSelector/date/time 的 cancel/confirm/columnchange；region 仍缺 | **37.89%** |
| 2026-10-25 | picker-view-column 补 pointer 鼠标拖动（与 touch 共用吸附逻辑）；修正 content 居中方式，避免百分比 padding 按宽度计算 | **37.89%** |
| 2026-10-26 | devtool 页面栈改为每页独立 render iframe（隐藏页保留 DOM/滚动位置，返回不再重建）；补 `onPageScroll`/`onReachBottom`/`onResize` 与 Lifecycle 时间线；页面生命周期 5→8/14；运行时测试 62 条，完整浏览器门禁通过（总分未重算） | **37.89%** |
| 2026-10-26 | 内置 tabBar：app.json 配置解析、tab 页缓存、`switchTab`、`onTabItemTap`、badge/red-dot/show/hide/style/item API；devtool 渲染 tabBar 并按可用高度调整页面帧；页面生命周期 8→9/14、路由 2→3/5；mini 验收新增 tab 切换 | **37.89%** |
| 2026-10-26 | Devtool 多应用工作台：默认测试应用列表、点击启动、最近 3 个应用保活/LRU、圆圈回列表、每个应用独立线程组；runtime 页面栈默认上限 10，宿主可通过 `maxPageStack` 配置；168 单测 + 48 步浏览器验收 | **41.91%** |
| 2026-10-26 | `app.wxss` 类选择器生效：页面组件增加全局 extra style scope，页面元素同时保留无前缀类名，全局 `.container` 等规则不再失效；编译输出 page-scope 模板，render 线程按页面 scope 展开并按 app → 页面 → 组件顺序注册，`apply-shared`/`shared` 组件内部也能收到全局 app class，`isolated` 不受影响；P0 验收新增全局 class 颜色断言 | **41.91%** |
| 2026-10-27 | 样式边界收口：app 全局规则按应用 marker 锚定，page-scope 模板同步保护 `*`/tag/id/裸伪类；内置组件拆分公开 host 样式与独立 `tiny-builtin-<tag>` 私有样式，降低 app/page/component 规则对内部 DOM 的穿透；`placeholder-class` 改为 external class；P0 增加全局泄漏与受控穿透断言，总分暂未重算 | **44.67%** |

---

## 附录 A：117 页失败明细

| 页面 | 诊断码 | 报错 |
| --- | --- | --- |
| `packageComponent/pages/view/scroll-view/scroll-view` | BOOTSTRAP_ERROR | `this.animate is not a function` |
| `packageComponent/pages/open/ad/ad` | BOOTSTRAP_ERROR | `Cannot read properties of undefined (reading 'expt_args_2')` |
| `packageAPI/pages/page/intersection-observer/intersection-observer` | BOOTSTRAP_ERROR | `Cannot read properties of undefined (reading 'relativeTo')` |
| `packageAPI/pages/device/bluetooth/bluetooth` | RENDER_BOOTSTRAP_ERROR | `D is not a function` |
| `packageAPI/pages/media/voice/voice` | BOOTSTRAP_ERROR | `Cannot read properties of undefined (reading 'onStart')` |
| `packageAPI/pages/media/background-audio/background-audio` | BOOTSTRAP_ERROR | `Cannot read properties of undefined (reading 'onPlay')` |
| `packageAPI/pages/storage/get-background-prefetch-data/get-background-prefetch-data` | BOOTSTRAP_ERROR | `Cannot destructure property 'fetchedData' of 'res' as it is undefined.` |
| `packageAPI/pages/framework/wxs/movable` | RENDER_BOOTSTRAP_ERROR | `lastTop is not defined` |
| `packageAPI/pages/framework/wxs/sidebar` | RENDER_BOOTSTRAP_ERROR | `startmark is not defined` |

失败类别汇总：

| 类别 | 页数 | 缺失能力 |
| --- | ---: | --- |
| 平台 API | 4 | 广告 expt、IntersectionObserver、蓝牙、后台预取 |
| 媒体/音频 | 2 | 音频上下文 onStart/onPlay |
| WXS | 2 | WXS 作用域/全局变量语义 |
| 组件方法 | 1 | `this.animate` |

---

## 附录 B：WebView 组件清单（60）

| 分类 | 组件（✅ 已实现 / ❌ 未实现） |
| --- | --- |
| 视图容器（11） | ✅ view、scroll-view、swiper、swiper-item；❌ movable-area、movable-view、cover-view、cover-image、match-media、page-container、root-portal |
| 基础内容（5） | ✅ icon、text、progress；❌ rich-text、selection |
| 表单（17） | ✅ button、checkbox、checkbox-group、radio、radio-group、slider、switch、input、label、picker、picker-view、picker-view-column、form、textarea；❌ editor、editor-portal、keyboard-accessory |
| 导航（2） | ❌ navigator、functional-page-navigator |
| 媒体（9） | ✅ image；❌ audio、video、camera、live-player、live-pusher、voip-room、channel-live、channel-video |
| 地图（1） | ❌ map |
| 画布（1） | ✅ canvas（部分） |
| 开放能力（11） | ❌ web-view、ad、ad-custom、official-account、official-account-publish、open-data、reward、store-coupon、store-gift、store-home、store-product |
| 无障碍（1） | ❌ aria-component |
| 导航栏（1） | ❌ navigation-bar |
| 页面属性（1） | ❌ page-meta |

> 统计口径：WebView 文档中除 Skyline 专属、XR-FRAME 与 `native-component` 说明页之外的组件。`canvas` 计入已实现；selector-query 2D node 与 legacy CanvasContext 都通过 OffscreenCanvas handoff 使用真实同步 context。RAF、createImage 与 WebGL 已接，导出 API 仍不完整。

---

## 附录 C：关键代码索引

| 主题 | 位置 |
| --- | --- |
| 内置组件标签清单 | [tags.ts](../hosts/web-components/src/tags.ts:1) |
| 内置组件默认样式 | [styles/index.css](../hosts/web-components/src/styles/index.css:1) |
| service API 宿主 | [service/api-host.ts](../packages/runtime/src/service/api-host.ts:1) |
| 不支持 API 的降级 | [service/api-host.ts](../packages/runtime/src/service/api-host.ts:1) |
| 宿主 API（toast/storage/navigate） | [host-api.ts](../packages/runtime/src/host-api.ts:1)、[browser api-handlers.ts](../hosts/browser/src/api-handlers.ts:1) |
| 组件 schema（data/properties/using + semantics metadata） | [component-schema.ts](../packages/runtime/src/component-schema.ts:5) |
| Behavior 合并 / 组件定义规范化 | [component-definition.ts](../packages/runtime/src/component-definition.ts:115) |
| 组件树与选择器 | [component-tree.ts](../packages/runtime/src/component-tree.ts:35) |
| observers 匹配与调用 | [observers.ts](../packages/runtime/src/observers.ts:13) |
| relations 链接管理 | [relation-manager.ts](../packages/runtime/src/relation-manager.ts:29) |
| 组件注册（properties/externalClasses/options/observers/lifetimes） | [glass-easel-adapter.ts](../packages/runtime/src/glass-easel-adapter.ts:463) |
| 组件语义验收 fixture | [semantics.js](../tests/apps/demo/pages/semantics/semantics.js:1) |
| Component-as-page 实例 | [service/page-instance.ts](../packages/runtime/src/service/page-instance.ts:1) |
| Component-as-page 测试 | [component-page.test.ts](../packages/runtime/tests/component-page.test.ts:1) |
| 内置组件共享 behaviors | [behaviors.ts](../hosts/web-components/src/behaviors.ts:1) |
| button 组件 | [button/index.ts](../hosts/web-components/src/components/button/index.ts:1) |
| 页面/子包/app.json 解析 | [compile.ts](../tools/cli/src/compile.ts:165) |
| 单/多 render 帧宿主 | [standalone-host.ts](../hosts/browser/src/standalone-host.ts:1) |
| 页面滚动生命周期桥 | [page-lifecycle.ts](../hosts/browser/src/page-lifecycle.ts:1) |
| tabBar 配置与页面栈 | [service.ts](../packages/runtime/src/service.ts:1) |
| tabBar 宿主 UI | [HostTabBar.jsx](../apps/devtool/src/next/components/HostTabBar.jsx:1) |
| tabBar 验收 | [glass-easel-browser.mjs](../scripts/glass-easel-browser.mjs:1120) |
| 页面栈上限（默认 10，宿主可配） | [service.ts](../packages/runtime/src/service.ts:1) |
| Devtool 应用列表 / 3 应用保活 | [runtimePanel.jsx](../apps/devtool/src/next/runtimePanel.jsx:1) |
| 多 iframe 页面栈验收 | [glass-easel-browser.mjs](../scripts/glass-easel-browser.mjs:941) |
| 官方 demo 子集 | [app.json](../tests/apps/wechat-demo/app.json:1) |

| 2026-10-26 | 第十一次校准：按当前 HEAD 重数——23/60 标签、65/502 API、9/14 页面生命周期、3/5 路由、167 单测；P0 组件视觉重写完成，页面形态按 devtool 宿主保守计 25%；总分 37.89→41.91 | **41.91%** |

| 2026-10-26 | 第十二次校准：P1 组件收口（input/textarea wrapper、button native/longtap、form-field/reportSubmit、swiper 绝对布局、scroll-view 三层、progress ARIA/动画）、app.wxss class 规则作用域修复；180 单测 / 47 步；总分 41.91→44.23 | **44.23%** |
| 2026-10-26 | Devtool 移动端设备识别：手机/平板浏览器显示“请在电脑端访问”提示页，不加载 launcher/runtime；桌面端行为不变；`?desktop=1` 保留显式绕过；devtool 验收新增移动端 UA 步骤，总步数 48 | **44.23%** |

| 2026-10-26 | 第十三次校准：canvas 2D/WebGL 通过 OffscreenCanvas handoff 接入真实同步 context；117 页探针 100→108 启动、104 可见、9 失败；51 步浏览器验收；总分 44.23→44.67 | **44.67%** |
