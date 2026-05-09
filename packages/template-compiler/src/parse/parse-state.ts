import { Position, Range, ParseError, ParseErrorKind, ParseErrorLevel, getErrorLevel, getErrorCode } from '../types';

export interface ParseState {
  path: string;
  wholeStr: string;
  curIndex: number;
  line: number;
  utf16Col: number;
  warnings: ParseError[];
}

export function createParseState(path: string, wholeStr: string): ParseState {
  return {
    path,
    wholeStr,
    curIndex: 0,
    line: 1,
    utf16Col: 0,
    warnings: [],
  };
}

export function getPosition(ps: ParseState): Position {
  return {
    line: ps.line,
    utf16Col: ps.utf16Col,
  };
}

export function ended(ps: ParseState): boolean {
  return ps.curIndex >= ps.wholeStr.length;
}

export function peek(ps: ParseState, offset: number = 0): string | undefined {
  const index = ps.curIndex + offset;
  if (index >= ps.wholeStr.length) return undefined;
  return ps.wholeStr[index];
}

export function peekStr(ps: ParseState, str: string): boolean {
  return ps.wholeStr.substring(ps.curIndex, ps.curIndex + str.length) === str;
}

export function next(ps: ParseState): string | undefined {
  if (ended(ps)) return undefined;
  const ch = ps.wholeStr[ps.curIndex];
  ps.curIndex++;
  if (ch === '\n') {
    ps.line++;
    ps.utf16Col = 0;
  } else {
    ps.utf16Col++;
  }
  return ch;
}

export function consumeWhile(ps: ParseState, predicate: (ch: string) => boolean): string {
  let result = '';
  while (!ended(ps)) {
    const ch = peek(ps);
    if (ch === undefined || !predicate(ch)) break;
    result += next(ps);
  }
  return result;
}

export function consumeStr(ps: ParseState, str: string): Range<Position> | undefined {
  if (!peekStr(ps, str)) return undefined;
  const start = getPosition(ps);
  for (let i = 0; i < str.length; i++) {
    next(ps);
  }
  const end = getPosition(ps);
  return { start, end };
}

export function skipWhitespace(ps: ParseState): void {
  while (!ended(ps)) {
    const ch = peek(ps);
    if (ch === undefined || !isWhitespace(ch)) break;
    next(ps);
  }
}

export function skipUntilAfter(ps: ParseState, str: string): void {
  while (!ended(ps)) {
    if (peekStr(ps, str)) {
      consumeStr(ps, str);
      break;
    }
    next(ps);
  }
}

export function isWhitespace(ch: string): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
}

export function isIdentifierStart(ch: string): boolean {
  return /^[a-zA-Z_$]$/.test(ch);
}

export function isIdentifierPart(ch: string): boolean {
  return /^[a-zA-Z0-9_$]$/.test(ch);
}

export function parseIdentifier(ps: ParseState): { name: string; location: Range<Position> } | undefined {
  skipWhitespace(ps);
  const start = getPosition(ps);
  const firstCh = peek(ps);
  if (!firstCh || !isIdentifierStart(firstCh)) return undefined;
  
  let name = next(ps)!;
  while (!ended(ps)) {
    const ch = peek(ps);
    if (!ch || !isIdentifierPart(ch)) break;
    name += next(ps);
  }
  
  const end = getPosition(ps);
  return { name, location: { start, end } };
}

export function addWarning(
  ps: ParseState,
  kind: ParseErrorKind,
  location: Range<Position>
): void {
  const error: ParseError = {
    isError: getErrorLevel(kind) >= ParseErrorLevel.Error,
    level: getErrorLevel(kind),
    code: getErrorCode(kind),
    message: kind,
    path: ps.path,
    startLine: location.start.line,
    startColumn: location.start.utf16Col,
    endLine: location.end.line,
    endColumn: location.end.utf16Col,
  };
  ps.warnings.push(error);
}

export function addWarningAtCurrentPosition(ps: ParseState, kind: ParseErrorKind): void {
  const pos = getPosition(ps);
  addWarning(ps, kind, { start: pos, end: pos });
}

export function takeWarnings(ps: ParseState): ParseError[] {
  const warnings = ps.warnings;
  ps.warnings = [];
  return warnings;
}

export function getRemaining(ps: ParseState): string {
  return ps.wholeStr.substring(ps.curIndex);
}

export function getSlice(ps: ParseState, start: number, end: number): string {
  return ps.wholeStr.substring(start, end);
}

export function getCurIndex(ps: ParseState): number {
  return ps.curIndex;
}
