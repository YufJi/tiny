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
export function noop() { /* no operation */ }

const fakeDoc = {
  createElement: noop,
  createElementNS: noop,
  createTextNode: noop,
};

export const doc = isBrowser ? document : fakeDoc;

export const UA = isBrowser && window.navigator.userAgent.toLowerCase();

export const isMacSafari = isBrowser && UA && window.navigator.platform
  && /mac/i.test(window.navigator.platform) && /^((?!chrome|android).)*safari/i.test(UA);
