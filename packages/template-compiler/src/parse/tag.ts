import { Range, Position, ParseErrorKind, ParseError as ParseErrorType } from '../types';
import { ParseState, parseIdentifier, consumeStr, peek, next, skipWhitespace, ended, addWarning, addWarningAtCurrentPosition, getPosition, peekStr, isIdentifierStart } from './parse-state';
import { Expression, parseExpression, DEFAULT_FOR_ITEM_SCOPE_NAME, DEFAULT_FOR_INDEX_SCOPE_NAME } from './expression';

export interface TagLocation {
  start: [Range<Position>, Range<Position>];
  close: Range<Position>;
  end?: [Range<Position>, Range<Position>];
}

export interface ImportElement {
  tagLocation: TagLocation;
  srcLocation: Range<Position>;
  src: string;
}

export interface IncludeElement {
  tagLocation: TagLocation;
  srcLocation: Range<Position>;
  src: string;
}

export interface TemplateDefinition {
  tagLocation: TagLocation;
  nameLocation: Range<Position>;
  name: string;
  content: Node[];
}

export interface Script {
  type: 'Inline' | 'Src';
  tagLocation: TagLocation;
  moduleLocation: Range<Position>;
  moduleName: string;
  content?: string;
  contentLocation?: Range<Position>;
  src?: string;
  srcLocation?: Range<Position>;
}

export interface TemplateGlobals {
  imports: ImportElement[];
  includes: IncludeElement[];
  subTemplates: TemplateDefinition[];
  scripts: Script[];
}

export interface Template {
  path: string;
  content: Node[];
  globals: TemplateGlobals;
}

export type Node = 
  | { type: 'Text'; data: string; location: Range<Position> }
  | { type: 'Element'; element: Element; location: Range<Position> }
  | { type: 'Comment'; data: string; location: Range<Position> };

export type ElementKind =
  | { type: 'Normal'; tagName: string; attributes: Attribute[]; children: Node[] }
  | { type: 'Pure'; children: Node[] }
  | { type: 'For'; list: Value; itemName: string; indexName: string; key?: Value; children: Node[] }
  | { type: 'If'; branches: IfBranch[] }
  | { type: 'TemplateRef'; name: Value; data?: Value }
  | { type: 'Include'; src: string }
  | { type: 'Slot'; name?: string; children: Node[] };

export interface IfBranch {
  condition?: Value;
  children: Node[];
}

export interface Element {
  kind: ElementKind;
  location: TagLocation;
}

export type Value =
  | { type: 'Static'; value: string; location: Range<Position> }
  | { type: 'Dynamic'; expression: Expression; location: Range<Position>; doubleBraceLocation: [Range<Position>, Range<Position>] };

export interface Attribute {
  name: string;
  value: Value;
  location: Range<Position>;
}

export interface ParseOptions {
  preserveWhitespace?: boolean;
}

export function parseTemplate(path: string, content: string, options: ParseOptions = {}): { template: Template; warnings: ParseErrorType[] } {
  const ps = createParseState(path, content);
  const globals: TemplateGlobals = {
    imports: [],
    includes: [],
    subTemplates: [],
    scripts: [],
  };
  
  const nodes: Node[] = [];
  while (!ended(ps)) {
    parseNode(ps, globals, nodes, options);
    if (peekStr(ps, '</')) {
      const pos = getPosition(ps);
      skipUntilAfter(ps, '>');
      addWarning(ps, ParseErrorKind.InvalidEndTag, { start: pos, end: getPosition(ps) });
    }
  }
  
  const template: Template = {
    path,
    content: nodes,
    globals,
  };
  
  return { template, warnings: takeWarnings(ps) };
}

function parseNode(ps: ParseState, globals: TemplateGlobals, nodes: Node[], options: ParseOptions): void {
  if (!options.preserveWhitespace) {
    skipWhitespace(ps);
  }
  if (ended(ps)) return;

  if (peekStr(ps, '<!--')) {
    parseComment(ps, nodes);
  } else if (peekStr(ps, '<')) {
    parseElement(ps, globals, nodes, options);
  } else {
    parseText(ps, nodes, options);
  }
}

