

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
      viewId: window.APVIEWID,
      ...(params || {}),
    }

    host.JSBridgeInstance.call(method, options)
  },
  callSync(method, params) {
    return host.JSBridgeInstance.callSync(method, params)
  }
}

window.JSBridgeCallback = function(res) {
  const { index, data } = res;
  const callback = callbackMap[index]
  
  if (typeof callback === 'function') {
    callback(data)
  }
}

window.document.addEventListener('JSBridgeReady', function(e) {
  const { guid } = e.detail;
  window.APVIEWID = guid;
})
