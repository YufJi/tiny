import fs from 'node:fs/promises'
import path from 'node:path'
import type { PreloadRuleArtifact, ThemeTable } from '@tiny/manifest'
import type { CompilerContext } from './context'
import { relativePath } from './context'
import {
  collectFiles,
  createIgnoreMatcher,
  diagnostic,
  normalizeRelativePath,
  readJson,
} from '../utils'
import { buildNpmPackages } from './npm'

/** One mini-program page, component or the app shell and its sibling files. */
export type SourceEntry = {
  path: string
  scriptPath?: string
  templatePath?: string
  stylePath?: string
  configPath?: string
  /** Subpackage root when the entry belongs to a `subPackages` block. */
  subpackage?: string
  /** Subpackage chunks to load after this entry mounts (async placeholders). */
  asyncSubPackages?: string[]
}

export type SubPackageConfig = {
  root: string
  pages: string[]
  independent: boolean
}

export type AppConfig = {
  path: string
  value: Record<string, unknown>
  /** Normalized main-package pages, in declaration order. */
  pages: string[]
  /** Normalized `subPackages` blocks, in declaration order. */
  subPackages: SubPackageConfig[]
  /** Normalized `preloadRule` entries, in declaration order. */
  preloadRules: PreloadRuleArtifact[]
  /** `tabBar.custom`: render the developer-provided `custom-tab-bar` component. */
  tabBarCustom: boolean
  /** `themeLocation` tables, when the project declares theme variables. */
  theme?: ThemeTable
  /** App-relative path of the theme file (diagnostics and CSS injection). */
  themePath?: string
}

/** Everything discovered from the source tree before any artifact is emitted. */
export type Project = {
  root: string
  appConfig: AppConfig
  /** Packaged files keyed by mini-program-relative path (source and assets). */
  files: Map<string, string>
  /** `app` entry followed by every declared page. */
  entries: SourceEntry[]
  /** Components reachable through `usingComponents`, keyed by entry path. */
  components: Map<string, SourceEntry>
}

export async function prepareOutputDir(context: CompilerContext): Promise<void> {
  if (context.options.clean) {
    await fs.rm(context.options.outputDir, { recursive: true, force: true })
  }
  await fs.mkdir(context.options.outputDir, { recursive: true })
}

export async function resolveProject(context: CompilerContext): Promise<Project> {
  context.root = await resolveRoot(context)
  const { root } = context
  const outputRelative = normalizeRelativePath(
    path.relative(root, context.options.outputDir),
  )
  const isInsideOutput = (relative: string): boolean => (
    outputRelative.length > 0
    && !outputRelative.startsWith('..')
    && (relative === outputRelative || relative.startsWith(`${outputRelative}/`))
  )
  const files = await collectFiles(
    root,
    ['.git', '.cache', 'node_modules'],
    (relative) => isInsideOutput(relative) || context.isPathIgnored?.(relative) === true,
  )
  const byRelative = new Map(files.map((file) => [relativePath(context, file), file]))
  // Mirror node_modules packages into the same virtual tree before entries are
  // resolved, so npm components and their templates/styles compile like source.
  const npm = await buildNpmPackages(context)
  for (const [virtual, staged] of npm.files) {
    if (byRelative.has(virtual)) continue
    byRelative.set(virtual, staged)
  }
  const appConfig = await readAppConfig(context)
  await prepareCustomTabBar(context, appConfig, byRelative)
  const entries = await resolveEntries(context, byRelative, appConfig)
  const components = await resolveComponentEntries(context, byRelative, appConfig.value, entries)
  await assignComponentSubpackages(context, byRelative, appConfig, entries, components)
  return { root, appConfig, files: byRelative, entries, components }
}

