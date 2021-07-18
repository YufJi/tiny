/*
 * @Author: YufJ
 * @Date: 2021-07-19 01:34:25
 * @LastEditTime: 2021-07-19 01:37:24
 * @Description: 
 * @FilePath: /react-demo1/src/renderer/util.js
 */

export function isNil(o) {
  return o === undefined || o === null;
}


export function isString(arg) {
  return typeof arg === 'string';
}

export function isFunction(arg) {
  return typeof arg === 'function';
}

export function isUndefined(arg) {
  return typeof arg === 'undefined';
}

export const { isArray } = Array;

export function isNumber(arg) {
  return typeof arg === 'number';
}

export function isObject(arg) {
  return arg === Object(arg) && !isFunction(arg);
}

export function isBoolean(arg) {
  return typeof arg === 'boolean';
}

export function objectIs(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  }
  // eslint-disable-next-line no-self-compare
  return x !== x && y !== y;
}

export function isAttrAnEvent(attr) {
  if (attr[0] === 'o' && attr[1] === 'n') {
    return true;
  }

  if (/^(bind|catch|capture-bind|capture-catch)([A-Za-z_]+)/.test(attr)) {
    return true;
  }

  return false;
}
