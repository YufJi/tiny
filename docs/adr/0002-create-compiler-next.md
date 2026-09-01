# 0002 - Create compiler-next

## Status

Accepted

## Context

The existing `packages/compiler` emits Nerv-oriented service and render bundles through Webpack 4. The glass-easel migration needs a different artifact contract: template ProcGen groups, transformed stylesheets, dual-thread entry points, and a manifest that the runtime can consume. Changing the legacy compiler in place would mix two output models and prolong dependence on obsolete build tooling.

## Decision

Create `packages/compiler-next`.

- Use TypeScript with Vite library builds and Vitest tests. Publish-compatible output should provide ESM and CJS entries.
- Accept a mini-program source directory as input. Compiler-next discovers `app.json`, pages, components, WXML, WXSS, JS/TS, WXS/SJS, and static assets itself.
- Export both APIs:
  - `compileMiniProgram(options): Promise<CompileResult>` for the application build;
  - lower-level template, style, script, manifest, and diagnostics helpers for tests, devtool, and future tooling.
- Emit a versioned manifest plus independent artifacts:
  - `manifest.json`;
  - `service.js`;
  - `render.js`;
  - compiled template groups;
  - transformed CSS and CSS source maps;
  - copied static assets.
- Use `schemaVersion: 1` in the manifest. Use root-relative POSIX paths and explicit app, page, component, service, render, template, style, and asset entries.
- The manifest records effective page/component configuration after merging global `usingComponents`; it preserves source fields and the source of merged values.
- Emit JS and CSS source maps. Watch mode performs a full rebuild in the first implementation; the public API reserves room for incremental rebuilds later.
- Compile WXS/SJS into the template group according to the glass-easel runtime and WXS contract, even though the current example does not use WXS.
- Return structured diagnostics in `CompileResult.diagnostics`. Errors fail the build; warnings retain code, message, file, and location.
- Reference styles and static assets by manifest path; the render thread loads them by path and pairs CSS source maps with their CSS files.
- Freeze `packages/compiler` as a reference implementation. Do not add new features to it; remove it only after compiler-next is stable.

## Alternatives

- Extending the legacy compiler would avoid a new package, but it would couple glass-easel output to Webpack 4 and the legacy Nerv template model.
- Using the official webpack plugin directly would provide a working path, but it would make Tiny dependent on the upstream bundler flow and make the dual-thread runtime contract harder to own.
- Emitting only source files would simplify the compiler, but it would leave module splitting, dependency resolution, and runtime boot contracts to every consumer.

## Consequences

Compiler-next becomes the authoritative path for the glass-easel build. Runtime, devtool, and tests can consume one versioned manifest contract. The project temporarily maintains two compiler packages, but only compiler-next may evolve.
