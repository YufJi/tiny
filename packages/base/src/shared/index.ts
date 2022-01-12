import { isFunction, wrap, noop } from 'lodash';

export * from './global';
export * from './events';

export enum TemplateTag {
  LowerCasePrefix = 'tiny',
  UpperCasePerfix = 'TINY'
}

export function Deferred() {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}

/* 获取类型 */
export function getType(o) {
  return Object.prototype.toString.call(o).slice(8, -1);
}

/* 生成随机id */
export function guid() {
  const s4 = function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };

  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

export function tryCatch(method: string, callback: any, context: any) {
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

export {
  noop,
};
