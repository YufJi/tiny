/*
 * @Author: YufJ
 * @Date: 2021-07-12 20:23:06
 * @LastEditTime: 2021-08-16 11:18:27
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/nerv/utils/env.js
 */
// tslint:disable-next-line
export const global = (function () {
  let local;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof window !== 'undefined') {
    local = window;
  } else {
    try {
      // tslint:disable-next-line:function-constructor
      local = Function('return this')();
    } catch (e) {
      throw new Error('global object is unavailable in this environment');
    }
  }
  return local;
})();

export const isBrowser = typeof window !== 'undefined';

// tslint:disable-next-line:no-empty
export function noop() {}

const fakeDoc = {
  createElement: noop,
  createElementNS: noop,
  createTextNode: noop,
};

export const doc = isBrowser ? document : fakeDoc;

export const UA = isBrowser && window.navigator.userAgent.toLowerCase();

export const isMacSafari = isBrowser && UA && window.navigator.platform
  && /mac/i.test(window.navigator.platform) && /^((?!chrome|android).)*safari/i.test(UA);
