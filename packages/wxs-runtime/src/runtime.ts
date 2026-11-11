import { transformWxsSource, wxsCtor } from './transform'
import type {
  WxsCompile,
  WxsErrorContext,
  WxsExports,
  WxsFunctionOrigin,
  WxsModuleTable,
  WxsRuntime,
  WxsRuntimeHost,
  WxsValues,
} from './types'

type ModuleRecord = {
  source: string
  module: { exports: WxsExports }
  exports: WxsExports
  loaded: boolean
  loading: boolean
}

const defaultGlobals: Record<string, unknown> = {
  console,
  Math,
  JSON,
  Number,
  String,
  Boolean,
  Array,
  Object,
  Date,
  RegExp,
  parseInt,
  parseFloat,
  isNaN,
  isFinite,
  NaN,
  Infinity,
  undefined,
}

const resolveModuleId = (from: string, request: string): string => {
  if (!request.startsWith('.') && !request.startsWith('/')) return request
  const base = request.startsWith('/') ? [] : from.split('/').slice(0, -1)
  const parts = [...base, ...request.split('/')]
  const normalized: string[] = []
  for (const part of parts) {
    if (part === '' || part === '.') continue
    if (part === '..') {
      normalized.pop()
    } else {
      normalized.push(part)
    }
  }
  return normalized.join('/')
}

export function createWxsRuntime(host: WxsRuntimeHost): WxsRuntime {
  const records = new Map<string, ModuleRecord>()
  const functionOrigins = new WeakMap<Function, WxsFunctionOrigin>()
  let disposed = false

  const report = (error: unknown, context: WxsErrorContext): void => {
    host.onError?.(error, context)
  }

  const values = (moduleId: string): WxsValues => ({
    require: (request) => require(resolveModuleId(moduleId, request)),
    globals: host.globals ?? defaultGlobals,
    ctor: wxsCtor,
    getRegExp: (pattern, flags) => new RegExp(pattern, flags),
    getDate: (...args) => new Date(...(args as [])),
  })

  const require = (moduleId: string): WxsExports => {
    if (disposed) throw new Error('WXS runtime is disposed')
    const record = records.get(moduleId)
    if (!record) throw new Error(`no such WXS module: ${moduleId}`)
    if (record.loaded || record.loading) return record.module.exports
    if (!record.source) return record.module.exports

    record.loading = true
    try {
      let factory
      try {
        factory = host.compile(transformWxsSource(record.source), moduleId)
      } catch (error) {
        report(error, { moduleId, phase: 'compile' })
        throw error
      }
      try {
        const moduleRequire = (request: string) => require(resolveModuleId(moduleId, request))
        factory(moduleRequire, record.module, record.module.exports, values(moduleId))
      } catch (error) {
        report(error, { moduleId, phase: 'load' })
        throw error
      }
      record.loaded = true
      indexExports(moduleId, record.module.exports)
      return record.module.exports
    } finally {
      record.loading = false
    }
  }

  const indexExports = (moduleId: string, exportsValue: unknown): void => {
    const seen = new Set<object>()
    const visit = (value: unknown, path: string[]): void => {
      if (typeof value === 'function') {
        if (!functionOrigins.has(value)) functionOrigins.set(value, { moduleId, exportPath: [...path] })
        return
      }
      if (!value || typeof value !== 'object' || seen.has(value)) return
      seen.add(value)
      for (const key of Object.keys(value)) {
        visit((value as Record<string, unknown>)[key], [...path, key])
      }
    }
    visit(exportsValue, [])
  }

  return {
    originOf(value: unknown) {
      return typeof value === 'function' ? functionOrigins.get(value) : undefined
    },

    resolve(moduleId: string, exportPath: string[]) {
      try {
        let target: unknown = require(moduleId)
        for (const part of exportPath) {
          if (target === null || target === undefined || typeof target !== 'object') return undefined
          target = (target as Record<string, unknown>)[part]
        }
        return typeof target === 'function'
          ? target as (...args: unknown[]) => unknown
          : undefined
      } catch {
        return undefined
      }
    },

    load(table: WxsModuleTable) {
      for (const module of table.modules) {
        const existing = records.get(module.id)
        if (existing && existing.source !== module.code) {
          throw new Error(`WXS module already registered: ${module.id}`)
        }
        if (!existing) {
          records.set(module.id, {
            source: module.code,
            module: { exports: {} },
            exports: {},
            loaded: false,
            loading: false,
          })
        }
      }
    },

    register(moduleId, source) {
      const existing = records.get(moduleId)
      if (existing) {
        if (existing.source !== source) {
          throw new Error(`WXS module already registered: ${moduleId}`)
        }
        return () => require(moduleId)
      }
      records.set(moduleId, {
        source,
        module: { exports: {} },
        exports: {},
        loaded: false,
        loading: false,
      })
      return () => require(moduleId)
    },

    require,

    invoke(moduleId, exportPath, args) {
      const exports = require(moduleId)
      let target: unknown = exports
      for (const part of exportPath) {
        if (target === null || target === undefined || typeof target !== 'object') {
          throw new Error(`WXS export path not found: ${moduleId}.${exportPath.join('.')}`)
        }
        target = (target as Record<string, unknown>)[part]
      }
      if (typeof target !== 'function') {
        throw new Error(`WXS export is not a function: ${moduleId}.${exportPath.join('.')}`)
      }
      try {
        return (target as (...inner: unknown[]) => unknown)(...args)
      } catch (error) {
        report(error, { moduleId, phase: 'invoke' })
        throw error
      }
    },

    dispose() {
      disposed = true
      records.clear()
    },
  }
}

