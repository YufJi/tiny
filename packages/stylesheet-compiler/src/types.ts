// types.ts — public types for glass-easel-stylesheet-compiler-js

/** Error level, ordered from informational to fatal. */
export const enum ParseErrorLevel {
  Note = 1,
  Warn = 2,
  Error = 3,
  Fatal = 4,
}

/** Error kind codes, matching the Rust implementation. */
export const enum ParseErrorKind {
  UnexpectedCharacter = 0x10001,
  IllegalImportPosition = 0x10002,
  HostSelectorCombination = 0x10003,
}

/** Parse/transform warning emitted during stylesheet processing. */
export interface StyleSheetParseError {
  /** True if the error level is Error or Fatal (prevents successful compilation). */
  isError: boolean
  level: ParseErrorLevel
  code: number
  message: string
  path: string
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
}

/** Options controlling stylesheet transformation behavior. */
export interface StyleSheetOptions {
  /**
   * Prefix added to class names separated by `--`.
   * E.g. `classPrefix: "p"` transforms `.foo` → `.p--foo`.
   */
  classPrefix?: string | undefined

  /**
   * A comment string inserted immediately before each transformed class name.
   * E.g. `classPrefixSign: "SIGN"` transforms `.foo` → `./*SIGN*\/foo`.
   */
  classPrefixSign?: string | undefined

  /**
   * Ratio used to convert `rpx` units to `vw`.
   * The formula is `value * 100 / rpxRatio`.
   * Defaults to `750`.
   */
  rpxRatio?: number

  /**
   * When set, `@import` rules are replaced with a comment of the form
   * `/*SIGN url-encoded-path*\/`.
   */
  importSign?: string | undefined

  /**
   * When `true`, `:host` selectors are converted to attribute selectors
   * and placed in the low-priority output.
   */
  convertHost?: boolean

  /**
   * When `convertHost` is `true` and this option is set, an additional
   * `[is="hostIs"]` attribute selector is emitted alongside `[wx-host="…"]`.
   */
  hostIs?: string | undefined
}
