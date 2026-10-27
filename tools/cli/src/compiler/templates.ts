import fs from 'node:fs/promises'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { TmplGroup, parseErrorMessage } from '@tiny/template-compiler'
import type { TemplateArtifact } from '../types'
import { diagnostic, writeFileWithSourceMap } from '../utils'
import { matchesConfiguredExtension, withoutConfiguredExtension } from './extensions'
import { outputPath, type CompilerContext } from './context'
import type { Project } from './project'
import {
  injectScopeClasses,
  inlineLocalImages,
  rewriteAnimationAttributes,
} from './template-source'

const TEMPLATE_OUTPUT = 'templates.js'

/**
 * Feeds every WXML file and WXS script into one `TmplGroup` and emits the
 * shared `templates.js` module the render thread loads.
 */
export async function compileTemplates(
  context: CompilerContext,
  project: Project,
): Promise<void> {
  const group = TmplGroup.newDev({
    directivePrefix: context.compatibility.directiveNamespace,
    templateExtension: context.extensions.template[0]!,
    templateScriptExtension: context.extensions.templateScript[0]!,
  })
  const templateFiles = [...project.files.entries()]
    .filter(([relative]) => matchesConfiguredExtension(relative, context.extensions.template))

  for (const [relativeFile, absolutePath] of templateFiles) {
    const templatePath = withoutConfiguredExtension(relativeFile, context.extensions.template)
    const rawSource = await fs.readFile(absolutePath, 'utf8')
    const inlined = inlineLocalImages(rawSource, absolutePath, project.root)
    const markedSource = injectScopeClasses(
      inlined,
      TINY_ENGINE_NAMING.tagClassPrefix,
      TINY_ENGINE_NAMING.scopeMarkerClass,
    )
    const source = rewriteAnimationAttributes(markedSource)
    try {
      const warnings = group.addTmpl(templatePath, source)
      // Template import/include aliases include the configured extension.
      group.addTmplAlias(relativeFile, templatePath)
      for (const extension of context.extensions.template) {
        const indexSuffix = `/index${extension}`
        if (relativeFile.endsWith(indexSuffix)) {
          group.addTmplAlias(relativeFile.slice(0, -indexSuffix.length), templatePath)
          break
        }
      }
      for (const warning of warnings) {
        context.diagnostics.push(diagnostic(
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
        outputPath: TEMPLATE_OUTPUT,
        sourcePath: relativeFile,
      }
      context.templates.set(templatePath, artifact)
    } catch (error) {
      context.diagnostics.push(diagnostic(
        'error',
        'TEMPLATE_COMPILE_ERROR',
        error instanceof Error ? error.message : String(error),
        absolutePath,
      ))
    }
  }

  for (const [relativeFile, absolutePath] of [...project.files.entries()].filter(([file]) => (
    matchesConfiguredExtension(file, context.extensions.templateScript)
  ))) {
    const content = await fs.readFile(absolutePath, 'utf8')
    // Template scripts may be referenced with the configured extension or omitted.
    group.addScript(relativeFile, content)
    group.addScript(withoutConfiguredExtension(relativeFile, context.extensions.templateScript), content)
  }

  if (context.diagnostics.some((item) => item.severity === 'error')) return

  const generated = group.getTmplGenObjectGroups()
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
  await writeFileWithSourceMap(outputPath(context, TEMPLATE_OUTPUT), content)
}
