# ADR-0017: Run `setData` completions after the render update

## Status

Accepted. Closes the after-render timing gap tracked in issue #34; refines the
split-tree data crossing of ADR-0006 and ADR-0010.

## Context

`setData(patch, callback)` carries two different contracts:

- the patch is `cloneJsonSafe`d and applied to the service data synchronously, so
  `this.data` reads the new value immediately;
- the completion runs after the **view layer** applied the update. Pages use it
  to sequence animations, measure rendered geometry, or issue a follow-up patch.

Tiny implemented only the first one. `MiniProgramPageInstance.setData` invoked
the callback inline, and `ensureSetDataCallback` wrapped glass-easel component
`setData` (event handlers and nested page methods) with the same inline call.
glass-easel's own `setData` has no async completion, so the after-render
semantics are the kernel's responsibility.

The consequence was a real ordering bug: an update that depended on the view
(for example `setData({ position }, () => setData({ show: true }))`) could
observe the service data but not the rendered tree.

## Decision

- Add a render-thread **batch acknowledgement** to the tree protocol:
  `TREE_PROTOCOL.ack` (`tree.ack`) with `{ pageId, tokens }`.
- A `tree.flow` / `tree.patch` message may carry
  `ack: string[]` tokens. The render thread applies the batch and echoes the
  tokens exactly once, including when the renderer throws (the failure is
  reported as `RENDER_PATCH_ERROR`).
- `ServiceRenderBridge` owns the completion queue:
  - `ServiceRenderPort.completeAfterRender(pageId, callback)` queues a callback;
  - the next batch for that page carries one token and the pending callbacks are
    kept in `ackedBatches`;
  - `tree.ack` runs them in call order. A batch that produces no bridge message
    (nothing observable changed) completes at the end of the same flush;
  - completions still pending when the page unmounts are dropped, because the
    view they were waiting for is gone.
- Both user-facing `setData` paths share the queue:
  - `MiniProgramPageInstance.setData` receives `afterRender` through
    `ServicePageStack` -> `ServiceRenderPort`;
  - the logic tree's wrapped glass component `setData` forwards through
    `LogicTreeAdapterOptions.afterRender`.
- No render tree means no acknowledgement. The page instance then completes in
  a microtask; the standalone logic adapter defers to glass-easel's own render
  pass (`glassEasel.triggerRender`). Neither path falls back to inline delivery.
- Errors thrown by a completion are reported through the existing error path
  (app `onError` plus a `SET_DATA_CALLBACK_ERROR` diagnostic), and one failing
  completion does not stop the others in the same batch.

## Consequences

- `setData` callbacks are asynchronous in every case, matching WeChat. Code that
  relied on the callback running inside `setData` must move that work after the
  callback or rely on `this.data`, which is still synchronous.
- Batch granularity is the microtask flush: callbacks added by synchronous
  `setData` calls share one acknowledgement and run in call order; a `setData`
  issued from a completion waits for the next batch.
- Hosts that use `bootTreeThread` get acknowledgement for free. A host with a
  custom render thread must echo `ack` tokens, or completions stay pending until
  the page unmounts.
- Protocol cost is zero when no completion is queued: no token, no ack message.
