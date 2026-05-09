// Core shared types — mirrors src/parse/mod.rs Position, ParseError, ParseErrorKind, ParseErrorLevel

export interface Position {
  line: number
  utf16Col: number
}

export function positionDefault(): Position {
  return { line: 0, utf16Col: 0 }
}

export function positionCmp(a: Position, b: Position): number {
  if (a.line !== b.line) return a.line - b.line
  return a.utf16Col - b.utf16Col
}

export function positionAddOffset(base: Position, offset: Position): Position {
  return {
    line: base.line + offset.line,
    utf16Col: offset.line === 0 ? base.utf16Col + offset.utf16Col : offset.utf16Col,
  }
}

export interface Range<T> {
  start: T
  end: T
}

export function range<T>(start: T, end: T): Range<T> {
  return { start, end }
}

// ParseErrorLevel — mirrors ParseErrorLevel enum
export const enum ParseErrorLevel {
  Note = 1,
  Warn = 2,
  Error = 3,
  Fatal = 4,
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
  IncompatibleWithWxAttribute,
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
    case ParseErrorKind.IncompatibleWithWxAttribute: return 'this attribute is incompatible with wx:* attribute'
    case ParseErrorKind.UninitializedScope: return 'this variable is uninitialized'
    case ParseErrorKind.InvalidClassNames: return 'the class name list contains invalid identifiers'
    case ParseErrorKind.DuplicatedClassNames: return 'the class name list contains duplicated class names'
    case ParseErrorKind.IncompatibleWithClassColonAttributes: return 'class data bindings are incompatible with `class:` attributes'
    case ParseErrorKind.InvalidInlineStyleString: return 'the inline style is invalid'
    case ParseErrorKind.DuplicatedStylePropertyNames: return 'the inline style contains duplicated style property names'
    case ParseErrorKind.IncompatibleWithStyleColonAttributes: return 'style data bindings are incompatible with `style:` attributes'
  }
}

export function parseErrorKindLevel(kind: ParseErrorKind): ParseErrorLevel {
  switch (kind) {
    case ParseErrorKind.UnexpectedCharacter: return ParseErrorLevel.Fatal
    case ParseErrorKind.UnexpectedExpressionCharacter: return ParseErrorLevel.Fatal
    case ParseErrorKind.UnknownMetaTag: return ParseErrorLevel.Note
    case ParseErrorKind.MissingExpressionEnd: return ParseErrorLevel.Fatal
    case ParseErrorKind.IllegalEntity: return ParseErrorLevel.Error
    case ParseErrorKind.IncompleteTag: return ParseErrorLevel.Fatal
    case ParseErrorKind.MissingEndTag: return ParseErrorLevel.Warn
    case ParseErrorKind.IllegalNamePrefix: return ParseErrorLevel.Warn
    case ParseErrorKind.InvalidAttributePrefix: return ParseErrorLevel.Warn
    case ParseErrorKind.InvalidAttributeName: return ParseErrorLevel.Warn
    case ParseErrorKind.InvalidAttributeValue: return ParseErrorLevel.Note
    case ParseErrorKind.InvalidAttribute: return ParseErrorLevel.Warn
    case ParseErrorKind.DuplicatedAttribute: return ParseErrorLevel.Warn
    case ParseErrorKind.DuplicatedName: return ParseErrorLevel.Note
    case ParseErrorKind.AvoidUppercaseLetters: return ParseErrorLevel.Note
    case ParseErrorKind.UnexpectedWhitespace: return ParseErrorLevel.Note
    case ParseErrorKind.MissingAttributeValue: return ParseErrorLevel.Note
    case ParseErrorKind.DataBindingNotAllowed: return ParseErrorLevel.Note
    case ParseErrorKind.InvalidIdentifier: return ParseErrorLevel.Fatal
    case ParseErrorKind.InvalidScopeName: return ParseErrorLevel.Note
    case ParseErrorKind.ChildNodesNotAllowed: return ParseErrorLevel.Error
    case ParseErrorKind.IllegalEscapeSequence: return ParseErrorLevel.Error
    case ParseErrorKind.IncompleteConditionExpression: return ParseErrorLevel.Fatal
    case ParseErrorKind.UnmatchedBracket: return ParseErrorLevel.Fatal
    case ParseErrorKind.UnmatchedParenthesis: return ParseErrorLevel.Fatal
    case ParseErrorKind.MissingModuleName: return ParseErrorLevel.Error
    case ParseErrorKind.MissingSourcePath: return ParseErrorLevel.Error
    case ParseErrorKind.UnsupportedSyntax: return ParseErrorLevel.Error
    case ParseErrorKind.ShouldQuoted: return ParseErrorLevel.Warn
    case ParseErrorKind.EmptyExpression: return ParseErrorLevel.Warn
    case ParseErrorKind.InvalidEndTag: return ParseErrorLevel.Warn
    case ParseErrorKind.DeprecatedAttribute: return ParseErrorLevel.Warn
    case ParseErrorKind.IncompatibleWithWxAttribute: return ParseErrorLevel.Error
    case ParseErrorKind.UninitializedScope: return ParseErrorLevel.Error
    case ParseErrorKind.InvalidClassNames: return ParseErrorLevel.Error
    case ParseErrorKind.DuplicatedClassNames: return ParseErrorLevel.Error
    case ParseErrorKind.IncompatibleWithClassColonAttributes: return ParseErrorLevel.Error
    case ParseErrorKind.InvalidInlineStyleString: return ParseErrorLevel.Error
    case ParseErrorKind.DuplicatedStylePropertyNames: return ParseErrorLevel.Error
    case ParseErrorKind.IncompatibleWithStyleColonAttributes: return ParseErrorLevel.Error
  }
}

export interface ParseError {
  path: string
  kind: ParseErrorKind
  location: Range<Position>
}

export function parseErrorLevel(err: ParseError): ParseErrorLevel {
  return parseErrorKindLevel(err.kind)
}

export function parseErrorCode(err: ParseError): number {
  return err.kind
}

export function parseErrorMessage(err: ParseError): string {
  return parseErrorKindMessage(err.kind)
}

export function parseErrorToString(err: ParseError): string {
  return (
    `template parsing error at ${err.path}:` +
    `${err.location.start.line + 1}:${err.location.start.utf16Col + 1}-` +
    `${err.location.end.line + 1}:${err.location.end.utf16Col + 1}: ` +
    parseErrorKindMessage(err.kind)
  )
}

// TmplError — general template processing error (mirrors TmplError in group.rs)
export class TmplError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TmplError'
  }
}
