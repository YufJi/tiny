/**
 * 用来mock render、worker线程的jsc
 * 真实环境下由宿主提供
 * 作用类似preload
 */
const host = window.parent.window;

function query(key) {
  var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);

  if (r){
    return decodeURIComponent(r[2]);
  } else {
    return null;
  }
}

window.WEBVIEWID = query('webviewId');

window.JSCore = {
  call(opts) {
    const {
      event,
      paramsString,
      callbackId,
      webviewIds,
    } = opts;

    // 为了能模拟同步api
    return host.JSBridgeInstance.call(event, {
      paramsString,
      callbackId,
      webviewIds,
    });
  },
};

