import { TINY_ENGINE_NAMING, type BuiltinComponentTag } from '@tiny/manifest'

export {
  BUILTIN_COMPONENT_TAGS,
  BUILTIN_HOST_TAG_PREFIX,
  type BuiltinComponentTag,
} from '@tiny/manifest'

/** Internal glass-easel definition name for a built-in component. */
export function builtinDefinitionName(tag: BuiltinComponentTag): string {
  return `${TINY_ENGINE_NAMING.builtinDefinitionPrefix}${tag}`
}
