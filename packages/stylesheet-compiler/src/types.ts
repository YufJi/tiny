// types.ts — public types for glass-easel-stylesheet-compiler-js

import { TINY_ENGINE_NAMING } from '@tiny/manifest'

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
   * When set, type selectors (`button`, `view`) are rewritten to a marker
   * class such as `.scope--tiny-tag-button`. Templates add the matching
   * `tiny-tag-<tag>` class to elements so tag rules stay inside their scope.
   */
  tagClassPrefix?: string | undefined

  /**
   * Generic marker class added to every scoped element. Selectors without a
   * class or tag anchor (for example `*`, `#id`, or a bare pseudo-class) are
   * prefixed with `:where(.scope--<scopeMarkerClass>)` so they cannot escape
   * the page/component scope.
   */
  scopeMarkerClass?: string | undefined

  /** Host attribute used to include the page root in page-scope selectors. */
  scopeHostAttribute?: string | undefined

  /** Apply the scope marker to every compound, including class/tag anchored ones. */
  forceScopeAnchor?: boolean | undefined

  /**
   * Built-in component tags. Used for **global** (unscoped) styles, where
   * `tagClassPrefix` is not available: `button {}` is rewritten to the real
   * host tag (e.g. `tiny-button {}`). Scoped styles keep using marker classes.
   */
  builtinTags?: readonly string[] | undefined

  /** Custom component tags whose internal host nodes also use the Tiny prefix. */
  componentTags?: readonly string[] | undefined

  /**
   * Prefix of built-in host tags used by `builtinTags`.
   * Defaults to the fixed Tiny engine prefix.
   */
  builtinHostTagPrefix?: string | undefined

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
   * `[is="hostIs"]` attribute selector is emitted alongside
   * `[<hostAttribute>="…"]`.
   */
  hostIs?: string | undefined

  /**
   * Attribute used to mark component hosts when converting `:host` selectors.
   * Defaults to the host attribute currently used by the Tiny engine.
   */
  hostAttribute?: string | undefined
}

/** Default attribute marking a component host. */
export const DEFAULT_HOST_ATTRIBUTE = TINY_ENGINE_NAMING.hostAttribute
