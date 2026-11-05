# 内置组件与 behaviors 缺口清单（WAWebview 2.33.0）

> **快照**：2026-11-04 · **参考实现**：`~/Downloads/wechat-miniprogram/2.33.0/WAWebview.js`、`WAWebview.css` · **组件目标**：沿用 [wechat-webview-parity.md 附录 B](./wechat-webview-parity.md#附录-bwebview-组件清单41) 的 41 个 WebView 公共组件
>
> 本文只回答“还差哪些、占位在哪”，不重复各组件的对齐细节；已实现组件的状态看 [component-reference-diff.md](./component-reference-diff.md)。

## 1. 结论

| 维度 | 参考总数 | 已实现 | 缺口 | 缺口分布 |
| --- | ---: | ---: | ---: | --- |
| 内置组件 | 41 项（40 标签 + 1 文档页） | 40 | **0** | 全部 40 个真实标签已注册（含 2.33.0 新增的 grid-view）；17 个组件暂不支持；`aria-component` 是文档页，不是标签 |
| 内置 behaviors | 42 | 28 | **11** | 全部是宿主 `@tiny/host-web-components` 的 behavior；7 个 runtime `wx://` behavior 已实现；3 个按基线不做 |

- 组件缺口已清零：DOM/CSS、原生/媒体、开放能力标签都已落地；媒体/开放能力是浏览器近似或宿主 stub。
- behaviors 缺口按类别：共享/DOM 4 个、媒体/原生 6 个、宿主平台 1 个。`wx://request-filter` / `wx://request-sender` 按基线不做，声明时回落到 `UNSUPPORTED_BEHAVIOR`。
- 组件占位目录已全部删除；11 个缺失宿主 behavior 占位保留，每个目录只有 `PLACEHOLDER.md`。含该标记的组件目录会被 `build-templates.mjs` / `build-styles.mjs` 跳过，不会被注册成空壳组件。
- 7 个 runtime `wx://` 内置 behavior 已在 [packages/runtime/src/component/behaviors](../packages/runtime/src/component/behaviors/index.ts:1) 实现，**不在内核里放占位**。

## 2. 口径

### 2.1 组件

- **目标 41**：与 [wechat-webview-parity.md 附录 B](./wechat-webview-parity.md#附录-bwebview-组件清单41) 一致。剔除 Skyline 专属、XR-FRAME、`native-component` 说明页，以及 `share-element`（当前文档归在 Skyline）。
- **2.33.0 包内**：`WAWebview.js` 的 `is: "wx-<tag>"` 元素、webview 启用表（`b`，61 个 `wx-*` 标签，含内部 `wx-refresher`）和 `WAWebview.css` 的 `wx-*` 宿主规则。
- **新增组件**：无；`reward` 也已按暂不支持移除。
- **文档页**：`aria-component` 不是自定义元素，而是“无障碍访问”的文档页；ARIA 属性由所有组件的 `base` behavior 提供，不建标签、不建占位。`selection` 是 3.6.4 新增、不在 2.33.0 范围内；2.33.0 新增 `grid-view`，已实现。

> 暂不支持（移除标签，不计缺口）：`editor`、`editor-portal`。
>
> 2.33.0 还有 13 个平台内部 UI 元素（`action-sheet`、`modal`、`toast`、`loading`、`mask`、`video-ad`、`entry-banner`、`refresher`、`trade-service`、`wecom-user-profile`、`cloud-storage-simple-component` 等）和 4 个不在 WebView 目标内的标签（`share-element`、`share-button`、`contact-button`、`xr-frame`）。这些不建组件占位，原因见第 6 节。

### 2.2 behaviors

- 从 2.33.0 的 `registerBehavior({ is: "..." })` 提取到 **42** 个内置 behavior。
- **已实现 28** = `src/behaviors` 的 21 个宿主 behavior + `packages/runtime/src/component/behaviors` 的 7 个 `wx://` behavior。
- **明确不做 3** = `wx://request-filter` / `wx://request-sender` / `wx-cloud`；前两者只服务微信原生媒体 URL 过滤，`wx-cloud` 依赖微信云开发，Tiny 不模拟这些管线。
- **缺口 11** = 全部是宿主 behavior；未识别的 `wx://` behavior（包括上面两个）仍会发 `UNSUPPORTED_BEHAVIOR` 诊断。`wx-cloud` 按基线不做，不会出现在缺口里。

## 3. 组件缺口（0）

### 3.1 分类汇总

| 分类 | 目标 | 已实现 | 缺口 |
| --- | ---: | ---: | ---: |
| 视图容器 | 12 | 12 | 0 |
| 基础内容 | 4 | 4 | 0 |
| 表单 | 14 | 14 | 0 |
| 导航 | 2 | 2 | 0 |
| 媒体 | 3 | 3 | 0 |
| 地图 | 1 | 1 | 0 |
| 画布 | 1 | 1 | 0 |
| 开放能力 | 1 | 1 | 0 |
| 无障碍（文档页） | 1 | — | — |
| 导航栏 | 1 | 1 | 0 |
| 页面属性 | 1 | 1 | 0 |
| **合计（40 标签 + 1 文档页）** | **40** | **40** | **0** |

### 3.2 缺失明细

“2.33.0”列表示该元素是否存在于本次附带的 2.33.0 包内；“形态”是建议的落地方式，不是已定方案。表中的 `wx://request-filter` / `wx://request-sender` 仅作微信参考，按基线 Tiny 不实现。

| 组件 | 分类 | 2.33.0 | 形态 | 参考 behaviors |
| --- | --- | --- | --- | --- |

### 3.3 已实现（40）

`view`、`grid-view`、`cover-view`、`cover-image`、`root-portal`、`page-container`、`movable-area`、`movable-view`、`scroll-view`、`swiper`、`swiper-item`、`match-media`、`icon`、`text`、`rich-text`、`progress`、`button`、`checkbox`、`checkbox-group`、`radio`、`radio-group`、`slider`、`switch`、`input`、`label`、`picker`、`picker-view`、`picker-view-column`、`form`、`textarea`、`navigator`、`functional-page-navigator`、`page-meta`、`navigation-bar`、`image`、`audio`、`video`、`map`、`web-view`、`canvas`。

实现入口：[components/](../hosts/web-components/src/components)、标签清单 [builtin.ts](../packages/manifest/src/builtin.ts:3)、定义注册 [index.ts](../hosts/web-components/src/index.ts:50)。

## 4. behaviors 缺口（11）

### 4.1 已实现（21）

| 参考 behavior | 实现位置 |
| --- | --- |
| `wx-base` / `wx-hover` / `wx-reload` / `wx-disabled` / `wx-group` / `wx-item` / `wx-data-component` / `wx-size-normalizer` / `wx-class-prefix` / `wx-autofill` / `wx-label-aria` / `wx-label-target` / `wx-touchtrack` / `wx-scroller` | [behaviors/](../hosts/web-components/src/behaviors/index.ts:40) 的 14 个工厂 |
| `wx://component-export` / `wx://form-field` / `wx://form-field-button` / `wx://form-field-group` / `wx://functional-page-behavior` / `wx://label-target` / `wx://style-filter` | [packages/runtime/src/component/behaviors/](../packages/runtime/src/component/behaviors/index.ts:1) 的 7 个独立模块 |

### 4.2 宿主 behaviors 缺口（19）

占位目录：[hosts/web-components/src/behaviors/pending/](../hosts/web-components/src/behaviors/pending/README.md)。

| 参考 behavior | 类别 | 参考使用方 |
| --- | --- | --- |
| [`wx-autofill-provider`](../hosts/web-components/src/behaviors/pending/autofill-provider/PLACEHOLDER.md) | 共享/DOM | form |
| [`wx-image-route`](../hosts/web-components/src/behaviors/pending/image-route/PLACEHOLDER.md) | 共享/DOM | map |
| [`wx-keyboard-accessory-host`](../hosts/web-components/src/behaviors/pending/keyboard-accessory-host/PLACEHOLDER.md) | 共享/DOM | input, textarea |
| [`wx-mask-behavior`](../hosts/web-components/src/behaviors/pending/mask-behavior/PLACEHOLDER.md) | 共享/DOM | toast, action-sheet, modal |
| [`wx-native`](../hosts/web-components/src/behaviors/pending/native/PLACEHOLDER.md) | 共享/DOM | camera, canvas, cover-view, cover-image, input, keyboard-accessory, live-player, live-pusher, map, textarea, video, voip-room, web-view |
| [`wx-native-cover`](../hosts/web-components/src/behaviors/pending/native-cover/PLACEHOLDER.md) | 共享/DOM | cover-view, cover-image |
| [`wx-native-hover`](../hosts/web-components/src/behaviors/pending/native-hover/PLACEHOLDER.md) | 共享/DOM | cover-view |
| [`wx-player`](../hosts/web-components/src/behaviors/pending/player/PLACEHOLDER.md) | 媒体/原生 | audio, live-player, video |
| [`wx-request`](../hosts/web-components/src/behaviors/pending/request/PLACEHOLDER.md) | 宿主平台 | ad, ad-custom, official-account, video |
| [`wx-video-ad`](../hosts/web-components/src/behaviors/pending/video-ad/PLACEHOLDER.md) | 媒体/原生 | video-ad, video |
| [`wx-video-android`](../hosts/web-components/src/behaviors/pending/video-android/PLACEHOLDER.md) | 媒体/原生 | video |
| [`wx-video-devtools`](../hosts/web-components/src/behaviors/pending/video-devtools/PLACEHOLDER.md) | 媒体/原生 | video |
| [`wx-video-ios`](../hosts/web-components/src/behaviors/pending/video-ios/PLACEHOLDER.md) | 媒体/原生 | video |
| [`wx-video-mina`](../hosts/web-components/src/behaviors/pending/video-mina/PLACEHOLDER.md) | 媒体/原生 | video |

### 4.3 runtime / 插件 behaviors（7，已实现）

7 个 `wx://` 内置 behavior 在内核里各自独立成文件，通过 `resolveBuiltinBehavior` 合并进组件定义：

| 参考 behavior | 实现文件 |
| --- | --- |
| `wx://component-export` | [component-export.ts](../packages/runtime/src/component/behaviors/component-export.ts) |
| `wx://form-field` | [form-field.ts](../packages/runtime/src/component/behaviors/form-field.ts) |
| `wx://form-field-button` | [form-field-button.ts](../packages/runtime/src/component/behaviors/form-field-button.ts) |
| `wx://form-field-group` | [form-field-group.ts](../packages/runtime/src/component/behaviors/form-field-group.ts) |
| `wx://functional-page-behavior` | [functional-page-behavior.ts](../packages/runtime/src/component/behaviors/functional-page-behavior.ts) |
| `wx://label-target` | [label-target.ts](../packages/runtime/src/component/behaviors/label-target.ts) |
| `wx://style-filter` | [style-filter.ts](../packages/runtime/src/component/behaviors/style-filter.ts) |

### 4.4 明确不做（2）

| 参考 behavior | 原因 |
| --- | --- |
| `wx://request-filter` | 只用于微信原生媒体/`open-data` 的 URL 过滤；Tiny 不模拟该原生管线 |
| `wx://request-sender` | 与 `request-filter` 成对的消费端；声明时按未识别 `wx://` behavior 发 `UNSUPPORTED_BEHAVIOR` |

> 参考事实：2.33.0 里直接使用 `wx://request-filter` 的只有 `open-data`；直接使用 `wx://request-sender` 的有 `audio`、`image`、`video`、`web-view`、`video-ad` 共 7 个标签（`video` 有两套平台定义，`video-ad` 是内部组件）。这些组件的占位不再把这两个 behavior 列为 Tiny 目标。

## 5. 占位约定

### 5.1 目录

```text
hosts/web-components/src/components/<tag>/PLACEHOLDER.md          # 组件占位已全部删除（0）
hosts/web-components/src/behaviors/pending/<name>/PLACEHOLDER.md  # 11 个宿主 behavior 占位
```

7 个 runtime/插件 behavior 已落成 `packages/runtime/src/component/behaviors/` 下的独立模块；`wx://request-filter` / `wx://request-sender` 按基线不做。

### 5.2 构建行为

`build-templates.mjs` 和 `build-styles.mjs` 会枚举 `src/components/*` 并要求每个目录有
`template.wxml` / `index.css`。为了不把占位目录当组件，两个脚本都会跳过含
`PLACEHOLDER.md` 的目录；没有标记的目录仍然按原规则报缺失错误。

### 5.3 实现一个组件时

1. 按 `PLACEHOLDER.md` 的清单补 `template.wxml`、`index.css`、`index.ts`。
2. 在 `packages/manifest/src/builtin.ts` 加入标签，并在 `hosts/web-components/src/index.ts` 注册定义。
3. 删除 `PLACEHOLDER.md`。
4. 跑 `pnpm --filter @tiny/host-web-components build` 和 `pnpm accept:glass-easel`。

不要在实现前先把标签加进 `BUILTIN_COMPONENT_TAGS`：不支持的标签当前会降级成普通 DOM 并只发
`UNSUPPORTED_COMPONENT` warning，提前登记会制造一个“能挂载但没有行为”的空壳组件。

### 5.4 实现一个 behavior 时

- 宿主 behavior：落成 `src/behaviors/<camelCase>.ts`，在 `ids.ts` 注册 `tiny-*` id，由
  `createBuiltinBehaviors` 暴露，删掉 `pending/<name>/`。
- runtime behavior：在 `packages/runtime/src/component/behaviors/<name>.ts` 新建独立模块，
  返回 `BuiltinBehaviorSpec`，在 `index.ts` 的 `BUILTIN_BEHAVIOR_FACTORIES` 注册；复用
  `WECHAT_RUNTIME_COMPATIBILITY.behaviorScheme`，同步更新诊断与单测。**不要在内核里建空占位**。

## 6. 不在本次占位范围

| 元素 | 原因 |
| --- | --- |
| `action-sheet` / `action-sheet-cancel` / `action-sheet-item` | 平台内部 UI，已有 `wx.showActionSheet` 的宿主 overlay（[api-handlers.ts](../hosts/browser/src/api-handlers.ts:286)），不是用户标签 |
| `modal` / `toast` / `loading` / `mask` | 同上，走 `wx.showModal` / `showToast` / `showLoading` 的宿主 overlay |
| `video-ad` / `entry-banner` / `refresher` | 平台内部组件：广告、入口 banner、下拉刷新私有实现 |
| `trade-service` / `wecom-user-profile` / `cloud-storage-simple-component` | 交易、企业微信、云存储的开放能力内部组件 |
| `share-element` | 当前文档归入 Skyline，不在 WebView 41 目标内 |
| `share-button` / `contact-button` | 旧版开放能力标签，当前文档已不再作为 WebView 组件列出 |
| `xr-frame` | XR-FRAME 独立运行时，不在本仓库的 WebView 对齐范围 |

## 7. 维护

- 完成一个组件/behavior 后，先删占位标记，再更新本表；计数以第 1 节和第 3.1 节为准。
- 本表的 41 组件口径与 [wechat-webview-parity.md](./wechat-webview-parity.md) 附录 B 一致；如果目标版本升级，先改附录 B，再回来重算缺口。
- 重新提取参考数据（2.33.0）：在包目录里检索 `WAWebview.js` 的 `registerBehavior`、`is: "wx-..."` 和 webview 启用表；属性白名单在同一个文件的 `S = { ... }` 对象里。

## 8. 实施顺序

排序按“普通业务小程序的使用频率 + 依赖关系 + 浏览器宿主可落地性”，不是按文档分类顺序。

| 批次 | 优先级 | 组件 | 状态 |
| --- | --- | --- | --- |
| 1 | P0 基础内容/轻容器 | `rich-text`、`match-media`、`cover-view`、`cover-image` | ✅ 已完成 |
| 2 | P0 布局与浮层 | `page-container`、`root-portal`；`aria-component` 按文档页处理 | ✅ 已完成 |
| 2b | P1 手势/表单附件 | `movable-area`、`movable-view` | ✅ 已完成 |
| 3 | P1 页面与编辑 | `page-meta`、`navigation-bar`、`functional-page-navigator` | ✅ 已完成 |
| 4 | P2 布局补充 | `grid-view`（2.33.0 新增，aligned + masonry） | ✅ 已完成 |
| 5 | P2 媒体/原生 | `video`、`map`、`audio`、`web-view` | ✅ 已完成（媒体为浏览器近似） |

- **P0**：业务页面最常见、且纯 DOM 能给出可用近似；先做是因为它们能立刻改善真实页面的渲染成功率。
- **P1**：影响页面结构/交互（浮层、手势、键盘附件、页面配置）的组件，复杂度高于 P0，但仍是普通业务会直接使用的。
- **P2**：媒体和原生组件依赖宿主能力；浏览器只能做 `<video>`/`<iframe>`/canvas 近似，放到 P2 避免过早投入。
- **P3**：广告、公众号、小店等开放能力依赖微信平台账号/服务，浏览器宿主只能 stub 或诊断，优先级最低。
