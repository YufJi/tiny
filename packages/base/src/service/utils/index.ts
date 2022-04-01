import { wrap, mapValues, noop, isFunction } from 'lodash';

import { pathsParser } from './pathsParser';

export function debug(...args) {
  console.log('[framework]', ...args);
}

export function error(...args) {
  console.error('[framework]', ...args);
}

export function warn(...args) {
  console.warn('[framework]', ...args);
}

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

export function parseObservers(observers) {
  const parsedObservers = {};

  for (let i = 0; i < Object.entries(observers).length; i+=1) {
    const [key, value] = Object.entries(observers)[i];
    const rules = pathsParser.parse(key);

    rules.forEach((rule) => {
      const root = rule[0];

      if (!parsedObservers[root]) {
        parsedObservers[root] = [];
      }

      parsedObservers[root].push({
        args: rules,
        callback: value,
      });
    });
  }

  return parsedObservers;
}

export function getValueByPaths(o, paths) {
  let temp = o;

  for (let i = 0; i < paths.length; i+=1) {
    const key = paths[i];

    if (key === '**') {
      break;
    }

    temp = temp[key];
  }

  return temp;
}
