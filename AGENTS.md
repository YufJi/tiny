# AGENTS.md

This file provides guidelines for AI agents working in the tiny-v1 repository.

## Project Overview

A mini-program engine (小程序引擎) that implements a WeChat-like mini-program runtime.
- **Monorepo**: Managed with Lerna and Yarn
- **Packages**:
  - `packages/base`: Core runtime library (vdom + web-components, JSBridge, routing, events)
  - `packages/compiler`: Transpiles mini-program templates, styles, and logic files
  - `packages/devtool`: Web-based debugger using iframe dual-thread architecture

## Build Commands

```bash
# Install dependencies (bootstraps all packages)
yarn install

# Build base library (development)
cd packages/base && yarn dev

# Build base library (production)
cd packages/base && yarn build

# Watch mode for base library
cd packages/base && yarn watch

# Start devtool debugger
cd packages/devtool && yarn dev

# Build devtool
cd packages/devtool && yarn build

# Lint all packages
yarn lint
```

## Testing

**No test framework is currently configured.** The project does not have:
- Jest, Vitest, or any test runner
- Test files or `__tests__` directories
- Test scripts in package.json

When adding tests, use the existing `eslint-config-curiosity` devDependency as a reference for the project's preferred tooling style.

## Code Style Guidelines

### Import Styles

**Base package (`packages/base`)**:
- Uses ES6 modules (`import`/`export`)
- TypeScript supported with `.ts` extension

**Compiler package (`packages/compiler`)**:
- Uses CommonJS (`require`/`module.exports`)
- Destructuring imports preferred: `const { fn } = require('./utils')`

**Devtool package (`packages/devtool`)**:
- Uses ES6 modules (`import`/`export`)
- React components use JSX

### Naming Conventions

- **Variables/Functions**: camelCase (`createGuid`, `getAllFiles`)
- **Classes/React Components**: PascalCase (`App`, `StatusBar`)
- **Constants**: UPPER_SNAKE_CASE for true constants (`CUSTOM_EVENT`)
- **Private/internal**: Leading underscore not commonly used
- **Filenames**: camelCase for utilities, PascalCase for React components

### Formatting

- **Indent**: 2 spaces (from `.editorconfig`)
- **Line endings**: LF
- **Charset**: UTF-8
- **Trailing whitespace**: Not trimmed
- **Final newline**: Not required

### TypeScript

- Target: ESNext
- Module: ES6
- Module resolution: Node
- `allowJs`: true
- `noEmit`: true (type checking only)

### ESLint Rules (Key Overrides)

Extends `eslint-config-curiosity` with these overrides:
- `@typescript-eslint/explicit-function-return-type`: off
- `@typescript-eslint/no-use-before-define`: off
- `react/prop-types`: off
- `react/react-in-jsx-scope`: off
- `react/jsx-filename-extension`: off
- `max-len`: off
- `no-empty`: off
- `class-methods-use-this`: off
- `import/no-cycle`: off

### Error Handling

- Use `try/catch` for JSON parsing and file operations
- Throw descriptive Error objects: `throw new Error('message')`
- Console warnings for unsupported features: `console.warn('bridge: ${method}暂不支持')`
- Callback pattern used in webpack loaders with error-first convention

### Comments

- Use JSDoc style for function documentation
- Chinese comments acceptable for project-specific concepts
- Inline comments explain "why", not "what"

### React Patterns

- Class components with `PureComponent` for performance
- Redux with `connect()` HOC pattern
- CSS Modules: `import style from './app.module.less'`
- Path alias: `@/` maps to `src/`

## Project Structure

```
packages/
├── base/           # Core runtime (web-components, JSBridge, vdom)
│   ├── src/
│   │   ├── js-bridge/
│   │   ├── service/      # Worker thread code
│   │   ├── webview/      # Render thread code
│   │   └── shared/       # Shared utilities
│   └── webpack/
├── compiler/       # Build tools for mini-programs
│   └── src/
│       ├── loaders/      # Webpack loaders (js, css, template, sjs)
│       └── xml/          # Template transformation
└── devtool/        # Web debugger
    ├── src/
    │   ├── components/   # React UI components
    │   ├── store/        # Redux store (rematch)
    │   └── utils/        # JSBridge API implementations
    └── static/           # Runtime assets
```

## Key Technologies

- **Build**: Webpack 4, esbuild, SWC
- **Frontend**: React 17, Redux (Rematch), Web Components (Polymer)
- **Transpilation**: Babel, TypeScript
- **Styling**: Less, CSS Modules, PostCSS
- **Bundler**: Lerna for monorepo management

## Local Development Workflow

1. Build base library: `cd packages/base && yarn dev`
2. Start debugger: `cd packages/devtool && yarn dev`
3. Compile demo: `cd example && NODE_ENV=development node ./scripts/compile.js --root ./mini`

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `YufJi/tiny` and are managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The tracker uses the five default canonical triage labels unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

The repo uses a multi-context layout rooted at `CONTEXT-MAP.md`, with package-scoped contexts. See `docs/agents/domain.md`.
