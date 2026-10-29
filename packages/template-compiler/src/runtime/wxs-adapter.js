// Injected into generated template bundles. The actual WXS language runtime is
// provided by the host through `globalThis.__tinyWxsRuntime`; this file only
// adapts the generated Q hooks to that runtime.

var __wxsRuntime = (() => {
  const runtime = typeof globalThis === 'undefined' ? undefined : globalThis.__tinyWxsRuntime
  if (!runtime) throw new Error('WXS runtime is not installed')
  return runtime
})()

Q.S = (filename, code) => __wxsRuntime.register(filename, code)

// WXS event handlers take the owning component descriptor as their second
// argument, and legacy WXS reads the same object from event.instance. The
// wrapper only rewrites listeners whose value comes from a WXS module
// (generalLvaluePath), so plain bindtap bindings stay untouched.
Q.C = (elem, evName, listener, final, mutated, capture, lvaluePath) => {
  const host = typeof globalThis === 'undefined' ? undefined : globalThis.__tinyWxsEventHost
  const wantsDescriptor = Boolean(lvaluePath) && Boolean(host)
  // Mirror glass-easel's default wrapper: it binds "this" to the host's
  // method caller, and replacing it without doing the same detaches page
  // methods from their component (this.data becoming undefined).
  return function (event) {
    const owner = elem.ownerShadowRoot
    const caller = owner && owner.getHostNode ? owner.getHostNode().getMethodCaller() : undefined
    if (!wantsDescriptor) return listener.call(caller, event)
    const descriptor = host.descriptorFor(elem)
    if (descriptor && event && typeof event === 'object' && event.instance === undefined) {
      event.instance = descriptor
    }
    return listener.call(caller, event, descriptor)
  }
}