async function resolveRoot(context: CompilerContext): Promise<string> {
  const projectConfigPath = path.join(
    context.options.sourceDir,
    context.compatibility.files.projectConfig,
  )
  let value: Record<string, unknown> | undefined
  try {
    await fs.access(projectConfigPath)
    const parsed = await readJson(projectConfigPath)
    context.diagnostics.push(...parsed.diagnostics)
    value = parsed.value
  } catch {
    // A project config file is optional when sourceDir is the mini-program root.
  }
  if (value) {
    context.projectConfig = value
    const compileType = value.compileType
    if (typeof compileType === 'string' && compileType !== 'miniprogram') {
      context.diagnostics.push(diagnostic(
        'error',
        'PROJECT_COMPILE_TYPE_UNSUPPORTED',
        `compileType "${compileType}" is not supported; only "miniprogram" can be compiled.`,
        projectConfigPath,
      ))
    }
    const packOptions = value.packOptions
    if (packOptions && typeof packOptions === 'object' && !Array.isArray(packOptions)) {
      context.isPathIgnored = createIgnoreMatcher(
        (packOptions as Record<string, unknown>).ignore,
      )
    }
    const miniProgramRoot = value.miniprogramRoot
    if (typeof miniProgramRoot === 'string' && miniProgramRoot.length > 0) {
      return path.resolve(context.options.sourceDir, miniProgramRoot)
    }
  }
  return context.options.sourceDir
}

async function readAppConfig(context: CompilerContext): Promise<AppConfig> {
  const configPath = path.join(context.root, context.compatibility.files.appConfig)
  const { value, diagnostics } = await readJson(configPath)
  context.diagnostics.push(...diagnostics)

  const pages: string[] = []
  const seenPages = new Set<string>()
  const rawPages = Array.isArray(value.pages) ? value.pages : []
  if (rawPages.length === 0) {
    context.diagnostics.push(diagnostic(
      'error',
      'APP_PAGES_REQUIRED',
      `${context.compatibility.files.appConfig} must declare at least one page.`,
      configPath,
    ))
  }
  for (const rawPage of rawPages) {
    const page = normalizeDeclaredPath(rawPage)
    if (!page) {
      context.diagnostics.push(diagnostic(
        'error',
        'APP_PAGE_INVALID',
        `Page entry ${JSON.stringify(rawPage)} must be a relative path inside the mini-program root.`,
        configPath,
      ))
      continue
    }
    if (seenPages.has(page)) {
      context.diagnostics.push(diagnostic(
        'warning',
        'APP_PAGE_DUPLICATE',
        `Page "${page}" is declared more than once.`,
        configPath,
      ))
      continue
    }
    seenPages.add(page)
    pages.push(page)
  }

  const subPackages = readSubPackages(context, configPath, value, seenPages)
  validateTabBar(context, configPath, value, new Set([
    ...pages,
    ...subPackages.flatMap((pkg) => pkg.pages),
  ]))
  validateLazyCodeLoading(context, configPath, value)
  const preloadRules = readPreloadRules(context, configPath, value, new Set([
    ...pages,
    ...subPackages.flatMap((pkg) => pkg.pages),
  ]), new Set(subPackages.map((pkg) => pkg.root)))
  const themeInfo = await readTheme(context, value)
  const tabBar = value.tabBar && typeof value.tabBar === 'object' && !Array.isArray(value.tabBar)
    ? value.tabBar as Record<string, unknown>
    : {}
  return {
    path: configPath,
    value,
    pages,
    subPackages,
    preloadRules,
    tabBarCustom: tabBar.custom === true,
    ...themeInfo,
  }
}

