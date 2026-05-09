import { decodeHTML } from 'entities';

export function decodeEntity(entity: string): string | undefined {
  const len = entity.length;

  if (entity[len - 1] !== ';') {
    return undefined;
  }

  if (len > 4 && entity.substring(1, 3) === '#x') {
    const hexStr = entity.substring(3, len - 1);
    const hex = parseInt(hexStr, 16);
    if (!isNaN(hex) && hex >= 0 && hex <= 0x10ffff) {
      return String.fromCodePoint(hex);
    }
    return undefined;
  }

  if (len > 3 && entity[1] === '#') {
    const digitStr = entity.substring(2, len - 1);
    const digit = parseInt(digitStr, 10);
    if (!isNaN(digit) && digit >= 0 && digit <= 0x10ffff) {
      return String.fromCodePoint(digit);
    }
    return undefined;
  }

  // Use entities library for named entities
  const decoded = decodeHTML(entity);
  return decoded !== entity ? decoded : undefined;
}

export function decodeHtmlEntities(html: string): string {
  // Match entities that end with semicolon (strict mode like glass-easel)
  // The entities library is lenient and decodes &lt even without semicolon
  // We need to be stricter to match glass-easel behavior
  return html.replace(/&[a-zA-Z][a-zA-Z0-9]*;|&#[0-9]+;|&#x[0-9a-fA-F]+;/g, (match) => {
    const decoded = decodeEntity(match);
    return decoded !== undefined ? decoded : match;
  });
}
