import { DomHandler, Parser as HtmlParser } from 'htmlparser2';

export type WXMLNodeType = 'tag' | 'text' | 'comment' | 'script';

export interface WXMLAttributes {
  [key: string]: string | null;
}

export interface WXMLNode {
  type: WXMLNodeType;
  startIndex?: number;
  endIndex?: number;
}

export interface WXMLTextNode extends WXMLNode {
  type: 'text';
  data: string;
}

export interface WXMLCommentNode extends WXMLNode {
  type: 'comment';
  data: string;
}

export interface WXMLScriptNode extends WXMLNode {
  type: 'script';
  name: string;
  attribs: WXMLAttributes;
  children: WXMLASTNode[];
}

export interface WXMLTagNode extends WXMLNode {
  type: 'tag';
  name: string;
  attribs: WXMLAttributes;
  children: WXMLASTNode[];
}

export type WXMLASTNode = WXMLTextNode | WXMLCommentNode | WXMLScriptNode | WXMLTagNode;

export interface WXMLDirectives {
  if?: string;
  elif?: string;
  else?: boolean;
  for?: string;
  forItem?: string;
  forIndex?: string;
  key?: string;
  slot?: string;
}

export interface WXMLParsedElement {
  tag: string;
  attributes: Map<string, string>;
  directives: WXMLDirectives;
  children: WXMLParsedElement[];
  textContent?: string;
  location: {
    start: number;
    end: number;
  };
}

export interface WXMLTemplateDefinition {
  name: string;
  element: WXMLParsedElement;
  location: {
    start: number;
    end: number;
  };
}

export interface WXMLParsedDocument {
  root: WXMLParsedElement[];
  templates: Map<string, WXMLTemplateDefinition>;
  imports: Array<{
    src: string;
    location: { start: number; end: number };
  }>;
  includes: Array<{
    src: string;
    location: { start: number; end: number };
  }>;
  wxsModules: Array<{
    name: string;
    src?: string;
    code?: string;
    location: { start: number; end: number };
  }>;
}

export interface WXMLParserOptions {
  namespace?: string;
  preserveWhitespace?: boolean;
  recognizeSelfClosing?: boolean;
  recognizeCDATA?: boolean;
}

const DEFAULT_NAMESPACE = 'wx';

export const BUILTIN_COMPONENTS = [
  'view', 'text', 'image', 'icon', 'progress',
  'button', 'input', 'checkbox', 'radio', 'label', 'form',
  'swiper', 'swiper-item', 'scroll-view', 'slider',
  'canvas', 'navigator', 'block', 'template', 'slot',
  'wxs', 'import', 'include'
];

export const EVENT_BINDINGS = {
  BIND: /^bind:?/,
  CATCH: /^catch:?/,
  CAPTURE_BIND: /^capture-bind:?/,
  CAPTURE_CATCH: /^capture-catch:?/,
};

const EXPRESSION_TAG_REGEX = /\{\{([^}]+)\}\}/g;
const FULL_EXPRESSION_REGEX = /^\{\{([^}]+)\}\}$/;

export function hasExpression(str: string): boolean {
  return EXPRESSION_TAG_REGEX.test(str);
}

