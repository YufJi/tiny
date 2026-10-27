# WeUI example

Test fixture derived from
[didi/dimina `examples/miniprogram/weui`](https://github.com/didi/dimina/tree/main/examples/miniprogram/weui)
(Apache-2.0), which mirrors the official
[weui-miniprogram](https://github.com/wechat-miniprogram/weui-miniprogram)
example (MIT).

## Scope

- `example/` contains every WeUI demo page (buttons, forms, lists, feedback,
  navigation, ...) plus the index page.
- `style/weui.wxss` and `app.wxss` carry the WeUI stylesheet; the example uses
  no custom components, only the built-in tags.

## Adaptations for Tiny

None: the example compiles as-is (54 pages, 0 components) and renders through
the shared WXSS scoping and built-in tag implementations.

## Licenses

- Example sources: Apache-2.0, see the `didi/dimina` repository.
- WeUI styles and pages: MIT, see [LICENSE](./LICENSE).
