# ADR-0034: Cover, match-media and root-portal baseline

## Status

Accepted. Seventh R4 asset-alignment slice.

## Context

Simulator comparison of a cover/match/portal fixture found three gaps:

1. `cover-image`'s scoped stylesheet compiled to
   `:where(.tiny-builtin-cover-image--scope)#image`. The template's native
   `<img>` does not carry the scope class, so the rule never matched and the
   image rendered at its natural 160×160 instead of the 80×40 host box.
2. Tiny declared no author CSS for `match-media` (comment said WeChat has
   none), but WeChat 3.17.5 has `wx-match-media { display: block }`. The
   matched content therefore rendered as an inline 64px box instead of a
   full-width 351px block.
3. `root-portal` moves its content to `documentElement`, outside `<body>`.
   WeChat's WebView inherits the platform UI font there; Tiny inherited the
   browser's default `Times`, making the moved content's line box 18px instead
   of 22px. The 120px width and x=0 position already matched.

`cover-view` itself already matched (120×40, white text, block host).

## Decision

1. Give `cover-image` host `width/height: 100%` and set the template `<img>`'s
   display/width/height/object-fit inline, so sizing does not depend on the
   scoped id selector.
2. Add `tiny-match-media { display: block }`; the component keeps toggling
   inline `display: none` for hidden states.
3. Set the platform UI font stack on `html` and `body` in the built-in base
   styles, so root-portal content outside `<body>` inherits PingFang/system
   metrics.
4. Add cover-batch fixtures to the parity app and demo, and a gate step that
   asserts: cover-view 120×40, cover-image 80×40 with an 80px `<img>`,
   match-media block/full-width + hidden, portal content moved out of the host
   to a `TINY-ROOT-PORTAL-CONTENT` parent at x=0 with width 120.

## Consequences

- Cover images scale to their host box instead of their intrinsic size.
- Matched media content follows WeChat's block layout and full width.
- Portal content keeps the platform font outside the page; the remaining
  18px vs 22px line-box difference is font-engine metrics (PingFang vs the
  simulator renderer), not a layout rule.
