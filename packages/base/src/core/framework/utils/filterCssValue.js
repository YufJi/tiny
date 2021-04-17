
import { rpx } from './unit';
import isNumber from './isNumber';

function normalizeCssValueWeb(_value) {
  let value = _value;
  if (typeof value === 'string') {
    value = value.replace(/\b([.\d]+)rpx\b/gi, (_m, v) => {
      return `${rpx(parseFloat(v))}`;
    });
    if (isNumber(value)) {
      return parseFloat(value);
    }
  }
  return value;
}

export default function filterCssValue(name, style) {
  const ret = {};
  ret[name] = normalizeCssValueWeb(style[name]);

  return ret;
}
