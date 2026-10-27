import { existsSync, readFileSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'
import { build as esbuild } from 'esbuild'
import { TmplGroup, parseErrorMessage } from '@tiny/template-compiler'
import { StyleSheetTransformer } from '@tiny/stylesheet-compiler'
import {
  APP_PAGE_SCOPE_CLASS_SIGN,
  BUILTIN_COMPONENT_TAGS,
  TINY_ENGINE_NAMING,
  runtimeCompatibilityFrom,
  type ResolvedCompatibilityConfig,
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
import { resolveCompatibilityInput } from './compatibility'

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

class MiniProgramCompiler {
  private readonly options: Required<Omit<CompileOptions, 'compatibility'>>
  private readonly compatibility: ResolvedCompatibilityConfig
  private readonly scriptExtensions: string[]
  private readonly templateExtensions: string[]
  private readonly styleExtensions: string[]
  private readonly templateScriptExtensions: string[]
  private readonly configExtensions: string[]
  private readonly customComponentTags = new Set<string>()
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
      sourceDir: path.resolve(options.sourceDir),
      outputDir: path.resolve(options.outputDir),
    }
    this.compatibility = resolveCompatibilityInput(options, this.diagnostics)
    this.scriptExtensions = [...this.compatibility.extensions.script]
    this.templateExtensions = [...this.compatibility.extensions.template]
    this.styleExtensions = [...this.compatibility.extensions.style]
    this.templateScriptExtensions = [...this.compatibility.extensions.templateScript]
    this.configExtensions = [...this.compatibility.extensions.config]
  }

  async compile(): Promise<CompileResult> {
    await this.prepareOutput()
    const root = await this.resolveRoot()
    const files = await collectFiles(root, [
      ...this.scriptExtensions,
      ...this.templateExtensions,
      ...this.styleExtensions,
      ...this.templateScriptExtensions,
      ...this.configExtensions,
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
    const projectConfigPath = path.join(this.options.sourceDir, this.compatibility.files.projectConfig)
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
    const configPath = path.join(root, this.compatibility.files.appConfig)
    const { value, diagnostics } = await readJson(configPath)
    this.diagnostics.push(...diagnostics)
    if (!Array.isArray(value.pages) || value.pages.length === 0) {
      this.diagnostics.push(diagnostic(
        'error',
        'APP_PAGES_REQUIRED',
        `${this.compatibility.files.appConfig} must declare at least one page.`,
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
      for (const tag of Object.keys(componentRefs)) this.customComponentTags.add(tag)
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
    const findByExtension = (base: string, extensions: readonly string[]) => {
      for (const extension of extensions) {
        const found = byRelative.get(`${base}${extension}`)
        if (found) return found
      }
      return undefined
    }
    const findTemplate = (base: string) => findByExtension(base, this.templateExtensions)
    const findStyle = (base: string) => findByExtension(base, this.styleExtensions)
    const findScript = (base: string) => findByExtension(base, this.scriptExtensions)
    const findConfig = (base: string) => findByExtension(base, this.configExtensions)

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
      const outputPath = `scripts/${replaceConfiguredExtension(
        relativePath,
        this.scriptExtensions,
        '.js',
      )}`
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
        rewriteRelativeModuleSpecifiers(
          transformed.outputText,
          scriptPath,
          this.scriptExtensions,
        ),
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
        isTypeScriptFile(current, this.scriptExtensions)
          ? ts.ScriptKind.TS
          : ts.ScriptKind.JS,
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
      ...this.scriptExtensions.map((extension) => `${referenceRelative}${extension}`),
      ...this.scriptExtensions.map((extension) => `${referenceRelative}/index${extension}`),
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
    const group = TmplGroup.newDev({
      directivePrefix: this.compatibility.directiveNamespace,
      templateExtension: this.templateExtensions[0]!,
      templateScriptExtension: this.templateScriptExtensions[0]!,
    })
    const templateFiles = [...byRelative.entries()]
      .filter(([relativePath]) => matchesConfiguredExtension(relativePath, this.templateExtensions))

    for (const [relativePath, absolutePath] of templateFiles) {
      const templatePath = withoutConfiguredExtension(relativePath, this.templateExtensions)
      const rawSource = await fs.readFile(absolutePath, 'utf8')
      const inlined = inlineLocalImages(rawSource, absolutePath, root)
      const markedSource = injectScopeClasses(
        inlined,
        TINY_ENGINE_NAMING.tagClassPrefix,
        TINY_ENGINE_NAMING.scopeMarkerClass,
      )
      const source = rewriteAnimationAttributes(markedSource)
      try {
        const warnings = group.addTmpl(templatePath, source)
        // Template import/include aliases include the configured extension.
        group.addTmplAlias(relativePath, templatePath)
        for (const extension of this.templateExtensions) {
          const indexSuffix = `/index${extension}`
          if (relativePath.endsWith(indexSuffix)) {
            group.addTmplAlias(relativePath.slice(0, -indexSuffix.length), templatePath)
            break
          }
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

    for (const [relativePath, absolutePath] of [...byRelative.entries()].filter(([file]) => (
      matchesConfiguredExtension(file, this.templateScriptExtensions)
    ))) {
      const content = await fs.readFile(absolutePath, 'utf8')
      // Template scripts may be referenced with the configured extension or omitted.
      group.addScript(relativePath, content)
      group.addScript(withoutConfiguredExtension(relativePath, this.templateScriptExtensions), content)
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
          ...this.styleExtensions.map((extension) => `${normalized}${extension}`),
          ...this.styleExtensions.map((extension) => `${normalized}/index${extension}`),
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
    const pageStylePaths = new Set(
      pageEntries
        .filter((entry) => entry.path !== 'app')
        .map((entry) => entry.stylePath)
        .filter((value): value is string => Boolean(value)),
    )
    const appStylePath = pageEntries.find((entry) => entry.path === 'app')?.stylePath

    for (const stylePath of stylePaths) {
      const relativePath = this.relative(root, stylePath)
      if (this.styles.has(relativePath)) continue
      const outputPath = `styles/${relativePath}.css`
      const outputMapPath = `${outputPath}.map`
      const lowPriorityPath = outputPath.replace(/\.css$/, '.low.css')
      const lowPriorityMapPath = `${lowPriorityPath}.map`
      const source = this.inlineStyleImports(relativePath, byRelative)
      const isAppStyle = stylePath === appStylePath
      const isPageStyle = pageStylePaths.has(stylePath)
      const scope = isAppStyle
        ? undefined
        : `${TINY_ENGINE_NAMING.styleScopePrefix}${sanitizeScope(
          withoutConfiguredExtension(relativePath, this.styleExtensions),
        )}`
      try {
        const transformer = StyleSheetTransformer.fromCss(relativePath, source, {
          classPrefix: scope,
          tagClassPrefix: scope ? `${scope}--${TINY_ENGINE_NAMING.tagClassPrefix}` : undefined,
          scopeMarkerClass: scope || isAppStyle ? TINY_ENGINE_NAMING.scopeMarkerClass : undefined,
          scopeHostAttribute: isPageStyle ? TINY_ENGINE_NAMING.hostAttribute : undefined,
          forceScopeAnchor: isAppStyle,
          builtinTags: BUILTIN_COMPONENT_TAGS,
          componentTags: [...this.customComponentTags],
          builtinHostTagPrefix: TINY_ENGINE_NAMING.hostTagPrefix,
          hostAttribute: TINY_ENGINE_NAMING.hostAttribute,
          convertHost: scope !== undefined,
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
        if (isAppStyle) {
          // A second, marker-annotated copy of the app stylesheet lets the render thread
          // re-scope its class rules to each page scope. That is how
          // `apply-shared` / `shared` components see global app styles, while
          // isolated components still do not.
          const pageScopeTransformer = StyleSheetTransformer.fromCss(relativePath, source, {
            classPrefixSign: APP_PAGE_SCOPE_CLASS_SIGN,
            scopeMarkerClass: APP_PAGE_SCOPE_CLASS_SIGN,
            scopeHostAttribute: TINY_ENGINE_NAMING.hostAttribute,
            forceScopeAnchor: true,
            builtinTags: BUILTIN_COMPONENT_TAGS,
            componentTags: [...this.customComponentTags],
            builtinHostTagPrefix: TINY_ENGINE_NAMING.hostTagPrefix,
            hostAttribute: TINY_ENGINE_NAMING.hostAttribute,
            rpxRatio: this.options.rpxRatio,
          })
          const pageScopeCss = pageScopeTransformer.getContent()
          if (pageScopeCss.includes(`.${APP_PAGE_SCOPE_CLASS_SIGN}`)) {
            const pageScopeOutputPath = `styles/${relativePath}.page-scope.css`
            await writeFileWithSourceMap(this.outputPath(pageScopeOutputPath), pageScopeCss)
            const pageScopeArtifact: StyleArtifact = {
              path: `${relativePath}@page-scope`,
              sourcePath: relativePath,
              outputPath: pageScopeOutputPath,
              pageScopeClassSign: APP_PAGE_SCOPE_CLASS_SIGN,
            }
            this.styles.set(pageScopeArtifact.path, pageScopeArtifact)
          }
        }
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
      pages.push(await this.createPageArtifact(root, entry, appConfig.path))
    }
    const components: ComponentArtifact[] = []
    for (const entry of componentEntries.values()) {
      components.push(await this.createPageArtifact(root, entry, appConfig.path))
    }

    return {
      schemaVersion: 2,
      runtimeCompatibility: runtimeCompatibilityFrom(this.compatibility),
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

  private async createPageArtifact(
    root: string,
    entry: SourceEntry,
    appConfigPath: string,
  ): Promise<PageArtifact> {
    const config = await this.readConfiguration(root, entry.configPath)
    const scriptSource = entry.scriptPath ? await fs.readFile(entry.scriptPath, 'utf8') : ''
    const componentGlobal = escapeRegExp(this.compatibility.globals.component)
    const bodyType = new RegExp(`\\b${componentGlobal}\\s*\\(`).test(scriptSource)
      ? 'component' as const
      : 'page' as const
    const globalComponents = entry.path === 'app'
      ? {}
      : this.readUsingComponents((await this.readConfiguration(root, appConfigPath)))
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
      sourcePath: entry.configPath ? this.relative(root, entry.configPath) : `${entry.path}${this.configExtensions[0]}`,
      effective: effectiveConfig,
      usingComponents: effectiveComponents,
      usingComponentsSource: componentSource,
    }

    return {
      path: entry.path,
      bodyType,
      script: entry.scriptPath ? this.scripts.get(this.relative(root, entry.scriptPath)) : undefined,
      template: entry.templatePath
        ? this.templates.get(withoutConfiguredExtension(
          this.relative(root, entry.templatePath),
          this.templateExtensions,
        ))
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
function rewriteRelativeModuleSpecifiers(
  code: string,
  sourceFile: string,
  scriptExtensions: readonly string[],
): string {
  const parsed = ts.createSourceFile(sourceFile, code, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS)
  const edits: Array<{ start: number; end: number; text: string }> = []
  const consider = (literal: ts.StringLiteralLike) => {
    const next = resolveRuntimeSpecifier(literal.text, sourceFile, scriptExtensions)
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

function resolveRuntimeSpecifier(
  specifier: string,
  sourceFile: string,
  scriptExtensions: readonly string[],
): string | null {
  if (!specifier.startsWith('.')) return null
  if (specifier.endsWith('.js') || specifier.endsWith('.json')) return null
  const configured = scriptExtensions.find((extension) => specifier.endsWith(extension))
  if (configured) {
    return `${specifier.slice(0, -configured.length)}.js`
  }
  const base = path.resolve(path.dirname(sourceFile), specifier)
  for (const extension of scriptExtensions) {
    if (existsSync(`${base}${extension}`)) return `${specifier}.js`
  }
  for (const extension of scriptExtensions) {
    if (existsSync(path.join(base, `index${extension}`))) return `${specifier}/index.js`
  }
  return null
}

function matchesConfiguredExtension(value: string, extensions: readonly string[]): boolean {
  return extensions.some((extension) => value.endsWith(extension))
}

function withoutConfiguredExtension(value: string, extensions: readonly string[]): string {
  const extension = extensions.find((candidate) => value.endsWith(candidate))
  return extension ? value.slice(0, -extension.length) : withoutExtension(value)
}

function replaceConfiguredExtension(
  value: string,
  extensions: readonly string[],
  replacement: string,
): string {
  const extension = extensions.find((candidate) => value.endsWith(candidate))
  return extension ? `${value.slice(0, -extension.length)}${replacement}` : `${value}${replacement}`
}

function isTypeScriptFile(filePath: string, scriptExtensions: readonly string[]): boolean {
  const lower = filePath.toLowerCase()
  const typescriptExtensions = new Set(
    scriptExtensions
      .map((extension) => extension.toLowerCase())
      .filter((extension) => ['.ts', '.tsx', '.mts', '.cts'].includes(extension)),
  )
  return [...typescriptExtensions].some((extension) => lower.endsWith(extension))
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
 * Adds the generic scope marker and a tag-specific marker to every rendered
 * element. Glass-easel prefixes both with the template's style scope at render
 * time. The stylesheet compiler uses them to keep tag and anchorless selectors
 * inside their page/component instead of leaking globally.
 */
function injectScopeClasses(
  source: string,
  tagClassPrefix: string,
  scopeMarkerClass: string,
): string {
  return source.replace(
    /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g,
    (match, rawTag: string, attributes: string, selfClose: string) => {
      const tag = rawTag.toLowerCase()
      if (TAG_CLASS_SKIP.has(tag)) return match
      const markers = `${tagClassPrefix}${tag} ${scopeMarkerClass}`
      const classMatch = attributes.match(/\sclass\s*=\s*(["'])([\s\S]*?)\1/)
      let nextAttributes = attributes
      if (classMatch) {
        const quote = classMatch[1]!
        const value = classMatch[2]!
        const separator = value.length === 0 || /\s$/.test(value) ? '' : ' '
        nextAttributes = attributes.replace(classMatch[0], ` class=${quote}${value}${separator}${markers}${quote}`)
      } else {
        nextAttributes = `${attributes} class="${markers}"`
      }
      return `<${rawTag}${nextAttributes}${selfClose}>`
    },
  )
}
