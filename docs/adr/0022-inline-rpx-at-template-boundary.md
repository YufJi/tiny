# ADR-0022: Inline `rpx` is converted at the template boundary

## Status

Accepted. Fixes P0-5 (inline `rpx` dropped) and P0-6 (`convertRpx` mangling
`url()`/quoted strings).

## Context

WeChat's pageframe converts `rpx` in an element's `style` when it evaluates
WXML (`wx.transformRpx`), in addition to WXSS and WXS `setStyle`. Tiny only
converted WXSS and WXS `setStyle`: the template compiler emitted `style`
values verbatim, so `style="width:100rpx"`, `style="width:{{w}}rpx"` and
`style:width="{{w}}rpx"` reached the DOM as unknown units and the declaration
was dropped.

The shared converter was a global regular expression. It also rewrote numbers
inside `url(...)` paths and quoted strings (`url("/icon-10rpx.png")` became
`icon-1.33333vw.png`, `content:"100rpx"` became `"13.3333vw"`).

## Decision

1. `convertRpx` is a small tokenizer: it walks the CSS/decimal text, copies
   quoted strings, comments and `url(...)` payloads verbatim, and converts only
   real number tokens followed by the `rpx` unit. The 750 ratio and 6-digit
   rounding are unchanged.
2. The template compiler embeds that converter as `__tinyRpx` in the generated
   template runtime (its source is the function itself, so service and render
   evaluation use one implementation). Static style strings are converted at
   compile time.
3. `style` values are wrapped at every codegen point: the normal attribute
   (`R.y`), `style:prop` bindings (`R.w`), incremental binding-map updates
   (`R.wi`). The wrapper stringifies first, so a missing style expression is an
   empty value rather than a crash.
4. WXSS and WXS `setStyle` keep using the same converter; the tokenizer change
   also stops them from rewriting `url()`/quoted content.

## Consequences

- `tests/apps/demo/pages/timing` renders three inline styles (static,
  interpolated, `style:` binding) and the browser gate asserts each computed
  width equals `innerWidth / 7.5` and that a `url("/a-10rpx.png")` path is
  untouched.
- Every generated template bundle carries a ~2 KB helper (once per bundle, not
  per page).
- Selector text is still converted if a stylesheet parser hands a selector to
  `convertRpx`; callers pass declaration values and at-rule parameters, which is
  what the 750 conversion is defined for.
- Inline `rpx` now follows the same 750/vw contract as WXSS, so the logic tree
  snapshot and the rendered DOM agree.
