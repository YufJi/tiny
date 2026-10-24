# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. In multi-context repos, also check `packages/<context>/docs/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## Context layout

The initial map treats each package as its own context:

- `packages/bridge` — versioned runtime protocol, transport, batching, and diagnostics boundary
- `packages/manifest` — artifact/manifest contract shared by compiler and runtime
- `tools/cli` — active glass-easel compiler and runtime manifest producer
- `apps/devtool` — web-based debugger
- `packages/runtime` — host-independent runtime core
- `hosts/browser` — browser host adapters (iframes, message ports, DOM canvas, devtool overlay)
- `packages/stylesheet-compiler` — stylesheet compilation
- `packages/template-compiler` — template compilation

When work spans packages, read every relevant context and identify the boundary that owns the concept.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
