# 内置组件差异审计与处理历史（归档）

> 归档时间：2026-10-26
>
> 本文件保留 2026-10-25/26 的差异审计、逐组件参考结构、修复方案和历史状态，**不再作为当前状态来源**。
>
> 当前结论、问题清单、剩余问题和验收结果见 [component-reference-diff.md](./component-reference-diff.md)。
>
> 原始标题：内置组件与微信 2.7.0 参考实现差异与修复方案

> 参考实现：`～/Downloads/微信小程序.js`、`微信小程序.css`（微信 WebView 版，`__libVersionInfo__ = 2.7.0`）
>
> 对照实现：`hosts/web-components/src/components/*`
>
> 范围：当前已接入的 23 个内置标签；剩余 37 个标签不在本文逐项展开。
>
> 以下内容为历史归档：第 1–5 节是当时的差异审计，第 6–7 节是当时的修复方案与验收清单。

## 0. 结论

当前 23 个内置标签里，P0 视觉结构已经重写完成，剩余差异集中到交互语义和 P1 组件：

- **P0：结构或默认外观明显不一致**：无（`picker` 仅剩 `region` 模式未实现）
- **已重写视觉结构**：`checkbox`、`radio`、`switch`、`slider`、`icon`、`image`、`picker`、`picker-view`、`picker-view-column`（2026-10-25，见 2.1–2.7）
- **P1：能用但结构/交互仍是近似**：`input`、`textarea`、`scroll-view`、`swiper`、`form`、`button`；另有 `checkbox-group`/`radio-group` 受控 `value`、`switch` 的 `type="checkbox"`、`label-target` 分发
- **P2：主要是细节差异**：`text`、`label`、`canvas`、`progress`、`swiper-item`、`view` 的宿主命名/边界

最大的问题不是“少了几条 CSS”，而是：

1. **参考组件用自定义 div 拼视觉，我们用浏览器原生控件**
2. **参考组件的宿主就是可样式化元素，我们此前普遍是 `virtualHost + 内层 view`**（2026-10-25 已迁移为 `tiny-*` 真宿主，见 1.1）
3. **参考组件的很多逻辑在 behaviors 里（`wx-touchtrack`、`wx-scroller`、`wx-group`、`wx-disabled`），我们用原生事件 + 简化状态**
4. **参考 CSS 的默认尺寸/颜色/内部类名没有完整迁移**

## 1. 共性问题

### 1.1 宿主结构：从 `virtualHost + 内层根` 迁移到 `tiny-*` 真宿主

参考实现的 `wx-view` 模板只有一个 `<slot>`，组件宿主本身就是真实元素：

```text
<wx-view class="page" data-weui-theme="light">
  ...slot...
</wx-view>
```

我们此前是“`virtualHost: true` + 内层 `<view>` 作为样式根”，因此需要 `externalClasses`/`style` 属性/`data-*` shim 逐项转发，且宿主选择器、`id`、`hidden` 属性都不在 DOM 上。

2026-10-25 已完成宿主迁移（[hosts/web-components/src/index.ts](../hosts/web-components/src/index.ts:68)）：

- 23 个内置组件全部 `virtualHost: false`，真实宿主标签为 `tiny-<tag>`（`tiny-view`、`tiny-text`、`tiny-checkbox` …），不占用微信的 `wx-*` 命名空间；
- 宿主通过 `reflectToAttributes` 反射 `hidden`/`type`/`checked`/`value`/`percent` 等属性，`tiny-view[hidden]` 这类宿主选择器可用；
- `class`/`style`/`id`/`data-*` 直接落在宿主，不再需要 `externalClasses`、`style` 属性和 `scheduleDataAttributeSync`；
- 根级 `.tiny-*` 样式已迁到 `tiny-*` 宿主，内层只保留真正的结构类（如 `.tiny-progress-track`）。

剩余影响：

- 参考 CSS 的 `wx-view {}`、`wx-checkbox {}` 需要机械替换为 `tiny-view {}`、`tiny-checkbox {}`，不能原样复用；
- 参考实现里 host-only 的标签（`view`/`button`/`checkbox-group`/`radio-group`/`swiper-item`）已收敛为 `<slot />`；`label` 暂时保留内部原生 `<label>` 以复用 `for`/包裹激活，其余标签保留内部 wrapper；
- 宿主事件监听通过 `bindHostListeners` + `addListener` 实现，对应参考实现的 `listeners: { "this.tap": ... }`；
- 全局 `app.wxss` 的 tag 选择器会在编译时映射到宿主标签（`button {}` → `tiny-button {}`），页面/组件 WXSS 仍用 scoped marker class。`input::placeholder` 这类规则因此指向宿主，内部原生控件的默认样式由组件 CSS 兜底；
- 内置模板的内部容器使用原生 `div`/`span`（与参考实现一致），不再用 `<view>`/`<text>` 再补 `display:block`。

### 1.2 原生控件替代自定义结构

参考实现大量使用 `div`/`i`/`span` + CSS 伪元素绘制控件：

- checkbox/radio：`div.wx-checkbox-input` / `div.wx-radio-input`，22×22，WeUI 字体打勾
- switch：`div.wx-switch-input`，52×32，圆形滑块
- slider：`div.wx-slider-wrapper`、`track`、`handle`、`thumb`
- image：`div#div` 用 `background-image` 渲染
- icon：`i.wx-icon-*` 用 `weui` 字体和 `:before` 渲染

2026-10-25 已完成 checkbox/radio/switch/slider 的视觉结构替换：控件外观改为 `div`/`span` + 伪元素绘制，原生 `input` 只作为视觉隐藏的无障碍/表单兜底。仍在用原生结构的是：

- icon 已改为 `<i>` + WeUI 字体 + `::before`，不再使用 Unicode 字符
- image 已改为 `<div>` 背景图 + 隐藏 probe `<img>` + fallback slot

这不是“默认样式略有差异”，而是：

- 浏览器原生控件在不同平台/主题下外观不可控
- 参考 CSS 的尺寸、颜色、圆角、勾选图标、禁用态无法直接用
- 原生控件的可访问性/事件模型和参考组件的 tap/touchtrack 模型不同

### 1.3 CSS 选择器与默认值缺失

参考 CSS 以 `wx-<tag>` 为宿主选择器，默认尺寸/颜色都写在组件选择器上；我们已改用 `tiny-<tag>` 宿主选择器，但大多数组件仍只覆盖了“能显示”的最小样式。

