const { isDef, isNumber, isPlainObject, isPromise } = require('./validator');
const {
  canIUseGroupSetData,
  canIUseNextTick,
  getSystemInfoSync,
} = require('./version');

function range(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

function nextTick(callback) {
  if (canIUseNextTick()) {
    wx.nextTick(callback);
    return;
  }
  setTimeout(callback, 1000 / 30);
}

function addUnit(value) {
  if (!isDef(value)) return undefined;
  const text = String(value);
  return isNumber(text) ? `${text}px` : text;
}

function requestAnimationFrame(callback) {
  return setTimeout(callback, 1000 / 30);
}

function pickExclude(object, keys) {
  if (!isPlainObject(object)) return {};

  return Object.keys(object).reduce((result, key) => {
    if (!keys.includes(key)) result[key] = object[key];
    return result;
  }, {});
}

function getRect(context, selector) {
  return new Promise((resolve) => {
    wx.createSelectorQuery()
      .in(context)
      .select(selector)
      .boundingClientRect()
      .exec((rect = []) => resolve(rect[0]));
  });
}

function getAllRect(context, selector) {
  return new Promise((resolve) => {
    wx.createSelectorQuery()
      .in(context)
      .selectAll(selector)
      .boundingClientRect()
      .exec((rect = []) => resolve(rect[0]));
  });
}

function groupSetData(context, callback) {
  if (canIUseGroupSetData()) context.groupSetData(callback);
  else callback();
}

function toPromise(promiseLike) {
  return isPromise(promiseLike) ? promiseLike : Promise.resolve(promiseLike);
}

function addNumber(num1, num2) {
  const cardinal = 10 ** 10;
  return Math.round((num1 + num2) * cardinal) / cardinal;
}

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

function getCurrentPage() {
  const pages = getCurrentPages();
  return pages[pages.length - 1];
}

const isPC = ['mac', 'windows'].includes(getSystemInfoSync().platform);
const isWxWork = getSystemInfoSync().environment === 'wxwork';

module.exports = {
  isDef,
  getSystemInfoSync,
  range,
  nextTick,
  addUnit,
  requestAnimationFrame,
  pickExclude,
  getRect,
  getAllRect,
  groupSetData,
  toPromise,
  addNumber,
  clamp,
  getCurrentPage,
  isPC,
  isWxWork,
};
