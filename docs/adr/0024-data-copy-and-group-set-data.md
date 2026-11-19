# ADR-0024: Data ownership on setData and `groupSetData`

## Status

Accepted. Fixes P0-10 (`dataDeepCopy: none` leaked caller mutations) and P0-9
(`groupSetData` dropped `this`).

## Context

WeChat's default component option `dataDeepCopy` is `"simple"`: the component
takes a copy of the data passed to `setData`, so mutating the caller's object
afterwards must not change the rendered data. WeChat still keeps `Date` values
and function references usable in the logic layer.

Tiny configured glass-easel with `DeepCopyKind.None` for everything. That kept
Date/function values alive, but every component and page stored the caller's
objects by reference; a later mutation silently rewrote `this.data` and the
rendered tree.

`this.groupSetData(callback)` ran the callback without a receiver, so
`this.setData(...)` inside the callback threw (`this` was undefined), and no
group boundary existed.

## Decision

1. `cloneDataValue` is the kernel's `"simple"` data copy:
   - recursively copies plain objects/arrays, detects cycles with a `WeakMap`,
   - clones `Date` instead of flattening it to `{}`,
   - keeps function references,
   - leaves other primitives untouched.
2. It is applied at the data ownership boundaries:
   - page instance creation (`Page({ data })`),
   - page/component `setData` (the wrapper installed around the glass component
     and `MiniProgramPageInstance.setData`),
   - component initial data, generated per instance.
   Page data handed to the logic tree stays one object: glass may evaluate the
   page data factory more than once, and the page instance and the logic tree
   must keep sharing that object so view updates are not split across two
   copies. `dataDeepCopy` therefore stays `None` at the glass option level; the
   copy happens before the data reaches glass.
3. `groupSetData(callback)` calls the callback with the component/page as
   `this` on every path (glass method caller, page instance, page template
   handler). Errors are reported (`safeCallback` on the glass path,
   `EVENT_HANDLER_ERROR` on the page instance), not thrown into the event
   dispatcher. Updates inside the callback share the existing page-scoped
   microtask batch; no extra protocol message is invented.

## Consequences

- Mutating the object passed to `setData` no longer changes `this.data`, matching
  WeChat. `Date` and function values survive.
- Recursive data is copied without a stack overflow; `Map`/`Set` and other
  non-plain objects are still reduced to their enumerable fields (same class of
  limitation as glass's simple copy).
- Initial `Page({ data })` and component `data` are copied per instance, so two
  instances never share nested state.
- `groupSetData` works on pages and components and preserves `this`. The
  observable grouping is the normal microtask flush: all calls inside the
  synchronous callback coalesce into one page update.
- `cloneDataValue` runs on every `setData`; the cost is proportional to the
  patch, the same order as WeChat's own copy.