function parseComment(ps: ParseState, nodes: Node[]): void {
  const start = getPosition(ps);
  consumeStr(ps, '<!--');
  let data = '';
  while (!ended(ps) && !peekStr(ps, '-->')) {
    data += next(ps);
  }
  consumeStr(ps, '-->');
  const end = getPosition(ps);
  nodes.push({ type: 'Comment', data, location: { start, end } });
}

function parseText(ps: ParseState, nodes: Node[], options: ParseOptions): void {
  const start = getPosition(ps);
  let textContent = '';
  
  while (!ended(ps)) {
    if (peek(ps) === '<') break;
    textContent += next(ps);
  }
  
  const end = getPosition(ps);
  
  if (!options.preserveWhitespace) {
    textContent = textContent.trim();
  }
  
  if (!textContent) return;
  
  const textStart = start;
  let currentPos = textStart;
  let remaining = textContent;
  
  while (remaining.length > 0) {
    const braceIndex = remaining.indexOf('{{');
    
    if (braceIndex === -1) {
      if (remaining.trim() || options.preserveWhitespace) {
        const textEnd = { line: currentPos.line, utf16Col: currentPos.utf16Col + remaining.length };
        nodes.push({ 
          type: 'Text', 
          data: remaining, 
          location: { start: currentPos, end: textEnd } 
        });
      }
      break;
    }
    
    if (braceIndex > 0) {
      const staticText = remaining.substring(0, braceIndex);
      if (staticText.trim() || options.preserveWhitespace) {
        const staticEnd = { line: currentPos.line, utf16Col: currentPos.utf16Col + braceIndex };
        nodes.push({ 
          type: 'Text', 
          data: staticText, 
          location: { start: currentPos, end: staticEnd } 
        });
      }
    }
    
    const exprStartIndex = braceIndex + 2;
    const endBraceIndex = remaining.indexOf('}}', exprStartIndex);
    
    if (endBraceIndex === -1) {
      const textEnd = { line: currentPos.line, utf16Col: currentPos.utf16Col + remaining.length };
      nodes.push({ 
        type: 'Text', 
        data: remaining, 
        location: { start: currentPos, end: textEnd } 
      });
      break;
    }
    
    const exprStr = remaining.substring(exprStartIndex, endBraceIndex);
    const exprStart = { line: currentPos.line, utf16Col: currentPos.utf16Col + braceIndex + 2 };
    const exprEnd = { line: currentPos.line, utf16Col: currentPos.utf16Col + endBraceIndex };
    
    const expression = parseExpression(createParseState('', exprStr));
    
    if (expression) {
      nodes.push({
        type: 'Element',
        element: {
          kind: {
            type: 'Normal',
            tagName: 'text',
            attributes: [{
              name: 'value',
              value: { type: 'Dynamic', expression, location: { start: exprStart, end: exprEnd }, doubleBraceLocation: [{ start: currentPos, end: exprStart }, { start: exprEnd, end: exprEnd }] },
              location: { start: exprStart, end: exprEnd }
            }],
            children: []
          },
          location: {
            start: [{ start: currentPos, end: exprStart }, { start: currentPos, end: exprStart }],
            close: { start: exprStart, end: exprStart },
            end: [{ start: exprEnd, end: exprEnd }, { start: exprEnd, end: exprEnd }]
          }
        },
        location: { start: currentPos, end: exprEnd }
      });
    }
    
    remaining = remaining.substring(endBraceIndex + 2);
    currentPos = { line: currentPos.line, utf16Col: currentPos.utf16Col + endBraceIndex + 2 };
  }
}

