import { isFunction, wrap, noop } from 'lodash';

export function tryCatch(method, callback, context) {
  return isFunction(callback)
    ? wrap(callback, (fn, ...args) => {
      try {
        return fn.apply(context || fn, args);
      } catch (error) {
        console.error(`[ERROR] at ${method}: \n${error.message}`);
      }
    })
    : noop;
}
