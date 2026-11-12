function isFunction(value) {
  return typeof value === 'function';
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPromise(value) {
  return isPlainObject(value) && isFunction(value.then) && isFunction(value.catch);
}

function isDef(value) {
  return value !== undefined && value !== null;
}

function isObj(value) {
  const type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
}

function isNumber(value) {
  return /^\d+(\.\d+)?$/.test(value);
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

const IMAGE_REGEXP = /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg)/i;
const VIDEO_REGEXP = /\.(mp4|mpg|mpeg|dat|asf|avi|rm|rmvb|mov|wmv|flv|mkv)/i;

function isImageUrl(url) {
  return IMAGE_REGEXP.test(url);
}

function isVideoUrl(url) {
  return VIDEO_REGEXP.test(url);
}

module.exports = {
  isFunction,
  isPlainObject,
  isPromise,
  isDef,
  isObj,
  isNumber,
  isBoolean,
  isImageUrl,
  isVideoUrl,
};
