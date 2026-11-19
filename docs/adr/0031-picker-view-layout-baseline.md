# ADR-0031: Picker-view layout baseline

## Status

Accepted. Fourth R4 asset-alignment slice.

## Context

`picker` itself renders only its slot; opening the wheel is a host request
(the devtool host owns that modal). `picker-view` / `picker-view-column` are
the inline WebView components and must render the wheel themselves.

The 3.17.5 simulator shows a 200px picker-view with five 34px rows, the
selected row centered at 100px, and the fade/indicator around the middle
34px window.

Tiny's DOM had two defects:

1. `tiny-picker-view .tiny-picker-view-wrapper` had no height, so every
   `picker-view-column` resolved `height: 100%` against a 0px wrapper and the
   whole wheel collapsed to 0px;
2. `_getPickerHeight()` was evaluated in `attached` before the host's inline
   height was laid out, cached 0, and `_setHeight` then produced
   `content padding: 0`, `mask background-size: 0`, `indicator top: 0`.

The result was an empty 200px box in Tiny while WeChat showed the wheel.

## Decision

1. Give the flex wrapper `height: 100%` so columns inherit the host height.
2. Keep the cached picker height only once it is non-zero, and retry
   `_initColumns` (16ms, bounded) until layout reports a real height. Seed each
   column's current/translate immediately so headless hosts and the first
   render still have the right value.
3. Add `pages/picker-view` to the WeChat parity fixture (two columns, selected
   value `[1, 2]`) and compare its screenshot/host layout with the simulator.
4. Lock the layout in the gate: host/column height 200, content padding and
   indicator top 83 (the `(200 - 34) / 2` window), 34px item height, and the
   selected row centered at 100px.

## Consequences

- Picker-view wheels render in the browser host, with the selected row centered
  and the mask/indicator using the item window; scrolling still goes through
  the existing touchtrack/transform column logic.
- EmptyBackend unit tests continue to seed `current`/`translate` even when no
  layout height exists; the style pass repeats once a real height is available.
- The picker modal itself remains host-owned (devtool `hostPicker`) and is not
  part of this skin baseline.
