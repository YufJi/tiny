/**
 * 用来mock render、worker进程的jsbridge
 * 真实环境下由宿主提供
 */

let index = 0;
const callbackMap = {};

const host = window.parent.window;

window.JSBridge = {
  call(method, params, callback) {
    const idx = index++;
    if (typeof callback === 'function') {
      callbackMap[idx] = callback;
    }

    const options = {
      index: idx,
      webviewId: window.WEBVIEWID,
      ...(params || {}),
    };

    host.JSBridgeInstance.call(method, options);
  },
};

window.JSCore = {
  call(opts) {
    const {
      event,
      paramsString,
      callbackId,
      webviewIds,
    } = opts;

    return host.JSBridgeInstance.call(event, {
      paramsString,
      callbackId,
      webviewIds,
    });
  },
};

window.JSBridgeCallback = function (res) {
  const { index, data } = res;
  const callback = callbackMap[index];

  if (typeof callback === 'function') {
    callback(data);
  }
};

document.addEventListener('JSBridgeReady', (e) => {
  const { guid } = e.detail;
  window.WEBVIEWID = guid;
});
