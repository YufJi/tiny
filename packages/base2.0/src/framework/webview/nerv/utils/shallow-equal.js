/*
 * @Author: YufJ
 * @Date: 2021-07-12 20:53:01
 * @LastEditTime: 2021-07-12 20:53:56
 * @Description:
 * @FilePath: /yeact/src/utils/shallow-equal.js
 */
/* istanbul ignore next */
// tslint:disable-next-line
Object.is = Object.is || function (x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  }
  // eslint-disable-next-line no-self-compare
  return x !== x && y !== y;
};

export default function shallowEqual(x, y) {
  if (x === null || y === null) {
    return false;
  }
  if (Object.is(x, y)) {
    return true;
  }
  const xKeys = x ? Object.keys(x) : [];
  const yKeys = y ? Object.keys(y) : [];
  if (xKeys.length !== yKeys.length) {
    return false;
  }

  for (let i = 0; i < xKeys.length; i++) {
    const xKeyItem = xKeys[i];
    if (!y.hasOwnProperty(xKeyItem) || !Object.is(x[xKeyItem], y[xKeyItem])) {
      return false;
    }
  }

  return true;
}