典型缺失：

- 参考 `wx-checkbox .wx-checkbox-input`：22×22、`#D1D1D1` 边框、3px 圆角、选中 `#09BB07`
- 参考 `wx-radio .wx-radio-input`：22×22、50% 圆角、选中绿底白勾
- 参考 `wx-switch .wx-switch-input`：52×32、`#DFDFDF` 底、选中 `#04BE02`
- 参考 `wx-slider .wx-slider-handle-wrapper`：2px 轨道；滑块 28px
- 参考 `wx-swiper`：默认 150px 高；指示点 8×8、bottom 10、水平间距 8、`rgba(0,0,0,.3)` / `#000`
- 参考 `wx-scroll-view`：`height:100%`、`max-height:inherit`、三层结构
- 参考 `wx-image`：默认 320×240、`inline-block`

### 1.4 behaviors 逻辑没有等价替换

参考实现依赖：

| behavior | 作用 | 我们的替代 |
| --- | --- | --- |
| `wx-hover` | hover-class / hover-start-time / hover-stay-time | 已有简化 `hover` |
| `wx-touchtrack` | 触摸跟踪、拖动、tap 判定 | 各组件零散 touch 事件 |
| `wx-scroller` | 滚动状态、scroll 节流、scroll-into-view | 原生 `scroll` 事件 |
| `wx-group` / `wx-item` | checkbox/radio group 子项管理 | 自定义 `group`/`item`，但 group 缺少受控 `value` |
| `wx-disabled` | disabled 状态与事件拦截 | 已有 |
| `wx-size-normalizer` | 数值/尺寸归一化 | 已有 |
| `wx-data-component` | 表单数据收集 | 已有 |

因此很多逻辑差异不是“少一个属性”，而是事件顺序、受控值、子项注册方式不同。

## 2. 已重写的 P0 视觉结构

### 2.1 checkbox / radio

参考结构：

```text
div.wx-checkbox-wrapper
  ├── div#input.wx-checkbox-input[.wx-checkbox-input-checked][.wx-checkbox-input-disabled]
  └── slot
```

参考样式要点：

- 22×22
- `border: 1px solid #D1D1D1`
- `border-radius: 3px`（checkbox）/ `50%`（radio）
- 选中色 `#09BB07`
- 勾选图标来自 `weui` 字体 `\EA08`
- 禁用背景 `#E1E1E1`，图标 `#ADADAD`

我们的结构（2026-10-25 已重写）：

```text
tiny-checkbox
  label.tiny-checkbox-wrapper
    ├── input.tiny-checkbox-native（视觉隐藏，保留 label/键盘/表单语义）
    ├── span.tiny-checkbox-input[.is-checked][.is-disabled]
    └── slot
```

已对齐：

- 22×22、`1px #D1D1D1`、3px 圆角（checkbox）/ 50%（radio）
- 选中色 `#09BB07`；勾用 CSS 边框绘制（不再依赖 weui 字体）
- 禁用背景 `#E1E1E1`、勾 `#ADADAD`
- switch 的 `aria` 仍由原生 input 提供

剩余差异：

- 参考用 `tap` + `wx-group` 切换，我们仍依赖原生 `change` 事件
- `aria-checked`/`aria-disabled` 没有显式写在 wrapper 上
- 内部类名是 `.tiny-checkbox-*`，没有沿用 `.wx-checkbox-*`

### 2.2 switch

参考结构：

```text
div.wx-switch-wrapper
  └── div#switchInput.wx-switch-input[.wx-switch-input-checked]
```

参考样式：

- 52×32，圆角 16px
- 底色 `#DFDFDF`，选中 `#04BE02`
- `:before` 白色轨道，`:after` 30×30 滑块 + 阴影
- 选中时 `translateX(20px)`

我们的结构（2026-10-25 已重写）：

```text
tiny-switch
  label.tiny-switch-wrapper
    ├── input.tiny-switch-native（视觉隐藏）
    └── span.tiny-switch-input[.is-checked][.is-disabled]
```

已对齐：

- 52×32、16px 圆角、`#DFDFDF`，选中 `#04BE02`
- `:before` 轨道、`:after` 30×30 滑块 + 阴影
- 选中 `translateX(20px)`

剩余差异：

- `type="checkbox"`（方形 checkbox 形态）仍未实现
- 参考的 `switchInput.tap` 逻辑由原生 label + `change` 代替

### 2.3 slider

参考结构：

```text
div.wx-slider-wrapper
  ├── div.wx-slider-tap-area
  │    └── div.wx-slider-handle-wrapper
  │         ├── div.wx-slider-track
  │         ├── div.wx-slider-step
  │         ├── div.wx-slider-thumb
  │         └── div.wx-slider-handle
  └── ...
```

参考样式：

- 外层 `margin: 10px 18px`
- 轨道 2px，`#e9e9e9`
- 选中轨道 `#1aad19`
- 滑块 28×28，白色，阴影
- `show-value` 文本 `#888`，14px

我们的结构（2026-10-25 已重写）：

```text
tiny-slider
  view.tiny-slider-wrapper
    ├── view.tiny-slider-tap-area
    │    └── view.tiny-slider-handle-wrapper
    │         ├── view.tiny-slider-track
    │         ├── view.tiny-slider-thumb
    │         ├── view.tiny-slider-handle
    │         ├── view.tiny-slider-step
    │         └── input.tiny-slider（opacity:0 的 range 交互层）
    └── text.tiny-slider-value
```

已对齐：

- 外层 `margin: 10px 18px`
- 轨道 2px、`#e9e9e9`；选中轨道 `#1aad19`
- 滑块 28×28、白色、阴影，位置按百分比计算
- `show-value` 文本 `#888`、14px

剩余差异：

- 拖动/点击定位仍由透明的原生 range 承担，不是参考的 `wx-touchtrack` 自定义模型
- 原生 range 的 thumb 有半宽偏移，极端值附近与自定义滑块位置略有差异
- 没有实现参考的 `_onTrack` 细分步进/触摸取消逻辑

### 2.4 image

参考结构：

```text
wx-image (320×240，inline-block，overflow hidden)
  └── div#div (background-image)
  └── span > slot（fallback 内容）
```

参考样式：

- 默认 320×240
- `display: inline-block`
- `div` 宽高 100%
- 背景图通过 `background-size/position/repeat` 控制

我们的结构（2026-10-25 已重写）：

