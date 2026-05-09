import { Range, Position } from '../types';
import { ParseState, parseIdentifier, consumeStr, peek, next, skipWhitespace, ended, addWarning, addWarningAtCurrentPosition, getPosition, consumeWhile, isIdentifierStart, isIdentifierPart } from './parse-state';
import { ParseErrorKind } from '../types';

export const DEFAULT_FOR_ITEM_SCOPE_NAME = 'item';
export const DEFAULT_FOR_INDEX_SCOPE_NAME = 'index';

export type Expression =
  | { type: 'ScopeRef'; index: number; location: Range<Position> }
  | { type: 'DataField'; name: string; location: Range<Position> }
  | { type: 'ToStringWithoutUndefined'; value: Expression; location: Range<Position> }
  | { type: 'LitUndefined'; location: Range<Position> }
  | { type: 'LitNull'; location: Range<Position> }
  | { type: 'LitStr'; value: string; location: Range<Position> }
  | { type: 'LitInt'; value: number; location: Range<Position> }
  | { type: 'LitFloat'; value: number; location: Range<Position> }
  | { type: 'LitBool'; value: boolean; location: Range<Position> }
  | { type: 'LitObj'; fields: ObjectField[]; braceLocation: [Range<Position>, Range<Position>] }
  | { type: 'LitArr'; fields: ArrayField[]; bracketLocation: [Range<Position>, Range<Position>] }
  | { type: 'StaticMember'; obj: Expression; fieldName: string; dotLocation: Range<Position>; fieldLocation: Range<Position> }
  | { type: 'DynamicMember'; obj: Expression; fieldName: Expression; bracketLocation: [Range<Position>, Range<Position>] }
  | { type: 'FuncCall'; func: Expression; args: Expression[]; parenLocation: [Range<Position>, Range<Position>] }
  | { type: 'Unary'; op: string; operand: Expression; opLocation: Range<Position> }
  | { type: 'Binary'; op: string; left: Expression; right: Expression; opLocation: Range<Position> }
  | { type: 'Conditional'; cond: Expression; thenBranch: Expression; elseBranch: Expression; questionLocation: Range<Position>; colonLocation: Range<Position> };

export interface ObjectField {
  type: 'Named' | 'Spread';
  name?: string;
  value?: Expression;
  location: Range<Position>;
  colonLocation?: Range<Position>;
}

export interface ArrayField {
  type: 'Element' | 'Spread';
  value?: Expression;
  location: Range<Position>;
}

export function parseExpression(ps: ParseState): Expression | undefined {
  skipWhitespace(ps);
  return parseConditional(ps);
}

function parseConditional(ps: ParseState): Expression | undefined {
  const cond = parseOr(ps);
  if (!cond) return undefined;
  
  skipWhitespace(ps);
  if (peek(ps) === '?') {
    const questionLocation = { start: getPosition(ps), end: getPosition(ps) };
    next(ps);
    const thenBranch = parseConditional(ps);
    if (!thenBranch) {
      addWarningAtCurrentPosition(ps, ParseErrorKind.IncompleteConditionExpression);
      return undefined;
    }
    skipWhitespace(ps);
    if (peek(ps) !== ':') {
      addWarningAtCurrentPosition(ps, ParseErrorKind.IncompleteConditionExpression);
      return undefined;
    }
    const colonLocation = { start: getPosition(ps), end: getPosition(ps) };
    next(ps);
    const elseBranch = parseConditional(ps);
    if (!elseBranch) {
      addWarningAtCurrentPosition(ps, ParseErrorKind.IncompleteConditionExpression);
      return undefined;
    }
    return {
      type: 'Conditional',
      cond,
      thenBranch,
      elseBranch,
      questionLocation,
      colonLocation,
    };
  }
  
  return cond;
}

function parseOr(ps: ParseState): Expression | undefined {
  let left = parseAnd(ps);
  if (!left) return undefined;
  
  while (true) {
    skipWhitespace(ps);
    if (peekStr(ps, '||')) {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      consumeStr(ps, '||');
      const right = parseAnd(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '||', left, right, opLocation };
    } else {
      break;
    }
  }
  
  return left;
}

function parseAnd(ps: ParseState): Expression | undefined {
  let left = parseEquality(ps);
  if (!left) return undefined;
  
  while (true) {
    skipWhitespace(ps);
    if (peekStr(ps, '&&')) {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      consumeStr(ps, '&&');
      const right = parseEquality(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '&&', left, right, opLocation };
    } else {
      break;
    }
  }
  
  return left;
}

