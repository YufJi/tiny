import type * as glassEasel from 'glass-easel'
import groups from './generated/templates'
import type { BuiltinComponentTag } from './tags'

type ProcGen = ReturnType<glassEasel.template.ComponentTemplate['content']>

/**
 * Resolves a template precompiled by `scripts/build-templates.mjs`. No WXML
 * parsing or code generation happens at runtime.
 */
export function builtinTemplate(tag: BuiltinComponentTag): glassEasel.template.ComponentTemplate {
  const select = groups[tag]
  if (!select) throw new Error(`Built-in template not found: ${tag}`)
  return {
    groupList: groups as unknown as glassEasel.template.ComponentTemplate['groupList'],
    content: () => select('') as ProcGen,
  }
}
