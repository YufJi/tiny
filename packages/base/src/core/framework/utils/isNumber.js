
const numberReSnippet = '(?:NaN|-?(?:(?:\\d+|\\d*\\.\\d+)(?:[E|e][+|-]?\\d+)?|Infinity))';
const matchOnlyNumberRe = new RegExp(`^(${numberReSnippet})$`);

export default function isNumber(str) {
  return !!str.trim().match(matchOnlyNumberRe);
}
