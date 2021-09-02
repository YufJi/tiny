/**
 * 用来mock render、worker线程的jsc
 * 真实环境下由宿主注入
 * 作用类似preload
 */
const host = window.parent.window;
const { JSBridgeInstance, setTimeout, setInterval, clearTimeout, clearInterval } = host;

function query(key) {
  const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`, 'i');
  const r = window.location.search.substr(1).match(reg);

  if (r) {
    return decodeURIComponent(r[2]);
  } else {
    return null;
  }
}

window.WEBVIEWID = query('webviewId');

const timerMap = new Map();

window.JSCore = {
  call(event, paramsString, webviewIdsString, callbackId) {
    // 为了能模拟同步api
    const params = JSON.parse(paramsString);
    const webviewIds = JSON.parse(webviewIdsString);

    return JSBridgeInstance.call(event, params, webviewIds, callbackId);
  },
  publish(event, paramsString, webviewIdsString, __IS_WORKER__) {
    // 为了能模拟同步api
    const params = JSON.parse(paramsString);
    const webviewIds = JSON.parse(webviewIdsString);

    return JSBridgeInstance.publish(event, params, webviewIds, __IS_WORKER__);
  },
  setTimer(type, id, delay) {
    let timer;
    switch (type) {
      case 'Timeout':
        timer = setTimeout(() => {
          window.nativeInvokeTimer(type, id);
        }, delay);

        timerMap.set(id, timer);
        break;
      case 'Interval':
        timer = setInterval(() => {
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
        clearTimeout(timer);
        timerMap.delete(id);
        break;
      case 'Interval':
        clearInterval(timer);
        timerMap.delete(id);
        break;
      default:
        break;
    }
  },
};
