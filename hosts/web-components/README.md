# @tiny/host-web-components

Web/DOM implementations of the mini-program built-in tags for browser hosts.

This package lives outside `packages/*` on purpose. The runtime core only owns
mini-program semantics; the built-in component definitions below depend on a
DOM backend (`tiny-*` host nodes, attribute reflection, `classList`,
`getBackendElement`) and on web CSS, so they belong to the web host.

`@tiny/runtime` does **not** depend on this package. Browser hosts inject the
implementation at the render-thread boundary:

```ts
import { bootRenderThread } from '@tiny/runtime'
import { webBuiltinComponents } from '@tiny/host-web-components'

bootRenderThread({
  transport,
  manifest,
  backend,
  artifacts: { templates },
  builtinComponents: webBuiltinComponents,
  initialPath,
})
```

A native host can supply its own `BuiltinComponents` factory (or omit the
option) without pulling in web behavior or CSS.

## Layout

```
src/
├── index.ts              # public factory, definition registry, web provider
├── tags.ts               # supported tag list (re-exported from @tiny/manifest)
├── types.ts              # contexts and option types
├── events.ts             # normalized event value helpers
├── styles.ts             # base layout styles
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

## Template compilation

`scripts/build-templates.mjs` runs before every package build (`prebuild`):
it reads all `components/*/template.wxml` files, compiles them with
`@tiny/template-compiler`, and writes a static ProcGen module to
`src/generated/templates.js`. Runtime startup therefore does **no** WXML
parsing or code generation.

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
   the browser host already injects `webBuiltinComponents`.