```text
tiny-image (320×240，inline-block，overflow hidden)
  ├── div.tiny-image-div（background-image）
  │    └── img.tiny-image-probe / img.tiny-image-img
  └── view.tiny-image-fallback > slot
```

已对齐：

- 默认 320×240、`inline-block`、宿主 `overflow:hidden`；
- `scaleToFill`/`aspectFit`/`aspectFill`/`top`/`bottom`/`center`/`left`/`right`/四角通过 `background-size/position` 控制；
- `widthFix`/`heightFix` 在 probe load 后用 `naturalWidth/naturalHeight` 和宿主尺寸计算另一条边；
- `renderingMode="img"` 走内部 `<img>`，默认背景图模式走 `div`；
- load/error 事件带 `width`/`height`，fallback slot 在加载完成前可见。

剩余差异：

- `showMenuByLongpress` 的长按菜单未实现；
- `backgroundSize`/`backgroundPosition`/`backgroundRepeat` 属性还不能覆盖 mode 派生值；
- `lazyLoad` 仍是 probe 的 `loading="lazy"` 近似，不是 IntersectionObserver。

### 2.5 icon（2026-10-25 已重写）

参考结构：

```text
i.wx-icon-<type>
```

参考样式：

- `display:inline-block; font-size:0`
- `i` 使用 `weui` 字体
- 每种 type 通过 `:before { content: "\EA0x" }` 和颜色定义
- 支持 `success`、`info`、`warn`、`waiting`、`safe_success`、`safe_warn`、`success_circle`、`success_no_circle`、`waiting_circle`、`circle`、`download`、`info_circle`、`cancel`、`search`、`clear`

我们的结构（已重写）：

```text
tiny-icon
  i.tiny-icon.tiny-icon-<type>
```

已对齐：

- 内嵌 WeUI `@font-face`，`i` 使用 `weui` 字体；
- 15 种 type 全部通过 `::before { content: "\EAxx" }` 渲染，颜色按参考表；
- 宿主 `font-size:0`，内部 `i` 默认 `14px/1`，`size` 经 `normalizeSize` 转成 px 后内联；
- `color` 内联覆盖 class 颜色，`role="img"` + `aria-label` 放在 `i` 上。

剩余差异：

- `type` 默认值保留 `success`（参考 2.7.0 JS 未声明默认值，但官方文档默认 `success`）；
- 没有 `longpress` 事件。

### 2.6 picker

参考结构：

```text
div#wrapper[role=button]
  └── slot
```

参考逻辑：

- 点击 wrapper 打开 `picker-view` 浮层
- `selector` / `multiSelector` / `date` / `time` / `region`
- `range`、`rangeKey`、`value`、`start`、`end`、`fields`
- `change` / `cancel` / `columnchange`

我们的结构（2026-10-25 已重写）：

```text
tiny-picker
  ├── div.tiny-picker__wrapper[role=button] > slot
  └── div.tiny-picker__overlay（wx:if）
       ├── backdrop
       └── panel
            ├── toolbar（取消 / 标题 / 确定）
            └── picker-view > picker-view-column × N
```

已对齐：

- 参考的 wrapper + slot 结构，slot 内容作为当前值展示；
- 点击 wrapper 打开自绘浮层，取消/确定/遮罩关闭；
- `selector` / `multiSelector` / `date` / `time` 由 `picker-view` 列渲染，支持 `range`/`rangeKey`/`start`/`end`/`fields`；
- `columnchange`、`change`、`cancel` 事件；`disabled` 不打开；
- date 的 year/month/day 列会随年月调整天数；time 的 start/end 限制小时范围。

剩余差异：

- 参考通过 `showPickerView` 原生桥调用系统面板；我们使用 DOM 浮层近似；
- `region` 模式未实现（点击不打开）；
- `customItem` 未渲染，`headerText` 仅作为标题；
- 原生桥的滚动惯性/回弹细节与自绘浮层不同。

### 2.7 picker-view / picker-view-column

参考结构：

```text
picker-view
  └── div.wrapper
       └── slot

picker-view-column
  └── div.wx-picker__group
       ├── div.wx-picker__mask
       ├── div.wx-picker__indicator
       └── div.wx-picker__content > slot
```

我们的结构（2026-10-25 已重写）：

```text
tiny-picker-view
  └── div.tiny-picker-view-wrapper > slot

tiny-picker-view-column
  └── div.tiny-picker__group
       ├── div.tiny-picker__mask
       ├── div.tiny-picker__indicator
       └── div.tiny-picker__content > slot
```

已对齐：

- mask/indicator 下放到 column；picker-view 只保留 flex wrapper；
- column 用 `translateY` + `transition` 做吸附滚动，触摸拖动/点击定位后发 `columnchange`；
- 指示器高度从 `indicator-style` 解析，item 高度/上下留白/遮罩尺寸通过 CSS 变量跟随；
- picker-view 把 `value` 同步到各列，`columnchange` 回写 value 并触发 `change`，同时转发 `pickstart`/`pickend`。

剩余差异：

- 没有参考的 `wx-scroller` 惯性/越界回弹，拖动结束直接吸附；
- `columnchange` 与参考 `wxPickerColumnValueChanged` 的中间事件名不同；
- 桌面端用 pointer 事件补了鼠标拖动，触摸/鼠标共用同一套吸附逻辑。

### 2.8 checkbox-group / radio-group

参考属性：

- checkbox-group：`value: Array`
- radio-group：`value: String`

参考逻辑来自 `wx-group`：

- `addItem` / `removeItem` / `renameItem` / `changed`
- 选中项变化时同步 group 的 `value`

我们的实现：

- `checkbox-group` 只有 `style` 属性，`selected` 是内部 data
- `radio-group` 只有 `style` 属性，`value` 是内部 data
- 都没有公开受控 `value` 属性

实际影响：

- `<checkbox-group value="{{selected}}">` 的初始值不生效
- 外部通过 `setData` 修改 group value 不会同步子项
- 表单收集和参考 `wx-group` 语义不一致

## 3. P1：能用，但结构和交互仍是近似

### 3.1 input

参考：

```text
div#wrapper
  └── input#input
  └── div（密码/占位/镜像）
  └── ul（下拉候选）
```

我们的：

```text
input.tiny-input
```

差异：

