# @tiny/cli

Mini-program compiler: source directory → glass-easel runtime artifacts and a
versioned manifest.

Currently the package exposes a library API (`compileMiniProgram`); there is no
`bin` entry yet. The test apps and devtool compile scripts call it directly.

## Usage

```ts
import { compileMiniProgram } from '@tiny/cli'

const result = await compileMiniProgram({
  sourceDir: 'tests/apps/mini',
  outputDir: 'tests/host/generated',
  clean: true,
  dev: true,
  // Optional; omitted fields use WeChat conventions.
  compatibility: {
    extensions: { style: ['.wxss'] },
    directiveNamespace: 'wx',
    api: { global: 'wx' },
  },
})

if (result.diagnostics.some((item) => item.severity === 'error')) {
  process.exitCode = 1
}
```

## Output

The compiler writes:

- `manifest.json` — schema-v2 app/page/component/style/template/asset index plus runtime compatibility
- `service.js` / `render.js` — bundled thread entries
- `templates.js` — ProcGen group list
- `styles/` — compiled WXSS (+ source maps)
- `scripts/` — transpiled scripts (+ source maps)

Manifest and artifact types live in `@tiny/manifest`, so runtime and tooling
share one contract.

## Development

```bash
pnpm --filter @tiny/cli build
pnpm --filter @tiny/cli test
pnpm --filter @tiny/cli typecheck
```

Source layout:

- `src/index.ts` — public barrel (`compileMiniProgram`, types, path helpers)
- `src/compile.ts` — orchestration only: runs the stages below in order
- `src/compiler/context.ts` — shared per-run state: options, extensions, diagnostics, artifact maps
- `src/compiler/project.ts` — `project.config.json` root, `app.json` pages, `usingComponents` graph
- `src/compiler/scripts.ts` — reachable-script walk, TypeScript transpile, source maps
- `src/compiler/templates.ts` — `TmplGroup` registration and `templates.js` emission
- `src/compiler/styles.ts` — scoped CSS, rpx, low-priority and page-scope stylesheets
- `src/compiler/manifest.ts` — schema-v2 manifest and page/component artifacts
- `src/compiler/output.ts` — asset copy plus `service.js`/`render.js` entries and bundling
- `src/compiler/template-source.ts` — WXML pre-passes (image inlining, `animation`, scope markers)
- `src/compiler/module-specifiers.ts` — extensionless import rewriting for ESM hosts
- `src/compiler/extensions.ts` — extension matching helpers
- `src/types.ts` — compiler options/results; re-exports `@tiny/manifest`
- `src/utils.ts` — path/JSON helpers
