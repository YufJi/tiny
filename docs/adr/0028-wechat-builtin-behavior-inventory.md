# ADR-0028: The 3.17.5 built-in behavior inventory

## Status

Accepted. First R4 asset-alignment slice.

## Context

Tiny registered five WeChat `wx://` behaviors plus its own `wx://style-filter`
marker. WeChat 3.17.5 (`WAWebview.js` `PM(...)` registrations) has nine:

`form-field`, `form-field-group`, `form-field-button`, `label-target`,
`proxy-swiper`, `proxy-swiper-item`, `proxy-scroll-view`, `component-export`,
`translate`.

`proxy-swiper` / `proxy-swiper-item` / `proxy-scroll-view` are declared by the
built-in swiper/scroll-view components, and `translate` by the i18n layer.
Third-party code can check them through `hasBehavior`, and built-ins may list
them in `behaviors`.

The R4 review also claimed the button skin should be 17px / 184px / `#07c160`
based on `WAWebview.css`. A direct `parity:wechat:button` comparison against
the 3.17.5 simulator (44 combinations) showed the simulator actually uses
18px / 14px horizontal padding / 5px radius / `#f8f8f8` — the existing Tiny
skin — so the CSS file alone is not the authoritative skin source.

## Decision

1. Register all nine 3.17.5 ids. The four new ones are marker-only factories;
   no properties/methods/data/listeners are injected.
2. Keep `wx://style-filter` registered but document it as a Tiny extension, not
   part of WeChat 3.17.5.
3. Keep the existing button skin; use the simulator parity matrix as the
   authority for visual tokens. Update the parity docs accordingly.

## Consequences

- `Component({ behaviors: ['wx://proxy-swiper'] })` no longer falls into
  `UNSUPPORTED_BEHAVIOR`; `hasBehavior` agrees on both threads.
- The service and render registries expose the same ten ids (nine WeChat +
  style-filter).
- Built-in component internals can declare the proxy behaviors without a
  diagnostic.
- R4's remaining work is the component skin audit against the simulator, not
  against `WAWebview.css` alone; button is already at 1:1.
