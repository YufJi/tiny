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
- Demo navigation is served by the test host's `?path=` query for now.
- Local images referenced through dynamic WXML paths are not resolved yet.

## Run

```bash
pnpm compile:wechat-demo
pnpm --filter @tiny/cli exec vite --config ../../tests/host/vite.config.ts --port 5174
# http://127.0.0.1:5174/?path=page/component/index
```

The fixture is included in `pnpm accept:glass-easel` as the WeChat demo stage.

## License

The upstream demo is MIT licensed; see `LICENSE`.