function readSubPackages(
  context: CompilerContext,
  configPath: string,
  value: Record<string, unknown>,
  seenPages: Set<string>,
): SubPackageConfig[] {
  const rawSubPackages = Array.isArray(value.subPackages)
    ? value.subPackages
    : Array.isArray(value.subpackages) ? value.subpackages : []
  const subPackages: SubPackageConfig[] = []
  const seenRoots = new Set<string>()
  for (const rawPackage of rawSubPackages) {
    if (!rawPackage || typeof rawPackage !== 'object' || Array.isArray(rawPackage)) {
      context.diagnostics.push(diagnostic(
        'error',
        'APP_SUBPACKAGE_INVALID',
        'Every subPackages entry must be an object with root and pages.',
        configPath,
      ))
      continue
    }
    const pkg = rawPackage as Record<string, unknown>
    const root = normalizeDeclaredPath(pkg.root)
    if (!root || !Array.isArray(pkg.pages)) {
      context.diagnostics.push(diagnostic(
        'error',
        'APP_SUBPACKAGE_INVALID',
        'Every subPackages entry must have a relative root and a pages array.',
        configPath,
      ))
      continue
    }
    if (seenRoots.has(root)) {
      context.diagnostics.push(diagnostic(
        'error',
        'APP_SUBPACKAGE_ROOT_DUPLICATE',
        `Subpackage root "${root}" is declared more than once.`,
        configPath,
      ))
      continue
    }
    seenRoots.add(root)
    const pages: string[] = []
    for (const rawPage of pkg.pages) {
      const page = normalizeDeclaredPath(rawPage)
      if (!page) {
        context.diagnostics.push(diagnostic(
          'error',
          'APP_SUBPACKAGE_INVALID',
          `Subpackage page ${JSON.stringify(rawPage)} must be a relative path.`,
          configPath,
        ))
        continue
      }
      const fullPath = normalizeRelativePath(path.posix.join(root, page))
      if (seenPages.has(fullPath)) {
        context.diagnostics.push(diagnostic(
          'warning',
          'APP_PAGE_DUPLICATE',
          `Page "${fullPath}" is declared more than once.`,
          configPath,
        ))
        continue
      }
      seenPages.add(fullPath)
      pages.push(fullPath)
    }
    subPackages.push({
      root,
      pages,
      independent: pkg.independent === true,
    })
  }
  return subPackages
}

function validateTabBar(
  context: CompilerContext,
  configPath: string,
  value: Record<string, unknown>,
  pagePaths: Set<string>,
): void {
  const tabBar = value.tabBar
  if (!tabBar || typeof tabBar !== 'object' || Array.isArray(tabBar)) return
  const list = (tabBar as Record<string, unknown>).list
  if (!Array.isArray(list)) return
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const pagePath = normalizeDeclaredPath((item as Record<string, unknown>).pagePath)
    if (pagePath && !pagePaths.has(pagePath)) {
      context.diagnostics.push(diagnostic(
        'warning',
        'APP_TABBAR_PAGE_NOT_FOUND',
        `tabBar pagePath "${pagePath}" is not declared in pages or subPackages.`,
        configPath,
      ))
    }
  }
}

/**
 * Read `themeLocation` (or the default `theme.json` when `darkmode` is on).
 *
 * Variables are plain strings; the compiler resolves `@name` references in
 * app/page/component JSON for both themes and emits the light resolution as
 * `effective` plus a `darkEffective` overlay.
 */
async function readTheme(
  context: CompilerContext,
  appConfig: Record<string, unknown>,
): Promise<Pick<AppConfig, 'theme' | 'themePath'>> {
  const configured = typeof appConfig.themeLocation === 'string' && appConfig.themeLocation.length > 0
    ? appConfig.themeLocation
    : appConfig.darkmode === true
      ? 'theme.json'
      : undefined
  if (!configured) return {}
  const absolute = path.resolve(context.root, configured)
  const relative = path.relative(context.root, absolute)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    context.diagnostics.push(diagnostic(
      'error',
      'THEME_FILE_OUTSIDE_ROOT',
      `themeLocation "${configured}" points outside the mini-program root.`,
      path.join(context.root, context.compatibility.files.appConfig),
    ))
    return {}
  }
  if (!(await fileExists(absolute))) {
    context.diagnostics.push(diagnostic(
      'error',
      'THEME_FILE_NOT_FOUND',
      `themeLocation "${configured}" does not exist.`,
      absolute,
    ))
    return {}
  }
  const { value, diagnostics } = await readJson(absolute)
  context.diagnostics.push(...diagnostics)
  const theme = normalizeTheme(context, absolute, value)
  return theme ? { theme, themePath: normalizeRelativePath(relative) } : {}
}