function parseElement(ps: ParseState, globals: TemplateGlobals, nodes: Node[], options: ParseOptions): void {
  const start = getPosition(ps);
  
  if (!consumeStr(ps, '<')) {
    addWarningAtCurrentPosition(ps, ParseErrorKind.UnexpectedCharacter);
    return;
  }
  
  const tagName = parseTagName(ps);
  if (!tagName) {
    addWarningAtCurrentPosition(ps, ParseErrorKind.InvalidIdentifier);
    return;
  }
  
  skipWhitespace(ps);
  const { attributes, selfClosing } = parseAttributes(ps);
  
  if (tagName === 'import') {
    parseImport(ps, globals, start, attributes);
    return;
  }
  
  if (tagName === 'include') {
    parseInclude(ps, globals, start, attributes);
    return;
  }
  
  if (tagName === 'template') {
    const nameAttr = attributes.find(attr => attr.name === 'name');
    const isAttr = attributes.find(attr => attr.name === 'is');
    if (nameAttr && nameAttr.value.type === 'Static') {
      parseTemplateDefinition(ps, globals, start, attributes, options);
      return;
    }
    if (isAttr) {
      const dataAttr = attributes.find(attr => attr.name === 'data');
      const tagLocation: TagLocation = {
        start: [{ start, end: getPosition(ps) }, { start, end: getPosition(ps) }],
        close: { start: getPosition(ps), end: getPosition(ps) },
      };
      const element: ElementKind = {
        type: 'TemplateRef',
        name: isAttr.value,
        data: dataAttr?.value,
      };
      nodes.push({ type: 'Element', element: { kind: element, location: tagLocation }, location: { start, end: getPosition(ps) } });
      return;
    }
  }
  
  if (tagName === 'wxs') {
    parseScript(ps, globals, start, attributes, tagName);
    return;
  }
  
  const tagLocation: TagLocation = {
    start: [{ start, end: getPosition(ps) }, { start, end: getPosition(ps) }],
    close: { start: getPosition(ps), end: getPosition(ps) },
  };
  
  if (selfClosing || isVoidElement(tagName)) {
    const element = createElement(tagName, attributes, []);
    nodes.push({ type: 'Element', element: { kind: element, location: tagLocation }, location: { start, end: getPosition(ps) } });
    return;
  }
  
  const children: Node[] = [];
  if (!parseChildren(ps, globals, children, tagName, options)) {
    return;
  }
  
  const end = getPosition(ps);
  tagLocation.end = [{ start: end, end: end }, { start: end, end: end }];
  
  const element = createElement(tagName, attributes, children);
  nodes.push({ type: 'Element', element: { kind: element, location: tagLocation }, location: { start, end } });
}

function parseTagName(ps: ParseState): string | undefined {
  skipWhitespace(ps);
  let name = '';

  while (!ended(ps)) {
    const ch = peek(ps);
    if (!ch || /[\s>=/]/.test(ch)) break;
    name += next(ps);
  }

  return name || undefined;
}

function parseAttributes(ps: ParseState): { attributes: Attribute[]; selfClosing: boolean } {
  const attributes: Attribute[] = [];
  
  while (!ended(ps)) {
    skipWhitespace(ps);
    
    if (peek(ps) === '/' && peek(ps, 1) === '>') {
      consumeStr(ps, '/>');
      return { attributes, selfClosing: true };
    }
    
    if (peek(ps) === '>') {
      next(ps);
      return { attributes, selfClosing: false };
    }
    
    const attr = parseAttribute(ps);
    if (attr) {
      attributes.push(attr);
    } else {
      skipUntilAfter(ps, '>');
      return { attributes, selfClosing: false };
    }
  }
  
  return { attributes, selfClosing: false };
}

function parseAttribute(ps: ParseState): Attribute | undefined {
  const start = getPosition(ps);
  const name = parseTagName(ps);
  if (!name) return undefined;
  
  skipWhitespace(ps);
  
  if (peek(ps) !== '=') {
    const end = getPosition(ps);
    return {
      name,
      value: { type: 'Static', value: '', location: { start, end } },
      location: { start, end },
    };
  }
  
  next(ps);
  skipWhitespace(ps);
  
  const value = parseAttributeValue(ps);
  const end = getPosition(ps);
  
  return {
    name,
    value,
    location: { start, end },
  };
}

function parseAttributeValue(ps: ParseState): Value {
  const start = getPosition(ps);
  const ch = peek(ps);
  
  if (ch === '"' || ch === "'") {
    return parseQuotedValue(ps, ch);
  }
  
  let value = '';
  while (!ended(ps)) {
    const c = peek(ps);
    if (!c || /[\s>]/.test(c)) break;
    value += next(ps);
  }
  
  const end = getPosition(ps);
  return { type: 'Static', value, location: { start, end } };
}

