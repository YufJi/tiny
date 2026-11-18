# ADR-0023: Event `mark` and longpress tap suppression

## Status

Accepted. Fixes P0-7 (`mark:` never reached `event.mark`) and P0-8 (a slow tap
was always dropped).

## Context

WeChat has two event-contract capabilities Tiny did not carry through the split
tree:

- `mark:name="value"` marks an element; every event exposes the target's marks
  as `event.mark`, inherited from the target's ancestor chain with nearest wins
  (`WAWebview.js` property dispatch calls `e.setMark`, and the event object
  carries `mark`).
- `longpress`/`longtap` only consume the subsequent tap when the pressed element
  (or an ancestor) actually listens for a longpress. Tiny's recognizer always
  marked the gesture as long-pressed after 350 ms, so a slow tap on a plain
  `view` disappeared.

Tiny's template compiler already emitted `mark:` through glass's `R.m`
(`setMark`), and glass's event carries `mark`, but the render → service template
event payload dropped it. The render host also had no way to ask whether a
longpress listener exists, because pageframe elements are created by glass
template evaluation.

## Decision

1. `RenderTemplateEvent` carries `mark` (the glass event's collected marks).
   The service copies it onto the plain event object it builds for template
   handlers, defaulting to `{}` like WeChat.
2. The compiler emits `wx-tiny-longpress="1"` on any element with a
   `longpress`/`longtap` binding (the same marker pattern as
   `catchtouchmove`).
3. The gesture recognizer records the press target and asks
   `hasLongPressListener` at the 350 ms mark. Without a listener the gesture
   stays a tap candidate; with one it emits `longtap` then `longpress` and
   suppresses the later tap. The compositor answers the question by walking the
   DOM ancestor chain for the marker.
4. The recognizer's option is optional and defaults to `true` for standalone
   use; the browser compositor always supplies the marker check.

## Consequences

- `event.mark` works for page and component handlers, including marks on an
  inner view read by an ancestor binding.
- A slow tap on an element without a longpress listener now fires `tap`.
- Elements with a longpress listener emit both `longtap` and `longpress`; the
  order matches WeChat.
- The marker is an attribute on the rendered element; it is not part of the
  public WXML surface and does not appear in the service snapshot.
- The browser gate asserts mark inheritance and both longpress branches on the
  `Timing` page.
