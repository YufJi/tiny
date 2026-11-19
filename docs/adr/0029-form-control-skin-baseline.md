# ADR-0029: Form control skin baseline (3.17.5 simulator)

## Status

Accepted. Second R4 asset-alignment slice.

## Context

Tiny's switch/checkbox/radio/slider used the 2.33-era greens
(`#04be02`, `#09bb07`, `#1aad19`). The 3.17.5 WebView simulator renders these
controls with the primary green `#07c160`.

Blindly copying `WAWebview.css` is not safe: the R4 button audit showed that
the stylesheet's button tokens (17px/184px/4px) do not match the simulator
(18px/14px/5px). The simulator is the authority for visual parity.

## Decision

1. Add `pages/form-controls/form-controls` to the WeChat parity fixture with
   basic/checked/disabled variants for switch, checkbox, radio and slider.
2. Measure the host boxes through `createSelectorQuery().fields({ size, rect,
   computedStyle })`; the simulator reports:
   - switch `57 × 32`
   - checkbox/radio `29 × 24.87` (22px control + label line box)
   - slider `315 × 18` at the 375pt viewport
3. Compare the rendered controls visually against the simulator screenshot and
   align the shared primary color to `#07c160` across switch, checkbox, radio
   and slider. 2.33 greens are removed.
4. Lock the tokens in the P0 acceptance: a Timing page renders one checked
   instance of each control and asserts the computed switch/track background,
   checkbox color and radio background are `rgb(7, 193, 96)`.

## Consequences

- Form controls now use the same green as WeChat 3.17.5; unchecked borders,
  disabled fills and control sizes were already aligned.
- `WAWebview.css` alone is not used as a skin oracle; each component needs a
  simulator screenshot/box comparison (the parity fixture page is the starting
  point for the remaining controls).
- The gate fails if a future change drifts from `#07c160` in any of the four
  controls.
