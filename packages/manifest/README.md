# @tiny/manifest

Versioned contract between the compiler and the runtime/debugger.

This package owns the shared manifest/codegen contract and the fixed Tiny engine naming constants. Keeping them here lets `tools/cli`, `packages/runtime`, and hosts agree without dependency inversion.

## Types

- `Manifest` / `AppArtifact` / `PageArtifact` / `ComponentArtifact`
- `TemplateArtifact` / `StyleArtifact` / `ScriptArtifact` / `AssetArtifact`
- `ConfigurationArtifact`
- `CompatibilityConfig` / `RuntimeCompatibilityConfig`
- `TINY_ENGINE_NAMING`
- `Diagnostic`

Mini-program input conventions such as extensions, directive namespace, API
globals, and behavior scheme belong to `CompatibilityConfig`. The manifest stores
only the runtime-facing subset as `runtimeCompatibility`. Engine-owned names
such as `tiny-page`, `tiny-scope`, and `tiny-builtin:*` are fixed code constants
and are not user-configurable. `hostAttribute` and
`styleScopeAttribute` temporarily mirror glass-easel's `wx-host` and
`wx-style-scope` until upstream exposes configurable names; see
`docs/known-issues/glass-easel-naming.md`.

Style artifacts are identified through their owning entries (`app.style`, `page.style`,
or `component.style`) and semantic fields such as `pageScopeClassSign`. Consumers must
not infer an artifact's kind or role from its filename or extension; source style
extensions belong to the compiler contract.

`schemaVersion` is currently `2`.

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
