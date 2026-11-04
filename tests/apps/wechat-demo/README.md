# WeChat miniprogram-demo fixture

Test fixture derived from the official
[wechat-miniprogram/miniprogram-demo](https://github.com/wechat-miniprogram/miniprogram-demo)
(MIT). It runs the official component/API example pages through the Tiny
compiler and browser host.

## Scope

- Four main pages: `page/component/index`, `page/API/index`, `page/extend/index`,
  `page/animation/index`.
- `packageComponent/` and `packageAPI/` subpackages: 125 pages in total.
- `miniprogram_npm/weui-miniprogram/` holds the pre-built WeUI component package
  that `useExtendedLib: { "weui": "latest" }` refers to. Tiny has no base
  library, so the package is vendored under `miniprogram_npm/`, the same way
  `tests/apps/vant` vendors `@vant/weapp`; see
  [miniprogram_npm/README.md](./miniprogram_npm/README.md).

## Adaptations for Tiny

- Theme variables in `app.json` (`@tabBarColor`, `@iconPathComponent`, ...) are
  replaced with their light values from `demo.theme.json`, because the engine
  does not resolve theme variables yet. `themeLocation` and `demo.theme.json`
  stay for source fidelity and are inert; `app-darkmode.json` is kept only as a
  palette reference.
- `app.wxss` inlines `page/common/lib/weui.wxss`. WeChat provides those global
  `weui-*` rules through `useExtendedLib.weui`; without the import the pages
  lose the WeUI variables and cell styles.
- `app.js` drops `global.isDemo` and guards the `require.async` call: neither
  `global` nor `require.async` exists in the browser service bundle.
- `util/util.js` exports its helpers as ESM names so the bundled service script
  can resolve `compareVersion`.

## Licenses

- Demo sources: MIT, see [LICENSE](./LICENSE).
- `miniprogram_npm/weui-miniprogram`: MIT, see
  [its LICENSE](./miniprogram_npm/weui-miniprogram/LICENSE).
