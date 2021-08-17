/*
 * @Author: YufJ
 * @Date: 2021-07-12 11:19:59
 * @LastEditTime: 2021-08-16 11:18:44
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/nerv/utils/index.js
 */

import { isArray, isBoolean, isFunction, isNumber, isObject, isString, isUndefined, objectIs, isAttrAnEvent } from './is';
import nextTick from './next-tick';
import shallowEqual from './shallow-equal';
import { global, isBrowser, doc, UA, isMacSafari, noop } from './env';

export {
  isArray,
  isBoolean,
  isFunction,
  isNumber,
  isObject,
  isString,
  isUndefined,
  objectIs,
  isAttrAnEvent,

  nextTick,
  shallowEqual,

  global,
  isBrowser,
  doc,
  UA,
  isMacSafari,
  noop,
};

export function throwError(error) {
  let e;
  if (error instanceof Error) {
    e = error;
  } else {
    e = new Error(error);
  }

  throw e;
}

export function extend(source, from) {
  if (!from) {
    return source;
  }
  Object.assign(source, from);
  return source;
}

export function clone(obj) {
  return extend({}, obj);
}