function parseEquality(ps: ParseState): Expression | undefined {
  let left = parseRelational(ps);
  if (!left) return undefined;
  
  while (true) {
    skipWhitespace(ps);
    const ch = peek(ps);
    if (ch === '=' && peek(ps, 1) === '=') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      consumeStr(ps, '==');
      const right = parseRelational(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '==', left, right, opLocation };
    } else if (ch === '!' && peek(ps, 1) === '=') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      consumeStr(ps, '!=');
      const right = parseRelational(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '!=', left, right, opLocation };
    } else if (ch === '=' && peek(ps, 1) === '=' && peek(ps, 2) === '=') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      consumeStr(ps, '===');
      const right = parseRelational(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '===', left, right, opLocation };
    } else if (ch === '!' && peek(ps, 1) === '=' && peek(ps, 2) === '=') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      consumeStr(ps, '!==');
      const right = parseRelational(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '!==', left, right, opLocation };
    } else {
      break;
    }
  }
  
  return left;
}

function parseRelational(ps: ParseState): Expression | undefined {
  let left = parseAdditive(ps);
  if (!left) return undefined;
  
  while (true) {
    skipWhitespace(ps);
    const ch = peek(ps);
    if (ch === '<' && peek(ps, 1) === '=') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      consumeStr(ps, '<=');
      const right = parseAdditive(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '<=', left, right, opLocation };
    } else if (ch === '>' && peek(ps, 1) === '=') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      consumeStr(ps, '>=');
      const right = parseAdditive(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '>=', left, right, opLocation };
    } else if (ch === '<') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      const right = parseAdditive(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '<', left, right, opLocation };
    } else if (ch === '>') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      const right = parseAdditive(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '>', left, right, opLocation };
    } else {
      break;
    }
  }
  
  return left;
}

function parseAdditive(ps: ParseState): Expression | undefined {
  let left = parseMultiplicative(ps);
  if (!left) return undefined;
  
  while (true) {
    skipWhitespace(ps);
    const ch = peek(ps);
    if (ch === '+') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      const right = parseMultiplicative(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '+', left, right, opLocation };
    } else if (ch === '-') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      const right = parseMultiplicative(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '-', left, right, opLocation };
    } else {
      break;
    }
  }
  
  return left;
}

function parseMultiplicative(ps: ParseState): Expression | undefined {
  let left = parseUnary(ps);
  if (!left) return undefined;
  
  while (true) {
    skipWhitespace(ps);
    const ch = peek(ps);
    if (ch === '*' && peek(ps, 1) !== '*') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      const right = parseUnary(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '*', left, right, opLocation };
    } else if (ch === '/' && peek(ps, 1) !== '/') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      const right = parseUnary(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '/', left, right, opLocation };
    } else if (ch === '%') {
      const opLocation = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      const right = parseUnary(ps);
      if (!right) return undefined;
      left = { type: 'Binary', op: '%', left, right, opLocation };
    } else {
      break;
    }
  }
  
  return left;
}

function parseUnary(ps: ParseState): Expression | undefined {
  skipWhitespace(ps);
  const ch = peek(ps);
  if (ch === '!') {
    const opLocation = { start: getPosition(ps), end: getPosition(ps) };
    next(ps);
    const operand = parseUnary(ps);
    if (!operand) return undefined;
    return { type: 'Unary', op: '!', operand, opLocation };
  } else if ((ch === '-') && (peek(ps, 1) !== undefined && peek(ps, 1) !== '=')) {
    const opLocation = { start: getPosition(ps), end: getPosition(ps) };
    next(ps);
    const operand = parseUnary(ps);
    if (!operand) return undefined;
    return { type: 'Unary', op: '-', operand, opLocation };
  } else if (ch === '+') {
    const opLocation = { start: getPosition(ps), end: getPosition(ps) };
    next(ps);
    const operand = parseUnary(ps);
    if (!operand) return undefined;
    return { type: 'Unary', op: '+', operand, opLocation };
  }
  
  return parsePostfix(ps);
}