- 参考有 wrapper、镜像 div、下拉候选结构；我们直接使用原生 input
- 参考字体 `UICTFontTextStyleBody`，我们 `inherit`
- 缺少 `dropdownStyle`、`showValue` 的镜像同步
- `placeholderClass` 参考有前缀处理；我们直接拼 class
- `focus`/selection 的镜像逻辑不完整
- 参考 CSS 的 `div[type=password]` 等规则没有对应

### 3.2 textarea

参考：

```text
div#wrapped
  ├── div#placeholder
  ├── textarea#textarea
  ├── div#compute.compute
  └── div#stylecompute
```

我们的：

```text
textarea.tiny-textarea
```

差异：

- 参考外层是 300×150 的 `wx-textarea`，内部 textarea 绝对定位；我们是 textarea 本身 300×150
- `autoHeight` 只加了 class，没有根据内容计算高度
- 没有 placeholder 层/compute 层；`placeholderStyle` 支持不完整
- `fixed`、`showConfirmBar`、`disableDefaultPadding` 等属性没有视觉实现

### 3.3 scroll-view

参考：

```text
div#wrap.wx-scroll-view
  └── div#main.wx-scroll-view
       └── div#content > slot
```

我们的：

```text
view.tiny-scroll-view > slot
```

差异：

- 参考三层结构，`#main` 承担滚动，`#content` 承担内容；我们单层原生 overflow
- 参考默认 `height:100%; max-height:inherit`；我们只有 vertical 时 `height:100%`
- 缺少 `wx-touchtrack` / `wx-scroller` 的滚动状态、节流、scroll-into-view 精确语义
- 我们的 refresher 是自定义扩展，参考 2.7.0 没有同套属性/事件

### 3.4 swiper

参考：

```text
div.wx-swiper-wrapper
  └── div.wx-swiper-slides
       └── div.wx-swiper-slide-frame > slot
  └── div.wx-swiper-dots
```

我们的：

```text
view.tiny-swiper
  └── view.tiny-swiper-track > slot
  └── view.tiny-swiper-dots
```

差异：

- 参考用绝对定位 slide-frame + transform；我们用 flex track
- 参考指示点默认 8×8、bottom 10、水平间距 8、`rgba(0,0,0,.3)`/`#000`；我们 6×6、bottom 8、gap 6、白色
- 参考的 `wx-swiper-item` relation、`currentItemId`、`displayMultipleItems`、`previousMargin/nextMargin` 布局细节不同
- `skipHiddenItemLayout` 没有完整实现

### 3.5 form

参考：

```text
span#wrapper > slot
```

我们的：

```text
tiny-form > slot
```

差异：

- 参考内部还有 `span#wrapper`，我们是 `tiny-form` 真宿主直接挂 slot；默认 display 不同
- 参考 `formSubmit`/`formReset` 与 `wx-group`、`wx-data-component`、自动填充逻辑组合；我们只做 DFS 收集
- 自定义组件 `wx://form-field` 还没有接入
- `reportSubmit` 只保留属性，没有上报行为

### 3.6 button

参考：

```text
slot（native=false）
或 wx-cover-view > wx-cover-view > slot（native=true）
```

我们的：

```text
tiny-button > slot
```

差异：

- 参考宿主是 `wx-button`，native 模式才走原生 cover-view；我们是 `tiny-button` 真宿主 + slot，宿主形态已接近，但还没有 native/cover-view 分支
- 基础 CSS（尺寸/颜色/圆角/loading/plain/mini）大体已对齐
- 缺少 `native` 属性和 cover-view 结构
- `open-type` 仍是失败回调，不是真实能力
- 参考的 `longtap`/`canceltap` 事件没有完整映射

## 4. P2：结构差异为主，视觉影响较小

| 组件 | 差异 |
| --- | --- |
| `view` | 参考宿主即 `wx-view`，模板只有 slot；我们已迁移为 `tiny-view` 真宿主 + slot，class/style/id/data-*/hidden 均落在宿主；参考 CSS 需把 `wx-` 映射为 `tiny-` |
| `text` | 参考只补 `selectable` 的 cursor/user-select；我们额外做了 space 类，`display:inline` 基本对齐 |
| `label` | 参考无 CSS，靠 `for` 和原生行为；我们是原生 `<label>` 双分支模板，语义基本可用 |
| `canvas` | 参考默认 300×150，内部 canvas 绝对定位；我们宽度 100%、没有内部定位层，实际是离屏镜像 |
| `progress` | 参考结构 `div.wx-progress-bar > div.wx-progress-inner-bar`；我们是 track/bar。默认色和属性已对齐，但 `active` 的逐帧动画/curPercent 未实现 |
| `swiper-item` | 参考依赖 `wx-swiper` relation 和 slide-frame 布局；我们只是普通 slot 容器，单独使用没有尺寸/定位语义 |
| `button` 的 `:after` 边框 | 已复制，宿主已改为 `tiny-button`；仍缺 native/cover-view 分支 |
| `icon` 的字体 | 已改为 WeUI 字体 + 15 种 type 的伪元素，颜色按参考表 |

## 5. 建议修复顺序

1. **✅ 已完成：checkbox、radio、switch、slider**
   - 已改为 wrapper + `div`/`span` 结构，22×22、52×32、2px 轨道、28px 滑块
   - 剩余：checkbox/radio 的 tap/aria/group 语义，switch 的 `type="checkbox"`

2. **✅ 已完成：image + icon**
   - image 已改为背景图 + 320×240/inline-block + widthFix 测量
   - icon 已迁到 `i` + WeUI 字体/伪元素，15 种 type 和颜色表
   - 剩余：image longpress/lazy、icon longpress

3. **✅ 已完成：picker / picker-view**
   - 已完成 wrapper + 浮层 + column 的 mask/indicator/content 结构
   - 剩余：region/customItem、部分初始 value/列时序

4. **补 input/textarea 的 wrapper 结构**
   - 密码镜像、placeholder、autoHeight、selection/focus 同步

5. **scroll-view / swiper**
   - 补三层结构、`wx-touchtrack`/`wx-scroller` 等价逻辑、参考默认尺寸

6. **view 的宿主形态（已完成）**
   - 已迁移为 `virtualHost: false` + 真实 `tiny-view` 宿主 + `<slot />`；`class`/`style`/`id`/`data-*`/`hidden` 都在宿主上，`hover` 走宿主 `touchstart` 监听


## 6. 具体修复方案

### 6.0 总原则

