// transformer.ts — Core CSS transformation engine.
//
// Mirrors the Rust implementation in glass-easel-stylesheet-compiler/src/lib.rs.
// Uses PostCSS for parsing; applies transforms via AST walking and manual
// token-level string building for the inner-block logic.

import postcss, {
  type AtRule,
  type ChildNode,
  type Comment,
  type Container,
  type Declaration,
  type Document,
  type Node,
  type Result,
  type Root,
  type Rule,
} from 'postcss'
import {
  ParseErrorKind,
  ParseErrorLevel,
  type StyleSheetOptions,
  type StyleSheetParseError,
} from './types'

// ---------------------------------------------------------------------------
// Internal helper types
// ---------------------------------------------------------------------------

interface Position {
  line: number // 0-based
  column: number // 0-based, UTF-16 column
}

interface InternalError {
  kind: ParseErrorKind
  start: Position
  end: Position
}

// ---------------------------------------------------------------------------
// RPX → VW conversion
// ---------------------------------------------------------------------------

const RPX_RE = /(-?\d*\.?\d+)rpx/g

/**
 * Convert all `rpx` dimension values in a string to `vw`.
 * `value * 100 / ratio`, formatted to avoid scientific notation.
 */
function convertRpxInString(s: string, ratio: number): string {
  return s.replace(RPX_RE, (_, raw: string) => {
    const value = parseFloat(raw)
    const vw = (value * 100) / ratio
    // Rust uses up to 6 significant digits (f32 precision). We cap at 6 fractional digits.
    const rounded = parseFloat(vw.toPrecision(6))
    // If it's an integer, emit without decimal point
    if (Number.isInteger(rounded)) {
      return `${rounded}vw`
    }
    return `${rounded}vw`
  })
}

// ---------------------------------------------------------------------------
// Class-name prefix / sign injection
// ---------------------------------------------------------------------------

/**
 * In a selector string, find every `.className` token and:
 *  - optionally insert a `/*sign*\/` comment before the class name
 *  - optionally rewrite the class name to `prefix--className`
 *
 * This function works at the *text* level on the selector string produced by
 * PostCSS (no nested blocks, only the prelude of a rule). It handles:
 *  - `.foo`
 *  - `:is(.foo)`, `:not(.foo)`, `[attr]`, pseudo-functions, etc.
 *
 * The algorithm mirrors the Rust token-level walk:
 *  - after a `.` delimiter, the next identifier token is a class name
 *  - inside `[]`, `()`, `function()` — still apply class transform
 *  - rpx conversion does NOT apply in selectors (Rust only converts rpx in
 *    property values / @-rule preludes, not in selector preludes)
 */
function transformSelector(
  selector: string,
  classPrefix: string | undefined,
  classPrefixSign: string | undefined,
): string {
  if (classPrefix === undefined && classPrefixSign === undefined) return selector

  // Tokenise at the character level: scan for `.` followed by identifier chars.
  // We need to be careful not to match attribute selectors like [class~=".foo"].
  // The Rust implementation sets `in_class = true` after a Delim('.') token, then
  // the next Ident token is treated as a class name. Attribute values inside `[]`
  // are not parsed as identifiers by cssparser in selector position, but in
  // the Rust code the whole selector prelude _is_ walked. We replicate that
  // behaviour: a `.` followed immediately by an identifier (no whitespace) is a
  // class name, regardless of nesting context.
  let result = ''
  let i = 0
  while (i < selector.length) {
    const ch = selector[i]!
    if (ch === '/' && selector[i + 1] === '*') {
      // Pass existing comments through unchanged
      const end = selector.indexOf('*/', i + 2)
      if (end === -1) {
        result += selector.slice(i)
        break
      }
      result += selector.slice(i, end + 2)
      i = end + 2
    } else if (ch === '.' && i + 1 < selector.length && isIdentStart(selector[i + 1]!)) {
      // Found a class token
      result += '.'
      i++
      // collect identifier
      const identStart = i
      while (i < selector.length && isIdentChar(selector[i]!)) i++
      const className = selector.slice(identStart, i)
      // insert sign comment if requested
      if (classPrefixSign !== undefined) {
        result += `/*${classPrefixSign}*/`
      }
      // rewrite class name
      if (classPrefix !== undefined) {
        result += `${classPrefix}--${className}`
      } else {
        result += className
      }
    } else {
      result += ch
      i++
    }
  }
  return result
}

