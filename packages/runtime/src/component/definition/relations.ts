import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import { resolveComponentReference } from '../../shared/path'
import { isBuiltinBehavior } from '../behaviors'
import { isTraitBehavior } from '../traits'
import type {
  DefinitionDiagnostic,
  NormalizedRelation,
  RelationCallback,
} from './types'
import { isPlainObject } from './object'

export function normalizeRelations(
  raw: unknown,
  componentPath: string,
): { relations: NormalizedRelation[]; diagnostics: DefinitionDiagnostic[] } {
  const relations: NormalizedRelation[] = []
  const diagnostics: DefinitionDiagnostic[] = []
  if (!isPlainObject(raw)) return { relations, diagnostics }

  for (const [key, value] of Object.entries(raw)) {
    if (!isPlainObject(value)) continue
    const type = value.type
    if (type !== 'parent' && type !== 'child' && type !== 'ancestor' && type !== 'descendant') {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.UNSUPPORTED_RELATION_TYPE,
        message: `Relation "${key}" has unsupported type "${String(type)}".`,
      })
      continue
    }
    const target = typeof value.target === 'string' ? value.target : key
    if (isTraitBehavior(value.target)) {
      const relation: NormalizedRelation = {
        key,
        type,
        targetPath: '',
        trait: value.target,
      }
      if (isRelationCallback(value.linked)) relation.linked = value.linked
      if (isRelationCallback(value.unlinked)) relation.unlinked = value.unlinked
      if (isRelationCallback(value.linkChanged)) relation.linkChanged = value.linkChanged
      if (isRelationCallback(value.linkFailed)) relation.linkFailed = value.linkFailed
      relations.push(relation)
      continue
    }
    if (isBuiltinBehavior(target)) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.UNSUPPORTED_RELATION_TARGET,
        message: `Relation "${key}" targets built-in behavior "${target}", which is not supported.`,
      })
      continue
    }
    const relation: NormalizedRelation = {
      key,
      type,
      targetPath: resolveComponentReference(componentPath, target),
    }
    if (isRelationCallback(value.linked)) relation.linked = value.linked
    if (isRelationCallback(value.unlinked)) relation.unlinked = value.unlinked
    if (isRelationCallback(value.linkChanged)) relation.linkChanged = value.linkChanged
    if (isRelationCallback(value.linkFailed)) relation.linkFailed = value.linkFailed
    relations.push(relation)
  }
  return { relations, diagnostics }
}

function isRelationCallback(value: unknown): value is RelationCallback {
  return typeof value === 'function' || typeof value === 'string'
}
