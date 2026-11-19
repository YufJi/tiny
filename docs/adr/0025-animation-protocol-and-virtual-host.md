# ADR-0025: WeChat's animation protocol and logical `virtualHost` hosts

## Status

Accepted. Fixes P0-12 (`animation` was rewritten to CSS) and P0-11
(`virtualHost` components were invisible to render-side component binding).

## Context

Two view-layer contracts were still expressed as DOM rewrites:

- WeChat's `animation="{{actions}}"` is an object produced by
  `Animation.export()` (`{ actions: [{ animates, option }] }`). The WebView
  applies one action at a time with `wx.animationToStyle`, waits for
  `transitionend`, and continues. Tiny's CLI rewrote the attribute into a
  `style` string, while `createAnimation().export()` returned CSS text, so the
  standard object became `[object Object]`.
- `virtualHost: true` removes a component's host element from the view tree.
  The render definition honored it, but the render-side component binding walks
  the DOM to find component instances; a virtual host has no DOM element, so it
  was never matched, its data/ids were not routed, and event bindings on its tag
  were lost.

## Decision

1. `createAnimation()` records WeChat's action model: transform methods and
   `style` actions push animates, `step()` commits an action, `export()` returns
   `{ actions }` and clears the queue. `animationToStyle(action)` is the port of
   `wx.animationToStyle` (matrix/rotate/scale/translate/skew plus style fields,
   transition property list, 750-independent units: numbers become `deg`/`px`).
2. The template compiler serializes the `animation` attribute to
   `wx-tiny-animation` (`__tinyAnimation` helper); the CLI no longer merges it
   into `style`. The render host observes that attribute on the page frame
   subtree, runs the action sequence with CSS transitions, advances on
   `transitionend` (timer fallback for no-op transitions), and ignores legacy
   CSS-string values by appending them to the inline style.
3. The service logic tree keeps a **logical host** for `virtualHost` components
   (`virtualHost: false` in the service definition): WeChat removes the host
   from the view tree, not from the logic tree, and the host is where page
   bindings on the component tag attach. The render definition still receives
   `virtualHost: true`.
4. Render-side component binding detects virtual hosts from their shadow
   content's `ownerShadowRoot` (no backend element), inserts them into the
   positional component list, assigns their view ids/data, and attaches the
   flow node's event bindings to the component instance.

## Consequences

- `animation="{{data}}"` works with `wx.createAnimation()`/`Animation.export()`;
  `this.animate()` keeps its existing Web Animations path.
- The host-only animation attribute is not a public WXML attribute; the
  original `animation` attribute is never written to the DOM.
- A `virtualHost` component still has no DOM element, but its service id,
  data and tag event bindings behave like a normal component; custom events
  from it reach the page binding (verified by the `Virtual host` fixture).
- The logic tree's snapshot contains the logical component node, matching
  WeChat's logical tree; render-only consumers see the flattened DOM.
- Virtual-host detection starts from the component's first shadow node; a
  component whose template only forwards a slot without creating its own node
  has no anchor yet and remains a known edge case.
