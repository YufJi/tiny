# Consuming migrated compiler output with glass-easel

Researched against local `packages/template-compiler` and `packages/stylesheet-compiler`, and official glass-easel source at commit [`c1b32d58ec459f26881edf4a7f67de85adb7e22c`](https://github.com/wechat-miniprogram/glass-easel/tree/c1b32d58ec459f26881edf4a7f67de85adb7e22c). Citations below prefer the source that owns the API contract.

## Summary

- `TmplGroup.getTmplGenObjectGroups()` emits a JavaScript expression that evaluates to a `ProcGenGroupList`: a path-indexed object whose values are template-group functions.
- A glass-easel component consumes `{ groupList, content }`; `content` is the same group function for the component path. `addCompiledTemplate(path, content)` registers that object in the mini-program adapter.
- The compiled root function is glass-easel's `ProcGen`: it receives the wrapper, creation/update flag, data, update-path tree, and existing binding-map list, and returns `{ C, B? }`.
- `StyleSheetTransformer` is a build-time CSS transformer. Its outputs are normal/low-priority CSS strings, source-map JSON strings, and warning objects; glass-easel backends receive registered CSS content, not a structured stylesheet AST.
- No runtime adapter is required once template output is byte/semantically compatible with the official compiler. The current local template generator needs a compiler-level compatibility fix: it emits `R,C,D,U` while the official/runtime contract is `R,C,D,U,A`, and it creates rather than reuses the binding-map object on update.
- Stylesheets need only build glue. For full official webpack-plugin compatibility, the local `StyleSheetTransformer` should also accept the sixth `tagNamePrefix` argument or expose it in options; otherwise calls using the official six-argument constructor silently ignore it.

## Template compiler data shape

Local `TmplGroup.getTmplGenObject(path)` returns an IIFE expression for one template. `getTmplGenObjectGroups()` wraps all templates in one IIFE that initializes `G = {}`, assigns each compiled path to `G[path]`, and returns `G`; `getWxGenObjectGroups()` instead emits `__wxCodeSpace__.addCompiledTemplate(path, { groupList: G, content: G[path] = ... })` for every path. Runtime helpers and registered WXS are included inside the grouped IIFE when generated that way. See local implementation at `packages/template-compiler/src/group.ts:245` and `packages/template-compiler/src/group.ts:271`.

After evaluating the grouped expression, the object shape is:

```ts
type ProcGen = (R: ProcGenWrapper, C: boolean, D: DataValue, U?: UpdatePathTreeNode, A?: BindingMapGenList) => {
  C: DefineChildren
  B?: BindingMapGenList
}

type ProcGenGroup = (name: string) => ProcGen
type ProcGenGroupList = { [componentPathWithoutWxmlSuffix: string]: ProcGenGroup }
type ComponentTemplate = {
  groupList?: ProcGenGroupList
  content: (name: string) => ProcGen
  updateMode?: string
  fallbackListenerOnNativeNode?: boolean
  procGenWrapperType?: typeof ProcGenWrapper
}
```

The official type definitions declare exactly these `ProcGenGroup`, `ProcGenGroupList`, and `ComponentTemplate` types; `GlassEaselTemplate.updateTemplate` reads `content('')`, `groupList`, `updateMode`, and `fallbackListenerOnNativeNode` ([official `src/tmpl/index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/tmpl/index.ts#L31-L107)). Local `templateToProcGen` closes over `H`, builds named sub-template functions plus the `''` main template, and returns `Object.assign(function(R) { return H[R] }, { _: H })` (`packages/template-compiler/src/proc_gen/tag.ts:27`).

The mini-program adapter's `CodeSpace.addCompiledTemplate(path, content)` stores a `glassEasel.template.ComponentTemplate` and explicitly documents that paths omit `.wxml` ([official `glass-easel-miniprogram-adapter/src/space.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/space.ts#L235-L248)). The official webpack plugin wires the same contract: it emits `{ groupList: index.genObjectGroups, content: index.genObjectGroups[wxmlPath] }` and assigns `exports.genObjectGroups = tmplGroup.getTmplGenObjectGroups()` ([official plugin `index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/index.ts#L540-L596)). Official guides use `new Function('return ' + source)()` and either set `content: groupList['']` or copy the shared `groupList` into each component template ([quick-start guide](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/guide/zh_CN/basic/bootstrap.md#L258-L280), [template-import guide](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/guide/zh_CN/interaction/template_import.md#L27-L57)).

### Runtime objects and functions

`ProcGen` is the callable consumed by `ProcGenWrapper.create/update`:

- Creation call: `procGen(wrapper, true, data)`.
- Update call: `procGen(wrapper, false, data, dataUpdatePathTree, oldBindingMapGen)`.
- It returns a `DefineChildren` in `C` and an optional binding-map list in `B`.

These signatures and callbacks are defined in the official `ProcGen`, `BindingMapGen`, and `DefineChildren` types ([official `proc_gen_wrapper.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/tmpl/proc_gen_wrapper.ts#L90-L152)). `create` passes three arguments; `update` passes the old binding-map list as the fifth argument ([official `proc_gen_wrapper.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/tmpl/proc_gen_wrapper.ts#L160-L181)).

The generated function body uses wrapper shortcuts:

| Generated variable | Runtime source | Purpose |
| --- | --- | --- |
| `R` | `ProcGenWrapper` | supplies `c`, `m`, `r`, attribute setters, dev args, filters, and event wrappers |
| `C` | `isCreation` | creation vs update mode |
| `D` | current data | initial and reused data value |
| `U` | update-path tree | tells bindings which data paths changed |
| `A` | previous `BindingMapGenList` | reuses generated binding-map arrays on update |

The official compiler emits `R,C,D,U,A` and `A=A||{...}` before returning `{C,B:A}` ([official template compiler `proc_gen/tag.rs`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-template-compiler/src/proc_gen/tag.rs#L55-L140)). The local compiler emits only `R,C,D,U`, always initializes `A` from the current binding-map collector, and returns that fresh `A` (`packages/template-compiler/src/proc_gen/tag.ts:103`). That is the key incompatibility. It may still create/update in many cases, but it does not satisfy the documented binding-map reuse/update path.

The runtime string defines `X`, `Y`, `Z`, `P`, and `Q`; `Q` contains `a` and `b`, plus `A` and `B` and the WXS loader only when scripts are present. Local and official implementations match this behavior (`packages/template-compiler/src/group.ts:14`, [official `group.rs`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-template-compiler/src/group.rs#L48-L148)). `TmplGroup.getRuntimeVarList()` must return `['X','Y','Z','P','Q']`; official tests treat the grouped string as the complete executable scope and pass `groupList`/`content` directly to glass-easel ([official `glass-easel/tests/base/env.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/tests/base/env.ts#L86-L122)).

## Stylesheet compiler data shape

`StyleSheetTransformer` does not emit a glass-easel runtime object. Local accessors return plain strings and arrays:

- `getContent(): string` — normal-priority CSS.
- `getSourceMap(): string` — JSON source-map string.
- `getLowPriorityContent(): string` — CSS extracted for converted `:host` rules.
- `getLowPrioritySourceMap(): string` — corresponding JSON source map.
- `extractWarnings(): StyleSheetParseError[]`.

These accessors are implemented at `packages/stylesheet-compiler/src/transformer.ts:264`. The public warning shape is declared in `packages/stylesheet-compiler/src/types.ts:34`.

The official WASM binding precomputes the same four string outputs in its constructor and exposes `getContent`, `getSourceMap`, `getLowPriorityContent`, and `getLowPrioritySourceMap` ([official `js_bindings.rs`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-stylesheet-compiler/src/js_bindings.rs#L51-L123)). The official loader invokes `setLowPriorityStyles(content, map)`, emits warnings, and returns `getContent()` plus `JSON.parse(getSourceMap())` to webpack ([official `wxss_loader.js`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/wxss_loader.js#L5-L51)).

At runtime, the mini-program webpack plugin registers the emitted module content with `backend.registerStyleSheetContent(path, css)` and calls `codeSpace.addStyleSheet(path, path, scopeName)` per component. Low-priority styles are aggregated into a virtual host-style module and registered as `app` CSS ([official plugin `index.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-webpack-plugin/index.ts#L89-L180)). The backend protocol defines CSS content as `unknown`, but DOM-like backends convert it to a string; stylesheet registration and insertion are keyed by path and an optional numeric style scope ([official backend protocol](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/backend_protocol.ts#L73-L88)). The current-window backend stores registered content as `String(content)` ([official backend implementation](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel/src/backend/current_window_backend_context.ts#L83-L103)).

The adapter tracks style-sheet URLs and style scope names separately from compiled templates in `CodeSpace.addStyleSheet(path, styleSheetUrl, styleScopeName)` ([official adapter `space.ts`](https://github.com/wechat-miniprogram/glass-easel/blob/c1b32d58ec459f26881edf4a7f67de85adb7e22c/glass-easel-miniprogram-adapter/src/space.ts#L188-L203)). Therefore compiler output must be paired with the same component path and scope/prefix decision at build time.

## Is a thin adapter required?

### Templates

No adapter should be needed at the glass-easel boundary if the migrated compiler is contract-compatible. The recommended flow is exactly the official loader/adapter flow:

1. Create a `TmplGroup`.
2. Add every template and WXS path in one group.
3. Evaluate `getTmplGenObjectGroups()` in one scope.
4. Build `{ groupList, content: groupList[path] }` without suffixing paths with `.wxml`.
5. Register that object with `addCompiledTemplate` or pass it directly to `.template(...)`.

A loader that constructs `ComponentTemplate` objects is build glue, not a runtime adapter. A semantic wrapper around the generated `ProcGen` is not recommended because it cannot cleanly restore the missing fifth-argument contract. The local generator should instead be updated to emit `R,C,D,U,A`, initialize with `A = A || {...}`, and return the same `A` on update.

The official adapter constructor currently accepts a sixth `tagNamePrefix` argument. The local stylesheet compiler omits that parameter, so either add `tag_name_prefix` support to the compiler or provide a small build-side compatibility wrapper if consumers must remain source-compatible with the official signature. This is not a glass-easel runtime adapter.

### Stylesheets

No adapter is required for glass-easel itself. A small bundler/adapter layer may convert compiler output to `{ css, map }`, combine low-priority CSS, manage class prefixes and scope names, and call `registerStyleSheetContent`/`addStyleSheet`. That layer already exists in the official webpack plugin and can be mirrored locally.

## Consistency gates before further compiler changes

Every template change should pass all of the following. They should run on the same fixture corpus as the official compiler and the target glass-easel version, in both production and dev modes.

1. **Expression/shape gate.** `new Function('return ' + group.getTmplGenObjectGroups())()` evaluates without error and returns a path-keyed object. Every expected path is present; paths have no `.wxml` suffix; every value is callable; calling each value with a name returns a `ProcGen`.
2. **Component-template gate.** For every path, `{ groupList, content: groupList[path] }` is accepted by `addCompiledTemplate(path, template)` and `.template(...)`. Cross-component templates share the same `groupList` object.
3. **ProcGen signature gate.** The generated root/sub-template function has five parameters (`R,C,D,U,A`). Calling with `(wrapper, true, data)` returns `{ C, B }`; calling with `(wrapper, false, data, updatePathTree, oldB)` returns `B === oldB` when `oldB` is already initialized.
4. **Binding-map gate.** The `B` keys and generated updaters are identical to the official compiler's binding map. End-to-end creation, single-field updates, array splices, `wx:if`, `wx:for`, slots, and dynamic attributes produce the same backend node list, text values, classes, styles, and attributes as the official compiler.
5. **Template semantics gate.** Include, import, named templates, dynamic `<template is>`, WXS dependencies, and inline WXS render identically to official output. Paths resolved relative to the containing template are identical.
6. **Runtime/WXS gate.** `TmplGroup.getRuntimeVarList()` equals `['X','Y','Z','P','Q']`. For script-bearing groups, generated scope contains `A`, `B`, and `D`; for non-script groups it does not. `getWxGenObjectGroups` invokes `__wxCodeSpace__.addCompiledTemplate` once per path with `{ groupList, content }`.
7. **Warnings gate.** `addTmpl` warning objects and rendered messages match the official warning codes, levels, locations, and paths. Fatal/error-level diagnostics fail the build.
8. **Stylesheet API gate.** Constructor compatibility is tested for official positional arguments, including `tag_name_prefix`. `getContent`, `getSourceMap`, `getLowPriorityContent`, `getLowPrioritySourceMap`, and `extractWarnings` match official output for the fixture corpus.
9. **Stylesheet semantics gate.** Class prefixes, `rpx` conversion, `@import` sign handling, comment stripping, source-map mappings, and `:host` low-priority extraction produce identical CSS/source maps. Each component's emitted CSS path and style scope name remain paired with the same path used by templates.
10. **Runtime render gate.** Render a fixture through `glass-easel` with both migrated and official compiled artifacts. Creation and update assertions compare element count/tag hierarchy, text, class/style lists, attributes, slot distribution, event targets, and warning counts.

These gates should be added as shared fixtures/tests rather than checked manually. Golden-string comparison can be useful, but semantic render tests are required because formatting changes may be valid while binding-map behavior changes are not.