function isIdentStart(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch === '-' || ch.charCodeAt(0) > 127
}

function isIdentChar(ch: string): boolean {
  return isIdentStart(ch) || (ch >= '0' && ch <= '9')
}

// ---------------------------------------------------------------------------
// @import processing
// ---------------------------------------------------------------------------

/** URL-encode a path string the same way as Rust's `urlencoding::encode`. */
function urlEncode(s: string): string {
  // Rust's urlencoding::encode encodes everything except unreserved chars:
  //   ALPHA / DIGIT / "-" / "." / "_" / "~"
  // encodeURIComponent keeps these extra chars unencoded: ! ~ * ' ( )
  // We must additionally encode those to match Rust's output.
  return encodeURIComponent(s)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\*/g, '%2A')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
}

// ---------------------------------------------------------------------------
// Source-map helpers (thin wrapper around postcss stringifier)
// ---------------------------------------------------------------------------

interface OutputPair {
  css: string
  map: string
}

function stringifyRoot(root: Root, from: string): OutputPair {
  const result = postcss().process(root, {
    from,
    map: { inline: false, annotation: false, sourcesContent: true },
  })
  return {
    css: result.css,
    map: result.map?.toString() ?? '{}',
  }
}

// ---------------------------------------------------------------------------
// StyleSheetTransformer
// ---------------------------------------------------------------------------

export class StyleSheetTransformer {
  private readonly _path: string
  private _opts: Required<StyleSheetOptions>
  private readonly _warnings: InternalError[] = []
  private _normalRoot: Root
  private _lowRoot: Root

  /**
   * Create a new `StyleSheetTransformer`.
   *
   * Signature matches the Rust WASM `js_bindings.rs` constructor for
   * drop-in compatibility with existing callers (e.g. `wxss_loader.js`):
   * ```js
   * new StyleSheetTransformer(name, css, classPrefix?, rpxRatio?, convertHost?)
   * ```
   *
   * For advanced options (`classPrefixSign`, `importSign`, `hostIs`),
   * use the static `fromCss(path, css, options)` factory instead.
   */
  constructor(
    path: string,
    css: string,
    classPrefix?: string,
    rpxRatio?: number,
    convertHost?: boolean,
  )
  // Internal overload used by fromCss — not exposed in the public API.
  // eslint-disable-next-line no-dupe-class-members
  constructor(path: string, css: string, opts: Required<StyleSheetOptions>)
  // eslint-disable-next-line no-dupe-class-members
  constructor(
    path: string,
    css: string,
    classPrefixOrOpts?: string | Required<StyleSheetOptions>,
    rpxRatio?: number,
    convertHost?: boolean,
  ) {
    this._path = path
    if (classPrefixOrOpts !== null && typeof classPrefixOrOpts === 'object') {
      // Called from fromCss — opts object provided directly
      this._opts = classPrefixOrOpts
    } else {
      this._opts = {
        classPrefix: classPrefixOrOpts ?? undefined!,
        classPrefixSign: undefined!,
        rpxRatio: rpxRatio ?? 750,
        importSign: undefined!,
        convertHost: convertHost ?? false,
        hostIs: undefined!,
      }
    }
    this._normalRoot = postcss.root()
    this._lowRoot = postcss.root()
    this._transform(css)
  }

