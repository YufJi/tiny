
import { supportedProperty, supportedValue } from 'css-vendor';

export function ruleName(v) {
  return supportedProperty(v);
}
export function ruleValue(n, v) {
  return supportedValue(n, v);
}
export function needNormalizeCssValue(property) {
  return property.indexOf('flex') !== -1 || property.indexOf('display') !== -1;
}
