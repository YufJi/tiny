import { existsSync, readFileSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'
import { build as esbuild } from 'esbuild'
import { TmplGroup, parseErrorMessage } from '@tiny/template-compiler'
import { StyleSheetTransformer } from '@tiny/stylesheet-compiler'
import {
  resolveNaming,
  type NamingConfig,
  type ResolvedNamingConfig,
} from '@tiny/manifest'
import type {
  AppArtifact,
  AssetArtifact,
  CompileOptions,
  CompileResult,
  ComponentArtifact,
  ConfigurationArtifact,
  Diagnostic,
  Manifest,
  PageArtifact,
  ScriptArtifact,
  StyleArtifact,
  TemplateArtifact,
} from './types'
import {
  collectFiles,
  copyFile,
  diagnostic,
  ensureDir,
  normalizeRelativePath,
  readJson,
  relativeFromTarget,
  sanitizeScope,
  toPosixPath,
  withoutExtension,
  writeFileWithSourceMap,
} from './utils'

const SCRIPT_EXTENSIONS = ['.js', '.ts']
const TEMPLATE_EXTENSIONS = ['.wxml']
const STYLE_EXTENSIONS = ['.wxss']
const WXS_EXTENSIONS = ['.wxs', '.sjs']
const PROJECT_CONFIG_FILE = 'tiny.config.json'
const ASSET_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp',
  '.eot', '.woff', '.woff2', '.ttf', '.otf',
])

type SourceEntry = {
  path: string
  scriptPath?: string
  templatePath?: string
  stylePath?: string
  configPath?: string
}