  /**
   * Create a `StyleSheetTransformer` with the full `StyleSheetOptions` object.
   */
  static fromCss(path: string, css: string, options: StyleSheetOptions = {}): StyleSheetTransformer {
    const opts: Required<StyleSheetOptions> = {
      classPrefix: options.classPrefix ?? undefined!,
      classPrefixSign: options.classPrefixSign ?? undefined!,
      rpxRatio: options.rpxRatio ?? 750,
      importSign: options.importSign ?? undefined!,
      convertHost: options.convertHost ?? false,
      hostIs: options.hostIs ?? undefined!,
    }
    return new StyleSheetTransformer(path, css, opts)
  }

  // -------------------------------------------------------------------------
  // Public output accessors
  // -------------------------------------------------------------------------

  extractWarnings(): StyleSheetParseError[] {
    return this._warnings.splice(0).map((w) => this._formatError(w))
  }

  getContent(): string {
    return stringifyRoot(this._normalRoot, this._path).css
  }

  getSourceMap(): string {
    return stringifyRoot(this._normalRoot, this._path).map
  }

  getLowPriorityContent(): string {
    return stringifyRoot(this._lowRoot, this._path).css
  }

  getLowPrioritySourceMap(): string {
    return stringifyRoot(this._lowRoot, this._path).map
  }

  // -------------------------------------------------------------------------
  // Internal: main transformation pipeline
  // -------------------------------------------------------------------------

  private _transform(css: string): void {
    // Parse with PostCSS (no plugins, just parse)
    const root = postcss.parse(css, { from: this._path })

    // Walk all top-level nodes
    this._processNodes(root, this._normalRoot, this._lowRoot, [], true)
  }

  /**
   * Walk through `container`'s children and append transformed versions to
   * `normalDest` / `lowDest`. `atStack` is the stack of at-rule prelude
   * strings enclosing the current position (used for :host wrapping).
   * `atFileStart` tracks whether we're still before the first non-@import rule.
   */
  private _processNodes(
    container: Root | AtRule,
    normalDest: Root | AtRule,
    lowDest: Root | AtRule,
    atStack: string[],
    atFileStart: boolean,
  ): boolean /* returns updated atFileStart */ {
    const nodes: ChildNode[] = container.nodes ? [...container.nodes] : []

    for (const node of nodes) {
      if (node.type === 'atrule') {
        atFileStart = this._processAtRule(node, normalDest, lowDest, atStack, atFileStart)
      } else if (node.type === 'rule') {
        this._processRule(node, normalDest, lowDest, atStack)
        atFileStart = false
      } else if (node.type === 'decl') {
        // top-level declarations (unusual but possible)
        const transformed = this._transformDecl(node)
        normalDest.append(transformed)
        atFileStart = false
      }
      // comments are dropped (Rust implementation strips all comments)
    }

    return atFileStart
  }

  // -------------------------------------------------------------------------
  // At-rule processing
  // -------------------------------------------------------------------------

