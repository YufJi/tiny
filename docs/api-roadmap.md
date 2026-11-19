# API 补齐路线（WeChat 3.17.5 / WebView）

> 本文是**计划**，不是完成度事实。完成度以 `pnpm api:coverage`（W0 落地）的输出和
> [wechat-webview-parity.md](./wechat-webview-parity.md) §3 为准，本文只回答“先补什么、为什么这个顺序”。
>
> 基线：微信 3.17.5 + WebView renderer + glass-easel。
> 目标宿主：浏览器（`hosts/web` + `tests/host`）与 iOS（`hosts/ios`）。

## 0. 范围（2026-11-19 定）

按微信文档的 22 个 API 分类归口，**排除 9 类**：聊天工具、转发、支付、数据分析、开放接口、AI、
第三方平台、Skyline、广告。唯一例外是开放接口里的 7 个身份 API（见下）。

| 分类 | 总数 | 已有 | 缺失 | 范围 |
| --- | ---: | ---: | ---: | --- |
| 设备 | 110 | 22 | 88 | ✅ |
| 开放接口（其余） | 68 | 0 | 68 | ❌ |
| 开放接口·身份 Mock | 7 | 7 | 0 | ✅ |
| 界面 | 58 | 28 | 30 | ✅ |
| 媒体 | 48 | 3 | 45 | ✅ |
| 基础 | 43 | 25 | 18 | ✅ |
| 支付 | 28 | 0 | 28 | ❌ |
| 路由 | 19 | 5 | 14 | ✅ |
| 转发 | 18 | 3 | 15 | ❌ |
| 网络 | 18 | 4 | 14 | ✅ |
| 数据缓存 | 14 | 10 | 4 | ✅ |
| 位置 | 13 | 0 | 13 | ✅ |
| AI | 9 | 0 | 9 | ❌ |
| 数据分析 | 9 | 1 | 8 | ❌ |
| 跳转 | 7 | 0 | 7 | ✅ |
| Skyline | 6 | 0 | 6 | ❌ |
| 第三方平台 | 5 | 0 | 5 | ❌ |
| 画布 | 5 | 1 | 4 | ✅ |
| 聊天工具 | 5 | 0 | 5 | ❌ |
| 文件 | 4 | 1 | 3 | ✅ |
| WXML | 2 | 2 | 0 | ✅ |
| 广告 | 2 | 0 | 2 | ❌ |
| Worker | 1 | 1 | 0 | ✅ |

- **在范围 349 个，排除 150 个**（30%）。分类按键名近似归口，W0 用官方文档目录逐条校正；
  WXML/界面的文档条目还包含类与组件属性，不在 499 个方法里。
- **排除的语义**：不投入实现；已有桩在 W0 改成诚实失败；缺失的名字保持 `undefined`；
  `canIUse` 一律 false；**评分分母建议改为 349**，与“内置组件剔除 Skyline 23 个”的既有口径一致。
- **例外：身份类 Mock（7 个）**。`login`/`checkSession`/`authorize`/`getSetting`/`openSetting`/
  `getUserProfile`/`getUserInfo` **不禁用**：调用形状、`errMsg` 和返回字段按微信，值由宿主提供（可配置、可替换），
  `canIUse` 在本宿主提供该能力时为 true。其余 68 个开放接口仍排除。
- **Mock 的边界**：只用于“值由宿主/后端决定”的语义，判断标准是——调用方拿到的是一个**数据对象**
  （登录 code、用户档案、授权结果），而不是“某个引擎动作已发生”的确认。数据可以 Mock，动作确认不行：
  `login` 返回 code 可以是 Mock，`pageScrollTo` 返回 ok 必须是真的滚了。

## 1. 结论

1. **面够了，语义不够。** 在范围内的 349 个名字里，表里已有 109 个（31%），但端到端可用（A）只有 51 个
   （另有 5 个宿主扩展）、半可用（B）16 个、纯桩（C）37 个——**语义覆盖 20.6%**，240 个名字缺失。
2. **最大的问题不是“缺”，是“假”。** 12 个 API 的 `canIUse` 返回 true 但调用后什么都不做；
   其中 3 个属排除分类、1 个随身份 Mock 转正，仍有 8 个要处理（`pageScrollTo`、导航栏三件套、
   主题/内存/截屏事件……）。