export async function compileMiniProgram(options: CompileOptions): Promise<CompileResult> {
  const compiler = new MiniProgramCompiler(options)
  return compiler.compile()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Reads engine naming from `<sourceDir>/tiny.config.json`:
 *
 * ```json
 * { "naming": { "prefix": "tiny-" } }
 * ```
 *
 * For convenience the `prefix` / `apiAliases` fields may also live at the top
 * level. Missing files and invalid JSON fall back to the default namespace.
 */
function readProjectNaming(
  sourceDir: string,
  diagnostics: Diagnostic[],
): NamingConfig | undefined {
  const configPath = path.join(sourceDir, PROJECT_CONFIG_FILE)
  if (!existsSync(configPath)) return undefined
  try {
    const raw = JSON.parse(readFileSync(configPath, 'utf8')) as unknown
    if (!isRecord(raw)) return undefined
    if (isRecord(raw.naming)) return raw.naming as NamingConfig
    const apiAliases = Array.isArray(raw.apiAliases)
      ? raw.apiAliases.filter((alias): alias is string => typeof alias === 'string')
      : undefined
    if (typeof raw.prefix === 'string' || apiAliases !== undefined) {
      return {
        prefix: typeof raw.prefix === 'string' ? raw.prefix : undefined,
        apiAliases,
      }
    }
    return undefined
  } catch (error) {
    diagnostics.push(diagnostic(
      'warning',
      'TINY_CONFIG_INVALID',
      `Unable to read ${PROJECT_CONFIG_FILE}: ${error instanceof Error ? error.message : String(error)}`,
      configPath,
    ))
    return undefined
  }
}

/** Explicit compile options override `tiny.config.json`; both are optional. */
function resolveNamingInput(
  options: CompileOptions,
  sourceDir: string,
  diagnostics: Diagnostic[],
): NamingConfig | undefined {
  const fileNaming = readProjectNaming(sourceDir, diagnostics)
  if (options.naming) return { ...fileNaming, ...options.naming }
  if (options.prefix !== undefined || options.apiAliases !== undefined) {
    return {
      ...fileNaming,
      ...(options.prefix !== undefined ? { prefix: options.prefix } : {}),
      ...(options.apiAliases !== undefined ? { apiAliases: options.apiAliases } : {}),
    }
  }
  return fileNaming
}

class MiniProgramCompiler {
  private readonly options: Required<
    Omit<CompileOptions, 'naming' | 'prefix' | 'apiAliases'>
  >
  private readonly naming: ResolvedNamingConfig
  private readonly diagnostics: Diagnostic[] = []
  private readonly scripts = new Map<string, ScriptArtifact>()
  private readonly templates = new Map<string, TemplateArtifact>()
  private readonly styles = new Map<string, StyleArtifact>()
  private readonly assets: AssetArtifact[] = []

  constructor(options: CompileOptions) {
    this.options = {
      clean: options.clean ?? true,
      dev: options.dev ?? false,
      rpxRatio: options.rpxRatio ?? 750,
      scopePrefix: options.scopePrefix ?? 'tiny',
      sourceDir: path.resolve(options.sourceDir),
      outputDir: path.resolve(options.outputDir),
    }
    this.naming = resolveNaming(
      resolveNamingInput(options, this.options.sourceDir, this.diagnostics),
    )
  }

  async compile(): Promise<CompileResult> {
    await this.prepareOutput()
    const root = await this.resolveRoot()
    const files = await collectFiles(root, [
      ...SCRIPT_EXTENSIONS,
      ...TEMPLATE_EXTENSIONS,
      ...STYLE_EXTENSIONS,
      ...WXS_EXTENSIONS,
    ])
    const byRelative = new Map(files.map((file) => [this.relative(root, file), file]))
    const appConfig = await this.readAppConfig(root)

    const pagePaths = this.resolvePagePaths(appConfig.value)
    const pageEntries = await this.resolveEntries(root, byRelative, pagePaths)
    const componentEntries = await this.resolveComponentEntries(
      root,
      byRelative,
      appConfig.value,
      pageEntries,
    )

    await this.compileScripts(root, byRelative, pageEntries, componentEntries)
    await this.compileTemplates(root, byRelative, pageEntries, componentEntries)
    await this.compileStyles(root, byRelative, pageEntries, componentEntries)
    await this.copyAssets(root)

    const manifest = await this.createManifest(root, appConfig, pageEntries, componentEntries)
    await this.writeEntryArtifacts(manifest)
    const manifestPath = path.join(this.options.outputDir, 'manifest.json')
    await ensureDir(manifestPath)
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

    return {
      outputDir: this.options.outputDir,
      manifestPath,
      manifest,
      diagnostics: this.diagnostics,
      outputPath: this.options.outputDir,
    }
  }

  private relative(root: string, filePath: string): string {
    return normalizeRelativePath(path.relative(root, filePath))
  }

  private outputPath(relativePath: string): string {
    return path.join(this.options.outputDir, relativePath)
  }

  private async prepareOutput(): Promise<void> {
    if (this.options.clean) {
      await fs.rm(this.options.outputDir, { recursive: true, force: true })
    }
    await fs.mkdir(this.options.outputDir, { recursive: true })
  }

  private async resolveRoot(): Promise<string> {
    const projectConfigPath = path.join(this.options.sourceDir, 'project.config.json')
    try {
      const { value } = await readJson(projectConfigPath)
      const miniProgramRoot = value.miniprogramRoot
      if (typeof miniProgramRoot === 'string' && miniProgramRoot.length > 0) {
        return path.resolve(this.options.sourceDir, miniProgramRoot)
      }
    } catch {
      // A project config file is optional when sourceDir is the mini-program root.
    }
    return this.options.sourceDir
  }

  private async readAppConfig(root: string): Promise<{
    path: string
    value: Record<string, unknown>
  }> {
    const configPath = path.join(root, 'app.json')
    const { value, diagnostics } = await readJson(configPath)
    this.diagnostics.push(...diagnostics)
    if (!Array.isArray(value.pages) || value.pages.length === 0) {
      this.diagnostics.push(diagnostic(
        'error',
        'APP_PAGES_REQUIRED',
        'app.json must declare at least one page.',
        configPath,
      ))
    }
    return { path: configPath, value }
  }

  private resolvePagePaths(appConfig: Record<string, unknown>): string[] {
    const paths: string[] = []
    const pages = appConfig.pages
    if (Array.isArray(pages)) {
      for (const page of pages) {
        if (typeof page === 'string') paths.push(normalizeRelativePath(page))
      }
    }
    const subPackages = Array.isArray(appConfig.subPackages)
      ? appConfig.subPackages
      : Array.isArray(appConfig.subpackages) ? appConfig.subpackages : []
    for (const packageValue of subPackages) {
      if (!packageValue || typeof packageValue !== 'object') continue
      const pkg = packageValue as Record<string, unknown>
      if (typeof pkg.root !== 'string' || !Array.isArray(pkg.pages)) continue
      const packageRoot = normalizeRelativePath(pkg.root)
      for (const page of pkg.pages) {
        if (typeof page === 'string') {
          paths.push(normalizeRelativePath(path.posix.join(packageRoot, page)))
        }
      }
    }
    return [...new Set(paths)]
  }

  private async resolveEntries(
    root: string,
    byRelative: Map<string, string>,
    pagePaths: string[],
  ): Promise<SourceEntry[]> {
    const entries: SourceEntry[] = []
    const appEntry = await this.resolveEntry(root, byRelative, 'app')
    if (appEntry) entries.push(appEntry)
    for (const pagePath of pagePaths) {
      const entry = await this.resolveEntry(root, byRelative, pagePath)
      if (entry) entries.push(entry)
      else this.diagnostics.push(diagnostic(
        'error',
        'PAGE_NOT_FOUND',
        `Page "${pagePath}" does not have a matching source file.`,
        pagePath,
      ))
    }
    return entries
  }

  private async resolveComponentEntries(
    root: string,
    byRelative: Map<string, string>,
    appConfig: Record<string, unknown>,
    pageEntries: SourceEntry[],
  ): Promise<Map<string, SourceEntry>> {
    const components = new Map<string, SourceEntry>()
    const appComponents = this.readUsingComponents(appConfig)
    const visit = async (entry: SourceEntry, componentRefs: Record<string, string>): Promise<void> => {
      for (const componentPath of Object.values(componentRefs)) {
        const normalized = this.resolveEntryReference(entry.path, componentPath)
        if (components.has(normalized)) continue
        const component = await this.resolveEntry(root, byRelative, normalized)
        if (!component) {
          this.diagnostics.push(diagnostic(
            'error',
            'COMPONENT_NOT_FOUND',
            `Component "${componentPath}" does not have a matching source file.`,
            normalized,
          ))
          continue
        }
        components.set(normalized, component)
        const config = await this.readConfiguration(root, component.configPath)
        await visit(component, this.readUsingComponents(config))
      }
    }

    const appEntry = pageEntries.find((entry) => entry.path === 'app')
    if (appEntry) await visit(appEntry, appComponents)
    for (const page of pageEntries.filter((entry) => entry.path !== 'app')) {
      const config = await this.readConfiguration(root, page.configPath)
      await visit(page, this.readUsingComponents(config))
    }

    return components
  }

  private async resolveEntry(
    root: string,
    byRelative: Map<string, string>,
    entryPath: string,
  ): Promise<SourceEntry | null> {
    const normalized = normalizeRelativePath(entryPath)
    const findTemplate = (base: string) => byRelative.get(`${base}.wxml`)
    const findStyle = (base: string) => byRelative.get(`${base}.wxss`)
    const findScript = (base: string) => {
      for (const extension of SCRIPT_EXTENSIONS) {
        const scriptPath = byRelative.get(`${base}${extension}`)
        if (scriptPath) return scriptPath
      }
      return undefined
    }

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
          configPath: path.join(root, `${base}.json`),
        }
      }
    }
    return null
  }

  private resolveEntryReference(sourceEntryPath: string, reference: string): string {
    if (reference.startsWith('/')) return normalizeRelativePath(reference.slice(1))
    return normalizeRelativePath(path.relative(
      this.options.sourceDir,
      path.resolve(path.dirname(path.join(this.options.sourceDir, sourceEntryPath)), reference),
    ))
  }

  private readUsingComponents(config: Record<string, unknown>): Record<string, string> {
    const usingComponents = config.usingComponents
    if (!usingComponents || typeof usingComponents !== 'object') return {}
    return Object.fromEntries(Object.entries(usingComponents).map(([key, value]) => [key, String(value)]))
  }

  private async readConfiguration(
    root: string,
    configPath?: string,
  ): Promise<Record<string, unknown>> {
    if (!configPath) return {}
    try {
      const { value, diagnostics } = await readJson(configPath)
      this.diagnostics.push(...diagnostics)
      return value
    } catch {
      return {}
    }
  }

  private async compileScripts(
    root: string,
    byRelative: Map<string, string>,
    pageEntries: SourceEntry[],
    componentEntries: Map<string, SourceEntry>,
  ): Promise<void> {
    const entryScriptPaths = [
      ...pageEntries.map((entry) => entry.scriptPath),
      ...[...componentEntries.values()].map((entry) => entry.scriptPath),
    ].filter((value): value is string => Boolean(value))
    const scriptPaths = await this.collectReachableScripts(root, byRelative, entryScriptPaths)

    for (const scriptPath of scriptPaths) {
      const relativePath = this.relative(root, scriptPath)
      if (this.scripts.has(relativePath)) continue
      const outputPath = `scripts/${relativePath.replace(/\.(ts|tsx)$/i, '.js')}`
      const source = await fs.readFile(scriptPath, 'utf8')
      const transformed = ts.transpileModule(source, {
        fileName: scriptPath,
        compilerOptions: {
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
          sourceMap: true,
          inlineSources: false,
          esModuleInterop: true,
        },
        reportDiagnostics: true,
      })
      for (const item of transformed.diagnostics ?? []) {
        this.diagnostics.push(diagnostic(
          'error',
          'SCRIPT_TRANSPILE_ERROR',
          ts.flattenDiagnosticMessageText(item.messageText, '\n'),
          scriptPath,
          item.file && item.start !== undefined
            ? {
                line: item.file.getLineAndCharacterOfPosition(item.start).line + 1,
                column: item.file.getLineAndCharacterOfPosition(item.start).character + 1,
              }
            : undefined,
        ))
      }
      let sourceMap: string | undefined
      if (transformed.sourceMapText) {
        const map = JSON.parse(transformed.sourceMapText) as Record<string, unknown>
        const mapPath = this.outputPath(`${outputPath}.map`)
        map.file = path.basename(outputPath)
        map.sources = [relativeFromTarget(mapPath, scriptPath)]
        map.sourcesContent = [source]
        sourceMap = JSON.stringify(map)
      }
      const artifact: ScriptArtifact = {
        path: outputPath,
        sourcePath: relativePath,
        sourceMapPath: sourceMap ? `${outputPath}.map` : undefined,
      }
      this.scripts.set(relativePath, artifact)
      await writeFileWithSourceMap(
        this.outputPath(outputPath),
        rewriteRelativeModuleSpecifiers(transformed.outputText, scriptPath),
        sourceMap,
      )
    }
  }

  private async collectReachableScripts(
    root: string,
    byRelative: Map<string, string>,
    entryPaths: string[],
  ): Promise<string[]> {
    const visited = new Set<string>()
    const queue = [...entryPaths]

    while (queue.length > 0) {
      const current = queue.shift()!
      const currentRelative = this.relative(root, current)
      if (visited.has(currentRelative)) continue
      visited.add(currentRelative)
      const source = await fs.readFile(current, 'utf8')
      const sourceFile = ts.createSourceFile(
        current,
        source,
        ts.ScriptTarget.Latest,
        true,
        current.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS,
      )

      const visitNode = (node: ts.Node): void => {
        if (
          (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier)
        ) {
          this.queueLocalScript(root, byRelative, current, node.moduleSpecifier.text, queue)
        }
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require' && node.arguments.length === 1) {
          const argument = node.arguments[0]!
          if (ts.isStringLiteral(argument)) {
            this.queueLocalScript(root, byRelative, current, argument.text, queue)
          }
        }
        ts.forEachChild(node, visitNode)
      }
      visitNode(sourceFile)
    }

    return [...visited].map((relativePath) => path.join(root, relativePath))
  }

  private queueLocalScript(
    root: string,
    byRelative: Map<string, string>,
    fromPath: string,
    reference: string,
    queue: string[],
  ): void {
    if (!reference.startsWith('.') && !reference.startsWith('/')) return
    const fromDirectory = path.dirname(fromPath)
    const absoluteReference = reference.startsWith('/')
      ? path.join(root, reference.slice(1))
      : path.resolve(fromDirectory, reference)
    const referenceRelative = this.relative(root, absoluteReference)
    const candidates = [
      referenceRelative,
      `${referenceRelative}.js`,
      `${referenceRelative}.ts`,
      `${referenceRelative}/index.js`,
      `${referenceRelative}/index.ts`,
    ]
    const candidate = candidates.map((item) => byRelative.get(item)).find(Boolean)
    if (!candidate) {
      this.diagnostics.push(diagnostic(
        'warning',
        'SCRIPT_IMPORT_NOT_FOUND',
        `Unable to resolve script import "${reference}".`,
        fromPath,
      ))
      return
    }
    queue.push(candidate)
  }

  private async compileTemplates(
    root: string,
    byRelative: Map<string, string>,
    pageEntries: SourceEntry[],
    componentEntries: Map<string, SourceEntry>,
  ): Promise<void> {
    const group = TmplGroup.newDev({ directivePrefix: this.naming.directive })
    const templateFiles = [...byRelative.entries()]
      .filter(([relativePath]) => relativePath.endsWith('.wxml'))

    for (const [relativePath, absolutePath] of templateFiles) {
      const templatePath = withoutExtension(relativePath)
      const rawSource = await fs.readFile(absolutePath, 'utf8')
      const inlined = inlineLocalImages(rawSource, absolutePath, root)
      const hasScopedStyles = byRelative.has(`${templatePath}.wxss`)
      const scope = hasScopedStyles
        ? `${this.options.scopePrefix}-${sanitizeScope(templatePath)}`
        : undefined
      const scopedSource = scope
        ? injectTagClasses(inlined, scope, this.naming.tagClassPrefix)
        : inlined
      const source = rewriteAnimationAttributes(scopedSource)
      try {
        const warnings = group.addTmpl(templatePath, source)
        // WXML import/include resolves paths with the `.wxml` extension.
        group.addTmplAlias(relativePath, templatePath)
        if (relativePath.endsWith('/index.wxml')) {
          group.addTmplAlias(relativePath.slice(0, -'/index.wxml'.length), templatePath)
        }
        for (const warning of warnings) {
          this.diagnostics.push(diagnostic(
            'warning',
            String(warning.kind),
            parseErrorMessage(warning),
            absolutePath,
            {
              line: warning.location.start.line + 1,
              column: warning.location.start.utf16Col + 1,
            },
            warning,
          ))
        }
        const artifact: TemplateArtifact = {
          path: templatePath,
          outputPath: 'templates.js',
          sourcePath: relativePath,
        }
        this.templates.set(templatePath, artifact)
      } catch (error) {
        this.diagnostics.push(diagnostic(
          'error',
          'TEMPLATE_COMPILE_ERROR',
          error instanceof Error ? error.message : String(error),
          absolutePath,
        ))
      }
    }

    for (const [relativePath, absolutePath] of [...byRelative.entries()].filter(([file]) => WXS_EXTENSIONS.some((ext) => file.endsWith(ext)))) {
      const content = await fs.readFile(absolutePath, 'utf8')
      // WXML references may include the extension (`./utils.wxs`) or omit it.
      group.addScript(relativePath, content)
      group.addScript(withoutExtension(relativePath), content)
    }

    if (this.diagnostics.some((item) => item.severity === 'error')) return

    const generated = group.getTmplGenObjectGroups()
    const outputPath = 'templates.js'
    const content = [
      'const groupList = ' + generated,
      '',
      'export default {',
      '  groupList,',
      '  content(path, name = "") {',
      '    const group = groupList[path]',
      '    if (!group) throw new Error(`template not found: ${path}`)',
      '    return group(name)',
      '  },',
      '}',
      '',
    ].join('\n')
    await writeFileWithSourceMap(this.outputPath(outputPath), content)
  }

  private inlineStyleImports(
    relativePath: string,
    byRelative: Map<string, string>,
    stack: string[] = [],
  ): string {
    const absolutePath = byRelative.get(relativePath)
    if (!absolutePath || stack.includes(relativePath)) return ''
    let source = ''
    try {
      source = readFileSync(absolutePath, 'utf8')
    } catch {
      return ''
    }
    return source.replace(
      /@import\s+(?:url\()?["']([^"']+)["']\)?\s*;/g,
      (full: string, specifier: string) => {
        if (/^(?:https?:|data:)/i.test(specifier)) return full
        const base = specifier.startsWith('/')
          ? specifier.slice(1)
          : path.posix.join(path.posix.dirname(relativePath), specifier)
        const normalized = path.posix.normalize(base)
        const candidates = [
          normalized,
          `${normalized}.wxss`,
          `${normalized}/index.wxss`,
        ]
        const resolved = candidates.find((candidate) => byRelative.has(candidate))
        if (!resolved) {
          this.diagnostics.push(diagnostic(
            'warning',
            'STYLE_IMPORT_NOT_FOUND',
            `Style import "${specifier}" could not be resolved.`,
            relativePath,
          ))
          return ''
        }
        return this.inlineStyleImports(resolved, byRelative, [...stack, relativePath])
      },
    )
  }

  private async compileStyles(
    root: string,
    byRelative: Map<string, string>,
    pageEntries: SourceEntry[],
    componentEntries: Map<string, SourceEntry>,
  ): Promise<void> {
    const stylePaths = [
      ...pageEntries.map((entry) => entry.stylePath),
      ...[...componentEntries.values()].map((entry) => entry.stylePath),
    ].filter((value): value is string => Boolean(value))
    const appStyle = byRelative.get('app.wxss')
    if (appStyle) stylePaths.unshift(appStyle)

    for (const stylePath of stylePaths) {
      const relativePath = this.relative(root, stylePath)
      if (this.styles.has(relativePath)) continue
      const outputPath = `styles/${relativePath}.css`
      const outputMapPath = `${outputPath}.map`
      const lowPriorityPath = outputPath.replace(/\.css$/, '.low.css')
      const lowPriorityMapPath = `${lowPriorityPath}.map`
      const source = this.inlineStyleImports(relativePath, byRelative)
      const isAppStyle = relativePath === 'app.wxss'
      const scope = isAppStyle
        ? undefined
        : `${this.options.scopePrefix}-${sanitizeScope(withoutExtension(relativePath))}`
      try {
        const transformer = StyleSheetTransformer.fromCss(relativePath, source, {
          classPrefix: scope,
          tagClassPrefix: scope ? `${scope}--${this.naming.tagClassPrefix}` : undefined,
          hostAttribute: this.naming.hostAttribute,
          rpxRatio: this.options.rpxRatio,
        })
        const css = transformer.getContent()
        const map = this.normalizeMap(
          transformer.getSourceMap(),
          stylePath,
          this.outputPath(outputMapPath),
          relativePath,
          source,
        )
        const lowPriorityCss = transformer.getLowPriorityContent()
        const lowPriorityMap = this.normalizeMap(
          transformer.getLowPrioritySourceMap(),
          stylePath,
          this.outputPath(lowPriorityMapPath),
          relativePath,
          source,
        )
        await writeFileWithSourceMap(this.outputPath(outputPath), css, map)
        await writeFileWithSourceMap(this.outputPath(lowPriorityPath), lowPriorityCss, lowPriorityMap)
        const warnings = transformer.extractWarnings()
        for (const warning of warnings) {
          this.diagnostics.push(diagnostic(
            warning.isError ? 'error' : 'warning',
            String(warning.code),
            warning.message,
            stylePath,
            { line: warning.startLine + 1, column: warning.startColumn + 1 },
            warning,
          ))
        }
        const artifact: StyleArtifact = {
          path: relativePath,
          sourcePath: relativePath,
          outputPath,
          sourceMapPath: outputMapPath,
          lowPriorityPath,
          lowPrioritySourceMapPath: lowPriorityMapPath,
          scope,
        }
        this.styles.set(relativePath, artifact)
      } catch (error) {
        this.diagnostics.push(diagnostic(
          'error',
          'STYLE_COMPILE_ERROR',
          error instanceof Error ? error.message : String(error),
          stylePath,
        ))
      }
    }
  }

  private normalizeMap(
    sourceMap: string,
    sourcePath: string,
    mapPath: string,
    relativePath: string,
    sourceContent: string,
  ): string {
    const map = JSON.parse(sourceMap || '{}') as Record<string, unknown>
    map.file = path.basename(mapPath)
    map.sources = [relativeFromTarget(mapPath, sourcePath)]
    map.sourcesContent = [sourceContent]
    return JSON.stringify(map)
  }

  private async copyAssets(root: string): Promise<void> {
    const files = await collectFiles(root, [...ASSET_EXTENSIONS])
    for (const sourcePath of files) {
      const relativePath = this.relative(root, sourcePath)
      const outputPath = this.outputPath(relativePath)
      await copyFile(sourcePath, outputPath)
      this.assets.push({ path: relativePath, sourcePath: relativePath })
    }
  }

  private async createManifest(
    root: string,
    appConfig: { path: string; value: Record<string, unknown> },
    pageEntries: SourceEntry[],
    componentEntries: Map<string, SourceEntry>,
  ): Promise<Manifest> {
    const appEntry = pageEntries.find((entry) => entry.path === 'app')
    const app: AppArtifact | undefined = appEntry
      ? {
          path: appEntry.path,
          script: appEntry.scriptPath ? this.scripts.get(this.relative(root, appEntry.scriptPath)) : undefined,
          style: appEntry.stylePath ? this.styles.get(this.relative(root, appEntry.stylePath)) : undefined,
          configuration: {
            path: 'app',
            sourcePath: this.relative(root, appConfig.path),
            effective: appConfig.value,
          },
        }
      : undefined

    const pages: PageArtifact[] = []
    for (const entry of pageEntries.filter((item) => item.path !== 'app')) {
      pages.push(await this.createPageArtifact(root, entry))
    }
    const components: ComponentArtifact[] = []
    for (const entry of componentEntries.values()) {
      components.push(await this.createPageArtifact(root, entry))
    }

    return {
      schemaVersion: 1,
      naming: this.naming,
      entries: {
        service: 'service.js',
        render: 'render.js',
        templates: 'templates.js',
      },
      app,
      pages,
      components,
      styles: [...this.styles.values()],
      assets: this.assets,
      diagnostics: [...this.diagnostics],
    }
  }

  private async createPageArtifact(root: string, entry: SourceEntry): Promise<PageArtifact> {
    const config = await this.readConfiguration(root, entry.configPath)
    const scriptSource = entry.scriptPath ? await fs.readFile(entry.scriptPath, 'utf8') : ''
    const bodyType = /\bComponent\s*\(/.test(scriptSource) ? 'component' as const : 'page' as const
    const globalComponents = entry.path === 'app'
      ? {}
      : this.readUsingComponents((await this.readConfiguration(root, path.join(root, 'app.json'))))
    const localComponents = this.readUsingComponents(config)
    const effectiveComponents: Record<string, string> = { ...globalComponents, ...localComponents }
    const componentSource: Record<string, 'global' | 'local'> = {}
    for (const tag of Object.keys(effectiveComponents)) {
      componentSource[tag] = localComponents[tag] ? 'local' : 'global'
    }
    const effectiveConfig: Record<string, unknown> = Object.keys(effectiveComponents).length > 0
      ? { ...config, usingComponents: effectiveComponents }
      : config
    const configuration: ConfigurationArtifact = {
      path: entry.path,
      sourcePath: entry.configPath ? this.relative(root, entry.configPath) : `${entry.path}.json`,
      effective: effectiveConfig,
      usingComponents: effectiveComponents,
      usingComponentsSource: componentSource,
    }

    return {
      path: entry.path,
      bodyType,
      script: entry.scriptPath ? this.scripts.get(this.relative(root, entry.scriptPath)) : undefined,
      template: entry.templatePath
        ? this.templates.get(withoutExtension(this.relative(root, entry.templatePath)))
        : undefined,
      style: entry.stylePath ? this.styles.get(this.relative(root, entry.stylePath)) : undefined,
      configuration,
    }
  }

  private async bundleServiceEntry(): Promise<void> {
    const entry = this.outputPath('service.js')
    try {
      await esbuild({
        entryPoints: [entry],
        outfile: entry,
        bundle: true,
        allowOverwrite: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2019',
        sourcemap: true,
        logLevel: 'silent',
        absWorkingDir: path.resolve(this.options.outputDir),
      })
    } catch (error) {
      this.diagnostics.push(diagnostic(
        'warning',
        'SCRIPT_BUNDLE_ERROR',
        `Unable to bundle service scripts: ${error instanceof Error ? error.message : String(error)}`,
      ))
    }
  }

  private async writeEntryArtifacts(manifest: Manifest): Promise<void> {
    const serviceImports = [
      manifest.app?.script?.path,
      ...manifest.pages.map((page) => page.script?.path),
      ...manifest.components.map((component) => component.script?.path),
    ].filter((value): value is string => Boolean(value))
    const serviceContent = serviceImports
      .map((scriptPath) => `import './${toPosixPath(scriptPath)}'`)
      .join('\n') + '\n'
    await writeFileWithSourceMap(this.outputPath('service.js'), serviceContent)
    await this.bundleServiceEntry()

    const renderContent = [
      "import templates from './templates.js'",
      '',
      'export default { templates }',
      '',
    ].join('\n')
    await writeFileWithSourceMap(this.outputPath('render.js'), renderContent)
  }
}

