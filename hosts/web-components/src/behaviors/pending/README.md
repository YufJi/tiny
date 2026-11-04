# 待实现的宿主 behaviors

这里放 `@tiny/host-web-components` 还未实现、但 WAWebview 2.30.1 和后续组件会用到的
behavior 占位。每个目录只有一个 `PLACEHOLDER.md`，不会被 `src/index.ts` 或构建脚本加载。

完整口径、计数见 [内置组件与 behaviors 缺口清单](../../../../../docs/builtin-inventory-2.30.1.md)。

| 参考 behavior | 类别 | 参考使用方 | 占位 |
| --- | --- | --- | --- |
| `wx-autofill-provider` | 共享 | form | [autofill-provider](./autofill-provider/PLACEHOLDER.md) |
| `wx-cloud` | 平台 | cover-image, editor, image, live-player, map, video | [cloud](./cloud/PLACEHOLDER.md) |
| `wx-html-parse` | 共享 | editor, rich-text | [html-parse](./html-parse/PLACEHOLDER.md) |
| `wx-image-route` | 共享 | map | [image-route](./image-route/PLACEHOLDER.md) |
| `wx-keyboard-accessory-host` | 共享 | input, textarea | [keyboard-accessory-host](./keyboard-accessory-host/PLACEHOLDER.md) |
| `wx-mask-behavior` | 共享 | toast, action-sheet, modal | [mask-behavior](./mask-behavior/PLACEHOLDER.md) |
| `wx-native` | 共享 | camera, canvas, cover-view, cover-image, input, keyboard-accessory, live-player, live-pusher, map, textarea, video, voip-room, web-view | [native](./native/PLACEHOLDER.md) |
| `wx-native-cover` | 共享 | cover-view, cover-image | [native-cover](./native-cover/PLACEHOLDER.md) |
| `wx-native-hover` | 共享 | cover-view | [native-hover](./native-hover/PLACEHOLDER.md) |
| `wx-player` | 媒体 | audio, live-player, video | [player](./player/PLACEHOLDER.md) |
| `wx-quill-core` | 共享 | editor | [quill-core](./quill-core/PLACEHOLDER.md) |
| `wx-request` | 平台 | ad, ad-custom, official-account, video | [request](./request/PLACEHOLDER.md) |
| `wx-video-ad` | 媒体 | video-ad, video | [video-ad](./video-ad/PLACEHOLDER.md) |
| `wx-video-android` | 媒体 | video | [video-android](./video-android/PLACEHOLDER.md) |
| `wx-video-devtools` | 媒体 | video | [video-devtools](./video-devtools/PLACEHOLDER.md) |
| `wx-video-ios` | 媒体 | video | [video-ios](./video-ios/PLACEHOLDER.md) |
| `wx-video-mina` | 媒体 | video | [video-mina](./video-mina/PLACEHOLDER.md) |

## 约定

- 参考 id 是 `wx-...`；Tiny 宿主 behavior id 统一用 `tiny-...`（见 `src/behaviors/ids.ts`）。
- 行为实现后，把目录内容提升为 `src/behaviors/<camelCase>.ts`，接入
  `src/behaviors/index.ts`，再删除对应 `PLACEHOLDER.md`。
- `wx-native*`、`wx-player` 依赖原生/宿主能力，不要在纯 DOM 里伪装成功。
- `wx-positioning-container` / `wx-positioning-target` 已按 web 语义实现，见 `src/behaviors/positioningContainer.ts`、`positioningTarget.ts`。