3. **官方 demo 在范围内的缺口是 61 个**（另 12 个落在排除分类）。这是唯一能“跑一遍就知道有没有退步”的短周期目标。
4. **iOS 是短板**：110 个表内 API 里 45 个依赖宿主 handler，其中 25 个在 iOS 上 `fail not implemented`
   （3 个属于排除分类）。新增 API 必须双宿主同时落地，否则 `canIUse` 在 iOS 上继续说谎。
5. **分数杠杆很小，必须整域推进。** API 权重 20%，在范围分母 349，每 10 个语义条目只值 **0.57 分**；
   把 61 个 demo 缺口全补上约 **+3.5 分**（61.1% → ~64.6%）。零散补单点对总分几乎不可见。
6. **C 层是计划盲区。** 37 个在范围内的可调用空壳既不在“缺失”里，也不在“假 true”里，
   很容易被漏掉——`createWorker` 就是这么漏的。W0 必须先给每个桩定归属。

## 2. 现状（2026-11-19 实测）

| 指标 | 数值 | 口径 |
| --- | ---: | --- |
| 微信 3.17.5 `wx.*` 名字 | 499 | 基础库内嵌 canIUse 矩阵的方法表 |
| 在范围 / 排除 | 349 / 150 | 按 §0 的分类 |
| tiny 表内名字（在范围） | 109 | 110 core + 5 扩展，扣掉 6 个排除分类 |
| 端到端可用 A / 半可用 B / 纯桩 C | 51 / 16 / 37 + 5 扩展 | 逐条分级由 W0 的 `api:coverage` 产出 |
| 缺失（在范围） | 240 | 设备 88、媒体 45、界面 30、基础 18、网络 14、路由 14、位置 13…… |
| 依赖宿主 handler 的 API | 45 | 其余 65 个是 service 侧逻辑 |
| iOS 返回 `fail not implemented` | 25 / 45 | 其中 3 个属于排除分类 |
| 官方 demo 调用到的唯一 API | 154 | `tests/apps/wechat-demo/**` 静态扫描 |
| 其中在范围且缺失的 | 61 | 另 12 个落在排除分类，5 个不是 3.17.5 名字 |
| 受影响的 demo 源文件 | 51 | 至少调用 1 个缺失名字 |
| `canIUse` 说 true 但无效果（在范围） | 8 | 见 §2.2 |

### 2.1 三个数字的含义

- **名字覆盖** 109/349 = 31%。只说明 `typeof wx.foo === 'function'` 成立，不代表能用。
- **语义覆盖** (A + B + 5 扩展)/349 = 20.6%。A 是有宿主 handler 且真的干活；B 是 handler 在但返回罐头数据。
- **demo 命中** 61 个缺口里，设备 31、媒体 10、网络 8、界面 3、位置 3、跳转 3、基础 2、画布 1。

### 2.2 必须先修的“假成功”（在范围）

| API | 现状 | 位置 |
| --- | --- | --- |
| `pageScrollTo` | 返回 ok，从不滚动 | `packages/api/src/navigation.ts:88` |
| `stopPullDownRefresh` | 返回 ok，没有可停的刷新 | `packages/api/src/navigation.ts:63` |
| `setNavigationBarColor` / `show`/`hideNavigationBarLoading` | 返回 ok，无 UI；hide 复用了 show 的 errMsg | `navigation.ts:73`、`:78`、`:83` |
| `createWorker` | Proxy 全 noop，`onMessage` 永不触发 | `compat-stubs.ts:40` |
| `onThemeChange` / `onMemoryWarning` / `onUserCaptureScreen` | 能注册，宿主没有发送方 | `global-events.ts:77`、`:85`、`:87` |

排除分类里的 3 个分享菜单 API 在 W0 改成诚实失败；`openSetting` 随身份 Mock 转成真行为（宿主回读授权记录）。

## 3. 排序模型

六个门，按顺序：

