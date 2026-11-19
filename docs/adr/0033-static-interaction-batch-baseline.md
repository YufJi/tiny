# ADR-0033: Progress, rich-text, movable-view, swiper and page-container

## Status

Accepted. Sixth R4 verification slice.

## Context

These five components already carried WeChat-shaped CSS/behavior, so the R4
question was whether they actually render like the 3.17.5 simulator:

- progress: 30% bar with `show-info`, 6px stroke;
- rich-text: node tree with inline color and `<b>` child;
- movable-view: 40×40 box inside a 200×120 area at `x=30, y=20`;
- swiper: 100px, three items, current index 1, dots;
- page-container: bottom `round` panel with overlay.

## Decision

Add parity fixtures under `tests/apps/wechat-parity/pages/visual-batch` and
`pages/container`, compare them with the simulator screenshot, and lock the
observable values in the P0 gate with a dedicated demo page:

- progress bar ratio 0.3, info `30%`;
- rich-text text `Rich text` and `#07c160` inline color;
- movable-view `matrix(1, 0, 0, 1, 30, 20)`;
- swiper height 100, three dots, active dot index 1;
- page-container overlay `rgba(0,0,0,0.7)` fixed, popup width 375 with a 20px
  top radius and bottom flush with the viewport.

No component code changed for this batch: the simulator comparison showed the
existing CSS/behavior already match. The fixtures and gate assertions are the
regression lock.

## Consequences

- New regressions in these five components fail the gate with a specific
  assertion instead of relying on screenshots.
- The parity fixture pages remain available for the next skin matrix.
- `rich-text` parsing/behavior was not changed; only its rendered output is
  asserted.
