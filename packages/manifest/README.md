# @tiny/manifest

Versioned contract between the compiler and the runtime/debugger.

This package contains **types only** — no compiler or runtime logic. Keeping it
separate lets `tools/cli` produce artifacts while `packages/runtime` consumes
them without a dependency inversion.

## Types

- `Manifest` / `AppArtifact` / `PageArtifact` / `ComponentArtifact`
- `TemplateArtifact` / `StyleArtifact` / `ScriptArtifact` / `AssetArtifact`
- `ConfigurationArtifact`
- `Diagnostic`

Style artifacts are identified through their owning entries (`app.style`, `page.style`,
or `component.style`) and semantic fields such as `pageScopeClassSign`. Consumers must
not infer an artifact's kind or role from its filename or extension; source style
extensions belong to the compiler contract.

`schemaVersion` is currently `1`.

## Usage

```ts
import type { Manifest, PageArtifact } from '@tiny/manifest'

const manifest: Manifest = await fetch('/generated/manifest.json').then((r) => r.json())
```

## Development

```bash
pnpm --filter @tiny/manifest build
pnpm --filter @tiny/manifest typecheck
```