/**
 * WXS runtime for the service thread.
 *
 * A service thread hosts multiple page trees, while WeChat's page WebView owns
 * one WXS module table per page. Keep the generated bundle's `Q.S` registration
 * global, but instantiate its module exports in the page selected around each
 * synchronous template evaluation.
 */
export function createPageScopedWxsRuntime(host: WxsRuntimeHost): WxsRuntime {
  const sources = new Map<string, string>()
  const runtimes = new Map<string, WxsRuntime>()
  const fallbackPage = '__tiny_wxs_app__'
  let resolveScope: ((renderContext: unknown) => string | undefined) | undefined
  let disposed = false

  const registerSource = (moduleId: string, source: string): void => {
    const existing = sources.get(moduleId)
    if (existing !== undefined) {
      if (existing !== source) throw new Error(`WXS module already registered: ${moduleId}`)
      return
    }
    sources.set(moduleId, source)
    for (const runtime of runtimes.values()) runtime.register(moduleId, source)
  }

  const createPageRuntime = (): WxsRuntime => {
    const runtime = createWxsRuntime(host)
    for (const [moduleId, source] of sources) runtime.register(moduleId, source)
    return runtime
  }

  const scopeOf = (renderContext: unknown): string | undefined => (
    resolveScope?.(renderContext)
  )

  const runtimeFor = (pageId: string): WxsRuntime => {
    if (disposed) throw new Error('WXS runtime is disposed')
    let runtime = runtimes.get(pageId)
    if (!runtime) {
      runtime = createPageRuntime()
      runtimes.set(pageId, runtime)
    }
    return runtime
  }

  const fallbackRuntime = (): WxsRuntime => runtimeFor(fallbackPage)

  return {
    register(moduleId, source) {
      registerSource(moduleId, source)
      return (scopeKey?: string) => runtimeFor(scopeKey ?? fallbackPage).require(moduleId)
    },

    load(table) {
      for (const module of table.modules) registerSource(module.id, module.code)
    },

    originOf(value) {
      for (const runtime of runtimes.values()) {
        const origin = runtime.originOf(value)
        if (origin) return origin
      }
      return undefined
    },

    resolve(moduleId, exportPath) {
      return fallbackRuntime().resolve(moduleId, exportPath)
    },

    require(moduleId) {
      return fallbackRuntime().require(moduleId)
    },

    invoke(moduleId, exportPath, args) {
      return fallbackRuntime().invoke(moduleId, exportPath, args)
    },

    bindScopeResolver(resolver) {
      resolveScope = resolver
    },

    scopeOf,

    releasePage(pageId) {
      const scopeKey = `page:${pageId}`
      const runtime = runtimes.get(scopeKey)
      runtimes.delete(scopeKey)
      runtime?.dispose()
    },

    dispose() {
      disposed = true
      sources.clear()
      for (const runtime of runtimes.values()) runtime.dispose()
      runtimes.clear()
    },
  }
}

/**
 * Default compiler for hosts that execute WXS in the current realm.
 *
 * The generated factory receives the WXS runtime values as `__wxs`; the
 * `getRegExp` / `getDate` parameters preserve the bare names used by WXS.
 */
export const createDefaultWxsCompiler = (): WxsCompile => (source, moduleId) => {
  const fn = Function(
    'require',
    'module',
    'exports',
    '__wxs',
    'getRegExp',
    'getDate',
    `//# sourceURL=wxs://${moduleId}\n${source}`,
  ) as (
    require: (id: string) => WxsExports,
    module: { exports: WxsExports },
    exports: WxsExports,
    values: WxsValues,
    getRegExp: WxsValues['getRegExp'],
    getDate: WxsValues['getDate'],
  ) => void
  return (require, module, exports, values) => {
    fn(require, module, exports, values, values.getRegExp, values.getDate)
  }
}
