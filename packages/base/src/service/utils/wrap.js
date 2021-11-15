import { wrap, mapValues, noop, isFunction } from 'lodash';
import { error, debug } from './log';

export function wrapAppLifetime(method, fn) {
  return wrap(fn, (life, ...args) => {
    debug(`at app.js App.${method}`);
    const result = (life || noop).apply(this, args);
    return result;
  });
}

export function wrapPageLifetime(method, fn) {
  return wrap(fn, (life, ...args) => {
    debug(`at ${this.is}.js Page.${method}`);
    const result = (life || noop).apply(this, args);
    return result;
  });
}

export function wrapComponnetLifetime(method, fn) {
  return wrap(fn, (life, ...args) => {
    debug(`at ${this.is}.js Component.${method}`);
    const result = (life || noop).apply(this, args);
    return result;
  });
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

export function wrapUserFunction(description, callback) {
  debug(description);
  if (!callback) return noop;
  return callback;
}
