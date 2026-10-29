import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { StyleArtifact } from '../types'
import {
  APP_PAGE_SCOPE_CLASS_SIGN,
  BUILTIN_COMPONENT_TAGS,
  TINY_ENGINE_NAMING,
} from '@tiny/manifest'
import { StyleSheetTransformer } from '@tiny/stylesheet-compiler'
import { diagnostic, relativeFromTarget, sanitizeScope, writeFileWithSourceMap } from '../utils'
import { withoutConfiguredExtension } from './extensions'
import { outputPath, relativePath, type CompilerContext } from './context'
import type { Project } from './project'

/**
 * Emits scoped CSS for every page and component stylesheet.
 *
 * Each entry produces a normal copy plus a `low.css` copy for `:host`-level
 * rules. The app stylesheet additionally produces a page-scope copy used by
 * `apply-shared`/`shared` components.
 */
export async function compileStyles(
  context: CompilerContext,
  project: Project,
): Promise<void> {
  const stylePaths = [
    ...project.entries.map((entry) => entry.stylePath),
    ...[...project.components.values()].map((entry) => entry.stylePath),
  ].filter((value): value is string => Boolean(value))
  const pageStylePaths = new Set(
    project.entries
      .filter((entry) => entry.path !== 'app')
      .map((entry) => entry.stylePath)
      .filter((value): value is string => Boolean(value)),
  )
  const appStylePath = project.entries.find((entry) => entry.path === 'app')?.stylePath

  for (const stylePath of stylePaths) {
    const sourcePath = relativePath(context, stylePath)
    if (context.styles.has(sourcePath)) continue
    const outputRelativePath = `styles/${sourcePath}.css`
    const outputMapRelativePath = `${outputRelativePath}.map`
    const lowPriorityRelativePath = outputRelativePath.replace(/\.css$/, '.low.css')
    const lowPriorityMapRelativePath = `${lowPriorityRelativePath}.map`
    const source = inlineStyleImports(context, sourcePath, project.files)
    const isAppStyle = stylePath === appStylePath
    const isPageStyle = pageStylePaths.has(stylePath)
    const scope = isAppStyle
      ? undefined
      : `${TINY_ENGINE_NAMING.styleScopePrefix}${sanitizeScope(
        withoutConfiguredExtension(sourcePath, context.extensions.style),
      )}`
    try {
      const transformer = StyleSheetTransformer.fromCss(sourcePath, source, {
        classPrefix: scope,
        tagClassPrefix: scope ? `${scope}--${TINY_ENGINE_NAMING.tagClassPrefix}` : undefined,
        scopeMarkerClass: scope || isAppStyle ? TINY_ENGINE_NAMING.scopeMarkerClass : undefined,
        scopeHostAttribute: isPageStyle ? TINY_ENGINE_NAMING.hostAttribute : undefined,
        forceScopeAnchor: isAppStyle,
        builtinTags: BUILTIN_COMPONENT_TAGS,
        componentTags: [...context.customComponentTags],
        builtinHostTagPrefix: TINY_ENGINE_NAMING.hostTagPrefix,
        hostAttribute: TINY_ENGINE_NAMING.hostAttribute,
        convertHost: scope !== undefined,
      })
      const css = transformer.getContent()
      const map = normalizeMap(
        transformer.getSourceMap(),
        stylePath,
        outputPath(context, outputMapRelativePath),
        source,
      )
      const lowPriorityCss = transformer.getLowPriorityContent()
      const lowPriorityMap = normalizeMap(
        transformer.getLowPrioritySourceMap(),
        stylePath,
        outputPath(context, lowPriorityMapRelativePath),
        source,
      )
      await writeFileWithSourceMap(outputPath(context, outputRelativePath), css, map)
      await writeFileWithSourceMap(
        outputPath(context, lowPriorityRelativePath),
        lowPriorityCss,
        lowPriorityMap,
      )
      const warnings = transformer.extractWarnings()
      for (const warning of warnings) {
        context.diagnostics.push(diagnostic(
          warning.isError ? 'error' : 'warning',
          String(warning.code),
          warning.message,
          stylePath,
          { line: warning.startLine + 1, column: warning.startColumn + 1 },
          warning,
        ))
      }
      const artifact: StyleArtifact = {
        path: sourcePath,
        sourcePath,
        outputPath: outputRelativePath,
        sourceMapPath: outputMapRelativePath,
        lowPriorityPath: lowPriorityRelativePath,
        lowPrioritySourceMapPath: lowPriorityMapRelativePath,
        scope,
      }
      context.styles.set(sourcePath, artifact)
      if (isAppStyle) {
        // A second, marker-annotated copy of the app stylesheet lets the render thread
        // re-scope its class rules to each page scope. That is how
        // `apply-shared` / `shared` components see global app styles, while
        // isolated components still do not.
        const pageScopeTransformer = StyleSheetTransformer.fromCss(sourcePath, source, {
          classPrefixSign: APP_PAGE_SCOPE_CLASS_SIGN,
          scopeMarkerClass: APP_PAGE_SCOPE_CLASS_SIGN,
          scopeHostAttribute: TINY_ENGINE_NAMING.hostAttribute,
          forceScopeAnchor: true,
          builtinTags: BUILTIN_COMPONENT_TAGS,
          componentTags: [...context.customComponentTags],
          builtinHostTagPrefix: TINY_ENGINE_NAMING.hostTagPrefix,
          hostAttribute: TINY_ENGINE_NAMING.hostAttribute,
        })
        const pageScopeCss = pageScopeTransformer.getContent()
        if (pageScopeCss.includes(`.${APP_PAGE_SCOPE_CLASS_SIGN}`)) {
          const pageScopeOutputPath = `styles/${sourcePath}.page-scope.css`
          await writeFileWithSourceMap(outputPath(context, pageScopeOutputPath), pageScopeCss)
          const pageScopeArtifact: StyleArtifact = {
            path: `${sourcePath}@page-scope`,
            sourcePath,
            outputPath: pageScopeOutputPath,
            pageScopeClassSign: APP_PAGE_SCOPE_CLASS_SIGN,
          }
          context.styles.set(pageScopeArtifact.path, pageScopeArtifact)
        }
      }
    } catch (error) {
      context.diagnostics.push(diagnostic(
        'error',
        'STYLE_COMPILE_ERROR',
        error instanceof Error ? error.message : String(error),
        stylePath,
      ))
    }
  }
}