  private _processAtRule(
    node: AtRule,
    normalDest: Root | AtRule,
    lowDest: Root | AtRule,
    atStack: string[],
    atFileStart: boolean,
  ): boolean /* updated atFileStart */ {
    const keyword = node.name.toLowerCase()

    // @import with import_sign
    if (keyword === 'import' && this._opts.importSign !== undefined) {
      this._processImport(node, normalDest, atFileStart)
      return false
    }

    // @media / @supports / @document — contain rule lists → recurse
    if (keyword === 'media' || keyword === 'supports' || keyword === 'document') {
      const transformed = this._cloneAtRuleShell(node)
      // Transform rpx in the at-rule parameters
      transformed.params = convertRpxInString(node.params, this._opts.rpxRatio)
      normalDest.append(transformed)

      // Build low-priority counterpart
      const lowTransformed = this._cloneAtRuleShell(node)
      lowTransformed.params = transformed.params
      lowDest.append(lowTransformed)

      const atStr = `@${node.name} ${transformed.params}`
      const newAtStack = [...atStack, atStr]

      this._processNodes(node, transformed, lowTransformed, newAtStack, false)
      return false
    }

    // All other at-rules (no rule list inside)
    const transformed = this._cloneAtRuleShell(node)

    if (node.nodes) {
      // Has a block — treat content as declarations / values (rpx only)
      transformed.params = this._transformSelectorLike(node.params)
      normalDest.append(transformed)
      node.nodes.forEach((child: ChildNode) => {
        if (child.type === 'decl') {
          transformed.append(this._transformDecl(child as Declaration))
        } else if (child.type === 'rule') {
          // embedded rules inside non-media at-rules (e.g. @keyframes)
          const r = child.clone() as Rule
          r.selector = convertRpxInString(r.selector, this._opts.rpxRatio)
          r.each((n: ChildNode) => {
            if (n.type === 'decl') {
              const td = this._transformDecl(n as Declaration)
              n.replaceWith(td)
            }
          })
          transformed.append(r)
        } else if (child.type === 'atrule') {
          const inner = child.clone() as AtRule
          inner.params = convertRpxInString(inner.params, this._opts.rpxRatio)
          inner.each((n: ChildNode) => {
            if (n.type === 'decl') {
              const td = this._transformDecl(n as Declaration)
              n.replaceWith(td)
            }
          })
          transformed.append(inner)
        }
      })
    } else {
      // Semicolon-terminated rule (e.g. @charset, @import without sign, @layer).
      // Rust only converts rpx inside paren/bracket sub-blocks in at-rule preludes,
      // and does NOT apply class-name transforms to top-level param tokens.
      // Applying transformSelector here would incorrectly rewrite e.g.
      // `@layer theme.base` → `@layer theme.prefix--base`.
      // We conservatively apply only rpx conversion (matching the majority of
      // real-world cases; pure top-level rpx like `@a 75rpx` is not valid CSS).
      transformed.params = convertRpxInString(node.params, this._opts.rpxRatio)
      normalDest.append(transformed)
    }

    return false
  }

  /**
   * Handle `@import` with import_sign option.
   * Mirrors the Rust logic:
   *   - parse the import path
   *   - parse optional `layer(…)` / `supports(…)` modifiers
   *   - parse optional media query
   *   - emit appropriate wrapper at-rules + comment
   */
  private _processImport(node: AtRule, dest: Root | AtRule, atFileStart: boolean): void {
    if (!atFileStart) {
      this._addWarning(ParseErrorKind.IllegalImportPosition, node)
    }

    const importSign = this._opts.importSign!
    const params = node.params.trim()

    // Extract the quoted path
    let rest = params
    let relPath: string | undefined

    if (rest.startsWith('"') || rest.startsWith("'")) {
      const quote = rest[0]!
      const end = rest.indexOf(quote, 1)
      if (end !== -1) {
        relPath = rest.slice(1, end)
        rest = rest.slice(end + 1).trim()
      }
    } else if (rest.toLowerCase().startsWith('url(')) {
      const inner = rest.slice(4)
      const paren = inner.indexOf(')')
      if (paren !== -1) {
        let url = inner.slice(0, paren).trim()
        if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
          url = url.slice(1, -1)
        }
        relPath = url
        rest = inner.slice(paren + 1).trim()
      }
    }

    if (relPath === undefined) {
      // Can't parse — skip
      return
    }

    // Parse optional layer() / supports() modifiers and media query
    // The Rust code wraps them in reverse order (innermost first in close_stack).
    const wrappers: Array<{ kind: 'layer' | 'supports' | 'media'; params: string }> = []

    // layer modifier
    if (/^layer\s*\(/i.test(rest)) {
      const m = rest.match(/^layer\s*\(([^)]*)\)/i)
      if (m) {
        wrappers.push({ kind: 'layer', params: m[1]!.trim() })
        rest = rest.slice(m[0].length).trim()
      }
    } else if (/^layer\b/i.test(rest)) {
      wrappers.push({ kind: 'layer', params: '' })
      rest = rest.replace(/^layer\b/i, '').trim()
    }

