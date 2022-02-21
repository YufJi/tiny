/* eslint-disable no-new-func */
/**
 * 用来mock render、worker线程的jsc
 * 真实环境下由宿主注入
 * 作用类似electron中preload
 */
const host = window.parent.window;
const timerMap = new Map();

const WEBVIEWID = new URLSearchParams(window.location.search).get('webviewId');
window.WEBVIEWID = WEBVIEWID;

const JSCore = {
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
window.JSCore = JSCore;

/* 逻辑层执行上下文 */
const context = Object.create(null);

context.WEBVIEWID = WEBVIEWID;
context.JSCore = JSCore;
context.console = window.console;

context.global = context;
context.self = context;
/* disable api */
context.fetch = undefined;
context.window = undefined;
context.document = undefined;
context.location = undefined;
context.XMLHttpRequest = undefined;
context.navigator = undefined;
context.MutationObserver = undefined;

window.executeJavaScript = function (script) {
  /* 返回值为Promise */
  return new Promise((resolve, reject) => {
    try {
      let result;
      // eslint-disable-next-line no-with
      with (context) {
        // eslint-disable-next-line no-eval
        result = eval(script);
      }

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

let xhr;

window.importScriptsPolyfill = function (...urls) {
  if (!xhr) {
    xhr = new XMLHttpRequest();
  }
  urls.forEach((url) => {
    xhr.open('GET', url, false);
    xhr.send();

    const contentType = xhr.getResponseHeader('content-type');
    if (/(java|ecma)script/i.test(contentType)) {
      return window.executeJavaScript(xhr.responseText);
    } else if (/json/i.test(contentType)) {
      return JSON.parse(xhr.responseText);
    }
  });
};