function normalizeTheme(
  context: CompilerContext,
  file: string,
  value: Record<string, unknown>,
): ThemeTable | undefined {
  const modes: Array<'light' | 'dark'> = ['light', 'dark']
  const table: ThemeTable = { light: {}, dark: {} }
  let valid = true
  for (const mode of modes) {
    const raw = value[mode]
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      context.diagnostics.push(diagnostic(
        'error',
        'THEME_MODE_MISSING',
        `theme.json must declare a "${mode}" object.`,
        file,
      ))
      valid = false
      continue
    }
    for (const [name, rawValue] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof rawValue !== 'string') {
        context.diagnostics.push(diagnostic(
          'warning',
          'THEME_VALUE_INVALID',
          `theme variable "${name}" in "${mode}" must be a string.`,
          file,
        ))
        continue
      }
      table[mode][name] = rawValue
    }
  }
  return valid ? table : undefined
}

/**
 * Resolve `@name` references in the app-level theme-capable fields.
 *
 * Only `window` and `tabBar` are theme-aware; `usingComponents` paths can also
 * start with `@` (scoped npm packages), so a naive recursive walk would treat
 * them as variables. The raw config is never mutated.
 */
export function resolveAppConfigTheme(
  value: Record<string, unknown>,
  theme: ThemeTable | undefined,
  mode: 'light' | 'dark',
  context: CompilerContext,
  file: string | undefined,
): Record<string, unknown> {
  if (!theme) return value
  const resolved = { ...value }
  for (const key of ['window', 'tabBar']) {
    if (resolved[key] === undefined) continue
    resolved[key] = resolveThemeTree(resolved[key], theme, mode, context, file)
  }
  return resolved
}

/** Page/component JSON window fields that WeChat allows to use theme variables. */
const PAGE_THEME_FIELDS = [
  'navigationBarBackgroundColor',
  'navigationBarTextStyle',
  'backgroundColor',
  'backgroundTextStyle',
] as const

export function resolvePageConfigTheme(
  value: Record<string, unknown>,
  theme: ThemeTable | undefined,
  mode: 'light' | 'dark',
  context: CompilerContext,
  file: string | undefined,
): Record<string, unknown> {
  if (!theme) return value
  const resolved = { ...value }
  for (const key of PAGE_THEME_FIELDS) {
    if (resolved[key] === undefined) continue
    resolved[key] = resolveThemeTree(resolved[key], theme, mode, context, file)
  }
  return resolved
}

/**
 * Resolve `@name` inside a selected subtree. Unknown variables stay as `@name`
 * and emit a warning so a host never silently receives an empty color.
 */
