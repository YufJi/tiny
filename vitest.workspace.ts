import { defineWorkspace } from 'vitest/config'

// One Vitest process for the whole acceptance gate. Every package keeps its own
// config, so per-package aliases, snapshot formatting and globals are unchanged;
// the workspace only decides that all projects run in the same invocation.
export default defineWorkspace([
  'packages/api/vitest.config.ts',
  'packages/bridge/vitest.config.ts',
  'packages/css-units/vitest.config.ts',
  'packages/manifest/vitest.config.ts',
  'packages/runtime/vitest.config.ts',
  'packages/stylesheet-compiler/vitest.config.ts',
  'packages/template-compiler/vitest.config.ts',
  'packages/wxs-runtime/vitest.config.ts',
  'hosts/web/vitest.config.ts',
  'hosts/web-components/vitest.config.ts',
  'tools/cli/vitest.config.ts',
  'apps/devtool/vitest.config.ts',
])
