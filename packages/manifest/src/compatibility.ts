/**
 * Compatibility conventions for the mini-program source format.
 *
 * The defaults model WeChat's conventions. They are intentionally isolated
 * here so compiler and runtime internals do not embed platform-specific names.
 */
export type MiniProgramExtensionConfig = {
  script?: readonly string[]
  template?: readonly string[]
  style?: readonly string[]
  templateScript?: readonly string[]
  config?: readonly string[]
}

export type MiniProgramFileConfig = {
  appConfig?: string
  projectConfig?: string
}

export type MiniProgramGlobalsConfig = {
  app?: string
  page?: string
  component?: string
  behavior?: string
  getApp?: string
  getCurrentPages?: string
}

export type MiniProgramApiConfig = {
  global?: string
  aliases?: readonly string[]
}

export type CompatibilityConfig = {
  preset?: 'wechat'
  extensions?: MiniProgramExtensionConfig
  files?: MiniProgramFileConfig
  directiveNamespace?: string
  api?: MiniProgramApiConfig
  globals?: MiniProgramGlobalsConfig
  behaviorScheme?: string
  opaqueGlobals?: readonly string[]
}

export type ResolvedMiniProgramExtensionConfig = {
  readonly script: readonly string[]
  readonly template: readonly string[]
  readonly style: readonly string[]
  readonly templateScript: readonly string[]
  readonly config: readonly string[]
}
export type ResolvedMiniProgramFileConfig = {
  readonly appConfig: string
  readonly projectConfig: string
}
export type ResolvedMiniProgramGlobalsConfig = {
  readonly app: string
  readonly page: string
  readonly component: string
  readonly behavior: string
  readonly getApp: string
  readonly getCurrentPages: string
}
export type ResolvedMiniProgramApiConfig = {
  readonly global: string
  readonly aliases: readonly string[]
}

export type ResolvedCompatibilityConfig = {
  preset: 'wechat'
  extensions: ResolvedMiniProgramExtensionConfig
  files: ResolvedMiniProgramFileConfig
  directiveNamespace: string
  api: ResolvedMiniProgramApiConfig
  globals: ResolvedMiniProgramGlobalsConfig
  behaviorScheme: string
  opaqueGlobals: readonly string[]
}

/**
 * Runtime-facing compatibility settings. File extensions and template
 * directives are compile-time concerns and are not serialized in a manifest.
 */
export type RuntimeCompatibilityConfig = Pick<
  ResolvedCompatibilityConfig,
  'api' | 'globals' | 'behaviorScheme' | 'opaqueGlobals'
>

export const WECHAT_COMPATIBILITY: ResolvedCompatibilityConfig = Object.freeze({
  preset: 'wechat',
  extensions: Object.freeze({
    script: Object.freeze(['.js', '.ts']),
    template: Object.freeze(['.wxml']),
    style: Object.freeze(['.wxss']),
    templateScript: Object.freeze(['.wxs', '.sjs']),
    config: Object.freeze(['.json']),
  }),
  files: Object.freeze({
    appConfig: 'app.json',
    projectConfig: 'project.config.json',
  }),
  directiveNamespace: 'wx',
  api: Object.freeze({
    global: 'wx',
    aliases: Object.freeze([]),
  }),
  globals: Object.freeze({
    app: 'App',
    page: 'Page',
    component: 'Component',
    behavior: 'Behavior',
    getApp: 'getApp',
    getCurrentPages: 'getCurrentPages',
  }),
  behaviorScheme: 'wx://',
  opaqueGlobals: Object.freeze([
    'webpackJsonp',
    'cloud',
    'env',
    '__wxConfig',
    '__wxAppCode__',
    '__wxAppData',
  ]),
})

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/
const BEHAVIOR_SCHEME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*:\/\/$/

function readName(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 && IDENTIFIER_PATTERN.test(trimmed) ? trimmed : fallback
}

function normalizeExtension(value: string): string | undefined {
  const trimmed = value.trim()
  if (trimmed.length === 0 || trimmed === '.') return undefined
  return trimmed.startsWith('.') ? trimmed : `.${trimmed}`
}

function readExtensions(
  values: unknown,
  fallback: readonly string[],
): string[] {
  if (!Array.isArray(values)) return [...fallback]
  const output: string[] = []
  for (const value of values) {
    if (typeof value !== 'string') continue
    const extension = normalizeExtension(value)
    if (!extension || output.includes(extension)) continue
    output.push(extension)
  }
  return output.length > 0 ? output : [...fallback]
}

function readStrings(values: unknown, fallback: readonly string[]): string[] {
  if (!Array.isArray(values)) return [...fallback]
  const output: string[] = []
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed.length === 0 || output.includes(trimmed)) continue
    output.push(trimmed)
  }
  return output
}

