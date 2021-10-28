import { isFunction, wrap, noop, clone, forOwn, isObject, set, toPath } from 'lodash';

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

export function guid() {
  const s4 = function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };

  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
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

  for (let i = 0; i < pathParts.length; i+=1) {
    if (pathParts[i] === '..') {
      count+=1;
    } else {
      break;
    }
  }

  pathParts.splice(0, count);

  const relativeParts = relative.length > 0 ? relative.split('/') : [];

  relativeParts.splice(relativeParts.length - count, count);

  return relativeParts.concat(pathParts).join('/');
}

export function mergeData(a, b) {
  forOwn(b, (value, key) => {
    setValue(a, key, value);
  });

  return clone(a);
}

function setValue(obj, key, value) {
  const paths = castPath(key, obj);
  const len = paths.length;
  const lastIndex = len - 1;
  let index = -1;
  let temp = obj;

  while (temp && ++index < len) {
    const key = paths[index];
    let val = value;

    if (index !== lastIndex) {
      const tempVal = temp[key];
      val = isObject(tempVal) ? clone(tempVal) : isIndex(paths[index + 1]) ? [] : {};
    }

    temp[key] = val;
    temp = temp[key];
  }

  return obj;
}

function castPath(key, obj) {
  return /^\w*$/.test(key) || key in obj ? [key] : toPath(key);
}

function isIndex(value) {
  if (!/^(?:0|[1-9]\d*)$/.test(value)) return false;

  const num = Number(value);
  return typeof num === 'number' && Number.isSafeInteger(num) && num > -1;
}
