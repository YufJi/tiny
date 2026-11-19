# ADR-0030: Input/textarea baseline (3.17.5 simulator)

## Status

Accepted. Third R4 asset-alignment slice.

## Context

The 3.17.5 simulator measures the default hosts as:

- input: `351 × 22.39` at a 375pt viewport (`height/min-height: 1.4rem`),
  `content-box`, `overflow: hidden`, `white-space: nowrap`;
- textarea: `300 × 150`, `content-box`, `overflow: hidden`,
  `position: relative`;
- `auto-height` textarea: `20px` for one line (16px × 1.25), not a 1.4em floor.

Tiny's input already matched those host tokens. Textarea differed in three
observable ways:

1. the host did not set `overflow: hidden`;
2. the auto-height floor was `1.4em` (22.4px) and the native `<textarea>`
   defaulted to two rows, so a one-line auto-height field measured 32px;
3. the native `<textarea>` displays its **value property**, but the template
   only bound a `value` attribute, so initial/programmatic values rendered
   empty.

## Decision

1. Add input/textarea variants (placeholder, value, password, disabled,
   `placeholder-style`, textarea value/auto-height/disabled) to the WeChat
   parity fixture (`pages/inputs`), and capture simulator host boxes and a
   screenshot.
2. Set `overflow: hidden` on the textarea host, make `auto-height` use a
   `1.25em` floor, and add `rows="1"` to the native textarea so the measured
   scroll height is one line.
3. Sync `textarea.value` from the component data in the DOM host
   (`syncKeyboardValue`, also called from `ready()`); the attribute binding
   remains for template identity, but the property is what renders.
4. Lock the baseline in the gate: input height/overflow/value, textarea
   `300 × 150`/hidden overflow/native value, a 20px auto-height row, and the
   `#999999` placeholder color.

## Consequences

- Textarea values (initial, `setData`, form reset) now render in the WebView
  host; the native-host path already owned its value layer and is unchanged.
- Auto-height textareas start at one line (20px) and grow from the native
  scroll height.
- Input and textarea host boxes match the simulator; keyboard/native-overlay
  behavior remains covered by the existing host-keyboard tests.
- The parity fixture `pages/inputs` is the starting point for the next
  visual regression matrix.
