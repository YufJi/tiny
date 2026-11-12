/**
 * A service-side trait token.
 *
 * WeChat exposes `Behavior.trait()` alongside `Behavior()`. The token is an
 * opaque identity used by component instances and relations; it never crosses
 * the render bridge.
 */
export type MiniProgramTraitBehavior<
  TIn extends Record<string, unknown> = Record<string, unknown>,
  TOut extends Record<string, unknown> = TIn,
> = {
  readonly __tinyTraitBehavior: true
  readonly id: string
  readonly transform?: (impl: TIn) => TOut
}

let nextTraitId = 0

export function registerTraitBehavior<
  TIn extends Record<string, unknown> = Record<string, unknown>,
  TOut extends Record<string, unknown> = TIn,
>(
  transform?: (impl: TIn) => TOut,
): MiniProgramTraitBehavior<TIn, TOut> {
  nextTraitId += 1
  return Object.freeze({
    __tinyTraitBehavior: true,
    id: `trait-${nextTraitId}`,
    ...(transform ? { transform } : {}),
  })
}

export function isTraitBehavior(value: unknown): value is MiniProgramTraitBehavior {
  return Boolean(
    value
    && typeof value === 'object'
    && (value as { __tinyTraitBehavior?: unknown }).__tinyTraitBehavior === true
    && typeof (value as { id?: unknown }).id === 'string',
  )
}
