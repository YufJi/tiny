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
  // Optional; defaults to ['.wxss'].
  styleExtensions: ['.wxss'],
})

if (result.diagnostics.some((item) => item.severity === 'error')) {
  process.exitCode = 1
}
```

## Output

The compiler writes:

- `manifest.json` — app/page/component/style/template/asset index
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

Entry points:

- `src/compile.ts` — source discovery, app/page/component resolution, bundling
- `src/types.ts` — compiler options/results; re-exports `@tiny/manifest`
- `src/utils.ts` — path/JSON helpers