    // supports modifier
    if (/^supports\s*\(/i.test(rest)) {
      const m = rest.match(/^supports\s*(\([^)]*\))/i)
      if (m) {
        wrappers.push({ kind: 'supports', params: m[1]!.trim() })
        rest = rest.slice(m[0].length).trim()
      }
    }

    // Remaining → media query
    // strip trailing semicolon
    rest = rest.replace(/;$/, '').trim()
    if (rest.length > 0) {
      wrappers.push({ kind: 'media', params: rest })
    }

    // Build the comment content
    const encodedPath = urlEncode(relPath)
    const commentText = `${importSign} .${encodedPath}`

    // Build wrapper nodes from outside in (wrappers[0] is outermost)
    let current: Root | AtRule = dest
    for (const wrapper of wrappers) {
      const ar = postcss.atRule({ name: wrapper.kind, params: wrapper.params, raws: { between: '', afterName: ' ' } })
      current.append(ar)
      current = ar
    }
    current.append(postcss.comment({ text: commentText }))
  }

  // -------------------------------------------------------------------------
  // Rule processing
  // -------------------------------------------------------------------------

  private _processRule(
    node: Rule,
    normalDest: Root | AtRule,
    lowDest: Root | AtRule,
    atStack: string[],
  ): void {
    const rawSelector = node.selector

    // Check for :host conversion
    if (this._opts.convertHost) {
      const hostResult = this._tryProcessHost(node, lowDest, atStack)
      if (hostResult) return
    }

    // Normal rule: transform selector (class prefix) + declarations (rpx)
    const transformed = node.clone()
    transformed.selector = transformSelector(
      rawSelector,
      this._opts.classPrefix,
      this._opts.classPrefixSign,
    )
    // Remove the space before `{` in minified output
    transformed.raws.between = ''
    transformed.raws.before = transformed.raws.before ?? ''

    // Transform declarations
    transformed.each((child: ChildNode) => {
      if (child.type === 'decl') {
        const td = this._transformDecl(child as Declaration)
        child.replaceWith(td)
      } else if (child.type === 'comment') {
        child.remove()
      }
    })

    normalDest.append(transformed)
  }

  /**
   * Try to handle a `:host` rule. Returns true if handled (consumed).
   *
   * Patterns:
   *   - `:host { … }` → valid; goes to low-priority output
   *   - `:host(.foo) { … }` → HostSelectorCombination warning; dropped
   *   - `:host .foo { … }` → HostSelectorCombination warning; dropped
   *   - other → not a host rule, return false
   */
  private _tryProcessHost(node: Rule, lowDest: Root | AtRule, atStack: string[]): boolean {
    const selector = node.selector.trim()

    // Must start with `:host`
    if (!selector.startsWith(':host')) return false

    const afterHost = selector.slice(5) // everything after ':host'
    const trimmedAfter = afterHost.trim()

    if (trimmedAfter === '' || trimmedAfter === '{') {
      // Pure `:host { … }` — valid
      this._emitHostRule(node, lowDest, atStack)
      return true
    }

    // `:host(…)` or `:host .foo` — combination; warn and drop
    this._addWarning(ParseErrorKind.HostSelectorCombination, node)
    return true
  }

  private _emitHostRule(node: Rule, lowDest: Root | AtRule, atStack: string[]): void {
    const prefix = this._opts.classPrefix ?? ''
    const hostIs = this._opts.hostIs

    // Build selector: [wx-host="prefix"] or [wx-host="prefix"],[is="hostIs"]
    let sel = `[wx-host="${prefix}"]`
    if (hostIs !== undefined) {
      sel += `,[is="${hostIs}"]`
    }

    // Wrap in at-rule stack for low-priority output
    // (mirrors Rust's write_in_low_priority which re-emits the at-rule stack)
    let current: Root | AtRule = lowDest
    for (const atStr of atStack) {
      // atStr is e.g. "@media (width: 1px)"
      const m = atStr.match(/^@(\S+)\s*(.*)$/)
      if (m) {
        const ar = postcss.atRule({
          name: m[1]!,
          params: m[2]!,
          raws: { between: '', afterName: ' ' },
        })
        current.append(ar)
        current = ar
      }
    }

    const rule = node.clone()
    rule.selector = sel
    rule.raws.between = ''
    rule.raws.before = ''

    // Transform declarations (rpx only, no class transform)
    rule.each((child: ChildNode) => {
      if (child.type === 'decl') {
        const td = this._transformDecl(child as Declaration)
        child.replaceWith(td)
      } else if (child.type === 'comment') {
        child.remove()
      }
    })

    current.append(rule)
  }

  // -------------------------------------------------------------------------
  // Declaration transformation (rpx conversion in values)
  // -------------------------------------------------------------------------

  private _transformDecl(decl: Declaration): Declaration {
    const cloned = decl.clone()
    cloned.value = convertRpxInString(decl.value, this._opts.rpxRatio)
    cloned.raws.before = decl.raws.before ?? ''
    return cloned
  }

  // -------------------------------------------------------------------------
  // Selector-like string transformation (rpx + class names in at-rule params)
  // -------------------------------------------------------------------------

  /**
   * Transform a "selector-like" string (at-rule params in simple at-rules).
   * Applies rpx → vw and class prefix (the Rust code applies both in
   * `convert_class_names_and_rpx_in_block` for paren-blocks inside at-rules).
   */
  private _transformSelectorLike(s: string): string {
    let result = convertRpxInString(s, this._opts.rpxRatio)
    result = transformSelector(result, this._opts.classPrefix, this._opts.classPrefixSign)
    return result
  }

  // -------------------------------------------------------------------------
  // At-rule shell cloning
  // -------------------------------------------------------------------------

  private _cloneAtRuleShell(node: AtRule): AtRule {
    const ar = postcss.atRule({
      name: node.name,
      params: node.params,
      raws: { between: '', afterName: node.raws.afterName ?? ' ' },
    })
    return ar
  }

  // -------------------------------------------------------------------------
  // Warning helpers
  // -------------------------------------------------------------------------

  private _addWarning(kind: ParseErrorKind, node: Node): void {
    const start = this._nodePosition(node)
    this._warnings.push({ kind, start, end: start })
  }

  private _nodePosition(node: Node): Position {
    const src = (node as any).source
    if (src?.start) {
      return { line: (src.start.line as number) - 1, column: (src.start.column as number) - 1 }
    }
    return { line: 0, column: 0 }
  }

  private _formatError(err: InternalError): StyleSheetParseError {
    const level = this._kindLevel(err.kind)
    const message = this._kindMessage(err.kind)
    return {
      isError: level >= ParseErrorLevel.Error,
      level,
      code: err.kind,
      message,
      path: this._path,
      startLine: err.start.line,
      startColumn: err.start.column,
      endLine: err.end.line,
      endColumn: err.end.column,
    }
  }

  private _kindLevel(kind: ParseErrorKind): ParseErrorLevel {
    switch (kind) {
      case ParseErrorKind.UnexpectedCharacter:
        return ParseErrorLevel.Fatal
      case ParseErrorKind.IllegalImportPosition:
        return ParseErrorLevel.Note
      case ParseErrorKind.HostSelectorCombination:
        return ParseErrorLevel.Warn
    }
  }

  private _kindMessage(kind: ParseErrorKind): string {
    switch (kind) {
      case ParseErrorKind.UnexpectedCharacter:
        return 'unexpected character'
      case ParseErrorKind.IllegalImportPosition:
        return '`@import` should be placed at the start of the stylesheet (according to CSS standard)'
      case ParseErrorKind.HostSelectorCombination:
        return '`:host` selector combined with other selectors are not supported'
    }
  }

  free() {
    // no-op in JS version, but Rust implementation has a free() method to release memory
  }
}
