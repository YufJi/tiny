/**
 * 用来mock render、worker线程的jsc
 * 真实环境下由宿主注入
 * 作用类似electron中preload
 */
const host = window.parent.window;
const timerMap = new Map();

window.WEBVIEWID = query('webviewId');

window.JSCore = {
  call(event, params, webviewIds, callbackId) {
    return host.JSBridgeInstance.call(event, params, webviewIds, callbackId);
  },
  publish(event, params, webviewIds, __IS_SERVICE__) {
    host.JSBridgeInstance.publish(event, params, webviewIds, __IS_SERVICE__);
  },
  setTimer(type, id, delay) {
    let timer;
    switch (type) {
      case 'Timeout':
        timer = host.setTimeout(() => {
          window.nativeInvokeTimer(type, id);
        }, delay);

        timerMap.set(id, timer);
        break;
      case 'Interval':
        timer = host.setInterval(() => {
          window.nativeInvokeTimer(type, id);
        }, delay);

        timerMap.set(id, timer);
        break;
      default:
        break;
    }
  },
  clearTimer(type, id) {
    const timer = timerMap.get(id);

    switch (type) {
      case 'Timeout':
        host.clearTimeout(timer);
        timerMap.delete(id);
        break;
      case 'Interval':
        host.clearInterval(timer);
        timerMap.delete(id);
        break;
      default:
        break;
    }
  },
};

window.executeJavaScript = function (code) {
  return new Promise((resolve, reject) => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(code);
      /* 返回值为Promise */
      if (result && typeof result.then === 'function') {
        result.then(resolve).catch(reject);
      } else {
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
};

function query(key) {
  const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`, 'i');
  const r = window.location.search.substr(1).match(reg);

  if (r) {
    return decodeURIComponent(r[2]);
  } else {
    return null;
  }
}
