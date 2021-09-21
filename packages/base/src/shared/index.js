import { clone, forOwn, isObject, toPath, set } from 'lodash';

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

export function mergeData(a, b) {
  forOwn(b, (value, key) => {
    setValue(a, key, value);
  });

  return clone(a);
}

export function setValue(obj, key, value) {
  for (
    let r = castPath(key, obj), i = r.length, o = i - 1, a = -1, s = obj;
    s != null && ++a < i;
  ) {
    const l = r[a];
    let c = value;
    if (a !== o) {
      const u = s[l];
      c = isObject(u) ? clone(u) : isIndex(r[a + 1]) ? [] : {};
    }

    s[l] = c;
    s = s[l];
  }

  return obj;
}

export function castPath(key, obj) {
  return /^\w*$/.test(key) || key in obj ? [key] : toPath(key);
}

export function isIndex(e) {
  if (!/^(?:0|[1-9]\d*)$/.test(e)) return false;

  const t = Number(e);
  return typeof t === 'number' && Number.isSafeInteger(t) && t > -1;
}
