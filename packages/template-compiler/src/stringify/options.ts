// Stringify options — mirrors stringify/options.rs

import { DEFAULT_DIRECTIVE_PREFIX } from '../parse/state'

export interface StringifyOptions {
  sourceMap: boolean
  mangling: boolean
  minimize: boolean
  tabSize: number
  useTabCharacter: boolean
  lineWidthLimit: number
  expressionStringSingleQuote: boolean
  /** Namespace before `:` in template directives, e.g. `tiny` for `tiny:if`. */
  directivePrefix: string
}

export function defaultStringifyOptions(): StringifyOptions {
  return {
    sourceMap: false,
    mangling: false,
    minimize: false,
    tabSize: 4,
    useTabCharacter: false,
    lineWidthLimit: 100,
    expressionStringSingleQuote: false,
    directivePrefix: DEFAULT_DIRECTIVE_PREFIX,
  }
}
