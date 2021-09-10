import { g } from 'utils';

/**
 * worker环境下polyfill
 */
export default function timerPolyfill() {
  const timerMap = new Map();
  const { setTimer, clearTimer } = g.JSCore;

  g.JSCore.setTimer = () => {};
  g.JSCore.clearTimer = () => {};

  let timerCounter = 1;

  const createSet = (type) => {
    return function (callback, delay = 1) {
      const id = timerCounter;
      timerMap.set(id, callback);
      setTimer(type, id, Math.max(1, delay));
      timerCounter += 1;
      return id;
    };
  };

  const createClear = (type) => {
    return function (id) {
      if (timerMap.has(id)) {
        timerMap.delete(id);
        clearTimer(type, id);
      }
    };
  };

  /**
     * 注入到全局，端上用来回调前端
     * @param type TimerType
     * @param id 定时器回调id
     */
  g.nativeInvokeTimer = function (type, id) {
    const callback = timerMap.get(id);

    if (typeof callback === 'function') {
      callback();
    }

    if (type === 'Timeout') {
      timerMap.delete(id);
    }
  };

  g.setTimeout = createSet('Timeout');
  g.clearTimeout = createClear('Timeout');
  g.setInterval = createSet('Interval');
  g.clearInterval = createClear('Interval');
}
