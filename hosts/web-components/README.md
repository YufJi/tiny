# @tiny/host-web-components

Web/DOM implementations of the mini-program built-in tags for browser hosts.

This package lives outside `packages/*` on purpose. The runtime core only owns
mini-program semantics; the built-in component definitions below depend on a
DOM backend (`tiny-*` host nodes, attribute reflection, `classList`,
`getBackendElement`) and on web CSS, so they belong to the web host.

`@tiny/runtime` does **not** depend on this package. The DOM render tree lives
in `@tiny/host-web` and calls `createBuiltinComponents` from this package; this
package does not boot a thread, install page styles or own a `TreeRenderer`.

A native host can ignore this package entirely and provide its own views.

Glass-easel primitives are imported through `@tiny/runtime/glass-easel`; this
package declares `glass-easel` as a peer dependency rather than owning a second
version.

## Layout

```
src/
├── index.ts              # public factory, definition registry, web provider
├── tags.ts               # supported tag list (re-exported from @tiny/manifest)
├── types.ts              # contexts and option types
├── events.ts             # normalized event value helpers
├── styles.ts             # generated host + per-component internal styles
├── templates.ts          # resolves precompiled templates
├── generated/
│   ├── templates.js      # AUTO-GENERATED ProcGen module
│   └── templates.d.ts
└── components/
    ├── view/
    │   ├── template.wxml
    │   └── index.ts
    ├── input/
    ...
```

Each component owns its folder with `template.wxml` and `index.ts`. The
definition file receives a `BuiltinContext` and only declares properties,
lifetimes, observers, and methods; it never parses WXML.

### Placeholders

Unimplemented components and behaviors have `PLACEHOLDER.md` scaffolding:
`src/components/<tag>/PLACEHOLDER.md` and
`src/behaviors/pending/<behavior>/PLACEHOLDER.md`. The template/style build
scripts skip component folders carrying the marker, so a placeholder is never
registered as an empty built-in. Remove the marker when implementation starts.
The current gap list and counts live in
[docs/builtin-inventory-2.33.0.md](../../docs/builtin-inventory-2.33.0.md).

## Style boundary

The web host uses flat DOM plus scoped CSS rather than Shadow DOM. The full
model is documented in [docs/style-isolation.md](../../docs/style-isolation.md);
known selector pitfalls are tracked in
[docs/known-issues/builtin-style-selectors.md](../../docs/known-issues/builtin-style-selectors.md).

- `src/styles/index.css` contains public host/base rules. It is registered in
  the global scope, so `app.wxss`, page WXSS, and component WXSS can customize
  the real `tiny-*` host node through its tag, class, id, or attributes.
- Rules in `src/components/<tag>/index.css` are split at build time. Selectors
  starting with the component's `tiny-*` host tag remain public host rules; all
  other selectors become a private sheet scoped to `tiny-builtin-<tag>`.
  `build-templates.mjs` adds matching scope and tag-marker classes to that
  component's internal DOM.
- Mini-program app/page/component selectors therefore cannot directly match a
  built-in's private implementation nodes. Inherited properties, CSS custom
  properties, and explicit `externalClasses` still cross the boundary by
  design. For example, `input` and `textarea` expose `placeholder-class` as an
  external class instead of disabling isolation.

## Template compilation

`scripts/build-templates.mjs` runs before every package build (`prebuild`): it
reads all `components/*/template.wxml` files, injects internal scope markers,
compiles them with `@tiny/template-compiler`, and writes a static ProcGen module
to `src/generated/templates.js`. `scripts/build-styles.mjs` performs the
host/internal stylesheet split. Runtime startup therefore does **no** WXML
parsing or CSS transformation.

`src/generated/` is gitignored. `prebuild`, `pretypecheck`, and `pretest`
regenerate it automatically; run `pnpm --filter @tiny/host-web-components
templates` to refresh it manually after editing a `template.wxml`.

## Adding a component

1. Create `src/components/<tag>/template.wxml` and `index.ts`.
2. Add the tag to `src/tags.ts` (or `@tiny/manifest` if it is a shared
   compiler/runtime tag) and the factory map in `src/index.ts`.
3. Run `pnpm --filter @tiny/host-web-components build` to regenerate templates
   and styles.
4. Update the host wiring only if the new tag needs host-specific behavior;
   `@tiny/host-web` owns the render tree and installs the built-in styles it
   receives from this package.
