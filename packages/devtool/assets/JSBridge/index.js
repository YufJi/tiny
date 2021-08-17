/**
 * 用来mock render、worker进程的jsbridge
 * 真实环境下由宿主提供
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

    return host.JSBridgeInstance.call(event, {
      paramsString,
      callbackId,
      webviewIds,
    });
  },
};