1. **范围门**：排除分类直接出局，不占任何波次的工期；只在 W0 登记“明确不支持”及原因。
2. **诚实门**：宁可不暴露，也不返回假 ok（[ADR-0027](./adr/0027-honest-compatibility-surface.md)）。
3. **杠杆门**：能解锁一整条链路的先做（临时文件 → 选图 → 上传 → 预览）。
4. **命中门**：官方 demo 已在调用的优先。
5. **双端门**：浏览器能跑、iOS 只能模拟或明确不支持的，不进同一批；进了就必须让 `canIUse` 反映。
6. **成本门**：TS handler 能解决的（fetch/File/Canvas/WebSocket/传感器）优先于需要新原生面的（蓝牙/NFC）。

## 4. 波次

三个阶段、九个波次（W0 前置）。每波是一条可演示的纵向链路，不是 API 名字的横切。

### P0：把“能用”补齐

#### W0 诚实与度量（S，1–2 PR，无新 API）

- **API catalog**：`name → { hostKey?, shape: plain|event|factory, stub?, excluded? }` 收成一份声明，
  `createApiHost`、`canIUse`、覆盖率报告都从这里读。150 个排除项也在表里，标 `excluded: true` + 原因。
- **`pnpm api:coverage`**：输出 名字/语义/demo 命中/iOS 对齐/假成功 五张表，分母用 349。
- **宿主能力上报**：宿主启动时声明实现了哪些 `api` handler key，`canIUse` 改为「表里有 ∩ 宿主真实现」。
  需要一篇 ADR 补 0027。
- **假成功清零**：§2.2 的 8 项；浏览器能做掉的直接做（`pageScrollTo`、`stopPullDownRefresh`）。
- **C 层 37 个桩逐个定归属**：能实现的挂到对应波次，不能实现的写清理由，多余的删除。
- **iOS 25 个缺口先“说真话”**：W0 只做能力上报与显式不支持声明，让 `canIUse` 在 iOS 上不再虚报。

DoD：`api:coverage` 进 CI；`canIUse` 与本宿主实际行为 0 差异；口径统一后回填 parity §3。

#### W1 快赢池：界面 / 基础 / 路由 / 跳转 / 身份（M，2 PR）

在范围缺失 240 个里，有约 55 个是“宿主事实或事件登记”级别的廉价项，一次清掉，demo 命中也跟着降。

- 界面：`setTopBarText`、`setBackgroundColor`、`setBackgroundTextStyle`、`hideHomeButton`、
  `setWindowSize`、`onWindowStateChange`/`off`、`onKeyDown`/`onKeyUp`/`off`、`getSelectedTextRange`、
  `enableAlertBeforeUnload`/`disable`、`checkIsPictureInPictureActive`、`setVisualEffectOnCapture`。
- 基础：`getEnterOptionsSync`、`getSystemInfoAsync`、`getSystemSetting`、`getAccountInfoSync`、
  `getUpdateManager`、`updateWeChatApp`、`getRandomValues`、`createBufferURL`/`revokeBufferURL`、
  `requestIdleCallback`/`cancelIdleCallback`、`getBackgroundFetchData`/`Token`/`setBackgroundFetchToken`。
- 身份 Mock（7 个）：`login`/`checkSession`/`authorize`/`getSetting`/`openSetting`/`getUserProfile`/
  `getUserInfo` 改走宿主 `identity.*` handler；code、profile、`authSetting` 由宿主提供且可配置，
  `authorize` 记账、`getSetting` 能回读，保证 demo 的 profile/授权流程走通。
- 路由/跳转：`onAppRoute`/`onBeforeAppRoute`/`onAfterPageLoad` 等 14 个事件；`navigateToMiniProgram`
  等 7 个跳转（浏览器诚实失败 + 宿主 hook，devtool/iOS 可接）。
- 设备里的廉价项：`makePhoneCall`（`tel:` 链接）、`addPhoneContact`/`addPhoneCalendar`（宿主能力，缺失则诚实失败）。
- 注意：`getUpdateManager`、`navigateToMiniProgram` 这类要按“形状对、行为诚实”实现，不能返回假 ok。

#### W2 本地媒体与画布（M，3–4 PR）

链路：**选图 → 临时文件 → 预览/保存 → 画布导出**。这是最高频的用户可见能力，也是 W3 上传的前置。

