import { transformWxsSource, wxsCtor } from './transform'
import type {
  WxsCompile,
  WxsErrorContext,
  WxsExports,
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

const defaultGlobals: Record<string, unknown> = {}

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
      return record.module.exports
    } finally {
      record.loading = false
    }
  }

  return {
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
