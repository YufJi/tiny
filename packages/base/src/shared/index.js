export const g = (function () {
  let local;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else if (typeof window !== 'undefined') {
    local = window;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('global object is unavailable in this environment');
    }
  }
  return local;
})();

export function Deferred() {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}

export function noop() {
  /* noop */
}

export function getType(o) {
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
}