| API | 依赖 |
| --- | --- |
| `chooseImage` / `chooseMedia` / `chooseVideo` / `chooseMessageFile` | `<input type=file>` + **临时文件注册表**（host 拥有，service 只拿 `tempFilePath`） |
| `previewImage` / `previewMedia` | 宿主 overlay（已有 toast/modal 的先例） |
| `saveImageToPhotosAlbum` / `saveVideoToPhotosAlbum` | 临时文件 + 下载 |
| `getImageInfo` / `compressImage` | 临时文件 + 宿主解码 |
| `canvasToTempFilePath` / `canvasGetImageData` / `canvasPutImageData` / `createOffscreenCanvas` | 临时文件 + 现有 canvas handoff |
| `wx.createAnimation` 多 step 与时序 | service 侧动画队列 |

关键设计：临时文件路径必须是 **host 拥有的不透明句柄**，不能是 blob URL 或本地路径——
否则 `uploadFile`、`openDocument`、`saveFile` 各自会发明一套路径语义。

#### W3 网络（M，2–3 PR）

| API | 说明 |
| --- | --- |
| `uploadFile` / `downloadFile` | 接临时文件表；返回 `UploadTask`/`DownloadTask`（`onProgressUpdate`/`abort`） |
| `connectSocket` / `sendSocketMessage` / `closeSocket` + 4 个 `onSocket*` | 需要在 bridge 上加一条流式通道 |
| `request` 补全 | `abort()` 真正取消、`timeout`、`responseType: arraybuffer`、`onChunkReceived` |
| `getNetworkType` 升级 + `onNetworkWeakChange` | `navigator.connection`，没有就诚实失败 |

DoD：一个 fixture 页面完成「选图 → 上传 → 下载 → 预览」，浏览器跑通；iOS 由能力上报标注。

### P1：把“业务”补齐

#### W4 数据缓存与文件（M–L，2–3 PR）

- 数据缓存：持久化（浏览器 IndexedDB/localStorage，iOS UserDefaults 已有）、
  `batchGetStorage`/`batchSetStorage`（4 个）。
- 文件：`getFileSystemManager` 从 4 个 fail stub 变成真实现（`access/readFile/writeFile/appendFile/
  mkdir/readdir/stat/unlink/rmdir/rename/copyFile/saveFile/getFileInfo`）、`openDocument`、`saveFileToDisk`。
- 浏览器用 OPFS（降级 IndexedDB VFS），iOS 用沙盒目录；`tempFilePath`/`savedFilePath` 语义与 errMsg
  错误码按微信对齐。

#### W5 媒体采集与播放（L，4+ PR）

`createCameraContext`、`createVideoContext`、`createLivePlayerContext`/`PusherContext`、
`createInnerAudioContext`（真播放）、`getRecorderManager`、`createWebAudioContext`、
`scanCode`、`editImage`/`cropImage`、`saveMediaToPhotosAlbum`。这一波开始需要真实媒体元素与生命周期。

#### W6 位置与传感器（M，2 PR）

`getLocation`/`chooseLocation`/`openLocation` + 3 个定位事件；加速度计/罗盘/陀螺仪/设备运动 + 8 个事件
（走 `GlobalEventHub`）；`onKeyboardHeightChange`（`visualViewport`）；`getScreenBrightness`/`setKeepScreenOn`
的设备侧实现。浏览器不可用的（`getFuzzyLocation`、`choosePoi`）走诚实失败。

#### W7 Worker 与第三执行上下文（L，P1 末尾/P2 开头）

`createWorker` 现在是 Proxy 空壳，四层都断着：

| 层 | 现状 | 证据 |
| --- | --- | --- |
| 编译 | `app.json.workers` 没有进 manifest，`workers/**` 没有进产物 | demo 的 `workers/fib`、`workers/gaussianSplatting` 在 `generated/` 里不存在 |
| 宿主 | 浏览器只有 service/render 两个 realm，Worker 是第三个；iOS 需要第二个 `JSContext` | `hosts/web` 只有 iframe + MessagePort |
| API | Proxy 全 noop；worker 内该有的全局 `worker` 对象不存在 | `compat-stubs.ts:40` |
| 验收 | 只有 demo `packageAPI/pages/worker` 一页用，探针不看回包 | 125 页探针无 worker 断言 |