1. **不再给原生控件叠 CSS 补丁**：checkbox/radio/switch/slider 已完成结构替换；image/icon/picker 同样先换结构，再谈样式。
2. **宿主模型已统一，后续只改内部结构**：23 个内置组件现在都是 `tiny-*` 真宿主，参考实现的 wrapper/indicator/track 等内部节点按组件逐个迁移，不需要再改宿主、选择器或 data-* 转发。
3. **表单语义优先保留**：checkbox/radio/switch 暂时保留视觉隐藏的原生 input，用于 `label for`、键盘和可访问性；之后再用 label-target 派发替换。
4. **样式按参考值迁移**：先迁尺寸/颜色/圆角/边框/伪元素，再迁 hover/transition/动画。
5. **每个组件都补两类测试**：
   - 组件单测：结构 class、默认尺寸、选中/禁用状态、事件 detail
   - 浏览器验收：真实布局（getBoundingClientRect）和交互

### 6.1 checkbox / radio（✅ 视觉已重写；剩余 tap/aria/group）

目标模板：

```wxml
<view
  class="tiny-checkbox {{checked ? 'is-checked' : ''}} {{disabled ? 'is-disabled' : ''}} {{hidden ? 'tiny-hidden' : ''}} class"
  role="checkbox"
  aria-checked="{{checked}}"
  aria-disabled="{{disabled}}"
  catchtap="handleTap"
>
  <input
    id="native-input"
    class="tiny-checkbox-native"
    type="checkbox"
    checked="{{checked}}"
    disabled="{{disabled}}"
    catchchange="handleChange"
  />
  <view class="tiny-checkbox-input {{checked ? 'wx-checkbox-input-checked' : ''}} {{disabled ? 'wx-checkbox-input-disabled' : ''}}"></view>
  <slot />
</view>
```

关键 CSS：

```css
.tiny-checkbox {
  display: inline-block;
  -webkit-tap-highlight-color: transparent;
}
.tiny-checkbox-native {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.tiny-checkbox-input {
  display: inline-block;
  width: 22px;
  height: 22px;
  margin-right: 5px;
  border: 1px solid #d1d1d1;
  border-radius: 3px;
  background: #fff;
  color: #09bb07;
  position: relative;
  vertical-align: middle;
}
.tiny-checkbox-input.wx-checkbox-input-checked::before {
  font: normal normal normal 14px/1 "weui";
  content: "\EA08";
  font-size: 22px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -48%) scale(0.73);
}
.tiny-checkbox-input.wx-checkbox-input-disabled {
  background: #e1e1e1;
}
.tiny-checkbox-input.wx-checkbox-input-disabled::before {
  color: #adadad;
}
```

radio 的差异：

- 外层改 `.tiny-radio`
- 视觉块改 `.tiny-radio-input`
- `border-radius: 50%`
- 选中：`background: #09bb07; border-color: #09bb07`
- 勾选仍用 `\EA08`，颜色 `#fff`，字号 18px

CSS 单独放 `radio/index.css`，不要和 checkbox 共用，避免以后分叉。

逻辑改造：

```ts
handleTap() {
  if (this.data.disabled) return
  const checked = !this.data.checked
  this.setData({ checked })
  this.triggerEvent('change', { value: this.data.value, checked }, { bubbles: true, composed: true })
}
```

- 保留 `handleChange` 兼容隐藏 input 的键盘/`label for`
- `checked` 的 observer 继续发 `checkboxstate`
- `disabled` 由 `wx-disabled` 拦截
- 点击区域放在 wrapper 上，不要挂在 input 上

验收：

- `dumpElementToString` 含 `.tiny-checkbox-input`
- 浏览器 computed `width/height === 22px`
- 点击后 class 含 `wx-checkbox-input-checked`
- `disabled` 点击不触发 `change`
- `label for` 仍能切换（短期隐藏 input 方案）

风险：`label for` 跨组件 shadow 边界可能失效；如果验证失败，下一步实现 label-target 派发（见 6.9）。

### 6.2 switch（✅ 视觉已重写；剩余 type="checkbox"）

目标模板：

```wxml
<view
  class="tiny-switch {{type === 'checkbox' ? 'is-checkbox' : ''}} {{checked ? 'is-checked' : ''}} {{hidden ? 'tiny-hidden' : ''}} class"
  role="switch"
  aria-checked="{{checked}}"
  catchtap="handleTap"
>
  <input
    id="native-input"
    class="tiny-switch-native"
    type="checkbox"
    checked="{{checked}}"
    disabled="{{disabled}}"
    catchchange="handleChange"
  />
  <view class="tiny-switch-input {{checked ? 'wx-switch-input-checked' : ''}} {{disabled ? 'wx-switch-input-disabled' : ''}}"></view>
</view>
```

关键 CSS：

```css
.tiny-switch {
  display: inline-block;
  -webkit-tap-highlight-color: transparent;
}
.tiny-switch-native {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.tiny-switch-input {
  position: relative;
  width: 52px;
  height: 32px;
  margin-right: 5px;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  background: #dfdfdf;
  transition: background-color .1s, border .1s;
}
.tiny-switch-input::before {
  content: " ";
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 30px;
  border-radius: 15px;
  background: #fdfdfd;
  transition: transform .3s;
}
.tiny-switch-input::after {
  content: " ";
  position: absolute;
  top: 0;
  left: 0;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .4);
  transition: transform .3s;
}
.tiny-switch-input.wx-switch-input-checked {
  border-color: #04be02;
  background: #04be02;
}
.tiny-switch-input.wx-switch-input-checked::before {
  transform: scale(0);
}
.tiny-switch-input.wx-switch-input-checked::after {
  transform: translateX(20px);
}
```

`type="checkbox"` 分支：

- 外层加 `.is-checkbox`
- 视觉块改成 22×22 方框，勾选/禁用规则复用 checkbox
- 参考实现里 type=checkbox 是“方形勾选”，不是开关

逻辑：

- wrapper `tap` 切换 `checked`
- 切换后 `vibrateShort`（参考在 switch 模式调用 `wx.vibrateShort`；渲染线程不能直接调 service API，需要宿主桥或省略，先记录差异）
- 保留隐藏 input 的 `change` 兜底

### 6.3 slider（✅ 视觉已重写；剩余 touchtrack 交互层）

目标模板：

