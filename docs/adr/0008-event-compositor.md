# ADR-0008: Event compositor at the render host

## Status

Accepted. Implemented for tap / longpress / canceltap / touch projections.

## Context

The render host had three event paths:

- every node registered its own DOM listener, with `tap` translated to `click`;
- glass-easel also synthesized its own `tap` from touch and mouse sequences;
- built-in components each grew their own `touch*` / `mouse*` / `pointer*`
  branches (`hover`, `touchtrack`, `picker-view-column`, `canvas`).

That split caused the reported mobile failures:

- `tap` rode on the browser's `click` compensation, which is dropped after a
  scroll, after `preventDefault()`, or when the DOM is rebuilt between
  `touchend` and `click`;
- the static event path ignored `binding.catch`, so `catchtap` did not stop
  bubbling;
- `longpress` had no producer for ordinary views;
- a `<label>` tap could produce two clicks and toggle a checkbox twice;
- the devtool (mouse) and a phone (touch) exercised different code paths.

## Decision

One compositor per render tree (`hosts/web-components/src/event-compositor`):

- input adapters normalize touch and mouse into one `InputEvent` stream
  (touch is primary, mouse is how the devtool simulates a finger);
- a single gesture recognizer produces `tap` (10px), `longpress` (350ms) and
  `canceltap` (drag past the threshold, extra fingers, `touchcancel`);
- mouse input is additionally projected into a `touchstart/move/end/cancel`
  sequence so `hover`, `touchtrack`, built-in templates and `bindtouch*` share
  the phone path in the devtool;
- recognized events are injected into the glass tree with
  `Event.triggerEvent`, so glass owns capture, bubble, `composed` and `catch`;
- glass's own `tap`/`canceltap` synthesis is filtered at `backend.onEvent`, so
  one finger yields one tap;
- the render tree stops registering per-node DOM listeners and stops mapping
  `tap` to `click`.

`catch` travels with the render protocol: `snapshotRenderTree` maps glass's
`Final`/`Mut` listener levels to `catch`/`mutated`, and the render listener
turns `catch` into `stopPropagation()` (and `preventDefault()` for the raw
event).

## Scroll locking

`catchtouchmove` cannot be enforced from the delegated listener: it stays
passive for scroll performance. Nodes that actually carry `catchtouchmove`
also get a node-level non-passive `touchmove` listener. It snapshots inner
scroll containers at `touchstart`, lets them keep scrolling until they reach
an edge, and only then calls `preventDefault()` — so a mask blocks the page
underneath without freezing a scroll-view inside it.

## Consequences

- `bindtap`, `bindlongpress`, `bindcanceltap`, `catchtap` and
  `capture-bind:tap` behave the same on a phone and in the devtool.
- A page binding never sees a raw `click`-derived tap, so scroll/drag gestures
  no longer swallow taps.
- Raw DOM projections are forwarded by allow-list: gestures, `touch*`, `click`,
  and `transitionend`/`animation*`/`wheel`. Semantic events such as `input`,
  `change` and `scroll` keep their component-emitted detail and are not
  duplicated.
- `longpress` is the canonical name; `<button>` keeps emitting `longtap` as a
  legacy alias from the same gesture.
- Built-in templates and `touchtrack` read touch lists through
  `touchListFromEvent`, which accepts normalized detail, projected extra
  fields, or a raw `TouchEvent`.
- Mini-program hover styling stays on `hover-class`; the CSS `:hover`
  pseudo-class is not emulated on touch. Event batching is left to the bridge
  (`batchedMessages`), and real-device coverage beyond Playwright's touch
  emulation is still pending.
