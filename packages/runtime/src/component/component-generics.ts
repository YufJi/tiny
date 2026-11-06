/**
 * Parse the `componentGenerics` declaration from a component/page config.
 *
 * Shared by the logic tree (page-level generic overrides) and the service
 * render schema builder, so it lives in the component domain rather than in
 * either service layer.
 */
export function readComponentGenerics(
  config: Record<string, unknown>,
): Record<string, { default?: string } | true> {
  const raw = config.componentGenerics
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const result: Record<string, { default?: string } | true> = {}
  for (const [alias, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!alias) continue
    if (value === true) {
      result[alias] = true
      continue
    }
    if (!value || typeof value !== 'object') continue
    const defaultPath = (value as Record<string, unknown>).default
    result[alias] = typeof defaultPath === 'string' && defaultPath.length > 0
      ? { default: defaultPath }
      : true
  }
  return result
}
