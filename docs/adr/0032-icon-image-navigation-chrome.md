# ADR-0032: Icon/image and navigation chrome baseline

## Status

Accepted. Fifth R4 asset-alignment slice.

## Context

The 3.17.5 simulator uses the **weuiv2** glyph font for `<icon>` and the
3.17.5 semantic colors (`#07c160` success/download/info-circle, `#fa5151`
warn/cancel, `#7f7f7f` search/clear). Tiny shipped the older `weui` font and
2.33 colors (`#09bb07`, `#f76260`, `#f43530`, `#b2b2b2`).

`<image>` uses the default `320×240` box, but aspect modes must preserve an
author's inline width/height. Tiny's `modeChanged` ran in `attached` before the
inline style was applied, captured empty originals, then cleared the host
style, so `style="width:120px;height:80px"` collapsed back to `320×240`.

`<navigation-bar>` and `<page-meta>` have no author CSS in WeChat; they are
page configuration nodes. Tiny already models the contract through page-root
datasets/CSS variables, so this slice only adds a fixture and locks that
contract.

## Decision

1. Embed the WeChat 3.17.5 `weuiv2` font in the built-in base stylesheet and
   use it for the icon glyph (`font: 14px/1 weuiv2`); update icon colors to
   the 3.17.5 values.
2. Capture the image host's original width/height in the `ready` lifetime
   (after the template applies inline styles), and only restore them when they
   are non-empty; aspect modes no longer clear author sizing.
3. Add a parity fixture page for all 15 icon types plus default/aspectFill/
   aspectFit/widthFix images, and assert the simulator host boxes (320×240,
   120×80, 120×80, 120×120).
4. Add a `page-meta` + `navigation-bar` demo page; the gate asserts the
   page-root `tinyNavigationTitle`/`tinyNavigationLoading` datasets, the
   `#112233` page background and the `#07c160`/`#ffffff` navbar CSS variables,
   then toggles loading.

## Consequences

- Icon glyphs and colors follow 3.17.5; the existing success-color gate is
  updated to `rgb(7,193,96)`.
- Images keep author inline sizes in every mode; the parity fixture measures
  the same boxes as the simulator.
- Navigation-bar/page-meta remain visually host-owned (the test host does not
  draw a native navigation bar), but their configuration contract is now
  covered by the gate. The picker modal is intentionally out of scope.