function parseQuotedValue(ps: ParseState, quote: string): Value {
  const start = getPosition(ps);
  next(ps);
  
  let value = '';
  let hasBinding = false;
  
  while (!ended(ps)) {
    const ch = peek(ps);
    if (ch === quote) {
      next(ps);
      break;
    }
    if (ch === '{' && peek(ps, 1) === '{') {
      hasBinding = true;
      break;
    }
    value += next(ps);
  }
  
  const end = getPosition(ps);
  
  if (hasBinding) {
    return parseDynamicValue(ps, start, quote);
  }
  
  return { type: 'Static', value, location: { start, end } };
}

function parseDynamicValue(ps: ParseState, start: Position, quote: string): Value {
  const doubleBraceStart = { start: getPosition(ps), end: getPosition(ps) };
  consumeStr(ps, '{{');
  
  const exprStart = getPosition(ps);
  let exprStr = '';
  
  while (!ended(ps)) {
    if (peekStr(ps, '}}')) break;
    exprStr += next(ps);
  }
  
  const expression = parseExpression(createParseState('', exprStr));
  
  const doubleBraceEnd = { start: getPosition(ps), end: getPosition(ps) };
  consumeStr(ps, '}}');
  
  if (peek(ps) === quote) {
    next(ps);
  }
  
  const end = getPosition(ps);
  
  if (!expression) {
    return { type: 'Static', value: '', location: { start, end } };
  }
  
  return {
    type: 'Dynamic',
    expression,
    location: { start, end },
    doubleBraceLocation: [doubleBraceStart, doubleBraceEnd],
  };
}

function parseChildren(ps: ParseState, globals: TemplateGlobals, children: Node[], closeTag: string, options: ParseOptions): boolean {
  while (!ended(ps)) {
    if (peekStr(ps, `</${closeTag}>`)) {
      skipUntilAfter(ps, '>');
      return true;
    }
    parseNode(ps, globals, children, options);
  }
  
  addWarningAtCurrentPosition(ps, ParseErrorKind.MissingEndTag);
  return false;
}

function parseImport(ps: ParseState, globals: TemplateGlobals, start: Position, attributes: Attribute[]): void {
  const srcAttr = attributes.find(attr => attr.name === 'src');
  if (!srcAttr || srcAttr.value.type !== 'Static') {
    addWarningAtCurrentPosition(ps, ParseErrorKind.MissingSourcePath);
    return;
  }

  const end = getPosition(ps);

  globals.imports.push({
    tagLocation: {
      start: [{ start, end }, { start, end }],
      close: { start: end, end },
    },
    srcLocation: srcAttr.location,
    src: srcAttr.value.value,
  });
}

function parseInclude(ps: ParseState, globals: TemplateGlobals, start: Position, attributes: Attribute[]): void {
  const srcAttr = attributes.find(attr => attr.name === 'src');
  if (!srcAttr || srcAttr.value.type !== 'Static') {
    addWarningAtCurrentPosition(ps, ParseErrorKind.MissingSourcePath);
    return;
  }

  const end = getPosition(ps);

  globals.includes.push({
    tagLocation: {
      start: [{ start, end }, { start, end }],
      close: { start: end, end },
    },
    srcLocation: srcAttr.location,
    src: srcAttr.value.value,
  });
}

function parseTemplateDefinition(ps: ParseState, globals: TemplateGlobals, start: Position, attributes: Attribute[], options: ParseOptions): void {
  const nameAttr = attributes.find(attr => attr.name === 'name');
  if (!nameAttr || nameAttr.value.type !== 'Static') {
    addWarningAtCurrentPosition(ps, ParseErrorKind.InvalidIdentifier);
    return;
  }

  const content: Node[] = [];
  parseChildren(ps, globals, content, 'template', options);

  const end = getPosition(ps);

  globals.subTemplates.push({
    tagLocation: {
      start: [{ start, end }, { start, end }],
      close: { start: end, end },
    },
    nameLocation: nameAttr.location,
    name: nameAttr.value.value,
    content,
  });
}