/**
 * Native ESM hosts (devtool, static servers) require explicit file
 * extensions. Mini-program sources use extensionless relative imports, so
 * append `.js` (or `/index.js`) when the target script exists.
 */
function rewriteRelativeModuleSpecifiers(code: string, sourceFile: string): string {
  const parsed = ts.createSourceFile(sourceFile, code, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS)
  const edits: Array<{ start: number; end: number; text: string }> = []
  const consider = (literal: ts.StringLiteralLike) => {
    const next = resolveRuntimeSpecifier(literal.text, sourceFile)
    if (!next || next === literal.text) return
    edits.push({ start: literal.getStart(parsed) + 1, end: literal.getEnd() - 1, text: next })
  }
  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      && node.moduleSpecifier
      && ts.isStringLiteral(node.moduleSpecifier)
    ) {
      consider(node.moduleSpecifier)
    }
    if (
      ts.isCallExpression(node)
      && node.expression.kind === ts.SyntaxKind.ImportKeyword
      && node.arguments.length === 1
      && ts.isStringLiteral(node.arguments[0]!)
    ) {
      consider(node.arguments[0]!)
    }
    ts.forEachChild(node, visit)
  }
  visit(parsed)
  if (edits.length === 0) return code
  let output = code
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end)
  }
  return output
}

