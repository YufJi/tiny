// Stringify options — mirrors stringify/options.rs

export interface StringifyOptions {
  sourceMap: boolean
  mangling: boolean
  minimize: boolean
  tabSize: number
  useTabCharacter: boolean
  lineWidthLimit: number
  expressionStringSingleQuote: boolean
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
  }
}
