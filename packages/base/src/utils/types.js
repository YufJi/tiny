export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function noop() { /* no opration */ }

/**
 * 获取类型名字
 * @param x
 */
export function getType(x) {
  return Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
}
