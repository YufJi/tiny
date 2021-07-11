import { wrap } from 'lodash';
import { error } from './log';

export function wrapAppLifetime(method, fn) {
  return wrap(fn, (life, ...args) => {
    const result = wrapUserFunction(`at app.js App.${method}`, life).apply(this, args);

    return result;
  });
}

export function wrapPageLifetime(method, fn) {
  return wrap(fn, (life, ...args) => {
    const result = wrapUserFunction(`at ${_this.is}.js Page.${method}`, life).apply(this, args);

    return result;
  });
}

export function wrapComponnetLifetime(method, fn) {
  return wrap(fn, function (life, ...args) {
    const result = life.call(this, ...args);

    return result;
  });
}

export function wrapUserFunction(description, callback) {
  if (!callback) return noop;
  return callback;
}

export function wrapInnerFunction(desc, callback, context) {
  if (!isFunction(callback)) return noop;
  return wrap(callback, (fn, ...args) => {
    try {
      return fn.apply(context || fn, args);
    } catch (e) {
      const message = `${desc} \n${e.message}`;
      e.message = message;
      error(e);
    }
  });
}

export function wrapUserFunctions(description, callbacks) {
  return mapValues(callbacks, (fn, key) => {
    return wrapUserFunction(`${description}.${key}`, fn);
  });
}