```wxml
<view
  class="tiny-slider-wrapper {{disabled ? 'is-disabled' : ''}} {{hidden ? 'tiny-hidden' : ''}} class"
  style="{{style}}"
>
  <view class="tiny-slider-tap-area" catchtap="handleTapArea">
    <view class="tiny-slider-handle-wrapper" catchtouchstart="handleTouchStart" catchtouchmove="handleTouchMove" catchtouchend="handleTouchEnd">
      <view class="tiny-slider-track" style="width: {{percent}}%; background: {{activeColor || selectedColor}};"></view>
      <view class="tiny-slider-step"></view>
      <view class="tiny-slider-thumb" style="left: {{percent}}%; width: {{blockSize}}px; height: {{blockSize}}px; background: {{blockColor}};"></view>
      <view class="tiny-slider-handle" style="left: {{percent}}%;"></view>
    </view>
  </view>
  <text wx:if="{{showValue}}" class="tiny-slider-value">{{value}}</text>
</view>
```

关键 CSS：

```css
.tiny-slider-wrapper {
  display: flex;
  align-items: center;
  margin: 10px 18px;
}
.tiny-slider-tap-area {
  flex: 1;
  padding: 8px 0;
}
.tiny-slider-handle-wrapper {
  position: relative;
  height: 2px;
  border-radius: 5px;
  background: #e9e9e9;
  cursor: pointer;
}
.tiny-slider-track {
  height: 100%;
  border-radius: 6px;
  background: #1aad19;
}
.tiny-slider-thumb {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, .2);
  z-index: 2;
}
.tiny-slider-handle {
  position: absolute;
  top: 50%;
  width: 28px;
  height: 28px;
  margin-top: -14px;
  margin-left: -14px;
  border-radius: 50%;
  background: transparent;
  z-index: 3;
}
.tiny-slider-value {
  margin-left: 1em;
  color: #888;
  font-size: 14px;
  text-align: center;
}
```

逻辑：

- `percent = (value - min) / (max - min) * 100`
- `handleTouchStart/Move/End` 用 `clientX` 与 wrapper 的 `getBoundingClientRect()` 计算比例
- `handleTapArea` 直接跳到点击位置
- 拖动中 `triggerEvent('changing', { value })`，结束 `change`
- `disabled` 时不进入 touch
- 删除原生 range；`getFormData` 返回 `data.value`

验收：

- 轨道高度 2px、滑块直径 28px
- 点击 25% 位置 value 约为 min + 25% 区间
- 拖动发 `changing`/`change`
- disabled 不响应

### 6.4 image（✅ 已重写；剩余 longpress/lazy）

目标模板：

```wxml
<view
  class="tiny-image tiny-image-mode-{{mode}} {{hidden ? 'tiny-hidden' : ''}} class"
  style="{{style}}"
  role="img"
  aria-label="{{ariaLabel}}"
>
  <view
    wx:if="{{resolvedSrc && !hasError}}"
    class="tiny-image-bg"
    style="background-image: url('{{resolvedSrc}}'); background-size: {{backgroundSize}}; background-position: {{backgroundPosition}}; background-repeat: {{backgroundRepeat}};"
  ></view>
  <slot />
</view>
```

关键 CSS：

```css
.tiny-image {
  display: inline-block;
  width: 320px;
  height: 240px;
  overflow: hidden;
  position: relative;
}
.tiny-image-bg {
  width: 100%;
  height: 100%;
}
.tiny-image-mode-widthFix {
  height: auto;
}
```

逻辑：

- `src` observer 解析资源 URL，和当前 `resolveAssetUrl` 一致
- 用 `new Image()` 预加载：
  - `onload`：记录 `naturalWidth/naturalHeight`，`widthFix` 时计算高度
  - `onerror`：`hasError = true`，触发 `error`
- mode → background 映射：

| mode | background-size | position |
| --- | --- | --- |
| scaleToFill | 100% 100% | center |
| aspectFit | contain | center |
| aspectFill | cover | center |
| widthFix | 100% auto | center |
| heightFix | auto 100% | center |
| top/bottom/center/left/right | 100% 100% | 对应方位 |
| topLeft ... bottomRight | 100% 100% | 左上/右上/左下/右下 |

- `longpress`：在 root 上加 `bindlongpress` 或 touch 计时器
- 保留 `load`/`error` 事件；预加载失败时不显示背景层
- 不再使用 `<img>` 的 `object-fit`

验收：

- 默认 boundingRect 320×240
- `mode="aspectFit"` 计算 `background-size: contain`
- `widthFix` 且图片 2:1 时高度变为宽度的一半
- 图片失败触发 `error`

### 6.5 icon（✅ 已重写）

目标模板（已实现）：

```wxml
<i
  class="tiny-icon tiny-icon-{{type}}"
  role="img"
  aria-label="{{ariaLabel}}"
  style="color: {{color}}; font-size: {{fontSize}}px;"
></i>
```

CSS：

- `@font-face` 和 `.tiny-icon-*` 段在 `hosts/web-components/src/components/icon/index.css` 中一次性声明
- `.tiny-icon { font: normal normal normal 14px/1 "weui"; }`
- 每个 type 用 `.tiny-icon-<type>::before { content: "\EAxx" }`
- 颜色表按参考：

| type | color | content |
| --- | --- | --- |
| success | #09BB07 | \EA06 |
| info | #10AEFF | \EA03 |
| warn | #F76260 | \EA0B |
| waiting | #10AEFF | \EA09 |
| safe_success | #09BB07 | \EA04 |
| safe_warn | #FFBE00 | \EA05 |
| success_circle | #09BB07 | \EA07 |
| success_no_circle | #09BB07 | \EA08 |
| waiting_circle | #10AEFF | \EA0A |
| circle | #C9C9C9 | \EA01 |
| download | #09BB07 | \EA02 |
| info_circle | #09BB07 | \EA0C |
| cancel | #F43530 | \EA0D |
| search | #B2B2B2 | \EA0E |
| clear | #B2B2B2 | \EA0F |

逻辑：

- 删除 `ICON_GLYPHS` 和 `glyph` data
- 只保留 type/size/color 属性
- 补 `longpress`（参考有）
- 未识别 type 默认 `success` 或显示空，先按参考行为确认

验收：

- computed `font-family` 包含 `weui`
- 每个 type 的 `::before` content 正确
- 颜色与参考一致

### 6.6 picker（✅ selector/multi/date/time；剩余 region/customItem）

分两阶段，避免一次重写全部模式。

**阶段 A：结构 + selector**

