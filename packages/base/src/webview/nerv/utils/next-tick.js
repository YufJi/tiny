/*
 * @Author: YufJ
 * @Date: 2021-07-12 20:21:19
 * @LastEditTime: 2021-08-16 11:20:20
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/nerv/utils/next-tick.js
 */
import { global } from './env';
import { isFunction } from './is';

const canUsePromise = 'Promise' in global;

let resolved;
if (canUsePromise) {
  resolved = Promise.resolve();
}

const nextTick = (fn, ...args) => {
  fn = isFunction(fn) ? fn.bind(null, ...args) : fn;

  if (canUsePromise) {
    return resolved.then(fn);
  }

  const timerFunc = 'requestAnimationFrame' in global ? requestAnimationFrame : setTimeout;
  timerFunc(fn);
};

export default nextTick;
