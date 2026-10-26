# 内置组件与微信 2.7.0 对齐状态

> 参考实现：`~/Downloads/微信小程序.js`、`微信小程序.css`（微信 WebView，`__libVersionInfo__ = 2.7.0`）
>
> 对照实现：[hosts/web-components/src/components](../hosts/web-components/src/components)
>
> 范围：当前已接入的 23 个内置标签；剩余 37 个标签不在本文逐项展开。
>
> 历史差异审计、逐组件参考结构和修复方案已归档到 [component-reference-history.md](./component-reference-history.md)。
>
> 更新时间：2026-10-26
>
> 优先级：**P0** 结构或默认外观明显不一致；**P1** 能用但结构和交互仍是近似；**P2** 结构差异为主、视觉影响较小。

## 目录

- [1. 当前整体结论](#1-当前整体结论)
- [2. 存在过的问题总清单](#2-存在过的问题总清单)
- [3. 已解决项](#3-已解决项x-汇总)
- [4. 剩余问题详细](#4-剩余问题详细)
- [5. 历史处理记录](#5-历史处理记录)
- [6. 验收情况](#6-验收情况)

## 1. 当前整体结论

23 个内置标签的**宿主结构和 P0 默认视觉已经完成一轮重写**，当前没有 P0 级“结构或默认外观明显不一致”的标签。剩余问题集中在三类：

1. **交互语义**：`wx-touchtrack`/`wx-scroller` 的等价逻辑、group 受控值、label 激活、picker 的 region 模式；
2. **P1 组件的内部结构**：`input`、`textarea`、`scroll-view`、`swiper`、`form`、`button` 仍是“能用但近似”；
3. **P2 细节**：`canvas`、`progress`、`swiper-item` 等结构差异，以及部分 longpress/lazy/事件名差异。

| 维度 | 状态 | 说明 |
| --- | --- | --- |
| 宿主模型 | ✅ 完成 | 23 个组件全部使用 `virtualHost: false` + `tiny-*` 真宿主 |
| P0 视觉结构 | ✅ 完成 | checkbox/radio/switch/slider/icon/image/picker/picker-view/column |
| 基础样式/属性转发 | ✅ 完成 | class/style/id/data-*/hidden 直接落在宿主 |
| 交互语义 | ⚠️ 部分 | 触摸/滚动/group/label 仍是近似 |
| P1 组件内部结构 | ⚠️ 部分 | input/textarea/scroll-view/swiper/form/button |
| 表单/受控能力 | ⚠️ 部分 | group value、自定义 form-field、reportSubmit |
| 全项目能力对齐分 | 41.91% | 来自 [wechat-webview-parity.md](./wechat-webview-parity.md)，是整体能力分，不是组件单项分 |

一句话：**结构层已经基本对齐，主要差距在交互模型、P1 组件内部结构和表单语义。**

## 2. 存在过的问题总清单

`[x]` 已解决，`[ ]` 仍未解决。剩余项的详细说明见第 4 节。

### 2.1 全局、宿主与样式

- [x] `virtualHost: true` + 内层根导致宿主不可选、`class`/`style`/`id`/`data-*` 需要逐项转发；
- [x] 内置组件宿主标签从占位元素迁移为 `tiny-*` 真宿主，并使用 `reflectToAttributes` 反射属性；
- [x] `hidden` 在 23 个宿主上的默认样式重置；
- [x] `class`/`style`/`id`/`data-*`/`hidden` 直接落在宿主，删除 `externalClasses`/`style` 属性和 `scheduleDataAttributeSync` 等 shim；
- [x] 参考 CSS 的 `wx-*` 宿主选择器机械替换为 `tiny-*`；
- [x] 全局 `app.wxss` 的 tag 选择器在编译时映射到宿主（`button {}` → `tiny-button {}`）；
- [x] 后代选择器后的 tag 边界识别（曾导致 ECharts `image` 样式未被重写）；
- [x] 内置模板内部容器从 `<view>`/`<text>` 改为原生 `<div>`/`<span>`，避免 inline 默认值导致零尺寸（曾导致 ECharts 缩略图空白）；
- [x] 宿主事件监听统一走 `bindHostListeners`/`addListener`，对应参考的 `listeners: { "this.tap": ... }`；
- [x] 纯宿主标签（`view`/`button`/`checkbox-group`/`radio-group`/`swiper-item`）收敛为 slot-only；
- [ ] behaviors 等价替换仍不完整：`wx-touchtrack`、`wx-scroller`、`wx-group` 的完整语义尚未逐项复刻。

### 2.2 组件结构与默认外观

**checkbox / radio**

- [x] 从原生控件改为 `label` + 隐藏原生 input + 自定义视觉 span；
- [x] 22×22、边框/圆角/选中色/禁用态对齐参考；
- [x] `checkbox-group` / `radio-group` 的受控 `value`：初始值、外部更新和子项回写已打通；
- [ ] 与参考 `wx-touchtrack`/aria 的精确 tap 判定尚未完全对齐（基础点击走原生 label/input）。

**switch**

- [x] 52×32、圆形滑块、选中色 `#04BE02`；
- [x] `type="checkbox"` 渲染独立 checkbox 视觉分支，原生 input 继续承担表单语义；
- [x] 原生 checkbox input 作为表单/无障碍兜底。

**slider**

- [x] 2px 轨道、28px 滑块、选中/背景/禁用色、step/数值显示；
- [ ] 透明原生 range 交互层与参考 `wx-touchtrack` 的拖动/点击语义仍有差异。

**image**

- [x] `div` 背景图 + 隐藏 probe `<img>` + fallback slot；
- [x] 320×240、`inline-block`、`scaleToFill`/`aspectFit`/`aspectFill`/方位模式；
- [x] `widthFix`/`heightFix` 按 naturalWidth/naturalHeight 计算另一条边；
- [x] `showMenuByLongpress` 用浏览器 contextmenu 门控近似；
- [x] `backgroundSize`/`backgroundPosition`/`backgroundRepeat` 可覆盖 mode 派生值；
- [x] `lazyLoad` 使用 IntersectionObserver 控制 probe 挂载；仍保留原生 `loading="lazy"`。

**icon**

- [x] 改为 `<i>` + 内嵌 WeUI 字体 + `::before`，15 种 type 和参考颜色表；
- [x] `size`/`color`/`aria-label` 对齐；
- [x] 参考 icon 本身没有 longpress 事件，不需要补；
- [ ] `type` 默认值保留 `success`（参考 JS 未声明，官方文档默认 `success`，需要按版本确认）。

**picker**

- [x] wrapper + slot 结构，slot 显示当前值；
- [x] 自绘浮层：遮罩、取消/标题/确定、`picker-view` 列；
- [x] `selector`/`multiSelector`/`date`/`time` 的 `range`/`rangeKey`/`start`/`end`/`fields`；
- [x] `columnchange`/`change`/`cancel`/`disabled`；
- [ ] `region` 模式未实现，点击不打开；
- [ ] `customItem` 未渲染，`headerText` 只作为标题；
- [ ] 参考通过原生 `showPickerView` 桥弹出系统面板，我们仍用 DOM 浮层近似。

**picker-view / picker-view-column**

- [x] `picker-view` 只保留 flex wrapper + slot；
- [x] mask/indicator 下放到 column，结构为 `group > mask + indicator + content > slot`；
- [x] `translateY` + `transition` 吸附滚动，触摸和 pointer 鼠标拖动共用逻辑；
- [x] `indicator-style` 高度解析、item 高度/遮罩/居中位置跟随；
- [x] 初始 `value` 同步、越界 clamp、`columnchange`/`pickstart`/`pickend`；
- [x] 已补基于拖动速度的惯性 + 越界阻力回弹；
- [x] 兼容触发 `wxPickerColumnChanged`/`wxPickerColumnValueChanged`/`wxPickerColumnValueChangeStart/End`。

**button**

- [x] 基础尺寸/颜色/圆角/loading/plain/mini/`:after` 边框；
- [x] form submit/reset、hover、label 激活入口；
- [ ] 没有 `native` 的 cover-view 分支；
- [ ] `open-type` 仍走失败回调，不是真实能力；
- [x] `longtap`/`canceltap` 通过 touch 定时器补上，并抑制长按后的 tap。

**input / textarea**

- [x] input 键盘输入（`catchkeydown` 导致 `preventDefault`，字符无法插入）已修复；
- [x] input 的 wrapper/placeholder 层已补；原生 placeholder 保留用于查询和无障碍；
- [x] input 的 `focus`/`autoFocus`/`cursor`/`selectionStart`/`selectionEnd` 已映射到原生 input；
- [ ] input 的镜像 div/下拉候选/`dropdownStyle` 仍未实现；
- [x] textarea 的 wrapper/placeholder/scrollHeight autoHeight 已补；
- [x] textarea 的 focus/autoFocus/cursor/selection 已映射到原生控件；
- [ ] textarea 的 `fixed`/`showConfirmBar`/`disableDefaultPadding` 和 placeholderClass 前缀仍未实现。

**scroll-view / swiper**

- [x] scroll-view 已改为 wrap/main/content 三层，滚动发生在外层 main，backend 指向 main；
- [x] scroll-view 的 `scroll` 事件已按 `throttle` 做 50ms 节流；
- [x] `scroll-into-view` 增加目标延迟重试，滚动结果更稳定；
- [x] `showScrollbar`/`bounces`/`pagingEnabled`/`scrollAnchoring`/`enableFlex` 映射到 CSS 状态类；
- [ ] `wx-touchtrack`/`wx-scroller` 的完整状态和回收策略仍是近似；
- [x] swiper 已补 `wrapper > slides > slide-frame` 结构；track 仍是 flex，参考是绝对定位 + transform；
- [x] swiper 指示点默认已对齐：8×8、bottom 10、gap 8、`rgba(0,0,0,.3)`/`#000`；
- [x] `currentItemId` 可定位到对应 item；
- [x] `displayMultipleItems` 的 track 步长和 `skipHiddenItemLayout` 的可见项计数已补；
- [ ] `previousMargin`/`nextMargin` 的精确布局和 swiper-item relation 未完整实现。

**form / 分组**

- [x] form 已补参考的 `span#wrapper`；
- [x] 自定义组件 `wx://form-field` 已接入 form 收集（内部 `tiny-form-field` marker behavior）；
- [x] `reportSubmit` 已补 `beforereportsubmit` + mock formId；真实上报仍依赖宿主能力；
- [x] `label` 改为 slot-only 宿主 + host tap，`for`/包裹激活走 label-target，不再依赖原生 double activation。

### 2.3 P2 细节

- [x] `view`：真宿主 + slot，class/style/id/data-*/hidden 均可用；
- [x] `text`：`display:inline`、`selectable` 基础语义；
- [x] `label`：slot-only 宿主 + host tap，`for`/包裹激活走 label-target；
- [x] `canvas` 默认尺寸 300×150 + 容器/绝对定位层已补；实际渲染仍是离屏镜像；
- [x] `progress` 结构已改为参考的 `bar > inner-bar`；
- [x] `progress` 的 `active` 逐帧动画已补，`activeend` 带 `curPercent`；
- [ ] `swiper-item`：参考依赖 `wx-swiper` relation 和 slide-frame 布局；我们只是普通 slot 容器。


### 2.4 历史回归问题（已修复，保留记录）

- [x] ECharts 图片样式丢失：后代选择器后的 tag 未被重写；
- [x] ECharts 缩略图空白：内部 `<view>` 默认 inline，背景层 0×0；
- [x] input 无法键入：`catchkeydown` 使原生 keydown 被 `preventDefault`；
- [x] picker-view 内容偏移：百分比 padding 按宽度计算，改为 `top:50% + margin-top`；
- [x] picker-view 初始 value 不生效：列数量在首次渲染时不足，补延迟重算/refresh；
- [x] devtool 验收依赖默认 app：改为显式 `?app=demo`。

## 3. 已解决项（[x] 汇总）

- **宿主/样式**：23 个 `tiny-*` 真宿主、属性反射、hidden reset、全局 tag 映射、scoped tag 重写、内部 `div`/`span`。
- **P0 视觉**：checkbox、radio、switch、slider、icon、image、picker、picker-view、picker-view-column 共 9 个标签完成结构/默认外观重写。
- **picker 交互**：selector/multiSelector/date/time 的浮层、确认/取消/columnchange、列值同步。
- **picker-view 交互**：mask/indicator/content、transform 吸附、tap 定位、触摸/鼠标拖动、pickstart/pickend。
- **表单/语义**：group 受控 value、switch type=checkbox、label-target、form-field、reportSubmit mock、form wrapper。
- **输入/滚动**：input/textarea wrapper + placeholder 层、textarea autoHeight、scroll-view 三层、progress bar/inner-bar、canvas 300×150、swiper 默认指示点。
- **回归修复**：input 键盘输入、label 双触发、ECharts 图片样式/空白、picker-view 居中/初始值、devtool 验收 app 固定。
- **P2 补强**：button longtap/canceltap、canvas 容器层、swiper wrapper/slides/frame、progress bar/inner-bar。

对应实现集中在 [hosts/web-components/src/components](../hosts/web-components/src/components)，单测在 [hosts/web-components/tests/builtin-components.test.ts](../hosts/web-components/tests/builtin-components.test.ts)。

## 4. 剩余问题详细

### 4.1 input 的剩余交互

wrapper 和 placeholder 层已补，原生 placeholder 仍保留用于查询/无障碍。仍缺：

- `dropdownStyle` 和下拉候选结构；
- 密码/占位 `showValue` 镜像同步；
- `placeholderClass` 的参考前缀处理；
- `adjustPosition`/`holdKeyboard` 的键盘行为。

`focus`/`autoFocus`/`cursor`/`selectionStart`/`selectionEnd` 已映射到原生 input。

键盘输入本身已在 [input/template.wxml](../hosts/web-components/src/components/input/template.wxml) 修复，不再使用 `catchkeydown`。

### 4.2 textarea 的剩余属性

wrapper/placeholder 层和 `scrollHeight` autoHeight 已补。仍缺：

- `fixed`、`showConfirmBar`、`disableDefaultPadding` 的视觉/键盘行为；
- `placeholderClass` 的参考前缀处理；
- 参考 `compute`/`stylecompute` 层的完整镜像语义。

`focus`/`autoFocus`/`cursor`/`selectionStart`/`selectionEnd` 已映射到原生 textarea。

### 4.3 scroll-view 的滚动模型

三层结构和 `backend` 指向 main 已完成。仍缺：

- `wx-touchtrack`/`wx-scroller` 的完整滚动状态；
- `scroll` 事件已做 50ms 节流，`scroll-into-view` 带重试，`showScrollbar`/`bounces`/`pagingEnabled`/`scrollAnchoring`/`enableFlex` 已映射到 CSS；
- 当前 refresher 是自定义扩展，参考 2.7.0 没有同套属性/事件；
- 列表回收/长列表性能策略未实现。

### 4.4 swiper 的布局与剩余属性

wrapper/slides/slide-frame 层级和指示点默认值已补（8×8/bottom 10/gap 8/`rgba(0,0,0,.3)`/`#000`）。仍缺：

- slide-frame 仍用 flex track，参考是绝对定位 + transform；
- `previousMargin`/`nextMargin` 的精确布局；
- swiper-item 与 swiper 的 relation。

### 4.5 button 的 native/open-type

- 没有 `native` 的 cover-view 分支；
- `open-type` 只触发失败回调，不是真实能力；
- `longtap`/`canceltap` 已补，剩余是原生能力分支。

### 4.6 picker 的剩余模式

- `region` 未实现；
- `customItem` 未渲染；
- 参考用原生 `showPickerView` 桥，当前是 DOM 浮层，滚动惯性和系统面板细节不同；
- `headerText` 当前只作为标题。

### 4.7 image contextmenu/lazy 与 icon 默认值

- image `showMenuByLongpress` 已用浏览器 contextmenu 门控近似，仍不是微信系统菜单；
- image `lazyLoad` 已用 IntersectionObserver 控制 probe 挂载，并保留原生 `loading="lazy"` 作为双保险；
- icon `type` 默认值与参考 2.7.0 的声明方式有版本差异。

### 4.8 P2 结构

- `canvas`：默认尺寸/容器层已补，实际渲染仍是离屏镜像；
- `progress`：`bar > inner-bar` 结构、默认色和 `active` 逐帧动画已对齐；
- `swiper-item`：参考依赖 swiper relation 和 slide-frame；当前普通 slot 容器。

### 4.9 behaviors / 事件语义

- `wx-touchtrack`：各组件零散 touch/pointer 事件，没有统一 tap 判定、捕获和取消语义；
- checkbox/radio 的精确 tap/aria 仍依赖原生 label/input，没有复刻参考的 touchtrack/aria 组合；
- `wx-scroller`：scroll-view 已做 scroll 节流、picker-view 已做简单惯性，但 swiper/scroll 的统一滚动状态模型仍缺；
- picker-view：已补速度惯性、越界阻力回弹和参考内部事件名兼容。

## 5. 历史处理记录

历史差异审计、逐组件参考结构、修复方案和已落地过程已单独归档：

- [component-reference-history.md](./component-reference-history.md)

主文档只保留当前状态、问题清单和验收结果，避免历史方案和当前结论混在一起。

## 6. 验收情况

### 6.1 门禁

2026-10-26 执行：

```text
pnpm accept:glass-easel   # exit 0
pnpm lint                # 8 files checked, no fixes applied
```

门禁包含：build、runtime purity、各包单测、P0 demo、mini、Taro 3、WeChat demo、devtool 五段浏览器流程。

### 6.2 单测

| 包 | 数量 |
| --- | ---: |
| `@tiny/bridge` | 10 |
| `@tiny/template-compiler` | 30 |
| `@tiny/stylesheet-compiler` | 29 |
| `@tiny/cli` | 12 |
| `@tiny/host-web-components` | 30 |
| `@tiny/runtime` | 65 |
| **合计** | **176** |

### 6.3 浏览器验收

| 阶段 | 结果 | 覆盖 |
| --- | --- | --- |
| P0 demo | ✅ | 宿主/样式、checkbox/slider/switch、input 逐字符输入、表单、canvas diagnostics |
| mini | ✅ | 页面渲染、import/include、组件输入、ECharts、子包 |
| Taro 3 | ✅ | 列表、输入、过滤、清理 |
| WeChat demo | ✅ | 组件示例页、API 示例页、无 console error |
| devtool | ✅ | launcher、按应用启动、状态投影、页面栈、3 应用 LRU、reload/close/deep link |

### 6.4 覆盖不到的部分

自动化门禁**没有逐页覆盖全部 23 个组件**，以下主要依赖单测/手工验证，后续补浏览器用例时优先补：

- picker 浮层的 selector/multiSelector/date/time；
- picker-view 的拖动/吸附/初始 value；
- form-field/reportSubmit 在真实多线程宿主中的完整链路；
- button native/open-type；
- swiper 绝对定位布局、margin 细节、picker-view 越界回弹。

### 6.5 全项目分数

`41.91%` 来自 [wechat-webview-parity.md](./wechat-webview-parity.md) 的整体能力校准（23/60 标签、65/502 API、页面生命周期 9/14、路由 3/5 等），**不是**本文 23 个组件的单项得分；组件结构对齐不应直接等同于总分提升。
