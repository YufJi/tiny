// Core shared types — mirrors src/parse/mod.rs Position, ParseError, ParseErrorKind

export interface Position {
  line: number
  utf16Col: number
}

export function positionDefault(): Position {
  return { line: 0, utf16Col: 0 }
}

export interface Range<T> {
  start: T
  end: T
}

export function range<T>(start: T, end: T): Range<T> {
  return { start, end }
}

// ParseErrorKind — mirrors ParseErrorKind enum (code = discriminant value)
export const enum ParseErrorKind {
  UnexpectedCharacter = 0x10001,
  UnexpectedExpressionCharacter,
  UnknownMetaTag,
  MissingExpressionEnd,
  IllegalEntity,
  IncompleteTag,
  MissingEndTag,
  IllegalNamePrefix,
  InvalidAttributePrefix,
  InvalidAttributeName,
  InvalidAttributeValue,
  InvalidAttribute,
  DuplicatedAttribute,
  DuplicatedName,
  AvoidUppercaseLetters,
  UnexpectedWhitespace,
  MissingAttributeValue,
  DataBindingNotAllowed,
  InvalidIdentifier,
  InvalidScopeName,
  ChildNodesNotAllowed,
  IllegalEscapeSequence,
  IncompleteConditionExpression,
  UnmatchedBracket,
  UnmatchedParenthesis,
  MissingModuleName,
  MissingSourcePath,
  UnsupportedSyntax,
  ShouldQuoted,
  EmptyExpression,
  InvalidEndTag,
  DeprecatedAttribute,
  IncompatibleWithDirectiveAttribute,
  UninitializedScope,
  InvalidClassNames,
  DuplicatedClassNames,
  IncompatibleWithClassColonAttributes,
  InvalidInlineStyleString,
  DuplicatedStylePropertyNames,
  IncompatibleWithStyleColonAttributes,
}

export function parseErrorKindMessage(kind: ParseErrorKind): string {
  switch (kind) {
    case ParseErrorKind.UnexpectedCharacter: return 'unexpected character'
    case ParseErrorKind.UnexpectedExpressionCharacter: return 'unexpected character inside expression'
    case ParseErrorKind.UnknownMetaTag: return 'unknown meta tag'
    case ParseErrorKind.MissingExpressionEnd: return 'missing expression end'
    case ParseErrorKind.IllegalEntity: return 'illegal entity'
    case ParseErrorKind.IncompleteTag: return 'incomplete tag'
    case ParseErrorKind.MissingEndTag: return 'missing end tag'
    case ParseErrorKind.IllegalNamePrefix: return 'illegal name prefix'
    case ParseErrorKind.InvalidAttributePrefix: return 'invalid attribute prefix'
    case ParseErrorKind.InvalidAttributeName: return 'invalid attribute name'
    case ParseErrorKind.InvalidAttributeValue: return 'invalid attribute value'
    case ParseErrorKind.InvalidAttribute: return 'invalid attribute'
    case ParseErrorKind.DuplicatedAttribute: return 'duplicated attribute'
    case ParseErrorKind.DuplicatedName: return 'duplicated name'
    case ParseErrorKind.AvoidUppercaseLetters: return 'avoid uppercase letters'
    case ParseErrorKind.UnexpectedWhitespace: return 'unexpected whitespace'
    case ParseErrorKind.MissingAttributeValue: return 'missing attribute value'
    case ParseErrorKind.DataBindingNotAllowed: return 'data bindings are not allowed for this attribute'
    case ParseErrorKind.InvalidIdentifier: return 'not a valid identifier'
    case ParseErrorKind.InvalidScopeName: return 'not a valid identifier as scope name'
    case ParseErrorKind.ChildNodesNotAllowed: return 'child nodes are not allowed for this element'
    case ParseErrorKind.IllegalEscapeSequence: return 'illegal escape sequence'
    case ParseErrorKind.IncompleteConditionExpression: return 'incomplete condition expression'
    case ParseErrorKind.UnmatchedBracket: return 'unmatched bracket'
    case ParseErrorKind.UnmatchedParenthesis: return 'unmatched parenthesis'
    case ParseErrorKind.MissingModuleName: return 'missing module name'
    case ParseErrorKind.MissingSourcePath: return 'missing source path'
    case ParseErrorKind.UnsupportedSyntax: return 'this syntax has not been supported yet'
    case ParseErrorKind.ShouldQuoted: return 'should be quoted'
    case ParseErrorKind.EmptyExpression: return 'the expression is empty'
    case ParseErrorKind.InvalidEndTag: return 'invalid end tag'
    case ParseErrorKind.DeprecatedAttribute: return 'this attribute is deprecated'
    case ParseErrorKind.IncompatibleWithDirectiveAttribute: return 'this attribute is incompatible with template directives'
    case ParseErrorKind.UninitializedScope: return 'this variable is uninitialized'
    case ParseErrorKind.InvalidClassNames: return 'the class name list contains invalid identifiers'
    case ParseErrorKind.DuplicatedClassNames: return 'the class name list contains duplicated class names'
    case ParseErrorKind.IncompatibleWithClassColonAttributes: return 'class data bindings are incompatible with `class:` attributes'
    case ParseErrorKind.InvalidInlineStyleString: return 'the inline style is invalid'
    case ParseErrorKind.DuplicatedStylePropertyNames: return 'the inline style contains duplicated style property names'
    case ParseErrorKind.IncompatibleWithStyleColonAttributes: return 'style data bindings are incompatible with `style:` attributes'
  }
}

export interface ParseError {
  path: string
  kind: ParseErrorKind
  location: Range<Position>
}

export function parseErrorMessage(err: ParseError): string {
  return parseErrorKindMessage(err.kind)
}

// TmplError — general template processing error (mirrors TmplError in group.rs)
export class TmplError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TmplError'
  }
}
