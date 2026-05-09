export interface Position {
  line: number;
  utf16Col: number;
}

export interface Range<T> {
  start: T;
  end: T;
}

export interface ParseError {
  isError: boolean;
  level: ParseErrorLevel;
  code: number;
  message: string;
  path: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export enum ParseErrorLevel {
  Note = 0,
  Warning = 1,
  Error = 2,
  Fatal = 3,
}

export enum ParseErrorKind {
  UnexpectedCharacter = 'unexpected character',
  UnexpectedExpressionCharacter = 'unexpected character inside expression',
  UnknownMetaTag = 'unknown meta tag',
  MissingExpressionEnd = 'missing expression end',
  IllegalEntity = 'illegal entity',
  IncompleteTag = 'incomplete tag',
  MissingEndTag = 'missing end tag',
  IllegalNamePrefix = 'illegal name prefix',
  InvalidAttributePrefix = 'invalid attribute prefix',
  InvalidAttributeName = 'invalid attribute name',
  InvalidAttributeValue = 'invalid attribute value',
  InvalidAttribute = 'invalid attribute',
  DuplicatedAttribute = 'duplicated attribute',
  DuplicatedName = 'duplicated name',
  AvoidUppercaseLetters = 'avoid uppercase letters',
  UnexpectedWhitespace = 'unexpected whitespace',
  MissingAttributeValue = 'missing attribute value',
  DataBindingNotAllowed = 'data bindings are not allowed for this attribute',
  InvalidIdentifier = 'not a valid identifier',
  InvalidScopeName = 'not a valid identifier as scope name',
  ChildNodesNotAllowed = 'child nodes are not allowed for this element',
  IllegalEscapeSequence = 'illegal escape sequence',
  IncompleteConditionExpression = 'incomplete condition expression',
  UnmatchedBracket = 'unmatched bracket',
  UnmatchedParenthesis = 'unmatched parenthesis',
  MissingModuleName = 'missing module name',
  MissingSourcePath = 'missing source path',
  UnsupportedSyntax = 'unsupported syntax',
  ShouldQuoted = 'should be quoted',
  EmptyExpression = 'empty expression',
  InvalidEndTag = 'invalid end tag',
  DeprecatedAttribute = 'deprecated attribute',
  IncompatibleWithWxAttribute = 'incompatible with wx: attribute',
  UninitializedScope = 'uninitialized scope',
  InvalidClassNames = 'invalid class names',
  DuplicatedClassNames = 'duplicated class names',
  IncompatibleWithClassColonAttributes = 'incompatible with class: attributes',
  InvalidInlineStyleString = 'invalid inline style string',
  DuplicatedStylePropertyNames = 'duplicated style property names',
  IncompatibleWithStyleColonAttributes = 'incompatible with style: attributes',
}

export function isTemplateWhitespace(c: string): boolean {
  if (c === ' ') return true;
  const code = c.charCodeAt(0);
  return code >= 0x09 && code <= 0x0D;
}

export function getErrorLevel(kind: ParseErrorKind): ParseErrorLevel {
  switch (kind) {
    case ParseErrorKind.UnexpectedCharacter:
    case ParseErrorKind.UnexpectedExpressionCharacter:
    case ParseErrorKind.UnknownMetaTag:
    case ParseErrorKind.IllegalEntity:
    case ParseErrorKind.IncompleteTag:
    case ParseErrorKind.MissingEndTag:
    case ParseErrorKind.IllegalNamePrefix:
    case ParseErrorKind.InvalidAttributePrefix:
    case ParseErrorKind.InvalidAttributeName:
    case ParseErrorKind.InvalidAttributeValue:
    case ParseErrorKind.InvalidAttribute:
    case ParseErrorKind.DuplicatedAttribute:
    case ParseErrorKind.DuplicatedName:
    case ParseErrorKind.AvoidUppercaseLetters:
    case ParseErrorKind.UnexpectedWhitespace:
    case ParseErrorKind.MissingAttributeValue:
    case ParseErrorKind.DataBindingNotAllowed:
    case ParseErrorKind.InvalidIdentifier:
    case ParseErrorKind.InvalidScopeName:
    case ParseErrorKind.ChildNodesNotAllowed:
    case ParseErrorKind.IllegalEscapeSequence:
    case ParseErrorKind.IncompleteConditionExpression:
    case ParseErrorKind.UnmatchedBracket:
    case ParseErrorKind.UnmatchedParenthesis:
    case ParseErrorKind.MissingModuleName:
    case ParseErrorKind.MissingSourcePath:
    case ParseErrorKind.UnsupportedSyntax:
    case ParseErrorKind.ShouldQuoted:
    case ParseErrorKind.EmptyExpression:
    case ParseErrorKind.InvalidEndTag:
    case ParseErrorKind.IncompatibleWithWxAttribute:
    case ParseErrorKind.UninitializedScope:
    case ParseErrorKind.InvalidClassNames:
    case ParseErrorKind.DuplicatedClassNames:
    case ParseErrorKind.IncompatibleWithClassColonAttributes:
    case ParseErrorKind.InvalidInlineStyleString:
    case ParseErrorKind.DuplicatedStylePropertyNames:
    case ParseErrorKind.IncompatibleWithStyleColonAttributes:
      return ParseErrorLevel.Error;
    case ParseErrorKind.MissingExpressionEnd:
    case ParseErrorKind.DeprecatedAttribute:
      return ParseErrorLevel.Warning;
    default:
      return ParseErrorLevel.Note;
  }
}

export function getErrorCode(kind: ParseErrorKind): number {
  return Object.keys(ParseErrorKind).indexOf(kind);
}