function resolveThemeTree(
  value: unknown,
  theme: ThemeTable,
  mode: 'light' | 'dark',
  context: CompilerContext,
  file: string | undefined,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => resolveThemeTree(item, theme, mode, context, file))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      resolveThemeTree(item, theme, mode, context, file),
    ]))
  }
  if (typeof value !== 'string' || !value.startsWith('@') || value.length < 2) return value
  const name = value.slice(1)
  const resolved = theme[mode][name]
  if (resolved !== undefined) return resolved
  context.diagnostics.push(diagnostic(
    'warning',
    'THEME_VARIABLE_NOT_FOUND',
    `Theme variable "${name}" is not defined for the ${mode} theme.`,
    file,
  ))
  return value
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function readPreloadRules(
  context: CompilerContext,
  configPath: string,
  value: Record<string, unknown>,
  pagePaths: Set<string>,
  packageRoots: Set<string>,
): PreloadRuleArtifact[] {
  const raw = value.preloadRule
  if (raw === undefined) return []
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    context.diagnostics.push(diagnostic(
      'error',
      'APP_PRELOAD_RULE_INVALID',
      'preloadRule must be an object keyed by page path.',
      configPath,
    ))
    return []
  }
  const rules: PreloadRuleArtifact[] = []
  for (const [rawPage, rawRule] of Object.entries(raw as Record<string, unknown>)) {
    const page = normalizeDeclaredPath(rawPage)
    if (!page || !pagePaths.has(page)) {
      context.diagnostics.push(diagnostic(
        'warning',
        'APP_PRELOAD_PAGE_NOT_FOUND',
        `preloadRule page "${rawPage}" is not declared in pages or subPackages.`,
        configPath,
      ))
      continue
    }
    if (!rawRule || typeof rawRule !== 'object' || Array.isArray(rawRule)) {
      context.diagnostics.push(diagnostic(
        'warning',
        'APP_PRELOAD_RULE_INVALID',
        `preloadRule for "${page}" must be an object.`,
        configPath,
      ))
      continue
    }
    const rule = rawRule as Record<string, unknown>
    const packages: string[] = []
    for (const rawPackage of Array.isArray(rule.packages) ? rule.packages : []) {
      const root = normalizeDeclaredPath(rawPackage)
      if (!root || !packageRoots.has(root)) {
        context.diagnostics.push(diagnostic(
          'warning',
          'APP_PRELOAD_PACKAGE_NOT_FOUND',
          `preloadRule for "${page}" references unknown subpackage "${String(rawPackage)}".`,
          configPath,
        ))
        continue
      }
      if (!packages.includes(root)) packages.push(root)
    }
    let network: 'all' | 'wifi' = 'all'
    if (rule.network !== undefined) {
      if (rule.network === 'all' || rule.network === 'wifi') network = rule.network
      else {
        context.diagnostics.push(diagnostic(
          'warning',
          'APP_PRELOAD_NETWORK_INVALID',
          `preloadRule for "${page}" has an invalid network ${JSON.stringify(rule.network)}.`,
          configPath,
        ))
      }
    }
    if (packages.length > 0) rules.push({ page, network, packages })
  }
  return rules
}

function validateLazyCodeLoading(
  context: CompilerContext,
  configPath: string,
  value: Record<string, unknown>,
): void {
  const lazy = value.lazyCodeLoading
  if (lazy === undefined) return
  if (lazy !== 'requiredComponents') {
    context.diagnostics.push(diagnostic(
      'warning',
      'APP_LAZY_CODE_LOADING_UNSUPPORTED',
      `lazyCodeLoading ${JSON.stringify(lazy)} is not supported; use "requiredComponents".`,
      configPath,
    ))
  }
}

/** Normalize a declared page/root path and reject paths outside the app root. */
function normalizeDeclaredPath(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed.startsWith('/') || trimmed.startsWith('..')) return undefined
  const normalized = normalizeRelativePath(trimmed)
  if (!normalized || normalized.startsWith('..') || path.isAbsolute(normalized)) return undefined
  return normalized
}

/**
 * Register the developer's `custom-tab-bar/index` as an app-level component.
 *
 * The runtime mounts it as an independent page-level `tabRoot`; the compiler
 * emits the component artifact and app-level `usingComponents` registration.
 */
async function prepareCustomTabBar(
  context: CompilerContext,
  appConfig: AppConfig,
  byRelative: Map<string, string>,
): Promise<void> {
  if (!appConfig.tabBarCustom) return
  const entryPath = 'custom-tab-bar/index'
  const entry = await resolveEntry(context, byRelative, entryPath)
  if (!entry) {
    context.diagnostics.push(diagnostic(
      'error',
      'CUSTOM_TABBAR_NOT_FOUND',
      'tabBar.custom is true but custom-tab-bar/index does not exist.',
      appConfig.path,
    ))
    return
  }
  const usingComponents = readUsingComponents(appConfig.value)
  appConfig.value = {
    ...appConfig.value,
    usingComponents: {
      ...usingComponents,
      'custom-tab-bar': `/${entryPath}`,
    },
  }
}