function readBehaviorScheme(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return BEHAVIOR_SCHEME_PATTERN.test(trimmed) ? trimmed : fallback
}

/** Resolves compatibility conventions against the built-in WeChat defaults. */
export function resolveCompatibility(
  config?: CompatibilityConfig | null,
): ResolvedCompatibilityConfig {
  const extensions = config?.extensions
  const files = config?.files
  const api = config?.api
  const globals = config?.globals
  const apiGlobal = readName(api?.global, WECHAT_COMPATIBILITY.api.global)
  const aliases = readStrings(api?.aliases, WECHAT_COMPATIBILITY.api.aliases)
    .filter((alias) => IDENTIFIER_PATTERN.test(alias) && alias !== apiGlobal)
  return {
    preset: 'wechat',
    extensions: {
      script: readExtensions(extensions?.script, WECHAT_COMPATIBILITY.extensions.script),
      template: readExtensions(extensions?.template, WECHAT_COMPATIBILITY.extensions.template),
      style: readExtensions(extensions?.style, WECHAT_COMPATIBILITY.extensions.style),
      templateScript: readExtensions(
        extensions?.templateScript,
        WECHAT_COMPATIBILITY.extensions.templateScript,
      ),
      config: readExtensions(extensions?.config, WECHAT_COMPATIBILITY.extensions.config),
    },
    files: {
      appConfig: typeof files?.appConfig === 'string' && files.appConfig.trim().length > 0
        ? files.appConfig.trim()
        : WECHAT_COMPATIBILITY.files.appConfig,
      projectConfig: typeof files?.projectConfig === 'string' && files.projectConfig.trim().length > 0
        ? files.projectConfig.trim()
        : WECHAT_COMPATIBILITY.files.projectConfig,
    },
    directiveNamespace: readName(
      config?.directiveNamespace,
      WECHAT_COMPATIBILITY.directiveNamespace,
    ),
    api: {
      global: apiGlobal,
      aliases,
    },
    globals: {
      app: readName(globals?.app, WECHAT_COMPATIBILITY.globals.app),
      page: readName(globals?.page, WECHAT_COMPATIBILITY.globals.page),
      component: readName(globals?.component, WECHAT_COMPATIBILITY.globals.component),
      behavior: readName(globals?.behavior, WECHAT_COMPATIBILITY.globals.behavior),
      getApp: readName(globals?.getApp, WECHAT_COMPATIBILITY.globals.getApp),
      getCurrentPages: readName(
        globals?.getCurrentPages,
        WECHAT_COMPATIBILITY.globals.getCurrentPages,
      ),
    },
    behaviorScheme: readBehaviorScheme(
      config?.behaviorScheme,
      WECHAT_COMPATIBILITY.behaviorScheme,
    ),
    opaqueGlobals: readStrings(config?.opaqueGlobals, WECHAT_COMPATIBILITY.opaqueGlobals),
  }
}

/** Converts a resolved compatibility config into the runtime-facing subset. */
export function runtimeCompatibilityFrom(
  config: CompatibilityConfig | ResolvedCompatibilityConfig | RuntimeCompatibilityConfig = WECHAT_COMPATIBILITY,
): RuntimeCompatibilityConfig {
  const resolved = resolveCompatibility(config)
  return {
    api: {
      global: resolved.api.global,
      aliases: [...resolved.api.aliases],
    },
    globals: { ...resolved.globals },
    behaviorScheme: resolved.behaviorScheme,
    opaqueGlobals: [...resolved.opaqueGlobals],
  }
}

/** Default runtime-facing compatibility for direct runtime construction. */
export const WECHAT_RUNTIME_COMPATIBILITY: RuntimeCompatibilityConfig = Object.freeze({
  api: Object.freeze({
    global: WECHAT_COMPATIBILITY.api.global,
    aliases: Object.freeze([]),
  }),
  globals: Object.freeze({ ...WECHAT_COMPATIBILITY.globals }),
  behaviorScheme: WECHAT_COMPATIBILITY.behaviorScheme,
  opaqueGlobals: Object.freeze([...WECHAT_COMPATIBILITY.opaqueGlobals]),
})

/** Resolves runtime-facing compatibility from a manifest, with WeChat fallback. */
export function runtimeCompatibilityFromManifest(
  manifest?: { runtimeCompatibility?: CompatibilityConfig | RuntimeCompatibilityConfig } | null,
): RuntimeCompatibilityConfig {
  return runtimeCompatibilityFrom(manifest?.runtimeCompatibility ?? WECHAT_COMPATIBILITY)
}
