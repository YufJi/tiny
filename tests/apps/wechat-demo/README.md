# WeChat miniprogram-demo subset

Test fixture derived from
[wechat-miniprogram/miniprogram-demo](https://github.com/wechat-miniprogram/miniprogram-demo)
at commit `0fe5c7df8e90582dd0b89e283df7fe32e04413f9` (MIT).

## Scope

Only the **basic component** (`packageComponent`) and **API** (`packageAPI`)
example pages are included. Cloud, extend, Skyline, XR, chat tools, ads, and
other advanced demo packages are intentionally omitted.

## Adaptations for Tiny

- `app.json` lists only the component/API index pages + the two subpackages;
  AR pages (`packageAPI/pages/ar`) and chat-tool pages are excluded because
  they require unavailable native/npm dependencies.
- `app.js` is reduced to the theme/global-data surface used by these pages.
- `util/util.js` exports its legacy CommonJS object as ESM names so the service
  bundle can resolve `compareVersion`.
- Skyline-only pages (grid-view/sticky/page-container/match-media/root-portal),
  `renderer: skyline` config, and the Skyline course bar were removed.
- The Skyline-era layout WXSS (`common/common-skyline.wxss` and
  `page/common/index-skyline.wxss`) is kept: `common/reset.wxss` makes every
  tag a flex column like Skyline, so the index pages need those rules
  (`flex-direction: row`, centered logo, absolutely positioned chevrons) to
  render like the official demo.
- The component/API indexes use `wx.navigateTo` for local example links;
  direct pages can also be booted with the host `?path=` query.
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
