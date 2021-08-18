/**
 * 用来mock render、worker线程的jsc
 * 真实环境下由宿主注入
 * 作用类似preload
 */
const host = window.parent.window;
const { JSBridgeInstance, setTimeout, setInterval, clearTimeout, clearInterval } = host;

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

const timerMap = new Map();

window.JSCore = {
  call(opts) {
    const {
      event,
      ...params
    } = opts;

    // 为了能模拟同步api
    return JSBridgeInstance.call(event, params);
  },
  setTimer(type, id, delay) {
    let timer;
    switch (type) {
      case 'Timeout':
        timer = setTimeout(() => {
          window.nativeInvokeTimer(type, id)
        }, delay)
        
        timerMap.set(id, timer);
        break;
      case 'Interval':
        timer = setInterval(() => {
          window.nativeInvokeTimer(type, id)
        }, delay)
        
        timerMap.set(id, timer);
        break;
      default:
        break;
    }
  },
  clearTimer(type, id) {
    let timer = timerMap.get(id)

    switch (type) {
      case 'Timeout':
        clearTimeout(timer)
        timerMap.delete(id)
        break;
      case 'Interval':
        clearInterval(timer)
        timerMap.delete(id)
        break;
      default:
        break;
    }
  }
};

