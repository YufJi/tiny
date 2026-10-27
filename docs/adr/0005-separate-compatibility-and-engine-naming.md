# ADR-0005: Separate compatibility input from Tiny engine naming

## Status

Accepted

## Context

The original `naming.prefix` configuration was used for both mini-program
compatibility syntax and engine-owned implementation names. Changing the source
API namespace or directive namespace also changed DOM host attributes, style
markers, behavior ids, and built-in component names. This coupled user-facing
input conventions to runtime internals and made custom platform conventions
partially supported.

## Decision

1. Mini-program input conventions live in `CompatibilityConfig`:
   - source/config file extensions and file names;
   - template directive namespace;
   - API namespace and aliases;
   - registration globals such as `App`, `Page`, and `Component`;
   - behavior URI scheme and legacy opaque globals.
2. WeChat conventions are the default compatibility preset. Core compilers
   receive explicit values and do not own platform defaults.
3. Manifest schema version 2 stores only `runtimeCompatibility`, the subset the
   runtime still needs. Extensions and template directives remain build-time
   concerns.
4. Engine-owned names are fixed in `TINY_ENGINE_NAMING`. This includes
   `tiny-page`, `tiny-<component>`, `tiny-scope`, `tiny-tag-*`, `tiny-builtin:*`,
   and internal behavior ids.
5. glass-easel 1.1.0 has no configuration for `wx-host` or `wx-style-scope`.
   The repository does not patch the dependency or rewrite DOM attributes at
   runtime; `TINY_ENGINE_NAMING.hostAttribute` and `.styleScopeAttribute`
   temporarily mirror those values. `hostNodeTagName` is still configured to
   `tiny-*` through the public `ComponentSpace` option. The exception and exit
   criteria are tracked in `docs/known-issues/glass-easel-naming.md`.

## Consequences

- A project can use WeChat syntax or custom file/directive/API conventions while
  component tags, scopes, markers, and engine internals continue to use Tiny
  names, except for the documented glass-easel attribute exception.
- Runtime and compiler APIs no longer expose `naming.prefix` or `scopePrefix`.
- Manifest consumers must migrate from schema version 1 `naming` to schema
  version 2 `runtimeCompatibility`.
- Tests must cover both default WeChat conventions and a fully custom input
  profile. Browser acceptance explicitly guards the temporary glass-easel
  attribute exception.
