import objectKeys from '@/utils/objectKeys';
import camelCase from './camelCase';
import filterCssValue from './filterCssValue';
import { ruleName, needNormalizeCssValue, ruleValue } from './ruleTransform';

export default function transformStyle(style) {
  const d = {};
  objectKeys(style).forEach((name) => {
    const expanded = filterCssValue(name, style);
    if (expanded === false) {
      return;
    }
    objectKeys(expanded).forEach((key) => {
      const v = expanded[key];
      const property = ruleName(camelCase(key));
      // color #xxx -> rgb()
      if (property) {
        d[property] = needNormalizeCssValue(property) ? ruleValue(property, v) : v;
      }
    });
  });
  return d;
}