function parsePostfix(ps: ParseState): Expression | undefined {
  let expr = parsePrimary(ps);
  if (!expr) return undefined;
  
  while (true) {
    skipWhitespace(ps);
    const ch = peek(ps);
    if (ch === '.') {
      const dotLocation = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      const fieldId = parseIdentifier(ps);
      if (!fieldId) {
        addWarningAtCurrentPosition(ps, ParseErrorKind.InvalidIdentifier);
        return undefined;
      }
      expr = {
        type: 'StaticMember',
        obj: expr,
        fieldName: fieldId.name,
        dotLocation,
        fieldLocation: fieldId.location,
      };
    } else if (ch === '[') {
      const bracketStart = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      const fieldName = parseExpression(ps);
      if (!fieldName) return undefined;
      skipWhitespace(ps);
      if (peek(ps) !== ']') {
        addWarningAtCurrentPosition(ps, ParseErrorKind.UnmatchedBracket);
        return undefined;
      }
      const bracketEnd = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      expr = {
        type: 'DynamicMember',
        obj: expr,
        fieldName,
        bracketLocation: [{ start: bracketStart.start, end: bracketStart.end }, { start: bracketEnd.start, end: bracketEnd.end }],
      };
    } else if (ch === '(') {
      const parenStart = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      const args: Expression[] = [];
      skipWhitespace(ps);
      if (peek(ps) !== ')') {
        while (true) {
          const arg = parseExpression(ps);
          if (!arg) return undefined;
          args.push(arg);
          skipWhitespace(ps);
          if (peek(ps) === ')') break;
          if (peek(ps) !== ',') {
            addWarningAtCurrentPosition(ps, ParseErrorKind.UnexpectedExpressionCharacter);
            return undefined;
          }
          next(ps);
          skipWhitespace(ps);
        }
      }
      const parenEnd = { start: getPosition(ps), end: getPosition(ps) };
      next(ps);
      expr = {
        type: 'FuncCall',
        func: expr,
        args,
        parenLocation: [{ start: parenStart.start, end: parenStart.end }, { start: parenEnd.start, end: parenEnd.end }],
      };
    } else {
      break;
    }
  }
  
  return expr;
}

function parsePrimary(ps: ParseState): Expression | undefined {
  skipWhitespace(ps);
  const start = getPosition(ps);
  const ch = peek(ps);
  
  if (ch === undefined) return undefined;
  
  if (ch === '"' || ch === "'") {
    return parseStringLiteral(ps);
  }
  
  if (ch === '[') {
    return parseArrayLiteral(ps);
  }
  
  if (ch === '{') {
    return parseObjectLiteral(ps);
  }
  
  if (/^[0-9]$/.test(ch) || (ch === '.' && /^[0-9]$/.test(peek(ps, 1) || ''))) {
    return parseNumberLiteral(ps);
  }
  
  const idStart = getPosition(ps);
  const idResult = parseIdentifier(ps);
  if (idResult) {
    const name = idResult.name;
    if (name === 'true') {
      return { type: 'LitBool', value: true, location: { start: idStart, end: getPosition(ps) } };
    } else if (name === 'false') {
      return { type: 'LitBool', value: false, location: { start: idStart, end: getPosition(ps) } };
    } else if (name === 'undefined') {
      return { type: 'LitUndefined', location: { start: idStart, end: getPosition(ps) } };
    } else if (name === 'null') {
      return { type: 'LitNull', location: { start: idStart, end: getPosition(ps) } };
    } else {
      return { type: 'DataField', name, location: { start: idStart, end: getPosition(ps) } };
    }
  }
  
  addWarningAtCurrentPosition(ps, ParseErrorKind.UnexpectedExpressionCharacter);
  return undefined;
}

function parseStringLiteral(ps: ParseState): Expression | undefined {
  const start = getPosition(ps);
  const quote = next(ps);
  if (quote !== '"' && quote !== "'") return undefined;
  
  let value = '';
  while (!ended(ps)) {
    const ch = peek(ps);
    if (ch === quote) {
      next(ps);
      break;
    }
    if (ch === '\\') {
      next(ps);
      const escaped = next(ps);
      if (escaped === 'n') value += '\n';
      else if (escaped === 't') value += '\t';
      else if (escaped === 'r') value += '\r';
      else if (escaped === '\\') value += '\\';
      else if (escaped === '"') value += '"';
      else if (escaped === "'") value += "'";
      else if (escaped === undefined) {
        addWarningAtCurrentPosition(ps, ParseErrorKind.IllegalEscapeSequence);
        return undefined;
      } else {
        value += escaped;
      }
    } else if (ch === undefined) {
      addWarningAtCurrentPosition(ps, ParseErrorKind.MissingExpressionEnd);
      return undefined;
    } else {
      value += next(ps);
    }
  }
  
  const end = getPosition(ps);
  return { type: 'LitStr', value, location: { start, end } };
}