async function resolveEntries(
  context: CompilerContext,
  byRelative: Map<string, string>,
  appConfig: AppConfig,
): Promise<SourceEntry[]> {
  const entries: SourceEntry[] = []
  const appEntry = await resolveEntry(context, byRelative, 'app')
  if (appEntry) entries.push(appEntry)
  const subpackageByPage = new Map<string, string>()
  for (const pkg of appConfig.subPackages) {
    for (const page of pkg.pages) subpackageByPage.set(page, pkg.root)
  }
  for (const pagePath of [...appConfig.pages, ...subpackageByPage.keys()]) {
    const entry = await resolveEntry(context, byRelative, pagePath)
    if (entry) {
      const subpackage = subpackageByPage.get(pagePath)
      if (subpackage) entry.subpackage = subpackage
      entries.push(entry)
    } else {
      context.diagnostics.push(diagnostic(
        'error',
        'PAGE_NOT_FOUND',
        `Page "${pagePath}" does not have a matching source file.`,
        pagePath,
      ))
    }
  }
  return entries
}

/**
 * Walks `usingComponents` transitively so nested components are compiled too,
 * and records every referenced tag for the stylesheet compiler.
 */
async function resolveComponentEntries(
  context: CompilerContext,
  byRelative: Map<string, string>,
  appConfig: Record<string, unknown>,
  pageEntries: SourceEntry[],
): Promise<Map<string, SourceEntry>> {
  const components = new Map<string, SourceEntry>()
  const appComponents = readUsingComponents(appConfig)
  const visit = async (entry: SourceEntry, componentRefs: Record<string, string>): Promise<void> => {
    for (const tag of Object.keys(componentRefs)) context.customComponentTags.add(tag)
    for (const componentPath of Object.values(componentRefs)) {
      const normalized = resolveEntryReference(context, byRelative, entry.path, componentPath)
      if (components.has(normalized)) continue
      const component = await resolveEntry(context, byRelative, normalized)
      if (!component) {
        context.diagnostics.push(diagnostic(
          'error',
          'COMPONENT_NOT_FOUND',
          `Component "${componentPath}" does not have a matching source file.`,
          normalized,
        ))
        continue
      }
      components.set(normalized, component)
      const config = await readConfiguration(context, component.configPath)
      await visit(component, readUsingComponents(config))
    }
  }

  const appEntry = pageEntries.find((entry) => entry.path === 'app')
  if (appEntry) await visit(appEntry, appComponents)
  for (const page of pageEntries.filter((entry) => entry.path !== 'app')) {
    const config = await readConfiguration(context, page.configPath)
    await visit(page, readUsingComponents(config))
  }

  return components
}

/**
 * Decide which subpackage owns each component.
 *
 * WeChat forbids a main-package page from using a subpackage component, and a
 * component used by more than one package has to stay available everywhere.
 * The compiler therefore keeps the main package and any shared component
 * eager, and assigns a component to a subpackage only when that package is its
 * single owner. Assigned components are emitted into that package's service
 * chunk and loaded on demand.
 */
