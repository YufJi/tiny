import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'
import { TmplGroup, parseErrorMessage } from '@tiny/template-compiler'
import { StyleSheetTransformer } from '@tiny/stylesheet-compiler'
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
const STYLE_EXTENSIONS = ['.wxss', '.css']
const WXS_EXTENSIONS = ['.wxs', '.sjs']
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
  private readonly options: Required<CompileOptions>
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
    for (const extension of SCRIPT_EXTENSIONS) {
      const scriptPath = byRelative.get(`${normalized}${extension}`)
      if (scriptPath) {
        return {
          path: normalized,
          scriptPath,
          templatePath: byRelative.get(`${normalized}.wxml`),
          stylePath: byRelative.get(`${normalized}.wxss`) ?? byRelative.get(`${normalized}.css`),
          configPath: path.join(root, `${normalized}.json`),
        }
      }
    }
    const hasTemplate = byRelative.get(`${normalized}.wxml`)
    if (!hasTemplate) return null
    return {
      path: normalized,
      templatePath: hasTemplate,
      stylePath: byRelative.get(`${normalized}.wxss`) ?? byRelative.get(`${normalized}.css`),
      configPath: path.join(root, `${normalized}.json`),
    }
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
        transformed.outputText,
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
    const group = TmplGroup.newDev()
    const templateFiles = [...byRelative.entries()]
      .filter(([relativePath]) => relativePath.endsWith('.wxml'))

    for (const [relativePath, absolutePath] of templateFiles) {
      const templatePath = withoutExtension(relativePath)
      const source = await fs.readFile(absolutePath, 'utf8')
      try {
        const warnings = group.addTmpl(templatePath, source)
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
      const scriptPath = withoutExtension(relativePath)
      group.addScript(scriptPath, await fs.readFile(absolutePath, 'utf8'))
    }

    if (this.diagnostics.some((item) => item.severity === 'error')) return

    const generated = group.getTmplGenObjectGroups()
    const outputPath = 'templates.js'
    const content = [
      'const groupList = (' + generated + ')()',
      '',
      'export default {',
      '  groupList,',
      '  content(path) {',
      '    const procGen = groupList[path]',
      '    if (!procGen) throw new Error(`template not found: ${path}`)',
      '    return procGen',
      '  },',
      '}',
      '',
    ].join('\n')
    await writeFileWithSourceMap(this.outputPath(outputPath), content)
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
      const source = await fs.readFile(stylePath, 'utf8')
      const isAppStyle = relativePath === 'app.wxss'
      const scope = isAppStyle
        ? undefined
        : `${this.options.scopePrefix}-${sanitizeScope(withoutExtension(relativePath))}`
      try {
        const transformer = StyleSheetTransformer.fromCss(relativePath, source, {
          classPrefix: scope,
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
    }
  }

  private async createPageArtifact(root: string, entry: SourceEntry): Promise<PageArtifact> {
    const config = await this.readConfiguration(root, entry.configPath)
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
      script: entry.scriptPath ? this.scripts.get(this.relative(root, entry.scriptPath)) : undefined,
      template: entry.templatePath
        ? this.templates.get(withoutExtension(this.relative(root, entry.templatePath)))
        : undefined,
      style: entry.stylePath ? this.styles.get(this.relative(root, entry.stylePath)) : undefined,
      configuration,
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

    const renderContent = [
      "import templates from './templates.js'",
      '',
      'export default { templates }',
      '',
    ].join('\n')
    await writeFileWithSourceMap(this.outputPath('render.js'), renderContent)
  }
}
