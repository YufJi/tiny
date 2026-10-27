# glass-easel naming compatibility

## Status

Open temporary exception.

## Problem

`glass-easel@1.1.0` hard-codes three attributes/names inside the package:

- component host attribute: `wx-host`
- style scope attribute: `wx-style-scope`
- default `hostNodeTagName`: `wx-x`

`hostNodeTagName` is configurable through `ComponentSpace.updateComponentOptions`,
but there is no public option for the two DOM attributes.

## Current Tiny behavior

Tiny intentionally does not patch glass-easel and does not observe or rewrite DOM
attributes at runtime. Until glass-easel exposes a supported configuration path:

- component host tags still use `tiny-page`, `tiny-add-button`, etc.;
- `TINY_ENGINE_NAMING.hostAttribute` and `.styleScopeAttribute` temporarily
  mirror glass-easel's `wx-host` and `wx-style-scope` values;
- compiler-generated `:host` and page-scope anchors use `wx-host`;
- browser acceptance explicitly asserts this temporary exception.

## Follow-up options

1. Upstream configurable host/style-scope attribute names.
2. A glass-easel release with Tiny-compatible defaults.
3. If a patch becomes unavoidable, keep it small, documented, and covered by a
   reproducibility gate.

## Definition of done

- Switch `TINY_ENGINE_NAMING.hostAttribute` and `.styleScopeAttribute` to Tiny names.
- Emit and inspect `tiny-host` / `tiny-style-scope` end to end.
- Keep runtime free of DOM attribute observers and post-render rewrites.
- Update browser acceptance to require Tiny names exclusively.
