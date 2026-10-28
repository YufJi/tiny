// WXS runtime injected into generated template bundles.
//
// This file is inlined as source text, not imported at runtime. `Q` is created
// by the generated template group before this file runs; `D` is the WXS module
// registry used by the generated `Q.S(...)` calls.
//
// This file runs inside the generated template bundle. WXS module bodies are
// compiled with `Function` below to retain WeChat's sloppy-script semantics.

// ---------------------------------------------------------------------------
// WXS value semantics
// ---------------------------------------------------------------------------

var getRegExp = (pattern, flags) => new RegExp(pattern, flags)
var getDate = (...args) => new Date(...args)

// WeChat's WXS reports type names through .constructor:
//   [].constructor === 'Array'
//   ({}).constructor === 'Object'
// The bundle evaluates WXS in the host realm, where those properties are the
// intrinsic constructors. Rewrite those reads to a WXS-aware helper instead of
// changing the host's prototypes.
var __wxsCtor = (value) => {
  if (Array.isArray(value)) return 'Array'
  if (value === null) return 'Null'
  if (typeof value === 'object') return 'Object'
  if (typeof value === 'function') return 'Function'
  if (typeof value === 'string') return 'String'
  if (typeof value === 'number') return 'Number'
  if (typeof value === 'boolean') return 'Boolean'
  return 'Undefined'
}

var __wxsRewriteConstructors = (chunk) => chunk.replace(
  /((?:[A-Za-z_$][\w$]*|this)(?:\s*(?:\.[A-Za-z_$][\w$]*|\[[^\]]+\]))*)\.constructor\b(?!\s*=(?!=))/g,
  '__wxsCtor($1)',
)

// Skip strings and comments so the rewrite only touches executable code.
var __wxsTransform = (code) => {
  var out = ''
  var start = 0
  var index = 0
  var flush = (end) => {
    if (end > start) out += __wxsRewriteConstructors(code.slice(start, end))
  }
  while (index < code.length) {
    var ch = code[index]
    if (ch === '"' || ch === "'" || ch === '\u0060') {
      flush(index)
      var quote = ch
      out += ch
      index += 1
      while (index < code.length) {
        var current = code[index]
        out += current
        if (current === '\\') {
          index += 1
          if (index < code.length) out += code[index]
          index += 1
          continue
        }
        index += 1
        if (current === quote) break
      }
      start = index
      continue
    }
    if (ch === '/' && code[index + 1] === '/') {
      flush(index)
      var lineEnd = code.indexOf('\n', index)
      if (lineEnd < 0) lineEnd = code.length
      out += code.slice(index, lineEnd)
      index = lineEnd
      start = index
      continue
    }
    if (ch === '/' && code[index + 1] === '*') {
      flush(index)
      var blockEnd = code.indexOf('*/', index + 2)
      if (blockEnd < 0) blockEnd = code.length - 2
      blockEnd += 2
      out += code.slice(index, blockEnd)
      index = blockEnd
      start = index
      continue
    }
    index += 1
  }
  flush(code.length)
  return out
}

// ---------------------------------------------------------------------------
// WXS module loader
// ---------------------------------------------------------------------------

var D = (() => {
  var modules = Object.create(null)
  var load = (filename) => {
    var module = modules[filename]
    if (!module) throw new Error('no such WXS module: ' + filename)
    if (!module.loaded) {
      module.loaded = true
      var require = (rel) => {
        var slices
        if (rel[0] === '/') {
          slices = rel.split('/')
        } else {
          slices = filename.split('/').slice(0, -1).concat(rel.split('/'))
        }
        var normalized = []
        slices.forEach((slice) => {
          if (slice === '' || slice === '.') return
          if (slice === '..') {
            normalized.pop()
          } else {
            normalized.push(slice)
          }
        })
        return load(normalized.join('/'))
      }
      module.loader.call(null, require, module.exports, module)
    }
    return module.exports
  }
  return (filename, func) => {
    modules[filename] = { exports: {}, loader: func, loaded: false }
    return () => load(filename)
  }
})()

// ---------------------------------------------------------------------------
// Template runtime hooks
// ---------------------------------------------------------------------------

// WXS is sloppy-mode script in WeChat: an undeclared assignment such as
// "var a = b = 1" creates a binding instead of throwing. The template bundle is
// an ES module, which is always strict, so the module body is compiled with the
// Function constructor to get sloppy semantics back. The helper lives on Q
// because the procgen function signature shadows D with its data argument.
Q.S = (filename, code) => D(filename, (require, exports, module) => {
  const fn = Function(
    'require', 'exports', 'module', 'getRegExp', 'getDate', '__wxsCtor',
    '//# sourceURL=wxs://' + filename + '\n' + __wxsTransform(code),
  )
  fn(require, exports, module, getRegExp, getDate, __wxsCtor)
})

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
