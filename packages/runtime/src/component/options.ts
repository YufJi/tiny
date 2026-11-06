/**
 * Input contract accepted by `Component()`.
 *
 * This lives in the shared component domain so definition normalization and
 * behaviors do not have to import the service runtime. The service re-exports
 * it through `service/types` for the registration path.
 */
export type MiniProgramComponentOptions = {
  data?: Record<string, unknown>
  properties?: Record<string, unknown>
  methods?: Record<string, (...args: unknown[]) => unknown>
  lifetimes?: Record<string, (...args: unknown[]) => void>
  pageLifetimes?: Record<string, (...args: unknown[]) => void>
  behaviors?: Array<MiniProgramComponentOptions | string>
  observers?: Record<string, unknown> | Array<unknown>
  relations?: Record<string, unknown>
  listeners?: Record<string, ((...args: unknown[]) => unknown) | string>
  externalClasses?: string[]
  options?: Record<string, unknown>
  export?: (...args: unknown[]) => unknown
  definitionFilter?: (...args: unknown[]) => unknown
  [key: string]: unknown
}