/** Inlines `@import` statements so each stylesheet compiles as one document. */
function inlineStyleImports(
  context: CompilerContext,
  relativeImportPath: string,
  byRelative: Map<string, string>,
  stack: string[] = [],
): string {
  const absolutePath = byRelative.get(relativeImportPath)
  if (!absolutePath || stack.includes(relativeImportPath)) return ''
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
        : path.posix.join(path.posix.dirname(relativeImportPath), specifier)
      const normalized = path.posix.normalize(base)
      const candidates = [
        normalized,
        ...context.extensions.style.map((extension) => `${normalized}${extension}`),
        ...context.extensions.style.map((extension) => `${normalized}/index${extension}`),
      ]
      const resolved = candidates.find((candidate) => byRelative.has(candidate))
      if (!resolved) {
        context.diagnostics.push(diagnostic(
          'warning',
          'STYLE_IMPORT_NOT_FOUND',
          `Style import "${specifier}" could not be resolved.`,
          relativeImportPath,
        ))
        return ''
      }
      return inlineStyleImports(context, resolved, byRelative, [...stack, relativeImportPath])
    },
  )
}

function normalizeMap(
  sourceMap: string,
  sourcePath: string,
  mapPath: string,
  sourceContent: string,
): string {
  const map = JSON.parse(sourceMap || '{}') as Record<string, unknown>
  map.file = path.basename(mapPath)
  map.sources = [relativeFromTarget(mapPath, sourcePath)]
  map.sourcesContent = [sourceContent]
  return JSON.stringify(map)
}