function parseScript(ps: ParseState, globals: TemplateGlobals, start: Position, attributes: Attribute[], tagName: string): void {
  const moduleAttr = attributes.find(attr => attr.name === 'module');
  const srcAttr = attributes.find(attr => attr.name === 'src');
  
  if (!moduleAttr || moduleAttr.value.type !== 'Static') {
    addWarningAtCurrentPosition(ps, ParseErrorKind.MissingModuleName);
    skipUntilAfter(ps, '>');
    return;
  }
  
  const moduleName = moduleAttr.value.value;
  const end = getPosition(ps);
  
  if (srcAttr) {
    globals.scripts.push({
      type: 'Src',
      tagLocation: {
        start: [{ start, end }, { start, end }],
        close: { start: end, end },
      },
      moduleLocation: moduleAttr.location,
      moduleName,
      src: srcAttr.value.type === 'Static' ? srcAttr.value.value : '',
      srcLocation: srcAttr.location,
    });
  } else {
    const contentStart = getPosition(ps);
    let content = '';
    
    while (!ended(ps) && !peekStr(ps, `</${tagName}>`)) {
      content += next(ps);
    }
    
    const contentEnd = getPosition(ps);
    skipUntilAfter(ps, '>');
    
    globals.scripts.push({
      type: 'Inline',
      tagLocation: {
        start: [{ start, end }, { start, end }],
        close: { start: end, end },
      },
      moduleLocation: moduleAttr.location,
      moduleName,
      content,
      contentLocation: { start: contentStart, end: contentEnd },
    });
  }
}

function createElement(tagName: string, attributes: Attribute[], children: Node[]): ElementKind {
  const forList = attributes.find(attr => attr.name === 'wx:for');
  if (forList) {
    const itemName = attributes.find(attr => attr.name === 'wx:for-item')?.value;
    const indexName = attributes.find(attr => attr.name === 'wx:for-index')?.value;
    const keyAttr = attributes.find(attr => attr.name === 'wx:key');

    return {
      type: 'For',
      list: forList.value,
      itemName: itemName?.type === 'Static' ? itemName.value : DEFAULT_FOR_ITEM_SCOPE_NAME,
      indexName: indexName?.type === 'Static' ? indexName.value : DEFAULT_FOR_INDEX_SCOPE_NAME,
      key: keyAttr?.value,
      children,
    };
  }
  
  const ifCond = attributes.find(attr => attr.name === 'wx:if');
  if (ifCond) {
    const branches: IfBranch[] = [];
    
    branches.push({
      condition: ifCond.value,
      children,
    });
    
    return { type: 'If', branches };
  }
  
  if (tagName === 'block') {
    return { type: 'Pure', children };
  }
  
  if (tagName === 'template') {
    const isAttr = attributes.find(attr => attr.name === 'is');
    const dataAttr = attributes.find(attr => attr.name === 'data');
    
    if (isAttr) {
      return {
        type: 'TemplateRef',
        name: isAttr.value,
        data: dataAttr?.value,
      };
    }
  }
  
  if (tagName === 'slot') {
    const nameAttr = attributes.find(attr => attr.name === 'name');
    return {
      type: 'Slot',
      name: nameAttr?.value.type === 'Static' ? nameAttr.value.value : undefined,
      children,
    };
  }
  
  return {
    type: 'Normal',
    tagName,
    attributes,
    children,
  };
}

function isVoidElement(tagName: string): boolean {
  const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  return voidElements.includes(tagName);
}

function skipUntilAfter(ps: ParseState, str: string): void {
  while (!ended(ps)) {
    if (peekStr(ps, str)) {
      consumeStr(ps, str);
      break;
    }
    next(ps);
  }
}

function createParseState(path: string, wholeStr: string): ParseState {
  return {
    path,
    wholeStr,
    curIndex: 0,
    line: 1,
    utf16Col: 0,
    warnings: [],
  };
}

function takeWarnings(ps: ParseState): ParseErrorType[] {
  const warnings = ps.warnings;
  ps.warnings = [];
  return warnings;
}
