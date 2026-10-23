# @tiny/builtin-components

Glass-easel implementations of the mini-program built-in tags.

## Layout

```
src/
├── index.ts              # public factory + definition registry
├── tags.ts               # supported tag list
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

After editing a `template.wxml`, rebuild the package (or run
`pnpm --filter @tiny/builtin-components templates`) and commit the regenerated
`src/generated/templates.js`.

## Adding a component

1. Create `src/components/<tag>/template.wxml` and `index.ts`.
2. Add the tag to `src/tags.ts` and the factory map in `src/index.ts`.
3. Run `pnpm --filter @tiny/builtin-components build` to regenerate templates.
4. Add it to the runtime's built-in tag list if it is user-facing.
