# CLI Context

## Glossary

- **CLI**: the active TypeScript compiler that turns a mini-program source directory into glass-easel runtime artifacts.
- **Compile result**: the structured return value containing output paths, diagnostics, dependency information, and build metadata.
- **Compatibility profile**: the configurable mini-program input conventions for extensions, config files, template directives, API/registration globals, and behavior scheme. WeChat conventions are the default.
- **Manifest**: the versioned `schemaVersion: 2` index of app, page, component, service, template, style, and asset artifacts plus `runtimeCompatibility`. Render output is host-owned and has no compiler entry.
- **Effective configuration**: page or component configuration after merging applicable global settings, especially `usingComponents`.
- **Template group**: the glass-easel `ProcGenGroupList` output shared by all templates in a compilation.
- **Diagnostic**: a structured compile message with severity, code, message, file, and location.
- **Watch build**: the first-stage full rebuild mode; future incremental behavior must preserve the same manifest contract.
