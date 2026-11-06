/**
 * The one host-facing glass-easel entry.
 *
 * Both threads need the same glass-easel implementation within their own JS
 * realm. Host packages import this subpath instead of importing `glass-easel`
 * directly so their build graph shares the runtime's module binding. The
 * service and render threads still have independent module instances (and
 * `ComponentSpace`s), as they run in separate realms.
 */
export * from 'glass-easel'