async function assignComponentSubpackages(
  context: CompilerContext,
  byRelative: Map<string, string>,
  appConfig: AppConfig,
  entries: SourceEntry[],
  components: Map<string, SourceEntry>,
): Promise<void> {
  const configs = new Map<string, Record<string, unknown>>()
  const readEntryConfig = async (entry: SourceEntry): Promise<Record<string, unknown>> => {
    const cached = configs.get(entry.path)
    if (cached) return cached
    const config = await readConfiguration(context, entry.configPath)
    configs.set(entry.path, config)
    return config
  }

  const globalComponents = readUsingComponents(appConfig.value)
  const independentRoots = new Set(
    appConfig.subPackages.filter((pkg) => pkg.independent).map((pkg) => pkg.root),
  )
  const physicalRootOf = (path: string): string | undefined => (
    appConfig.subPackages
      .map((pkg) => pkg.root)
      .sort((left, right) => right.length - left.length)
      .find((root) => path === root || path.startsWith(`${root}/`))
  )
  const graph = new Map<string, string[]>()
  const fullGraph = new Map<string, string[]>()
  const asyncEdges: Array<{ owner: string; component: string; root: string }> = []
  const owners = [...entries.filter((entry) => entry.path !== 'app'), ...components.values()]
  for (const entry of owners) {
    const config = await readEntryConfig(entry)
    const independent = entry.subpackage !== undefined && independentRoots.has(entry.subpackage)
    // Main-package `usingComponents` and app-level components are not available
    // inside an independent package.
    const merged = independent
      ? readUsingComponents(config)
      : { ...globalComponents, ...readUsingComponents(config) }
    const placeholderTags = new Set(
      Object.keys(
        config.componentPlaceholder && typeof config.componentPlaceholder === 'object'
          ? config.componentPlaceholder as Record<string, unknown>
          : {},
      ),
    )
    const references: string[] = []
    const allReferences: string[] = []
    for (const [tag, reference] of Object.entries(merged)) {
      const resolved = resolveEntryReference(context, byRelative, entry.path, reference)
      if (!components.has(resolved)) continue
      allReferences.push(resolved)
      const physicalRoot = physicalRootOf(resolved)
      const asynchronous = placeholderTags.has(tag)
        && physicalRoot !== undefined
        && physicalRoot !== entry.subpackage
      if (asynchronous) {
        asyncEdges.push({ owner: entry.path, component: resolved, root: physicalRoot })
        continue
      }
      references.push(resolved)
    }
    if (independent && entry.subpackage) {
      for (const reference of allReferences) {
        if (!reference.startsWith(`${entry.subpackage}/`)) {
          context.diagnostics.push(diagnostic(
            'error',
            'INDEPENDENT_PACKAGE_DEPENDENCY',
            `Independent package "${entry.subpackage}" cannot use component "${reference}".`,
            entry.configPath,
          ))
        }
      }
    }
    graph.set(entry.path, [...new Set(references)])
    fullGraph.set(entry.path, [...new Set(allReferences)])
  }
  for (const edge of asyncEdges) {
    const owner = entries.find((entry) => entry.path === edge.owner)
      ?? components.get(edge.owner)
    if (!owner) continue
    owner.asyncSubPackages = [...new Set([...(owner.asyncSubPackages ?? []), edge.root])]
  }

  const closure = (
    seeds: string[],
    collect: (path: string) => boolean,
    edges: Map<string, string[]> = graph,
  ): Set<string> => {
    const seen = new Set<string>()
    const collected = new Set<string>()
    const queue = [...seeds]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (seen.has(current)) continue
      seen.add(current)
      if (collect(current)) collected.add(current)
      // Keep walking through non-collected owners (for example a page whose
      // component belongs to a package, or a main component's dependency).
      queue.push(...(edges.get(current) ?? []))
    }
    return collected
  }

  const allComponents = new Set(components.keys())
  const mainSeeds = [
    ...entries.filter((entry) => entry.path === 'app' || !entry.subpackage).map((entry) => entry.path),
    ...Object.values(globalComponents)
      .map((reference) => resolveEntryReference(context, byRelative, '', reference))
      .filter((reference) => components.has(reference)),
  ]
  const main = closure(mainSeeds, (path) => path === 'app'
    || entries.some((entry) => entry.path === path)
    || allComponents.has(path))

  const packageComponents = new Map<string, Set<string>>()
  for (const pkg of appConfig.subPackages) {
    const pages = entries.filter((entry) => entry.subpackage === pkg.root).map((entry) => entry.path)
    const asyncSeeds = asyncEdges
      .filter((edge) => edge.root === pkg.root)
      .map((edge) => edge.component)
    packageComponents.set(pkg.root, closure(
      [...pages, ...asyncSeeds],
      (path) => allComponents.has(path) && !main.has(path),
      fullGraph,
    ))
  }

  const ownersByComponent = new Map<string, string[]>()
  for (const [root, owned] of packageComponents) {
    for (const component of owned) {
      const roots = ownersByComponent.get(component) ?? []
      roots.push(root)
      ownersByComponent.set(component, roots)
    }
  }
  const shared = [...ownersByComponent]
    .filter(([, roots]) => roots.length > 1)
    .map(([component]) => component)
  const eagerMain = shared.length > 0
    ? closure([...main, ...shared], (path) => allComponents.has(path))
    : main

  for (const [path, entry] of components) {
    const roots = ownersByComponent.get(path)
    if (!roots || roots.length !== 1 || eagerMain.has(path)) continue
    entry.subpackage = roots[0]
  }
}

