# WeChat miniprogram-demo subset

Test fixture derived from
[wechat-miniprogram/miniprogram-demo](https://github.com/wechat-miniprogram/miniprogram-demo)
at commit `7189b9cdb2544df47769f62b356b04fdbcab2f55` (MIT).

## Scope

Only the **basic component** (`packageComponent`) and **API** (`packageAPI`)
example pages are included, 111 registered pages in total. Cloud, extend,
Skyline, XR, chat tools, ads, and other advanced demo packages are intentionally
omitted.

## Adaptations for Tiny

- `app.json` lists only the component/API index pages + the two subpackages;
  AR pages (`packageAPI/pages/ar`) and the AR category in the API index are
  excluded because they require unavailable native/npm dependencies. Chat-tool
  pages are not part of this upstream revision.
- `app.js` is reduced to the theme/global-data surface used by these pages; the
  cloud init, background-fetch bootstrap, and Skyline custom-route install are
  removed.
- `util/util.js` exports its legacy CommonJS object as ESM names so the service
  bundle can resolve `compareVersion`.
- `renderer` keys and the Skyline/XRFrame/custom-route branches in the index
  pages are removed; the two index pages keep their original layout.
- The Skyline-era layout WXSS (`common/common-skyline.wxss` and
  `page/common/index-skyline.wxss`) is kept: `common/reset.wxss` makes every
  tag a flex column like Skyline, so the index pages need those rules
  (`flex-direction: row`, centered logo, absolutely positioned chevrons) to
  render like the official demo.
- The official app loads WeUI through `useExtendedLib.weui`. The fixture inlines
  the bundled `page/common/lib/weui.wxss` from `app.wxss` instead, so pages that
  only use `weui-*` classes (radio, label, input, ...) get the same global
  styles as WeChat; without it `.weui-cell` is not a flex container.
- The component/API indexes use `wx.navigateTo` for local example links;
  direct pages can also be booted with the host `?path=` query.
- The upstream "分包改造" commit moved the API pages one directory deeper but
  left the shared `common/head.wxml` / `common/foot.wxml` imports one level
  short; the 88 affected pages point back at the root `common/` templates.
- `component/navigation-bar` tolerates `wx.getSystemInfo` results without a
  `system` field (Tiny's host snapshot has no `system`, so it renders the
  non-iOS branch).
- The canvas examples drop the `SDKVersion < 2.7.0` fallback (the Tiny runtime
  always takes the canvas node path), and the image example no longer resolves
  its WebP URL through cloud storage.
- Local images referenced through dynamic WXML paths resolve through the host
  `resolveAssetUrl` render hook, including the `resources/kind/{{id}}.png` icons.

## Run

```bash
pnpm compile:wechat-demo
pnpm --filter @tiny/cli exec vite --config ../../tests/host/vite.config.ts --port 5174
# http://127.0.0.1:5174/?path=page/component/index
```

The fixture is included in `pnpm accept:glass-easel` as the WeChat demo stage.

## License

The upstream demo is MIT licensed; see `LICENSE`.
