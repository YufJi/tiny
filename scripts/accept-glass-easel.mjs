import { spawnSync } from 'node:child_process'

const steps = [
  ['Build active glass-easel packages', ['pnpm', 'build:glass-easel']],
  ['Run bridge protocol tests', ['pnpm', '--filter', '@tiny/bridge', 'test']],
  ['Run compiler-next tests', ['pnpm', '--filter', '@tiny/compiler-next', 'test']],
  ['Run built-in component tests', ['pnpm', '--filter', '@tiny/builtin-components', 'test']],
  ['Run runtime tests', ['pnpm', '--filter', '@tiny/runtime', 'test']],
  ['Compile P0 example', ['pnpm', 'compile:glass-easel']],
]

for (const [name, command] of steps) {
  console.log(`\n▶ ${name}`)
  const result = spawnSync(command[0], command.slice(1), { stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`\n✘ ${name} failed`)
    process.exit(result.status ?? 1)
  }
}

console.log(`
✅ P0 automated gate passed.

Browser checklist — run: pnpm dev:glass-easel

1. Launch shows the todos page and no fatal console errors.
2. Todos list, checkbox group, slider, progress, switch, swiper, icon, image, and scroll-view render.
3. add-button receives text, renders slot content, and emits its custom event to the page.
4. Checkbox, slider, switch, swiper, button, and tap interactions update state or emit events.
5. "Open add todo" navigates to add-todo and preserves the todos marker.
6. add-todo input updates; "Save and back" stores the value, shows/resolves toast, and returns.
7. After returning, the todos marker reflects storage and system info remains readable.
8. Canvas renders as a placeholder and emits an unsupported diagnostic without crashing.
`)
