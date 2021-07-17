/*
 * @Author: YufJ
 * @Date: 2021-07-12 20:21:19
 * @LastEditTime: 2021-07-12 20:24:07
 * @Description:
 * @FilePath: /yeact/src/utils/next-tick.js
 */
import { global, isMacSafari } from './env';
import { isFunction } from './is';

const canUsePromise = 'Promise' in global && !isMacSafari;

let resolved;
if (canUsePromise) {
  resolved = Promise.resolve();
}

const nextTick = (fn, ...args) => {
  fn = isFunction(fn) ? fn.bind(null, ...args) : fn;

  if (canUsePromise) {
    return resolved.then(fn);
  }

  const timerFunc = 'requestAnimationFrame' in global && !isMacSafari ? requestAnimationFrame : setTimeout;
  timerFunc(fn);
};

export default nextTick;