```wxml
<view class="tiny-picker {{hidden ? 'tiny-hidden' : ''}} class" style="{{style}}" catchtap="open">
  <slot />
</view>

<view wx:if="{{visible}}" class="tiny-picker-popup">
  <view class="tiny-picker-mask" catchtap="cancel"></view>
  <view class="tiny-picker-panel">
    <view class="tiny-picker-toolbar">
      <text class="tiny-picker-cancel" catchtap="cancel">{{cancelText || '取消'}}</text>
      <text class="tiny-picker-title">{{headerText}}</text>
      <text class="tiny-picker-confirm" catchtap="confirm">确定</text>
    </view>
    <view class="tiny-picker-columns">
      <view wx:for="{{columns}}" wx:key="index" class="tiny-picker-column">
        <view
          wx:for="{{item.options}}"
          wx:for-item="option"
          wx:key="value"
          class="tiny-picker-option {{option.value === item.current ? 'is-active' : ''}}"
          data-column="{{index}}"
          data-index="{{option.index}}"
          catchtap="selectOption"
        >{{option.label}}</view>
      </view>
    </view>
  </view>
</view>
```

- 点击 wrapper 打开 popup
- selector：`columns = [{ options: range.map(...), current: value }]`
- 点击选项更新 draft value
- 确定回写 `value`，触发 `change`；取消触发 `cancel`
- 日期/时间：生成 year/month/day 或 hour/minute 列
- `multiSelector`：多列
- `region`：先用内置地区数据或宿主数据，暂不硬编码全量

CSS：

- popup `position: fixed; inset: 0; z-index`
- mask `rgba(0,0,0,.6)`
- panel 底部白底、圆角
- toolbar 44px、取消/确定颜色 `#576b95`
- columns 高度 238px，option 34px

**阶段 B：换成 picker-view 滚轮**

- 复用 6.7 的 picker-view 结构
- picker 模板只保留 wrapper + popup，把 columns 替换成 `<picker-view>` / `<picker-view-column>`
- 这样 `multiSelector`/`region` 和滚轮交互共用一套实现

验收：

- 点击 wrapper 出现 popup
- 选择后 `change` detail 的 `value` 是索引（selector）
- 取消发 `cancel`
- date 模式 value 为 `YYYY-MM-DD`

### 6.7 picker-view / picker-view-column（✅ 结构/pointer 已重写）

目标结构按参考：

```wxml
<!-- picker-view -->
<view class="tiny-picker-view {{hidden ? 'tiny-hidden' : ''}} class" style="{{style}}">
  <view class="wrapper"><slot /></view>
</view>

<!-- picker-view-column -->
<view class="wx-picker__group" role="listbox" aria-label="{{ariaLabel}}">
  <view class="wx-picker__mask"></view>
  <view class="wx-picker__indicator"></view>
  <view class="wx-picker__content" style="transform: translateY({{offset}}px);">
    <slot />
  </view>
</view>
```

CSS：

```css
.tiny-picker-view { display: block; }
.tiny-picker-view .wrapper { display: flex; position: relative; overflow: hidden; }
.wx-picker__group { flex: 1; position: relative; height: 100%; overflow: hidden; }
.wx-picker__mask | .wx-picker__indicator { 参考 CSS 的渐变/上下线 }
.wx-picker__content { position: absolute; top: 0; left: 0; width: 100%; will-change: transform; }
.wx-picker__content > * { height: 34px; line-height: 34px; text-align: center; }
```

逻辑：

- 列高由 `itemHeight = 34`、`visibleCount = 7` 计算
- 初始 `offset = -current * itemHeight`
- touchstart 记录 `startY`
- touchmove：`offset = startOffset + (y - startY)`，限制边界
- touchend：`current = round(-offset / itemHeight)`，吸附到 `-current * itemHeight`
- `current` 变化通知 parent：`columnchange` / `pickstart` / `pickend`
- parent `value` 变化时，调用每列 `setCurrent(value[index])`
- 列的 index 通过父节点 childNodes 顺序计算（现有 `notifyParent` 可复用）
- 去掉 `overflow-y:auto` + `scroll-snap` 和硬编码 `height:238px`；高度由 `style`/父级决定
- 保留 `indicatorStyle/Class`、`maskStyle/Class`

验收：

- 初始 value `[2]` 时 offset = -68px
- 拖动 34px 后 current +1
- 结束触发 `change`，value 数组正确
- 两列互不干扰

### 6.8 checkbox-group / radio-group（❌ 仍缺受控 value）

新增受控属性：

```ts
// checkbox-group
properties: {
  value: { type: Array, value: [] },
},
observers: {
  value(next: string[]) {
    this.syncChildren(next)
  },
},
methods: {
  syncChildren(next: string[]) {
    this.walkItems((item) => {
      item.setData({ checked: next.includes(String(item.data.value)) })
    })
  },
  applyState(detail) {
    const value = String(detail.value)
    const next = new Set(this.data.value as string[])
    detail.checked ? next.add(value) : next.delete(value)
    this.setData({ value: [...next] })
    return [...next]
  },
}
```

radio-group 用 `value: String`，observer 同步 `checked`。

关键点：

- `value` 必须是 public property，和参考一致
- child 的 `checkboxstate`/`change` 更新 group value
- group 的 `value` observer 反向同步 child checked
- 避免 observer 循环：比较 `oldValue` 或加 `_syncing` 标志
- `getFormData`/`resetFormData` 走 group value

验收：

- `<checkbox-group value="{{['a']}}">` 初始选中 a
- 点击 b 后 value 为 `['a','b']`
- 外部 setData value 后 UI 同步
- radio-group 单选互斥

### 6.9 label-target（❌ 未完成）

checkbox/radio/switch 改成自定义视觉后，`<label for>` 不再天然工作。两条路线：

**短期**：

- 保留隐藏原生 input，label 仍用 `for`
- 需要验证跨组件 shadow 边界是否可命中；如果不可命中，走长期方案

**长期**：

```ts
// label
handleTap() {
  const target = this.findTarget(this.data.for)
  target?.handleLabelTap?.()
}
```

- label 组件通过 `for` 或第一个子组件查找目标
- 目标组件实现 `handleLabelTap()`（checkbox/radio/switch）
- 删除 `label` 模板的 `for` 属性
- 参考实现的 `wx-label-target` 就是这个模型

验收：

- `<label for="cb">...<checkbox id="cb"/></label>` 点击文字切换
- 嵌套 `<label><checkbox/></label>` 切换
- 不重复触发（避免 label + input 双切换）