export function extractExpressions(str: string): Array<{ type: 'text' | 'expression'; value: string }> {
  const result: Array<{ type: 'text' | 'expression'; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  EXPRESSION_TAG_REGEX.lastIndex = 0;

  while ((match = EXPRESSION_TAG_REGEX.exec(str)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        value: str.slice(lastIndex, match.index)
      });
    }

    result.push({
      type: 'expression',
      value: match[1].trim()
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < str.length) {
    result.push({
      type: 'text',
      value: str.slice(lastIndex)
    });
  }

  return result;
}

export function isPureExpression(str: string): boolean {
  return FULL_EXPRESSION_REGEX.test(str.trim());
}

export function getPureExpression(str: string): string | null {
  const match = str.trim().match(FULL_EXPRESSION_REGEX);
  return match ? match[1].trim() : null;
}

function parseDirectives(
  attribs: WXMLAttributes,
  namespace: string
): { directives: WXMLDirectives; normalAttrs: Map<string, string> } {
  const directives: WXMLDirectives = {};
  const normalAttrs = new Map<string, string>();
  const nsPrefix = `${namespace}:`;

  for (const [key, value] of Object.entries(attribs)) {
    if (!value && value !== null) continue;

    if (key === `${nsPrefix}if`) {
      directives.if = value!;
    } else if (key === `${nsPrefix}elif`) {
      directives.elif = value!;
    } else if (key === `${nsPrefix}else`) {
      directives.else = true;
    } else if (key === `${nsPrefix}for`) {
      directives.for = value!;
    } else if (key === `${nsPrefix}for-item`) {
      directives.forItem = value!;
    } else if (key === `${nsPrefix}for-index`) {
      directives.forIndex = value!;
    } else if (key === `${nsPrefix}key`) {
      directives.key = value!;
    } else if (key === 'slot') {
      directives.slot = value!;
    } else {
      normalAttrs.set(key, value || '');
    }
  }

  return { directives, normalAttrs };
}

export function parseEventBinding(attrName: string): {
  isEvent: boolean;
  type: 'bind' | 'catch' | 'capture-bind' | 'capture-catch' | null;
  eventName: string | null;
} {
  for (const [type, regex] of Object.entries(EVENT_BINDINGS)) {
    const match = attrName.match(regex);
    if (match) {
      const eventName = attrName.replace(regex, '');
      return {
        isEvent: true,
        type: type.toLowerCase().replace('_', '-') as 'bind' | 'catch' | 'capture-bind' | 'capture-catch',
        eventName
      };
    }
  }

  return { isEvent: false, type: null, eventName: null };
}

function convertNode(node: any): WXMLASTNode | null {
  if (!node) return null;

  switch (node.type) {
    case 'text':
      return {
        type: 'text',
        data: node.data,
        startIndex: node.startIndex,
        endIndex: node.endIndex
      } as WXMLTextNode;

    case 'comment':
      return {
        type: 'comment',
        data: node.data,
        startIndex: node.startIndex,
        endIndex: node.endIndex
      } as WXMLCommentNode;

    case 'script':
      return {
        type: 'script',
        name: node.name,
        attribs: node.attribs || {},
        children: (node.children || []).map(convertNode).filter(Boolean) as WXMLASTNode[],
        startIndex: node.startIndex,
        endIndex: node.endIndex
      } as WXMLScriptNode;

    case 'tag':
      return {
        type: 'tag',
        name: node.name,
        attribs: node.attribs || {},
        children: (node.children || []).map(convertNode).filter(Boolean) as WXMLASTNode[],
        startIndex: node.startIndex,
        endIndex: node.endIndex
      } as WXMLTagNode;

    default:
      return null;
  }
}

function transformToElement(node: WXMLASTNode, namespace: string): WXMLParsedElement | null {
  if (!node) return null;

  switch (node.type) {
    case 'text':
      return {
        tag: '#text',
        attributes: new Map(),
        directives: {},
        children: [],
        textContent: (node as WXMLTextNode).data,
        location: {
          start: node.startIndex || 0,
          end: node.endIndex || 0
        }
      };

    case 'comment':
      return {
        tag: '#comment',
        attributes: new Map(),
        directives: {},
        children: [],
        textContent: (node as WXMLCommentNode).data,
        location: {
          start: node.startIndex || 0,
          end: node.endIndex || 0
        }
      };

    case 'tag':
    case 'script': {
      const tagNode = node as WXMLTagNode | WXMLScriptNode;
      const { directives, normalAttrs } = parseDirectives(tagNode.attribs, namespace);

      return {
        tag: tagNode.name,
        attributes: normalAttrs,
        directives,
        children: (tagNode.children || [])
          .map(child => transformToElement(child, namespace))
          .filter(Boolean) as WXMLParsedElement[],
        location: {
          start: node.startIndex || 0,
          end: node.endIndex || 0
        }
      };
    }

    default:
      return null;
  }
}

export class WXMLParser {
  private options: Required<WXMLParserOptions>;

  constructor(options: WXMLParserOptions = {}) {
    this.options = {
      namespace: options.namespace || DEFAULT_NAMESPACE,
      preserveWhitespace: options.preserveWhitespace ?? false,
      recognizeSelfClosing: options.recognizeSelfClosing ?? true,
      recognizeCDATA: options.recognizeCDATA ?? false
    };
  }

  parse(template: string): Promise<WXMLASTNode[]> {
    return new Promise((resolve, reject) => {
      const handler = new DomHandler((error, children) => {
        if (error) {
          reject(this.enhanceError(error, template));
          return;
        }

        const ast = (children || [])
          .map(convertNode)
          .filter(Boolean) as WXMLASTNode[];

        resolve(ast);
      }, {
        normalizeWhitespace: !this.options.preserveWhitespace,
        withStartIndices: true,
        withEndIndices: true
      });

      const parser = new HtmlParser(handler, {
        xmlMode: true,
        recognizeSelfClosing: this.options.recognizeSelfClosing,
        recognizeCDATA: this.options.recognizeCDATA
      });

      try {
        parser.write(template);
        parser.end();
      } catch (error) {
        reject(this.enhanceError(error as Error, template));
      }
    });
  }

  async parseDocument(template: string): Promise<WXMLParsedDocument> {
    const ast = await this.parse(template);

    const document: WXMLParsedDocument = {
      root: [],
      templates: new Map(),
      imports: [],
      includes: [],
      wxsModules: []
    };

    for (const node of ast) {
      this.processNode(node, document, template);
    }

    return document;
  }

  private processNode(
    node: WXMLASTNode,
    document: WXMLParsedDocument,
    template: string
  ): void {
    if (node.type === 'tag') {
      const tagNode = node as WXMLTagNode;

      if (tagNode.name === 'import') {
        const src = tagNode.attribs.src;
        if (src) {
          document.imports.push({
            src,
            location: {
              start: node.startIndex || 0,
              end: node.endIndex || template.length
            }
          });
        }
        return;
      }

      if (tagNode.name === 'include') {
        const src = tagNode.attribs.src;
        if (src) {
          document.includes.push({
            src,
            location: {
              start: node.startIndex || 0,
              end: node.endIndex || template.length
            }
          });
        }
        return;
      }

      if (tagNode.name === 'wxs') {
        const moduleName = tagNode.attribs.module;
        const src = tagNode.attribs.src;

        if (moduleName) {
          const wxsModule: any = {
            name: moduleName,
            location: {
              start: node.startIndex || 0,
              end: node.endIndex || template.length
            }
          };

          if (src) {
            wxsModule.src = src;
          } else {
            const codeNode = tagNode.children?.find(c => c.type === 'text') as WXMLTextNode;
            if (codeNode) {
              wxsModule.code = codeNode.data;
            }
          }

          document.wxsModules.push(wxsModule);
        }
        return;
      }

      if (tagNode.name === 'template' && tagNode.attribs.name) {
        const element = transformToElement(node, this.options.namespace);
        if (element) {
          document.templates.set(tagNode.attribs.name, {
            name: tagNode.attribs.name,
            element,
            location: {
              start: node.startIndex || 0,
              end: node.endIndex || template.length
            }
          });
        }
        return;
      }

      const element = transformToElement(node, this.options.namespace);
      if (element) {
        document.root.push(element);
      }
    } else if (node.type === 'text') {
      const textNode = node as WXMLTextNode;
      if (this.options.preserveWhitespace || textNode.data.trim()) {
        const element = transformToElement(node, this.options.namespace);
        if (element) {
          document.root.push(element);
        }
      }
    }
  }

  private enhanceError(error: Error, template: string): Error {
    const indexMatch = error.message.match(/index\s+(\d+)/i);
    if (indexMatch) {
      const index = parseInt(indexMatch[1], 10);
      const lines = template.substring(0, index).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      const enhancedError = new Error(
        `${error.message}\n  at line ${line}, column ${column}`
      );
      (enhancedError as any).line = line;
      (enhancedError as any).column = column;
      (enhancedError as any).index = index;

      return enhancedError;
    }

    return error;
  }
}

export async function parseWXML(
  template: string,
  options?: WXMLParserOptions
): Promise<WXMLASTNode[]> {
  const parser = new WXMLParser(options);
  return parser.parse(template);
}

export async function parseWXMLDocument(
  template: string,
  options?: WXMLParserOptions
): Promise<WXMLParsedDocument> {
  const parser = new WXMLParser(options);
  return parser.parseDocument(template);
}

export function parseExpression(expression: string): {
  isExpression: boolean;
  isPure: boolean;
  parts: Array<{ type: 'text' | 'expression'; value: string }>;
  pureExpression?: string;
} {
  const isExpr = hasExpression(expression);
  const isPure = isPureExpression(expression);
  const parts = extractExpressions(expression);

  return {
    isExpression: isExpr,
    isPure,
    parts,
    pureExpression: isPure ? getPureExpression(expression) || undefined : undefined
  };
}

export default WXMLParser;