function resolveRuntimeSpecifier(specifier: string, sourceFile: string): string | null {
  if (!specifier.startsWith('.')) return null
  if (specifier.endsWith('.js') || specifier.endsWith('.mjs') || specifier.endsWith('.cjs') || specifier.endsWith('.json')) {
    return null
  }
  if (specifier.endsWith('.ts') || specifier.endsWith('.tsx')) {
    return specifier.replace(/\.tsx?$/, '.js')
  }
  const base = path.resolve(path.dirname(sourceFile), specifier)
  for (const extension of ['.ts', '.tsx', '.js', '.mjs', '.cjs']) {
    if (existsSync(`${base}${extension}`)) {
      return `${specifier}${extension === '.ts' || extension === '.tsx' ? '.js' : extension}`
    }
  }
  for (const extension of ['.ts', '.js']) {
    if (existsSync(path.join(base, `index${extension}`))) return `${specifier}/index.js`
  }
  return null
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
}

const INLINE_IMAGE_LIMIT = 200 * 1024

/**
 * Mini-program image paths are relative to the page/component file. Browser
 * hosts would resolve them against the thread document instead, so inline
 * small local images as data URIs. Large assets are left untouched for the
 * host asset pipeline.
 */
function inlineLocalImages(source: string, templateFile: string, rootDir: string): string {
  const imagePattern = /(['"])([^'"]+\.(?:png|jpe?g|gif|svg|webp|bmp))\1/gi
  return source.replace(imagePattern, (match, quote: string, value: string) => {
    if (/^(?:[a-z]+:|data:)/i.test(value)) return match
    const absolute = value.startsWith('/')
      ? path.join(rootDir, value.slice(1))
      : path.resolve(path.dirname(templateFile), value)
    const relative = path.relative(rootDir, absolute)
    if (relative.startsWith('..') || path.isAbsolute(relative)) return match
    const extension = path.extname(absolute).toLowerCase()
    const mime = IMAGE_MIME_TYPES[extension]
    if (!mime) return match
    try {
      if (!existsSync(absolute)) return match
      const { size } = statSync(absolute)
      if (size > INLINE_IMAGE_LIMIT) return match
      const data = readFileSync(absolute).toString('base64')
      return `${quote}data:${mime};base64,${data}${quote}`
    } catch {
      return match
    }
  })
}

/**
 * Mini-program `animation="{{data}}"` attributes become inline styles. The
 * runtime animation API exports a CSS declaration string, so rewriting the
 * attribute lets the browser run the transition without a dedicated backend
 * animation channel.
 */
function rewriteAnimationAttributes(source: string): string {
  return source.replace(
    /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)\/?>/g,
    (match, tag: string, attributes: string) => {
      const animation = attributes.match(/\sanimation\s*=\s*(["'])([\s\S]*?)\1/)
      if (!animation) return match
      const value = animation[2]!
      let nextAttributes = attributes.replace(animation[0], '')
      const style = nextAttributes.match(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/)
      if (style) {
        const existing = style[2]!
        const separator = existing.trimEnd().endsWith(';') ? '' : ';'
        nextAttributes = nextAttributes.replace(style[0], ` style="${existing}${separator}${value}"`)
      } else {
        nextAttributes = `${nextAttributes} style="${value}"`
      }
      return `<${tag}${nextAttributes}>`
    },
  )
}

const TAG_CLASS_SKIP = new Set(['import', 'include', 'template', 'block', 'wxs', 'slot'])

/**
 * Adds a `<tagClassPrefix><tag>` marker class to every rendered element, e.g.
 * `wx-tag-button`. Glass-easel prefixes it with the template's style scope at
 * render time; the stylesheet compiler rewrites tag selectors to the matching
 * scoped marker class, which keeps `button { … }` inside its page/component
 * instead of leaking globally.
 */
function injectTagClasses(source: string, scope: string, tagClassPrefix: string): string {
  return source.replace(
    /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g,
    (match, rawTag: string, attributes: string, selfClose: string) => {
      const tag = rawTag.toLowerCase()
      if (TAG_CLASS_SKIP.has(tag) || !scope) return match
      const marker = `${tagClassPrefix}${tag}`
      const classMatch = attributes.match(/\sclass\s*=\s*(["'])([\s\S]*?)\1/)
      let nextAttributes = attributes
      if (classMatch) {
        const quote = classMatch[1]!
        const value = classMatch[2]!
        const separator = value.length === 0 || /\s$/.test(value) ? '' : ' '
        nextAttributes = attributes.replace(classMatch[0], ` class=${quote}${value}${separator}${marker}${quote}`)
      } else {
        nextAttributes = `${attributes} class="${marker}"`
      }
      return `<${rawTag}${nextAttributes}${selfClose}>`
    },
  )
}
