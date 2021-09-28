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