### 6.10 input / textarea（⚠️ input 文本输入已修；wrapper/autoHeight 仍缺）

**input**：

```wxml
<view class="tiny-input-wrapper {{hidden ? 'tiny-hidden' : ''}} class" style="{{style}}">
  <input id="native-input" class="tiny-input" ... />
  <view wx:if="{{password}}" class="tiny-input-shadow">{{maskedValue}}</view>
</view>
```

- wrapper 承担 `height:1.4rem; overflow:hidden; white-space:nowrap`
- input 本体 `position:relative; z-index:2; background:transparent; border:0; width:100%; font:inherit`
- 密码镜像层 `position:absolute; z-index:1; color:black; white-space:pre`
- placeholderClass 继续按参考加前缀
- `dropdownStyle`：先保留属性，不下拉候选；后续单独实现
- `focus`/selection 同步保留现有事件

**textarea**：

```wxml
<view class="tiny-textarea-wrapper {{hidden ? 'tiny-hidden' : ''}} class" style="{{style}}">
  <view class="tiny-textarea-placeholder">{{placeholder}}</view>
  <textarea id="native-textarea" class="tiny-textarea" ...></textarea>
  <view class="tiny-textarea-compute"></view>
</view>
```

- 外层 `width:300px; height:150px; position:relative`
- textarea `position:absolute; inset:0; line-height:1.2; background:transparent; resize:none; border:0`
- autoHeight：`input` 后设置 `textarea.style.height = 'auto'; height = scrollHeight + 'px'`，同时同步外层
- placeholder 层仅在 `!value` 时显示
- 保留现有 input/focus/blur/confirm/linechange

验收：

- input 高度 1.4rem
- textarea 默认 300×150
- 输入多行后 autoHeight 高度增加
- placeholder 不遮挡输入

### 6.11 scroll-view / swiper（⚠️ 结构仍是近似）

**scroll-view**：

```wxml
<view id="wrap" class="tiny-scroll-view {{...}}" style="{{style}}">
  <view id="main" class="tiny-scroll-view-main" bindscroll="handleScroll" ...>
    <view id="content"><slot /></view>
  </view>
</view>
```

- `#wrap` 负责尺寸/圆角
- `#main` 负责 overflow 和 scroll 事件
- `#content` 负责内容高度
- CSS 按参考：`width:100%; height:100%; max-height:inherit`
- 保留现有 scroll/toupper/tolower/refresher 逻辑，只改 DOM 层级

**swiper**：

```wxml
<view class="wx-swiper-wrapper">
  <view class="wx-swiper-slides">
    <view class="wx-swiper-slide-frame" style="transform: translateX(-{{current*100}}%);">
      <slot />
    </view>
  </view>
  <view class="wx-swiper-dots ...">...</view>
</view>
```

- 把 flex track 改成绝对定位 slide-frame + transform
- `swiper-item` 作为 frame 的普通子项，需要 CSS `position:absolute` / width 100%
- 指示点尺寸/位置/颜色按参考
- 保留现有 autoplay/current/change/animationfinish
- `displayMultipleItems` 需要把 frame 宽度改为 `100 / n%`，先做 n=1，再扩

验收：

- swiper 默认高度 150
- 指示点 8×8、bottom 10
- current 变化 transform 正确
- vertical 方向正确

### 6.12 form / button（⚠️ 仍为近似）

**form**：

- 模板根从 `view` 改成 `span`（参考是 `span#wrapper`），或至少 `display:inline`，避免 block 布局
- 保留 `formSubmit`/`formReset`
- 把 `reportSubmit` 从“只保留属性”改成：
  - 有值且宿主支持时，触发上报事件/诊断；当前先发 `reportSubmit` 不支持的 diagnostic
- 后续接 `wx://form-field`

**button**：

- 短期：保持原生 `<button>`，补齐 `longtap`/`canceltap` 事件和 `native` 属性语义
- 中期：如果必须和参考完全一致，改成 `wx-button` 宿主 + `<slot>`，`native` 时才渲染原生/cover-view；这会牵动 `.tiny-button` 样式和点击区域，单独排期
- open-type 继续 fail-close（当前诊断 + error），不要伪装成成功

### 6.13 view 宿主（✅ 宿主迁移已完成）

- 目标：`view` 改成 `virtualHost: false`，模板 `<slot />`，宿主自己承担 `.tiny-view`、hover、hidden、style
- 收益：data-* 转发 shim 可以删除；参考宿主选择器可直接复用
- 风险：现有所有依赖内层 `.tiny-view` 的测试、布局、点击区域都要改
- 建议放在 P0/P1 组件结构稳定之后，单独一轮做

## 7. 验收与测试清单

### 7.1 组件单测

每个组件至少补：

```ts
expect(glassEasel.dumpElementToString(host, true)).toContain('wx-checkbox-input')
expect(host.data.checked).toBe(true)
expect(events).toEqual([{ value: 'a', checked: true }])
```

- 结构 class
- 默认尺寸/样式（能通过 dump 断言的）
- 事件 detail
- disabled
- controlled value（group）

### 7.2 浏览器验收

在 `scripts/glass-easel-browser.mjs` 的 WeChat demo flow 增加：

- checkbox：computed width/height 22px，点击后 checked
- switch：52×32，点击后背景色 `rgb(4, 190, 2)`
- slider：轨道高度 2px，点击后 value 变化
- image：boundingRect 320×240
- icon：computed fontFamily 包含 `weui`
- picker：点击 wrapper 出现 popup，选择后 change
- picker-view：初始 value 对应 offset，拖动后 change
- group：受控初始值生效

### 7.3 不回归项

- `pnpm accept:glass-easel` 五段全绿
- 152 单测保持通过
- 现有 WeChat demo 的按钮/输入/表单页面不出现新 console error
- P0 demo 的 hover/slider/scroll-view 交互不退化

## 8. 统计

- 已接入标签：23 / 60
- 结构/默认外观 P0：0（2026-10-25 已完成 8 个标签的视觉重写）
- 结构/交互 P1：6 个组件 + 3 个语义缺口（group value、switch type、label-target）
- 结构差异为主 P2：6 个标签
- 参考实现中尚未接入的标签：37 个（见主文档第 4.1 节）

> 本文同时保留差异记录、目标设计和已完成状态；第 6 节的部分方案已落地，未完成项仍以参考 CSS 的宿主选择器/尺寸/颜色和参考 JS 的 behaviors 为准。
