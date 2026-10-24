/**
 * Naming contract shared by the compiler and the runtime.
 *
 * Every engine-owned name derives from a single namespace prefix. The default
 * is `wx-` (WeChat compatibility); projects can opt into `tiny-` or any custom
 * namespace without touching engine internals:
 *
 * | Surface | `wx-` (default) | `tiny-` |
 * | --- | --- | --- |
 * | Template directives | `wx:if` | `tiny:if` |
 * | API global | `wx.getStorageSync()` | `tiny.getStorageSync()` |
 * | Built-in behaviors | `wx-base` | `tiny-base` |
 * | Built-in behavior scheme | `wx://component-export` | `tiny://component-export` |
 * | Host attribute | `wx-host` | `tiny-host` |
 * | Tag marker class | `wx-tag-button` | `tiny-tag-button` |
 *
 * Built-in component tags (`<view>`, `<button>`, …) keep the mini-program
 * grammar and are not prefixed.
 */
export type NamingConfig = {
  /**
   * Engine namespace prefix. Defaults to `wx-`.
   * A trailing `-` is optional; `wx` and `wx-` are equivalent.
   */
  prefix?: string
  /** Override the template directive namespace (defaults to the prefix base). */
  directive?: string
  /** Override the API global object name (defaults to the prefix base). */
  api?: string
  /**
   * Extra service-thread globals aliasing the API object, e.g. `["wx"]` so that
   * third-party WeChat libraries keep working under the `tiny-` namespace.
   */
  apiAliases?: string[]
}

export type ResolvedNamingConfig = {
  /** Canonical prefix, always ending with `-`, e.g. `tiny-`. */
  prefix: string
  /** Directive namespace, e.g. `tiny` (`tiny:if`). */
  directive: string
  /** API global object name, e.g. `tiny`. */
  api: string
  /** Extra API global aliases (excluding `api` itself). */
  apiAliases: string[]
  /** Attribute marking a component host, e.g. `tiny-host`. */
  hostAttribute: string
  /** Marker class prefix for tag selectors, e.g. `tiny-tag-`. */
  tagClassPrefix: string
  /** Prefix for built-in behavior ids, e.g. `tiny-base`. */
  behaviorPrefix: string
  /** URL scheme for built-in behaviors, e.g. `tiny://`. */
  behaviorScheme: string
}

export const DEFAULT_PREFIX = 'wx-'

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/

function sanitizeNamespace(value: string | undefined, fallback: string): string {
  const trimmed = (value ?? '').trim().replace(/[:-]+$/, '')
  if (trimmed.length === 0 || !NAME_PATTERN.test(trimmed)) return fallback
  return trimmed
}

/**
 * Normalizes a prefix to its canonical form (`tiny` / `tiny-` → `tiny-`).
 * Invalid or empty input falls back to {@link DEFAULT_PREFIX} (`wx-`).
 */
export function normalizePrefix(prefix?: string | null): string {
  const trimmed = (prefix ?? '').trim().replace(/[:-]+$/, '')
  if (trimmed.length === 0 || !NAME_PATTERN.test(trimmed)) return DEFAULT_PREFIX
  return `${trimmed}-`
}

/** Resolves a (possibly partial) naming config into every derived name. */
export function resolveNaming(config?: NamingConfig | null): ResolvedNamingConfig {
  const prefix = normalizePrefix(config?.prefix)
  const namespace = prefix.slice(0, -1)
  const directive = sanitizeNamespace(config?.directive, namespace)
  const api = sanitizeNamespace(config?.api, namespace)
  const aliases: string[] = []
  for (const alias of config?.apiAliases ?? []) {
    if (typeof alias !== 'string') continue
    const name = alias.trim()
    if (name.length === 0 || name === api || aliases.includes(name)) continue
    aliases.push(name)
  }
  return {
    prefix,
    directive,
    api,
    apiAliases: aliases,
    hostAttribute: `${namespace}-host`,
    tagClassPrefix: `${namespace}-tag-`,
    behaviorPrefix: prefix,
    behaviorScheme: `${namespace}://`,
  }
}

/** Reads the naming config from a manifest, falling back to the engine default. */
export function namingFromManifest(manifest?: { naming?: NamingConfig } | null): ResolvedNamingConfig {
  return resolveNaming(manifest?.naming)
}
