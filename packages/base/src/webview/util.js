import { isFunction, wrap, noop } from 'lodash';

export function tryCatch(method, callback, context) {
  return isFunction(callback)
    ? wrap(callback, (fn, ...args) => {
      try {
        return fn.apply(context || fn, args);
      } catch (error) {
        console.error(`[WEBVIEW_ERROR] at ${method}: \n${error.message}`);
      }
    })
    : noop;
}

export function getRealRoute(relative = '', path = '') {
  if (path.indexOf('/') === 0) {
    return path.substr(1);
  }

  if (path.indexOf('./') === 0) {
    return getRealRoute(relative, path.substr(2));
  }

  let count = 0;
  const pathParts = path.split('/');

  for (let i = 0; i < pathParts.length; i++) {
    if (pathParts[i] === '..') {
      count++;
    } else {
      break;
    }
  }

  pathParts.splice(0, count);

  const relativeParts = relative.length > 0 ? relative.split('/') : [];

  relativeParts.splice(relativeParts.length - count - 1, count + 1);

  return relativeParts.concat(pathParts).join('/');
}