MVP 边界：`createWorker(path)` → `postMessage`/`onMessage`/`terminate`；worker 内提供全局 `worker`，
不提供 `wx.*`（与微信一致）；`require` 先只支持相对路径单文件；浏览器先做 Web Worker，iOS 后置；
`canIUse('createWorker')` 改由宿主能力上报决定。demo 两个入口都是零 `require` 的单文件，第一版不需要完整模块图。

### P2：把“平台”补齐

#### W8 设备深水区：蓝牙 / WiFi / NFC / Beacon（XL，按宿主分级）

在范围缺失 240 个里，设备占 88 个，是唯一的大块头：

| 域 | 数量 | 浏览器可行性 | 策略 |
| --- | ---: | --- | --- |
| 蓝牙 / BLE | 38 | Web Bluetooth 受限（无经典蓝牙、需用户手势） | 能做子集，其余诚实失败 |
| WiFi / NFC / HCE / iBeacon / 本地服务 | ~30 | 基本不可行 | 明确不支持 + `canIUse` false |
| 传感器 / 屏幕 | ~16 | 部分可做 | 已在 W6 覆盖，不重复排期 |

原则：**宁可 0 实现也不要假实现**。每个域产出一页“能力矩阵”，写清浏览器/iOS 各自行为。

## 5. 第一批 PR（建议）

1. **PR-1（W0）**：`packages/api/src/catalog.ts` + `scripts/api-coverage.mjs` + `pnpm api:coverage`，
   零行为变化；150 个排除项登记为 `excluded`。
2. **PR-2（W0）**：假成功清零 + `canIUse` 与实现对齐，测试断言“每个 non-stub API 至少有一个 handler key”。
3. **PR-3（W1）**：快赢池第一批（界面 + 基础，约 25 个）。
4. **PR-4（W2）**：临时文件注册表 + `chooseImage` + `previewImage` + `saveImageToPhotosAlbum`。

## 6. 回归与度量

- **`pnpm api:coverage`**：分母 349；输出 名字/语义/demo 命中/iOS 对齐/假成功；阈值只升不降。
- **demo 命中清零**：`tests/apps/wechat-demo` 静态扫描出的 61 个在范围缺口作为红榜。
- **双宿主门**：新 API 必须有浏览器 + iOS 两个 handler，或显式登记为“本宿主不支持”。
- **契约测试**：`apiName:ok` / `apiName:fail <reason>`、`success→complete` 顺序、Promise 与回调二选一。
- **C 层只减不增**：37 是当前基线，任何新增桩都要在 PR 里写明归属。
- **新增 fixture**：`tests/apps/api` 按域一页，覆盖“能成功”和“该失败”两条路径。

## 7. 不做什么

- **不对排除分类做任何实现**：包括“先放个 noop 占位”。150 个名字里缺少的继续保持 `undefined`，
  已有的桩改成诚实失败；需要时再解禁，不动架构。
- **不批量造假 stub**：`ADR-0027` 用 `undefined` + `UNSUPPORTED_API` 表达“没有”，
  批量 noop 会让 `typeof` 特性检测全部失效，比缺更糟。
- **不在 service 层造宿主能力**：文件、网络、媒体、权限都必须在 host handler 里。
- **不为分数补条目**：每个条目必须有一条能跑通的 fixture 路径。
- **不把 `worklet` 和 `createWorker` 混为一谈**：前者属 Skyline，保持 noop；后者是 WebView 能力，在 W7。

## 8. 风险

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| 身份 Mock 与真实后端不一致 | Mock 的 code/profile 换不到真 session，业务上线才发现 | 宿主可配置、devtool 可切换；文档与 `getAccountInfoSync` 明确标注“宿主 Mock” |
| 排除数据分析导致 demo 调用 `reportEvent` 抛错 | demo 部分页面的按钮失效 | 接受；demo 只作探针，不作业务验收 |
| 临时文件与持久文件路径语义混淆 | 上传/预览/保存互相不认账 | W2 定死 host 拥有句柄，W4 只做持久层 |
| iOS 宿主能力长期落后 | `canIUse` 在 iOS 上继续失真 | W0 的宿主能力上报作为硬门 |
| 分类归口靠键名近似 | 分母与优先级可能偏差 | W0 用官方文档目录校正，偏差超 5% 就重算 |
| WebSocket 走 bridge 的流式改造 | 影响 bridge 协议稳定性 | 单独 ADR，先做 `onChunkReceived` 验证通道 |