async function resolveEntry(
  context: CompilerContext,
  byRelative: Map<string, string>,
  entryPath: string,
): Promise<SourceEntry | null> {
  const normalized = normalizeRelativePath(entryPath)
  const findByExtension = (base: string, extensions: readonly string[]) => {
    for (const extension of extensions) {
      const found = byRelative.get(`${base}${extension}`)
      if (found) return found
    }
    return undefined
  }
  const findTemplate = (base: string) => findByExtension(base, context.extensions.template)
  const findStyle = (base: string) => findByExtension(base, context.extensions.style)
  const findScript = (base: string) => findByExtension(base, context.extensions.script)
  const findConfig = (base: string) => findByExtension(base, context.extensions.config)

  // Pages/components may reference a file (`foo`) or a directory with an
  // `index` entry (`foo/index.*`), mirroring the WeChat resolution rules.
  for (const base of [normalized, `${normalized}/index`]) {
    const scriptPath = findScript(base)
    const templatePath = findTemplate(base)
    if (scriptPath || templatePath) {
      return {
        path: normalized,
        scriptPath,
        templatePath,
        stylePath: findStyle(base),
        configPath: findConfig(base),
      }
    }
  }
  return null
}

export function resolveEntryReference(
  context: CompilerContext,
  byRelative: Map<string, string>,
  sourceEntryPath: string,
  reference: string,
): string {
  if (reference.startsWith('/')) return normalizeRelativePath(reference.slice(1))
  // Relative references from an npm package stay inside the generated
  // `miniprogram_npm` tree. The package source lives in a staging directory,
  // so resolve against the virtual path instead of the app source root.
  if (sourceEntryPath.startsWith('miniprogram_npm/') && reference.startsWith('.')) {
    return normalizeRelativePath(path.posix.join(path.posix.dirname(sourceEntryPath), reference))
  }
  // An empty owner means the mini-program root (app-level `usingComponents`).
  const baseDirectory = sourceEntryPath
    ? path.dirname(path.join(context.options.sourceDir, sourceEntryPath))
    : context.options.sourceDir
  const relativeReference = normalizeRelativePath(path.relative(
    context.options.sourceDir,
    path.resolve(baseDirectory, reference),
  ))
  if (reference.startsWith('.')) return relativeReference
  // Bare specifiers follow the WeChat npm convention and resolve from the
  // pre-built `miniprogram_npm` tree (e.g. `@vant/weapp/button/index`).
  if (reference.startsWith('miniprogram_npm/')) return normalizeRelativePath(reference)
  if (reference.startsWith('plugin://')) return normalizeRelativePath(reference)
  const npmReference = normalizeRelativePath(`miniprogram_npm/${reference}`)
  if (hasEntryFiles(context, byRelative, npmReference)) return npmReference
  // Keep supporting bare paths that happen to name a local component.
  if (hasEntryFiles(context, byRelative, relativeReference)) return relativeReference
  return npmReference
}

function hasEntryFiles(
  context: CompilerContext,
  byRelative: Map<string, string>,
  entryPath: string,
): boolean {
  const extensions = [
    ...context.extensions.script,
    ...context.extensions.template,
    ...context.extensions.style,
    ...context.extensions.config,
  ]
  return [entryPath, `${entryPath}/index`].some((base) =>
    extensions.some((extension) => byRelative.has(`${base}${extension}`)),
  )
}

export function readUsingComponents(config: Record<string, unknown>): Record<string, string> {
  const usingComponents = config.usingComponents
  if (!usingComponents || typeof usingComponents !== 'object') return {}
  return Object.fromEntries(Object.entries(usingComponents).map(([key, value]) => [key, String(value)]))
}

export async function readConfiguration(
  context: CompilerContext,
  configPath?: string,
): Promise<Record<string, unknown>> {
  if (!configPath) return {}
  try {
    const { value, diagnostics } = await readJson(configPath)
    context.diagnostics.push(...diagnostics)
    return value
  } catch {
    return {}
  }
}
