import { Template, Node, ElementKind, Value, Attribute } from './parse/tag';

export interface StringifyOptions {
  minimize?: boolean;
  indent?: number;
}

export function stringifyTemplate(template: Template, options: StringifyOptions = {}): string {
  const { minimize = false, indent = 2 } = options;
  const indentStr = minimize ? '' : ' '.repeat(indent);
  
  let result = '';
  
  for (const node of template.content) {
    result += stringifyNode(node, indentStr, 0, minimize);
  }
  
  return result;
}

function stringifyNode(node: Node, indentStr: string, depth: number, minimize: boolean): string {
  const indent = minimize ? '' : indentStr.repeat(depth);
  const newline = minimize ? '' : '\n';
  
  switch (node.type) {
    case 'Text':
      return node.data;
    case 'Comment':
      return `${indent}<!--${node.data}-->${newline}`;
    case 'Element':
      return stringifyElement(node.element.kind, indentStr, depth, minimize, indent, newline);
    default:
      return '';
  }
}

function stringifyElement(kind: ElementKind, indentStr: string, depth: number, minimize: boolean, indent: string, newline: string): string {
  switch (kind.type) {
    case 'Normal':
      return stringifyNormalElement(kind, indentStr, depth, minimize, indent, newline);
    case 'Pure':
      return kind.children.map(child => stringifyNode(child, indentStr, depth, minimize)).join('');
    case 'For':
    case 'If':
    case 'TemplateRef':
    case 'Include':
    case 'Slot':
      return '';
    default:
      return '';
  }
}

function stringifyNormalElement(kind: Extract<ElementKind, { type: 'Normal' }>, indentStr: string, depth: number, minimize: boolean, indent: string, newline: string): string {
  const attrs = kind.attributes.map(attr => stringifyAttribute(attr)).join(' ');
  const attrStr = attrs ? ' ' + attrs : '';

  if (kind.children.length === 0) {
    return `${indent}<${kind.tagName}${attrStr} />${newline}`;
  }

  const hasOnlyText = kind.children.length === 1 && kind.children[0].type === 'Text';

  if (hasOnlyText) {
    const textNode = kind.children[0] as Extract<Node, { type: 'Text' }>;
    return `${indent}<${kind.tagName}${attrStr}>${textNode.data}</${kind.tagName}>${newline}`;
  }

  let result = `${indent}<${kind.tagName}${attrStr}>${newline}`;
  for (const child of kind.children) {
    result += stringifyNode(child, indentStr, depth + 1, minimize);
  }
  result += `${indent}</${kind.tagName}>${newline}`;

  return result;
}

function stringifyAttribute(attr: Attribute): string {
  const value = stringifyValue(attr.value);
  return `${attr.name}="${value}"`;
}

function stringifyValue(value: Value): string {
  switch (value.type) {
    case 'Static':
      return value.value;
    case 'Dynamic':
      return `{{${stringifyExpression(value.expression)}}}`;
    default:
      return '';
  }
}

function stringifyExpression(expr: any): string {
  if (!expr) return '';
  
  switch (expr.type) {
    case 'DataField':
      return expr.name;
    case 'LitStr':
      return `"${expr.value}"`;
    case 'LitInt':
    case 'LitFloat':
      return String(expr.value);
    case 'LitBool':
      return String(expr.value);
    case 'StaticMember':
      return `${stringifyExpression(expr.obj)}.${expr.fieldName}`;
    case 'Binary':
      return `${stringifyExpression(expr.left)} ${expr.op} ${stringifyExpression(expr.right)}`;
    default:
      return '';
  }
}
