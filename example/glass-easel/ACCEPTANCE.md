# P0 acceptance path

From a clean checkout:

```bash
pnpm install
pnpm accept:glass-easel
pnpm dev:glass-easel
```

The automated gate builds the active glass-easel packages, runs bridge/compiler/built-in/runtime tests, and compiles this example.

Then open the Vite URL and complete the printed browser checklist. The required scenario is:

1. Launch the todos page.
2. Interact with P0 controls and `add-button`.
3. Open add-todo, edit input, save, and return.
4. Confirm todos state and storage-backed marker survive the round trip.
5. Confirm unsupported canvas remains non-fatal and produces a structured diagnostic.