function parseNumberLiteral(ps: ParseState): Expression | undefined {
  const start = getPosition(ps);
  let numStr = '';
  
  while (!ended(ps)) {
    const ch = peek(ps);
    if (ch === undefined) break;
    if (/^[0-9]$/.test(ch) || ch === '.') {
      numStr += next(ps);
    } else {
      break;
    }
  }
  
  const end = getPosition(ps);
  if (numStr.includes('.')) {
    return { type: 'LitFloat', value: parseFloat(numStr), location: { start, end } };
  } else {
    return { type: 'LitInt', value: parseInt(numStr, 10), location: { start, end } };
  }
}

function parseArrayLiteral(ps: ParseState): Expression | undefined {
  const bracketStart = { start: getPosition(ps), end: getPosition(ps) };
  next(ps);
  
  const fields: ArrayField[] = [];
  skipWhitespace(ps);
  
  if (peek(ps) === ']') {
    const bracketEnd = { start: getPosition(ps), end: getPosition(ps) };
    next(ps);
    return { type: 'LitArr', fields, bracketLocation: [{ start: bracketStart.start, end: bracketStart.end }, { start: bracketEnd.start, end: bracketEnd.end }] };
  }
  
  while (true) {
    skipWhitespace(ps);
    
    if (peek(ps) === '.') {
      const spreadLocation = { start: getPosition(ps), end: getPosition(ps) };
      consumeStr(ps, '...');
      const value = parseExpression(ps);
      if (!value) return undefined;
      fields.push({ type: 'Spread', value, location: spreadLocation });
    } else {
      const value = parseExpression(ps);
      if (!value) return undefined;
      fields.push({ type: 'Element', value, location: { start: getPosition(ps), end: getPosition(ps) } });
    }
    
    skipWhitespace(ps);
    if (peek(ps) === ']') break;
    if (peek(ps) !== ',') {
      addWarningAtCurrentPosition(ps, ParseErrorKind.UnexpectedExpressionCharacter);
      return undefined;
    }
    next(ps);
  }
  
  const bracketEnd = { start: getPosition(ps), end: getPosition(ps) };
  next(ps);
  return { type: 'LitArr', fields, bracketLocation: [{ start: bracketStart.start, end: bracketStart.end }, { start: bracketEnd.start, end: bracketEnd.end }] };
}

function parseObjectLiteral(ps: ParseState): Expression | undefined {
  const braceStart = { start: getPosition(ps), end: getPosition(ps) };
  next(ps);
  
  const fields: ObjectField[] = [];
  skipWhitespace(ps);
  
  if (peek(ps) === '}') {
    const braceEnd = { start: getPosition(ps), end: getPosition(ps) };
    next(ps);
    return { type: 'LitObj', fields, braceLocation: [{ start: braceStart.start, end: braceStart.end }, { start: braceEnd.start, end: braceEnd.end }] };
  }
  
  while (true) {
    skipWhitespace(ps);
    
    if (peek(ps) === '.') {
      const spreadLocation = { start: getPosition(ps), end: getPosition(ps) };
      consumeStr(ps, '...');
      const value = parseExpression(ps);
      if (!value) return undefined;
      fields.push({ type: 'Spread', value, location: spreadLocation });
    } else {
      const idResult = parseIdentifier(ps);
      if (!idResult) {
        addWarningAtCurrentPosition(ps, ParseErrorKind.InvalidIdentifier);
        return undefined;
      }
      
      skipWhitespace(ps);
      const ch = peek(ps);
      if (ch === ':') {
        const colonLocation = { start: getPosition(ps), end: getPosition(ps) };
        next(ps);
        const value = parseExpression(ps);
        if (!value) return undefined;
        fields.push({
          type: 'Named',
          name: idResult.name,
          value,
          location: idResult.location,
          colonLocation,
        });
      } else if (ch === ',' || ch === '}') {
        fields.push({
          type: 'Named',
          name: idResult.name,
          value: { type: 'DataField', name: idResult.name, location: idResult.location },
          location: idResult.location,
        });
      } else {
        addWarningAtCurrentPosition(ps, ParseErrorKind.UnexpectedExpressionCharacter);
        return undefined;
      }
    }
    
    skipWhitespace(ps);
    if (peek(ps) === '}') break;
    if (peek(ps) !== ',') {
      addWarningAtCurrentPosition(ps, ParseErrorKind.UnexpectedExpressionCharacter);
      return undefined;
    }
    next(ps);
  }
  
  const braceEnd = { start: getPosition(ps), end: getPosition(ps) };
  next(ps);
  return { type: 'LitObj', fields, braceLocation: [{ start: braceStart.start, end: braceStart.end }, { start: braceEnd.start, end: braceEnd.end }] };
}

function peekStr(ps: ParseState, str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (peek(ps, i) !== str[i]) return false;
  }
  return true;
}
