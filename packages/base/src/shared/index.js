export * from './guid';
export * from './global';
export * from './config';
export * from './events';
export * from './tryCatch';

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
